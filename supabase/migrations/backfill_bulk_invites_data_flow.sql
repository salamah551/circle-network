-- ============================================================================
-- Bulk Invites Data Flow Fix - Backfill Script
-- ============================================================================
-- This script reconciles existing data after the bulk invites data flow fixes
-- Run this on existing environments that have bulk_invites data
-- ============================================================================

-- 1. Update campaign total_recipients counts based on actual bulk_invites rows
UPDATE bulk_invite_campaigns c
SET total_recipients = (
  SELECT COUNT(*)
  FROM bulk_invites bi
  WHERE bi.campaign_id = c.id
)
WHERE EXISTS (
  SELECT 1 FROM bulk_invites WHERE campaign_id = c.id
);

-- 2. Initialize next_email_scheduled for queued recipients that don't have it set
-- This allows them to be picked up by the sender
UPDATE bulk_invites
SET next_email_scheduled = COALESCE(next_email_scheduled, NOW())
WHERE status = 'queued'
  AND next_email_scheduled IS NULL;

-- 3. Sync total_sent from sent_count for campaigns where total_sent is not set
UPDATE bulk_invite_campaigns
SET total_sent = COALESCE(sent_count, 0)
WHERE total_sent IS NULL OR total_sent = 0;

-- 4. Update total_sent to match actual sent count from bulk_invites
UPDATE bulk_invite_campaigns c
SET total_sent = (
  SELECT COUNT(*)
  FROM bulk_invites bi
  WHERE bi.campaign_id = c.id
    AND bi.status IN ('sent', 'opened', 'clicked', 'converted')
)
WHERE EXISTS (
  SELECT 1 
  FROM bulk_invites 
  WHERE campaign_id = c.id 
    AND status IN ('sent', 'opened', 'clicked', 'converted')
);

-- 5. Update campaign stats: total_opened
UPDATE bulk_invite_campaigns c
SET total_opened = (
  SELECT COUNT(*)
  FROM bulk_invites bi
  WHERE bi.campaign_id = c.id
    AND bi.opened_at IS NOT NULL
)
WHERE EXISTS (
  SELECT 1 
  FROM bulk_invites 
  WHERE campaign_id = c.id 
    AND opened_at IS NOT NULL
);

-- 6. Update campaign stats: total_clicked
UPDATE bulk_invite_campaigns c
SET total_clicked = (
  SELECT COUNT(*)
  FROM bulk_invites bi
  WHERE bi.campaign_id = c.id
    AND bi.clicked_at IS NOT NULL
)
WHERE EXISTS (
  SELECT 1 
  FROM bulk_invites 
  WHERE campaign_id = c.id 
    AND clicked_at IS NOT NULL
);

-- 7. Update campaign stats: total_converted
UPDATE bulk_invite_campaigns c
SET total_converted = (
  SELECT COUNT(*)
  FROM bulk_invites bi
  WHERE bi.campaign_id = c.id
    AND bi.converted_at IS NOT NULL
)
WHERE EXISTS (
  SELECT 1 
  FROM bulk_invites 
  WHERE campaign_id = c.id 
    AND converted_at IS NOT NULL
);

-- ============================================================================
-- Verification Queries
-- ============================================================================
-- Run these to verify the backfill was successful

-- Check campaign totals match actual counts
SELECT 
  c.id,
  c.name,
  c.status,
  c.total_recipients,
  c.total_sent,
  c.total_opened,
  c.total_clicked,
  c.total_converted,
  (SELECT COUNT(*) FROM bulk_invites WHERE campaign_id = c.id) as actual_recipients,
  (SELECT COUNT(*) FROM bulk_invites WHERE campaign_id = c.id AND status IN ('sent', 'opened', 'clicked', 'converted')) as actual_sent
FROM bulk_invite_campaigns c
ORDER BY c.created_at DESC;

-- Check for recipients without next_email_scheduled
SELECT 
  campaign_id,
  COUNT(*) as count_without_schedule
FROM bulk_invites
WHERE status = 'queued'
  AND next_email_scheduled IS NULL
GROUP BY campaign_id;

-- Summary report
SELECT 
  'Total Campaigns' as metric,
  COUNT(*) as count
FROM bulk_invite_campaigns
UNION ALL
SELECT 
  'Total Recipients' as metric,
  COUNT(*) as count
FROM bulk_invites
UNION ALL
SELECT 
  'Queued and Scheduled' as metric,
  COUNT(*) as count
FROM bulk_invites
WHERE status = 'queued'
  AND next_email_scheduled IS NOT NULL;
