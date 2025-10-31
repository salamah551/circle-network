'use client';

import { useState } from 'react';

export default function OpsAdminPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setAnswer(null);

    try {
      // In production, this would use actual auth token
      const response = await fetch('/api/ops/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          generatePlan: true,
          maxResults: 10,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get answer');
      }

      setAnswer(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleIngest = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ops/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          forceReindex: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to ingest');
      }

      alert(`Ingestion complete: ${data.message}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlan = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ops/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectors: ['supabase', 'storage', 'vercel', 'stripe'],
          saveToDatabase: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate plan');
      }

      alert(`Plan generated: ${data.summary.total_changes} changes detected`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">AI Ops Control Plane</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Actions Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="space-x-4">
          <button
            onClick={handleIngest}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Ingest Knowledge'}
          </button>
          <button
            onClick={handlePlan}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Generate Plan'}
          </button>
        </div>
      </div>

      {/* Q&A Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Ask AI Ops</h2>
        
        <div className="mb-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about the infrastructure... e.g., 'What are the pricing tiers and ARC caps?'"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
        </div>

        <button
          onClick={handleAsk}
          disabled={loading || !question.trim()}
          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Thinking...' : 'Ask Question'}
        </button>

        {answer && (
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2">Answer</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="whitespace-pre-wrap">{answer.answer}</p>
            </div>

            {answer.sources && answer.sources.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Sources ({answer.sources.length})</h4>
                <ul className="space-y-1 text-sm">
                  {answer.sources.map((source, idx) => (
                    <li key={idx} className="text-gray-600">
                      📄 {source.path} ({(source.similarity * 100).toFixed(1)}% match)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {answer.metadata && (
              <div className="text-sm text-gray-600">
                <span className="font-semibold">Confidence:</span>{' '}
                {(answer.confidence * 100).toFixed(1)}%
                {answer.metadata.needs_action && (
                  <span className="ml-4 text-orange-600">
                    ⚠️ Action Required: {answer.metadata.action_type}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Documentation */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-2">📖 Documentation</h3>
        <p className="text-gray-700 mb-2">
          The AI Ops Control Plane is a knowledge-aware system that can answer questions about
          the platform and help manage infrastructure.
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>
            <strong>Ingest Knowledge:</strong> Indexes documentation and code into the knowledge base
          </li>
          <li>
            <strong>Generate Plan:</strong> Compares desired state with current infrastructure
          </li>
          <li>
            <strong>Ask Questions:</strong> Use RAG to get answers about the platform
          </li>
        </ul>
        <p className="text-gray-600 text-sm mt-4">
          See <code className="bg-white px-2 py-1 rounded">ops/README.md</code> for full documentation.
        </p>
      </div>
    </div>
  );
}
