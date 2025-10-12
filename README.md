# Circle Network (Rebuild v1)

**Exclusive, conversion‑optimized network for elite founders and investors.**

## Key Features
- Premium landing with invite flow, scarcity, and ethical persuasion.
- Date‑based feature flags (`lib/feature-flags.js`), locked overlays, countdown.
- **Strategic Intros AI** (weekly 3 curated connections).
- **Value Exchange** marketplace + **Impact Score** reputation.
- Admin bulk invites, analytics, and application review.
- RLS‑safe Supabase schema with migrations.
- Playwright tests for critical flows.

## Getting Started
1. Copy `.env.example` → `.env.local` and fill values.
2. Run migrations in Supabase: `migrations/*.sql` then `fix-rls-policies-FINAL.sql`.
3. `npm i && npm run dev`.
4. Visit `/admin/guide` for walkthrough.

## Environment
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server routes / scripts)
- `NEXT_PUBLIC_LAUNCH_DATE` (ISO datetime)
- Pricing caps: `NEXT_PUBLIC_FOUNDERS_CAP`, `NEXT_PUBLIC_FOUNDING_PRICE`, `NEXT_PUBLIC_PREMIUM_PRICE`, `NEXT_PUBLIC_ELITE_PRICE`
- Email: `SENDGRID_API_KEY` **or** `RESEND_API_KEY`
- Stripe (optional): `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PRICE_ID`

## Scripts
- `scripts/create-test-members.js` – seed members.
- Playwright: `npx playwright test`.

## Docs
See `STRATEGY.md`, `ADMIN_GUIDE.md`, `TESTING_REPORT.md`, `LAUNCH_CHECKLIST.md`.
