'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Loader2, AlertCircle } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugLog, setDebugLog] = useState([]);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const addLog = (message, data = null) => {
    console.log(message, data);
    setDebugLog(prev => [...prev, {
      time: new Date().toLocaleTimeString(),
      message,
      data: data ? JSON.stringify(data, null, 2) : null
    }]);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      addLog('🔍 Checking authentication...');
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        addLog('❌ Session error:', sessionError);
        throw sessionError;
      }

      if (!session) {
        addLog('❌ No session found, redirecting to login');
        router.push('/login');
        return;
      }

      addLog('✅ Session found', { userId: session.user.id, email: session.user.email });
      setUser(session.user);

      // Try to load profile
      addLog('🔍 Loading profile...');
      await loadProfile(session.user.id);

      setIsLoading(false);
      addLog('✅ Dashboard loaded successfully');

    } catch (error) {
      addLog('❌ Critical error:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  const loadProfile = async (userId) => {
    try {
      addLog('Querying profiles table for user_id:', userId);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        addLog('❌ Profile query error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // If profile doesn't exist, that's ok - might be a new user
        if (error.code === 'PGRST116') {
          addLog('⚠️ No profile found (this might be normal for new users)');
          return;
        }
        
        throw error;
      }

      if (data) {
        addLog('✅ Profile loaded successfully:', data);
        setProfile(data);
      } else {
        addLog('⚠️ No profile data returned');
      }

    } catch (error) {
      addLog('❌ Load profile error:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <h2 className="text-2xl font-bold text-red-400">Dashboard Error</h2>
            </div>
            <p className="text-white/80 mb-4">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg"
            >
              Back to Login
            </button>
          </div>

          {/* Debug Log */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Debug Log</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {debugLog.map((log, idx) => (
                <div key={idx} className="bg-zinc-800 rounded p-3">
                  <div className="text-xs text-zinc-500 mb-1">{log.time}</div>
                  <div className="text-sm text-white mb-1">{log.message}</div>
                  {log.data && (
                    <pre className="text-xs text-emerald-400 mt-2 overflow-x-auto">
                      {log.data}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-white mb-4">✅ Dashboard Loaded Successfully!</h1>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-emerald-400 mb-2">User Info:</h3>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-sm">
                <div className="text-white/60">ID: <span className="text-white">{user?.id}</span></div>
                <div className="text-white/60">Email: <span className="text-white">{user?.email}</span></div>
              </div>
            </div>

            {profile && (
              <div>
                <h3 className="text-lg font-semibold text-emerald-400 mb-2">Profile Info:</h3>
                <div className="bg-black/30 rounded-lg p-4 font-mono text-sm">
                  <div className="text-white/60">Name: <span className="text-white">{profile.full_name || profile.first_name || 'Not set'}</span></div>
                  <div className="text-white/60">Title: <span className="text-white">{profile.title || 'Not set'}</span></div>
                  <div className="text-white/60">Company: <span className="text-white">{profile.company || 'Not set'}</span></div>
                </div>
              </div>
            )}

            {!profile && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <p className="text-amber-400">⚠️ No profile found. You may need to complete your application first.</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => router.push('/members')}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg"
            >
              Go to Members
            </button>
            <button
              onClick={() => router.push('/requests')}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg"
            >
              Go to Requests (Debug)
            </button>
          </div>
        </div>

        {/* Debug Log */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Debug Log</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {debugLog.map((log, idx) => (
              <div key={idx} className="bg-zinc-800 rounded p-3">
                <div className="text-xs text-zinc-500 mb-1">{log.time}</div>
                <div className="text-sm text-white mb-1">{log.message}</div>
                {log.data && (
                  <pre className="text-xs text-emerald-400 mt-2 overflow-x-auto">
                    {log.data}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
