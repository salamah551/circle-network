'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error' | 'already'
  const [message, setMessage] = useState('');
  
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!email || !token) {
      setStatus('error');
      setMessage('Invalid unsubscribe link');
      return;
    }

    handleUnsubscribe();
  }, [email, token]);

  const handleUnsubscribe = async () => {
    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.already) {
          setStatus('already');
          setMessage('This email was already unsubscribed');
        } else {
          setStatus('success');
          setMessage('You have been successfully unsubscribed');
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to unsubscribe');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
        
        {status === 'loading' && (
          <>
            <Loader className="w-16 h-16 text-amber-400 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold mb-2">Processing...</h1>
            <p className="text-zinc-400">Please wait while we unsubscribe you</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Unsubscribed Successfully</h1>
            <p className="text-zinc-400 mb-6">{message}</p>
            <p className="text-sm text-zinc-500">
              Email: <span className="text-white">{email}</span>
            </p>
            <p className="text-sm text-zinc-500 mt-4">
              You will no longer receive invitations from Circle Network.
            </p>
          </>
        )}

        {status === 'already' && (
          <>
            <CheckCircle className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Already Unsubscribed</h1>
            <p className="text-zinc-400 mb-6">{message}</p>
            <p className="text-sm text-zinc-500">
              Email: <span className="text-white">{email}</span>
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Unsubscribe Failed</h1>
            <p className="text-zinc-400 mb-6">{message}</p>
            <p className="text-sm text-zinc-500">
              If you continue to have issues, please contact us at{' '}
              <a href="mailto:support@thecirclenetwork.org" className="text-amber-400 hover:underline">
                support@thecirclenetwork.org
              </a>
            </p>
          </>
        )}

        <div className="mt-8 pt-6 border-t border-zinc-800">
          <a 
            href="/"
            className="text-sm text-zinc-500 hover:text-white transition-colors"
          >
            Return to Circle Network
          </a>
        </div>
      </div>
    </div>
  );
}