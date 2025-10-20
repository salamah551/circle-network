'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { ArrowRight, ArrowLeft, CheckCircle, Sparkles, Loader2 } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface OnboardingData {
  strategicGoal: string;
  dealPreferences: string;
  reputationKeywords: string;
  industries: string[];
  geos: string[];
  competitorWatch: string;
}

const INDUSTRY_OPTIONS = [
  'Technology/SaaS',
  'Fintech',
  'Healthcare',
  'E-commerce',
  'Real Estate',
  'Consumer Products',
  'B2B Services',
  'Manufacturing',
  'Media/Entertainment',
  'Education',
  'Other'
];

const GEO_OPTIONS = [
  'North America',
  'Europe',
  'Asia Pacific',
  'Latin America',
  'Middle East',
  'Africa',
  'Global/No Preference'
];

export default function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState<OnboardingData>({
    strategicGoal: '',
    dealPreferences: '',
    reputationKeywords: '',
    industries: [],
    geos: [],
    competitorWatch: ''
  });

  const steps = [
    {
      id: 'strategic-goal',
      title: 'What is your primary strategic goal?',
      description: 'Help us understand what you want to achieve in the next 12 months',
      field: 'strategicGoal',
      type: 'textarea',
      placeholder: 'e.g., Raise Series A funding, find strategic partners, expand into new markets, hire key executives...',
      required: true
    },
    {
      id: 'deal-preferences',
      title: 'What types of investment opportunities interest you?',
      description: 'If you invest, tell us what you look for',
      field: 'dealPreferences',
      type: 'textarea',
      placeholder: 'e.g., Early-stage SaaS, $1M-5M checks, B2B focus, or "Not an active investor"',
      required: false
    },
    {
      id: 'industries',
      title: 'Which industries are you focused on?',
      description: 'Select all that apply',
      field: 'industries',
      type: 'multi-select',
      options: INDUSTRY_OPTIONS,
      required: true
    },
    {
      id: 'geos',
      title: 'Which geographies are you focused on?',
      description: 'Select all that apply',
      field: 'geos',
      type: 'multi-select',
      options: GEO_OPTIONS,
      required: true
    },
    {
      id: 'reputation',
      title: 'What should we monitor for reputation management?',
      description: 'Keywords related to you, your company, or your brand',
      field: 'reputationKeywords',
      type: 'textarea',
      placeholder: 'e.g., Your name, company name, brand names, product names (comma-separated)',
      required: false
    },
    {
      id: 'competitors',
      title: 'Which competitors or companies should we track?',
      description: 'For competitive intelligence (optional)',
      field: 'competitorWatch',
      type: 'textarea',
      placeholder: 'e.g., Company names you want to track (comma-separated)',
      required: false
    }
  ];

  const currentStepData = steps[currentStep];

  const handleInputChange = (value: string | string[]) => {
    setFormData({
      ...formData,
      [currentStepData.field]: value
    });
  };

  const handleNext = () => {
    // Validate required fields
    if (currentStepData.required) {
      const value = formData[currentStepData.field as keyof OnboardingData];
      if (!value || (Array.isArray(value) && value.length === 0)) {
        setError('This field is required');
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

  const handleBack = () => {
    setError('');
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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

      // Call calibrate API
      const response = await fetch('/api/onboarding/calibrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
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

  const toggleMultiSelect = (option: string) => {
    const currentValue = formData[currentStepData.field as keyof OnboardingData] as string[];
    const newValue = currentValue.includes(option)
      ? currentValue.filter(v => v !== option)
      : [...currentValue, option];
    handleInputChange(newValue);
  };

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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            AI-Powered Onboarding
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Answer a few questions to calibrate your AI suite. This ensures you get the most relevant connections, deal flow, and intelligence.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-500">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-amber-400 font-semibold">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-3">
            {currentStepData.title}
          </h2>
          <p className="text-zinc-400 mb-6">
            {currentStepData.description}
          </p>

          {/* Input Field */}
          {currentStepData.type === 'textarea' && (
            <textarea
              value={formData[currentStepData.field as keyof OnboardingData] as string}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={currentStepData.placeholder}
              rows={5}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          )}

          {currentStepData.type === 'multi-select' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentStepData.options?.map((option) => {
                const isSelected = (formData[currentStepData.field as keyof OnboardingData] as string[]).includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => toggleMultiSelect(option)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected ? 'bg-amber-500 border-amber-500' : 'border-zinc-600'
                      }`}>
                        {isSelected && <CheckCircle className="w-4 h-4 text-black" />}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
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
                <span>Next</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Skip Link */}
        {!currentStepData.required && (
          <div className="text-center mt-6">
            <button
              onClick={handleNext}
              className="text-zinc-500 hover:text-zinc-400 text-sm transition-colors"
            >
              Skip this step →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
