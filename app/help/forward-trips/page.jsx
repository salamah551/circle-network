'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plane, Mail, CheckCircle, Shield, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ForwardTripsHelpPage() {
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
              <h1 className="text-2xl font-bold">How to Forward Flight Itineraries</h1>
              <p className="text-sm text-zinc-400">Let ARC™ monitor your trips for upgrades and alerts</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-zinc-800 rounded-2xl p-8 mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Plane className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Upgrade Monitoring Made Easy</h2>
              <p className="text-zinc-400 leading-relaxed">
                Forward your flight confirmations to ARC™ and we'll automatically monitor for upgrade 
                availability, lounge access eligibility, and disruption alerts—saving you time and maximizing comfort.
              </p>
            </div>
          </div>
        </div>

        {/* Forwarding Instructions */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-400" />
            Where to Forward
          </h3>
          <div className="bg-black/50 border border-zinc-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-zinc-500 mb-1">Send your flight confirmations to:</p>
            <p className="text-lg font-mono font-bold text-amber-400">trips@circle.network</p>
          </div>
          <p className="text-sm text-zinc-400">
            Simply forward your airline confirmation emails as-is. No formatting required.
          </p>
        </div>

        {/* Required Information */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            What We Need
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Airline and Flight Number</p>
                <p className="text-sm text-zinc-400">e.g., United Airlines UA-567</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Booking Reference / PNR</p>
                <p className="text-sm text-zinc-400">Your confirmation code (e.g., ABC123)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Travel Dates</p>
                <p className="text-sm text-zinc-400">Departure and return dates</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Origin and Destination</p>
                <p className="text-sm text-zinc-400">Airport codes or city names</p>
              </div>
            </div>
          </div>
        </div>

        {/* What ARC Does */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">What ARC™ Does With Your Trips</h3>
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-blue-400 mb-2">🎯 Upgrade Monitoring</h4>
              <p className="text-sm text-zinc-400">
                We continuously check for premium cabin availability using award seats and paid upgrades, 
                alerting you when opportunities arise.
              </p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-purple-400 mb-2">🛋️ Lounge Eligibility</h4>
              <p className="text-sm text-zinc-400">
                Get notified about lounge access based on your cabin class, credit cards, or elite status.
              </p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-amber-400 mb-2">⚡ Disruption Alerts</h4>
              <p className="text-sm text-zinc-400">
                Receive proactive alerts about delays, cancellations, and gate changes before they impact you.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Privacy & Security
          </h3>
          <div className="space-y-3 text-sm text-zinc-400">
            <p>
              Your travel data is encrypted at rest and in transit. We only use it to provide 
              trip monitoring services and never share it with third parties.
            </p>
            <p>
              We automatically delete trip data 30 days after your return date. You can request 
              immediate deletion at any time from your settings.
            </p>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-400 mb-2">Important Notes</p>
              <ul className="space-y-2 text-zinc-400">
                <li>• Forward confirmations as soon as you book for best monitoring coverage</li>
                <li>• ARC™ works with major airlines; some low-cost carriers may have limited features</li>
                <li>• We notify you via email and push notifications when upgrades become available</li>
                <li>• This service is included in your membership at no additional cost</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
