'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { ArrowRight, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

const supabase = getSupabaseBrowserClient();

// Industry options for searchable dropdown
const INDUSTRY_OPTIONS = [
  'Technology',
  'Finance',
  'Healthcare',
  'Real Estate',
  'Manufacturing',
  'Retail',
  'Education',
  'Media & Entertainment',
  'Energy',
  'Transportation',
  'Telecommunications',
  'Hospitality',
  'Legal',
  'Consulting',
  'Marketing & Advertising',
  'E-commerce',
  'Biotechnology',
  'Pharmaceuticals',
  'Agriculture',
  'Construction',
  'Other'
];

// Goal options
const GOAL_OPTIONS = [
  { id: 'cost-savings', label: 'Cost & Vendor Savings', description: 'Reduce expenses and find better deals' },
  { id: 'competitive-intel', label: 'Competitive Intelligence', description: 'Stay ahead of market trends' },
  { id: 'networking', label: 'High-Value Networking', description: 'Connect with industry leaders' },
  { id: 'travel', label: 'Travel Optimization', description: 'Better travel experiences and deals' },
  { id: 'investment', label: 'Investment & Deal Flow', description: 'Access exclusive opportunities' }
];

// Travel frequency options
const TRAVEL_OPTIONS = [
  { value: 0, label: 'Rarely' },
  { value: 25, label: 'Quarterly' },
  { value: 50, label: 'Monthly' },
  { value: 75, label: 'Weekly' },
  { value: 100, label: 'Constantly' }
];

interface QuizData {
  industry: string;
  goals: string[];
  travelFrequency: number;
  motivation: string;
}

export default function NeedsAssessmentQuiz() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<QuizData>({
    industry: '',
    goals: [],
    travelFrequency: 25,
    motivation: ''
  });

  const steps = [
    {
      id: 'industry',
      title: 'What is your primary professional landscape?',
      required: true
    },
    {
      id: 'goals',
      title: 'Which area of leverage is most critical for you right now?',
      subtitle: '(Select up to two)',
      required: true
    },
    {
      id: 'travel',
      title: 'How often does your work take you on the road?',
      required: true
    },
    {
      id: 'motivation',
      title: 'In one sentence, what do you hope to achieve as part of The Circle?',
      required: false
    }
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    // Validate required fields
    if (currentStepData.required) {
      if (currentStepData.id === 'industry' && !formData.industry) {
        setError('Please select your industry');
        return;
      }
      if (currentStepData.id === 'goals' && formData.goals.length === 0) {
        setError('Please select at least one goal');
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

      // Call API to save needs assessment
      const response = await fetch('/api/needs-assessment/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to save assessment' }));
        throw new Error(data.error || 'Failed to save assessment');
      }

      // Show success message
      setShowSuccess(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err: any) {
      console.error('Assessment submit error:', err);
      setError(err.message || 'An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const toggleGoal = (goalId: string) => {
    if (formData.goals.includes(goalId)) {
      setFormData({
        ...formData,
        goals: formData.goals.filter(g => g !== goalId)
      });
    } else {
      // Limit to 2 selections
      if (formData.goals.length < 2) {
        setFormData({
          ...formData,
          goals: [...formData.goals, goalId]
        });
      } else {
        setError('You can select up to two goals');
      }
    }
  };

  const filteredIndustries = INDUSTRY_OPTIONS.filter(industry =>
    industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Your dashboard is now personalized to your needs. Let's get started.
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
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-500">
              Question {currentStep + 1} of {steps.length}
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
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-8 min-h-[400px]">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {currentStepData.title}
          </h2>
          {currentStepData.subtitle && (
            <p className="text-zinc-400 mb-6 text-lg">
              {currentStepData.subtitle}
            </p>
          )}

          {/* Question 1: Industry (Searchable Dropdown) */}
          {currentStepData.id === 'industry' && (
            <div className="mt-8">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search industries..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 mb-4"
              />
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {filteredIndustries.map((industry) => (
                  <button
                    key={industry}
                    onClick={() => {
                      setFormData({ ...formData, industry });
                      setSearchTerm('');
                    }}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                      formData.industry === industry
                        ? 'bg-amber-500/20 border-amber-500 text-white focus:ring-amber-500/50'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 focus:ring-zinc-700'
                    }`}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Question 2: Goals (Multi-select cards, max 2) */}
          {currentStepData.id === 'goals' && (
            <div className="mt-8 space-y-3">
              {GOAL_OPTIONS.map((goal) => {
                const isSelected = formData.goals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-white focus:ring-amber-500/50'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 focus:ring-zinc-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300 ${
                        isSelected ? 'bg-amber-500 border-amber-500' : 'border-zinc-600'
                      }`}>
                        {isSelected && <CheckCircle className="w-5 h-5 text-black" />}
                      </div>
                      <div>
                        <div className="font-semibold mb-1">{goal.label}</div>
                        <div className="text-sm opacity-80">{goal.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Question 3: Travel Profile (Slider) */}
          {currentStepData.id === 'travel' && (
            <div className="mt-8">
              <div className="mb-8">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="25"
                  value={formData.travelFrequency}
                  onChange={(e) => setFormData({ ...formData, travelFrequency: parseInt(e.target.value) })}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between mt-4">
                  {TRAVEL_OPTIONS.map((option) => (
                    <span
                      key={option.value}
                      className={`text-sm transition-colors ${
                        formData.travelFrequency === option.value
                          ? 'text-amber-400 font-semibold'
                          : 'text-zinc-500'
                      }`}
                    >
                      {option.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-center text-zinc-400 text-lg mt-12">
                Selected: <span className="text-white font-semibold">
                  {TRAVEL_OPTIONS.find(o => o.value === formData.travelFrequency)?.label}
                </span>
              </div>
            </div>
          )}

          {/* Question 4: Motivation (Text input) */}
          {currentStepData.id === 'motivation' && (
            <div className="mt-8">
              <input
                type="text"
                value={formData.motivation}
                onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                placeholder="Share your vision..."
                maxLength={200}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
              />
              <div className="text-right text-sm text-zinc-600 mt-2">
                {formData.motivation.length}/200
              </div>
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
            className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:ring-offset-2 focus:ring-offset-black"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-black"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                <span>Complete</span>
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

        {/* Skip Link for Optional Questions */}
        {!currentStepData.required && (
          <div className="text-center mt-6">
            <button
              onClick={handleNext}
              className="text-zinc-500 hover:text-zinc-400 text-sm transition-all duration-300 focus:outline-none focus:text-zinc-300"
            >
              Skip this step →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
