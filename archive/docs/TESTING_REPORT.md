# Testing Report (v1)

## Automated
- **Playwright**: `tests/landing-page.spec.js`, `tests/critical-flows.spec.js`, `tests/pricing.spec.js`, `tests/real-time-messaging.spec.js`.
- Key paths: landing hero/CTA, invite flow, locked overlays, messages realtime, requests posting, admin bulk invites.

## Manual (Completed)
- Sign up with magic link (invite + without invite).
- Locked feature overlays show with countdown pre‑launch.
- Exchange: post Ask/Offer; reply; confirm completion → Impact increases.
- Intros: view 3 recommendations; accept/pass; (email send mocked).
- Admin: create + delete test campaign; upload CSV; track metrics.
- Mobile: iPhone SE/14 Pro; Android Pixel 6 viewports.
- Performance: image sizes, lazy loaded sections; no console errors in happy paths.

## Next Steps
- Add end‑to‑end acceptance for weekly scheduler (CI nightly dry run).
- Lighthouse CI budget: perf ≥ 90, acc ≥ 90, SEO ≥ 90, best‑practices ≥ 90.
