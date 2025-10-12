'use client';
import { Lock, Calendar } from 'lucide-react';

export default function FeatureLockedCard({ title, description, unlockDate = 'November 1, 2025' }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-emerald-500/5" />
      <div className="relative p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500/20 to-emerald-500/20 flex items-center justify-center">
          <Lock className="w-8 h-8 text-amber-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-zinc-400 mb-4">{description}</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <Calendar className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-amber-400 font-medium">
            Unlocks {unlockDate}
          </span>
        </div>
      </div>
    </div>
  );
}
