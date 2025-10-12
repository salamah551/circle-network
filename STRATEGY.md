# CIRCLE NETWORK – STRATEGY (v1, 2025-10-12)

## 1) Who We Serve & Why They Join
**Audience:** Founders, investors, family-office operators, and top operators with net worth ≥ $1M and time value ≥ $1,000/hr.
**Join Drivers:**
- Curated *Strategic Introductions* that directly create value (partnerships, hires, investors, distribution).
- A *Value Exchange* that turns reputation (Impact Score) into priority access and high‑signal help.
- *Pre‑screened* membership and privacy-first design that respects their attention.

## 2) Positioning & Brand
- **Luxury, quiet power, zero hype.** Dark UI with restrained gold accents; thoughtful micro‑copy.
- Invitation‑only; capped membership (configurable). *Curation > scale*.
- Tone: decisive, respectful, specific outcomes (no fluff).

## 3) Conversion Strategy (Landing → Request Access)
- 3s hook: *“The private operating network for elite founders and investors.”*
- 8s clarity: one sentence on curated intros + measurable outcomes.
- 30s action: concierge application (short, high-signal inputs).
- Ethical triggers: real scarcity (cap), authority (curation), specificity (outcomes), speed (countdown to launch).
- Mobile-first, sub‑2s LCP; single CTA; magic link signup + invite codes.

## 4) Monetization (Ethical, Premium, Upgrade Path)
**Tiers (config via env):**
- **Founding** – ${NEXT_PUBLIC_FOUNDING_PRICE}/mo (first {NEXT_PUBLIC_FOUNDERS_CAP} members): Strategic Intros (3/wk), Value Exchange, Impact Score perks, early access; price lock.
- **Premium** – ${NEXT_PUBLIC_PREMIUM_PRICE}/mo: all core + priority matching; concierge sourcing; quarterly AMA.
- **Elite** – ${NEXT_PUBLIC_ELITE_PRICE}/mo: 5/wk intros, quarterly curated salons, priority deal flow preview.
Pricing intentionally premium to signal quality; value is evidenced by weekly tangible connections.

Default (can be changed in `.env`):
- FOUNDING: $497/mo (cap 500), PREMIUM: $997/mo, ELITE: $1,997/mo.

## 5) Strategic Intros AI – Matching Design (V1)
Signals used:
- Profile vectors (industry, stage, model), *goals* and *offers*, geo preference, deal intents.
- Reciprocity: both parties’ *gives* ↔ *needs* alignment.
- Quality signals: Impact Score, accepted‑intro rate, past wins.
Algorithm (v1):
1. Pre-filter: remove prior connects/declines + identical industries unless complementary.
2. Score = weighted sum: need/offer (0.45) + stage/industry comp (0.25) + geo (0.05) + impact tier (0.15) + historical acceptance (0.10).
3. Diversity constraint: ensure 3 intros span different industries/angles.
4. Explanations: 2–3 sentence “Why this matters” generated from matched attributes.
Delivery: Mondays 08:00 (user tz) via in-app + email, accept/pass. If both accept → automated intro email.

## 6) Impact Score & Value Exchange
- **Impact Score** from: fulfilled requests, helpful replies, accepted intros, endorsements, hosting office hours.
- Anti-gaming: rate‑limits, duplicate filtering, mutual confirmations, admin anomaly alerts.
- **Value Exchange**: *Asks* and *Offers*; matching by tags + Impact Score weighting. Option: consume points to post *priority asks*.
- Perks by tier: visibility boost, weekly intro quota, early access to features.

## 7) Launch Timeline & Feature Flags
- Single env var **`NEXT_PUBLIC_LAUNCH_DATE`** gates premium features.
- Pre‑launch: members can explore; locked overlays with countdown + clear value copy.
- Auto‑unlock on/after date. (We simulate in tests to verify.)
- Recommended launch window: 2–3 weeks post‑deploy to seed founding cohort.

## 8) Admin & Growth
- Bulk invites + per‑campaign analytics (open/click/signup/quality).
- Delete/archive test campaigns.
- Export CSVs; top‑of‑funnel and cohort views.
- Seed content: spotlight “Wins of the Week”; concierge hand-curated intros until network self-primes.

## 9) Risks & Mitigations
- **Cold start:** concierge matching + manual curation first 4–6 weeks.
- **Quality risk:** manual approvals; verification via LinkedIn/company revenue; optional proof later.
- **Abuse:** RLS + rate limits; email verification; anomaly detection on Impact events.
- **Perception:** keep copy specific and quiet; avoid over-claiming.

## 10) What We’re Shipping (v1)
- Premium landing with invite flow & countdown.
- Feature flags by date; LockedFeature overlay; LaunchCountdown component.
- Strategic Intros page + SQL schema + weekly generation placeholder.
- Value Exchange marketplace + Impact Score ledger.
- Admin bulk invites + analytics.
- Tests for critical flows; docs and checklists.
