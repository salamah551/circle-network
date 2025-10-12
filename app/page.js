'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Shield,
  Lock,
  Crown,
  ArrowRight,
  Star,
  Sparkles,
  CheckCircle,
  Users,
  Briefcase,
  Handshake,
} from 'lucide-react';
import { LAUNCH_DATE, isLaunched, msUntilLaunch } from '@/lib/launch-config';

const foundingPrice = process.env.NEXT_PUBLIC_FOUNDING_PRICE || '497';
const premiumPrice  = process.env.NEXT_PUBLIC_PREMIUM_PRICE  || '997';
const elitePrice    = process.env.NEXT_PUBLIC_ELITE_PRICE    || '1997';
const foundersCap   = process.env.NEXT_PUBLIC_FOUNDERS_CAP   || '100';

function Countdown() {
  const [ms, setMs] = useState(msUntilLaunch());
  useEffect(() => {
    if (isLaunched()) return;
    const id = setInterval(() => setMs(msUntilLaunch()), 1000);
    return () => clearInterval(id);
  }, []);
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return (
    <span className="font-mono text-sm text-white/70">
      {d}d {h}h {m}m {sec}s
    </span>
  );
}

export default function Landing() {
  const launched = isLaunched();

  return (
    <main className="min-h-screen bg-black text-white">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        {/* Luxury gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="h-[60vh] bg-gradient-to-b from-amber-900/10 via-black to-black" />
          <div
            aria-hidden
            className="absolute -top-24 -right-24 w-[600px] h-[600px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(closest-side, rgba(212,175,55,0.12), rgba(0,0,0,0))' }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-16 pb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-amber-300 text-xs">
            <Lock className="w-3.5 h-3.5" />
            Invitation-only
          </div>

          <h1 className="mt-6 text-4xl md:text-6xl font-semibold leading-tight">
            The definitive private network for <span className="text-amber-400">elite founders</span> & investors.
          </h1>

          <p className="mt-4 text-white/70 max-w-2xl">
            Curated, strategic introductions—not noise. Save time, unlock deal flow, and protect your reputation in a trusted, high-signal environment.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 text-black font-medium px-5 py-3 hover:bg-amber-400"
            >
              Request Access <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/billing"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 border border-white/10 px-5 py-3 hover:bg-zinc-800"
            >
              Founding pricing
            </Link>
          </div>

          {/* Scarcity + Launch */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/70">
            <span>Founding cohort capped at <span className="text-amber-300 font-medium">{foundersCap}</span> members.</span>
            {!launched ? (
              <>
                <span className="text-white/30">•</span>
                <span>Unlocks on {LAUNCH_DATE.toUTCString()}</span>
                <span className="text-white/30">•</span>
                <Countdown />
              </>
            ) : (
              <>
                <span className="text-white/30">•</span>
                <span>Now open</span>
              </>
            )}
          </div>

          {/* Trust bar */}
          <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-white/70">
            <div className="inline-flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              No ads. No data resale.
            </div>
            <div className="inline-flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              Curated membership
            </div>
            <div className="inline-flex items-center gap-2">
              <Handshake className="w-4 h-4 text-amber-400" />
              Mutual-opt-in intros
            </div>
          </div>
        </div>
      </section>

      {/* ===== VALUE PROPS ===== */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <Crown className="w-6 h-6 text-amber-400" />
            <h3 className="mt-3 text-xl font-semibold">Strategic Intros, Curated Weekly</h3>
            <p className="mt-2 text-white/70">
              Exactly 3 high-value introductions per week—AI-assisted, human-approved. Meet the right people at the right moment.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h3 className="mt-3 text-xl font-semibold">Impact Score & Value Exchange</h3>
            <p className="mt-2 text-white/70">
              Earn reputation through contribution. Exchange expertise via asks/offers. Quality rises; noise disappears.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <Shield className="w-6 h-6 text-amber-400" />
            <h3 className="mt-3 text-xl font-semibold">Privacy & Integrity, by Design</h3>
            <p className="mt-2 text-white/70">
              No ads. No data resale. Member curation and zero-tolerance on spam. You’re here for outcomes, not feeds.
            </p>
          </div>
        </div>
      </section>

      {/* ===== PROOF OF INNOVATION ===== */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold mb-6">Why this isn’t “LinkedIn for the wealthy.”</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-950 to-black p-6">
            <h3 className="text-lg font-semibold">Strategic Intros AI</h3>
            <p className="mt-2 text-white/70">
              Intent-based matching that prioritizes mutual value, stage fit, and adjacency—delivered as weekly, actionable opportunities.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-950 to-black p-6">
            <h3 className="text-lg font-semibold">Impact Score</h3>
            <p className="mt-2 text-white/70">
              Reputation you can’t buy. Earn status by helping others: intros, advice, contributions. Visibility and privileges scale with impact.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-950 to-black p-6">
            <h3 className="text-lg font-semibold">Value Exchange</h3>
            <p className="mt-2 text-white/70">
              A frictionless marketplace of “asks” and “offers,” enabling focused, high-value exchanges without noise or spam.
            </p>
          </div>
        </div>
      </section>

      {/* ===== WHO WE INVITE ===== */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold mb-4">Who we invite</h2>
        <p className="text-white/70 mb-6">
          Membership is curated for high-signal operators, founders, and investors. Self-attested credentials are reviewed by our team to preserve quality.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h3 className="font-semibold">Founders & CEOs</h3>
            <ul className="mt-3 space-y-2 text-white/70 text-sm">
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-amber-400 mt-0.5" /> 7–9 figure revenue or clear trajectory</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-amber-400 mt-0.5" /> Tech, finance, real estate, consumer, healthcare</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-amber-400 mt-0.5" /> Seeking strategic partners or exec hires</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h3 className="font-semibold">Investors</h3>
            <ul className="mt-3 space-y-2 text-white/70 text-sm">
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-amber-400 mt-0.5" /> Active angels, family offices, or funds</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-amber-400 mt-0.5" /> Clear thesis and track record</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-amber-400 mt-0.5" /> Open to warm, mutual-fit intros</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h3 className="font-semibold">Operators & Advisors</h3>
            <ul className="mt-3 space-y-2 text-white/70 text-sm">
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-amber-400 mt-0.5" /> VP+ leaders with scarce expertise</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-amber-400 mt-0.5" /> Can offer meaningful help (GTM, hiring, M&A)</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-amber-400 mt-0.5" /> Referred or vetted via outcomes</li>
            </ul>
          </div>
        </div>
        <p className="text-white/60 text-sm mt-4">
          We do not guarantee admission. Applications are evaluated on fit, intent, and contribution potential.
        </p>
      </section>

      {/* ===== WHAT'S LIVE VS COMING ===== */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold mb-6">What’s available today — and what’s next</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h3 className="text-lg font-semibold">Live now</h3>
            <ul className="mt-3 space-y-2 text-white/70 text-sm">
              <li>Invitation/request access workflow</li>
              <li>Curated member profiles & directory (approved members)</li>
              <li>Founding membership & billing via Stripe</li>
              <li>Admin-led bulk invite campaigns (SendGrid)</li>
              <li>Platform privacy: no ads, no data resale</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h3 className="text-lg font-semibold">Unlocks at launch</h3>
            <ul className="mt-3 space-y-2 text-white/70 text-sm">
              <li>Strategic Intros AI (weekly, mutual-value matches)</li>
              <li>Impact Score (reputation via contribution)</li>
              <li>Value Exchange (asks/offers, matched discovery)</li>
            </ul>
            <h4 className="mt-4 font-semibold">Coming soon (paid add-ons)</h4>
            <ul className="mt-2 space-y-2 text-white/70 text-sm">
              <li>AI Competitive Intelligence</li>
              <li>Reputation Protection</li>
              <li>Exclusive Deal Flow</li>
            </ul>
            <p className="text-white/60 text-xs mt-3">
              Add-ons are optional and billed separately to preserve alignment and exclusivity.
            </p>
          </div>
        </div>
      </section>

      {/* ===== WHY JOIN NOW ===== */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold mb-4">Why join now</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h3 className="font-semibold">Founding price lock</h3>
            <p className="text-white/70 text-sm mt-2">
              Early members lock in founding rates for as long as their subscription remains active.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h3 className="font-semibold">Capped cohort</h3>
            <p className="text-white/70 text-sm mt-2">
              Limited seats to preserve quality. Once the founding cohort is full, applications move to a waitlist.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h3 className="font-semibold">Early access</h3>
            <p className="text-white/70 text-sm mt-2">
              Priority access to new features and member-only intelligence services as they roll out.
            </p>
          </div>
        </div>
      </section>

      {/* ===== COMMITMENTS / ETHICS ===== */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold mb-4">Our commitments</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h3 className="font-semibold">Privacy & integrity</h3>
            <ul className="mt-3 space-y-2 text-white/70 text-sm">
              <li>No ads. No data resale. Ever.</li>
              <li>Manual review of new members to maintain signal.</li>
              <li>Zero-spam policy and mutual-opt-in introductions.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h3 className="font-semibold">Member-first terms</h3>
            <ul className="mt-3 space-y-2 text-white/70 text-sm">
              <li>Cancel anytime in the Billing Portal; no lock-in.</li>
              <li>Founding price remains while active; upgrades optional.</li>
              <li>Clear scoping: add-on intelligence services billed separately.</li>
            </ul>
          </div>
        </div>
        <p className="text-white/60 text-xs mt-4">
          We do not guarantee business outcomes, investment performance, or specific introductions. See our Terms, Privacy Policy, and Disclaimers for details.
        </p>
      </section>

      {/* ===== HOW IT WORKS (simple 3-step) ===== */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold mb-6">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <Briefcase className="w-6 h-6 text-amber-400" />
            <h3 className="mt-3 font-semibold">1) Apply & get approved</h3>
            <p className="text-white/70 text-sm mt-2">Request access, share your focus and goals. We review for fit and signal.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <Users className="w-6 h-6 text-amber-400" />
            <h3 className="mt-3 font-semibold">2) Set preferences</h3>
            <p className="text-white/70 text-sm mt-2">Define who you want to meet and what you can offer. Reduce noise. Increase serendipity.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <Handshake className="w-6 h-6 text-amber-400" />
            <h3 className="mt-3 font-semibold">3) Receive weekly intros</h3>
            <p className="text-white/70 text-sm mt-2">Accept mutual-fit matches. Declines are private. Momentum compounds weekly.</p>
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold mb-6">Founding pricing (limited cohort)</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-amber-500/30 bg-zinc-950 p-6">
            <div className="text-amber-300 text-sm mb-2">Founding</div>
            <div className="text-3xl font-bold">${foundingPrice}/mo</div>
            <ul className="mt-4 space-y-2 text-white/70 text-sm">
              <li>Strategic Intros AI (3/week)</li>
              <li>Impact Score & Value Exchange</li>
              <li>Invitation-only directory</li>
              <li>Priority support</li>
            </ul>
            <Link
              href="/apply"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500 text-black font-medium px-5 py-3 hover:bg-amber-400"
            >
              Apply now <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-white/60 text-xs mt-3">
              Founding price locks while active. Limited seats to preserve quality.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <div className="text-white/60 text-sm mb-2">Premium</div>
            <div className="text-3xl font-bold">${premiumPrice}/mo</div>
            <ul className="mt-4 space-y-2 text-white/70 text-sm">
              <li>Everything in Founding</li>
              <li>Higher visibility & priority intros</li>
              <li>Early access to one add-on</li>
            </ul>
            <Link
              href="/apply"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 border border-white/10 px-5 py-3 hover:bg-zinc-800"
            >
              Request access
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <div className="text-white/60 text-sm mb-2">Elite</div>
            <div className="text-3xl font-bold">${elitePrice}/mo</div>
            <ul className="mt-4 space-y-2 text-white/70 text-sm">
              <li>5 strategic intros/week</li>
              <li>Concierge matching</li>
              <li>Includes one intelligence add-on</li>
            </ul>
            <Link
              href="/apply"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 border border-white/10 px-5 py-3 hover:bg-zinc-800"
            >
              Join waitlist
            </Link>
          </div>
        </div>
        <p className="text-white/60 text-sm mt-4">
          Add-on intelligence services are optional and billed separately. Cancel anytime in the Billing Portal.
        </p>
      </section>

      {/* ===== FAQ (compact, ethical) ===== */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold mb-6">FAQ</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h3 className="font-semibold">Do you guarantee introductions or results?</h3>
            <p className="text-white/70 text-sm mt-2">
              No. We optimize for fit and momentum, but outcomes depend on your goals and engagement.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h3 className="font-semibold">How do you protect privacy?</h3>
            <p className="text-white/70 text-sm mt-2">
              We don’t sell data or run ads. Profiles are visible within the network; introductions are mutual-opt-in.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h3 className="font-semibold">Are the intelligence services included?</h3>
            <p className="text-white/70 text-sm mt-2">
              They’re optional paid add-ons. Founding members get early access when they launch.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h3 className="font-semibold">Who reviews applications?</h3>
            <p className="text-white/70 text-sm mt-2">
              Our team evaluates fit, intent, and contribution potential to preserve a high-signal community.
            </p>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/10 py-10 text-center text-white/60">
        <div className="space-x-4">
          <a href="/legal/terms" className="hover:text-white">Terms</a>
          <span>·</span>
          <a href="/legal/privacy" className="hover:text-white">Privacy</a>
          <span>·</span>
          <a href="/legal/disclaimer" className="hover:text-white">Disclaimers</a>
        </div>
        <div className="mt-2">© {new Date().getFullYear()} The Circle Network — All rights reserved.</div>
      </footer>
    </main>
  );
}
