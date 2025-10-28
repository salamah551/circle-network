'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Crown, ArrowRight, CheckCircle } from 'lucide-react';

export default function NewHomepage() {

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Crown className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold group-hover:text-amber-400 transition-colors">
                Circle Network
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Link 
                href="/login"
                className="text-sm text-white/70 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all duration-300"
              >
                Sign In
              </Link>
              <Link 
                href="/apply"
                className="text-sm bg-amber-500 text-black font-semibold px-5 py-2 rounded-lg hover:bg-amber-400 transition-all duration-300"
              >
                Apply for Membership
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-emerald-500/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            The Private Network Where
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
              100 Leaders Share an Unfair Advantage
            </span>
          </h1>

          <h2 className="text-xl md:text-2xl text-white/70 mb-10 max-w-4xl mx-auto leading-relaxed">
            The Circle Network is a private intelligence collective. Access is by nomination only.
          </h2>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/apply"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-xl hover:shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              Apply for Membership
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Limited to 100 founding members</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Access by nomination only</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Private intelligence collective</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Founding 100 Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">The Founding 100</h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            An exclusive opportunity for the first 100 leaders to join our private intelligence collective
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-amber-500/10 to-emerald-500/10 border-2 border-amber-500/30 rounded-2xl p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 mb-6">
                <Crown className="w-5 h-5 text-amber-400" />
                <span className="text-sm text-amber-400 font-bold">FOUNDING MEMBER OPPORTUNITY</span>
              </div>
              
              <h3 className="text-4xl font-bold mb-4">Limited to 100 Members</h3>
              
              <div className="mb-6">
                <div className="text-5xl font-bold text-amber-400 mb-2">$25,000</div>
                <div className="text-lg text-zinc-400">Annual Contribution</div>
              </div>

              <p className="text-lg text-white/80 leading-relaxed mb-8">
                Membership is currently limited to 100 founding members. The annual contribution is $25,000. 
                After the founding cohort is established, the doors will close, and the contribution level will 
                increase for future members.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {[
                'Exclusive access to intelligence collective',
                'Strategic insights from 100 top-tier leaders',
                'Private network of high-achievers',
                'Curated introductions and partnerships',
                'Early access to opportunities and deals',
                'Lifetime founding member status'
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3 bg-black/40 rounded-lg p-4">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="/apply"
              className="w-full px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl flex items-center justify-center gap-2"
            >
              Apply for Membership
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-br from-amber-500/10 to-emerald-500/10 border border-amber-500/20 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-6">
            Join the Elite Circle of Strategic Leaders
          </h2>
          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            The Circle Network is where 100 exceptional leaders share insights, create opportunities, and leverage collective intelligence for unprecedented advantage.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/apply"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl flex items-center justify-center gap-2"
            >
              Apply for Membership
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-zinc-500">
              © 2025 Circle Network. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/terms" className="text-zinc-500 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-zinc-500 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/contact" className="text-zinc-500 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
