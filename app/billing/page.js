'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { UpgradeButton, ManageBillingButton } from '@/components/BillingButtons';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function BillingPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from('profiles')
        .select('subscription_status, stripe_price_id, stripe_product_id, current_period_end, status')
        .eq('id', user.id)
        .single();
      setProfile(data || null);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="max-w-3xl mx-auto p-6 text-white/80">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-semibold">Billing</h1>
      <p className="text-white/60 mb-6">Manage your membership subscription.</p>

      <div className="rounded-2xl border border-white/10 p-6 bg-zinc-950">
        <div className="text-sm text-white/60 mb-2">Membership status</div>
        <div className="text-white text-lg font-medium">
          {profile?.subscription_status || 'not_subscribed'}
        </div>
        {profile?.current_period_end && (
          <div className="text-white/60 text-sm mt-1">
            Current period ends: {new Date(profile.current_period_end).toLocaleString()}
          </div>
        )}

        <div className="flex items-center gap-3 mt-6">
          <UpgradeButton lookupKey="founding_monthly" />
          <ManageBillingButton />
        </div>

        <div className="text-white/50 text-xs mt-4">
          Upgrading starts a Stripe subscription. Manage or cancel anytime in the Billing Portal.
        </div>
      </div>
    </div>
  );
}
