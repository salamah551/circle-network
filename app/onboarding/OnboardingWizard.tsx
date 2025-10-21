'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { ArrowRight, CheckCircle, Sparkles, Loader2 } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface OnboardingData {
  strategicSyncSkills: string;
  dealFlowCriteria: string;
  reputationKeywords: string;
}

interface UserProfile {
  name: string;
  full_name?: string;
  first_name?: string;
  primaryGoal?: string;
  strategic_goal?: string;
}

export default function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const [formData, setFormData] = useState<OnboardingData>({
    strategicSyncSkills: '',
    dealFlowCriteria: '',
    reputationKeywords: ''
  });

  // Fetch user profile on mount
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // Fetch user profile from database
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, first_name, name, strategic_goal, primary_goal')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          // Continue with basic user data from auth
          setUserProfile({
            name: user.email?.split('@')[0] || 'User',
            primaryGoal: 'growing your network and finding strategic opportunities'
          });
        } else {
          const userName = profile?.first_name || profile?.full_name || profile?.name || user.email?.split('@')[0] || 'User';
          const userGoal = profile?.strategic_goal || profile?.primary_goal || 'growing your network and finding strategic opportunities';
          
          setUserProfile({
            name: userName,
            primaryGoal: userGoal
          });
        }
      } catch (err) {
        console.error('Error in fetchUserProfile:', err);
        setUserProfile({
          name: 'User',
          primaryGoal: 'growing your network and finding strategic opportunities'
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserProfile();
  }, [router]);

  const steps = [
    {
      id: 'strategic-sync',
      title: 'Strategic Sync AI',
      question: 'To find your most valuable connections, what specific skills or expertise are you looking for in a new introduction?',
      field: 'strategicSyncSkills',
      placeholder: 'e.g., Series A fundraising experience, B2B SaaS marketing expertise, healthcare regulatory knowledge...',
      required: true
    },
    {
      id: 'deal-flow',
      title: 'Deal Flow AI',
      question: 'To find your ideal opportunities, what is your target investment size and preferred industry sectors?',
      field: 'dealFlowCriteria',
      placeholder: 'e.g., $500K-$2M seed rounds in fintech and healthcare, or "Not currently investing"',
      required: true
    },
    {
      id: 'reputation-guardian',
      title: 'Reputation Guardian AI',
      question: 'To protect your digital footprint, what are the key phrases, brand names, or projects you want me to monitor?',
      field: 'reputationKeywords',
      placeholder: 'e.g., Your name, company name, product names, key projects (comma-separated)',
      required: true
    }
  ];

  const currentStepData = steps[currentStep];

  const handleInputChange = (value: string) => {
    setFormData({
      ...formData,
      [currentStepData.field]: value
    });
  };

  const handleNext = () => {
    // Validate required fields
    if (currentStepData.required) {
      const value = formData[currentStepData.field as keyof OnboardingData];
      if (!value || value.trim() === '') {
        setError('Please provide an answer to continue');
        return;
      }
    }

    setError('');
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Get session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Session expired. Please log in again.');
        setIsSubmitting(false);
        return;
      }

      // Call calibrate API with the collected data
      const response = await fetch('/api/onboarding/calibrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          strategicGoal: formData.strategicSyncSkills,
          dealPreferences: formData.dealFlowCriteria,
          reputationKeywords: formData.reputationKeywords
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save onboarding data');
      }

      // Show success message
      setShowSuccess(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err: any) {
      console.error('Onboarding submit error:', err);
      setError(err.message || 'Failed to complete onboarding');
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            All Set! 🎉
          </h1>
          <p className="text-zinc-400 mb-6">
            Your AI suite is now calibrated. Your first strategic introductions will arrive next Monday.
          </p>
          <p className="text-sm text-zinc-500">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Welcome Header - shown only on first question */}
        {currentStep === 0 && userProfile && (
          <div className="text-center mb-12 animate-fade-in">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Welcome, {userProfile.name} 👋
            </h1>
            <p className="text-xl text-zinc-300 mb-2">
              My purpose is to help you achieve:
            </p>
            <p className="text-2xl font-semibold text-amber-400 mb-6">
              "{userProfile.primaryGoal}"
            </p>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Let's calibrate your AI suite with a few quick questions. This ensures you receive the most relevant connections, opportunities, and intelligence.
            </p>
          </div>
        )}

        {/* Compact header for subsequent questions */}
        {currentStep > 0 && (
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-zinc-500">
              Question {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-amber-400 font-semibold">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 md:p-10 mb-8 shadow-xl">
          {/* AI Service Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">{currentStepData.title}</span>
          </div>

          {/* Question */}
          <h2 className="text-2xl md:text-3xl font-bold mb-6 leading-snug">
            {currentStepData.question}
          </h2>

          {/* Input Field */}
          <textarea
            value={formData[currentStepData.field as keyof OnboardingData]}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={currentStepData.placeholder}
            rows={5}
            autoFocus
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 text-white text-lg placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
          />

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Navigation Button */}
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-xl transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-amber-500/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                <span>Complete Setup</span>
                <CheckCircle className="w-5 h-5" />
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-zinc-500">
            Your responses help us personalize your experience
          </p>
        </div>
      </div>
    </div>
  );
}
