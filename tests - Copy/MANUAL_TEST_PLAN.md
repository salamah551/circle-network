# The Circle Network - Manual Test Plan

## Pre-Launch Testing (Before October 15, 2025)

### 1. Landing Page & Real-time Member Count
- [ ] Visit homepage - verify countdown timer shows days/hours/mins/secs to Oct 15
- [ ] Verify "Only 500/500 Founding Spots Left" scarcity message displays
- [ ] Check that real-time member count updates from database
- [ ] Test responsive design on mobile and desktop

### 2. Invite System
- [ ] Generate new invite code from admin panel
- [ ] Verify invite email is sent with magic link
- [ ] Click magic link and verify redirect to subscribe page
- [ ] Confirm invite code is validated correctly

### 3. Founding Member Subscription
- [ ] Verify founding member plan ($199/mo) is displayed
- [ ] Verify monthly and annual plans are NOT shown (pre-launch)
- [ ] Complete Stripe checkout with test card
- [ ] Verify redirect to welcome page then dashboard
- [ ] Confirm profile status updated to "active"

### 4. Dashboard Features
- [ ] Verify profile edit modal shows all fields (bio, expertise, needs, socials)
- [ ] Update profile and verify changes persist
- [ ] Check unread message badges display correctly
- [ ] Verify activity feed shows recent member joins, requests, events
- [ ] Confirm activity feed updates in real-time (Supabase subscriptions)
- [ ] Check smart member recommendations appear based on expertise/needs

### 5. Active Status Indicators
- [ ] Login and verify your status shows "Active" (green dot)
- [ ] Wait 6 minutes and verify status changes to offline
- [ ] Have another user login and verify they show as active
- [ ] Check activity indicators update across all pages

### 6. Messages
- [ ] Send direct message to another member
- [ ] Verify message appears in real-time for recipient
- [ ] Test image upload in messages (check secure signed URLs)
- [ ] Verify unread badge count updates when new message arrives
- [ ] Mark conversation as read and verify badge clears

### 7. Member Directory
- [ ] Browse member directory with 5+ test members
- [ ] Use search to filter members by name, company, title
- [ ] Filter by expertise tags
- [ ] Click member to view full profile
- [ ] Verify "Message" button opens chat with that member

### 8. Success Stories
- [ ] Verify success stories section displays on dashboard
- [ ] Check all 6 stories are categorized correctly (funding, hiring, partnerships, etc.)
- [ ] Verify "$2.6M+ in value created" banner shows
- [ ] Test responsive layout on mobile

### 9. Events
- [ ] Create new event with capacity limit
- [ ] RSVP to event and verify attendee count updates
- [ ] Filter events by type (virtual/in-person) and category
- [ ] Verify capacity warnings when event is near full
- [ ] Check RSVP list shows member names
- [ ] Confirm event appears in activity feed

### 10. Request Board
- [ ] Create new request in specific category (fundraising, hiring, etc.)
- [ ] Search requests by keyword
- [ ] Filter by category and status (open/resolved)
- [ ] Reply to a request and verify notification sent to author
- [ ] Mark request as resolved (only author can do this)
- [ ] Verify threaded replies display correctly

## Post-Launch Testing (After October 15, 2025)

### 11. Annual Pricing Option
- [ ] Visit subscribe page after launch date
- [ ] Verify founding member plan is HIDDEN
- [ ] Verify monthly plan ($249/mo) displays
- [ ] Verify annual plan ($2,400/yr) displays with "SAVE $588" badge
- [ ] Select annual plan and verify checkout uses annual price ID
- [ ] Complete test checkout and verify correct plan subscribed

### 12. Admin Functions
- [ ] Access admin dashboard with admin email
- [ ] Generate bulk invite codes
- [ ] Review member applications
- [ ] Update member status (active/pending/suspended)
- [ ] View analytics and member metrics
- [ ] Export member data

## Critical Flows

### A. Complete New Member Journey
1. Receive invite email
2. Click magic link
3. Select founding member plan (pre-launch) or monthly/annual (post-launch)
4. Complete Stripe payment
5. Redirected to welcome page
6. Access dashboard
7. Complete profile
8. Browse members
9. Send first message
10. Join first event
11. Create first request

### B. Member Engagement Flow
1. Login to dashboard
2. Check activity feed for updates
3. See smart recommendations
4. Connect with recommended member
5. RSVP to upcoming event
6. Reply to help request
7. Update profile with new expertise
8. Get new recommendations based on updates

## Performance & Security

### Performance Checks
- [ ] Page load times < 3 seconds
- [ ] Real-time updates appear < 1 second delay
- [ ] Image uploads complete < 5 seconds
- [ ] Smooth scrolling and animations
- [ ] No console errors in browser

### Security Checks
- [ ] Unauthenticated users redirected to login
- [ ] API routes validate user sessions
- [ ] Supabase RLS policies enforce data access
- [ ] No sensitive data in console.log
- [ ] Environment variables properly secured
- [ ] Stripe webhooks validate signatures
- [ ] Admin routes only accessible by admin emails

## Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Edge Cases

### Data Validation
- [ ] Empty form submissions rejected
- [ ] Invalid email formats rejected
- [ ] XSS attempts sanitized
- [ ] SQL injection attempts blocked
- [ ] File upload size limits enforced

### Error Handling
- [ ] Network failures show user-friendly errors
- [ ] Stripe payment failures handled gracefully
- [ ] Database connection issues handled
- [ ] Invalid invite codes show clear messages
- [ ] Session expiry redirects to login

## Test Data Setup

### Required Test Accounts
1. Admin user (nahdasheh@gmail.com)
2. 5 founding members with varied profiles:
   - Tech founder (AI/ML expertise)
   - Finance executive (fundraising expertise)
   - Marketing professional (growth expertise)
   - Hiring manager (talent needs)
   - Investor (looking for deals)

### Required Test Data
- 10+ invite codes (some used, some pending)
- 15+ messages across conversations
- 5+ upcoming events with varied categories
- 10+ help requests with replies
- 3+ success stories per category

## Acceptance Criteria

All features must:
✅ Work without console errors
✅ Display correctly on mobile and desktop
✅ Update in real-time where applicable
✅ Persist data correctly
✅ Enforce security policies
✅ Provide user-friendly error messages
✅ Load within performance targets
✅ Handle edge cases gracefully

## Sign-off

- [ ] All pre-launch tests passed
- [ ] All post-launch tests passed
- [ ] All critical flows tested
- [ ] Performance benchmarks met
- [ ] Security checklist complete
- [ ] Browser compatibility verified
- [ ] Edge cases handled
- [ ] Ready for production deployment
