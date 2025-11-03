import Link from 'next/link';
import { ArrowRight, CheckCircle, Shield, Clock, Calendar, Mail, Zap, Eye, Lock, Trash2 } from 'lucide-react';

export const metadata = {
  title: 'BriefPoint | Circle Network',
  description: 'Never walk into a meeting cold again. Automated meeting briefs with context, talking points, and strategic angles.',
};

export default function BriefPointPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold hover:text-purple-400 transition-colors">
              ← Circle Network
            </Link>
            <Link
              href="/subscribe"
              className="text-sm bg-purple-500 text-white font-semibold px-5 py-2 rounded-lg hover:bg-purple-400 transition-all"
            >
              Subscribe Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-400 font-medium">Meeting Intelligence</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            BriefPoint
          </h1>
          
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Never walk into a meeting cold again. Get automated intelligence briefs with context, talking points, and strategic angles for every conversation on your calendar.
          </p>

          <Link
            href="/subscribe"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-purple-400 hover:to-purple-500 transition-all shadow-xl"
          >
            Get Started with BriefPoint
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Two Modes. One Goal: Never Be Unprepared.</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Choose the mode that fits your workflow and privacy preferences
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Ghost Mode */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
              <Eye className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-purple-400">Ghost Mode</h3>
            <p className="text-zinc-300 mb-6">
              No calendar access required. Simply forward meeting invites or details to your BriefPoint email address, and we'll prepare a brief for you.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-400">Zero calendar integration needed</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-400">Manual control over every brief</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-400">Perfect for private/sensitive meetings</span>
              </div>
            </div>
          </div>

          {/* Calendar Mode */}
          <div className="bg-zinc-900 border border-purple-500/50 rounded-2xl p-8">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-purple-400">Calendar Mode</h3>
            <p className="text-zinc-300 mb-6">
              Connect your calendar (read-only) and receive automated briefs for upcoming meetings. Set it and forget it.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-400">Fully automated brief generation</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-400">Read-only calendar access (never writes)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-400">Time-saving autopilot mode</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Delivery Cadence */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-6 text-center">When You Get Your Briefs</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/30 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Sunday Prep Pack</h3>
                <p className="text-zinc-300 text-sm">
                  Every Sunday evening, receive a comprehensive digest of all meetings scheduled for the upcoming week with context and preparation notes.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/30 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">T-120 Minute Alerts</h3>
                <p className="text-zinc-300 text-sm">
                  Two hours before each meeting, get a focused brief delivered via email (and Slack on Pro/Elite tiers) with key talking points and strategic angles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's In a Brief */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">What's In Every Brief</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Actionable intelligence, not generic summaries
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-400 font-bold">1</span>
              </div>
              <div>
                <h4 className="font-bold mb-1">Participant Intelligence</h4>
                <p className="text-sm text-zinc-400">
                  Who's in the meeting, their role, recent activity, and relevant background—so you understand the room before you enter it.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-400 font-bold">2</span>
              </div>
              <div>
                <h4 className="font-bold mb-1">Context & Background</h4>
                <p className="text-sm text-zinc-400">
                  What's happening with their company, industry trends, recent news, and relevant competitive dynamics.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-400 font-bold">3</span>
              </div>
              <div>
                <h4 className="font-bold mb-1">Strategic Talking Points</h4>
                <p className="text-sm text-zinc-400">
                  Key questions to ask, potential objections to anticipate, and angles to emphasize based on your objectives.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-400 font-bold">4</span>
              </div>
              <div>
                <h4 className="font-bold mb-1">Opportunity Identification</h4>
                <p className="text-sm text-zinc-400">
                  Potential partnerships, collaboration areas, or strategic openings based on available intelligence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Security */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-emerald-400" />
            <h2 className="text-3xl font-bold">Privacy-First Design</h2>
          </div>
          
          <p className="text-zinc-300 mb-8">
            Your meeting data is sensitive. Here's how we protect it:
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-3">
                <Lock className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="font-bold mb-2 text-sm">No Email Storage</h4>
              <p className="text-xs text-zinc-400">
                We extract meeting metadata only. Your email content is never stored or retained.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="font-bold mb-2 text-sm">30-Day Retention</h4>
              <p className="text-xs text-zinc-400">
                Meeting metadata and generated briefs are automatically deleted after 30 days.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-3">
                <Trash2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="font-bold mb-2 text-sm">Instant Purge</h4>
              <p className="text-xs text-zinc-400">
                Request full data deletion at any time. Your data is wiped within 24 hours.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-700">
            <p className="text-sm text-zinc-400 text-center">
              Read-only calendar access • No event modification • No data sharing • SOC 2 compliant infrastructure
            </p>
          </div>
        </div>
      </section>

      {/* Tier Limits */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">BriefPoint Across Tiers</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Every membership includes BriefPoint. The difference is capacity and delivery channels.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold mb-3">Professional</h3>
            <div className="text-3xl font-bold text-white mb-2">5</div>
            <p className="text-sm text-zinc-400 mb-4">briefs per day</p>
            <div className="text-xs text-zinc-500">Email delivery only</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/50 rounded-xl p-6 text-center transform md:scale-105">
            <h3 className="text-xl font-bold mb-3 text-purple-400">Pro</h3>
            <div className="text-3xl font-bold text-white mb-2">10</div>
            <p className="text-sm text-zinc-400 mb-4">briefs per day</p>
            <div className="text-xs text-purple-400 font-semibold">Email + Slack delivery</div>
          </div>

          <div className="bg-zinc-900 border border-purple-500/30 rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold mb-3 text-purple-400">Elite</h3>
            <div className="text-3xl font-bold text-white mb-2">25</div>
            <p className="text-sm text-zinc-400 mb-4">briefs per day</p>
            <div className="text-xs text-purple-400 font-semibold">Email + Slack delivery</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 border-2 border-purple-500/30 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Getting Better Meeting Outcomes</h2>
          <p className="text-lg text-zinc-400 mb-8 max-w-2xl mx-auto">
            Subscribe to any tier and get instant access to BriefPoint along with ARC™ intelligence and our exclusive community.
          </p>
          
          <Link
            href="/subscribe"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-purple-400 hover:to-purple-500 transition-all shadow-xl"
          >
            View Membership Tiers
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <p className="text-sm text-zinc-500 mt-6">
            30-day money-back guarantee • Cancel anytime
          </p>
        </div>
      </section>

      <div className="h-24" />
    </div>
  );
}
