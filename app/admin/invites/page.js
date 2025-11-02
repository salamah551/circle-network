'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { Download, Upload, RefreshCw, Archive } from 'lucide-react';

// Use singleton browser client to prevent "Multiple GoTrueClient instances" warning
const supabase = getSupabaseBrowserClient();

export default function InvitesAdminPage() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // Load latest invites; adjust table name if your schema differs.
        const { data, error } = await supabase
          .from('bulk_invites')
          .select('id, full_name, email, company, title, status, campaign_id, created_at')
          .order('created_at', { ascending: false })
          .limit(500);
        if (error) throw error;
        if (mounted) setInvites(data || []);
      } catch (e) {
        if (mounted) setErr(e.message || 'Failed to load invites.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function act(url) {
    setMsg('');
    setErr('');
    try {
      const res = await fetch(url, { method: 'POST' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Request failed');
      setMsg('Action completed.');
    } catch (e) {
      setErr(e.message || 'Request failed.');
    }
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-semibold mb-2">Bulk Invites</h1>
      <p className="text-white/60 mb-6">
        Download the CSV template, fill it, and upload. You can also resend or archive individual invites.
      </p>

      {msg && (
        <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-emerald-200">
          {msg}
        </div>
      )}
      {err && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-red-200">
          {err}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <a
          href="/api/bulk-invites/template"
          className="px-3 py-2 rounded-lg bg-zinc-800 border border-white/10 inline-flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download CSV Template
        </a>

        <form
          action="/api/bulk-invites/upload"
          method="post"
          encType="multipart/form-data"
          className="inline-flex items-center gap-2"
        >
          <input type="file" name="file" accept=".csv" className="text-sm" required />
          <button
            className="px-3 py-2 rounded-lg bg-amber-500 text-black inline-flex items-center gap-2"
            type="submit"
          >
            <Upload className="w-4 h-4" />
            Upload CSV
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/60">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Company</th>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Campaign</th>
              <th className="text-left p-3">Sent</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="p-4 text-white/60" colSpan={8}>Loading…</td>
              </tr>
            )}

            {!loading && invites.length === 0 && (
              <tr>
                <td className="p-4 text-white/60" colSpan={8}>No invites yet.</td>
              </tr>
            )}

            {invites.map((inv) => (
              <tr key={inv.id} className="border-t border-white/10">
                <td className="p-3">{inv.full_name || '-'}</td>
                <td className="p-3">{inv.email}</td>
                <td className="p-3">{inv.company || '-'}</td>
                <td className="p-3">{inv.title || '-'}</td>
                <td className="p-3">{inv.status || '-'}</td>
                <td className="p-3">{inv.campaign_id ? String(inv.campaign_id).slice(0, 8) : '-'}</td>
                <td className="p-3">
                  {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : '-'}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => act(`/api/bulk-invites/resend?id=${encodeURIComponent(inv.id)}`)}
                    className="px-2 py-1 rounded bg-zinc-800 border border-white/10 mr-2 inline-flex items-center gap-1"
                    title="Resend"
                    type="button"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Resend
                  </button>

                  <button
                    onClick={() => act(`/api/bulk-invites/archive?id=${encodeURIComponent(inv.id)}`)}
                    className="px-2 py-1 rounded bg-zinc-800 border border-white/10 inline-flex items-center gap-1"
                    title="Archive"
                    type="button"
                  >
                    <Archive className="w-3 h-3" />
                    Archive
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
