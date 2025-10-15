'use client';
import { useState, useEffect } from 'react';
import { Calendar, Rocket } from 'lucide-react';
import { isLaunched, msUntilLaunch, LAUNCH_DATE } from '@/lib/launch-config';

export default function PreLaunchBanner() {
  const [countdown, setCountdown] = useState('');
  const [launched, setLaunched] = useState(true);

  useEffect(() => {
    const updateCountdown = () => {
      const isNowLaunched = isLaunched();
      setLaunched(isNowLaunched);

      if (isNowLaunched) {
        setCountdown('');
        return;
      }

      const diff = msUntilLaunch();
      
      if (diff <= 0) {
        setCountdown('');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setCountdown(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m`);
      } else {
        setCountdown(`${minutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Don't show banner if launched
  if (launched) {
    return null;
  }

  const launchDateFormatted = LAUNCH_DATE.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York'
  });

  return (
    <div className="bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-emerald-500/10 border-b border-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-white">Platform Preview - Full Launch Coming Soon</div>
              <div className="text-sm text-zinc-400">All features unlock on {launchDateFormatted}</div>
            </div>
          </div>
          {countdown && (
            <div className="flex items-center gap-2 px-4 py-2 bg-black/30 rounded-lg border border-amber-500/30">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-mono font-bold text-amber-400">{countdown}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
