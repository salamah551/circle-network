# Launch Checklist

- [ ] Environment variables configured (see `.env.example`).
- [ ] Run SQL migrations in Supabase (`migrations/*.sql` + `fix-rls-policies-FINAL.sql`).
- [ ] Set `NEXT_PUBLIC_LAUNCH_DATE` to target date (ISO format).
- [ ] Seed 100–300 quality prospects via Bulk Invites.
- [ ] Concierge match the first 20 intros to prime flywheel.
- [ ] Run Playwright suite and Lighthouse CI.
- [ ] Verify email provider keys (SendGrid/Resend) + Stripe (if charging pre‑launch).
- [ ] Verify admin approvals and RLS.
- [ ] Smoke test on mobile and desktop.
- [ ] Prepare week‑1 “Wins of the Week” post; schedule member onboarding webinar.
