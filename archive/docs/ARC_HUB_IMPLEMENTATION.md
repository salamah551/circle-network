# ARC Hub Implementation Guide

## Overview
This document describes the implementation of the ARC™ Hub redesign and associated features that resolve multiple launch-blocking issues in the Circle Network application.

## Changes Implemented

### 1. ARC Hub Redesign (`components/dashboard/ActionCenter.jsx`)

**The ARC Hub is now the central, largest card on the dashboard** with the following features:

#### Service Type Tabs
- Three tabs: **Briefs** (research/analysis), **Travel** (flight optimization), **Intel** (market research)
- User must select a service type before composing a request
- Tab selection updates the placeholder text and context

#### File Attachments
- Drag-and-drop zone for file uploads
- File picker button as alternative
- **Allowed file types**: PDF, DOC, DOCX, XLS, XLSX, CSV, TXT, PNG, JPG, JPEG, WEBP
- **Max file size**: 20MB per file
- **Max files**: 5 files per request
- Real-time file validation with user-friendly error messages
- Visual file list with size display and remove buttons

#### Monthly Usage Tracking
- Displays current usage vs. limit (e.g., "3/10 used this month")
- Shows remaining requests clearly
- Tier-based limits:
  - **Founding/Elite**: 100 requests/month
  - **Charter**: 10 requests/month
  - **Professional**: 5 requests/month
- Disables submit button when limit reached
- Shows upgrade CTA when exhausted

#### Quick Navigation Chips
- Members
- Messages
- Requests
- AI Intros

### 2. ARC API Endpoints

#### `/api/arc/request` (POST)
**Now accepts multipart/form-data** instead of JSON:

- **Input fields**:
  - `type`: Service type ('brief' | 'travel' | 'intel')
  - `content`: Request text (required)
  - `files`: Array of files (optional, max 5 files × 20MB)

- **Functionality**:
  - Validates service type
  - Validates file types and sizes
  - Checks monthly usage cap based on user's tier
  - Returns 429 with helpful message when over limit
  - Uploads files to Supabase Storage bucket `arc-uploads`
  - Creates `arc_requests` record with type
  - Creates `arc_request_attachments` records for each file
  - Returns updated usage stats

- **Response** (200 OK):
  ```json
  {
    "id": "uuid",
    "status": "processing",
    "type": "brief",
    "attachments": 2,
    "message": "Request submitted! Check My ARC Briefs for updates.",
    "usage": {
      "used": 4,
      "limit": 10,
      "remaining": 6
    }
  }
  ```

- **Response** (429 Too Many Requests):
  ```json
  {
    "error": "Monthly usage limit reached",
    "message": "You've reached your monthly limit of 10 ARC requests. Upgrade your tier for more requests.",
    "used": 10,
    "limit": 10,
    "remaining": 0
  }
  ```

#### `/api/arc/usage` (GET)
Returns current user's monthly usage stats:

```json
{
  "used": 3,
  "limit": 10,
  "remaining": 7
}
```

#### `/api/arc/briefs` (GET)
Enhanced to include:
- `type`: Service type badge ('brief' | 'travel' | 'intel')
- `attachments_count`: Number of attachments for each request

### 3. Database Migration

**File**: `supabase/migrations/20251030_arc_attachments.sql`

Creates:
- `arc_requests.type` column (brief | travel | intel)
- `arc_request_attachments` table with columns:
  - `id` (uuid, primary key)
  - `request_id` (uuid, foreign key to arc_requests)
  - `user_id` (uuid, foreign key to auth.users)
  - `file_name` (text)
  - `file_size` (bigint, in bytes)
  - `file_type` (text, MIME type)
  - `storage_path` (text, path in Supabase Storage)
  - `created_at`, `updated_at` (timestamptz)

- RLS policies:
  - Users can only view their own attachments
  - Users can only insert their own attachments

### 4. Supabase Storage Setup

**IMPORTANT**: After running the migration, you must manually create the storage bucket:

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named: **`arc-uploads`**
3. Set bucket to **PRIVATE** (not public)
   - **Note**: "Private" means the bucket is not publicly accessible via URLs. Access is controlled exclusively by RLS policies, ensuring users can only access their own files.
4. Add RLS policies for the bucket:

   **Policy 1: "Users can upload their own files"**
   - Operation: INSERT
   - Policy definition:
     ```sql
     bucket_id = 'arc-uploads' AND 
     auth.uid()::text = (storage.foldername(name))[1]
     ```

   **Policy 2: "Users can read their own files"**
   - Operation: SELECT
   - Policy definition:
     ```sql
     bucket_id = 'arc-uploads' AND 
     auth.uid()::text = (storage.foldername(name))[1]
     ```

**File path structure**: `{user_id}/{request_id}/{filename}`

### 5. Auth Consolidation

Eliminated "Multiple GoTrueClient instances" warnings by:

- Creating singleton browser client in `lib/supabase-browser.js`
- Updated the following pages to use `getSupabaseBrowserClient()`:
  - `app/dashboard/page.js`
  - `app/requests/page.js`
  - `app/members/page.js`
  - `app/members/[id]/page.js`
  - `app/messages/page.js`

All POST operations go through server-side API routes with SSR authentication using cookies.

### 6. Environment Variables

Added to `.env.example`:

```bash
# ARC Usage Limits (requests per month by tier)
ARC_LIMIT_FOUNDING=100
ARC_LIMIT_ELITE=100
ARC_LIMIT_CHARTER=10
ARC_LIMIT_PROFESSIONAL=5

# ARC Storage
ARC_STORAGE_BUCKET=arc-uploads
ARC_MAX_FILE_SIZE_MB=20
```

**Ensure these are set in your production environment (Vercel, etc.)**

### 7. Help Pages

Updated `/help/arc` page with:
- Instructions for using the new service type tabs
- File attachment guidance (types, size limits)
- Monthly usage cap information
- Updated example prompts for each service type

### 8. Dashboard Coherence

- ARC Hub is now full-width on large screens (`lg:col-span-full`)
- Verified all widgets show real data or elegant empty states (no placeholders):
  - `ArcBriefsWidget`: Shows service type badge and attachment count
  - `UpcomingTravelWidget`: Empty state with "How to forward trips" link
  - `MarketIntelWidget`: Empty state with settings link
  - `AiMatchesWidget`: Empty state with profile completion CTA
  - `CommunityHighlightsWidget`: Empty state message

## Testing Checklist

### ARC Hub Features
- [ ] Service type tabs switch properly (Briefs, Travel, Intel)
- [ ] Drag-and-drop file upload works
- [ ] File picker opens and accepts valid files
- [ ] Invalid file types are rejected with error message
- [ ] Files over 20MB are rejected with error message
- [ ] Multiple files can be added (up to 5)
- [ ] Files can be removed from the list
- [ ] Usage counter displays correctly
- [ ] Submit is disabled when limit reached
- [ ] Request submits successfully with attachments
- [ ] Success message appears after submission
- [ ] Quick navigation chips work

### API Endpoints
- [ ] `/api/arc/request` accepts multipart/form-data
- [ ] Files are uploaded to Supabase Storage
- [ ] `arc_request_attachments` records are created
- [ ] Monthly usage cap is enforced (test by creating many requests)
- [ ] 429 error returns when limit exceeded
- [ ] `/api/arc/usage` returns correct stats
- [ ] `/api/arc/briefs` includes type and attachment count

### Auth & Pages
- [ ] No "Multiple GoTrueClient instances" console warnings
- [ ] Dashboard loads without errors
- [ ] Requests page loads and works (no 401 errors)
- [ ] Members page loads (no black screen)
- [ ] Messages page loads (no black screen)
- [ ] Member profile page loads

### Database & Storage
- [ ] Migration runs successfully
- [ ] `arc-uploads` bucket exists and is private
- [ ] Bucket RLS policies are configured
- [ ] Files are stored in correct path structure

## Deployment Notes

1. **Run database migration**:
   ```bash
   # Via Supabase CLI
   supabase db push
   
   # Or manually in Supabase Dashboard SQL Editor
   # Run: supabase/migrations/20251030_arc_attachments.sql
   ```

2. **Create storage bucket** (manual step required):
   - Follow instructions in "Supabase Storage Setup" section above
   - This cannot be automated via migration

3. **Set environment variables**:
   - Add all ARC_LIMIT_* variables to your production environment
   - Set ARC_STORAGE_BUCKET and ARC_MAX_FILE_SIZE_MB

4. **Verify build**:
   ```bash
   npm run build
   ```

5. **Test thoroughly** using the checklist above

## Usage Examples

### Example 1: Brief Request with Document
1. Open dashboard
2. Click on "Briefs" tab (default)
3. Type: "Analyze this NDA for unusual clauses"
4. Drag and drop a PDF file
5. Click "Submit Request"
6. Check "My ARC Briefs" widget for status

### Example 2: Travel Request
1. Click on "Travel" tab
2. Type: "Find business class award availability from SFO to Tokyo in late March"
3. Optionally attach flight confirmation
4. Click "Submit Request"

### Example 3: Intel Request
1. Click on "Intel" tab
2. Type: "Research competitive landscape for AI recruiting tools"
3. Attach spreadsheet with competitor list (optional)
4. Click "Submit Request"

## Troubleshooting

### "Multiple GoTrueClient instances" warning
- Ensure all pages use `getSupabaseBrowserClient()` from `lib/supabase-browser.js`
- Check for any `createClient()` calls in client components

### 401 errors on /api/requests or /api/arc/request
- Verify API route files use `createServerClient` with cookies (from `@supabase/ssr`)
- Check that fetch requests from client include `credentials: 'include'`
- Ensure cookies are properly configured in the SSR client

### File upload fails
- Verify `arc-uploads` bucket exists and is private
- Check bucket RLS policies are configured correctly
- Ensure file meets size and type requirements

### Usage counter shows 0/0
- Check environment variables are set correctly
- Verify user profile has `membership_tier` field
- Test `/api/arc/usage` endpoint directly

## Architecture Decisions

1. **Multipart vs JSON**: Chose multipart/form-data for file uploads as it's the standard for file uploads and better supported by browsers.

2. **Server-side file validation**: All file validation happens on the server to prevent tampering.

3. **Usage tracking**: Month-based tracking resets automatically on the 1st of each month (UTC).

4. **Storage path structure**: Using `{user_id}/{request_id}/{filename}` ensures isolation and easy cleanup.

5. **Singleton client**: Prevents auth state conflicts and eliminates console warnings.

## Future Enhancements

Potential improvements for future iterations:
- File preview before upload
- Progress indicator during file upload
- Ability to delete attachments after submission
- Download attachments from briefs widget
- OCR processing for images
- Automated file size optimization
- Support for additional file types (ZIP, RAR)
- Bulk upload (more than 5 files)
- Integration with Google Drive / Dropbox
