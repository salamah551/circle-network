'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Calendar, ArrowRight, AlertCircle } from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL;
  const calcomUrl = process.env.NEXT_PUBLIC_CALCOM_URL;
  const schedulerUrl = calendlyUrl || calcomUrl;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Order Confirmed! 🎉
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Your 48-Hour Flash Briefing is being prepared. You'll receive your comprehensive competitor intelligence report within 48 hours.
          </p>
          {sessionId && (
            <p className="text-sm text-zinc-600 mt-4 font-mono">
              Order ID: {sessionId.substring(0, 24)}...
            </p>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-amber-400" />
            Next Step: Schedule Your Briefing Call
          </h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-amber-400 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Schedule Your Briefing Review</h3>
                <p className="text-sm text-zinc-400">
                  Book a 30-minute call to review your report and discuss strategic recommendations.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-amber-400 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Receive Your Flash Briefing</h3>
                <p className="text-sm text-zinc-400">
                  Within 48 hours, you'll receive a detailed report via email with competitive insights.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-amber-400 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Join the Briefing Call</h3>
                <p className="text-sm text-zinc-400">
                  We'll walk through the findings and answer your questions about what we discovered.
                </p>
              </div>
            </div>
          </div>

          {/* Scheduler Embed */}
          {schedulerUrl ? (
            <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden">
              <iframe
                src={schedulerUrl}
                width="100%"
                height="700"
                frameBorder="0"
                title="Schedule Briefing Call"
              />
            </div>
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-400 mb-2">Scheduler Not Configured</h3>
                <p className="text-sm text-amber-400/80 mb-3">
                  Please set up your scheduling link in the environment variables:
                </p>
                <code className="text-xs bg-black p-3 rounded block text-amber-300 font-mono">
                  NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/your-username/consultation
                  <br />
                  or
                  <br />
                  NEXT_PUBLIC_CALCOM_URL=https://cal.com/your-username/consultation
                </code>
              </div>
            </div>
          )}
        </div>

        {/* Upgrade Options */}
        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Upgrade to Continuous Intelligence</h2>
          <p className="text-zinc-400 mb-6">
            Love what you're getting? Your $297 Flash Briefing payment credits toward any of our ongoing programs within 30 days.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/sprint"
              className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-purple-500/30 transition-all group"
            >
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                30-Day Insight Sprint
              </h3>
              <p className="text-sm text-zinc-400 mb-3">
                Deep dive into your competitive landscape over 30 days
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">$3,000</span>
                <span className="text-sm text-zinc-500">one-time</span>
              </div>
              <div className="mt-3 text-sm text-emerald-400">
                -$297 credit applied = $2,703
              </div>
            </Link>
            
            <Link
              href="/membership"
              className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-purple-500/30 transition-all group"
            >
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                Intelligence Membership
              </h3>
              <p className="text-sm text-zinc-400 mb-3">
                Ongoing competitive intelligence with dedicated analyst
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">$8,500</span>
                <span className="text-sm text-zinc-500">/month</span>
              </div>
              <div className="mt-3 text-sm text-emerald-400">
                First month -$297 credit = $8,203
              </div>
            </Link>
          </div>
        </div>

        {/* Return Home */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
