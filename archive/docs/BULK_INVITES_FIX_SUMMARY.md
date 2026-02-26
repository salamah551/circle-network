# Bulk Invites Data Flow Fix - Implementation Summary

## Overview

This fix addresses end-to-end issues in the bulk invites feature to ensure:
- Campaign totals update immediately when recipients are added
- Recipients are schedulable by the sender (via `next_email_scheduled`)
- Admin UI reflects correct counts and can start/activate campaigns
- Campaign details view reads from the correct table
- Sender increments the correct campaign counters used by the UI

## Problem Statement

Before these fixes, the bulk invites system had several critical issues:

1. **Upload Route**: After inserting recipients, `bulk_invite_campaigns.total_recipients` remained 0
2. **Send Route**: Updated `sent_count` instead of `total_sent` (which the UI reads)
3. **Details Page**: Read from `bulk_invite_recipients` table (deprecated) instead of `bulk_invites`
4. **Admin Page**: "Start Campaign" button couldn't activate campaigns properly
5. **Missing API**: No endpoint to activate campaigns with admin authentication

These bugs prevented the "Start Campaign" button from appearing and stopped the sender flows from picking up recipients.

## Changes Made

### 1. Upload Route (`app/api/bulk-invites/track/upload/route.js`)

**Changes:**
- Initialize `next_email_scheduled = NOW()` for newly inserted rows
- Update `bulk_invite_campaigns.total_recipients` immediately after insertion
- Maintains existing dedupe/suppression logic

**Code Added:**
```javascript
// In rows mapping:
next_email_scheduled: new Date().toISOString() // Initialize scheduling so sender can pick up

// After insert:
const { data: campaign, error: campaignErr } = await supabaseAdmin
  .from('bulk_invite_campaigns')
  .select('total_recipients')
  .eq('id', campaignId)
  .single();

if (!campaignErr && campaign) {
  await supabaseAdmin
    .from('bulk_invite_campaigns')
    .update({ 
      total_recipients: (campaign.total_recipients || 0) + rows.length 
    })
    .eq('id', campaignId);
}
```

### 2. Send Route (`app/api/bulk-invites/track/send/route.js`)

**Changes:**
- Update both `sent_count` AND `total_sent` (UI reads `total_sent`)
- Handle both old and new field name conventions for backward compatibility

**Code Changes:**
```javascript
// Campaign stats update:
await supabaseAdmin
  .from('bulk_invite_campaigns')
  .update({
    sent_count: (campaign.sent_count || 0) + sentCount,
    total_sent: (campaign.total_sent || 0) + sentCount,  // Added this line
    last_send_date: today,
    last_sent_at: new Date().toISOString()
  })
  .eq('id', campaignId);

// Email template function - handle both field name conventions:
const inviteCode = recipient.invite_code || recipient.code || 'CN-XXXX-XXXX';
const firstName = recipient.first_name || recipient.full_name?.split(' ')[0] || 'there';
```

### 3. Campaign Details Page (`app/admin/bulk-invites/[id]/page.js`)

**Changes:**
- Read recipients from `bulk_invites` table instead of `bulk_invite_recipients`
- Map field names to expected UI format

**Code Changes:**
```javascript
const loadRecipients = async () => {
  try {
    const { data, error } = await supabase
      .from('bulk_invites')  // Changed from 'bulk_invite_recipients'
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Map bulk_invites fields to expected UI fields
    const mappedRecipients = (data || []).map(r => ({
      ...r,
      first_name: r.full_name?.split(' ')[0] || '',
      last_name: r.full_name?.split(' ').slice(1).join(' ') || '',
      invite_code: r.code,
      last_email_sent: r.last_email_sent || r.sent_at,
      sequence_stage: r.sequence_stage || 0
    }));
    
    setRecipients(mappedRecipients);
  } catch (error) {
    console.error('Error loading recipients:', error);
  }
};
```

### 4. Admin Page (`app/admin/bulk-invites/page.js`)

**Changes:**
- Wire "Start Campaign" button to new activation API
- First activate campaign, then optionally trigger initial send

**Code Changes:**
```javascript
const startCampaign = async (campaignId) => {
  if (!confirm('Start this campaign? It will change status to active and begin sending emails according to the daily limit.')) return;

  try {
    const session = await supabase.auth.getSession();
    
    // First, activate the campaign
    const activateResponse = await fetch('/api/bulk-invites/campaigns/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.data.session.access_token}`
      },
      body: JSON.stringify({ campaignId })
    });

    if (!activateResponse.ok) {
      const errorData = await activateResponse.json();
      throw new Error(errorData.error || 'Failed to activate campaign');
    }

    // Optionally trigger first send immediately
    const sendResponse = await fetch('/api/bulk-invites/track/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.data.session.access_token}`
      },
      body: JSON.stringify({ campaignId })
    });

    await loadCampaigns();
    
    if (sendResponse.ok) {
      const sendResult = await sendResponse.json();
      alert(`Campaign activated! Sent ${sendResult.sent || 0} initial emails.`);
    } else {
      alert('Campaign activated! Emails will be sent according to schedule.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert(`Failed to start campaign: ${error.message}`);
  }
};
```

### 5. New Activation Endpoint (`app/api/bulk-invites/campaigns/start/route.js`)

**Purpose:**
- Provides a secure endpoint to activate campaigns
- Requires admin authentication
- Changes campaign status from 'draft' to 'active'

**Implementation:**
```javascript
export async function POST(request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token and check if user is admin
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get campaign ID and activate
    const { campaignId } = await request.json();
    // ... activation logic
  }
}
```

### 6. SQL Backfill Script (`supabase/migrations/backfill_bulk_invites_data_flow.sql`)

**Purpose:**
- Reconcile existing data in production/staging environments
- Fix campaign totals and recipient scheduling for existing records

**What it does:**
1. Updates `total_recipients` to match actual bulk_invites counts
2. Initializes `next_email_scheduled` for queued recipients
3. Syncs `total_sent` from `sent_count`
4. Updates `total_sent` based on actual sent recipients
5. Recalculates `total_opened`, `total_clicked`, `total_converted`
6. Includes verification queries

**Usage:**
```sql
-- Run in Supabase SQL Editor or via migration
-- Script is idempotent and safe to run multiple times
```

## Data Flow

### Before Fix:
```
Upload Recipients → bulk_invites table
                    ❌ total_recipients stays 0
                    ❌ next_email_scheduled not set
                    
Send Emails → Updates sent_count
              ❌ UI reads total_sent (still 0)
              
Details Page → Reads bulk_invite_recipients
               ❌ Wrong table (deprecated)
               
Admin Page → Start button hidden
             ❌ total_recipients = 0
```

### After Fix:
```
Upload Recipients → bulk_invites table
                    ✅ total_recipients updated immediately
                    ✅ next_email_scheduled = NOW()
                    
Send Emails → Updates total_sent AND sent_count
              ✅ UI shows correct counts
              
Details Page → Reads bulk_invites
               ✅ Correct table with field mapping
               
Admin Page → Start button visible
             ✅ Activates campaign via API
             ✅ Triggers initial send
```

## Field Name Mapping

The system handles two naming conventions:

| bulk_invites Table | UI/Email Expected | Mapping |
|-------------------|-------------------|---------|
| `full_name` | `first_name`, `last_name` | Split on space |
| `code` | `invite_code` | Direct mapping |
| `sent_at` | `last_email_sent` | Fallback mapping |

## Testing Checklist

- [x] Build compiles successfully
- [x] No syntax errors
- [x] CodeQL security scan passes (0 alerts)
- [ ] Manual testing: Add recipients and verify total_recipients updates
- [ ] Manual testing: Start campaign and verify status changes to 'active'
- [ ] Manual testing: Verify sender picks up recipients with next_email_scheduled
- [ ] Manual testing: Verify UI shows correct counts after sending
- [ ] Manual testing: Details page shows recipients correctly
- [ ] Database backfill script tested on staging/dev environment

## Deployment Steps

1. **Deploy code changes** (automatic via Vercel/Git push)
2. **Run backfill script** on existing environments:
   ```sql
   -- Connect to Supabase SQL Editor
   -- Run: supabase/migrations/backfill_bulk_invites_data_flow.sql
   ```
3. **Verify** using the verification queries at end of backfill script
4. **Test** by:
   - Creating a new campaign
   - Adding recipients
   - Verifying counts appear
   - Starting campaign
   - Monitoring first send

## Security Considerations

✅ All changes maintain security:
- Admin authentication required for campaign activation
- Service role used for database writes
- Bearer token verification
- Idempotent operations
- Null-safe field access
- No SQL injection risks (parameterized queries)

## Rollback Plan

If issues occur:

1. **Code rollback**: Revert Git commit
2. **Database state**: Run these queries to revert counts to previous state:
   ```sql
   -- Reset campaign totals (if needed)
   UPDATE bulk_invite_campaigns 
   SET total_recipients = 0, total_sent = 0
   WHERE status = 'draft';
   ```

## Performance Impact

- Minimal: One additional UPDATE query per recipient upload
- Negligible: Campaign totals calculated once at upload time
- Improved: Eliminates need for manual database fixes

## Future Improvements

- Add webhook/event system for real-time UI updates
- Implement batch update for campaign stats
- Add audit log for campaign status changes
- Create admin dashboard for monitoring sends

## Support

For issues or questions:
- Check Supabase logs for API errors
- Review browser console for client-side errors
- Verify environment variables are set correctly
- Run verification queries from backfill script
