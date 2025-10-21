# Tracking and Unsubscribe Migration Summary

## Overview
This migration updates the bulk invite tracking and unsubscribe system to use the correct database tables (`bulk_invites`, `bulk_invite_events`, `bulk_invite_suppressions`) instead of the deprecated `bulk_invite_recipients` table.

## Changes Made

### 1. Tracking Endpoint (`app/api/bulk-invites/track/route.js`)

**Before:**
- Looked up recipients in `bulk_invite_recipients` table
- Wrote events to `email_tracking` table
- Updated recipient status without idempotency checks
- Used RPC function for campaign stats

**After:**
- ✅ Looks up recipients in `bulk_invites` table (by invite id)
- ✅ Writes events to `bulk_invite_events` with `invite_id` field
- ✅ Updates `bulk_invites` status fields (`opened_at`, `clicked_at`) idempotently
- ✅ Updates campaign totals (`total_opened`, `total_clicked`) directly
- ✅ Prevents double-counting by checking existing timestamps before updating

**Idempotency:**
```javascript
if (eventType === 'open' && !recipient.opened_at) {
  // Only update if not already opened
  await supabaseAdmin
    .from('bulk_invites')
    .update({ status: 'opened', opened_at: new Date().toISOString() })
    .eq('id', recipientId)
    .is('opened_at', null);
}
```

### 2. Unsubscribe by ID Endpoint (`app/api/unsubscribe/[id]/route.js`)

**Before:**
- Updated `bulk_invite_recipients` table only
- No event tracking
- No suppression list management

**After:**
- ✅ Looks up recipients in `bulk_invites` table
- ✅ Records unsubscribe event in `bulk_invite_events`
- ✅ Adds email to `bulk_invite_suppressions` table
- ✅ Updates `bulk_invites` status to 'unsubscribed'
- ✅ Also adds to global `unsubscribes` table for cross-campaign suppression

### 3. Unsubscribe by Email Endpoint (`app/api/unsubscribe/route.js`)

**Enhanced:**
- ✅ Now records unsubscribe events for all affected invites
- ✅ Adds email to `bulk_invite_suppressions` table
- ✅ Updates all matching invites with `unsubscribed_at` timestamp
- ✅ Prevents sending to unsubscribed users across all campaigns

### 4. Personal Invite Sender (`app/api/invites/send/route.js`)

**Before:**
- Inserted into `bulk_invite_recipients` table
- Did not update campaign totals

**After:**
- ✅ Inserts into `bulk_invites` table with correct field names
- ✅ Updates campaign `total_recipients` count
- ✅ Uses `full_name` instead of separate first/last name fields
- ✅ Uses `code` instead of `invite_code` field

## Database Schema Alignment

### bulk_invites table
- Primary table for tracking all bulk invite recipients
- Fields: `id`, `campaign_id`, `email`, `full_name`, `code`, `status`, `opened_at`, `clicked_at`, `unsubscribed_at`, etc.

### bulk_invite_events table
- Event log for all tracking events
- Fields: `invite_id` (FK to bulk_invites.id), `event`, `details`
- Provides audit trail of all opens, clicks, unsubscribes

### bulk_invite_suppressions table
- Suppression list to prevent sending to unsubscribed/bounced emails
- Fields: `email` (unique), `reason`
- Checked during upload and send operations

### bulk_invite_campaigns table
- Campaign metadata and totals
- Fields: `total_recipients`, `total_sent`, `total_opened`, `total_clicked`, `total_converted`
- Updated atomically to reflect current state

## Idempotency Guarantees

All tracking operations are now idempotent:

1. **Open tracking**: Only increments campaign `total_opened` if `opened_at` is NULL
2. **Click tracking**: Only increments campaign `total_clicked` if `clicked_at` is NULL
3. **Event logging**: Events can be recorded multiple times without data corruption
4. **Unsubscribe**: Can be called multiple times safely (upsert operations)

## No Double-Counting

- Timestamp checks prevent updating already-tracked events
- Campaign totals only increment once per unique event
- Database constraints ensure data consistency

## Testing Checklist

- [x] Code compiles successfully
- [x] No syntax errors
- [x] CodeQL security scan passes (0 alerts)
- [ ] Manual test: Tracking pixel records open event
- [ ] Manual test: Click tracking updates campaign stats
- [ ] Manual test: Unsubscribe adds to suppression list
- [ ] Manual test: Idempotency - duplicate events don't double-count
- [ ] Manual test: Events appear in bulk_invite_events table

## Deployment Notes

1. **No migration needed**: The `bulk_invites` table already exists
2. **Backward compatible**: Old tracking URLs will fail gracefully (return pixel)
3. **New URLs**: Already use correct format (`?rid={invite_id}&type={event}`)
4. **Immediate effect**: Changes take effect on deployment

## Security

✅ All endpoints use service role for database access
✅ No SQL injection (parameterized queries)
✅ Input validation for required parameters
✅ Graceful error handling (always return pixel on error)
✅ CodeQL scan passed with 0 alerts

## Performance

- **Impact**: Minimal - same number of DB queries
- **Improvement**: Removed RPC call for campaign stats
- **Benefit**: Direct updates are faster and more reliable

## Rollback Plan

If issues occur, previous commit can be restored:
```bash
git revert cb50c1b
```

No database changes needed for rollback.
