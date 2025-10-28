'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ApplyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [industry, setIndustry] = useState('');
  const [leverageAnswer, setLeverageAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate() {
    if (!fullName.trim()) {
      return 'Please enter your full name';
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      return 'Please enter a valid email address';
    }
    if (!linkedinUrl.trim() || !linkedinUrl.includes('linkedin.com')) {
      return 'Please enter a valid LinkedIn profile URL';
    }
    if (!industry.trim()) {
      return 'Please select your primary industry';
    }
    if (!leverageAnswer.trim() || leverageAnswer.trim().length < 50) {
      return 'Please provide a thoughtful answer (at least 50 characters)';
    }
    return '';
  }

  function handleSubmit(e) {
    e.preventDefault();
    
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);

    // Simulate submission - in real implementation, this would POST to an API
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2000);
  }

  if (success) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 mb-6">
            <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4">Application Submitted</h1>
          <p className="text-white/60 mb-8 leading-relaxed">
            Thank you for your interest in The Circle Network. Our membership committee will review your application and respond within 5-7 business days.
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 transition-all"
          >
            Return to Homepage
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
            <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Apply for Membership</h1>
          <p className="text-white/60 leading-relaxed">
            The Circle Network is limited to 100 founding members. Please complete this application to be considered for membership.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-white/80 mb-2">
                Full Name *
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Smith"
                className="w-full rounded-lg bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@company.com"
                autoComplete="email"
                className="w-full rounded-lg bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="linkedinUrl" className="block text-sm font-medium text-white/80 mb-2">
                LinkedIn Profile URL *
              </label>
              <input
                id="linkedinUrl"
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full rounded-lg bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-white/80 mb-2">
                Primary Industry *
              </label>
              <select
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded-lg bg-black border border-white/10 px-4 py-3 text-white outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                required
              >
                <option value="">Select your industry</option>
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="retail">Retail</option>
                <option value="consulting">Consulting</option>
                <option value="real-estate">Real Estate</option>
                <option value="professional-services">Professional Services</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="leverageAnswer" className="block text-sm font-medium text-white/80 mb-2">
                Why do you believe in the power of strategic leverage? *
              </label>
              <textarea
                id="leverageAnswer"
                value={leverageAnswer}
                onChange={(e) => setLeverageAnswer(e.target.value)}
                placeholder="Share your perspective on how strategic leverage has impacted your career or business..."
                rows={6}
                className="w-full rounded-lg bg-black border border-white/10 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
                required
              />
              <p className="text-xs text-white/50 mt-1.5">
                Minimum 50 characters
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-500 text-black font-semibold px-6 py-3.5 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <span>Submit Application</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-white/50 text-center">
              Questions about membership?{' '}
              <Link 
                href="/contact" 
                className="text-amber-400 hover:text-amber-300 underline"
              >
                Contact us
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
