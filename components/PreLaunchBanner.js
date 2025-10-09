'use client';
import { useState, useEffect } from 'react';
import { Calendar, Lock, Rocket } from 'lucide-react';
import { getCurrentLaunchPhase, getLaunchMessage, LAUNCH_CONFIG } from '@/lib/launch-config';

export default function PreLaunchBanner() {
  const [phase, setPhase] = useState(null);
  const [message, setMessage] = useState(null);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const updatePhase = () => {
      const currentPhase = getCurrentLaunchPhase();
      setPhase(currentPhase);
      setMessage(getLaunchMessage());
    };

    updatePhase();
    const interval = setInterval(updatePhase, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const targetDate = phase === LAUNCH_CONFIG.PHASE.PRE_INVITE 
        ? LAUNCH_CONFIG.INVITE_START_DATE 
        : LAUNCH_CONFIG.FULL_LAUNCH_DATE;
      
      const diff = targetDate - now;
      
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

    if (phase && phase !== LAUNCH_CONFIG.PHASE.FULL_LAUNCH) {
      updateCountdown();
      const interval = setInterval(updateCountdown, 60000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  if (!phase || !message || phase === LAUNCH_CONFIG.PHASE.FULL_LAUNCH) {
    return null;
  }

  const getIcon = () => {
    if (phase === LAUNCH_CONFIG.PHASE.PRE_INVITE) return Calendar;
    if (phase === LAUNCH_CONFIG.PHASE.INVITE_ONLY) return Lock;
    return Rocket;
  };

  const Icon = getIcon();

  return (
    <div className="bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-emerald-500/10 border-b border-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-white">{message.title}</div>
              <div className="text-sm text-zinc-400">{message.subtitle}</div>
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
