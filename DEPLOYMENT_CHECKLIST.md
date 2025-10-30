# ARC Hub Deployment Checklist

## Pre-Deployment Steps

### 1. Database Migration
- [ ] Run migration: `supabase/migrations/20251030_arc_attachments.sql`
  ```bash
  # Via Supabase CLI
  supabase db push
  
  # OR manually in Supabase Dashboard SQL Editor
  # Copy and paste the migration file contents
  ```
- [ ] Verify `arc_requests.type` column exists
- [ ] Verify `arc_request_attachments` table created with all columns
- [ ] Verify RLS policies applied to `arc_request_attachments`

### 2. Supabase Storage Setup (CRITICAL - Manual Step Required)
- [ ] Navigate to: Supabase Dashboard → Storage
- [ ] Click "New Bucket"
- [ ] Bucket name: `arc-uploads` (exactly as shown)
- [ ] Set to: **Private** (not public)
- [ ] Create bucket
- [ ] Add RLS Policy 1: "Users can upload their own files"
  - Operation: INSERT
  - Policy:
    ```sql
    bucket_id = 'arc-uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
    ```
- [ ] Add RLS Policy 2: "Users can read their own files"
  - Operation: SELECT
  - Policy:
    ```sql
    bucket_id = 'arc-uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
    ```

### 3. Environment Variables (Vercel/Production)
Set the following environment variables:

```bash
# ARC Usage Limits (requests per month by tier)
ARC_LIMIT_FOUNDING=100
ARC_LIMIT_ELITE=100
ARC_LIMIT_CHARTER=10
ARC_LIMIT_PROFESSIONAL=5

# ARC Storage Configuration
ARC_STORAGE_BUCKET=arc-uploads
ARC_MAX_FILE_SIZE_MB=20
```

Verify existing env vars are still set:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)

### 4. Build Verification
- [ ] Run local build: `npm run build`
- [ ] Verify no critical errors (some prerender errors expected)
- [ ] Check for "Multiple GoTrueClient instances" warnings (should be gone)

## Post-Deployment Testing

### Critical Path Testing

#### 1. ARC Hub Functionality
- [ ] Navigate to dashboard
- [ ] Verify ARC Hub is visible and largest card
- [ ] Test tab switching (Briefs → Travel → Intel)
- [ ] Test file drag-and-drop
- [ ] Test file picker button
- [ ] Upload a valid PDF file (< 20MB)
- [ ] Try uploading invalid file type (should show error)
- [ ] Try uploading file > 20MB (should show error)
- [ ] Verify usage counter displays (e.g., "0/10 used")
- [ ] Submit a brief with attachment
- [ ] Verify success message appears
- [ ] Verify usage counter increments (e.g., "1/10 used")

#### 2. ARC Briefs Widget
- [ ] Check "My ARC Briefs" widget on dashboard
- [ ] Verify submitted brief appears with:
  - [ ] Correct service type badge (blue=brief, purple=travel, green=intel)
  - [ ] Attachment count (paperclip icon with number)
  - [ ] Status indicator (processing/completed)
- [ ] Submit 2-3 more briefs of different types
- [ ] Verify all appear in widget

#### 3. Usage Cap Enforcement
- [ ] Note your tier's monthly limit (test account)
- [ ] Submit briefs until reaching the cap
- [ ] Verify submit button becomes disabled
- [ ] Verify message shows: "Monthly Limit Reached"
- [ ] Verify upgrade link appears
- [ ] Test that POST to `/api/arc/request` returns 429

#### 4. Auth & Navigation
- [ ] Open browser console (F12)
- [ ] Navigate dashboard → requests → members → messages
- [ ] Verify NO "Multiple GoTrueClient instances" warnings
- [ ] Test quick navigation chips in ARC Hub
- [ ] Verify each chip navigates correctly

#### 5. Members & Messages (No Black Screens)
- [ ] Navigate to /members
- [ ] Verify page loads without black screen
- [ ] Search for a member
- [ ] Click on a member profile
- [ ] Verify /members/[id] loads without errors
- [ ] Navigate to /messages
- [ ] Verify page loads without black screen

#### 6. Requests Page (No 401 Errors)
- [ ] Navigate to /requests
- [ ] Click "New Request"
- [ ] Fill in form and submit
- [ ] Verify no 401 errors in console
- [ ] Verify request appears in list immediately (realtime)
- [ ] Refresh page
- [ ] Verify request persists

### Secondary Testing

#### Widget Empty States
- [ ] Create a fresh test account (no activity)
- [ ] Verify ARC Briefs widget shows: "No briefs yet"
- [ ] Verify Travel widget shows: "No trips scheduled"
- [ ] Verify Intel widget shows: "No intel yet"
- [ ] Verify Matches widget shows: "We're calibrating your network"
- [ ] Verify Community widget shows: "No highlights yet"
- [ ] Verify NO placeholder/fake data anywhere

#### Help Pages
- [ ] Navigate to /help/arc
- [ ] Verify instructions mention service type tabs
- [ ] Verify file attachment guidance present
- [ ] Verify monthly caps mentioned (100/100/10/5)
- [ ] Navigate to /help/forward-trips
- [ ] Verify forwarding instructions present

## Rollback Plan

If critical issues are discovered:

1. **Immediate**: Revert environment variables to previous values
2. **Storage**: Keep `arc-uploads` bucket (no harm if unused)
3. **Database**: Migration is additive (adds columns/tables), safe to keep
4. **Code**: Revert to previous commit:
   ```bash
   git revert HEAD
   git push
   ```

## Success Criteria

Deployment is successful when:
- ✅ All items in "Critical Path Testing" pass
- ✅ No console errors or warnings about auth
- ✅ File uploads work end-to-end
- ✅ Usage caps enforce correctly
- ✅ No black screens on any page
- ✅ No placeholder data visible

## Known Issues / Limitations

1. **File Preview**: No file preview before upload (feature for future)
2. **Download Attachments**: Cannot download attachments from briefs widget yet
3. **Progress Indicator**: No upload progress bar (instant feedback only)
4. **Concurrent Uploads**: Uploads happen sequentially, not in parallel

## Support & Troubleshooting

If issues arise:

1. Check Supabase logs for storage/RLS errors
2. Verify environment variables are set correctly
3. Test API endpoints directly:
   - `curl -X GET https://your-domain.com/api/arc/usage`
   - Should return: `{"used":0,"limit":10,"remaining":10}`
4. Check browser console for JavaScript errors
5. Review `ARC_HUB_IMPLEMENTATION.md` for detailed troubleshooting

## Monitoring

After deployment, monitor:
- [ ] Storage usage in Supabase (arc-uploads bucket size)
- [ ] API endpoint response times (/api/arc/request)
- [ ] Error rates (429 errors = users hitting caps)
- [ ] User feedback on ARC Hub experience

## Next Steps (Post-Launch)

Enhancements to consider:
1. File preview thumbnails
2. Download button for attachments
3. Upload progress indicators
4. Bulk upload support (>5 files)
5. Integration with Google Drive/Dropbox
6. OCR processing for image attachments
7. Analytics dashboard for usage patterns
