'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Loader2, CheckCircle } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function ApplyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [validatingInvite, setValidatingInvite] = useState(true);
  const [inviteError, setInviteError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    title: '',
    company: '',
    bio: '',
    expertise: [],
    needs: [],
    linkedin: '',
    twitter: '',
    website: ''
  });

  // Validate invite code on page load
  useEffect(() => {
    const validateInvite = async () => {
      try {
        // Get invite code and email from URL
        const code = searchParams.get('code');
        const email = searchParams.get('email');

        console.log('URL params:', { code, email });

        if (!code || !email) {
          setInviteError('Missing invite code or email');
          setValidatingInvite(false);
          return;
        }

        setInviteCode(code);
        setUserEmail(email);

        // Check if user is authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error('Not authenticated:', sessionError);
          setInviteError('Please click the magic link in your email to continue');
          setValidatingInvite(false);
          return;
        }

        // Validate the invite code
        const response = await fetch('/api/auth/validate-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: email.toLowerCase(), 
            inviteCode: code 
          })
        });

        const data = await response.json();

        if (!response.ok || !data.valid) {
          setInviteError(data.error || 'Invalid or expired invite code');
          setValidatingInvite(false);
          return;
        }

        // Invite is valid
        console.log('Invite validated successfully');
        setValidatingInvite(false);
        setLoading(false);

      } catch (error) {
        console.error('Validation error:', error);
        setInviteError('Failed to validate invite code');
        setValidatingInvite(false);
      }
    };

    validateInvite();
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('Your session has expired. Please request a new magic link.');
        router.push('/');
        return;
      }

      // Submit application
      const response = await fetch('/api/applications/submit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          ...formData,
          email: userEmail,
          inviteCode: inviteCode,
          userId: session.user.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      // Redirect to payment
      router.push('/subscribe');

    } catch (error) {
      console.error('Submit error:', error);
      alert(error.message || 'Failed to submit application');
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Show loading state while validating
  if (validatingInvite) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-400 mx-auto mb-4" />
          <p className="text-zinc-400">Validating your invitation...</p>
        </div>
      </div>
    );
  }

  // Show error if invite is invalid
  if (inviteError) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Invalid Invitation</h2>
            <p className="text-zinc-300 mb-6">{inviteError}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black/95 backdrop-blur-sm border-b border-zinc-800 py-4 px-4 md:px-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="#D4AF37" strokeWidth="2" fill="none"/>
              <circle cx="20" cy="20" r="12" stroke="#D4AF37" strokeWidth="1.5" fill="none"/>
              <circle cx="20" cy="20" r="6" fill="#D4AF37"/>
            </svg>
            <div>
              <span className="font-bold text-lg md:text-xl block leading-none">The Circle Network</span>
              <span className="text-xs text-amber-400 uppercase tracking-wider">Founding Member Application</span>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-medium">Invitation Verified</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Welcome to The Circle</h1>
          <p className="text-zinc-400">Complete your application to secure your founding member spot</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8 space-y-8">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-bold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                  placeholder="CEO, Founder, VP of Sales, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Company <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                  placeholder="Company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Bio <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white resize-none"
                  placeholder="Tell us about yourself, your background, and what you do..."
                />
              </div>
            </div>
          </div>

          {/* Expertise */}
          <div>
            <h2 className="text-xl font-bold mb-4">Your Expertise</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Areas of Expertise <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.expertise.join(', ')}
                  onChange={(e) => handleChange('expertise', e.target.value.split(',').map(s => s.trim()))}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                  placeholder="e.g., Marketing, Sales, Product Development, etc. (comma-separated)"
                />
                <p className="text-xs text-zinc-500 mt-1">Separate multiple areas with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  What You Need Help With <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.needs.join(', ')}
                  onChange={(e) => handleChange('needs', e.target.value.split(',').map(s => s.trim()))}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                  placeholder="e.g., Finding investors, Hiring talent, etc. (comma-separated)"
                />
                <p className="text-xs text-zinc-500 mt-1">Separate multiple needs with commas</p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h2 className="text-xl font-bold mb-4">Social Profiles (Optional)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">LinkedIn</label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => handleChange('linkedin', e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Twitter / X</label>
                <input
                  type="url"
                  value={formData.twitter}
                  onChange={(e) => handleChange('twitter', e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-zinc-800">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Continue to Payment'
              )}
            </button>
            <p className="text-center text-sm text-zinc-500 mt-4">
              Next: Secure your $199/mo founding member rate
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-400 mx-auto mb-4" />
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    }>
      <ApplyPageContent />
    </Suspense>
  );
}
