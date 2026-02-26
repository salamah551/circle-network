'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import {
  ArrowLeft, Plus, Trash2, Loader2, Calendar, Users, AlertCircle
} from 'lucide-react';

const EMPTY_PARTICIPANT = { name: '', email: '', title: '', company: '' };

export default function NewBriefPointPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [participants, setParticipants] = useState([{ ...EMPTY_PARTICIPANT }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const addParticipant = () => {
    setParticipants(prev => [...prev, { ...EMPTY_PARTICIPANT }]);
  };

  const removeParticipant = (index) => {
    setParticipants(prev => prev.filter((_, i) => i !== index));
  };

  const updateParticipant = (index, field, value) => {
    setParticipants(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!meetingTime) {
      setError('Meeting date and time is required.');
      return;
    }

    setSubmitting(true);
    try {
      // Filter out empty participants
      const filledParticipants = participants.filter(p =>
        p.name.trim() || p.email.trim() || p.title.trim() || p.company.trim()
      );

      const response = await fetchWithAuth('/api/briefpoint/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || 'Untitled Meeting',
          meetingTime,
          participants: filledParticipants,
          description: description.trim() || null,
          location: location.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || 'Failed to submit meeting brief.');
        return;
      }

      // Redirect to the new brief's detail page
      router.push(`/briefpoint/${data.id}`);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-zinc-900 rounded-lg transition-colors text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm">BriefPoint</span>
          </div>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400 text-sm">New Meeting Brief</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">New Meeting Brief</h1>
          <p className="text-zinc-400 text-sm">
            Submit your meeting details and BriefPoint will generate participant intelligence,
            strategic talking points, and opportunity analysis.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meeting Title */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Meeting Title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Partnership Discussion with Acme Corp"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Meeting Date/Time */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Date &amp; Time <span className="text-red-400">*</span>
            </label>
            <input
              type="datetime-local"
              value={meetingTime}
              onChange={e => setMeetingTime(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors [color-scheme:dark]"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Location <span className="text-zinc-600">(optional)</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Zoom, 123 Main St, or Conference Room A"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Participants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-zinc-300">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Participants <span className="text-zinc-600">(optional)</span>
                </span>
              </label>
              <button
                type="button"
                onClick={addParticipant}
                className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
              >
                <Plus className="w-3 h-3" />
                Add participant
              </button>
            </div>

            <div className="space-y-3">
              {participants.map((participant, index) => (
                <div key={index} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-zinc-500">Participant {index + 1}</span>
                    {participants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeParticipant(index)}
                        className="text-zinc-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={participant.name}
                      onChange={e => updateParticipant(index, 'name', e.target.value)}
                      placeholder="Full name"
                      className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <input
                      type="email"
                      value={participant.email}
                      onChange={e => updateParticipant(index, 'email', e.target.value)}
                      placeholder="Email"
                      className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <input
                      type="text"
                      value={participant.title}
                      onChange={e => updateParticipant(index, 'title', e.target.value)}
                      placeholder="Job title"
                      className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <input
                      type="text"
                      value={participant.company}
                      onChange={e => updateParticipant(index, 'company', e.target.value)}
                      placeholder="Company"
                      className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description / Agenda */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Agenda / Description <span className="text-zinc-600">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Share the meeting purpose, key topics, or any background context that will help generate a better brief..."
              rows={4}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !meetingTime}
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-zinc-700 disabled:to-zinc-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Brief...
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5" />
                Generate Meeting Brief
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
