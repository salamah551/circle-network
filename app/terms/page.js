import Link from 'next/link';
import { ArrowLeft, FileText, AlertCircle, CheckCircle, DollarSign, Shield } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service - Circle Network',
  description: 'Terms and conditions for Circle Network membership'
};

export default function TermsPage() {
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
          <div className="w-16 h-16 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-lg text-zinc-400">
            Last updated: October 15, 2025
          </p>
          <p className="text-zinc-500 mt-2">
            Please read these terms carefully before using Circle Network.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-zinc max-w-none">

          {/* Section 1 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-zinc-400 mb-4">
                By accessing or using Circle Network ("the Platform"), you agree to be bound by these 
                Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Platform.
              </p>
              <p className="text-zinc-400 mb-0">
                These Terms constitute a legally binding agreement between you and Circle Network 
                ("we," "us," "our"). We reserve the right to update these Terms at any time, and your 
                continued use constitutes acceptance of any changes.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">2. Membership Eligibility</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Age & Capacity</h4>
                <p className="text-zinc-400 mb-0">
                  You must be at least 18 years old and have the legal capacity to enter into binding 
                  contracts. By using the Platform, you represent and warrant that you meet these requirements.
                </p>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-semibold text-white mb-2">Invitation-Only Access</h4>
                <p className="text-zinc-400 mb-0">
                  Circle Network is an invitation-only community. Access requires an approved application 
                  and paid membership. We reserve the right to accept or reject any application at our 
                  sole discretion.
                </p>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-semibold text-white mb-2">Professional Standing</h4>
                <p className="text-zinc-400 mb-0">
                  You represent that all information provided in your application and profile is accurate 
                  and truthful. Misrepresentation may result in immediate termination without refund.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-bold m-0">3. Membership Fees & Billing</h2>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Payment Terms</h4>
                <ul className="text-zinc-400 space-y-2 mb-0">
                  <li>• Membership fees are charged annually in advance</li>
                  <li>• Payment is processed through Stripe, our secure payment processor</li>
                  <li>• All fees are in USD and non-refundable except as stated in our guarantee</li>
                  <li>• Founding member rates are locked in for life and never increase</li>
                </ul>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-semibold text-white mb-2">Auto-Renewal</h4>
                <p className="text-zinc-400 mb-2">
                  Your membership will automatically renew on your anniversary date unless you cancel 
                  at least 7 days before renewal. You'll receive a reminder email 30 days before renewal.
                </p>
                <p className="text-zinc-400 mb-0">
                  To cancel, email{' '}
                  <a href="mailto:billing@thecirclenetwork.org" className="text-amber-400 hover:text-amber-300">
                    billing@thecirclenetwork.org
                  </a>
                  {' '}at least 7 days before your renewal date.
                </p>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-semibold text-white mb-2">30-Day Money-Back Guarantee</h4>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                  <p className="text-emerald-400 mb-2">
                    <strong>Full Refund Within 30 Days:</strong>
                  </p>
                  <p className="text-emerald-400 mb-0">
                    If you're not satisfied with Circle Network within the first 30 days of your initial 
                    membership, email{' '}
                    <a href="mailto:help@thecirclenetwork.org" className="text-emerald-300 hover:text-emerald-200 underline">
                      help@thecirclenetwork.org
                    </a>
                    {' '}with "Refund Request" in the subject line. We'll process a full refund within 2-3 
                    business days, no questions asked.
                  </p>
                </div>
                <p className="text-zinc-500 text-sm mt-2 mb-0">
                  Note: This guarantee applies only to your first membership payment. Renewals are not 
                  eligible for refund after the renewal date.
                </p>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-semibold text-white mb-2">Failed Payments</h4>
                <p className="text-zinc-400 mb-0">
                  If a payment fails, we'll attempt to process it again. After 3 failed attempts, your 
                  membership may be suspended until payment is received. Your account and data will be 
                  retained for 60 days to allow you to update payment information.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">4. Acceptable Use</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">You Agree To:</h4>
                <ul className="text-zinc-400 space-y-2">
                  <li>✓ Use the Platform professionally and respectfully</li>
                  <li>✓ Provide accurate information in your profile</li>
                  <li>✓ Respect other members' privacy and intellectual property</li>
                  <li>✓ Engage authentically to build genuine relationships</li>
                  <li>✓ Report any violations of these Terms to us</li>
                </ul>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-semibold text-white mb-2">You Agree NOT To:</h4>
                <ul className="text-zinc-400 space-y-2 mb-0">
                  <li>✗ Spam, harass, or abuse other members</li>
                  <li>✗ Share false, misleading, or fraudulent information</li>
                  <li>✗ Use the Platform for illegal activities</li>
                  <li>✗ Scrape, copy, or download member data</li>
                  <li>✗ Impersonate others or create fake accounts</li>
                  <li>✗ Sell, trade, or commercialize your membership</li>
                  <li>✗ Use automated tools (bots, scrapers) on the Platform</li>
                  <li>✗ Share your login credentials with others</li>
                </ul>
              </div>

              <div className="border-t border-zinc-800 pt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 mb-0">
                  <strong>⚠️ Violation Consequences:</strong> Violations may result in immediate account 
                  suspension or termination without refund. Serious violations may be reported to 
                  law enforcement.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">5. Content & Intellectual Property</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Your Content</h4>
                <p className="text-zinc-400 mb-0">
                  You retain ownership of any content you post (messages, profile information, etc.). 
                  By posting content, you grant Circle Network a non-exclusive, worldwide license to use, 
                  display, and distribute your content as necessary to provide our services.
                </p>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-semibold text-white mb-2">Our Platform</h4>
                <p className="text-zinc-400 mb-0">
                  Circle Network, including all software, features, and content provided by us, is our 
                  intellectual property. You may not copy, modify, reverse engineer, or create derivative 
                  works without our written permission.
                </p>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-semibold text-white mb-2">Member Data Protection</h4>
                <p className="text-zinc-400 mb-0">
                  Member profiles and contact information are confidential. You may not export, scrape, 
                  or otherwise collect member data for use outside the Platform. Connections you make 
                  through Circle Network are for your personal professional relationships only.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-bold m-0">6. Privacy & Data</h2>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-zinc-400 mb-4">
                Your privacy is important to us. Our{' '}
                <Link href="/privacy" className="text-amber-400 hover:text-amber-300">
                  Privacy Policy
                </Link>
                {' '}explains how we collect, use, and protect your information.
              </p>
              <p className="text-zinc-400 mb-0">
                By using Circle Network, you consent to our Privacy Policy and our use of cookies as 
                described in our{' '}
                <Link href="/cookies" className="text-amber-400 hover:text-amber-300">
                  Cookie Policy
                </Link>.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">7. Account Termination</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">By You</h4>
                <p className="text-zinc-400 mb-0">
                  You may cancel your membership at any time by emailing{' '}
                  <a href="mailto:help@thecirclenetwork.org" className="text-amber-400 hover:text-amber-300">
                    help@thecirclenetwork.org
                  </a>. Cancellation takes effect at the end of your current billing period. No partial 
                  refunds are provided for early cancellation (except within the 30-day guarantee period).
                </p>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-semibold text-white mb-2">By Us</h4>
                <p className="text-zinc-400 mb-2">
                  We reserve the right to suspend or terminate your membership at any time for:
                </p>
                <ul className="text-zinc-400 space-y-2 mb-2">
                  <li>• Violation of these Terms</li>
                  <li>• Fraudulent or illegal activity</li>
                  <li>• Harassment or abuse of other members</li>
                  <li>• Providing false information</li>
                  <li>• Non-payment of fees</li>
                </ul>
                <p className="text-zinc-400 mb-0">
                  Termination for cause results in forfeiture of membership fees without refund.
                </p>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-semibold text-white mb-2">Effect of Termination</h4>
                <p className="text-zinc-400 mb-0">
                  Upon termination, your access to the Platform ends immediately. Your profile and data 
                  will be deleted per our Privacy Policy. Connections and relationships you've made are 
                  yours to maintain independently.
                </p>
              </div>
            </div>
          </section>

          {/* Section 8 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">8. Disclaimers & Limitations</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-yellow-400 mb-0">
                  <strong>⚠️ IMPORTANT:</strong> Please read this section carefully. It limits our 
                  liability to you.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">Platform "As Is"</h4>
                <p className="text-zinc-400 mb-0">
                  Circle Network is provided "as is" and "as available" without warranties of any kind, 
                  express or implied. We do not guarantee uninterrupted, error-free, or secure service.
                </p>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-semibold text-white mb-2">Member Interactions</h4>
                <p className="text-zinc-400 mb-0">
                  We are not responsible for interactions between members. You interact with other 
                  members at your own risk. We do not verify member credentials, backgrounds, or 
                  representations. Conduct your own due diligence.
                </p>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-semibold text-white mb-2">Business Outcomes</h4>
                <p className="text-zinc-400 mb-0">
                  We do not guarantee any specific business results, connections, partnerships, or 
                  financial outcomes from using Circle Network. Success depends on your own efforts 
                  and circumstances.
                </p>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-semibold text-white mb-2">Limitation of Liability</h4>
                <p className="text-zinc-400 mb-0">
                  To the maximum extent permitted by law, Circle Network's total liability to you for 
                  any claims arising from these Terms or your use of the Platform shall not exceed the 
                  amount you paid us in the 12 months before the claim arose.
                </p>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-semibold text-white mb-2">Indemnification</h4>
                <p className="text-zinc-400 mb-0">
                  You agree to indemnify and hold Circle Network harmless from any claims, losses, or 
                  damages arising from your use of the Platform, your violation of these Terms, or your 
                  violation of any rights of others.
                </p>
              </div>
            </div>
          </section>

          {/* Section 9 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">9. Dispute Resolution</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Informal Resolution</h4>
                <p className="text-zinc-400 mb-0">
                  If you have a dispute with Circle Network, please contact us first at{' '}
                  <a href="mailto:help@thecirclenetwork.org" className="text-amber-400 hover:text-amber-300">
                    help@thecirclenetwork.org
                  </a>. We'll work in good faith to resolve the issue.
                </p>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-semibold text-white mb-2">Arbitration</h4>
                <p className="text-zinc-400 mb-2">
                  If we cannot resolve a dispute informally, any claims will be resolved through binding 
                  arbitration rather than in court, except that you may assert claims in small claims court 
                  if they qualify.
                </p>
                <p className="text-zinc-400 mb-0">
                  Arbitration will be conducted by the American Arbitration Association (AAA) under its 
                  Commercial Arbitration Rules. The arbitrator's decision is final and binding.
                </p>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-semibold text-white mb-2">Class Action Waiver</h4>
                <p className="text-zinc-400 mb-0">
                  You agree to resolve disputes with us only on an individual basis. You may not bring 
                  claims as a plaintiff or class member in any class, consolidated, or representative action.
                </p>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <h4 className="font-semibold text-white mb-2">Governing Law</h4>
                <p className="text-zinc-400 mb-0">
                  These Terms are governed by the laws of the State of Delaware, USA, without regard to 
                  conflict of law principles.
                </p>
              </div>
            </div>
          </section>

          {/* Section 10 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">10. General Terms</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-3 text-zinc-400 text-sm">
              <p className="mb-0">
                <strong className="text-white">Entire Agreement:</strong> These Terms, together with our 
                Privacy Policy and Cookie Policy, constitute the entire agreement between you and Circle Network.
              </p>
              <p className="mb-0">
                <strong className="text-white">Severability:</strong> If any provision is found invalid, 
                the remaining provisions remain in full effect.
              </p>
              <p className="mb-0">
                <strong className="text-white">No Waiver:</strong> Our failure to enforce any right or 
                provision does not constitute a waiver of that right.
              </p>
              <p className="mb-0">
                <strong className="text-white">Assignment:</strong> You may not transfer your membership. 
                We may assign our rights and obligations to another entity.
              </p>
              <p className="mb-0">
                <strong className="text-white">Changes to Terms:</strong> We may modify these Terms at 
                any time. Material changes will be communicated via email at least 30 days before taking effect.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Questions?</h2>
            <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl p-6">
              <p className="text-zinc-300 mb-4">
                Have questions about these Terms? We're here to help.
              </p>
              <div className="space-y-2 text-zinc-400">
                <p className="mb-0">
                  <strong className="text-white">General Support:</strong>{' '}
                  <a href="mailto:help@thecirclenetwork.org" className="text-amber-400 hover:text-amber-300">
                    help@thecirclenetwork.org
                  </a>
                </p>
                <p className="mb-0">
                  <strong className="text-white">Billing:</strong>{' '}
                  <a href="mailto:billing@thecirclenetwork.org" className="text-amber-400 hover:text-amber-300">
                    billing@thecirclenetwork.org
                  </a>
                </p>
                <p className="mb-0">
                  <strong className="text-white">Legal:</strong>{' '}
                  <a href="mailto:legal@thecirclenetwork.org" className="text-amber-400 hover:text-amber-300">
                    legal@thecirclenetwork.org
                  </a>
                </p>
              </div>
            </div>
          </section>

        </div>

        {/* Footer Nav */}
        <div className="pt-12 border-t border-zinc-800">
          <div className="flex flex-wrap gap-6 text-sm">
            <Link href="/privacy" className="text-zinc-400 hover:text-amber-400 transition-colors">
              Privacy Policy
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
