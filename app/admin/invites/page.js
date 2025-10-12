'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Download, Upload, Plus, Search, Users, Loader2, Filter, Send, FileDown } from 'lucide-react';


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminInvitesPage() {
  const searchParams = useSearchParams();
  const defaultCampaignId = searchParams.get('campaignId') || null;

  const [campaigns, setCampaigns] = useState([]);
  const [campaignId, setCampaignId] = useState(defaultCampaignId);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  // Manual add form
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    company: '',
    title: '',
    notes: '',
    code: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    if (campaignId) loadInvites(campaignId);
  }, [campaignId]);

  const loadCampaigns = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bulk_invite_campaigns')
      .select('id,name,created_at')
      .order('created_at', { ascending: false });
    if (!error) setCampaigns(data || []);
    if (!defaultCampaignId && data && data.length) setCampaignId(data[0].id);
    setLoading(false);
  };

  const loadInvites = async (cid) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bulk_invites')
      .select('id,full_name,email,code,meta,created_at,status,company,title')
      .eq('campaign_id', cid)
      .order('created_at', { ascending: false });
    if (!error) setInvites(data || []);
    setLoading(false);
  };

  const onDownloadTemplate = () => {
    window.location.href = '/api/bulk-invites/template';
  };

  const onExportCampaign = () => {
    if (!campaignId) return;
    window.location.href = '/api/bulk-invites/export?campaignId=' + campaignId;
  };

  const onAddInvite = async (e) => {
    e.preventDefault();
    if (!campaignId) return;
    if (!form.email?.trim()) return;
    setSubmitting(true);

    // Dedupe within campaign (client-side sanity)
    const exists = invites.some(v => v.email?.toLowerCase() === form.email.trim().toLowerCase());
    if (exists) {
      alert('This email already exists in the selected campaign.');
      setSubmitting(false);
      return;
    }

    const payload = {
      campaign_id: campaignId,
      full_name: form.full_name || null,
      email: form.email.trim(),
      code: form.code || null,
      company: form.company || null,
      title: form.title || null,
      meta: { notes: form.notes || '' }
    };

    const { error } = await supabase.from('bulk_invites').insert(payload);
    if (error) {
      alert(error.message);
    } else {
      setForm({ full_name:'', email:'', company:'', title:'', notes:'', code:'' });
      await loadInvites(campaignId);
    }
    setSubmitting(false);
  };

  const filtered = invites.filter(v => {
    const s = (q || '').toLowerCase();
    if (!s) return true;
    return [v.full_name, v.email, v.company, v.title, v.code, v.status].filter(Boolean).join(' ').toLowerCase().includes(s);
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Invites</h1>
            <p className="text-white/60 text-sm">View, add, and export invites per campaign.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onDownloadTemplate} className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-sm border border-white/10 flex items-center gap-2">
            <FileDown className="w-4 h-4" /> CSV Template
          </button>
          <button onClick={onExportCampaign} className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-sm border border-white/10 flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-3">
            <select value={campaignId || ''} onChange={e => setCampaignId(e.target.value)} className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white/90 w-72">
              <option value="">Select Campaign</option>
              {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-3" />
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search invites…" className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white/90" />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-zinc-950 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900/60">
                <tr className="text-left text-white/60">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Company</th>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Status</th>
                  <th className=\"px-3 py-2\">Created</th><th className=\"px-3 py-2\">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id} className="border-t border-white/5">
                    <td className="px-3 py-2">{v.full_name || '-'}</td>
                    <td className="px-3 py-2">{v.email}</td>
                    <td className="px-3 py-2">{v.company || '-'}</td>
                    <td className="px-3 py-2">{v.title || '-'}</td>
                    <td className="px-3 py-2">{v.code || '-'}</td>
                    <td className="px-3 py-2">{v.status}</td>
                    <td className="px-3 py-2">{new Date(v.created_at).toLocaleString()}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="7" className="px-3 py-6 text-center text-white/50">No invites found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Single Invite</h3>
            <form onSubmit={onAddInvite} className="space-y-2">
              <input value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})} placeholder="Full name" className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white/90" />
              <input required value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="Email *" className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white/90" />
              <input value={form.company} onChange={e=>setForm({...form, company:e.target.value})} placeholder="Company" className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white/90" />
              <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Title" className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white/90" />
              <input value={form.code} onChange={e=>setForm({...form, code:e.target.value})} placeholder="Invite code (optional)" className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white/90" />
              <textarea value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} placeholder="Notes" className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white/90 min-h-[80px]" />
              <button disabled={!campaignId || submitting} className="w-full px-3 py-2 rounded-lg bg-amber-500 text-black font-medium hover:bg-amber-400 disabled:opacity-50">
                {submitting ? 'Adding…' : 'Add to Campaign'}
              </button>
            </form>
            <div className="mt-4 text-xs text-white/50">
              Tip: You can <a href="/api/bulk-invites/template" className="underline">download the CSV template</a>, fill it, then upload from Bulk Invites.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
