'use client';

import { useEffect, useState } from 'react';
import { LAUNCH_DATE, isLaunched, msUntilLaunch } from '../../lib/launch-config';

function Countdown() {
  const [ms, setMs] = useState(msUntilLaunch());
  useEffect(() => {
    if (isLaunched()) return;
    const id = setInterval(() => setMs(msUntilLaunch()), 1000);
    return () => clearInterval(id);
  }, []);
  if (ms <= 0) return null;
  const total = Math.floor(ms / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return <span className="font-mono text-sm text-white/70">{d}d {h}h {m}m {s}s</span>;
}

export default function IntrosPage() {
  const launched = isLaunched();
  const [loading, setLoading] = useState(true);
  const [intros, setIntros] = useState([]);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/intros', { cache: 'no-store' });
      const data = await res.json();
      setIntros(Array.isArray(data?.intros) ? data.intros : []);
    } catch {
      setError('Unable to load intros right now.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (launched) load();
  }, [launched]);

  async function respond(introId, action) {
    // optimistic UI
    setIntros((items) =>
      items.map((i) => (i.id === introId ? { ...i, status: action } : i)),
    );
    try {
      await fetch('/api/intros/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ introId, action }),
      });
    } catch {
      // revert on failure
      setIntros((items) =>
        items.map((i) => (i.id === introId ? { ...i, status: 'pending' } : i)),
      );
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-semibold">Strategic Intros</h1>
        <p className="text-white/70 mt-2">
          Every Monday at 8am you’ll receive up to three high-value, mutual-fit introductions.
        </p>

        {!launched && (
          <div className="mt-8 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-900/10 to-zinc-950 p-6">
            <div className="text-amber-300 font-medium">Locked until launch</div>
            <div className="mt-1 text-white/80">
              All features unlock on {LAUNCH_DATE.toUTCString()} • <Countdown />
            </div>
          </div>
        )}

        {launched && (
          <div className="mt-8">
            {loading ? (
              <div className="text-white/70">Loading…</div>
            ) : error ? (
              <div className="text-red-400">{error}</div>
            ) : intros.length === 0 ? (
              <div className="text-white/70">
                No intros yet. As the network grows, your weekly matches will appear here.
              </div>
            ) : (
              <ul className="grid md:grid-cols-3 gap-6">
                {intros.map((intro) => (
                  <li
                    key={intro.id}
                    className="rounded-2xl border border-white/10 bg-zinc-950 p-5"
                  >
                    <div className="text-sm text-white/60">{intro.why || 'A high-value reason for this intro.'}</div>

                    <div className="mt-4">
                      <div className="text-lg font-semibold">
                        {intro.partner_name || 'Member'}
                      </div>
                      <div className="text-white/60 text-sm">
                        {intro.partner_title || ''}{intro.partner_company ? ` • ${intro.partner_company}` : ''}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => respond(intro.id, 'accepted')}
                        disabled={intro.status === 'accepted'}
                        className="flex-1 rounded-xl bg-emerald-500 text-black font-medium px-4 py-2 hover:bg-emerald-400 disabled:opacity-60"
                      >
                        {intro.status === 'accepted' ? 'Accepted' : 'Accept'}
                      </button>
                      <button
                        onClick={() => respond(intro.id, 'declined')}
                        disabled={intro.status === 'declined'}
                        className="flex-1 rounded-xl bg-zinc-900 border border-white/10 px-4 py-2 hover:bg-zinc-800 disabled:opacity-60"
                      >
                        {intro.status === 'declined' ? 'Passed' : 'Pass'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
