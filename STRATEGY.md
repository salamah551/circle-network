# CIRCLE NETWORK – STRATEGY (v2, 2025-10-29)

## 1) Who We Serve & Why They Join
**Audience:** Founders, investors, family-office operators, and top operators with net worth ≥ $1M and time value ≥ $1,000/hr.
**Join Drivers:**
- Curated *Strategic Introductions* powered by ARC™ AI that directly create value (partnerships, hires, investors, distribution).
- A *Value Exchange* that turns reputation (Impact Score) into priority access and high‑signal help.
- *Pre‑screened* membership and privacy-first design that respects their attention.

## 2) Positioning & Brand
- **"The World's First AI-Enhanced Private Network"**
- **Luxury, quiet power, zero hype.** Dark UI with restrained gold/amber accents; thoughtful micro‑copy.
- Invitation‑only; tier-based access. *Curation > scale*.
- Tone: decisive, respectful, specific outcomes (no fluff).

## 3) Membership Tiers
**Three standardized tiers:**
- **Professional** – $199/mo – Individual operators/founders
  - 5 BriefPoint briefs per day
  - 10 ARC requests per month
  - 1 Strategic Intro per week
  - Email delivery
  - Community & event access
  
- **Pro** – $299/mo – Power users, sales leaders, VCs
  - 10 BriefPoint briefs per day
  - 30 ARC requests per month
  - 3 Strategic Intros per week
  - Slack & Email delivery
  - Priority support
  - AI-curated matches
  
- **Elite** – $499/mo – Top-tier executives/investors
  - 25 BriefPoint briefs per day
  - 100 ARC requests per month
  - 5+ Strategic Intros per week
  - 1 monthly "Deep Dive" brief
  - Slack & Email delivery
  - White-glove concierge
  - Dedicated account manager

**Special Offer:**
- **Founding Members** – Pro tier at $219/mo, locked for 24 months

## 4) Monetization (Ethical, Premium)
**Pricing (config via env):**
- **Professional** – `NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL` ($199/mo)
- **Pro** – `NEXT_PUBLIC_STRIPE_PRICE_PRO` ($299/mo)
- **Elite** – `NEXT_PUBLIC_STRIPE_PRICE_ELITE` ($499/mo)
- **Founding** – `NEXT_PUBLIC_STRIPE_PRICE_FOUNDING` ($219/mo, Pro tier features for 24 months)

Pricing intentionally premium to signal quality; value is evidenced by weekly tangible connections and AI-powered intelligence.

## 5) Strategic Intros AI – Matching Design (V1)
Signals used:
- Profile vectors (industry, stage, model), *goals* and *offers*, geo preference, deal intents.
- Reciprocity: both parties' *gives* ↔ *needs* alignment.
- Quality signals: Impact Score, accepted‑intro rate, past wins.
Algorithm (v1):
1. Pre-filter: remove prior connects/declines + identical industries unless complementary.
2. Score = weighted sum: need/offer (0.45) + stage/industry comp (0.25) + geo (0.05) + impact tier (0.15) + historical acceptance (0.10).
3. Diversity constraint: ensure intros span different industries/angles (tier-dependent).
4. Explanations: 2–3 sentence "Why this matters" generated from matched attributes.
Delivery: Mondays 08:00 (user tz) via in-app + email, accept/pass. If both accept → automated intro email.

## 6) Impact Score & Value Exchange
- **Impact Score** from: fulfilled requests, helpful replies, accepted intros, endorsements, hosting office hours.
- Anti-gaming: rate‑limits, duplicate filtering, mutual confirmations, admin anomaly alerts.
- **Value Exchange**: *Asks* and *Offers*; matching by tags + Impact Score weighting. Option: consume points to post *priority asks*.
- Perks by tier: visibility boost, weekly intro quota, early access to features.

## 7) Capabilities Model
- Replaced date-gated launch logic with tier-based capabilities
- `lib/features.ts` exports capability resolver
- Features are available immediately based on membership tier
- ARC™ access differentiation: full vs. limited

## 8) Admin & Growth
- Bulk invites + per‑campaign analytics (open/click/signup/quality).
- Delete/archive test campaigns.
- Export CSVs; top‑of‑funnel and cohort views.
- Seed content: spotlight "Wins of the Week"; concierge hand-curated intros until network self-primes.

## 9) Risks & Mitigations
- **Cold start:** concierge matching + manual curation first 4–6 weeks.
- **Quality risk:** manual approvals; verification via LinkedIn/company revenue; optional proof later.
- **Abuse:** RLS + rate limits; email verification; anomaly detection on Impact events.
- **Perception:** keep copy specific and quiet; avoid over-claiming.

## 10) What We're Shipping (v2)
- Premium landing with new positioning "The World's First AI-Enhanced Private Network"
- Tier-based capabilities (Inner Circle and Core)
- Canonical payment endpoints replacing legacy checkout flows
- Strategic Intros page + SQL schema + weekly generation
- Value Exchange marketplace + Impact Score ledger
- Admin bulk invites + analytics
- Tests for critical flows; updated docs
