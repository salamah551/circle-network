'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import {
  Database, MessageSquare, Search, Settings, 
  Loader2, CheckCircle, AlertCircle, ArrowLeft,
  Upload, Play, FileText, GitBranch, Shield
} from 'lucide-react';
import {
  ingestKnowledge,
  askQuestion,
  auditInfrastructure,
  applyChanges,
  getIngestionStats
} from './actions';

export default function OpsConsolePage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'ingest' | 'ask' | 'audit'>('ingest');
  
  // Ingest state
  const [ingestMode, setIngestMode] = useState<'priority' | 'full'>('priority');
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState<any>(null);
  const [ingestError, setIngestError] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  
  // Ask state
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [answer, setAnswer] = useState<any>(null);
  const [askError, setAskError] = useState<string>('');
  
  // Audit state
  const [auditScope, setAuditScope] = useState<'all' | 'supabase' | 'vercel' | 'stripe'>('all');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [auditError, setAuditError] = useState<string>('');
  const [selectedChanges, setSelectedChanges] = useState<string[]>([]);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
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

        if (!mounted) return;
        setIsAdmin(true);
        setUserId(session.user.id);
        
        // Load initial stats
        const statsResult = await getIngestionStats(session.user.id);
        if (statsResult.success) {
          setStats(statsResult.data?.statistics);
        }
      } catch (e: any) {
        if (!mounted) return;
        router.push('/login');
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [router, supabase]);

  const handleIngest = async () => {
    setIsIngesting(true);
    setIngestError('');
    setIngestResult(null);
    
    try {
      const result = await ingestKnowledge(userId, ingestMode);
      if (result.success) {
        setIngestResult(result.data);
        // Refresh stats
        const statsResult = await getIngestionStats(userId);
        if (statsResult.success) {
          setStats(statsResult.data?.statistics);
        }
      } else {
        setIngestError(result.error || 'Failed to ingest knowledge');
      }
    } catch (e: any) {
      setIngestError(e.message || 'Unexpected error');
    } finally {
      setIsIngesting(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    
    setIsAsking(true);
    setAskError('');
    setAnswer(null);
    
    try {
      const result = await askQuestion(userId, question);
      if (result.success) {
        setAnswer(result.data);
      } else {
        setAskError(result.error || 'Failed to get answer');
      }
    } catch (e: any) {
      setAskError(e.message || 'Unexpected error');
    } finally {
      setIsAsking(false);
    }
  };

  const handleAudit = async () => {
    setIsAuditing(true);
    setAuditError('');
    setAuditResult(null);
    setSelectedChanges([]);
    
    try {
      const result = await auditInfrastructure(userId, auditScope);
      if (result.success) {
        setAuditResult(result.data);
      } else {
        setAuditError(result.error || 'Failed to audit infrastructure');
      }
    } catch (e: any) {
      setAuditError(e.message || 'Unexpected error');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleApply = async () => {
    if (selectedChanges.length === 0) return;
    
    setIsApplying(true);
    
    try {
      const result = await applyChanges(userId, selectedChanges, true);
      if (result.success) {
        // Refresh audit
        await handleAudit();
      } else {
        setAuditError(result.error || 'Failed to apply changes');
      }
    } catch (e: any) {
      setAuditError(e.message || 'Unexpected error');
    } finally {
      setIsApplying(false);
    }
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
      <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-amber-400" />
              <div>
                <span className="font-bold text-lg block leading-none">AI Ops Control Plane</span>
                <span className="text-xs text-amber-400">Knowledge-Aware Operations Console</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="bg-gradient-to-br from-amber-900/20 to-amber-800/10 border border-amber-500/30 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            Secure Operations Console
          </h2>
          <p className="text-zinc-400 text-sm">
            All operations use server actions with admin verification. API tokens and secrets never leave the server.
            This console provides end-to-end management: ingest documentation → ask questions → audit infrastructure.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab('ingest')}
            className={`px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'ingest'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Ingest Knowledge
            </span>
          </button>
          <button
            onClick={() => setActiveTab('ask')}
            className={`px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'ask'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Ask Questions
            </span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'audit'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Audit Infrastructure
            </span>
          </button>
        </div>

        {/* Ingest Tab */}
        {activeTab === 'ingest' && (
          <div className="space-y-6">
            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="text-sm text-zinc-500 mb-1">Total Chunks</div>
                  <div className="text-2xl font-bold text-white">{stats.total_chunks || 0}</div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="text-sm text-zinc-500 mb-1">Markdown Files</div>
                  <div className="text-2xl font-bold text-white">{stats.by_type?.markdown || 0}</div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="text-sm text-zinc-500 mb-1">Code Files</div>
                  <div className="text-2xl font-bold text-white">{stats.by_type?.code || 0}</div>
                </div>
              </div>
            )}

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Ingest Repository Knowledge</h3>
              <p className="text-zinc-400 text-sm mb-6">
                Ingest documentation and code into the vector database for RAG-based Q&A.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Ingestion Mode
                  </label>
                  <select
                    value={ingestMode}
                    onChange={(e) => setIngestMode(e.target.value as 'priority' | 'full')}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                    disabled={isIngesting}
                  >
                    <option value="priority">Priority Documents Only (Recommended)</option>
                    <option value="full">Full Repository (Slower)</option>
                  </select>
                  <p className="text-xs text-zinc-500 mt-1">
                    Priority mode ingests key documentation files. Full mode includes all markdown and code files.
                  </p>
                </div>

                <button
                  onClick={handleIngest}
                  disabled={isIngesting}
                  className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-black disabled:text-zinc-500 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isIngesting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Ingesting...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Start Ingestion
                    </>
                  )}
                </button>
              </div>

              {ingestError && (
                <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-red-400">Error</div>
                    <div className="text-sm text-red-300">{ingestError}</div>
                  </div>
                </div>
              )}

              {ingestResult && (
                <div className="mt-4 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-emerald-400">Ingestion Complete</div>
                      <div className="text-sm text-emerald-300 mt-1">
                        Mode: {ingestResult.mode} | 
                        Total: {ingestResult.summary?.total || 0} | 
                        Success: {ingestResult.summary?.success || 0} | 
                        Failed: {ingestResult.summary?.failed || 0}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ask Tab */}
        {activeTab === 'ask' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Ask Questions (RAG)</h3>
              <p className="text-zinc-400 text-sm mb-6">
                Ask questions about the codebase, documentation, and configuration. Answers are generated using RAG over the knowledge base.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Your Question
                  </label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g., How does the onboarding flow work? What are the pricing tiers?"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white min-h-[100px]"
                    disabled={isAsking}
                  />
                </div>

                <button
                  onClick={handleAsk}
                  disabled={isAsking || !question.trim()}
                  className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-black disabled:text-zinc-500 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isAsking ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Get Answer
                    </>
                  )}
                </button>
              </div>

              {askError && (
                <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-red-400">Error</div>
                    <div className="text-sm text-red-300">{askError}</div>
                  </div>
                </div>
              )}

              {answer && (
                <div className="mt-6 space-y-4">
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-400 mb-2">Answer</h4>
                    <div className="text-white whitespace-pre-wrap">{answer.answer}</div>
                  </div>

                  {answer.citations && answer.citations.length > 0 && (
                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                      <h4 className="font-semibold text-amber-400 mb-2">Sources</h4>
                      <div className="space-y-2">
                        {answer.citations.map((citation: any, idx: number) => (
                          <div key={idx} className="text-sm text-zinc-300 flex items-start gap-2">
                            <FileText className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-medium">[{citation.index}]</span>{' '}
                              {citation.source} 
                              {citation.similarity && (
                                <span className="text-zinc-500 ml-2">
                                  ({Math.round(citation.similarity * 100)}% match)
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Audit Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Audit Infrastructure</h3>
              <p className="text-zinc-400 text-sm mb-6">
                Check infrastructure against desired state defined in ops/desired_state.yaml.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Audit Scope
                  </label>
                  <select
                    value={auditScope}
                    onChange={(e) => setAuditScope(e.target.value as any)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                    disabled={isAuditing}
                  >
                    <option value="all">All (Supabase + Vercel + Stripe)</option>
                    <option value="supabase">Supabase Only</option>
                    <option value="vercel">Vercel Only</option>
                    <option value="stripe">Stripe Only</option>
                  </select>
                </div>

                <button
                  onClick={handleAudit}
                  disabled={isAuditing}
                  className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-black disabled:text-zinc-500 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isAuditing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Auditing...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Run Audit
                    </>
                  )}
                </button>
              </div>

              {auditError && (
                <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-red-400">Error</div>
                    <div className="text-sm text-red-300">{auditError}</div>
                  </div>
                </div>
              )}

              {auditResult && (
                <div className="mt-6 space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                      <div className="text-sm text-zinc-500 mb-1">Total Changes</div>
                      <div className="text-2xl font-bold text-white">
                        {auditResult.summary?.total_changes || 0}
                      </div>
                    </div>
                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                      <div className="text-sm text-zinc-500 mb-1">High Severity</div>
                      <div className="text-2xl font-bold text-red-400">
                        {auditResult.summary?.by_severity?.high || 0}
                      </div>
                    </div>
                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                      <div className="text-sm text-zinc-500 mb-1">Can Auto-Apply</div>
                      <div className="text-2xl font-bold text-emerald-400">
                        {auditResult.summary?.can_auto_apply || 0}
                      </div>
                    </div>
                  </div>

                  {/* Changes List */}
                  {auditResult.changes && auditResult.changes.length > 0 && (
                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                      <h4 className="font-semibold text-amber-400 mb-4">Detected Changes</h4>
                      <div className="space-y-3">
                        {auditResult.changes.map((change: any) => (
                          <div key={change.id} className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedChanges.includes(change.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedChanges([...selectedChanges, change.id]);
                                      } else {
                                        setSelectedChanges(selectedChanges.filter(id => id !== change.id));
                                      }
                                    }}
                                    className="w-4 h-4"
                                  />
                                  <span className="font-medium text-white">{change.type}</span>
                                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                    change.severity === 'high' 
                                      ? 'bg-red-500/20 text-red-400'
                                      : change.severity === 'medium'
                                      ? 'bg-amber-500/20 text-amber-400'
                                      : 'bg-emerald-500/20 text-emerald-400'
                                  }`}>
                                    {change.severity}
                                  </span>
                                </div>
                                <p className="text-sm text-zinc-400 mb-2">{change.description}</p>
                                <p className="text-xs text-zinc-500">
                                  Scope: {change.scope} | 
                                  Action: {change.recommended_action}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {selectedChanges.length > 0 && (
                        <button
                          onClick={handleApply}
                          disabled={isApplying}
                          className="mt-4 w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          {isApplying ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Applying...
                            </>
                          ) : (
                            <>
                              <GitBranch className="w-5 h-5" />
                              Apply {selectedChanges.length} Change{selectedChanges.length !== 1 ? 's' : ''} (Generate PR)
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {auditResult.changes && auditResult.changes.length === 0 && (
                    <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <div>
                        <div className="font-semibold text-emerald-400">No Changes Needed</div>
                        <div className="text-sm text-emerald-300">Infrastructure matches desired state.</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
