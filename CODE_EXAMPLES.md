# Code Examples and Implementation Patterns

## PostHog Analytics Integration

### 1. Initializing PostHog (lib/posthog.js)

```javascript
import posthog from 'posthog-js';

export function initPostHog() {
  if (typeof window === 'undefined') return;
  if (isInitialized) return;
  
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';
  
  if (!posthogKey) {
    console.warn('PostHog key not configured.');
    return;
  }
  
  posthog.init(posthogKey, {
    api_host: posthogHost,
    capture_pageview: true,
    respect_dnt: true,
  });
  
  isInitialized = true;
}
```

### 2. Tracking Events (Client-Side)

```javascript
// Track checkout initiation
trackEvent('checkout_initiated', {
  plan: 'Founding Member',
  plan_type: 'founding',
  user_email: session.user.email,
  user_id: session.user.id
});

// Identify user on sign-in
identifyUser(userId, {
  email: email,
  signed_in_at: new Date().toISOString()
});
```

### 3. Server-Side Tracking (Webhook)

```javascript
// Server-side PostHog tracking helper
async function trackServerEvent(eventName, properties = {}) {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';
  
  if (!posthogKey) return;
  
  await fetch(`${posthogHost}/capture/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: posthogKey,
      event: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
      },
      distinct_id: properties.user_id || 'server',
    }),
  });
}

// Usage in webhook
await trackServerEvent('payment_successful', {
  user_id: userId,
  customer_email: session.customer_email,
  is_founding_member: isFoundingMember,
  amount: session.amount_total,
});
```

## Automated Pricing System

### 1. Founding Member Count API

```javascript
// app/api/founding-members/count/route.js
export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_founding_member', true);

  const foundingMemberCount = count || 0;
  const maxFoundingMembers = 50;

  return NextResponse.json({
    count: foundingMemberCount,
    spotsAvailable: Math.max(0, maxFoundingMembers - foundingMemberCount),
    maxSpots: maxFoundingMembers,
    isFull: foundingMemberCount >= maxFoundingMembers,
  });
}
```

### 2. Dynamic Tier Selection (Checkout API)

```javascript
// Check founding member count before determining pricing
let actualTier = tier;

if (tier && tier.toLowerCase() === 'founding') {
  const { count: foundingCount, error: countError } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_founding_member', true);
  
  if ((foundingCount || 0) >= 50) {
    console.log('Founding member slots full, defaulting to premium tier');
    actualTier = 'premium';
  }
}

// Map tier to correct Price ID
const tierToPriceId = {
  'founding': process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDING,
  'premium': process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM,
  'elite': process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE
};

finalPriceId = tierToPriceId[actualTier.toLowerCase()];
```

### 3. Frontend Availability Check

```javascript
// Fetch founding member status on page load
const [foundingMemberStatus, setFoundingMemberStatus] = useState({
  isFull: false,
  spotsAvailable: 50,
  count: 0,
  loading: true
});

useEffect(() => {
  async function fetchFoundingMemberStatus() {
    const response = await fetch('/api/founding-members/count');
    if (response.ok) {
      const data = await response.json();
      setFoundingMemberStatus({
        isFull: data.isFull,
        spotsAvailable: data.spotsAvailable,
        count: data.count,
        loading: false
      });
      
      // Auto-switch to premium if founding is full
      if (data.isFull && selectedPlan === 'founding') {
        setSelectedPlan('premium');
      }
    }
  }
  
  fetchFoundingMemberStatus();
}, []);
```

### 4. Conditional UI Rendering

```javascript
{/* Show founding member banner when spots available */}
{!isLaunched && !foundingMemberStatus.loading && !foundingMemberStatus.isFull && (
  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
    <p className="text-amber-400 font-bold">🔥 Founding 50 - Limited Availability</p>
    <div className="text-3xl font-bold">{foundingMemberStatus.spotsAvailable}</div>
    <p className="text-zinc-400">spots remaining at $2,497/year (save $2,500)</p>
  </div>
)}

{/* Show sold out banner when full */}
{!isLaunched && !foundingMemberStatus.loading && foundingMemberStatus.isFull && (
  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
    <p className="text-red-400 font-bold">❌ Founding 50 - SOLD OUT</p>
    <p className="text-zinc-400">Premium and Elite tiers available below.</p>
  </div>
)}

{/* Show premium/elite tiers when founding is full */}
{(foundingMemberStatus.isFull || isLaunched) && (
  <PremiumTierCard />
  <EliteTierCard />
)}
```

## Welcome Email System

### 1. Email Template Function

```javascript
export const sendFoundingMemberWelcomeEmail = async ({ to, name, isFoundingMember }) => {
  const msg = {
    to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Welcome to The Circle Network${isFoundingMember ? ' - Founding Member 🎉' : ''}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, sans-serif; }
          .header { background: #000; padding: 30px; text-align: center; }
          .badge { background: linear-gradient(to right, #10B981, #D4AF37); }
          .guarantee-box { background: #10B981; color: #fff; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">THE CIRCLE NETWORK</div>
          ${isFoundingMember ? '<div>Founding Member</div>' : ''}
        </div>
        
        <div class="content">
          <p>Hi ${escapeHtml(name)},</p>
          <p>Welcome to The Circle Network! 🎉</p>
          
          ${isFoundingMember ? `
            <div class="badge">🏆 FOUNDING 50 MEMBER</div>
            <p>Your lifetime price of $2,497/year is locked in forever.</p>
          ` : ''}
          
          <div class="guarantee-box">
            <h3>Our Guarantees to You:</h3>
            <p>✓ 30-Day Money-Back Guarantee</p>
            <p>✓ 3 Wins in 90 Days — Or +3 Months Free</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await sgMail.send(msg);
};
```

### 2. Sending Email in Webhook

```javascript
// After successful payment
if (!profileError) {
  // Get user name
  const { data: userProfile } = await supabaseAdmin
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .single();
  
  // Send welcome email
  await sendFoundingMemberWelcomeEmail({
    to: session.customer_email,
    name: userProfile?.full_name || 'there',
    isFoundingMember: isFoundingMember
  });
}
```

## Updated ROI Calculator

```javascript
const scenarios = {
  intro: {
    title: 'One warm intro to investor',
    cost: 2497,
    value: 250000,
    description: 'Skip 6 months of cold outreach.',
  },
  hire: {
    title: 'One quality hire referral',
    cost: 2497,
    value: 50000,
    description: 'Save $50K+ in recruiter fees.',
  },
  deal: {
    title: 'One partnership closed',
    cost: 2497,
    value: 500000,
    description: 'Average first-year value.',
  },
};

const roi = Math.round((current.value / current.cost - 1) * 100);
// Returns ROI like: 100x, 20x, 200x, etc.
```

## Environment Variable Setup

```bash
# .env.local
# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_your_project_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Stripe - Three Price IDs
NEXT_PUBLIC_STRIPE_PRICE_FOUNDING=price_1234567890founding
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM=price_1234567890premium
NEXT_PUBLIC_STRIPE_PRICE_ELITE=price_1234567890elite

# Existing variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=sk_test_your_stripe_key
SENDGRID_API_KEY=SG.your_sendgrid_key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Database Queries

### Check Founding Member Count
```sql
SELECT COUNT(*) 
FROM profiles 
WHERE is_founding_member = true;
```

### Set User as Founding Member
```sql
UPDATE profiles 
SET is_founding_member = true,
    status = 'active',
    subscription_status = 'active'
WHERE id = 'user_uuid';
```

### Get Active Founding Members
```sql
SELECT id, full_name, email, created_at
FROM profiles 
WHERE is_founding_member = true 
  AND status = 'active'
ORDER BY created_at ASC
LIMIT 50;
```

## Error Handling Patterns

### Graceful Degradation
```javascript
// PostHog fails gracefully if not configured
export function trackEvent(eventName, properties = {}) {
  if (typeof window === 'undefined') return;
  if (!isInitialized) return; // Silently skip if not initialized
  
  posthog.capture(eventName, properties);
}

// Pricing system defaults to premium if count check fails
if (countError) {
  console.error('Error checking founding member count:', countError);
  // Continue with requested tier, don't block checkout
}

// Welcome email errors don't fail the webhook
try {
  await sendFoundingMemberWelcomeEmail({...});
} catch (emailError) {
  console.error('Error sending welcome email:', emailError);
  // Don't fail the webhook if email fails
}
```

## Testing Examples

### Unit Test: Founding Member Count
```javascript
// Test < 50 members
const response = await fetch('/api/founding-members/count');
const data = await response.json();
expect(data.isFull).toBe(false);
expect(data.spotsAvailable).toBeGreaterThan(0);

// Mock >= 50 members
// Insert 50 founding members in test DB
const response = await fetch('/api/founding-members/count');
const data = await response.json();
expect(data.isFull).toBe(true);
expect(data.spotsAvailable).toBe(0);
```

### Integration Test: Checkout Flow
```javascript
// Test founding member checkout
const response = await fetch('/api/stripe/checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${testToken}`
  },
  body: JSON.stringify({
    tier: 'founding',
  }),
});

const data = await response.json();
expect(data.url).toContain('checkout.stripe.com');
```

## Performance Considerations

- **PostHog**: Loaded asynchronously, doesn't block page render
- **API endpoint**: Uses Supabase count query (optimized with index on `is_founding_member`)
- **Caching**: Consider adding Redis cache for founding member count (refresh every 5 minutes)
- **Database index**: Ensure index exists on `profiles.is_founding_member`

```sql
CREATE INDEX IF NOT EXISTS idx_profiles_founding_member 
ON profiles(is_founding_member) 
WHERE is_founding_member = true;
```
