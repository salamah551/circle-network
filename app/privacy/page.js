import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Lock, Database, Mail, Users } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy - Circle Network',
  description: 'How we collect, use, and protect your information at Circle Network'
};

export default function PrivacyPage() {
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
          <div className="w-16 h-16 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-lg text-zinc-400">
            Last updated: October 15, 2025
          </p>
          <p className="text-zinc-500 mt-2">
            Circle Network is committed to protecting your privacy and handling your data transparently.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-zinc max-w-none">
          
          {/* Section 1 */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-bold m-0">Information We Collect</h2>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold mb-3 text-white">Account Information</h3>
              <ul className="text-zinc-400 space-y-2 mb-0">
                <li>Name, email address, and professional details (title, company, location)</li>
                <li>Profile information you choose to share (bio, expertise, needs)</li>
                <li>Social media links and professional credentials</li>
              </ul>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold mb-3 text-white">Usage Information</h3>
              <ul className="text-zinc-400 space-y-2 mb-0">
                <li>Messages you send to other members (stored securely)</li>
                <li>Connections you make and introductions you accept</li>
                <li>Requests you post and responses you provide</li>
                <li>Events you attend and activities you participate in</li>
                <li>Your interactions with the platform (pages visited, features used)</li>
              </ul>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3 text-white">Technical Information</h3>
              <ul className="text-zinc-400 space-y-2 mb-0">
                <li>IP address, browser type, and device information</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Log data about your use of the platform</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-bold m-0">How We Use Your Information</h2>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Provide Our Services</h4>
                <p className="text-zinc-400 mb-0">
                  We use your information to operate Circle Network, including matching you with relevant 
                  connections through our AI-powered strategic introductions system.
                </p>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-semibold text-white mb-2">Facilitate Connections</h4>
                <p className="text-zinc-400 mb-0">
                  Your profile information helps other members understand your background and determine 
                  if you'd be a valuable connection. We show your profile to other members within the network.
                </p>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-semibold text-white mb-2">Improve Our Platform</h4>
                <p className="text-zinc-400 mb-0">
                  We analyze usage patterns to enhance features, fix bugs, and develop new capabilities 
                  that benefit the community.
                </p>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-semibold text-white mb-2">Communication</h4>
                <p className="text-zinc-400 mb-0">
                  We send you essential updates about your account, new connections, platform changes, 
                  and community news. You can control communication preferences in your settings.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-bold m-0">Information Sharing</h2>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">With Other Members</h4>
                <p className="text-zinc-400 mb-0">
                  Your profile information is visible to other Circle Network members. Messages you send 
                  are only visible to the recipient. You control what information appears on your profile.
                </p>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-semibold text-white mb-2">Service Providers</h4>
                <p className="text-zinc-400 mb-0">
                  We use trusted third-party services to help operate our platform:
                </p>
                <ul className="text-zinc-400 mt-2 space-y-1">
                  <li>• Supabase (database and authentication)</li>
                  <li>• Stripe (payment processing)</li>

                  <li>• Vercel (hosting and infrastructure)</li>
                </ul>
                <p className="text-zinc-400 mt-2 mb-0">
                  These providers are contractually obligated to protect your data and use it only for 
                  providing services to us.
                </p>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-semibold text-white mb-2">What We DON'T Do</h4>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 mt-2">
                  <ul className="text-emerald-400 space-y-2 mb-0">
                    <li>✓ We never sell your data to third parties</li>
                    <li>✓ We don't share your information with advertisers</li>
                    <li>✓ We don't use your data for purposes unrelated to Circle Network</li>
                    <li>✓ We don't share your messages with anyone except the intended recipient</li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-semibold text-white mb-2">Legal Requirements</h4>
                <p className="text-zinc-400 mb-0">
                  We may disclose information if required by law, legal process, or to protect the rights, 
                  property, or safety of Circle Network, our members, or others.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-bold m-0">Data Security</h2>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-zinc-400 mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="text-zinc-400 space-y-2">
                <li>• All data transmitted is encrypted using SSL/TLS</li>
                <li>• Passwords are hashed and never stored in plain text</li>
                <li>• Database access is restricted and monitored</li>
                <li>• Regular security audits and updates</li>
                <li>• Two-factor authentication available for your account</li>
              </ul>
              <p className="text-zinc-400 mt-4 mb-0">
                While we use reasonable efforts to protect your information, no method of transmission 
                over the internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-bold m-0">Your Rights & Choices</h2>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Access & Update</h4>
                <p className="text-zinc-400 mb-0">
                  You can access and update your profile information at any time through your account settings.
                </p>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-semibold text-white mb-2">Data Export</h4>
                <p className="text-zinc-400 mb-0">
                  You can request a copy of your data by emailing{' '}
                  <a href="mailto:privacy@thecirclenetwork.org" className="text-amber-400 hover:text-amber-300">
                    privacy@thecirclenetwork.org
                  </a>
                </p>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-semibold text-white mb-2">Account Deletion</h4>
                <p className="text-zinc-400 mb-0">
                  You can delete your account at any time through settings or by contacting us. 
                  This will permanently remove your profile and data. Note that some information may 
                  be retained for legal or legitimate business purposes (e.g., transaction records).
                </p>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-semibold text-white mb-2">Communication Preferences</h4>
                <p className="text-zinc-400 mb-0">
                  You can control which emails you receive in your account settings. You cannot opt out 
                  of essential service communications (e.g., security alerts, billing notices).
                </p>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-semibold text-white mb-2">Cookies</h4>
                <p className="text-zinc-400 mb-0">
                  You can control cookie preferences through your browser settings. Note that disabling 
                  cookies may affect platform functionality. See our{' '}
                  <Link href="/cookies" className="text-amber-400 hover:text-amber-300">
                    Cookie Policy
                  </Link>{' '}
                  for details.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Data Retention</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-zinc-400 mb-4">
                We retain your information for as long as your account is active or as needed to provide services.
              </p>
              <ul className="text-zinc-400 space-y-2 mb-4">
                <li>• Profile data: Retained while account is active</li>
                <li>• Messages: Retained until you delete them or close your account</li>
                <li>• Transaction records: Retained for 7 years for legal/tax purposes</li>
                <li>• Usage logs: Retained for 90 days for security and analytics</li>
              </ul>
              <p className="text-zinc-400 mb-0">
                After account deletion, we may retain some information for legitimate business purposes 
                (fraud prevention, legal compliance) or as required by law.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">International Users</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-zinc-400 mb-4">
                Circle Network operates globally. Your information may be transferred to and processed in 
                the United States or other countries where our service providers operate.
              </p>
              <p className="text-zinc-400 mb-4">
                If you're in the European Economic Area (EEA), United Kingdom, or Switzerland, you have 
                additional rights under GDPR:
              </p>
              <ul className="text-zinc-400 space-y-2 mb-0">
                <li>• Right to access your personal data</li>
                <li>• Right to correct inaccurate data</li>
                <li>• Right to delete your data ("right to be forgotten")</li>
                <li>• Right to restrict processing</li>
                <li>• Right to data portability</li>
                <li>• Right to object to processing</li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-zinc-400 mb-0">
                Circle Network is not intended for individuals under 18 years of age. We do not knowingly 
                collect personal information from children. If you believe we have inadvertently collected 
                information from a child, please contact us immediately.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-zinc-400 mb-4">
                We may update this Privacy Policy from time to time. When we make significant changes, 
                we'll notify you via:
              </p>
              <ul className="text-zinc-400 space-y-2 mb-4">
                <li>• Email to your registered address</li>
                <li>• Prominent notice on our platform</li>
                <li>• Update to the "Last updated" date at the top of this policy</li>
              </ul>
              <p className="text-zinc-400 mb-0">
                Your continued use of Circle Network after changes take effect constitutes acceptance 
                of the updated policy.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl p-6">
              <p className="text-zinc-300 mb-4">
                Questions about this Privacy Policy or how we handle your data?
              </p>
              <div className="space-y-2 text-zinc-400">
                <p className="mb-0">
                  <strong className="text-white">Email:</strong>{' '}
                  <a href="mailto:privacy@thecirclenetwork.org" className="text-amber-400 hover:text-amber-300">
                    privacy@thecirclenetwork.org
                  </a>
                </p>
                <p className="mb-0">
                  <strong className="text-white">Support:</strong>{' '}
                  <a href="mailto:help@thecirclenetwork.org" className="text-amber-400 hover:text-amber-300">
                    help@thecirclenetwork.org
                  </a>
                </p>
              </div>
            </div>
          </section>

        </div>

        {/* Footer Nav */}
        <div className="pt-12 border-t border-zinc-800">
          <div className="flex flex-wrap gap-6 text-sm">
            <Link href="/terms" className="text-zinc-400 hover:text-amber-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-zinc-400 hover:text-amber-400 transition-colors">
              Cookie Policy
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
