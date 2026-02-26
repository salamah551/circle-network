'use client';
import { useState } from 'react';
import { 
  ChevronDown, ChevronRight, Users, Mail, CreditCard, 
  Settings, BarChart3, MessageSquare, Shield, Database,
  Zap, TrendingUp, FileText, Clock, CheckCircle, AlertCircle,
  Search, Download, Send, Eye, Edit, Trash2, DollarSign,
  Gift, UserPlus, Calendar, HelpCircle
} from 'lucide-react';
import Link from 'next/link';

const GUIDE_SECTIONS = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Zap,
    color: 'amber',
    subsections: [
      {
        title: 'Admin Dashboard Overview',
        content: `Your admin dashboard is the central hub for managing The Circle Network. Access it at /admin.
        
Key sections:
• Overview - Real-time platform metrics and analytics
• Members - Manage all member accounts and profiles
• Invites - Generate and track invitation codes
• Bulk Invites - Send mass email campaigns with automation
• Subscriptions - Manage Stripe payments and billing
• Activity Logs - Complete audit trail of all admin actions
• Support Tickets - Handle member support requests`,
        icon: BarChart3
      },
      {
        title: 'Admin Access Control',
        content: `Admin access is controlled through database-driven authentication:

1. Admin status is stored in the profiles table (is_admin column)
2. All admin APIs verify session + admin role server-side
3. Current admin emails: nahdasheh@gmail.com, invite@thecirclenetwork.org

To add new admins:
1. Update the profiles table: is_admin = true for the user
2. They will automatically get admin access on next login
3. All admin actions are logged in admin_activity_log table`,
        icon: Shield
      }
    ]
  },
  {
    id: 'member-management',
    title: 'Member Management',
    icon: Users,
    color: 'blue',
    subsections: [
      {
        title: 'Viewing & Searching Members',
        content: `Navigate to /admin/members to access the member directory.

Features:
• Search by name, email, company, or title
• Filter by status (active, pending, inactive)
• Filter by founding member status
• Sort by join date, name, or subscription status
• View detailed member profiles with full information`,
        icon: Search
      },
      {
        title: 'Bulk Actions',
        content: `Select multiple members to perform bulk operations:

Available actions:
• Activate - Set status to 'active' for selected members
• Deactivate - Set status to 'inactive' (suspends access)
• Delete - Permanently remove member accounts
• Export to CSV - Download member data for analysis

How to use:
1. Click checkbox next to member names to select
2. Use "Select All" to choose all visible members
3. Click action button at the top of the table
4. Confirm the action in the popup dialog`,
        icon: CheckCircle
      },
      {
        title: 'Individual Member Actions',
        content: `Click on any member to view their full profile and take actions:

Available actions:
• Edit Profile - Update name, title, company, bio, expertise
• View Activity - See member's messages, events, requests
• Manage Subscription - View Stripe subscription details
• Deactivate/Activate - Change member status
• Delete Account - Permanently remove member

All actions are logged in the activity log for audit purposes.`,
        icon: Edit
      }
    ]
  },
  {
    id: 'application-review',
    title: 'Application Review',
    icon: FileText,
    color: 'cyan',
    subsections: [
      {
        title: 'Reviewing Applications',
        content: `Navigate to /admin/applications to review membership applications.

Application workflow:
1. User applies with invite code
2. Application appears in admin queue
3. Admin reviews applicant details
4. Approve or reject application
5. Approved users can proceed to payment

View application details:
• Full name and contact information
• Professional background (title, company)
• Bio and expertise areas
• What they need help with
• Social media profiles
• Application submission date`,
        icon: Eye
      },
      {
        title: 'Approval Process',
        content: `How to approve or reject applications:

Approval criteria:
• Relevant professional background
• Clear expertise to contribute
• Legitimate company/role
• Complete and thoughtful application
• Aligns with community values

Approve application:
1. Review all applicant details thoroughly
2. Click "Approve" button
3. User's profile status set to 'active'
4. User notified and can proceed to payment
5. Action logged in activity log

Reject application:
1. Review application
2. Click "Reject" with reason
3. User notified with feedback (if configured)
4. Application archived
5. Invite code can be regenerated for others`,
        icon: CheckCircle
      },
      {
        title: 'Application Analytics',
        content: `Track application metrics:

Key metrics:
• Total applications received
• Approval rate (approved/total)
• Average review time
• Top sources (referrals, direct invites, etc.)
• Rejection reasons breakdown

Quality indicators:
• Application completeness scores
• Professional background diversity
• Industry distribution
• Geographic distribution

Use insights to:
• Identify high-quality invite sources
• Refine application questions
• Set approval criteria
• Optimize invite targeting`,
        icon: BarChart3
      }
    ]
  },
  {
    id: 'invite-system',
    title: 'Invitation System',
    icon: Mail,
    color: 'emerald',
    subsections: [
      {
        title: 'Generating Invite Codes',
        content: `Navigate to /admin/invites to create new invitation codes.

Single invite creation:
1. Enter recipient's email address
2. Click "Generate Invite"
3. Code format: FOUNDING-XXXXXX (6 random characters)
4. 7-day expiration from creation date
5. One-time use only

The invite code is automatically emailed to the recipient with a personalized invitation including:
• Direct link with pre-filled email and code
• Founding member benefits explanation
• Clear call-to-action to join`,
        icon: UserPlus
      },
      {
        title: 'Tracking Invites',
        content: `Monitor all sent invitations in the invites table:

Status types:
• pending - Invite sent, not yet used
• used - Successfully used to create account
• expired - Past 7-day expiration date

Tracking data:
• Sent date and time
• Recipient email
• Invite code
• Usage status
• Conversion to paid member

Filter and search invites by email, code, or status to track campaign performance.`,
        icon: BarChart3
      }
    ]
  },
  {
    id: 'bulk-campaigns',
    title: 'Bulk Email Campaigns',
    icon: Send,
    color: 'purple',
    subsections: [
      {
        title: 'Creating Bulk Invite Campaigns',
        content: `Navigate to /admin/bulk-invites to send mass invitation campaigns.

Campaign setup process:
1. Enter campaign name for tracking
2. Paste email addresses (one per line or comma-separated)
3. Select persona type:
   • founder - Tech startup founders
   • operator - Business operators and COOs
   • investor - VCs and angel investors
   • executive - C-level executives
   • wildcard - General professionals
4. System generates unique invite codes for each email
5. Launches automated 4-stage email sequence

Campaign features:
• Automatic deduplication of email addresses
• Invalid email detection and filtering
• Bulk invite code generation
• Automated email sequences with tracking`,
        icon: Zap
      },
      {
        title: 'Email Automation Sequences',
        content: `Each bulk campaign triggers a 4-stage automated sequence:

Email 1 (Day 0) - Initial Invitation
• Sent immediately upon campaign creation
• Personalized with recipient's persona
• Includes unique invite code and signup link
• Social proof and founding member benefits

Email 2 (Day 3) - Social Proof
• "X new members joined this week"
• Updated member count and recent joins
• Community growth momentum

Email 3 (Day 7) - Value Demonstration
• Member success stories specific to persona
• Concrete examples of network value
• Testimonials and ROI examples

Email 4 (Day 14) - Final Urgency
• Expiration reminder (7 days left)
• Last chance to lock in founding member pricing
• Final call-to-action

Timing is automatically managed by the cron job at /api/cron/email-sequences`,
        icon: Clock
      },
      {
        title: 'Email Tracking & Analytics',
        content: `Monitor campaign performance in the email tracking dashboard:

Tracked metrics:
• Email delivery status (sent, delivered, bounced)
• Open rates with pixel tracking
• Click-through rates on links
• Conversion to signup
• Persona-specific performance

Campaign analytics:
• Total emails sent per campaign
• Sequence step completion rates
• Time-to-conversion analysis
• Bounce and unsubscribe tracking

Access detailed reports at /admin/bulk-invites/[campaign-id] to see individual recipient progress through the sequence.`,
        icon: TrendingUp
      },
      {
        title: 'Persona-Based Personalization',
        content: `Each persona receives tailored messaging:

Founder Persona:
• Focuses on fundraising, product-market fit, scaling
• Highlights founder-to-founder connections
• Examples: "Raised $2M from intro", "Found co-founder"

Operator Persona:
• Emphasizes operational efficiency, hiring, processes
• Shows operator community value
• Examples: "Hired VP Ops", "Optimized supply chain"

Investor Persona:
• Deal flow, portfolio support, LP relationships
• Investor-specific networking value
• Examples: "Sourced Series A deal", "Co-invested"

Executive Persona:
• Board seats, strategy, leadership insights
• C-level peer connections
• Examples: "Board advisor role", "Strategic partnership"

Wildcard Persona:
• General professional networking
• Broad value propositions
• Examples: Career opportunities, mentorship
`,
        icon: MessageSquare
      }
    ]
  },
  {
    id: 'subscription-management',
    title: 'Subscription Management',
    icon: CreditCard,
    color: 'rose',
    subsections: [
      {
        title: 'Viewing Subscriptions',
        content: `Access subscription management at /admin/subscriptions.

Subscription dashboard shows:
• All active Stripe subscriptions
• Customer details (name, email, member ID)
• Plan type (Founding $199/mo, Monthly $249/mo, Annual $2,400/yr)
• Subscription status (active, past_due, cancelled)
• Next billing date
• Lifetime value and MRR contribution

Search and filter:
• By member name or email
• By plan type
• By subscription status
• By billing date range`,
        icon: Eye
      },
      {
        title: 'Managing Subscriptions',
        content: `Available subscription actions:

Cancel Subscription:
1. Find member's subscription
2. Click "Cancel Subscription"
3. Confirm cancellation
4. Member loses access at period end
5. Profile status updated to 'cancelled'

Process Refund:
1. Select subscription to refund
2. Choose full or partial refund amount
3. Enter refund reason for records
4. Confirm via Stripe API
5. Member notified via email
6. Action logged in activity log

Update Payment Method:
• Send customer portal link to member
• Member updates card in Stripe portal
• Changes sync automatically`,
        icon: DollarSign
      },
      {
        title: 'Subscription Analytics',
        content: `Key metrics available:

Revenue metrics:
• Monthly Recurring Revenue (MRR)
• Annual Recurring Revenue (ARR)
• Average Revenue Per User (ARPU)
• Customer Lifetime Value (LTV)

Subscription health:
• Churn rate (cancellations/total)
• Retention rate
• Upgrade/downgrade trends
• Failed payment recovery

Founding member tracking:
• Total founding members vs. regular
• Locked-in rate revenue ($199 vs $249)
• Founding member churn rate

Export reports to CSV for deeper analysis or financial reporting.`,
        icon: BarChart3
      }
    ]
  },
  {
    id: 'activity-logs',
    title: 'Activity Logs & Audit Trail',
    icon: FileText,
    color: 'indigo',
    subsections: [
      {
        title: 'Admin Activity Logging',
        content: `Every admin action is automatically logged to admin_activity_log table.

Logged actions include:
• Member account changes (activate, deactivate, delete)
• Subscription modifications (cancel, refund)
• Invite code generation
• Bulk campaign creation
• Settings changes
• Data exports

Each log entry captures:
• Admin user ID and email
• Action type and description
• Target resource (member, subscription, etc.)
• Timestamp (with timezone)
• IP address (if available)
• Result (success/failure)`,
        icon: Database
      },
      {
        title: 'Viewing & Searching Logs',
        content: `Access logs at /admin/activity.

Search and filter options:
• By admin user (see who did what)
• By action type (member, subscription, invite, etc.)
• By date range (today, last 7 days, last 30 days, custom)
• By target member or resource
• By result status (success, error)

Log display shows:
• Chronological timeline of all actions
• Admin name with avatar
• Action description in plain language
• Timestamp with relative time ("2 hours ago")
• Quick links to affected resources

Export logs to CSV for compliance or analysis.`,
        icon: Search
      },
      {
        title: 'Compliance & Security',
        content: `Activity logs support compliance requirements:

Security benefits:
• Detect unauthorized access attempts
• Track admin privilege usage
• Identify suspicious patterns
• Forensic investigation capability

Compliance support:
• SOC 2 audit trail
• GDPR data access logging
• Financial audit requirements
• Internal policy enforcement

Data retention:
• Logs stored indefinitely by default
• Can archive logs older than 1 year
• Deleted member logs preserved
• Immutable log entries (no editing)

Best practices:
• Review logs weekly for anomalies
• Export monthly reports for compliance
• Rotate admin access regularly
• Alert on critical actions (bulk delete, refunds)`,
        icon: Shield
      }
    ]
  },
  {
    id: 'support-system',
    title: 'Support Ticket System',
    icon: HelpCircle,
    color: 'orange',
    subsections: [
      {
        title: 'Managing Support Tickets',
        content: `Access support tickets at /admin/support.

Ticket management features:
• View all member-submitted tickets
• Filter by status (open, in_progress, resolved, closed)
• Search by member name, subject, or content
• Priority levels (low, medium, high, urgent)
• Assigned admin tracking

Ticket workflow:
1. Member submits ticket from dashboard
2. Appears in admin support queue
3. Admin claims ticket (status: in_progress)
4. Admin responds via internal notes or email
5. Mark resolved when complete
6. Member can reopen if not satisfied`,
        icon: MessageSquare
      },
      {
        title: 'Responding to Tickets',
        content: `How to handle support requests:

Quick response process:
1. Click on ticket to view full details
2. Review member information and history
3. Add internal notes for admin team
4. Click "Respond" to email member directly
5. Update ticket status as you progress
6. Set priority based on urgency

Response templates available for:
• Billing questions
• Technical issues
• Feature requests
• Access problems
• General inquiries

Best practices:
• Respond within 24 hours for all tickets
• Use member's name in responses
• Provide clear, actionable solutions
• Follow up on critical issues
• Log resolution time for metrics`,
        icon: Send
      },
      {
        title: 'Support Analytics',
        content: `Track support performance metrics:

Key metrics:
• Average response time
• Average resolution time
• Tickets by category (billing, technical, etc.)
• Member satisfaction scores
• Admin workload distribution

Performance insights:
• Peak support hours and days
• Common issues requiring documentation
• Feature requests frequency
• Escalation patterns

Use analytics to:
• Improve response times
• Create help documentation
• Identify product issues
• Optimize admin staffing
• Measure member satisfaction`,
        icon: TrendingUp
      }
    ]
  },
  {
    id: 'referral-system',
    title: 'Referral Management',
    icon: Gift,
    color: 'teal',
    subsections: [
      {
        title: 'Referral System Overview',
        content: `Every member gets a unique referral code and tracking system.

Referral features:
• Auto-generated referral codes (format: MEMBER-XXXXX)
• Unique referral links with pre-filled parameters
• Conversion tracking (pending → converted)
• Rewards calculation ($50 per conversion)
• Member referral dashboard

How it works:
1. Member shares referral link from /referrals page
2. New user clicks link (email/code pre-filled on landing page)
3. New user signs up and pays
4. Referral marked as "converted"
5. Referring member earns reward ($50 credit or cash)

Admin can track all referrals in /admin/referrals`,
        icon: Gift
      },
      {
        title: 'Managing Referral Rewards',
        content: `Process referral rewards for members:

Reward tiers (configurable):
• 1-5 referrals: $50 per conversion
• 6-10 referrals: $75 per conversion
• 11+ referrals: $100 per conversion

Reward payment options:
1. Account credit (apply to next bill)
2. Direct payment (PayPal, Venmo, wire)
3. Increased platform features/access

Processing rewards:
1. Review converted referrals in admin panel
2. Verify conversion is legitimate
3. Calculate total reward amount
4. Apply credit or process payment
5. Mark reward as "paid" in system
6. Member notified automatically

Monitor for fraud:
• Same IP address signups
• Pattern of cancellations
• Fake email addresses
• Self-referrals`,
        icon: DollarSign
      }
    ]
  },
  {
    id: 'platform-settings',
    title: 'Platform Settings',
    icon: Settings,
    color: 'gray',
    subsections: [
      {
        title: 'Feature Capabilities',
        content: `Platform now uses tier-based capabilities instead of launch dates:

Tier System:
• Inner Circle (Founding Member) - Full ARC™ access
• Core (Charter Member) - Limited ARC™ access

Capabilities are defined in lib/features.ts:
• getTierCapabilities(tier) - Returns feature access for a tier
• hasFeatureAccess(tier, feature) - Check if tier has specific feature

All features are available immediately based on membership tier.
No date-based gating - everything is controlled by tier capabilities.`,
        icon: Calendar
      },

      {
        title: 'Pricing & Plans',
        content: `Current pricing structure:

Founding Member ($199/mo):
• Available until November 1, 2025
• Limited to first 500 members
• Lifetime locked-in rate
• All platform features
• Stripe Price ID: NEXT_PUBLIC_STRIPE_FOUNDING_PRICE_ID

Monthly Plan ($249/mo):
• Available after launch
• Standard membership rate
• Monthly billing cycle
• All platform features
• Stripe Price ID: NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID

Annual Plan ($2,400/yr):
• Available after launch
• Save $588 vs monthly ($249 × 12 = $2,988)
• One-time annual payment
• All platform features
• Stripe Price ID: NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID

To update pricing:
1. Create new price in Stripe dashboard
2. Update price ID in environment secrets
3. Update display prices in /subscribe page
4. Test checkout flow thoroughly`,
        icon: CreditCard
      },
      {
        title: 'Database Management',
        content: `Database administration via Supabase:

Core tables:
• profiles - Member accounts and data
• invites - Invitation codes and tracking
• applications - Membership applications
• messages - Direct messaging
• events - Community events
• requests - Help requests
• support_tickets - Support system
• admin_activity_log - Audit trail
• referrals - Referral tracking
• bulk_invite_campaigns - Email campaigns
• bulk_invite_recipients - Campaign recipients

Database access:
• Development DB: Via Replit environment
• Production DB: Via Supabase dashboard
• SQL queries: Use /api/admin/sql endpoint (admin only)

Row-level security (RLS):
• All tables have RLS policies
• Members can only access their own data
• Admin role bypasses RLS with service key
• Real-time subscriptions respect RLS

Backup strategy:
• Automatic daily backups by Supabase
• Point-in-time recovery available
• Export critical data weekly to CSV
• Test restore process monthly`,
        icon: Database
      }
    ]
  },
  {
    id: 'best-practices',
    title: 'Admin Best Practices',
    icon: CheckCircle,
    color: 'green',
    subsections: [
      {
        title: 'Daily Admin Routine',
        content: `Recommended daily admin tasks:

Morning checklist (15 mins):
□ Check overnight signups and activations
□ Review new support tickets (respond to urgent)
□ Monitor Stripe payment failures
□ Check email campaign performance
□ Review yesterday's activity log for anomalies

Midday checklist (10 mins):
□ Respond to pending support tickets
□ Process any refund requests
□ Check member engagement metrics
□ Review member feedback/complaints

End of day checklist (15 mins):
□ Close resolved support tickets
□ Update member status as needed
□ Export daily metrics for reporting
□ Plan tomorrow's bulk invite campaigns
□ Review and approve pending applications

Weekly tasks:
• Export member list for analysis
• Review subscription health metrics
• Audit admin activity logs
• Update email templates if needed
• Check platform performance metrics`,
        icon: Clock
      },
      {
        title: 'Security Best Practices',
        content: `Keep the platform secure:

Access control:
• Use strong passwords (20+ characters)
• Enable 2FA on admin accounts
• Rotate admin access every 90 days
• Limit admin user count (2-3 max)
• Review admin permissions regularly

Data protection:
• Never share member data externally
• Use encrypted connections only (HTTPS)
• Don't store sensitive data in logs
• Mask payment details in admin views
• Delete old exports regularly

API security:
• Keep API keys in environment secrets
• Monitor Stripe webhook signatures
• Check for failed auth attempts
• Block suspicious IP addresses

Incident response:
• Document security incidents immediately
• Notify affected members within 24 hours
• Update security measures
• Conduct post-incident review`,
        icon: Shield
      },
      {
        title: 'Growth & Scaling Tips',
        content: `Strategies for platform growth:

Invite campaign optimization:
• Test different personas for best conversion
• A/B test email subject lines
• Optimize send times (Tuesday 10am performs best)
• Personalize with dynamic variables
• Track and iterate on performance

Member retention:
• Proactively reach out to inactive members
• Share success stories regularly
• Facilitate valuable connections
• Host exclusive events
• Recognize top contributors

Revenue optimization:
• Upsell annual plans (highlight savings)
• Offer VIP tier for power users ($499/mo)
• Create referral incentive programs
• Bundle corporate memberships
• Partner with complementary services

Community building:
• Highlight member wins publicly
• Create sub-groups by industry/interest
• Facilitate peer mentorship
• Run member spotlight series
• Organize virtual and in-person events`,
        icon: TrendingUp
      }
    ]
  }
];

function GuideSection({ section, isOpen, onToggle }) {
  const Icon = section.icon;
  
  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden mb-4">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 bg-zinc-900 hover:bg-zinc-800 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-6 h-6 text-${section.color}-400`} />
          <h2 className="text-xl font-bold">{section.title}</h2>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-zinc-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-zinc-400" />
        )}
      </button>
      
      {isOpen && (
        <div className="p-6 bg-black space-y-6">
          {section.subsections.map((sub, idx) => {
            const SubIcon = sub.icon;
            return (
              <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <SubIcon className={`w-5 h-5 text-${section.color}-400 mt-1`} />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-3">{sub.title}</h3>
                    <div className="text-zinc-400 whitespace-pre-line leading-relaxed">
                      {sub.content}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminGuidePage() {
  const [openSections, setOpenSections] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const expandAll = () => {
    const allOpen = {};
    GUIDE_SECTIONS.forEach(section => {
      allOpen[section.id] = true;
    });
    setOpenSections(allOpen);
  };

  const collapseAll = () => {
    setOpenSections({});
  };

  // Filter sections based on search
  const filteredSections = GUIDE_SECTIONS.filter(section => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = section.title.toLowerCase().includes(query);
    const contentMatch = section.subsections.some(sub => 
      sub.title.toLowerCase().includes(query) || 
      sub.content.toLowerCase().includes(query)
    );
    return titleMatch || contentMatch;
  });

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin" 
            className="text-amber-400 hover:text-amber-300 mb-4 inline-block"
          >
            ← Back to Admin Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-3">Admin Management Guide</h1>
          <p className="text-zinc-400 text-lg">
            Complete guide to managing The Circle Network platform
          </p>
        </div>

        {/* Search & Controls */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search guide..."
                  className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={expandAll}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Links</h2>
          <div className="grid md:grid-cols-3 gap-3">
            <Link href="/admin" className="flex items-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <span>Dashboard</span>
            </Link>
            <Link href="/admin/members" className="flex items-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
              <Users className="w-5 h-5 text-blue-400" />
              <span>Members</span>
            </Link>
            <Link href="/admin/applications" className="flex items-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
              <FileText className="w-5 h-5 text-cyan-400" />
              <span>Applications</span>
            </Link>
            <Link href="/admin/invites" className="flex items-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
              <Mail className="w-5 h-5 text-emerald-400" />
              <span>Invites</span>
            </Link>
            <Link href="/admin/bulk-invites" className="flex items-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
              <Send className="w-5 h-5 text-purple-400" />
              <span>Bulk Campaigns</span>
            </Link>
            <Link href="/admin/subscriptions" className="flex items-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
              <CreditCard className="w-5 h-5 text-rose-400" />
              <span>Subscriptions</span>
            </Link>
            <Link href="/admin/activity" className="flex items-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>Activity Logs</span>
            </Link>
            <Link href="/admin/support" className="flex items-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
              <HelpCircle className="w-5 h-5 text-orange-400" />
              <span>Support</span>
            </Link>
          </div>
        </div>

        {/* Guide Sections */}
        <div>
          {filteredSections.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
              <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">No results found for "{searchQuery}"</p>
            </div>
          ) : (
            filteredSections.map(section => (
              <GuideSection
                key={section.id}
                section={section}
                isOpen={openSections[section.id]}
                onToggle={() => toggleSection(section.id)}
              />
            ))
          )}
        </div>

        {/* Footer Help */}
        <div className="mt-12 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-6 h-6 text-amber-400 mt-1" />
            <div>
              <h3 className="text-lg font-bold mb-2">Need Additional Help?</h3>
              <p className="text-zinc-400 mb-4">
                If you have questions not covered in this guide, contact the technical team or refer to the platform documentation.
              </p>
              <div className="flex gap-3">
                <a 
                  href="mailto:support@thecirclenetwork.org" 
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
                >
                  Contact Support
                </a>
                <Link 
                  href="/admin" 
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
