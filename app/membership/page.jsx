import Link from 'next/link';
import { ArrowRight, CheckCircle, Shield, Clock, Users, Zap, TrendingUp, Crown } from 'lucide-react';

export const metadata = {
  title: 'Membership Pricing | Circle Network',
  description: 'Choose from Core, Pro, or Elite membership tiers with ARC intelligence and BriefPoint meeting briefs.',
};

export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold hover:text-amber-400 transition-colors">
              ← Circle Network
            </Link>
            <Link
              href="/subscribe"
              className="text-sm bg-amber-500 text-black font-semibold px-5 py-2 rounded-lg hover:bg-amber-400 transition-all"
            >
              Subscribe Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-400 font-medium">Membership Tiers</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Choose Your Level of Access
          </h1>
          
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Never walk into a meeting or decision cold again. Get ARC™ intelligence monitoring and BriefPoint meeting briefs tailored to your needs.
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Core Tier */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4">Core</h3>
            <div className="mb-6">
              <div className="text-4xl font-bold text-white mb-2">$179</div>
              <div className="text-zinc-400 text-sm">per month</div>
              <div className="text-emerald-400 text-sm mt-2">$143/mo billed annually (−20%)</div>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm">10 ARC™ requests per month</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm">5 BriefPoint briefs per day (email delivery)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Community access</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Member directory</span>
              </li>
            </ul>

            <Link
              href="/subscribe"
              className="block w-full text-center px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-all"
            >
              Get Started
            </Link>
          </div>

          {/* Pro Tier - Highlighted */}
          <div className="relative bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-2 border-amber-500/50 rounded-2xl p-8 transform md:scale-105">
            <div className="absolute top-4 right-4 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full">
              POPULAR
            </div>
            <h3 className="text-2xl font-bold mb-4 text-amber-400">Pro</h3>
            <div className="mb-6">
              <div className="text-4xl font-bold text-white mb-2">$299</div>
              <div className="text-zinc-400 text-sm">per month</div>
              <div className="text-emerald-400 text-sm mt-2">$239/mo billed annually (−20%)</div>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-semibold">30 ARC™ requests per month</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-semibold">10 BriefPoint briefs per day (email + Slack)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Everything in Core</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Priority support</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Advanced integrations</span>
              </li>
            </ul>

            <Link
              href="/subscribe"
              className="block w-full text-center px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-lg transition-all shadow-xl"
            >
              Get Started
            </Link>
          </div>

          {/* Elite Tier */}
          <div className="bg-zinc-900 border border-purple-500/50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4 text-purple-400">Elite</h3>
            <div className="mb-6">
              <div className="text-4xl font-bold text-white mb-2">$499</div>
              <div className="text-zinc-400 text-sm">per month</div>
              <div className="text-emerald-400 text-sm mt-2">$399/mo billed annually (−20%)</div>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-semibold">50 ARC™ requests per month</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-semibold">20 BriefPoint briefs per day (email + Slack)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Everything in Pro</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm">White-glove concierge</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Dedicated account manager</span>
              </li>
            </ul>

            <Link
              href="/subscribe"
              className="block w-full text-center px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Founding 100 Promo */}
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-emerald-500/10 to-amber-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-4">
            <Crown className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-bold">FOUNDING 100 EXCLUSIVE</span>
          </div>
          <h3 className="text-2xl font-bold mb-3">Lock in Pro Features Forever</h3>
          <p className="text-zinc-300 mb-4">
            First 100 members get Pro tier features (30 ARC requests/month, 10 BriefPoint briefs/day) for just <span className="text-emerald-400 font-bold">$249/month</span>
          </p>
          <p className="text-sm text-zinc-400 mb-6">
            24-month price lock • Limited to first 100 sign-ups • Never available again
          </p>
          <Link
            href="/subscribe"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-amber-500 text-black font-bold text-lg rounded-xl hover:from-emerald-400 hover:to-amber-400 transition-all shadow-xl"
          >
            Claim Your Founding Spot
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* What's Included */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Powered by Two Core Services</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Every membership tier includes access to ARC™ and BriefPoint—your intelligence advantage
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* ARC */}
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-2xl p-8">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-amber-400">ARC™ Intelligence</h3>
            <p className="text-zinc-300 mb-6">
              On-demand competitive intelligence, market research, and strategic analysis. Submit requests and get expert-curated insights within 24 hours.
            </p>
            <div className="space-y-2 text-sm text-zinc-400">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                <span>Competitive intelligence monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                <span>Market research and analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                <span>Strategic opportunity identification</span>
              </div>
            </div>
          </div>

          {/* BriefPoint */}
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-2xl p-8">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-purple-400">BriefPoint</h3>
            <p className="text-zinc-300 mb-6">
              Never walk into a meeting cold again. Automated meeting briefs delivered to your inbox with context, talking points, and strategic angles for every conversation.
            </p>
            <div className="space-y-2 text-sm text-zinc-400">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                <span>Pre-meeting intelligence briefs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                <span>Sunday weekly prep packs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                <span>T-120 minute pre-meeting alerts</span>
              </div>
            </div>
            <Link
              href="/briefpoint"
              className="inline-flex items-center gap-2 mt-6 text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors"
            >
              Learn more about BriefPoint
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Tier Comparison */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Compare Tiers</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            All tiers include community access, member directory, and our core platform features
          </p>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold">Feature</th>
                  <th className="text-center p-4 text-sm font-semibold">Core</th>
                  <th className="text-center p-4 text-sm font-semibold text-amber-400">Pro</th>
                  <th className="text-center p-4 text-sm font-semibold text-purple-400">Elite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                <tr>
                  <td className="p-4 text-sm">ARC™ Requests/Month</td>
                  <td className="text-center p-4 text-sm">10</td>
                  <td className="text-center p-4 text-sm font-semibold text-amber-400">30</td>
                  <td className="text-center p-4 text-sm font-semibold text-purple-400">50</td>
                </tr>
                <tr className="bg-zinc-900/50">
                  <td className="p-4 text-sm">BriefPoint Briefs/Day</td>
                  <td className="text-center p-4 text-sm">5 (email)</td>
                  <td className="text-center p-4 text-sm font-semibold text-amber-400">10 (email + Slack)</td>
                  <td className="text-center p-4 text-sm font-semibold text-purple-400">20 (email + Slack)</td>
                </tr>
                <tr>
                  <td className="p-4 text-sm">Response Time</td>
                  <td className="text-center p-4 text-sm">24 hours</td>
                  <td className="text-center p-4 text-sm font-semibold">12 hours</td>
                  <td className="text-center p-4 text-sm font-semibold">4 hours</td>
                </tr>
                <tr className="bg-zinc-900/50">
                  <td className="p-4 text-sm">Support Level</td>
                  <td className="text-center p-4 text-sm">Standard</td>
                  <td className="text-center p-4 text-sm font-semibold">Priority</td>
                  <td className="text-center p-4 text-sm font-semibold">White-glove</td>
                </tr>
                <tr>
                  <td className="p-4 text-sm">Slack Integration</td>
                  <td className="text-center p-4 text-sm">—</td>
                  <td className="text-center p-4 text-sm"><CheckCircle className="w-5 h-5 text-amber-400 inline" /></td>
                  <td className="text-center p-4 text-sm"><CheckCircle className="w-5 h-5 text-purple-400 inline" /></td>
                </tr>
                <tr className="bg-zinc-900/50">
                  <td className="p-4 text-sm">Account Manager</td>
                  <td className="text-center p-4 text-sm">—</td>
                  <td className="text-center p-4 text-sm">—</td>
                  <td className="text-center p-4 text-sm"><CheckCircle className="w-5 h-5 text-purple-400 inline" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-r from-amber-500/20 to-purple-500/20 border-2 border-amber-500/30 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Upgrade Your Intelligence?</h2>
          <p className="text-lg text-zinc-400 mb-8 max-w-2xl mx-auto">
            Choose your tier and start accessing ARC™ and BriefPoint today. All plans include 30-day money-back guarantee.
          </p>
          
          <Link
            href="/subscribe"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl"
          >
            Subscribe Now
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <p className="text-sm text-zinc-500 mt-6">
            Learn more about <Link href="/briefpoint" className="text-purple-400 hover:text-purple-300">BriefPoint</Link> or visit the <Link href="/dashboard" className="text-amber-400 hover:text-amber-300">member dashboard</Link>
          </p>
        </div>
      </section>

      <div className="h-24" />
    </div>
  );
}
