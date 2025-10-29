'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function UpgradeButton({ lookupKey = 'founding_monthly', priceId, tier, className = '', children }) {
  const [loading, setLoading] = useState(false);
  const label = children || 'Upgrade';

  async function go() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert('Please sign in'); return; }

      const res = await fetch('/api/payments/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId: priceId || undefined,
          tier: tier || undefined
        }),
        credentials: 'include'
      });
      const json = await res.json();
      if (json?.url) window.location.href = json.url;
      else alert(json?.error || 'Unable to start checkout');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={go}
      disabled={loading}
      className={className || 'px-4 py-2 rounded-lg bg-amber-500 text-black font-medium hover:bg-amber-400'}
    >
      {loading ? 'Redirecting…' : label}
    </button>
  );
}

export function ManageBillingButton({ className = '', children }) {
  const [loading, setLoading] = useState(false);
  const label = children || 'Manage Billing';

  async function go() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert('Please sign in'); return; }

      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'x-user-id': user.id }
      });
      const json = await res.json();
      if (json?.url) window.location.href = json.url;
      else alert(json?.error || 'Unable to open billing portal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={go}
      disabled={loading}
      className={className || 'px-4 py-2 rounded-lg bg-zinc-800 border border-white/10 text-white hover:bg-zinc-700'}
    >
      {loading ? 'Opening…' : label}
    </button>
  );
}
