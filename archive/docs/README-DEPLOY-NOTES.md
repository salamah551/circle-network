# Deployment Notes - Funnel Transformation

This document provides setup instructions and deployment notes for the new high-conversion funnel implementation.

## Overview

The Circle Network homepage has been transformed into a dual-track funnel with:
- **Primary CTA**: Order $297 Flash Briefing (Stripe Checkout)
- **Secondary CTA**: Free 90-second Threat Scan (Tally form)
- **Live Signal Ticker**: Real-time competitive intelligence feed
- **Product Ladder**: Flash Briefing → 30-Day Sprint → Intelligence Membership

## Required Environment Variables

Add these variables to your `.env` or deployment environment:

### Stripe Configuration (Required for Flash Briefing checkout)
```bash
STRIPE_SECRET_KEY=sk_test_... # or sk_live_... for production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # or pk_live_... for production
```

### Scheduling Integration (Required for order success page)
Choose ONE of the following:

**Option A: Calendly**
```bash
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/your-username/consultation
```

**Option B: Cal.com**
```bash
NEXT_PUBLIC_CALCOM_URL=https://cal.com/your-username/consultation
```

### Tally Form Integration (Required for free threat scan)
```bash
NEXT_PUBLIC_THREAT_SCAN_TALLY_URL=https://tally.so/r/your-form-id
```

### Site URL (Optional but recommended)
```bash
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```
Used to construct absolute URLs for Stripe success/cancel redirects. Defaults to `http://localhost:5000` if not set.

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```
   Note: `@stripe/stripe-js` has been added to dependencies

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in all required variables (see above)

3. **Test Locally**
   ```bash
   npm run dev
   ```
   Visit http://localhost:5000 to test the new funnel

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## Key Routes & API Endpoints

### Public Pages
- `/` - New homepage with dual-track funnel
- `/sprint` - 30-Day Insight Sprint offering
- `/membership` - Intelligence Membership offering
- `/order-success` - Post-purchase success page with scheduler

### API Routes
- `POST /api/checkout` - Creates Stripe Checkout Session for $297 Flash Briefing
- `GET /api/signals` - Returns demo competitive signals for ticker

## Component Architecture

### New Components
- `SignalTicker.jsx` - Horizontal scrolling intelligence feed (auto-refreshes every 60s)
- `ThreatScanModal.jsx` - Modal with embedded Tally form
- `FlashBriefingCTA.jsx` - Stripe Checkout integration button

### Modified Components
- `LockedFeature.jsx` - Now a pass-through wrapper (no gating)
- `AIServicesTeaser.jsx` - Removed "COMING SOON" badges

## Testing Checklist

- [ ] Homepage loads without errors
- [ ] Signal ticker displays live signals from `/api/signals`
- [ ] "Order Flash Briefing" button opens Stripe Checkout
- [ ] Stripe Checkout redirects to `/order-success` on success
- [ ] "Free Threat Scan" button opens modal with Tally form
- [ ] Links to `/sprint` and `/membership` work
- [ ] Scheduler embeds correctly on `/order-success` page
- [ ] Mobile responsive design works on all pages

## Stripe Test Mode

For testing, use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Use any future expiry date and any 3-digit CVC

## Data Migration Notes

### Demo Signals
The `/api/signals` route currently returns hard-coded demo signals. To replace with real data:

1. **Option A: Database Integration**
   - Create a `signals` table in your database
   - Update `/app/api/signals/route.js` to query from the database
   - Implement admin interface to add/manage signals

2. **Option B: External API**
   - Connect to your intelligence platform API
   - Update `/app/api/signals/route.js` to fetch from external source
   - Add caching layer to avoid rate limits

3. **Option C: Static JSON File**
   - Create `/data/signals.json` with your signals
   - Update route to read from file system
   - Rebuild on signal updates

### Example Signal Structure
```json
{
  "timestamp": "2025-10-23 14:30 UTC",
  "text": "Competitor X launched new enterprise product targeting mid-market SaaS"
}
```

## Security Considerations

1. **Stripe Keys**: Never commit Stripe secret keys to version control
2. **Webhook Verification**: Set up Stripe webhooks for production to track successful payments
3. **Rate Limiting**: Consider adding rate limiting to `/api/checkout` to prevent abuse
4. **CORS**: API routes are server-side only and don't need CORS configuration

## Support & Troubleshooting

### Common Issues

**"Stripe is not configured" error**
- Ensure `STRIPE_SECRET_KEY` is set in environment variables
- Verify the key starts with `sk_test_` or `sk_live_`

**Scheduler not showing on order-success page**
- Verify `NEXT_PUBLIC_CALENDLY_URL` or `NEXT_PUBLIC_CALCOM_URL` is set
- Check that the URL is publicly accessible

**Tally form not loading in modal**
- Verify `NEXT_PUBLIC_THREAT_SCAN_TALLY_URL` is set
- Ensure the Tally form is published and publicly accessible

**Signal ticker not showing**
- Check browser console for API errors
- Verify `/api/signals` returns valid JSON
- Ensure signals array is not empty

## Deployment Platforms

### Vercel (Recommended)
1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- Ensure Node.js 18.17.0 or higher is available
- Set all environment variables before deployment
- Run `npm run build` before starting the server

## Performance Optimization

- Signal ticker uses CSS animations (no JavaScript animation loop)
- Stripe Checkout loads lazily when button is clicked
- Modal components only render when opened
- All API routes are marked as `dynamic` to prevent static optimization

## Future Enhancements

Consider these improvements for production:

1. **Analytics Integration**
   - Track CTA button clicks
   - Monitor Stripe Checkout conversion rate
   - Measure Threat Scan modal open rate

2. **A/B Testing**
   - Test different hero headlines
   - Experiment with CTA button text
   - Try different signal ticker speeds

3. **Signal Intelligence**
   - Implement real-time signal ingestion
   - Add signal categorization (product, funding, hiring, etc.)
   - Enable filtering by industry or company size

4. **Webhook Handling**
   - Create `/api/webhooks/stripe` to handle successful payments
   - Send confirmation emails
   - Trigger onboarding workflows

## Rollback Plan

If issues arise, you can quickly rollback:

1. Restore old homepage: `git revert <commit-hash>`
2. Or temporarily: Rename `app/landing-client.jsx.backup` to `app/landing-client.jsx`
3. Redeploy

The old landing page is preserved as `app/landing-client.jsx.backup` for reference.

---

**Last Updated**: 2025-10-23
**Version**: 1.0.0
