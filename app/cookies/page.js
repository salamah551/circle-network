import Link from 'next/link';
import { ArrowLeft, Cookie, Settings, Eye, BarChart, Shield } from 'lucide-react';
export const metadata = {
  title: 'Cookie Policy - Circle Network',
  description: 'How Circle Network uses cookies and similar technologies'
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 sticky top-0 z-50 bg-black/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-12">
          <div className="w-16 h-16 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6">
            <Cookie className="w-8 h-8 text-orange-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-lg text-zinc-400">
            Last updated: October 15, 2025
          </p>
          <p className="text-zinc-500 mt-2">
            Learn how Circle Network uses cookies and similar technologies to enhance your experience.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-zinc max-w-none">

          {/* Section 1 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Are Cookies?</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-zinc-400 mb-4">
                Cookies are small text files stored on your device when you visit a website. They help 
                websites remember your preferences, keep you logged in, and understand how you use the site.
              </p>
              <p className="text-zinc-400 mb-0">
                Circle Network uses cookies and similar technologies (like local storage and session storage) 
                to provide, protect, and improve our services.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Types of Cookies We Use</h2>

            <div className="space-y-6">
              {/* Essential Cookies */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-white">Essential Cookies (Required)</h3>
                    <p className="text-zinc-400 mb-3">
                      These cookies are necessary for the Platform to function. You cannot opt out of these 
                      cookies as they enable core functionality.
                    </p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-zinc-500 min-w-[140px]">Authentication:</span>
                    <span className="text-zinc-400">Keep you logged in and maintain your session</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-zinc-500 min-w-[140px]">Security:</span>
                    <span className="text-zinc-400">Protect against fraud and unauthorized access</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-zinc-500 min-w-[140px]">Preferences:</span>
                    <span className="text-zinc-400">Remember your settings and choices</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-zinc-500 min-w-[140px]">Load Balancing:</span>
                    <span className="text-zinc-400">Ensure platform stability and performance</span>
                  </div>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Settings className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-white">Functional Cookies (Optional)</h3>
                    <p className="text-zinc-400 mb-3">
                      These cookies enhance your experience by remembering your preferences and providing 
                      personalized features.
                    </p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-zinc-500 min-w-[140px]">UI Preferences:</span>
                    <span className="text-zinc-400">Remember your display settings and layout choices</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-zinc-500 min-w-[140px]">Feature Access:</span>
                    <span className="text-zinc-400">Enable advanced features like saved searches</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-zinc-500 min-w-[140px]">Notifications:</span>
                    <span className="text-zinc-400">Manage your notification preferences</span>
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <BarChart className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-white">Analytics Cookies (Optional)</h3>
                    <p className="text-zinc-400 mb-3">
                      These cookies help us understand how you use the Platform so we can improve it. 
                      All data is aggregated and anonymous.
                    </p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-zinc-500 min-w-[140px]">Usage Patterns:</span>
                    <span className="text-zinc-400">Which features are most popular and useful</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-zinc-500 min-w-[140px]">Performance:</span>
                    <span className="text-zinc-400">Page load times and technical issues</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-zinc-500 min-w-[140px]">User Flows:</span>
                    <span className="text-zinc-400">How members navigate through the platform</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Third-Party Cookies</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-zinc-400 mb-4">
                We use trusted third-party services that may set their own cookies:
              </p>
              
              <div className="space-y-4">
                <div className="border-t border-zinc-800 pt-4 first:border-t-0 first:pt-0">
                  <h4 className="font-semibold text-white mb-2">Supabase (Authentication & Database)</h4>
                  <p className="text-sm text-zinc-400 mb-2">
                    Essential cookies for user authentication and session management.
                  </p>
                  <a 
                    href="https://supabase.com/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-amber-400 hover:text-amber-300"
                  >
                    View Supabase Privacy Policy →
                  </a>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <h4 className="font-semibold text-white mb-2">Stripe (Payment Processing)</h4>
                  <p className="text-sm text-zinc-400 mb-2">
                    Essential cookies for secure payment processing and fraud prevention.
                  </p>
                  <a 
                    href="https://stripe.com/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-amber-400 hover:text-amber-300"
                  >
                    View Stripe Privacy Policy →
                  </a>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <h4 className="font-semibold text-white mb-2">Vercel (Hosting & Analytics)</h4>
                  <p className="text-sm text-zinc-400 mb-2">
                    Performance and analytics cookies to ensure platform stability.
                  </p>
                  <a 
                    href="https://vercel.com/legal/privacy-policy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-amber-400 hover:text-amber-300"
                  >
                    View Vercel Privacy Policy →
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-bold m-0">Managing Your Cookie Preferences</h2>
            </div>

            <div className="space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-3 text-white">Browser Settings</h3>
                <p className="text-zinc-400 mb-4">
                  You can control cookies through your browser settings. Most browsers allow you to:
                </p>
                <ul className="text-zinc-400 space-y-2 mb-4">
                  <li>• View what cookies are stored and delete them individually</li>
                  <li>• Block third-party cookies</li>
                  <li>• Block cookies from specific websites</li>
                  <li>• Block all cookies (note: this will affect platform functionality)</li>
                  <li>• Delete all cookies when you close your browser</li>
                </ul>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <p className="text-yellow-400 text-sm mb-0">
                    <strong>⚠️ Note:</strong> Disabling essential cookies will prevent you from using 
                    Circle Network as these are required for login and core functionality.
                  </p>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-3 text-white">Browser-Specific Instructions</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong className="text-white">Google Chrome:</strong>{' '}
                    <a 
                      href="https://support.google.com/chrome/answer/95647" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:text-amber-300"
                    >
                      Cookie settings →
                    </a>
                  </div>
                  <div>
                    <strong className="text-white">Safari:</strong>{' '}
                    <a 
                      href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:text-amber-300"
                    >
                      Cookie settings →
                    </a>
                  </div>
                  <div>
                    <strong className="text-white">Firefox:</strong>{' '}
                    <a 
                      href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:text-amber-300"
                    >
                      Cookie settings →
                    </a>
                  </div>
                  <div>
                    <strong className="text-white">Microsoft Edge:</strong>{' '}
                    <a 
                      href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:text-amber-300"
                    >
                      Cookie settings →
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-3 text-white">Do Not Track (DNT)</h3>
                <p className="text-zinc-400 mb-0">
                  We respect Do Not Track signals. If your browser sends a DNT signal, we will not use 
                  optional analytics or tracking cookies. Essential cookies required for platform 
                  functionality will still be used.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Cookie Lifespan</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Session Cookies</h4>
                  <p className="text-zinc-400 mb-0 text-sm">
                    Temporary cookies that expire when you close your browser. Used for maintaining your 
                    session while you're actively using the Platform.
                  </p>
                </div>
                <div className="border-t border-zinc-800 pt-4">
                  <h4 className="font-semibold text-white mb-2">Persistent Cookies</h4>
                  <p className="text-zinc-400 mb-2 text-sm">
                    Cookies that remain on your device for a set period or until you delete them. Used to 
                    remember your preferences and keep you logged in.
                  </p>
                  <p className="text-zinc-500 text-xs mb-0">
                    Our persistent cookies typically expire after 30-90 days of inactivity.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-zinc-400 mb-0">
                We may update this Cookie Policy from time to time to reflect changes in our practices or 
                for legal, operational, or regulatory reasons. We'll notify you of significant changes by 
                updating the "Last updated" date at the top of this page and, when appropriate, by email 
                or through a notice on the Platform.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Questions?</h2>
            <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl p-6">
              <p className="text-zinc-300 mb-4">
                Have questions about our use of cookies?
              </p>
              <p className="text-zinc-400 mb-0">
                <strong className="text-white">Email:</strong>{' '}
                <a href="mailto:privacy@thecirclenetwork.org" className="text-amber-400 hover:text-amber-300">
                  privacy@thecirclenetwork.org
                </a>
              </p>
            </div>
          </section>

        </div>

        {/* Footer Nav */}
        <div className="pt-12 border-t border-zinc-800">
          <div className="flex flex-wrap gap-6 text-sm">
            <Link href="/privacy" className="text-zinc-400 hover:text-amber-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-zinc-400 hover:text-amber-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-zinc-400 hover:text-amber-400 transition-colors">
              Contact Us
            </Link>
            <Link href="/" className="text-zinc-400 hover:text-amber-400 transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
