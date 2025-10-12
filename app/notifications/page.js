'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Bell, CheckCircle, AlertCircle } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (!error) setItems(data || []);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <Bell className="w-5 h-5 text-amber-400" />
        </div>
        <h1 className="text-xl font-semibold text-white">Notifications</h1>
      </div>

      {loading ? (
        <div className="text-white/60">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-white/60">No notifications yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map(n => (
            <div key={n.id} className="p-4 rounded-xl bg-zinc-900 border border-white/10 flex items-center gap-3">
              {n.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
              <div className="flex-1">
                <div className="text-white">{n.title || n.type}</div>
                {n.message && <div className="text-sm text-white/60">{n.message}</div>}
              </div>
              <div className="text-xs text-white/40">{new Date(n.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
