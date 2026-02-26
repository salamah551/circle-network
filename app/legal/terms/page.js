'use client';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TermsOfService() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-[#E5C77E]/70 hover:text-[#E5C77E] transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-light">Back to Home</span>
        </button>

        <h1 className="text-4xl font-light text-white mb-4 tracking-tight">Terms of Service</h1>
        <p className="text-white/50 font-light mb-12">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="space-y-8 text-white/70 font-light leading-relaxed">
          <section>
            <h2 className="text-2xl font-light text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Circle Network ("Service"), you accept and agree to be bound by the terms and provisions of this agreement. 
              If you do not agree to these Terms of Service, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4">2. Service Description</h2>
            <p>
              Circle Network is an invitation-only professional networking platform limited to 500 founding members across finance, technology, 
              consulting, and commerce industries. The Service provides:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
              <li>Access to a curated member directory</li>
              <li>Direct messaging with other members</li>
              <li>Exclusive events and gatherings</li>
              <li>Strategic introduction recommendations</li>
              <li>Value exchange marketplace</li>
              <li>Private collaboration spaces (Deal Rooms)</li>
              <li>Priority access to future premium services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4">3. Membership and Account</h2>
            <h3 className="text-xl font-light text-white/90 mb-3 mt-6">3.1 Invitation-Only Access</h3>
            <p>
              Membership to Circle Network is by invitation only. You must receive a valid invitation code to create an account. 
              All applications are subject to review and approval.
            </p>

            <h3 className="text-xl font-light text-white/90 mb-3 mt-6">3.2 Account Accuracy</h3>
            <p>
              You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, 
              current, and complete. Misrepresentation of identity or credentials may result in immediate termination of membership.
            </p>

            <h3 className="text-xl font-light text-white/90 mb-3 mt-6">3.3 Account Security</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any 
              unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4">4. Payment Terms</h2>
            <h3 className="text-xl font-light text-white/90 mb-3 mt-6">4.1 Subscription Fees</h3>
            <p>
              Membership is billed monthly. Current pricing: Founding $399/mo, Pro $299/mo, Elite $499/mo. Founding member pricing is locked in 
              for the lifetime of the membership. Premium and Elite tier pricing is subject to change with 30 days notice. Monthly billing cycle.
            </p>

            <h3 className="text-xl font-light text-white/90 mb-3 mt-6">4.2 Billing</h3>
            <p>
              Subscriptions are billed monthly in advance. Payment is processed securely through Stripe. By subscribing, you authorize 
              us to charge your payment method for the subscription fee and any applicable taxes.
            </p>

            <h3 className="text-xl font-light text-white/90 mb-3 mt-6">4.3 Refund Policy</h3>
            <p>
              We offer a 30-day money-back guarantee for new members. If you are not satisfied within the first 30 days of membership, contact us 
              for a full refund. After 30 days, subscription fees are non-refundable. You may cancel your subscription at any time, effective at 
              the end of your current billing period.
            </p>

            <h3 className="text-xl font-light text-white/90 mb-3 mt-6">4.4 Founding Member Rate Lock</h3>
            <p>
              Founding members receive a guaranteed rate of $399/mo locked for 24 months. This rate will not increase during the lock period, 
              even if you pause and later resume your membership, provided your account remains in good standing. Founding members also receive 
              priority access to new features and exclusive member benefits.
            </p>

            <h3 className="text-xl font-light text-white/90 mb-3 mt-6">4.5 Performance Guarantee</h3>
            <p>
              We stand behind our platform. If you don't achieve at least 3 meaningful wins within your first 90 days of active membership 
              (defined as valuable introductions, partnerships, or opportunities), we'll extend your membership by 3 months at no additional charge. 
              Contact support within 100 days to claim this guarantee.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4">5. User Conduct</h2>
            <p>You agree NOT to use the Service to:</p>
            <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit spam, solicitations, or unauthorized advertisements</li>
              <li>Harass, abuse, or harm other members</li>
              <li>Misrepresent your identity or credentials</li>
              <li>Share confidential information without proper authorization</li>
              <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
              <li>Use automated systems (bots, scrapers) without explicit permission</li>
            </ul>
            <p className="mt-4">
              Violation of these conduct rules may result in immediate suspension or termination of your membership without refund.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4">6. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by Circle Network and are protected by international 
              copyright, trademark, and other intellectual property laws. You retain ownership of content you post, but grant us a license to use, 
              display, and distribute such content within the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4">7. Privacy and Data Protection</h2>
            <p>
              Your use of the Service is also governed by our Privacy Policy. We are committed to protecting your personal information and 
              maintaining the confidentiality of member interactions. We do not sell member data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4">8. Disclaimers and Limitations of Liability</h2>
            <h3 className="text-xl font-light text-white/90 mb-3 mt-6">8.1 Service Provided "As Is"</h3>
            <p>
              The Service is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that the Service 
              will be uninterrupted, secure, or error-free.
            </p>

            <h3 className="text-xl font-light text-white/90 mb-3 mt-6">8.2 No Business Guarantees</h3>
            <p>
              We do not guarantee specific business outcomes, connections, partnerships, or financial results from using the Service. Member 
              success depends on individual effort, market conditions, and factors beyond our control.
            </p>

            <h3 className="text-xl font-light text-white/90 mb-3 mt-6">8.3 Limitation of Liability</h3>
            <p>
              To the maximum extent permitted by law, Circle Network shall not be liable for any indirect, incidental, special, consequential, 
              or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, 
              or other intangible losses resulting from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4">9. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any time for violations of these Terms, fraudulent activity, or other 
              conduct we deem harmful to the Service or other members. You may terminate your membership at any time by canceling your subscription. 
              Upon termination, your access to the Service will cease, and we may delete your data in accordance with our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4">10. Dispute Resolution</h2>
            <h3 className="text-xl font-light text-white/90 mb-3 mt-6">10.1 Informal Resolution</h3>
            <p>
              If you have a dispute with us, please contact our support team first. We commit to working with you to resolve issues amicably.
            </p>

            <h3 className="text-xl font-light text-white/90 mb-3 mt-6">10.2 Arbitration</h3>
            <p>
              Any disputes that cannot be resolved informally shall be settled by binding arbitration in accordance with the rules of the 
              American Arbitration Association. The arbitration will be held in New York, NY, and judgment on the award may be entered in any 
              court of competent jurisdiction.
            </p>

            <h3 className="text-xl font-light text-white/90 mb-3 mt-6">10.3 Class Action Waiver</h3>
            <p>
              You agree that disputes will be resolved on an individual basis and not as part of a class action or collective proceeding.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4">11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify members of significant changes via email or platform 
              notification at least 30 days before changes take effect. Your continued use of the Service after changes become effective 
              constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4">12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of New York, United States, without 
              regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4">13. Contact Information</h2>
            <p>
              If you have questions about these Terms, please contact us at:
            </p>
            <div className="mt-4 p-6 bg-white/[0.02] border border-[#E5C77E]/10 rounded-xl">
              <p className="text-white/90">Circle Network</p>
              <p className="text-white/60 mt-2">Email: legal@thecirclenetwork.org</p>
              <p className="text-white/60">Support: support@thecirclenetwork.org</p>
            </div>
          </section>

          <section className="pt-8 border-t border-white/10">
            <p className="text-white/50 text-sm">
              By using Circle Network, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
