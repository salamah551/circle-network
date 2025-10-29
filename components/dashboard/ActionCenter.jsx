'use client';
import { useState } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import DashboardWidget from './DashboardWidget';

/**
 * Action Center Widget
 * Central hub for ARC™ Engine requests and quick actions
 */
export default function ActionCenter() {
  const [arcInput, setArcInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!arcInput.trim()) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/arc/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request: arcInput })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit request');
      }
      
      const data = await response.json();
      console.log('ARC™ Request submitted:', data);
      
      showToast('ARC is processing your brief.', 'success');
      setArcInput('');
    } catch (error) {
      console.error('Failed to submit ARC™ request:', error);
      showToast(error.message || 'Failed to submit request. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardWidget
      title="ARC™ Action Center"
      icon={Sparkles}
      size="hero"
      iconColor="text-amber-400"
      iconBg="bg-amber-500/10"
      className="relative overflow-hidden"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-purple-500/5 animate-pulse opacity-50" />
      
      <div className="relative z-10">
        <p className="text-zinc-400 mb-6 leading-relaxed">
          Tap into the power of AI to analyze contracts, find upgrade options, 
          research opportunities, and more. Your personal AI concierge is ready.
        </p>

        {/* ARC™ Engine Input */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <input
              type="text"
              value={arcInput}
              onChange={(e) => setArcInput(e.target.value)}
              placeholder="What can ARC™ help you with today? (e.g., 'Analyze this contract', 'Find upgrade options for flight UA-567')"
              className="w-full px-6 py-4 bg-black/50 border border-zinc-700 rounded-xl 
                       text-white placeholder-zinc-500 
                       focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                       transition-all duration-300
                       pr-14"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={!arcInput.trim() || isSubmitting}
              className="absolute right-2 top-1/2 -translate-y-1/2
                       w-10 h-10 bg-amber-500 hover:bg-amber-600 
                       disabled:bg-zinc-800 disabled:cursor-not-allowed
                       rounded-lg flex items-center justify-center
                       transition-all duration-300
                       focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 text-black animate-spin" />
              ) : (
                <Send className="w-5 h-5 text-black" />
              )}
            </button>
          </div>
        </form>

        {/* Quick Action Buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setArcInput('Analyze my upcoming travel schedule')}
            className="px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800 
                     border border-zinc-700 rounded-lg text-sm text-zinc-300
                     transition-all duration-200 hover:text-white"
          >
            Analyze Travel
          </button>
          <button
            onClick={() => setArcInput('Find strategic networking opportunities')}
            className="px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800 
                     border border-zinc-700 rounded-lg text-sm text-zinc-300
                     transition-all duration-200 hover:text-white"
          >
            Find Connections
          </button>
          <button
            onClick={() => setArcInput('Research competitive landscape')}
            className="px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800 
                     border border-zinc-700 rounded-lg text-sm text-zinc-300
                     transition-all duration-200 hover:text-white"
          >
            Market Research
          </button>
        </div>

        {/* Toast notification */}
        {toast && (
          <div className={`mt-4 p-4 rounded-lg border ${
            toast.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {toast.message}
          </div>
        )}
      </div>
    </DashboardWidget>
  );
}
