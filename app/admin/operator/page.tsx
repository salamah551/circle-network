'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  ArrowLeft,
  Loader2,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AICommandCenter() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Task execution states
  const [executingTask, setExecutingTask] = useState<string | null>(null);
  const [outputData, setOutputData] = useState<any>(null);
  const [outputError, setOutputError] = useState<string | null>(null);
  
  // Error diagnosis form
  const [errorDescription, setErrorDescription] = useState('');

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session }, error: sessErr } = await supabase.auth.getSession();
      if (sessErr || !session) {
        router.push('/login');
        return;
      }

      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('is_admin, email')
        .eq('id', session.user.id)
        .single();

      if (profErr || !profile?.is_admin) {
        router.push('/dashboard');
        return;
      }

      setIsAdmin(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.push('/login');
    }
  };

  const executeTask = async (task: string, payload?: any) => {
    setExecutingTask(task);
    setOutputData(null);
    setOutputError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setOutputError('No active session');
        return;
      }

      const response = await fetch('/api/ai/operator', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task, payload }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        setOutputError(result.error || 'Task execution failed');
        return;
      }

      setOutputData(result);
    } catch (error) {
      console.error('Error executing task:', error);
      setOutputError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setExecutingTask(null);
    }
  };

  const handleDiagnoseError = () => {
    if (!errorDescription.trim()) {
      setOutputError('Please enter an error description');
      return;
    }
    executeTask('diagnose_error', { error_description: errorDescription });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
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
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-400" />
                <h1 className="text-2xl font-bold">AI Command Center</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <p className="text-zinc-400">
            Delegate operations to the AI. Monitor analytics, generate campaigns, and diagnose issues.
          </p>
        </div>

        {/* Two Main Sections */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Analytics & Strategic Insights */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold">Analytics & Strategic Insights</h2>
            </div>
            
            <p className="text-zinc-400 text-sm mb-6">
              Get AI-powered analysis of platform metrics and strategic recommendations.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => executeTask('analyze_analytics')}
                disabled={executingTask !== null}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {executingTask === 'analyze_analytics' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5" />
                    Ping Analytics Engine
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Community & Campaign Management */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold">Community & Campaign Management</h2>
            </div>
            
            <p className="text-zinc-400 text-sm mb-6">
              Generate and optimize campaigns to engage your community effectively.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => executeTask('generate_daily_campaigns')}
                disabled={executingTask !== null}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {executingTask === 'generate_daily_campaigns' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5" />
                    Ping Campaign Generator
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Diagnostics Section */}
        <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold">Error Diagnostics</h2>
          </div>
          
          <p className="text-zinc-400 text-sm mb-4">
            Describe any error or problem, and get AI-powered diagnostics and recommendations.
          </p>

          <div className="space-y-4">
            <textarea
              value={errorDescription}
              onChange={(e) => setErrorDescription(e.target.value)}
              placeholder="Describe the error or problem you're experiencing..."
              className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows={4}
              disabled={executingTask !== null}
            />

            <button
              onClick={handleDiagnoseError}
              disabled={executingTask !== null || !errorDescription.trim()}
              className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {executingTask === 'diagnose_error' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5" />
                  Get AI Recommendation
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Pane */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Output</h2>
          
          {executingTask && (
            <div className="flex items-center gap-3 text-amber-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Executing task: {executingTask}</span>
            </div>
          )}

          {!executingTask && !outputData && !outputError && (
            <p className="text-zinc-500 italic">
              No output yet. Click a button above to execute a task.
            </p>
          )}

          {outputError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-semibold mb-1">Error</p>
                  <p className="text-red-300 text-sm">{outputError}</p>
                </div>
              </div>
            </div>
          )}

          {outputData && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-400 font-semibold">Success</p>
                  <p className="text-zinc-400 text-sm">Task: {outputData.task}</p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-black rounded border border-zinc-700">
                <pre className="text-xs text-zinc-300 overflow-x-auto">
                  {JSON.stringify(outputData.data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
