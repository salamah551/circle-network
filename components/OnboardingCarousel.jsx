'use client';
import { useState } from 'react';
import { 
  X, ChevronRight, ChevronLeft, Users, MessageSquare, 
  Calendar, Target, Sparkles, CheckCircle, GraduationCap,
  TrendingUp, Bookmark, Bell
} from 'lucide-react';

const ONBOARDING_STEPS = [
  {
    icon: Sparkles,
    title: 'Welcome to Circle Network!',
    description: 'You\'ve been selected to join an exclusive community of elite professionals. This quick tour will show you how to maximize your membership and build valuable connections.',
    action: 'Get Started',
    color: 'from-amber-500 to-amber-600'
  },
  {
    icon: Sparkles,
    title: 'Strategic Intros (Always Available)',
    description: 'Every week, our AI analyzes the network and recommends 3 high-value connections just for you. Accept intros to unlock automated introductions via email. This feature is always available!',
    action: 'View Intros',
    link: '/intros',
    color: 'from-amber-500 to-yellow-500'
  },
  {
    icon: Users,
    title: 'Browse Members',
    description: 'Discover and connect with founders, investors, and executives. Search by expertise, filter by industry, and send direct messages to anyone. Build relationships that matter.',
    action: 'Explore Directory',
    link: '/members',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: MessageSquare,
    title: 'Direct Messaging',
    description: 'Have private conversations with any member. Your unread message count appears on the dashboard and resets to 0 when you visit Messages - keeping you organized.',
    action: 'View Messages',
    link: '/messages',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Click the bell icon to see new messages and intro matches. Click "Mark all as read" to clear notifications and reset your count to 0. Stay on top of important updates!',
    action: 'Next',
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    icon: Target,
    title: 'Request Board',
    description: 'Need help? Post a request for introductions, advice, partnerships, or expertise. The community responds within hours. Helping others earns you Impact Score points.',
    action: 'Browse Requests',
    link: '/requests',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: TrendingUp,
    title: 'Value Exchange Marketplace',
    description: 'Post what you OFFER (expertise, intros, resources) and what you ASK for. Filter by category, search by keyword, and earn Impact Score points for every fulfilled exchange.',
    action: 'Explore Exchange',
    link: '/exchange',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    icon: GraduationCap,
    title: 'Expert Sessions',
    description: 'Book 1-on-1 consultation time with network experts. Offer your own expertise too! Choose duration (15-120 min), set your availability, and build your reputation through reviews.',
    action: 'View Sessions',
    link: '/expert-sessions',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    icon: Bookmark,
    title: 'Saved Items',
    description: 'Bookmark members, requests, events, and exchanges for later. Access all your saved content in one place - your personal knowledge hub.',
    action: 'View Saved',
    link: '/saved',
    color: 'from-amber-500 to-orange-500'
  },
  {
    icon: Calendar,
    title: 'Exclusive Events',
    description: 'Join virtual and in-person gatherings, masterclasses, and networking dinners. RSVP to events, add to your calendar, and connect with attendees in real life.',
    action: 'See Events',
    link: '/events',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: CheckCircle,
    title: 'You\'re All Set!',
    description: 'Pro tips: Give value first, respond to requests, accept intros, and book expert sessions. Your Impact Score grows as you help others. Welcome to Circle Network!',
    action: 'Start Exploring',
    color: 'from-amber-500 to-amber-600'
  }
];

export default function OnboardingCarousel({ onComplete, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = ONBOARDING_STEPS[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleActionClick = () => {
    if (step.link) {
      window.location.href = step.link;
    } else {
      handleNext();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full shadow-2xl">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors z-10"
            data-testid="button-close-onboarding"
          >
            <X className="w-6 h-6" />
          </button>

          <div className={`bg-gradient-to-r ${step.color} p-12 rounded-t-2xl text-center`}>
            <Icon className="w-20 h-20 text-white mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-3">{step.title}</h2>
            <p className="text-white/90 text-lg max-w-lg mx-auto leading-relaxed">{step.description}</p>
          </div>

          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                data-testid="button-onboarding-prev"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              <div className="flex gap-2">
                {ONBOARDING_STEPS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'bg-amber-500 w-8'
                        : index < currentStep
                        ? 'bg-amber-500/50'
                        : 'bg-zinc-700'
                    }`}
                    data-testid={`dot-onboarding-${index}`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={isLastStep}
                className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                data-testid="button-onboarding-next"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors"
                data-testid="button-skip-tour"
              >
                Skip Tour
              </button>
              <button
                onClick={handleActionClick}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-lg transition-all"
                data-testid="button-onboarding-action"
              >
                {step.action}
              </button>
            </div>

            <p className="text-center text-zinc-500 text-sm mt-4">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
