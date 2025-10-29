'use client';
import { useState, useEffect } from 'react';
import { Sparkles, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import DashboardWidget from './DashboardWidget';

/**
 * Action Center Widget
 * Central hub for ARC™ Engine requests and quick actions
 * Posts requests to /api/arc/request endpoint
 */
export default function ActionCenter() {
  const [arcInput, setArcInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Cleanup timeouts on unmount to prevent memory leaks
  useEffect(() => {
    let successTimeoutId = null;
    let errorTimeoutId = null;

    if (successMessage) {
      successTimeoutId = setTimeout(() => setSuccessMessage(''), 5000);
    }
    if (errorMessage) {
      errorTimeoutId = setTimeout(() => setErrorMessage(''), 5000);
    }

    return () => {
      if (successTimeoutId) clearTimeout(successTimeoutId);
      if (errorTimeoutId) clearTimeout(errorTimeoutId);
    };
  }, [successMessage, errorMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!arcInput.trim()) return;

    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      const response = await fetch('/api/arc/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request: arcInput })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }
      
      setSuccessMessage('Request submitted successfully! Check My ARC Briefs for updates.');
      setArcInput('');
    } catch (error) {
      console.error('Failed to submit ARC™ request:', error);
      setErrorMessage(error.message || 'Failed to submit request. Please try again.');
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
      
      <div className="relative z-10 space-y-6">
        {/* Explanatory copy */}
        <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl">
          This is your direct line to our AI concierge. Use it to request research, analyze documents, 
          find travel options, or get strategic insights. Your briefs are private and will be processed promptly.
        </p>

        {/* ARC™ Engine Input */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <input
              id="arc-action-input"
              type="text"
              value={arcInput}
              onChange={(e) => setArcInput(e.target.value)}
              placeholder="What can ARC™ help you with today? (e.g., 'Analyze this contract', 'Find upgrade options for flight UA-567')"
              className="w-full px-6 py-5 bg-black/50 border border-zinc-700 rounded-xl 
                       text-white placeholder-zinc-500 
                       focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                       transition-all duration-300
                       pr-16"
              disabled={isSubmitting}
              aria-label="ARC Action Center input"
            />
            <button
              type="submit"
              disabled={!arcInput.trim() || isSubmitting}
              aria-label="Submit request"
              className="absolute right-3 top-1/2 -translate-y-1/2
                       w-11 h-11 bg-amber-500 hover:bg-amber-600 
                       disabled:bg-zinc-800 disabled:cursor-not-allowed
                       rounded-lg flex items-center justify-center
                       transition-all duration-300
                       focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-black"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 text-black animate-spin" />
              ) : (
                <Send className="w-5 h-5 text-black" />
              )}
            </button>
          </div>
          
          {/* Success Message */}
          {successMessage && (
            <div className="mt-4 flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{successMessage}</p>
            </div>
          )}
          
          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}
        </form>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setArcInput('Analyze my upcoming travel schedule')}
            className="px-4 py-2.5 bg-zinc-800/50 hover:bg-zinc-800 
                     border border-zinc-700 rounded-lg text-sm text-zinc-300
                     transition-all duration-200 hover:text-white hover:border-zinc-600"
          >
            Analyze Travel
          </button>
          <button
            onClick={() => setArcInput('Find strategic networking opportunities')}
            className="px-4 py-2.5 bg-zinc-800/50 hover:bg-zinc-800 
                     border border-zinc-700 rounded-lg text-sm text-zinc-300
                     transition-all duration-200 hover:text-white hover:border-zinc-600"
          >
            Find Connections
          </button>
          <button
            onClick={() => setArcInput('Research competitive landscape')}
            className="px-4 py-2.5 bg-zinc-800/50 hover:bg-zinc-800 
                     border border-zinc-700 rounded-lg text-sm text-zinc-300
                     transition-all duration-200 hover:text-white hover:border-zinc-600"
          >
            Market Research
          </button>
        </div>
      </div>
    </DashboardWidget>
  );
}
