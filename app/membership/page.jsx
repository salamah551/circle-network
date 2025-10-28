import Link from 'next/link';
import { ArrowRight, CheckCircle, Shield, Crown } from 'lucide-react';

export const metadata = {
  title: 'The Founding 100 | Circle Network',
  description: 'Join an exclusive collective of 100 leaders with an annual contribution of $25,000.',
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
              Apply for Membership
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-400 font-medium">Founding Member Opportunity</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            The Founding 100
          </h1>
          
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-8">
            An exclusive private intelligence collective limited to 100 founding members. Access by nomination only.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-400">$25,000</div>
              <div className="text-sm text-zinc-500">Annual Contribution</div>
            </div>
            <div className="hidden sm:block text-2xl text-zinc-700">•</div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">100</div>
              <div className="text-sm text-zinc-500">Founding Members</div>
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

      {/* Value Proposition */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-amber-500/10 to-emerald-500/10 border-2 border-amber-500/30 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-6 text-center">About The Circle Network</h2>
          
          <div className="space-y-6 text-lg text-zinc-300 leading-relaxed">
            <p>
              Membership is currently limited to 100 founding members. The annual contribution is $25,000. 
              After the founding cohort is established, the doors will close, and the contribution level will 
              increase for future members.
            </p>
            
            <p>
              The Circle Network is a private intelligence collective where exceptional leaders share strategic insights, 
              create unprecedented opportunities, and leverage collective wisdom for competitive advantage.
            </p>

            <p>
              This is not a service—it's a membership in an exclusive community where access equals advantage.
            </p>
          </div>
        </div>
      </section>

      {/* Core Benefits */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Membership Benefits</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Private Intelligence Collective</h3>
                <p className="text-zinc-400">
                  Access exclusive intelligence and insights shared only within the network of 100 founding members.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Strategic Network Access</h3>
                <p className="text-zinc-400">
                  Connect with 99 other exceptional leaders across industries. Share insights, create partnerships, and leverage collective wisdom.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Crown className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Founding Member Status</h3>
                <p className="text-zinc-400">
                  Lifetime recognition as a founding member with privileged access and influence over the network's evolution.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Competitive Intelligence</h3>
                <p className="text-zinc-400">
                  Exclusive access to market intelligence, competitive insights, and strategic opportunities available only to members.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who Should Apply */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Who Should Apply</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            The Circle Network is for exceptional leaders who understand the value of strategic leverage
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-2">CEOs & Founders</h3>
            <p className="text-sm text-zinc-400">
              Leaders building companies who value strategic connections and collective intelligence.
            </p>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-2">Senior Executives</h3>
            <p className="text-sm text-zinc-400">
              C-level executives and senior leaders who make strategic decisions that shape their organizations.
            </p>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-2">Investors & Advisors</h3>
            <p className="text-sm text-zinc-400">
              High-level investors and advisors who leverage networks for deal flow and market intelligence.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border-2 border-amber-500/30 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join The Founding 100?</h2>
          <p className="text-lg text-zinc-400 mb-8 max-w-2xl mx-auto">
            Membership is limited to 100 founding members. Applications are reviewed by our membership committee.
          </p>
          
          <Link
            href="/apply"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl"
          >
            Apply for Membership
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <p className="text-sm text-zinc-500 mt-6">
            Questions about membership?{' '}
            <Link href="/contact" className="text-amber-400 hover:text-amber-300">Contact us</Link> to learn more.
          </p>
        </div>
      </section>

      <div className="h-24" />
    </div>
  );
}
