'use client';
import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

export default function SignalTicker() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSignals = async () => {
    try {
      const response = await fetch('/api/signals');
      if (!response.ok) throw new Error('Failed to fetch signals');
      const data = await response.json();
      setSignals(data);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching signals:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchSignals, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-y border-zinc-800 py-4">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 text-zinc-400">
            <Activity className="w-5 h-5 animate-pulse" />
            <span className="text-sm">Loading live signals...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || signals.length === 0) {
    return null; // Gracefully hide if there's an error or no signals
  }

  return (
    <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-y border-zinc-800 py-3 overflow-hidden">
      <div className="flex items-center gap-2 text-emerald-400 mb-2 px-6 max-w-6xl mx-auto">
        <Activity className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">Live Intelligence Feed</span>
      </div>
      
      <div className="relative">
        <div className="ticker-wrapper">
          <div className="ticker-content">
            {/* Duplicate signals for seamless loop */}
            {[...signals, ...signals].map((signal, index) => (
              <div key={index} className="ticker-item">
                <span className="text-zinc-500 text-sm font-mono mr-3">{signal.timestamp}</span>
                <span className="text-white/90 text-sm">{signal.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .ticker-wrapper {
          overflow: hidden;
          position: relative;
        }
        
        .ticker-content {
          display: flex;
          gap: 3rem;
          animation: scroll 60s linear infinite;
          white-space: nowrap;
        }
        
        .ticker-item {
          display: inline-flex;
          align-items: center;
          padding: 0 2rem;
          border-left: 2px solid rgba(52, 211, 153, 0.3);
        }
        
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .ticker-content:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
