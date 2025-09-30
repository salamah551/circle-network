'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';

function ApplicationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({
    fullName: '',
    title: '',
    company: '',
    location: '',
    linkedinUrl: '',
    bio: '',
    expertise: [],
    needs: [],
    challenges: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [email, setEmail] = useState('');

  const expertiseTags = [
    'Fundraising', 'Sales', 'Marketing', 'Product', 'Engineering',
    'Operations', 'Finance', 'Legal', 'HR', 'Design',
    'Data Analytics', 'Business Development', 'Strategy', 'Consulting'
  ];

  const needsTags = [
    'Investor Introductions', 'Hiring Talent', 'Strategic Advice',
    'Partnership Opportunities', 'Customer Introductions', 'Technical Guidance',
    'Market Insights', 'Operational Help', 'Growth Strategy', 'Exit Planning'
  ];

  useEffect(() => {
    const code = searchParams.get('code');
    const emailParam = searchParams.get('email');

    if (!code || !emailParam) {
      router.push('/');
      return;
    }

    setInviteCode(code);
    setEmail(emailParam);
    setIsLoading(false);
  }, [searchParams, router]);

  const toggleTag = (field, tag) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(tag)
        ? prev[field].filter(t => t !== tag)
        : [...prev[field], tag]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.title || !formData.company || !formData.bio) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.expertise.length === 0) {
      setError('Please select at least one area of expertise');
      return;
    }

    if (formData.needs.length === 0) {
      setError('Please select at least one thing you need help with');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/applications/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          email,
          inviteCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      router.push(`/subscribe?email=${encodeURIComponent(email)}`);

    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <svg width="48" height="48" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="#D4AF37" strokeWidth="2" fill="none"/>
              <circle cx="20" cy="20" r="12" stroke="#D4AF37" strokeWidth="1.5" fill="none"/>
              <circle cx="20" cy="20" r="6" fill="#D4AF37"/>
            </svg>
            <h1 className="text-3xl font-bold">Welcome to The Circle</h1>
          </div>
          <p className="text-zinc-400">
            Complete your application to secure your founding member spot
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-bold mb-4">Basic Information</h2>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="CEO, VP of Sales, etc."
                required
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Company <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Acme Corp"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="San Francisco, CA"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">LinkedIn URL</label>
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="https://linkedin.com/in/johndoe"
              />
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-bold mb-4">About You</h2>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Bio <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[120px]"
                placeholder="Tell us about your professional background and what you're working on..."
                required
              />
              <p className="text-xs text-zinc-500 mt-2">{formData.bio.length}/500 characters</p>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-3">
                Areas of Expertise <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {expertiseTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag('expertise', tag)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.expertise.includes(tag)
                        ? 'bg-amber-500 text-black'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-3">
                What I Need Help With <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {needsTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag('needs', tag)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.needs.includes(tag)
                        ? 'bg-amber-500 text-black'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Current Challenges (Optional)</label>
              <textarea
                value={formData.challenges}
                onChange={(e) => setFormData({...formData, challenges: e.target.value})}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[100px]"
                placeholder="What are you currently working on or struggling with?"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Continue to Payment
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <p className="text-center text-sm text-zinc-500">
            After payment, you'll get full access to the platform
          </p>
        </form>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    }>
      <ApplicationForm />
    </Suspense>
  );
}