-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- 'founding_invite', 'reminder_day3', 'final_day11', 'post_founding'
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb, -- ['first_name', 'invitation_code', etc.]
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Sequences Table (tracks scheduled emails)
CREATE TABLE IF NOT EXISTS email_sequences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE,
  email_template_id UUID REFERENCES email_templates(id),
  recipient_email TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL, -- When to send this email
  sent_at TIMESTAMPTZ, -- NULL if not sent yet
  opened_at TIMESTAMPTZ, -- Track if they opened it
  clicked_at TIMESTAMPTZ, -- Track if they clicked the link
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'sent', 'failed', 'skipped'
  error_message TEXT, -- If sending failed
  metadata JSONB DEFAULT '{}'::jsonb, -- Store personalized data (name, code, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_sequences_scheduled ON email_sequences(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_email_sequences_invitation ON email_sequences(invitation_id);
CREATE INDEX IF NOT EXISTS idx_email_sequences_status ON email_sequences(status);

-- Insert default email templates
INSERT INTO email_templates (name, subject, body, variables) VALUES
(
  'founding_invite',
  'You''ve been selected for Circle Network',
  'Hi {{first_name}},

You''ve been personally selected to join Circle Network—an invitation-only community of 250 accomplished professionals.

Your invitation code: {{invitation_code}}

Apply now: {{apply_url}}

This code expires in 14 days.

Best,
Shehab Salamah
Founder, Circle Network',
  '["first_name", "invitation_code", "apply_url"]'::jsonb
),
(
  'reminder_day3',
  '{{first_name}}, your founding member invitation expires in 11 days',
  'Hi {{first_name}},

I sent you an invitation to Circle Network a few days ago.

Your invitation code expires in 11 days: {{invitation_code}}

Apply: {{apply_url}}

Best,
Shehab Salamah
Founder, Circle Network',
  '["first_name", "invitation_code", "apply_url"]'::jsonb
),
(
  'final_day11',
  'Final reminder: Your Circle Network invitation expires in 3 days',
  'Hi {{first_name}},

This is the last time I''ll reach out.

Your invitation expires in 3 days.

Code: {{invitation_code}}
Apply: {{apply_url}}

Shehab Salamah
Founder, Circle Network',
  '["first_name", "invitation_code", "apply_url"]'::jsonb
)
ON CONFLICT (name) DO NOTHING;

-- Function to schedule follow-up emails when an invitation is created
CREATE OR REPLACE FUNCTION schedule_invitation_emails()
RETURNS TRIGGER AS $$
BEGIN
  -- Schedule Day 3 reminder (if not responded)
  INSERT INTO email_sequences (invitation_id, email_template_id, recipient_email, scheduled_for, metadata)
  SELECT 
    NEW.id,
    (SELECT id FROM email_templates WHERE name = 'reminder_day3'),
    NEW.email,
    NOW() + INTERVAL '3 days',
    jsonb_build_object(
      'first_name', COALESCE(NEW.first_name, 'there'),
      'invitation_code', NEW.code,
      'apply_url', 'https://thecirclenetwork.org/apply?code=' || NEW.code
    );

  -- Schedule Day 11 final reminder (if not responded)
  INSERT INTO email_sequences (invitation_id, email_template_id, recipient_email, scheduled_for, metadata)
  SELECT 
    NEW.id,
    (SELECT id FROM email_templates WHERE name = 'final_day11'),
    NEW.email,
    NOW() + INTERVAL '11 days',
    jsonb_build_object(
      'first_name', COALESCE(NEW.first_name, 'there'),
      'invitation_code', NEW.code,
      'apply_url', 'https://thecirclenetwork.org/apply?code=' || NEW.code
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-schedule emails when invitation is created
DROP TRIGGER IF EXISTS trigger_schedule_invitation_emails ON invitations;
CREATE TRIGGER trigger_schedule_invitation_emails
  AFTER INSERT ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION schedule_invitation_emails();

-- Function to skip scheduled emails if invitation was used
CREATE OR REPLACE FUNCTION skip_emails_on_invitation_use()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.used = true AND OLD.used = false THEN
    -- Mark all pending emails as 'skipped' since they accepted the invite
    UPDATE email_sequences
    SET status = 'skipped'
    WHERE invitation_id = NEW.id
    AND status = 'scheduled';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Skip follow-up emails if they accept the invite
DROP TRIGGER IF EXISTS trigger_skip_emails_on_use ON invitations;
CREATE TRIGGER trigger_skip_emails_on_use
  AFTER UPDATE ON invitations
  FOR EACH ROW
  WHEN (NEW.used = true)
  EXECUTE FUNCTION skip_emails_on_invitation_use();

COMMENT ON TABLE email_templates IS 'Stores reusable email templates with variable substitution';
COMMENT ON TABLE email_sequences IS 'Tracks scheduled and sent emails for each invitation';
COMMENT ON FUNCTION schedule_invitation_emails IS 'Auto-schedules follow-up emails when invitation is created';
COMMENT ON FUNCTION skip_emails_on_invitation_use IS 'Cancels pending emails when invitation is accepted';