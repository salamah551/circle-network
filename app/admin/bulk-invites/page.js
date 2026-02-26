'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { 
  ArrowLeft, Upload, Send, Users, Mail, 
  TrendingUp, Clock, Loader2, Plus, Eye,
  Download, AlertCircle, CheckCircle, X, FileDown, ExternalLink
} from 'lucide-react';

const supabase = getSupabaseBrowserClient();

export default function BulkInvitesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(100);
  const [selectedPersona, setSelectedPersona] = useState('wildcard');
  const [recipients, setRecipients] = useState([{ firstName: '', lastName: '', email: '' }]);
  const [duplicates, setDuplicates] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

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
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      if (!profile?.is_admin) {
        router.push('/dashboard');
        return;
      }

      await loadCampaigns();
      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
    }
  };

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('bulk_invite_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const createCampaign = async () => {
    if (!campaignName.trim()) return;

    setIsCreating(true);
    try {
      const session = await supabase.auth.getSession();
      const { data, error } = await supabase
        .from('bulk_invite_campaigns')
        .insert({
          name: campaignName,
          created_by: session.data.session.user.id,
          daily_limit: dailyLimit,
          persona: selectedPersona
        })
        .select()
        .single();

      if (error) throw error;

      setShowCreateModal(false);
      setCampaignName('');
      setSelectedCampaign(data);
      setShowUploadModal(true);
      await loadCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign');
    } finally {
      setIsCreating(false);
    }
  };

  const addRecipientRow = () => {
    setRecipients([...recipients, { firstName: '', lastName: '', email: '' }]);
  };

  const addMultipleRows = (count) => {
    const newRows = Array(count).fill(null).map(() => ({ firstName: '', lastName: '', email: '' }));
    setRecipients([...recipients, ...newRows]);
  };

  const clearAllRows = () => {
    if (confirm('Clear all recipients? This cannot be undone.')) {
      setRecipients([{ firstName: '', lastName: '', email: '' }]);
      setDuplicates([]);
    }
  };

  const removeRecipientRow = (index) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const updateRecipient = (index, field, value) => {
    const updated = [...recipients];
    updated[index][field] = value;
    setRecipients(updated);
  };

  const checkDuplicates = async () => {
    const emails = recipients.map(r => r.email.toLowerCase().trim()).filter(e => e);
    
    // Check for duplicates within the form
    const emailCounts = {};
    emails.forEach(email => {
      emailCounts[email] = (emailCounts[email] || 0) + 1;
    });
    const formDuplicates = Object.keys(emailCounts).filter(email => emailCounts[email] > 1);

    // Check against existing recipients in campaign
    const { data: existing } = await supabase
      .from('bulk_invites') // <<< CORRECTED TABLE NAME
      .select('email')
      .eq('campaign_id', selectedCampaign.id)
      .in('email', emails);

    const existingEmails = existing?.map(r => r.email.toLowerCase()) || [];
    
    const allDuplicates = [...new Set([...formDuplicates, ...existingEmails])];
    setDuplicates(allDuplicates);
    
    return allDuplicates; // Return array instead of boolean
  };

  const uploadRecipients = async () => {
    if (!selectedCampaign) return;

    // Validate all fields are filled
    const validRecipients = recipients.filter(r => 
      r.firstName.trim() && r.lastName.trim() && r.email.trim()
    );

    if (validRecipients.length === 0) {
      alert('Please fill in all fields for at least one recipient');
      return;
    }

    setIsUploading(true);
    try {
      // Check for duplicates
      const foundDuplicates = await checkDuplicates();
      if (foundDuplicates.length > 0) {
        alert(`Duplicate emails found: ${foundDuplicates.join(', ')}`);
        setIsUploading(false);
        return;
      }

      setUploadProgress(30);

      const session = await supabase.auth.getSession();
      const response = await fetch('/api/bulk-invites/track/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`
        },
        body: JSON.stringify({
          campaignId: selectedCampaign.id,
          recipients: validRecipients.map(r => ({
            firstName: r.firstName,
            lastName: r.lastName,
            email: r.email
          }))
        })
      });

      setUploadProgress(80);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      setUploadProgress(100);
      setShowUploadModal(false);
      setRecipients([{ firstName: '', lastName: '', email: '' }]);
      setDuplicates([]);
      await loadCampaigns();
      const result = await response.json();
      alert(`Successfully added ${result.inserted || 0} recipients! Skipped: ${Object.values(result.skipped || {}).reduce((a, b) => a + b, 0)}`);
    } catch (error) {
      console.error('Error uploading:', error);
      alert(`Failed to upload recipients: ${error.message}`);
    } finally {
      setUploadProgress(0);
      setIsUploading(false);
    }
  };

  const startCampaign = async (campaignId) => {
    if (!confirm('Start this campaign? It will change status to active and begin sending emails according to the daily limit.')) return;

    try {
      const session = await supabase.auth.getSession();
      
      // First, activate the campaign
      const activateResponse = await fetch('/api/bulk-invites/campaigns/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`
        },
        body: JSON.stringify({ campaignId })
      });

      if (!activateResponse.ok) {
        const errorData = await activateResponse.json();
        throw new Error(errorData.error || 'Failed to activate campaign');
      }

      // Optionally trigger first send immediately
      const sendResponse = await fetch('/api/bulk-invites/track/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`
        },
        body: JSON.stringify({ campaignId })
      });

      await loadCampaigns();
      
      if (sendResponse.ok) {
        const sendResult = await sendResponse.json();
        alert(`Campaign activated! Sent ${sendResult.sent || 0} initial emails.`);
      } else {
        alert('Campaign activated! Emails will be sent according to schedule.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to start campaign: ${error.message}`);
    }
  };

  // ... (rest of your component is unchanged) ...
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold">Bulk Invites</h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Campaign
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-400 mb-2">How Bulk Invites Work</h3>
              <ul className="text-sm text-zinc-300 space-y-1">
                <li>• Add recipients with inline form (First Name, Last Name, Email)</li>
                <li>• Automatic duplicate checking against existing recipients</li>
                <li>• System processes max 100 invites/day</li>
                <li>• 4-email sequence: Day 0, Day 3, Day 7, Day 14</li>
                <li>• Auto-stops if recipient converts or unsubscribes</li>
                <li>• Full tracking: opens, clicks, conversions</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {campaigns.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl">
              <Mail className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No campaigns yet</h3>
              <p className="text-zinc-400 mb-6">Create your first bulk invite campaign</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors"
              >
                Create Campaign
              </button>
            </div>
          ) : (
            campaigns.map(campaign => (
              <div key={campaign.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{campaign.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        campaign.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : campaign.status === 'draft'
                          ? 'bg-zinc-700 text-zinc-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {campaign.status === 'draft' && campaign.total_recipients > 0 && (
                      <button
                        onClick={() => startCampaign(campaign.id)}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Start Campaign
                      </button>
                    )}
                    {campaign.status === 'draft' && (
                      <button
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setShowUploadModal(true);
                        }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Recipients
                      </button>
                    )}
                    <button
                      onClick={() => router.push(`/admin/bulk-invites/${campaign.id}`)}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{campaign.total_recipients}</div>
                    <div className="text-xs text-zinc-500">Recipients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{campaign.total_sent}</div>
                    <div className="text-xs text-zinc-500">Sent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{campaign.total_opened}</div>
                    <div className="text-xs text-zinc-500">Opened</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-400">{campaign.total_clicked}</div>
                    <div className="text-xs text-zinc-500">Clicked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">{campaign.total_converted}</div>
                    <div className="text-xs text-zinc-500">Converted</div>
                  </div>
                </div>

                {campaign.total_sent > 0 && (
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Conversion Rate:</span>
                      <span className="text-emerald-400 font-bold">
                        {((campaign.total_converted / campaign.total_sent) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Create New Campaign</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Q4 2025 Founder Outreach"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Target Persona
                </label>
                <select
                  value={selectedPersona}
                  onChange={(e) => setSelectedPersona(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="founder">Founder (Startup CEOs)</option>
                  <option value="operator">Operator (VPs, Directors)</option>
                  <option value="investor">Investor (VCs, Angels)</option>
                  <option value="executive">Executive (C-suite)</option>
                  <option value="wildcard">Wildcard (General)</option>
                </select>
                <p className="text-xs text-zinc-500 mt-1">Email templates will match this persona</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Daily Email Limit
                </label>
                <input
                  type="number"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(parseInt(e.target.value) || 100)}
                  min="1"
                  max="100"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-xs text-zinc-500 mt-1">Max 100 invites/day</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createCampaign}
                disabled={!campaignName.trim() || isCreating}
                className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Campaign'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Add Recipients</h3>
                <p className="text-zinc-400 text-sm">Campaign: {selectedCampaign.name}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-400">{recipients.length}</div>
                <div className="text-xs text-zinc-500">Recipients</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-6 p-4 bg-zinc-800/50 rounded-lg">
              <span className="text-sm text-zinc-400 mr-2">Quick Add:</span>
              <button
                onClick={() => addMultipleRows(10)}
                className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-md transition-colors"
              >
                +10 Rows
              </button>
              <button
                onClick={() => addMultipleRows(25)}
                className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-md transition-colors"
              >
                +25 Rows
              </button>
              <button
                onClick={() => addMultipleRows(50)}
                className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-md transition-colors"
              >
                +50 Rows
              </button>
              <button
                onClick={clearAllRows}
                className="ml-auto px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-md transition-colors"
              >
                Clear All
              </button>
            </div>
            
            <div className="space-y-2 mb-6 max-h-[400px] overflow-y-auto pr-2">
              <div className="flex items-center gap-3 text-xs font-medium text-zinc-400 px-3 pb-2 sticky top-0 bg-zinc-900 z-10">
                <div className="w-8 text-center">#</div>
                <div className="flex-1">First Name</div>
                <div className="flex-1">Last Name</div>
                <div className="flex-1">Email</div>
                <div className="w-10"></div>
              </div>

              {recipients.map((recipient, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 text-center text-zinc-500 text-sm">{index + 1}</div>
                  <input
                    type="text"
                    value={recipient.firstName}
                    onChange={(e) => updateRecipient(index, 'firstName', e.target.value)}
                    placeholder="John"
                    className={`flex-1 px-3 py-2 bg-zinc-800 border ${
                      duplicates.includes(recipient.email.toLowerCase().trim()) 
                        ? 'border-red-500' 
                        : 'border-zinc-700'
                    } rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  />
                  <input
                    type="text"
                    value={recipient.lastName}
                    onChange={(e) => updateRecipient(index, 'lastName', e.target.value)}
                    placeholder="Doe"
                    className={`flex-1 px-3 py-2 bg-zinc-800 border ${
                      duplicates.includes(recipient.email.toLowerCase().trim()) 
                        ? 'border-red-500' 
                        : 'border-zinc-700'
                    } rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  />
                  <input
                    type="email"
                    value={recipient.email}
                    onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                    placeholder="john@example.com"
                    className={`flex-1 px-3 py-2 bg-zinc-800 border ${
                      duplicates.includes(recipient.email.toLowerCase().trim()) 
                        ? 'border-red-500' 
                        : 'border-zinc-700'
                    } rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  />
                  <button
                    onClick={() => removeRecipientRow(index)}
                    disabled={recipients.length === 1}
                    className="w-10 h-10 flex items-center justify-center text-red-400 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}

              <button
                onClick={addRecipientRow}
                className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Another Recipient
              </button>
            </div>

            {duplicates.length > 0 && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400">
                  <strong>Duplicate emails found:</strong> {duplicates.join(', ')}
                </p>
              </div>
            )}

            {uploadProgress > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-zinc-400">Adding recipients...</span>
                  <span className="text-amber-400 font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div 
                    className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setRecipients([{ firstName: '', lastName: '', email: '' }]);
                  setDuplicates([]);
                  setUploadProgress(0);
                }}
                className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={uploadRecipients}
                disabled={isUploading || uploadProgress > 0}
                className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Add Recipients
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}