# Acceptance Tests - Hardening Pass

This document outlines manual acceptance tests for the hardening pass implementation. Each test should be performed to verify the changes work as intended.

## Test 1: Dashboard Onboarding Gate

### Scenario A: New User Without Needs Assessment
**Setup:**
1. Create a test user with active subscription
2. Ensure `profiles.needs_assessment_completed_at` is NULL

**Test Steps:**
1. Log in as the test user
2. Navigate to `/dashboard`

**Expected Result:**
- User is automatically redirected to `/welcome/quiz`
- Dashboard does not render

**Verification:**
- Check browser URL: should be `/welcome/quiz`
- Check network tab: should see redirect (302 or 307)

### Scenario B: User Completes Needs Assessment
**Setup:**
1. Start from Scenario A (at `/welcome/quiz`)

**Test Steps:**
1. Complete the needs assessment quiz
2. Submit the final step

**Expected Result:**
- After submission, user is redirected to `/dashboard`
- Dashboard renders successfully
- `profiles.needs_assessment_completed_at` is now set in database

**Verification:**
- Check browser URL: should be `/dashboard`
- Dashboard widgets should be visible
- Future visits to `/dashboard` should not redirect

### Scenario C: User Without Active Subscription
**Setup:**
1. Create test user with `subscription_status` = 'inactive'

**Test Steps:**
1. Log in as the test user
2. Navigate to `/dashboard`

**Expected Result:**
- User is automatically redirected to `/subscribe`

**Verification:**
- Check browser URL: should be `/subscribe`
- Check network tab for redirect

---

## Test 2: LockedFeature Component Rendering

### Scenario A: Locked Feature (Non-Premium User)
**Setup:**
1. Log in as user with tier that doesn't have access to members directory

**Test Steps:**
1. Navigate to `/members`

**Expected Result:**
- Premium unlock panel renders with:
  - Sparkles icon in gradient circle
  - "Member Directory" title (or feature title)
  - Feature description
  - "Upgrade to Premium" button (amber gradient)
  - "Back to Dashboard" button (zinc)
  - Unlock date text
- NO blank page
- NO error messages

**Verification:**
- Visually confirm panel appears centered on page
- Confirm buttons are clickable and styled correctly
- Click "Upgrade to Premium" → navigates to `/subscribe`
- Click "Back to Dashboard" → navigates to `/dashboard`

### Scenario B: Admin Preview Mode
**Setup:**
1. Log in as admin user (profile.is_admin = true)
2. Navigate to a locked feature like `/messages`

**Test Steps:**
1. Observe the page rendering

**Expected Result:**
- Admin preview callout appears at top:
  - Crown icon
  - "👑 Admin Preview Mode" text
  - "You're viewing this feature as an admin" subtext
- Content below the callout (either unlock panel or actual feature content)

**Verification:**
- Confirm amber gradient background on callout
- Verify callout appears before any other content

### Scenario C: Unlocked Feature
**Setup:**
1. Log in as premium tier user with access to feature

**Test Steps:**
1. Navigate to `/members` or another gated feature

**Expected Result:**
- Feature content renders normally
- No unlock panel
- No blank page

---

## Test 3: Supabase Browser Singleton

### Scenario A: Multiple Pages Using Supabase
**Setup:**
1. Open browser console (F12)
2. Clear console logs
3. Log in to the application

**Test Steps:**
1. Navigate to `/billing`
2. Navigate to `/referrals`
3. Navigate to `/invite`
4. Use GlobalSearch (Cmd/Ctrl+K)
5. Monitor console for warnings

**Expected Result:**
- NO "Multiple GoTrueClient instances detected" warnings
- Auth-dependent features work correctly
- Data loads successfully on all pages

**Verification:**
- Console should be clean (no Supabase instance warnings)
- Billing info displays correctly
- Referrals load successfully
- Invite form is functional
- Search returns results

---

## Test 4: Environment Validation Banner

### Scenario A: Missing Keys in Development
**Setup:**
1. Set `NODE_ENV=development` (or leave unset)
2. Remove or comment out `ARC_LIMIT_ELITE` from `.env.local`
3. Restart development server

**Test Steps:**
1. Log in as any user
2. Navigate to `/dashboard`

**Expected Result:**
- Yellow/amber warning banner appears at top of dashboard
- Banner shows:
  - ⚠️ emoji
  - "Missing ARC Environment Variables (Dev/Admin View)"
  - List of missing keys (should include `ARC_LIMIT_ELITE`)
- Banner has amber background with border

**Verification:**
- Banner is visible and readable
- Missing keys are clearly listed
- Banner appears above dashboard content

### Scenario B: Missing Keys in Production (Regular User)
**Setup:**
1. Set `NODE_ENV=production`
2. Keep `ARC_LIMIT_ELITE` removed
3. Log in as regular user (profile.is_admin = false)

**Test Steps:**
1. Navigate to `/dashboard`

**Expected Result:**
- NO banner appears for regular users in production

**Verification:**
- Confirm no warning banner visible
- Dashboard functions normally

### Scenario C: Missing Keys in Production (Admin User)
**Setup:**
1. Keep `NODE_ENV=production`
2. Keep `ARC_LIMIT_ELITE` removed
3. Log in as admin user (profile.is_admin = true)

**Test Steps:**
1. Navigate to `/dashboard`

**Expected Result:**
- Warning banner DOES appear for admin users even in production
- Shows same information as Scenario A

**Verification:**
- Confirm banner is visible to admin
- Verify admin can see which keys are missing

### Scenario D: All Keys Configured
**Setup:**
1. Restore all ARC environment variables
2. Restart server

**Test Steps:**
1. Navigate to `/dashboard` (any environment, any user)

**Expected Result:**
- NO banner appears for anyone
- Dashboard functions normally

---

## Test 5: ARC Elite Request Limits

### Scenario A: Elite Tier Default Limit
**Setup:**
1. Log in as Elite tier user
2. Ensure `ARC_LIMIT_ELITE` is NOT set in environment (or set to empty)
3. Check current month's usage count in database

**Test Steps:**
1. Navigate to ARC request form
2. Submit a test ARC request
3. Check the response or usage counter

**Expected Result:**
- Usage limit should default to 50 requests/month
- After submitting request, remaining usage should show (50 - current_usage)
- If 50 requests already made this month → should get error about limit reached

**Verification:**
- Check API response: `limit: 50`
- Check `remaining` field in response
- Verify limit is NOT 100 (old default)

### Scenario B: Elite Tier with Env Override
**Setup:**
1. Set `ARC_LIMIT_ELITE=75` in environment
2. Restart server
3. Log in as Elite tier user

**Test Steps:**
1. Submit an ARC request
2. Check response data

**Expected Result:**
- Usage limit should be 75 (from env override)
- Remaining usage calculated from 75

**Verification:**
- Confirm `limit: 75` in response
- Environment override is working

### Scenario C: Other Tier Limits Unchanged
**Setup:**
1. Log in as Founding tier user

**Test Steps:**
1. Submit an ARC request
2. Check response

**Expected Result:**
- Founding tier still has 100 requests/month default
- Other tiers (Charter: 10, Professional: 5) unchanged

**Verification:**
- Confirm Founding shows limit: 100
- No changes to other tier limits

---

## Test 6: End-to-End User Journey

### Complete User Flow
**Setup:**
1. Create fresh test account
2. Complete subscription flow

**Test Steps:**
1. Log in → redirected to `/welcome/quiz`
2. Complete needs assessment quiz
3. Arrive at `/dashboard` → see personalized widgets
4. Navigate to `/members` → see either content or unlock panel based on tier
5. Use GlobalSearch (Cmd/Ctrl+K) → search works, no console errors
6. Navigate to `/billing` → page loads, no console warnings
7. Check console throughout → no "Multiple GoTrueClient" warnings

**Expected Result:**
- Smooth flow with no breaking errors
- All redirects work correctly
- All features load appropriately based on user tier
- Console is clean of instance warnings

---

## Security Verification

### Security Checklist
- [ ] No hardcoded user IDs in client-side code (LockedFeature uses database field)
- [ ] Environment validation only exposes missing keys to dev/admin
- [ ] Server-side gates enforce authentication/subscription/onboarding
- [ ] CodeQL scan shows 0 alerts
- [ ] No secrets logged to console
- [ ] Admin detection uses database field, not client-side list

### Manual Security Checks
1. **Bypass Attempt**: Try to access `/dashboard` without completing onboarding
   - Should redirect, not render dashboard
2. **Inspect Bundle**: Check client bundle for hardcoded user IDs
   - Should NOT find any UUID strings in LockedFeature
3. **Network Inspection**: Monitor API calls during locked feature access
   - Should not expose admin user lists

---

## Regression Testing

### Existing Features to Verify
- [ ] Login/logout still works
- [ ] Subscription flow unchanged
- [ ] Existing dashboard widgets render
- [ ] All API routes still functional
- [ ] Other pages (not modified) still work
- [ ] Mobile responsive design intact

---

## Performance Tests

### Load Time Checks
- [ ] Dashboard loads in < 3 seconds (dev mode)
- [ ] Locked feature panel renders immediately
- [ ] No visible lag when checking environment variables
- [ ] Singleton client doesn't cause slowdowns

---

## Test Summary Checklist

After completing all tests, verify:
- [ ] All onboarding gates work correctly
- [ ] LockedFeature never shows blank pages
- [ ] No Supabase client instance warnings
- [ ] Environment banner shows appropriately
- [ ] ARC Elite limit is 50 by default
- [ ] All security checks pass
- [ ] No regressions in existing features
- [ ] Build completes successfully
- [ ] Documentation is accurate

---

## Reporting Issues

If any test fails:
1. Note the specific scenario and steps
2. Capture screenshots/console logs
3. Check browser console for errors
4. Verify environment variables are set correctly
5. Confirm database schema matches expectations
6. Check that code changes were deployed correctly
