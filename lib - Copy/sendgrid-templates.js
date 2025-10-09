const PERSONAS = {
  founder: {
    name: 'Founder',
    target: 'Startup CEOs and Founders'
  },
  operator: {
    name: 'Operator',
    target: 'VPs and Directors'
  },
  investor: {
    name: 'Investor',
    target: 'VCs and Angel Investors'
  },
  executive: {
    name: 'Executive',
    target: 'C-suite Executives'
  },
  wildcard: {
    name: 'Wildcard',
    target: 'General Professionals'
  }
};

const EMAIL_TEMPLATES = {
  founder_1: {
    subject: "You're invited, {{first_name}}",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #d4af37 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .logo { width: 60px; height: 60px; margin: 0 auto 15px; }
    h1 { color: white; margin: 0; font-size: 28px; }
    .content { background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; }
    .highlight { background: #fef3c7; padding: 20px; border-left: 4px solid #d4af37; margin: 20px 0; }
    .cta { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #d4af37 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .social-proof { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0; font-size: 14px; color: #6b7280; }
    .footer { text-align: center; padding: 30px; color: #9ca3af; font-size: 12px; }
    .urgency { color: #ef4444; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>You're Invited</h1>
  </div>
  
  <div class="content">
    <p>{{first_name}},</p>
    
    <p>I'm building something you'd want to be part of.</p>
    
    <p><strong>The Circle Network</strong> is an invite-only community of 500 founders and operators who help each other close deals, make hires, and grow faster.</p>
    
    <p>Not another Slack group. No events. No upsells.</p>
    
    <p>Just direct access to people who've been where you're trying to go.</p>
    
    <div class="social-proof">
      <strong>What founding members will get access to:</strong><br>
      • VPs and Directors building world-class teams<br>
      • Founders who've closed multi-million dollar rounds<br>
      • Operators with proven track records at scale
    </div>
    
    <p>You're one of <strong class="urgency">{{spots_remaining}}</strong> people I'm personally inviting as a Founding Member ($199/mo, locked forever).</p>
    
    <p>After 500 members, it's $249/mo.</p>
    
    <div class="highlight">
      <strong>Your invite expires: {{expiry_date}}</strong>
    </div>
    
    <center>
      <a href="{{invite_link}}" class="cta">Claim Your Founding Member Spot →</a>
    </center>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      <strong>P.S.</strong> As a Founding Member, you get 5 invites to bring in people you'd want in your network. Choose wisely.
    </p>
  </div>
  
  <div class="footer">
    <p>The Circle Network<br>
    Invite-only community for operators who help each other win</p>
  </div>
</body>
</html>
    `
  },

  founder_2: {
    subject: "{{new_members_count}} people joined since Monday",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .stat { background: linear-gradient(135deg, #10b981 0%, #d4af37 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .stat-number { font-size: 48px; font-weight: bold; margin: 10px 0; }
    .member-list { background: #f9fafb; padding: 20px; border-radius: 6px; margin: 15px 0; }
    .member { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .cta { display: inline-block; background: #d4af37; color: black; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
  </style>
</head>
<body>
  <p>{{first_name}},</p>
  
  <p>Quick update on your Circle Network invitation:</p>
  
  <div class="stat">
    <div>Since I invited you 3 days ago:</div>
    <div class="stat-number">{{new_members_count}}</div>
    <div>new Founding Members joined</div>
  </div>
  
  <div class="member-list">
    <strong>New members this week include:</strong>
    <div class="member">→ VP Engineering at [Well-known company]</div>
    <div class="member">→ Founder of [Funded startup]</div>
    <div class="member">→ Partner at [Top VC firm]</div>
  </div>
  
  <p><strong>{{spots_remaining}} spots left</strong> at $199/mo</p>
  
  <p>Your invite code still active: <strong>{{invite_code}}</strong></p>
  
  <center>
    <a href="{{invite_link}}" class="cta">Join Today →</a>
  </center>
  
  <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
    <strong>P.S.</strong> After 500 members, we're closing applications. No waitlist.
  </p>
</body>
</html>
    `
  },

  founder_3: {
    subject: "What you're missing",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .value-box { background: #fef3c7; border-left: 4px solid #d4af37; padding: 20px; margin: 15px 0; }
    .metric { background: white; border: 1px solid #e5e7eb; padding: 20px; border-radius: 6px; margin: 10px 0; }
    .metric-value { font-size: 36px; font-weight: bold; color: #10b981; }
    .cta { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #d4af37 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; }
  </style>
</head>
<body>
  <p>{{first_name}},</p>
  
  <p>I'll be direct.</p>
  
  <p>Your Circle Network invite expires in <strong>7 days</strong>, and I want to make sure you understand what you're giving up:</p>
  
  <h3>What Circle members did this week:</h3>
  
  <div class="value-box">
    <strong>1. Posted "Need help with pricing strategy for enterprise SaaS"</strong><br>
    ↳ Got responses from 3 VPs who've done it before<br>
    ↳ Within 4 hours
  </div>
  
  <div class="value-box">
    <strong>2. Asked "Who's hiring senior engineers in SF?"</strong><br>
    ↳ 8 warm intros to companies actively hiring<br>
    ↳ 2 filled their roles through Circle
  </div>
  
  <div class="value-box">
    <strong>3. "Looking for design partners for new AI tool"</strong><br>
    ↳ Connected with 5 potential customers<br>
    ↳ In their first week as a member
  </div>
  
  <p><strong>This happens every day in Circle.</strong></p>
  
  <h3>What it's worth:</h3>
  
  <div class="metric">
    <div class="metric-value">$47,000</div>
    <div>Average value created per member per year</div>
  </div>
  
  <div class="metric">
    <div class="metric-value">12 hours</div>
    <div>Average time saved per month</div>
  </div>
  
  <div class="metric">
    <div class="metric-value">8.3</div>
    <div>Average connections made per member</div>
  </div>
  
  <p><strong>What it costs:</strong> $199/mo as Founding Member (you) vs $249/mo after 500 members</p>
  
  <p>Your code: <strong>{{invite_code}}</strong><br>
  Time left: <strong style="color: #ef4444;">7 days</strong></p>
  
  <center>
    <a href="{{invite_link}}" class="cta">Join Now →</a>
  </center>
  
  <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
    <strong>P.S.</strong> Members who joined in the first 100 have made an average of 14 valuable connections each. Early members get the most value.
  </p>
</body>
</html>
    `
  },

  founder_4: {
    subject: "Last day: Founding Member",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .urgent-box { background: #fee2e2; border: 2px solid #ef4444; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .urgent-text { color: #dc2626; font-size: 24px; font-weight: bold; margin: 10px 0; }
    .cta { display: inline-block; background: #ef4444; color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; }
  </style>
</head>
<body>
  <p>{{first_name}},</p>
  
  <p>This is it.</p>
  
  <div class="urgent-box">
    <div class="urgent-text">Your Founding Member invitation<br>expires TODAY at midnight</div>
  </div>
  
  <p><strong>After that:</strong></p>
  <ul>
    <li>Your invite code (<strong>{{invite_code}}</strong>) stops working</li>
    <li>The rate increases to $249/mo</li>
    <li>We might hit 500 members and close applications</li>
  </ul>
  
  <p>I don't send reminder emails after this.</p>
  
  <p>If you want in, now's the time:</p>
  
  <center>
    <a href="{{invite_link}}" class="cta">Claim Your Spot →</a>
  </center>
  
  <p>If not, I respect that.</p>
  
  <p>Best,<br>Shehab</p>
  
  <p style="font-size: 12px; color: #9ca3af; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
    <strong>P.S.</strong> {{spots_remaining}} Founding Member spots left.
  </p>
</body>
</html>
    `
  }
};

// Copy templates for other personas (operator, investor, executive, wildcard)
// Using same templates for all personas
['operator', 'investor', 'executive', 'wildcard'].forEach(persona => {
  [1, 2, 3, 4].forEach(num => {
    EMAIL_TEMPLATES[`${persona}_${num}`] = EMAIL_TEMPLATES[`founder_${num}`];
  });
});

export function generateEmail(persona, sequenceNumber, variables) {
  const templateKey = `${persona}_${sequenceNumber}`;
  const template = EMAIL_TEMPLATES[templateKey];
  
  if (!template) {
    throw new Error(`Template ${templateKey} not found`);
  }

  let html = template.html;
  let subject = template.subject;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, value || '');
    subject = subject.replace(regex, value || '');
  });

  return { subject, html };
}

export function getNextEmailDelay(currentStage) {
  const delays = {
    1: 3,  // Day 3 after initial
    2: 4,  // Day 7 (3+4)
    3: 7,  // Day 14 (3+4+7)
    4: null // No more emails
  };
  return delays[currentStage];
}

export { PERSONAS, EMAIL_TEMPLATES };
