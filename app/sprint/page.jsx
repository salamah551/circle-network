import Link from 'next/link';
import { ArrowRight, CheckCircle, Target, Calendar, FileText, Users } from 'lucide-react';

export const metadata = {
  title: '30-Day Insight Sprint | Circle Network',
  description: 'Deep dive into your competitive landscape with our 30-day pilot program.',
};

export default function SprintPage() {
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
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-400 font-medium">Pilot Program</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            30-Day Insight Sprint
          </h1>
          
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-8">
            A comprehensive deep-dive into your competitive landscape. Perfect for strategic planning, fundraising prep, or launching new initiatives.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-400">$3,000</div>
              <div className="text-sm text-zinc-500">One-time investment</div>
            </div>
            <div className="hidden sm:block text-2xl text-zinc-700">•</div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">30 Days</div>
              <div className="text-sm text-zinc-500">Start to finish</div>
            </div>
          </div>

          <Link
            href="/apply"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl"
          >
            Start Your Sprint
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* What You Get */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-8 text-center">What's Included</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Week 1: Discovery & Setup</h3>
                <p className="text-zinc-400">
                  Kickoff call to understand your business, competitors, and strategic goals. We define tracking parameters and intelligence priorities.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Weeks 2-3: Deep Research</h3>
                <p className="text-zinc-400">
                  Comprehensive competitive analysis including product positioning, pricing strategies, marketing approaches, key hires, funding activity, and market movements.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Week 4: Report & Strategy Session</h3>
                <p className="text-zinc-400">
                  Detailed written report with strategic recommendations, plus a 90-minute strategy session to review findings and develop action plans.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Ongoing: 30-Day Email Support</h3>
                <p className="text-zinc-400">
                  Questions after the sprint? We provide 30 days of email support to help you implement the recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deliverables */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-6">Your Deliverables</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Competitive landscape analysis (5-10 competitors)',
              'Pricing & positioning comparison matrix',
              'Marketing & messaging analysis',
              'Product feature gap analysis',
              'Key personnel movements & hiring trends',
              'Funding & financial activity tracking',
              'Market trend identification',
              'Strategic recommendations report',
              'Weekly intelligence briefs (4 total)',
              '90-minute strategy session recording',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Perfect For</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            The 30-Day Insight Sprint is ideal for specific strategic moments when you need deep competitive intelligence quickly.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-2">Fundraising Prep</h3>
            <p className="text-sm text-zinc-400">
              Arm yourself with competitive intelligence before investor meetings. Know exactly how you stack up.
            </p>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-2">Product Launch</h3>
            <p className="text-sm text-zinc-400">
              Understand the competitive landscape before launching a new product or entering a new market.
            </p>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-2">Strategic Planning</h3>
            <p className="text-sm text-zinc-400">
              Get comprehensive intelligence for annual planning, M&A evaluation, or strategic pivots.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border-2 border-amber-500/30 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-zinc-400 mb-8 max-w-2xl mx-auto">
            Limited to 3 sprints per month to ensure quality. Book your spot now.
          </p>
          
          <Link
            href="/apply"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl"
          >
            Start Your 30-Day Sprint
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <p className="text-sm text-zinc-500 mt-6">
            Have questions? <Link href="/contact" className="text-amber-400 hover:text-amber-300">Contact us</Link> for a consultation.
          </p>
        </div>
      </section>

      <div className="h-24" />
    </div>
  );
}
