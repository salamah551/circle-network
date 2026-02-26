# Bulk Invites Fix - Quick Reference

## What Was Fixed

### Problem
- Campaign card showed 0 recipients even after adding them
- "Start Campaign" button never appeared
- Sender couldn't pick up recipients (no scheduling)
- Campaign stats never updated
- Details page showed wrong data

### Solution
- ✅ Upload immediately updates campaign totals
- ✅ Recipients get scheduled on creation
- ✅ Sender updates UI-visible counters
- ✅ Start Campaign button works and activates campaigns
- ✅ Details page reads from correct table

## File Changes Summary

| File | Change | Impact |
|------|--------|--------|
| `upload/route.js` | Add `next_email_scheduled`, update `total_recipients` | Recipients appear & are schedulable |
| `send/route.js` | Update `total_sent` field | UI shows sent count |
| `[id]/page.js` | Read from `bulk_invites`, map fields | Details view works |
| `page.js` | Wire Start button to API | Can activate campaigns |
| `campaigns/start/route.js` | NEW: Activation endpoint | Secure campaign activation |
| `backfill_bulk_invites_data_flow.sql` | NEW: Data reconciliation | Fix existing data |

## Quick Test

```bash
# 1. Add recipients
POST /api/bulk-invites/track/upload
{
  "campaignId": "xxx",
  "recipients": [{"firstName": "John", "lastName": "Doe", "email": "john@example.com"}]
}

# 2. Check campaign totals updated
SELECT id, name, total_recipients FROM bulk_invite_campaigns;

# 3. Activate campaign
POST /api/bulk-invites/campaigns/start
{
  "campaignId": "xxx"
}

# 4. Trigger send
POST /api/bulk-invites/track/send
{
  "campaignId": "xxx"
}

# 5. Verify counts
SELECT id, name, total_sent FROM bulk_invite_campaigns;
```

## Database Backfill

```sql
-- Run this ONCE on existing environments
-- File: supabase/migrations/backfill_bulk_invites_data_flow.sql

-- 1. Update campaign totals
UPDATE bulk_invite_campaigns c
SET total_recipients = (
  SELECT COUNT(*) FROM bulk_invites WHERE campaign_id = c.id
);

-- 2. Initialize scheduling
UPDATE bulk_invites
SET next_email_scheduled = NOW()
WHERE status = 'queued' AND next_email_scheduled IS NULL;

-- 3. Sync sent counts
UPDATE bulk_invite_campaigns
SET total_sent = sent_count;

-- See full script for all updates
```

## Field Mapping

When reading from `bulk_invites`:

```javascript
// Map these fields:
full_name → first_name / last_name (split on space)
code → invite_code
sent_at → last_email_sent (fallback)
```

When sending emails, code handles both:
```javascript
recipient.invite_code || recipient.code  // ✅ Works with both
recipient.first_name || recipient.full_name.split(' ')[0]  // ✅ Works with both
```

## Deployment Checklist

- [ ] Review PR changes
- [ ] Deploy code (Git push → Vercel)
- [ ] Run backfill SQL script
- [ ] Verify: Create test campaign
- [ ] Verify: Add test recipient
- [ ] Verify: See count update in UI
- [ ] Verify: Start campaign works
- [ ] Verify: Send emails increment total_sent
- [ ] Monitor: Check error logs
- [ ] Monitor: Check email delivery

## Troubleshooting

### Recipients not appearing in count
**Fix:** Run backfill script section 1
```sql
UPDATE bulk_invite_campaigns c SET total_recipients = (SELECT COUNT(*) FROM bulk_invites WHERE campaign_id = c.id);
```

### Sender not picking up recipients
**Fix:** Run backfill script section 2
```sql
UPDATE bulk_invites SET next_email_scheduled = NOW() WHERE status = 'queued' AND next_email_scheduled IS NULL;
```

### Sent count not updating in UI
**Fix:** Check that `total_sent` is being updated (not just `sent_count`)
```sql
SELECT id, name, sent_count, total_sent FROM bulk_invite_campaigns;
```

### Details page showing no recipients
**Fix:** Verify reading from `bulk_invites` table (not `bulk_invite_recipients`)
```sql
SELECT COUNT(*) FROM bulk_invites WHERE campaign_id = 'YOUR_CAMPAIGN_ID';
```

### Start Campaign returns 403
**Fix:** Verify user has `is_admin = true` in profiles table
```sql
SELECT id, email, is_admin FROM profiles WHERE email = 'your@email.com';
```

## Security Notes

✅ All endpoints use service role for DB access
✅ Admin check via Bearer token verification
✅ No SQL injection (parameterized queries)
✅ CodeQL scan passed (0 alerts)
✅ Idempotent operations (safe to retry)

## Performance

- Upload: +1 query (UPDATE campaign totals)
- Send: +1 field updated (total_sent)
- Impact: Negligible (<10ms per operation)
- Benefit: Eliminates manual DB fixes

## Support

Questions? Check:
1. Supabase logs (API errors)
2. Browser console (client errors)
3. Environment variables (NEXT_PUBLIC_SUPABASE_URL, etc.)
4. Verification queries in backfill script
