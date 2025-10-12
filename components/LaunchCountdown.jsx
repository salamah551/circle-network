'use client';
import { useEffect, useState } from 'react';

export default function LaunchCountdown({ target }) {
  const [remaining, setRemaining] = useState({ d:0,h:0,m:0,s:0 });

  useEffect(() => {
    const targetDate = new Date(target);
    const tick = () => {
      const now = new Date();
      const diff = Math.max(0, targetDate - now);
      const d = Math.floor(diff / (1000*60*60*24));
      const h = Math.floor((diff / (1000*60*60)) % 24);
      const m = Math.floor((diff / (1000*60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setRemaining({ d,h,m,s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur">
      <span className="text-sm text-white/60">Unlocks in</span>
      <div className="flex items-center gap-2 font-mono text-sm">
        <span className="px-2 py-1 rounded bg-black/30">{String(remaining.d).padStart(2,'0')}d</span>
        <span className="px-2 py-1 rounded bg-black/30">{String(remaining.h).padStart(2,'0')}h</span>
        <span className="px-2 py-1 rounded bg-black/30">{String(remaining.m).padStart(2,'0')}m</span>
        <span className="px-2 py-1 rounded bg-black/30">{String(remaining.s).padStart(2,'0')}s</span>
      </div>
    </div>
  );
}
