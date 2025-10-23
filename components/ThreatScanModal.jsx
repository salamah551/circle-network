'use client';
import { useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function ThreatScanModal({ isOpen, onClose }) {
  const tallyUrl = process.env.NEXT_PUBLIC_THREAT_SCAN_TALLY_URL;

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-2xl font-bold text-white">Free 90-Second Threat Scan</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Get instant visibility into your competitive landscape
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors bg-zinc-800 rounded-full p-2 hover:bg-zinc-700"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          {tallyUrl ? (
            <iframe
              src={tallyUrl}
              width="100%"
              height="600"
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
              title="Free Threat Scan"
              className="w-full"
            />
          ) : (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Configuration Required</h3>
              <p className="text-zinc-400 mb-4">
                The Tally form URL is not configured. Please set the NEXT_PUBLIC_THREAT_SCAN_TALLY_URL environment variable.
              </p>
              <p className="text-sm text-zinc-500 font-mono bg-zinc-800 p-3 rounded">
                NEXT_PUBLIC_THREAT_SCAN_TALLY_URL=https://tally.so/r/your-form-id
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
