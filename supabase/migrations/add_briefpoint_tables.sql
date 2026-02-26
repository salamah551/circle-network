-- BriefPoint meetings table
CREATE TABLE IF NOT EXISTS briefpoint_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  meeting_time TIMESTAMPTZ NOT NULL,
  participants JSONB DEFAULT '[]', -- [{name, email, title, company}]
  location TEXT,
  description TEXT,
  source TEXT DEFAULT 'manual', -- 'manual' (Ghost Mode) or 'google_calendar'
  calendar_event_id TEXT, -- Google Calendar event ID for dedup
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  brief_md TEXT, -- The generated brief in markdown
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days') -- 30-day auto purge
);

-- Index for efficient queries
CREATE INDEX idx_briefpoint_user_status ON briefpoint_meetings(user_id, status);
CREATE INDEX idx_briefpoint_meeting_time ON briefpoint_meetings(meeting_time);
CREATE INDEX idx_briefpoint_expires ON briefpoint_meetings(expires_at);

-- Unique constraint to prevent duplicate calendar events
CREATE UNIQUE INDEX idx_briefpoint_calendar_event ON briefpoint_meetings(user_id, calendar_event_id) WHERE calendar_event_id IS NOT NULL;

-- Google Calendar connections
CREATE TABLE IF NOT EXISTS briefpoint_calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider TEXT DEFAULT 'google',
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  calendar_id TEXT DEFAULT 'primary',
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE briefpoint_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefpoint_calendar_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meetings" ON briefpoint_meetings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meetings" ON briefpoint_meetings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meetings" ON briefpoint_meetings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meetings" ON briefpoint_meetings FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own calendar connections" ON briefpoint_calendar_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own calendar connections" ON briefpoint_calendar_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own calendar connections" ON briefpoint_calendar_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own calendar connections" ON briefpoint_calendar_connections FOR DELETE USING (auth.uid() = user_id);
