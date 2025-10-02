'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowRight, Check, Users, MessageSquare, Calendar, 
  Target, Sparkles, TrendingUp, Zap, X, Loader2
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [spotsLeft, setSpotsLeft] = useState(1000);

  useEffect(() => {
    loadMemberCount();
    
    // Exit intent detection
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !showExitPopup) {
        setShowExitPopup(true);
      }
    };
    
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  const loadMemberCount = async () => {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    setMemberCount(count || 0);
    setSpotsLeft(1000 - (count || 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsValidating(true);

    try {
      const response = await fetch('/api/auth/validate-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, inviteCode })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid invite code or email');
        setIsValidating(false);
        return;
      }

      // Send magic link
      const magicLinkResponse = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, inviteCode })
      });

      if (magicLinkResponse.ok) {
        router.push(`/welcome?email=${encodeURIComponent(email)}`);
      } else {
        setError('Failed to send magic link. Please try again.');
        setIsValidating(false);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-purple-500/10" />
        
        {/* Navigation */}
        <nav className="relative border-b border-white/10 bg-[#0A0F1E]/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">The Circle</span>
              </div>
              
              <a 
                href="/login"
                className="text-white/80 hover:text-white transition-colors text-sm"
              >
                Member Login
              </a>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Live counter badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-8">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-sm font-medium">
                {memberCount > 0 ? `${memberCount} founders already in The Circle` : 'Founding members now enrolling'}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Stop Networking Alone.<br/>
              <span className="bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">
                Build With 1,000 Founders
              </span><br/>
              Who've Been There.
            </h1>
            
            <p className="text-xl md:text-2xl text-white/70 mb-12 leading-relaxed max-w-3xl mx-auto">
              The Circle is where ambitious founders get introductions that matter, 
              advice that works, and partnerships that scale—without the noise of 
              LinkedIn or the awkwardness of cold DMs.
            </p>

            {/* CTA Form */}
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg"
                  />
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="INVITE CODE"
                    required
                    className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg uppercase"
                  />
                </div>
                
                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isValidating}
                  className="w-full px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      Lock In Founding Member Rate ($199/mo Forever)
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-white/60 text-sm mt-4">
                {spotsLeft > 0 ? (
                  <>⚡ {spotsLeft} founding member spots remaining at this price</>
                ) : (
                  <>Founding member rate available for limited time</>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Urgency Bar */}
      {spotsLeft > 0 && spotsLeft < 100 && (
        <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-y border-red-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-center gap-3 text-center">
              <Zap className="w-5 h-5 text-orange-400" />
              <p className="text-white font-medium">
                Only {spotsLeft} founding member spots left • Price increases to $249/mo at member #1,000
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Value Propositions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Value Prop 1 */}
          <div className="group">
            <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-white/10 rounded-2xl p-8 hover:border-emerald-500/30 transition-all">
              <Users className="w-12 h-12 text-emerald-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">
                Get Warm Intros to People Who Actually Matter
              </h3>
              <p className="text-white/70 text-lg mb-4">
                Forget scrolling LinkedIn for hours. Our member directory connects you with the exact founder who solved your problem last month. Real intros. Real conversations. Real results.
              </p>
              <p className="text-emerald-400 text-sm italic">
                "The intro I needed used to take 6 months of cold outreach. Here it took 6 hours."
              </p>
            </div>
          </div>

          {/* Value Prop 2 */}
          <div className="group">
            <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-white/10 rounded-2xl p-8 hover:border-purple-500/30 transition-all">
              <MessageSquare className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">
                Text-Like Conversations That Actually Lead Somewhere
              </h3>
              <p className="text-white/70 text-lg mb-4">
                No more "happy to chat" messages that go nowhere. Circle members respond in under 2 hours average because everyone here is serious about helping each other win.
              </p>
              <p className="text-purple-400 text-sm italic">
                "Finally, a place where people don't just say they'll help—they actually do."
              </p>
            </div>
          </div>

          {/* Value Prop 3 */}
          <div className="group">
            <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-white/10 rounded-2xl p-8 hover:border-blue-500/30 transition-all">
              <Target className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">
                Post What You Need. Get Help By Lunch.
              </h3>
              <p className="text-white/70 text-lg mb-4">
                Need a designer intro? Looking for your first sales hire? Want advice on pricing? Post it by 9am, get 5+ qualified responses by noon. Our members actually show up.
              </p>
              <p className="text-blue-400 text-sm italic">
                "I posted a question at 8am. Had 7 thoughtful replies by 10am. This is different."
              </p>
            </div>
          </div>

          {/* Value Prop 4 */}
          <div className="group">
            <div className="bg-gradient-to-br from-yellow-500/10 to-transparent border border-white/10 rounded-2xl p-8 hover:border-yellow-500/30 transition-all">
              <Calendar className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">
                Monthly Events Where Real Deals Happen
              </h3>
              <p className="text-white/70 text-lg mb-4">
                Not another awkward networking event. Intimate gatherings (max 15 people) with founders at your stage. Real conversations. Real connections. Real outcomes.
              </p>
              <p className="text-yellow-400 text-sm italic">
                "These aren't networking events. They're where my next co-founder is sitting."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Founder's Letter */}
      <div className="bg-gradient-to-br from-emerald-500/5 to-purple-500/5 border-y border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">A Letter From The Founder</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-emerald-400 to-purple-400 mx-auto" />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12">
            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-white/80 text-lg leading-relaxed mb-6">
                Hey, I'm Nadeem.
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                I've been exactly where you are right now.
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                Staring at LinkedIn, wondering if that cold DM will ever get a response. Joining Slack groups that feel like ghost towns. Going to "networking events" where everyone's looking past you for someone more important.
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                Building a company is the loneliest thing I've ever done. And I kept thinking: "There has to be a better way to connect with people who actually get it."
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                So I built The Circle.
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                <strong className="text-white">Not another networking platform.</strong> Not another directory you browse once and forget about. Not another community where everyone's "too busy" to actually help.
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                <strong className="text-emerald-400">A real network of founders who show up for each other.</strong>
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                Here's what makes The Circle different:
              </p>

              <ul className="text-white/80 text-lg leading-relaxed mb-6 space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                  <span><strong className="text-white">We're curated.</strong> Every member is personally reviewed. No tire-kickers. No "just exploring." Only people who are actually building.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                  <span><strong className="text-white">We're intimate.</strong> Capped at 1,000 members. Small enough that you actually get to know people. Big enough that someone always has the answer you need.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                  <span><strong className="text-white">We're active.</strong> Average response time under 2 hours. Monthly events that people actually attend. Introductions that actually happen.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                  <span><strong className="text-white">We're about outcomes.</strong> Not engagement metrics. Not vanity metrics. Real business wins. Deals closed. Hires made. Problems solved.</span>
                </li>
              </ul>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                I'm not going to promise you'll get your next investor from The Circle (though you might).
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                I'm not going to promise you'll find your co-founder here (though you might).
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                <strong className="text-white">What I will promise:</strong> If you show up—even just a little—you'll stop feeling like you're building alone.
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                You'll have people to text when you're stuck. People who actually reply. People who've been there and want to help you through it.
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                That's worth more than any feature list.
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                <strong className="text-emerald-400">The founding member window is real.</strong> First 1,000 members get $199/mo locked in forever. After that, it's $249/mo. No exceptions. No grandfather clauses if you leave and come back.
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                I'm not creating artificial scarcity. I genuinely want to keep The Circle small enough that it stays valuable. 1,000 committed founders who actually help each other beats 10,000 lurkers any day.
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                So if you're tired of building alone...
                <br />If you're ready to stop networking and start connecting...
                <br />If you want to be part of something that actually works...
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-8">
                <strong className="text-white">Join us.</strong>
              </p>

              <p className="text-white/80 text-lg leading-relaxed mb-6">
                See you inside,
              </p>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  N
                </div>
                <div>
                  <p className="text-white font-bold text-xl">Nadeem Asheh</p>
                  <p className="text-white/60">Founder, The Circle</p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-white/60 text-sm italic">
                  P.S. - Still not sure? I get it. That's why there's a 30-day money-back guarantee. 
                  Try it. If you don't get value, I'll refund you personally. No questions. No hard feelings. 
                  But I'm confident you'll see why this is different within your first week.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROI Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            The Math That Matters
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            At $199/month, The Circle needs to help you with just ONE thing to 10x your investment
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h4 className="text-lg font-bold text-white mb-2">One Key Hire</h4>
            <p className="text-3xl font-bold text-emerald-400 mb-2">$10,000+</p>
            <p className="text-white/60 text-sm">Found 2 months faster via intro</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h4 className="text-lg font-bold text-white mb-2">One Warm Investor Intro</h4>
            <p className="text-3xl font-bold text-purple-400 mb-2">$5,000+</p>
            <p className="text-white/60 text-sm">Market value of intro service</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h4 className="text-lg font-bold text-white mb-2">One Partnership Deal</h4>
            <p className="text-3xl font-bold text-blue-400 mb-2">$50,000+</p>
            <p className="text-white/60 text-sm">Average from our network</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h4 className="text-lg font-bold text-white mb-2">Peace of Mind</h4>
            <p className="text-3xl font-bold text-yellow-400 mb-2">Priceless</p>
            <p className="text-white/60 text-sm">Knowing you're not alone</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-purple-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center">
          <p className="text-2xl text-white/90 mb-4">
            <strong className="text-white">Bottom line:</strong> You're not paying for a networking site.
          </p>
          <p className="text-xl text-emerald-400 font-bold">
            You're paying for outcomes. And our members are seeing them.
          </p>
        </div>
      </div>

      {/* What You're Getting */}
      <div className="bg-white/5 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                What You are Actually Getting
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Average Response Time: Under 2 Hours</h4>
                    <p className="text-white/60">When you post a question or request</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Curated Network of Builders</h4>
                    <p className="text-white/60">Every member personally reviewed and approved</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Monthly In-Person & Virtual Events</h4>
                    <p className="text-white/60">Where real relationships and deals happen</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Real Relationships, Real Outcomes</h4>
                    <p className="text-white/60">Not vanity metrics, actual business wins</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">The Difference?</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-red-400">
                  <X className="w-5 h-5 flex-shrink-0" />
                  <span>Where people join, lurk, and disappear</span>
                </div>
                <div className="flex items-center gap-3 text-red-400">
                  <X className="w-5 h-5 flex-shrink-0" />
                  <span>Where "networking" means collecting contacts</span>
                </div>
                <div className="flex items-center gap-3 text-red-400">
                  <X className="w-5 h-5 flex-shrink-0" />
                  <span>Where everyone's too busy to actually help</span>
                </div>
              </div>

              <div className="w-full h-px bg-white/20 my-6" />

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-emerald-400">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">We are curated, committed, and active</span>
                </div>
                <div className="flex items-center gap-3 text-emerald-400">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">People actually show up and help</span>
                </div>
                <div className="flex items-center gap-3 text-emerald-400">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">Real friendships that drive real wins</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Questions? We have Got Answers.</h2>
        </div>

        <div className="space-y-6">
          <details className="bg-white/5 border border-white/10 rounded-xl p-6 group">
            <summary className="text-xl font-bold text-white cursor-pointer list-none flex items-center justify-between">
              Is this just another LinkedIn?
              <ArrowRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="text-white/70 mt-4 leading-relaxed">
              Not even close. LinkedIn is broadcast mode—spray and pray. The Circle is peer-to-peer, curated, and intimate. Think of it as your founder WhatsApp group, but with 1,000 people who can actually help you. Real conversations. Real relationships. Real outcomes.
            </p>
          </details>

          <details className="bg-white/5 border border-white/10 rounded-xl p-6 group">
            <summary className="text-xl font-bold text-white cursor-pointer list-none flex items-center justify-between">
              What if I don't have time for another platform?
              <ArrowRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="text-white/70 mt-4 leading-relaxed">
              The Circle is designed for busy founders. No pressure to be online 24/7. Post a request when you need help. Check in when you have time. Many members spend less than 30 minutes per week and still make valuable connections. It's about quality, not quantity.
            </p>
          </details>

          <details className="bg-white/5 border border-white/10 rounded-xl p-6 group">
            <summary className="text-xl font-bold text-white cursor-pointer list-none flex items-center justify-between">
              Will my competitors be in here?
              <ArrowRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="text-white/70 mt-4 leading-relaxed">
              We curate carefully to avoid direct conflicts. Plus, we've found that "competitors" often become collaborators at this level. Everyone's focused on building their own thing—there's room for all of us to win.
            </p>
          </details>

          <details className="bg-white/5 border border-white/10 rounded-xl p-6 group">
            <summary className="text-xl font-bold text-white cursor-pointer list-none flex items-center justify-between">
              Can I cancel anytime?
              <ArrowRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="text-white/70 mt-4 leading-relaxed">
              Yes, month-to-month. But here's what matters: <strong className="text-white">You can't get your founding member rate back once you leave.</strong> It's locked in for life only while you're an active member. Once you cancel, you're back to $249/mo if you rejoin.
            </p>
          </details>

          <details className="bg-white/5 border border-white/10 rounded-xl p-6 group">
            <summary className="text-xl font-bold text-white cursor-pointer list-none flex items-center justify-between">
              How do you ensure quality members?
              <ArrowRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="text-white/70 mt-4 leading-relaxed">
              Invite-only during founding phase. Every application is personally reviewed. We're looking for builders, not tire-kickers. People who show up. People who help. People who are actually doing the work.
            </p>
          </details>

          <details className="bg-white/5 border border-white/10 rounded-xl p-6 group">
            <summary className="text-xl font-bold text-white cursor-pointer list-none flex items-center justify-between">
              I'm pre-revenue / just starting. Is this for me?
              <ArrowRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="text-white/70 mt-4 leading-relaxed">
              YES. Some of our most valuable members are in the early stages. They ask the best questions. They're the most helpful. They make the best connections. Everyone started somewhere. No one judges. Everyone helps.
            </p>
          </details>

          <details className="bg-white/5 border border-white/10 rounded-xl p-6 group">
            <summary className="text-xl font-bold text-white cursor-pointer list-none flex items-center justify-between">
              What if I don't like it?
              <ArrowRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="text-white/70 mt-4 leading-relaxed">
              Full refund in your first 30 days, no questions asked. We're confident you'll see value. But if you don't, just email us. Done.
            </p>
          </details>
        </div>

        <div className="mt-12 text-center">
          <p className="text-white/60">
            Still have questions? <a href="mailto:support@thecirclenetwork.org" className="text-emerald-400 hover:text-emerald-300">Email us</a> - We respond in under 24 hours.
          </p>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="bg-gradient-to-br from-emerald-500/10 via-purple-500/10 to-blue-500/10 border-y border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Stop Building Alone?
          </h2>

          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Join {memberCount > 0 ? `${memberCount} founders` : 'founders'} who decided to stop networking alone and start building together.
          </p>

          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Here's What Happens Next:</h3>
              
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-400 font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Apply with your email & invite code</p>
                    <p className="text-white/60 text-sm">We review within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-400 font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Get your magic link & complete profile</p>
                    <p className="text-white/60 text-sm">Tell us about yourself and what you're building</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-400 font-bold">3</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Lock in $199/mo founding rate</p>
                    <p className="text-white/60 text-sm">Secure payment via Stripe, cancel anytime</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-400 font-bold">4</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Start connecting immediately</p>
                    <p className="text-white/60 text-sm">Browse members, post requests, RSVP to events</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-400 font-bold">5</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">See results</p>
                    <p className="text-white/60 text-sm">Watch what happens when you build with others</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg"
              />
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="INVITE CODE"
                required
                className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg uppercase"
              />
            </div>
            
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={isValidating}
              className="w-full px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Start Your Application
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-white/60 text-sm mt-6">
            30-day money back guarantee • Cancel anytime • Your founding rate is locked in forever
          </p>

          <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-white/80 text-lg mb-4">
              <strong className="text-white">One last thing:</strong>
            </p>
            <p className="text-white/70 leading-relaxed">
              Every founder in The Circle was exactly where you are right now. Wondering if it's worth it. Wondering if they'll actually get value. Wondering if it's just another thing to manage.
            </p>
            <p className="text-white/70 leading-relaxed mt-4">
              Then they joined. And they got it.
            </p>
            <p className="text-white/70 leading-relaxed mt-4">
              The intros became deals. The messages became friendships. The events became partnerships. The investment became a no-brainer.
            </p>
            <p className="text-emerald-400 font-medium mt-6">
              Don't be the person who waits and watches from the outside. Be the person who shows up and builds with us.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">The Circle</span>
              </div>
              <p className="text-white/60 text-sm">
                Where ambitious founders stop building alone.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <a href="/login" className="block text-white/60 hover:text-white text-sm transition-colors">
                  Member Login
                </a>
                <a href="mailto:support@thecirclenetwork.org" className="block text-white/60 hover:text-white text-sm transition-colors">
                  Contact Support
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <div className="space-y-2">
                <a href="/terms" className="block text-white/60 hover:text-white text-sm transition-colors">
                  Terms of Service
                </a>
                <a href="/privacy" className="block text-white/60 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-white/60 text-sm">
              © 2025 The Circle. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Exit Intent Popup */}
      {showExitPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0F1E] border-2 border-emerald-500/50 rounded-2xl max-w-2xl w-full p-8 relative">
            <button
              onClick={() => setShowExitPopup(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <h3 className="text-3xl font-bold text-white mb-4">
                Wait! Before You Go...
              </h3>

              <p className="text-xl text-white/80 mb-6">
                You're about to miss the founding member rate.
              </p>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                <p className="text-white/80 mb-4">Here's what's happening:</p>
                <ul className="space-y-2 text-left text-white/70">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    We're at {memberCount} / 1,000 members
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    {spotsLeft} founding spots left at $199/mo
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    After member #1,000: $249/mo (no exceptions)
                  </li>
                </ul>
              </div>

              <p className="text-2xl font-bold text-emerald-400 mb-6">
                That's $600/year more if you wait.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowExitPopup(false)}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 rounded-xl transition-all"
                >
                  No Thanks, I'll Pay $249 Later
                </button>
                <button
                  onClick={() => {
                    setShowExitPopup(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all"
                >
                  Lock In $199/mo Now
                </button>
              </div>

              <p className="text-white/60 text-sm mt-4 italic">
                "I almost left to 'think about it.' So glad I didn't. Already made 2 valuable connections in my first week."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating CTA (shows on scroll) */}
      {memberCount > 0 && spotsLeft < 100 && (
        <div className="fixed bottom-8 right-8 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl max-w-xs hidden lg:block">
          <p className="font-bold mb-1">⚡ {spotsLeft} spots left</p>
          <p className="text-sm text-white/90 mb-2">at $199/mo founding rate</p>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all" 
              style={{ width: `${(memberCount / 1000) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
