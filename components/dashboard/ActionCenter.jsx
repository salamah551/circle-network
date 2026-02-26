'use client';
import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Send, Loader2, CheckCircle, AlertCircle, 
  Paperclip, X, FileText, Plane, TrendingUp, 
  Users, MessageSquare, Target, Zap, LogIn
} from 'lucide-react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

/**
 * ARC™ Hub - Central action center with service tabs and file uploads
 * The single hub for all ARC services: Briefs, Travel, and Intel
 */
export default function ActionCenter() {
  const [activeTab, setActiveTab] = useState('brief');
  const [arcInput, setArcInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [usage, setUsage] = useState({ used: 0, limit: 10, remaining: 10 });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const maxFileSize = 20 * 1024 * 1024; // 20MB
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/plain',
    'image/png',
    'image/jpeg',
    'image/webp',
  ];

  // Load usage on mount
  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      const response = await fetchWithAuth('/api/arc/usage', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      }
    } catch (error) {
      console.error('Failed to load usage:', error);
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    let successTimeoutId = null;
    let errorTimeoutId = null;

    if (successMessage) {
      successTimeoutId = setTimeout(() => setSuccessMessage(''), 5000);
    }
    if (errorMessage) {
      errorTimeoutId = setTimeout(() => setErrorMessage(''), 5000);
    }

    return () => {
      if (successTimeoutId) clearTimeout(successTimeoutId);
      if (errorTimeoutId) clearTimeout(errorTimeoutId);
    };
  }, [successMessage, errorMessage]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  const addFiles = (files) => {
    const validFiles = files.filter(file => {
      if (file.size > maxFileSize) {
        setErrorMessage(`File "${file.name}" exceeds 20MB limit`);
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage(`File type not allowed for "${file.name}"`);
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!arcInput.trim() || usage.remaining <= 0) return;

    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      const formData = new FormData();
      formData.append('type', activeTab);
      formData.append('content', arcInput.trim());
      
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetchWithAuth('/api/arc/request', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to submit request');
      }
      
      setSuccessMessage(data.message || 'Request submitted! Check My ARC Briefs for updates.');
      setArcInput('');
      setSelectedFiles([]);
      
      // Update usage
      if (data.usage) {
        setUsage(data.usage);
      } else {
        await loadUsage();
      }
    } catch (error) {
      console.error('Failed to submit ARC™ request:', error);
      setErrorMessage(error.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'brief', label: 'Briefs', icon: FileText, description: 'Research, analysis, document review' },
    { id: 'travel', label: 'Travel', icon: Plane, description: 'Flight upgrades, itinerary optimization' },
    { id: 'intel', label: 'Intel', icon: TrendingUp, description: 'Market insights, competitive analysis' }
  ];

  const quickActions = [
    { icon: Users, label: 'Members', href: '/members' },
    { icon: MessageSquare, label: 'Messages', href: '/messages' },
    { icon: Target, label: 'Requests', href: '/requests' },
    { icon: Zap, label: 'AI Intros', href: '/intros' }
  ];

  const isExhausted = usage.remaining <= 0;

  return (
    <div className="lg:col-span-full">
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800 bg-gradient-to-r from-amber-500/5 to-purple-500/5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold">ARC™ Hub</h2>
              </div>
              <p className="text-zinc-400 text-sm max-w-2xl">
                Your AI-powered concierge for research, travel optimization, and market intelligence. 
                <Link href="/help/arc" className="text-amber-400 hover:text-amber-300 ml-1">
                  Learn more →
                </Link>
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-zinc-500 mb-1">Monthly Usage</div>
              <div className={`text-2xl font-bold ${isExhausted ? 'text-red-400' : 'text-amber-400'}`}>
                {usage.used}/{usage.limit}
              </div>
              <div className="text-xs text-zinc-500">{usage.remaining} remaining</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/50">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'bg-zinc-900 border-b-2 border-amber-500 text-white'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tab description */}
          <p className="text-zinc-400 text-sm">
            {tabs.find(t => t.id === activeTab)?.description}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Text Input */}
            <textarea
              value={arcInput}
              onChange={(e) => setArcInput(e.target.value)}
              placeholder={`Describe what you need... (e.g., ${
                activeTab === 'brief' 
                  ? '"Analyze this contract for risks"' 
                  : activeTab === 'travel'
                  ? '"Find upgrade options for AA flight 1234"'
                  : '"Research competitor pricing in SaaS space"'
              })`}
              rows={4}
              disabled={isSubmitting || isExhausted}
              className="w-full px-4 py-3 bg-black/50 border border-zinc-700 rounded-xl 
                       text-white placeholder-zinc-500 resize-none
                       focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                       disabled:opacity-50 disabled:cursor-not-allowed"
            />

            {/* File Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 transition-all ${
                isDragging
                  ? 'border-amber-500 bg-amber-500/5'
                  : 'border-zinc-700 hover:border-zinc-600'
              } ${isExhausted ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-center">
                <Paperclip className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                <p className="text-sm text-zinc-400 mb-2">
                  Drag & drop files or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isExhausted}
                    className="text-amber-400 hover:text-amber-300 disabled:opacity-50"
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-zinc-600">
                  PDF, DOC, DOCX, XLS, XLSX, CSV, TXT, PNG, JPG, WEBP • Max 20MB each • Up to 5 files
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.webp"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isExhausted}
              />
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-4 py-2 bg-zinc-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                      <span className="text-sm text-zinc-300 truncate">{file.name}</span>
                      <span className="text-xs text-zinc-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-zinc-700 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-zinc-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!arcInput.trim() || isSubmitting || isExhausted}
              className="w-full px-6 py-4 bg-amber-500 hover:bg-amber-400 
                       disabled:bg-zinc-800 disabled:cursor-not-allowed
                       text-black font-bold rounded-xl
                       transition-all duration-300
                       flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : isExhausted ? (
                <>
                  <AlertCircle className="w-5 h-5" />
                  Monthly Limit Reached
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Request
                </>
              )}
            </button>

            {isExhausted && (
              <p className="text-sm text-amber-400 text-center">
                You've reached your monthly limit. 
                <Link href="/billing" className="underline ml-1">
                  Upgrade for more requests
                </Link>
              </p>
            )}
          </form>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{successMessage}</p>
            </div>
          )}
          
          {errorMessage && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}

          {/* Quick Navigation Chips */}
          <div className="pt-4 border-t border-zinc-800">
            <p className="text-xs text-zinc-500 mb-3">Quick Access</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map(action => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="px-3 py-2 bg-zinc-800/50 hover:bg-zinc-800 
                             border border-zinc-700 rounded-lg text-sm text-zinc-300
                             transition-all duration-200 hover:text-white hover:border-zinc-600
                             flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {action.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
