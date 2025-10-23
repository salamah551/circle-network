import Link from 'next/link';
import { ArrowRight, CheckCircle, Shield, Clock, Users, Zap, TrendingUp } from 'lucide-react';

export const metadata = {
  title: 'Intelligence Membership | Circle Network',
  description: 'Ongoing competitive intelligence with a dedicated analyst and community access.',
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
              href="/apply"
              className="text-sm bg-amber-500 text-black font-semibold px-5 py-2 rounded-lg hover:bg-amber-400 transition-all"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-400 font-medium">Premium Membership</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Intelligence Membership
          </h1>
          
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Never be blindsided by your competition again. Get continuous intelligence monitoring, strategic analysis, and community access with a dedicated analyst.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-400">$8,500</div>
              <div className="text-sm text-zinc-500">per month</div>
            </div>
            <div className="hidden sm:block text-2xl text-zinc-700">•</div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-sm text-zinc-500">Monitoring</div>
            </div>
          </div>

          <Link
            href="/apply"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl"
          >
            Apply for Membership
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Core Features */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-8 text-center">What's Included</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Dedicated Intelligence Analyst</h3>
                <p className="text-zinc-400">
                  Your own analyst who learns your business, tracks your competitors, and proactively surfaces insights relevant to your strategy.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">24/7 Competitive Monitoring</h3>
                <p className="text-zinc-400">
                  Continuous tracking of competitor moves including product launches, pricing changes, key hires, funding rounds, and market shifts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Real-Time Alerts</h3>
                <p className="text-zinc-400">
                  Get notified immediately when significant competitive moves happen. No more discovering major changes weeks later.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Circle Network Community Access</h3>
                <p className="text-zinc-400">
                  Full access to the Circle Network community during your engagement. Connect with high-achievers, get introductions, and tap into collective intelligence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Level Agreements */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-amber-500/10 to-emerald-500/10 border border-amber-500/20 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-6">Our Commitments to You</h2>
          
          <div className="space-y-4">
            {[
              {
                sla: 'Weekly Intelligence Briefing',
                description: 'Delivered every Monday by 9 AM ET with the week\'s most important competitive moves'
              },
              {
                sla: '< 2 Hour Alert Response',
                description: 'Critical competitive moves flagged within 2 hours of detection during business hours'
              },
              {
                sla: 'Monthly Strategy Session',
                description: '60-minute video call to review trends, answer questions, and adjust monitoring priorities'
              },
              {
                sla: 'Unlimited Slack/Email Access',
                description: 'Direct line to your analyst for ad-hoc questions and deep-dive requests'
              },
              {
                sla: 'Quarterly Deep-Dive Reports',
                description: 'Comprehensive competitive analysis every quarter with strategic recommendations'
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-black/40 rounded-lg p-4">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white mb-1">{item.sla}</div>
                  <div className="text-sm text-zinc-400">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Track */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Comprehensive Monitoring</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            We track everything that matters to your competitive position
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-3 text-amber-400">Product & Market Moves</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>New product launches and feature releases</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>Pricing and packaging changes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>Marketing campaigns and positioning shifts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>Partnership and integration announcements</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-3 text-purple-400">Company Intelligence</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>Funding rounds and financial activity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>Key hires and leadership changes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>Customer wins and case studies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>Industry trends and market shifts</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Built For</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            The Intelligence Membership is for leaders who can't afford to be caught off-guard
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-2">CEOs & Founders</h3>
            <p className="text-sm text-zinc-400">
              Stay ahead of competitors while focusing on building your company. We watch the market so you don't have to.
            </p>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-2">Product Leaders</h3>
            <p className="text-sm text-zinc-400">
              Know what features competitors are shipping, how they're positioning, and what customers are saying.
            </p>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-2">GTM Executives</h3>
            <p className="text-sm text-zinc-400">
              Track competitor pricing, messaging, and sales tactics. Stay one step ahead in every deal.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border-2 border-amber-500/30 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Never Be Blindsided Again?</h2>
          <p className="text-lg text-zinc-400 mb-8 max-w-2xl mx-auto">
            Limited to 10 active memberships. Apply now to secure your spot.
          </p>
          
          <Link
            href="/apply"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl"
          >
            Apply for Membership
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <p className="text-sm text-zinc-500 mt-6">
            Questions? <Link href="/contact" className="text-amber-400 hover:text-amber-300">Schedule a consultation</Link> to discuss your needs.
          </p>
        </div>
      </section>

      <div className="h-24" />
    </div>
  );
}
