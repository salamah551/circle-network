'use client';
import { useState, useEffect } from 'react';
import { Cookie, X, Settings } from 'lucide-react';
import Link from 'next/link';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always true, can't be disabled
    functional: true,
    analytics: true
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after 1 second delay
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved);
      } catch (e) {
        console.error('Error loading cookie preferences:', e);
      }
    }
  }, []);

  const savePreferences = (prefs) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);
    
    // Apply preferences (in real implementation, this would enable/disable tracking)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: prefs.analytics ? 'granted' : 'denied',
        functionality_storage: prefs.functional ? 'granted' : 'denied'
      });
    }
  };

  const acceptAll = () => {
    savePreferences({
      essential: true,
      functional: true,
      analytics: true
    });
  };

  const acceptEssential = () => {
    savePreferences({
      essential: true,
      functional: false,
      analytics: false
    });
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Main Banner */}
      {!showSettings && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom-5">
          <div className="max-w-6xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Cookie className="w-6 h-6 text-amber-400" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">We Use Cookies</h3>
                <p className="text-sm text-zinc-400 mb-4">
                  We use cookies to enhance your experience, keep you logged in, and understand how you 
                  use our platform. By clicking "Accept All", you consent to our use of cookies. 
                  You can manage your preferences or learn more in our{' '}
                  <Link href="/cookies" className="text-amber-400 hover:text-amber-300 underline">
                    Cookie Policy
                  </Link>.
                </p>
                
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={acceptAll}
                    className="px-6 py-2 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 transition-all"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={acceptEssential}
                    className="px-6 py-2 bg-zinc-800 border border-zinc-700 text-white font-semibold rounded-lg hover:bg-zinc-700 transition-all"
                  >
                    Essential Only
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="px-6 py-2 bg-transparent border border-zinc-700 text-zinc-300 font-semibold rounded-lg hover:bg-zinc-800 transition-all flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Customize
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowBanner(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[101] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Cookie Preferences</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-zinc-400 mb-6">
              Manage your cookie preferences. Essential cookies are required for the platform to function 
              and cannot be disabled.
            </p>

            <div className="space-y-4 mb-6">
              {/* Essential */}
              <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">Essential Cookies</h4>
                    <p className="text-sm text-zinc-400">
                      Required for authentication, security, and core functionality
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-zinc-500 mr-3">Always Active</span>
                    <div className="w-12 h-6 bg-emerald-500 rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Functional */}
              <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">Functional Cookies</h4>
                    <p className="text-sm text-zinc-400">
                      Remember your preferences and provide personalized features
                    </p>
                  </div>
                  <button
                    onClick={() => setPreferences({ ...preferences, functional: !preferences.functional })}
                    className="flex items-center"
                  >
                    <div className={`w-12 h-6 rounded-full relative transition-colors ${
                      preferences.functional ? 'bg-emerald-500' : 'bg-zinc-600'
                    }`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        preferences.functional ? 'right-1' : 'left-1'
                      }`} />
                    </div>
                  </button>
                </div>
              </div>

              {/* Analytics */}
              <div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">Analytics Cookies</h4>
                    <p className="text-sm text-zinc-400">
                      Help us understand usage patterns and improve the platform
                    </p>
                  </div>
                  <button
                    onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })}
                    className="flex items-center"
                  >
                    <div className={`w-12 h-6 rounded-full relative transition-colors ${
                      preferences.analytics ? 'bg-emerald-500' : 'bg-zinc-600'
                    }`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        preferences.analytics ? 'right-1' : 'left-1'
                      }`} />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => savePreferences(preferences)}
                className="flex-1 px-6 py-3 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition-all"
              >
                Save Preferences
              </button>
              <button
                onClick={() => {
                  setPreferences({ essential: true, functional: true, analytics: true });
                  savePreferences({ essential: true, functional: true, analytics: true });
                }}
                className="flex-1 px-6 py-3 bg-zinc-800 border border-zinc-700 text-white font-semibold rounded-lg hover:bg-zinc-700 transition-all"
              >
                Accept All
              </button>
            </div>

            <p className="text-xs text-zinc-500 mt-4 text-center">
              Learn more in our{' '}
              <Link href="/cookies" className="text-amber-400 hover:text-amber-300 underline">
                Cookie Policy
              </Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
