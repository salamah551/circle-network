'use client';
import { useState } from 'react';
import { 
  X, ChevronRight, ChevronLeft, Users, MessageSquare, 
  Calendar, HelpCircle, Sparkles, CheckCircle 
} from 'lucide-react';

const ONBOARDING_STEPS = [
  {
    icon: Sparkles,
    title: 'Welcome to The Circle!',
    description: 'You\'re now part of an exclusive community of 100 high-performing professionals. Here\'s how to make the most of your membership.',
    action: 'Get Started',
    color: 'from-amber-500 to-amber-600'
  },
  {
    icon: Users,
    title: 'Discover Members',
    description: 'Browse the member directory to find professionals in finance, tech, consulting, and commerce. Filter by expertise and connect with those who can help you.',
    action: 'Explore Directory',
    link: '/members',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: MessageSquare,
    title: 'Start Conversations',
    description: 'Direct message any member to introduce yourself, ask for advice, or explore collaboration opportunities. Real connections happen here.',
    action: 'View Messages',
    link: '/messages',
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    icon: Calendar,
    title: 'Join Events',
    description: 'Attend exclusive virtual and in-person events. From masterclasses to networking dinners, these are where deals happen.',
    action: 'See Events',
    link: '/events',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: HelpCircle,
    title: 'Post Requests',
    description: 'Need an intro, looking for talent, or seeking expertise? Post a request and get help from the community within hours.',
    action: 'Browse Requests',
    link: '/requests',
    color: 'from-orange-500 to-orange-600'
  },
  {
    icon: CheckCircle,
    title: 'You\'re All Set!',
    description: 'Remember: Give value first, build genuine relationships, and leverage the collective wisdom of The Circle. Your success is our success.',
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
          >
            <X className="w-6 h-6" />
          </button>

          <div className={`bg-gradient-to-r ${step.color} p-12 rounded-t-2xl text-center`}>
            <Icon className="w-20 h-20 text-white mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-3">{step.title}</h2>
            <p className="text-white/90 text-lg max-w-lg mx-auto">{step.description}</p>
          </div>

          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={isLastStep}
                className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors"
              >
                Skip Tour
              </button>
              <button
                onClick={handleActionClick}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-lg transition-all"
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
