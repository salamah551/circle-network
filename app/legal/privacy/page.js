'use client';
import { ArrowLeft, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicy() {
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

        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-[#E5C77E]/10 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-[#E5C77E]" />
          </div>
          <h1 className="text-4xl font-light text-white tracking-tight">Privacy Policy</h1>
        </div>
        <p className="text-white/50 font-light mb-12">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="space-y-8 text-white/70 font-light leading-relaxed">
          <section className="bg-[#E5C77E]/5 border border-[#E5C77E]/20 rounded-xl p-6">
            <h3 className="text-lg font-light text-white mb-3">Our Commitment to Your Privacy</h3>
            <p>
              At The Circle Reserve, we take your privacy seriously. This Privacy Policy explains how we collect, use, protect, and share your 
              personal information. We do not sell your data to third parties, and we maintain strict confidentiality standards befitting our 
              exclusive membership.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4">1. Information We Collect</h2>
            
            <h3 className="text-xl font-light text-white/90 mb-3 mt-6">1.1 Information You Provide</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Account Information:</strong> Name, email address, company, job title, professional credentials, LinkedIn profile</li>
              <li><strong>Profile Information:</strong> Professional bio, expertise areas, location, avatar/photo</li>
              <li><strong>Payment Information:</strong> Credit card details (securely processed by Stripe - we never store full card numbers)</li>
              <li><strong>Communications:</strong> Messages sent to other members, event RSVPs, request board posts</li>
              <li><strong>Deal Room Data:</strong> Information shared in private collaboration spaces, including documents and commitments</li>
            </ul>

            <h3 className="text-xl font-light text-white/90 mb-3 mt-6">1.2 Information We Collect Automatically</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform, click patterns</li>
              <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
              <li><strong>Cookies:</strong> Session cookies for authentication, preference cookies for settings</li>
              <li><strong>Analytics:</strong> Aggregated usage statistics to improve the platform</li>
            </ul>

            <h3 className="text-xl font-light text-white/90 mb-3 mt-6">1.3 Information from Third Parties</h3>
            <p>
              We may receive information from:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>LinkedIn (if you choose to connect your profile)</li>
              <li>Payment processors (Stripe) for transaction verification</li>
              <li>Email service providers (SendGrid) for delivery confirmation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
              <li><strong>Provide the Service:</strong> Enable you to connect with other members, access features, and participate in the community</li>
              <li><strong>Personalization:</strong> Generate strategic introduction recommendations, suggest relevant events and opportunities</li>
              <li><strong>Communication:</strong> Send important updates, platform notifications, and member activity alerts</li>
              <li><strong>Payment Processing:</strong> Manage subscriptions, process refunds, prevent fraud</li>
              <li><strong>Platform Improvement:</strong> Analyze usage patterns to enhance features and user experience</li>
              <li><strong>Security:</strong> Detect and prevent unauthorized access, abuse, and violations of our Terms</li>
              <li><strong>Legal Compliance:</strong> Fulfill legal obligations, respond to lawful requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4">3. How We Share Your Information</h2>
            
            <h3 className="text-xl font-light text-white/90 mb-3 mt-6">3.1 Within The Circle Reserve</h3>
            <p>
              Your profile information is visible to other members to facilitate connections. You control what information appears in your profile. 
              Private messages, deal room content, and certain activities are only visible to intended recipients.
            </p>

            <h3 className="text-xl font-light text-white/90 mb-3 mt-6">3.2 Service Providers</h3>
            <p>We share information with trusted third-party service providers who assist us in operating the platform:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li><strong>Supabase:</strong> Database and authentication infrastructure</li>
              <li><strong>Stripe:</strong> Payment processing (they have their own privacy policy)</li>
              <li><strong>SendGrid:</strong> Transactional email delivery</li>
              <li><strong>Vercel/Replit:</strong> Hosting and infrastructure</li>
            </ul>
            <p className="mt-4">
              These providers are contractually obligated to protect your data and use it only for specified purposes.
            </p>

            <h3 className="text-xl font-light text-white/90 mb-3 mt-6">3.3 We DO NOT:</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Sell your personal information to advertisers or data brokers</li>
              <li>Share member lists with third parties for marketing purposes</li>
              <li>Display targeted advertising from external companies</li>
              <li>Use your data for purposes unrelated to the Service</li>
            </ul>

            <h3 className="text-xl font-light text-white/90 mb-3 mt-6">3.4 Legal Requirements</h3>
            <p>
              We may disclose information if required by law, court order, or to protect the rights, property, or safety of The Circle Reserve, 
              our members, or others.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4">4. Data Security</h2>
            <p>We implement industry-standard security measures to protect your information:</p>
            <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
              <li><strong>Encryption:</strong> Data transmitted over HTTPS with TLS encryption</li>
              <li><strong>Authentication:</strong> Secure passwordless magic link authentication</li>
              <li><strong>Access Controls:</strong> Role-based permissions, limited employee access</li>
              <li><strong>Monitoring:</strong> Continuous security monitoring and threat detection</li>
              <li><strong>Regular Audits:</strong> Periodic security assessments and updates</li>
            </ul>
            <p className="mt-4">
              While we take security seriously, no system is 100% secure. You are responsible for maintaining the confidentiality of your 
              account credentials.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4">5. Your Privacy Rights</h2>
            <p>You have the following rights regarding your personal information:</p>
            
            <h3 className="text-xl font-light text-white/90 mb-3 mt-6">5.1 Access and Portability</h3>
            <p>
              You can access your personal information through your profile settings. You may request a copy of your data in a portable format.
            </p>

            <h3 className="text-xl font-light text-white/90 mb-3 mt-6">5.2 Correction and Update</h3>
            <p>
              You can update your profile information at any time. If you believe we have incorrect information, contact us for correction.
            </p>

            <h3 className="text-xl font-light text-white/90 mb-3 mt-6">5.3 Deletion</h3>
            <p>
              You may request deletion of your account and personal information. We will delete your data within 30 days, except where we must 
              retain it for legal or accounting purposes. Note that some information may remain in backups for a limited period.
            </p>

            <h3 className="text-xl font-light text-white/90 mb-3 mt-6">5.4 Opt-Out</h3>
            <p>
              You can opt out of non-essential communications (marketing emails, member activity notifications) through your account settings. 
              You cannot opt out of essential service communications (payment receipts, security alerts, terms updates).
            </p>

            <h3 className="text-xl font-light text-white/90 mb-3 mt-6">5.5 California Residents (CCPA)</h3>
            <p>
              If you are a California resident, you have additional rights under the California Consumer Privacy Act, including the right to 
              know what personal information we collect, the right to delete, and the right to opt out of sale (though we do not sell data).
            </p>

            <h3 className="text-xl font-light text-white/90 mb-3 mt-6">5.6 European Residents (GDPR)</h3>
            <p>
              If you are in the European Economic Area, you have rights under the General Data Protection Regulation, including data portability, 
              right to be forgotten, and the right to object to processing. Our legal basis for processing is primarily contract performance and 
              legitimate interests.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4">6. Cookies and Tracking</h2>
            <p>We use cookies and similar technologies for:</p>
            <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
              <li><strong>Essential Cookies:</strong> Required for authentication and core functionality (cannot be disabled)</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Analytics Cookies:</strong> Understand how you use the platform (aggregated, anonymized data)</li>
            </ul>
            <p className="mt-4">
              You can control non-essential cookies through your browser settings. Disabling cookies may limit some features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4">7. Data Retention</h2>
            <p>
              We retain your information for as long as your account is active or as needed to provide services. After account deletion, we 
              retain certain information for:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 ml-4">
              <li>Legal compliance (e.g., tax records for 7 years)</li>
              <li>Dispute resolution and fraud prevention</li>
              <li>Enforcing our Terms of Service</li>
            </ul>
            <p className="mt-4">
              Aggregated, anonymized data may be retained indefinitely for analytics and platform improvement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4">8. Children's Privacy</h2>
            <p>
              The Circle Reserve is not intended for individuals under 18 years of age. We do not knowingly collect information from children. 
              If we discover we have collected information from a child, we will delete it immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4">9. International Data Transfers</h2>
            <p>
              The Circle Reserve operates globally. Your information may be transferred to and processed in countries other than your own, 
              including the United States. We ensure appropriate safeguards are in place for international transfers, including Standard 
              Contractual Clauses where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes via email or platform notification 
              at least 30 days before changes take effect. Your continued use of the Service after changes indicates acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-white mb-4">11. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:
            </p>
            <div className="mt-4 p-6 bg-white/[0.02] border border-[#E5C77E]/10 rounded-xl">
              <p className="text-white/90 font-medium">Privacy Team</p>
              <p className="text-white/60 mt-2">Email: privacy@thecirclereserve.com</p>
              <p className="text-white/60">Support: support@thecirclereserve.com</p>
              <p className="text-white/60 mt-4">Response Time: Within 48 hours</p>
            </div>
          </section>

          <section className="pt-8 border-t border-white/10">
            <p className="text-white/50 text-sm">
              By using The Circle Reserve, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, 
              use, and sharing of your information as described herein.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
