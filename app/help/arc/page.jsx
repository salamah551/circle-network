'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Shield, FileText, Plane, TrendingUp, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ArcHelpPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-zinc-900 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">How ARC™ Works</h1>
              <p className="text-sm text-zinc-400">Your AI concierge for research and optimization</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-amber-500/10 to-purple-500/10 border border-zinc-800 rounded-2xl p-8 mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Meet ARC™: Your AI Research Engine</h2>
              <p className="text-zinc-400 leading-relaxed">
                ARC™ (Adaptive Research Concierge) is your personal AI assistant that handles research, 
                analysis, and optimization tasks—freeing you to focus on what matters most.
              </p>
            </div>
          </div>
        </div>

        {/* What ARC Can Do */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">What ARC™ Can Do</h3>
          <div className="grid gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Document Analysis</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Analyze contracts, NDAs, term sheets, and legal documents. ARC™ identifies key terms, 
                    red flags, and provides plain-language summaries with action items.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Plane className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Travel Optimization</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Find optimal flight routes, compare award availability across alliances, identify lounge 
                    access opportunities, and get upgrade strategies tailored to your preferences.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Strategic Research</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Research competitive landscapes, market trends, potential partners, or acquisition targets. 
                    Get comprehensive briefs with sources, analysis, and recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Privacy & Security
          </h3>
          <div className="space-y-3 text-sm text-zinc-400">
            <p>
              All briefs are private and only visible to you. Your data is encrypted end-to-end and 
              processed in secure, isolated environments.
            </p>
            <p>
              We never train our AI models on your sensitive data. Documents and requests are automatically 
              deleted after 90 days, or you can delete them immediately at any time.
            </p>
            <p className="flex items-center gap-2 text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              <span className="font-semibold">SOC 2 Type II Certified | GDPR Compliant</span>
            </p>
          </div>
        </div>

        {/* Good Brief Examples */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Examples of Good Briefs</h3>
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border border-blue-500/20 rounded-xl p-6">
              <p className="text-sm text-blue-400 font-semibold mb-2">Document Analysis Example</p>
              <p className="text-white mb-2 font-medium">
                "Analyze this SaaS contract for red flags and summarize key terms"
              </p>
              <p className="text-sm text-zinc-400">
                Upload or paste your contract, and ARC™ will identify unusual clauses, payment terms, 
                termination conditions, liability caps, and provide a summary in plain language.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border border-purple-500/20 rounded-xl p-6">
              <p className="text-sm text-purple-400 font-semibold mb-2">Travel Optimization Example</p>
              <p className="text-white mb-2 font-medium">
                "Find business class award availability from SFO to Tokyo in late March"
              </p>
              <p className="text-sm text-zinc-400">
                ARC™ will search across Star Alliance, OneWorld, and SkyTeam, compare options, 
                show point requirements, and suggest optimal routing.
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
              <p className="text-sm text-emerald-400 font-semibold mb-2">Research Example</p>
              <p className="text-white mb-2 font-medium">
                "Research competitive landscape for AI-powered recruiting tools"
              </p>
              <p className="text-sm text-zinc-400">
                Get a comprehensive brief covering major players, market size, pricing models, 
                key differentiators, and emerging trends—all with source citations.
              </p>
            </div>
          </div>
        </div>

        {/* How to Use */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">How to Use ARC™</h3>
          <div className="space-y-3 text-sm text-zinc-400">
            <div className="flex items-start gap-3">
              <span className="text-amber-400 font-bold">1.</span>
              <p>Go to your dashboard and find the ARC™ Action Center widget</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-amber-400 font-bold">2.</span>
              <p>Type or paste your request—be as specific as possible for best results</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-amber-400 font-bold">3.</span>
              <p>Submit and check "My ARC™ Briefs" for updates—most briefs complete within minutes</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-amber-400 font-bold">4.</span>
              <p>Review your brief, ask follow-up questions, or request refinements</p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-amber-400 mb-3">💡 Pro Tips</h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>• Be specific about what you need: context, goals, and constraints</li>
            <li>• Include deadlines if time-sensitive</li>
            <li>• For document analysis, mention what you're most concerned about</li>
            <li>• You can submit multiple briefs simultaneously—no limits</li>
            <li>• Use natural language; no special formatting required</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            Start Using ARC™
          </Link>
        </div>
      </main>
    </div>
  );
}
