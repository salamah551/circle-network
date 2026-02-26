'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Users, TrendingUp, Award, Building2, ArrowRight, CheckCircle, Star, Lock } from 'lucide-react';

const MEMBER_STORIES = [
  {
    id: 1,
    role: 'Managing Director, Private Equity',
    industry: 'Finance',
    result: 'Closed a $4.2M co-investment in 11 days through a single Circle introduction. The intro came from our Monday AI matching — I had no prior connection to the founder.',
    metric: '$4.2M deal closed',
  },
  {
    id: 2,
    role: 'Founder & CEO, SaaS Company',
    industry: 'Technology',
    result: 'ARC flagged that we were overpaying on three SaaS contracts. After using the negotiation scripts, we saved $38K annually. That alone covered the membership fee for years.',
    metric: '$38K annual savings',
  },
  {
    id: 3,
    role: 'VP Strategy, Healthcare Group',
    industry: 'Healthcare',
    result: 'Posted a request for a Chief Commercial Officer referral on a Tuesday. Had three qualified introductions by Thursday, hired one within six weeks.',
    metric: 'Key hire in 6 weeks',
  },
];

const INDUSTRY_DATA = [
  { label: 'Finance & Investment', pct: 34, color: 'bg-amber-500' },
  { label: 'Technology & SaaS', pct: 22, color: 'bg-purple-500' },
  { label: 'Consulting & Advisory', pct: 18, color: 'bg-indigo-500' },
  { label: 'Real Estate & Development', pct: 14, color: 'bg-emerald-500' },
  { label: 'Healthcare & Life Sciences', pct: 12, color: 'bg-pink-500' },
];

export default function CommunityPage() {
  const [requestForm, setRequestForm] = useState({ name: '', email: '', company: '', title: '' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!requestForm.name || !requestForm.email || !requestForm.company || !requestForm.title) {
      setFormError('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestForm.email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: requestForm.name,
          email: requestForm.email,
          message: `Community Page Access Request\nCompany: ${requestForm.company}\nTitle: ${requestForm.title}`,
        }),
      });

      if (!response.ok) throw new Error('Submission failed');

      setShowSuccess(true);
      setRequestForm({ name: '', email: '', company: '', title: '' });
      setTimeout(() => setShowSuccess(false), 8000);
    } catch {
      setFormError('Something went wrong. Please email invite@thecirclenetwork.org directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequestForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            The Circle
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/70 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all">
              Sign In
            </Link>
            <a href="#request-access" className="text-sm bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-all shadow-lg shadow-purple-500/20">
              Request Access
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-sm font-semibold text-amber-400 mb-6">
          <Lock className="w-3 h-3" />
          Invitation Only — Member Proof
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
            Who&apos;s Inside
          </span>
        </h1>
        <p className="text-xl text-white/60 max-w-3xl mx-auto">
          Aggregate statistics and anonymized success stories from our vetted member network.
          Individual member identities are never disclosed publicly.
        </p>
      </section>

      {/* Stats Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-amber-500/20 rounded-2xl p-8 text-center hover:border-amber-500/40 transition-all">
            <div className="text-4xl font-bold text-amber-400 mb-2">47</div>
            <div className="text-white/80 font-semibold mb-1">Executives</div>
            <div className="text-xs text-white/40">C-Suite &amp; VP Level</div>
          </div>
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-purple-500/20 rounded-2xl p-8 text-center hover:border-purple-500/40 transition-all">
            <div className="text-4xl font-bold text-purple-400 mb-2">23</div>
            <div className="text-white/80 font-semibold mb-1">Fund Managers</div>
            <div className="text-xs text-white/40">Private &amp; Hedge Funds</div>
          </div>
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-indigo-500/20 rounded-2xl p-8 text-center hover:border-indigo-500/40 transition-all">
            <div className="text-4xl font-bold text-indigo-400 mb-2">$2.4B+</div>
            <div className="text-white/80 font-semibold mb-1">Network Revenue</div>
            <div className="text-xs text-white/40">Combined &amp; Growing</div>
          </div>
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-emerald-500/20 rounded-2xl p-8 text-center hover:border-emerald-500/40 transition-all">
            <div className="text-4xl font-bold text-emerald-400 mb-2">12</div>
            <div className="text-white/80 font-semibold mb-1">Industries</div>
            <div className="text-xs text-white/40">Represented</div>
          </div>
        </div>

        {/* Industry breakdown */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-8 mb-12">
          <h3 className="text-lg font-semibold mb-6 text-white/80">Industry Breakdown</h3>
          <div className="space-y-4">
            {INDUSTRY_DATA.map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <div className="w-44 text-sm text-white/60 shrink-0">{item.label}</div>
                <div className="flex-1 bg-zinc-800 rounded-full h-2">
                  <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.pct}%` }} />
                </div>
                <div className="w-10 text-sm text-white/60 text-right">{item.pct}%</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/30 mt-6">* Aggregate statistics only. Individual identities are protected.</p>
        </div>

        {/* Member Experience Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-8 text-center">
            <div className="text-3xl font-bold text-white mb-2">18+ years</div>
            <div className="text-white/60">Average executive experience</div>
          </div>
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-8 text-center">
            <div className="text-3xl font-bold text-white mb-2">8 countries</div>
            <div className="text-white/60">Geographic reach</div>
          </div>
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-8 text-center">
            <div className="text-3xl font-bold text-white mb-2">100%</div>
            <div className="text-white/60">Members personally vetted</div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Member Success Stories</h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Anonymized to protect member privacy. These represent real outcomes from real members.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {MEMBER_STORIES.map((story) => (
            <div key={story.id} className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-8 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <blockquote className="text-white/80 leading-relaxed mb-6 flex-1">
                &ldquo;{story.result}&rdquo;
              </blockquote>
              <div className="border-t border-zinc-700 pt-4">
                <div className="text-sm text-white/60 mb-2">{story.role}</div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-400">
                  <CheckCircle className="w-3 h-3" />
                  {story.metric}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Request Access Section */}
      <section id="request-access" className="max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Request an <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">Invitation</span>
            </h2>
            <p className="text-xl text-white/60">
              Membership is extended by invitation only. Submit your details and we&apos;ll be in touch if there&apos;s a fit.
            </p>
          </div>

          {showSuccess && (
            <div className="mb-8 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/50 rounded-xl p-6 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-emerald-300 mb-2">Request Received</h3>
              <p className="text-white/80">
                Thank you. If your profile is a strong fit, we&apos;ll reach out within 5 business days.
              </p>
            </div>
          )}

          {formError && (
            <div className="mb-8 bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-center">
              <p className="text-red-300">{formError}</p>
            </div>
          )}

          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-amber-500/30 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {[
                { id: 'name', label: 'Full Name', placeholder: 'Your full name' },
                { id: 'email', label: 'Email Address', placeholder: 'your.email@company.com', type: 'email' },
                { id: 'company', label: 'Company', placeholder: 'Your company or fund' },
                { id: 'title', label: 'Title / Role', placeholder: 'e.g. CEO, Managing Director, Fund Manager' },
              ].map((field) => (
                <div key={field.id}>
                  <label htmlFor={field.id} className="block text-sm font-semibold text-white/90 mb-2">
                    {field.label} *
                  </label>
                  <input
                    type={field.type || 'text'}
                    id={field.id}
                    name={field.id}
                    value={requestForm[field.id]}
                    onChange={handleInputChange}
                    required
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 bg-black/50 border border-zinc-700 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Access Request'}
                {!isSubmitting && <ArrowRight className="w-5 h-5" />}
              </button>

              <p className="text-xs text-white/40 text-center">
                We review all applications personally. Not all applicants will be admitted.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-white/40">
          <Link href="/" className="hover:text-white transition-colors">← Back to Home</Link>
          <span className="mx-4">·</span>
          © {new Date().getFullYear()} The Circle Network
        </div>
      </footer>
    </main>
  );
}
