'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, Check, X, Eye, Loader2, Mail, MapPin, Linkedin, Briefcase } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminApplicationsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', session.user.id)
        .single();

      const adminEmails = ['nahdasheh@gmail.com', 'invite@thecirclenetwork.org'];
      if (!adminEmails.includes(profile?.email)) {
        router.push('/dashboard');
        return;
      }

      await loadApplications();
      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
    }
  };

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const updateApplicationStatus = async (appId, newStatus) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', appId);

      if (error) throw error;

      if (newStatus === 'approved') {
        const app = applications.find(a => a.id === appId);
        if (app) {
          await supabase
            .from('profiles')
            .update({ status: 'active' })
            .eq('id', app.user_id);
        }
      }

      await loadApplications();
      setShowModal(false);
      setSelectedApp(null);
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Failed to update application');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  const pendingApps = applications.filter(a => a.status === 'pending');
  const approvedApps = applications.filter(a => a.status === 'approved');
  const rejectedApps = applications.filter(a => a.status === 'rejected');

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Admin
              </button>
              <h1 className="text-2xl font-bold">Applications</h1>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-amber-400 font-semibold">{pendingApps.length} pending</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="text-3xl font-bold text-amber-400 mb-1">{pendingApps.length}</div>
            <div className="text-sm text-zinc-500">Pending Review</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="text-3xl font-bold text-emerald-400 mb-1">{approvedApps.length}</div>
            <div className="text-sm text-zinc-500">Approved</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="text-3xl font-bold text-red-400 mb-1">{rejectedApps.length}</div>
            <div className="text-sm text-zinc-500">Rejected</div>
          </div>
        </div>

        <div className="space-y-4">
          {applications.map(app => (
            <div key={app.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {app.full_name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{app.full_name}</h3>
                      <p className="text-amber-400 text-sm">{app.title}</p>
                      <p className="text-zinc-500 text-sm">{app.company}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-zinc-400 mb-4">
                    {app.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {app.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {app.email}
                    </span>
                  </div>

                  <p className="text-zinc-400 text-sm line-clamp-2 mb-3">{app.bio}</p>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-500">Applied:</span>
                    <span className="text-zinc-400">{new Date(app.created_at).toLocaleDateString()}</span>
                    <span className={`ml-2 px-3 py-1 rounded-full font-semibold ${
                      app.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-400'
                        : app.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedApp(app);
                      setShowModal(true);
                    }}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  {app.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateApplicationStatus(app.id, 'approved')}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(app.id, 'rejected')}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {applications.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No applications yet</h3>
            <p className="text-zinc-400">Applications will appear here as they come in</p>
          </div>
        )}
      </div>

      {showModal && selectedApp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Application Details</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-zinc-800 rounded-lg">
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="text-sm text-zinc-500 block mb-1">Full Name</label>
                <p className="text-white font-medium">{selectedApp.full_name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-zinc-500 block mb-1">Title</label>
                  <p className="text-white">{selectedApp.title}</p>
                </div>
                <div>
                  <label className="text-sm text-zinc-500 block mb-1">Company</label>
                  <p className="text-white">{selectedApp.company}</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-zinc-500 block mb-1">Bio</label>
                <p className="text-white whitespace-pre-wrap">{selectedApp.bio}</p>
              </div>

              {selectedApp.status === 'pending' && (
                <div className="flex gap-3 pt-6 border-t border-zinc-800">
                  <button
                    onClick={() => updateApplicationStatus(selectedApp.id, 'approved')}
                    className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg"
                  >
                    <Check className="w-5 h-5 inline mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(selectedApp.id, 'rejected')}
                    className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg"
                  >
                    <X className="w-5 h-5 inline mr-2" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

}
