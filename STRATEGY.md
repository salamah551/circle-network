# CIRCLE NETWORK – STRATEGY (v2, November 2024)

## 1) Positioning & Brand
**"The World's First AI-Enhanced Private Network"**

- **Elite, curated, quiet power.** Invitation-only with tier-based access.
- Dark UI with restrained gold/purple accents; thoughtful micro-copy.
- Tone: decisive, respectful, specific outcomes (no fluff).

## 2) Who We Serve & Why They Join
**Audience:** Founders, investors, C-suite executives, and top operators with high net worth and time value.

**Join Drivers:**
- Curated *Strategic Introductions* that directly create value (partnerships, hires, investors, distribution).
- *ARC™ AI Engine* providing proprietary intelligence and insights.
- A *Value Exchange* that turns reputation (Impact Score) into priority access and high-signal help.
- Pre-screened membership and privacy-first design that respects their attention.

## 3) Membership Tiers

### Inner Circle (Founding Member)
**Positioning:** Exclusive, high-touch for founders/VCs with full ARC™ access.

**Benefits:**
- Full ARC™ AI access (unlimited intelligence and insights)
- White-glove networking and personalized introductions
- Exclusive deal flow preview
- Priority strategic intro matching
- Concierge service
- Direct input on platform development
- Early access to all new features
- Lifetime rate lock (never increases)
- Founding Member badge

**Pricing:** Premium annual contribution

### Core (Charter Member)
**Positioning:** Immediate but limited ARC™ access for accomplished professionals.

**Benefits:**
- Limited ARC™ Access (essential intelligence)
- AI-curated strategic introductions
- Value Exchange marketplace access
- Member directory and community channels
- Expert sessions
- Priority feature access (first in line for new capabilities)
- Charter Member badge (permanent recognition)
- Lifetime charter rate lock

**Pricing:** Mid-tier annual contribution

## 4) ARC™ AI Engine

Our proprietary AI engine that provides:

**For Inner Circle (Full Access):**
- Unlimited intelligence briefs and insights
- Network Intelligence - map hidden connections
- Opportunity Radar - detect M&A signals, funding rounds
- Custom queries and research
- Advanced pattern recognition

**For Core (Limited Access):**
- Essential intelligence briefs (allocated monthly)
- Strategic intro recommendations
- Basic opportunity detection
- Standard insights

The ARC™ capabilities model ensures each tier receives appropriate access while maintaining the premium value of Inner Circle membership.

## 5) Strategic Intros AI – Matching Design (V1)

Signals used:
- Profile vectors (industry, stage, model), *goals* and *offers*, geo preference, deal intents.
- Reciprocity: both parties' *gives* ↔ *needs* alignment.
- Quality signals: Impact Score, accepted-intro rate, past wins.

Algorithm (v1):
1. Pre-filter: remove prior connects/declines + identical industries unless complementary.
2. Score = weighted sum: need/offer (0.45) + stage/industry comp (0.25) + geo (0.05) + impact tier (0.15) + historical acceptance (0.10).
3. Diversity constraint: ensure 3 intros span different industries/angles.
4. Explanations: 2-3 sentence "Why this matters" generated from matched attributes.

Delivery: Weekly via in-app + email, accept/pass. If both accept → automated intro email.

## 6) Impact Score & Value Exchange

- **Impact Score** from: fulfilled requests, helpful replies, accepted intros, endorsements, hosting office hours.
- Anti-gaming: rate-limits, duplicate filtering, mutual confirmations, admin anomaly alerts.
- **Value Exchange**: *Asks* and *Offers*; matching by tags + Impact Score weighting. Option: consume points to post *priority asks*.
- Perks by tier: visibility boost, weekly intro quota, early access to features.

## 7) Conversion Strategy (Landing → Application)

- 3s hook: *"The World's First AI-Enhanced Private Network."*
- 8s clarity: One sentence on ARC™ AI + measurable outcomes.
- 30s action: Request invitation (short, high-signal inputs).
- Ethical triggers: real exclusivity (curation), authority (elite members), specificity (outcomes).
- Mobile-first, sub-2s LCP; clear tier differentiation; single CTA.

## 8) Feature Access Model

Replaced date-gated launch system with tier-based capabilities (`lib/features.ts`):

```typescript
interface Capabilities {
  arcAccess: 'none' | 'limited' | 'full';
  messaging: boolean;
  events: boolean;
  directory: boolean;
  strategicIntros: boolean;
  valueExchange: boolean;
  dealFlow: boolean;
  expertSessions: boolean;
  priorityMatching: boolean;
  conciergeService: boolean;
}
```

**Inner Circle:** All capabilities enabled, `arcAccess: 'full'`
**Core:** Limited ARC, no deal flow/concierge, `arcAccess: 'limited'`

## 9) Payment System

Canonical endpoints (`lib/payments.ts`):
- `/api/payments/flash-briefing` - One-time $297 Flash Briefing
- `/api/payments/subscription/checkout` - Subscription for Inner Circle or Core

All payment logic centralized with:
- Tier-to-price mapping
- Metadata building (userId, tier, isFoundingMember, invite tracking)
- Success/cancel URL generation
- Error normalization
- Environment validation

Stripe webhooks remain unchanged for subscription event handling.

## 10) Admin & Growth

- Bulk invites + per-campaign analytics (open/click/signup/quality).
- Export CSVs; top-of-funnel and cohort views.
- Tier-based capabilities allow flexible feature rollout.
- Seed content: spotlight "Wins of the Week"; concierge hand-curated intros until network self-primes.

## 11) Risks & Mitigations

- **Cold start:** concierge matching + manual curation first 4-6 weeks.
- **Quality risk:** manual approvals; verification via LinkedIn/company revenue; optional proof later.
- **Abuse:** RLS + rate limits; email verification; anomaly detection on Impact events.
- **Perception:** keep copy specific and quiet; avoid over-claiming.
- **Tier confusion:** Clear differentiation between Inner Circle and Core; ARC™ access as primary differentiator.

## 12) What We've Shipped (v2)

- Premium landing with tier differentiation (Inner Circle/Core).
- Tier-based capabilities model; no date-gated features.
- Strategic Intros page + SQL schema + weekly generation.
- Value Exchange marketplace + Impact Score ledger.
- Admin bulk invites + analytics.
- Canonical payment endpoints with consolidated logic.
- Tests for critical flows; updated docs.

## 13) Retired Systems

- **Founding 50 Countdown:** Replaced with ongoing Inner Circle/Core tiers
- **Date-gated Launch:** Replaced with tier-based capabilities model
- **Waitlist System:** Replaced with direct invite system

See `archive/` for legacy documentation.
