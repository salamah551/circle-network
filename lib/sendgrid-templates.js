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
    subject: "Your reserved seat at The Circle",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif; line-height: 1.8; color: #2D2D2D; max-width: 600px; margin: 0 auto; padding: 0; background: #FAFAFA; }
    .container { background: #FFFFFF; margin: 40px 20px; }
    .header { padding: 50px 40px 30px; border-bottom: 1px solid #E5C77E20; }
    .logo-text { font-size: 11px; letter-spacing: 0.3em; color: #E5C77E; font-weight: 300; margin-bottom: 5px; }
    .content { padding: 40px 40px 50px; }
    .greeting { font-size: 16px; color: #666; font-weight: 300; margin-bottom: 30px; }
    .body-text { font-size: 16px; line-height: 1.8; color: #2D2D2D; margin-bottom: 20px; font-weight: 300; }
    .highlight-box { background: #F5F5F0; border-left: 2px solid #E5C77E; padding: 25px 30px; margin: 30px 0; }
    .highlight-text { font-size: 15px; color: #666; line-height: 1.7; font-weight: 300; }
    .cta-container { text-align: center; margin: 40px 0; }
    .cta { display: inline-block; background: #E5C77E; color: #0A0E27; padding: 16px 45px; text-decoration: none; font-size: 14px; font-weight: 400; letter-spacing: 0.05em; transition: all 0.3s; }
    .cta:hover { background: #D4AF37; }
    .divider { height: 1px; background: #E5C77E20; margin: 35px 0; }
    .ps { font-size: 14px; color: #999; font-style: italic; padding-top: 30px; border-top: 1px solid #E5C77E15; margin-top: 40px; font-weight: 300; }
    .footer { padding: 40px; text-align: center; color: #999; font-size: 12px; font-weight: 300; letter-spacing: 0.05em; }
    .signature { font-size: 15px; color: #2D2D2D; margin-top: 35px; font-weight: 300; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-text">THE CIRCLE RESERVE</div>
    </div>
    
    <div class="content">
      <div class="greeting">{{first_name}},</div>
      
      <p class="body-text">You've been selected for reserved seating in The Circle—an invitation-only network of 500 high-performing professionals across finance, technology, consulting, and commerce.</p>
      
      <p class="body-text">This is not a community in the traditional sense. No events calendar. No networking mixers. No professional development seminars.</p>
      
      <p class="body-text">Rather, it's direct access to individuals who've built what you're building, solved what you're solving, and navigated what you're navigating.</p>
      
      <div class="highlight-box">
        <p class="highlight-text" style="margin: 0;"><strong style="color: #2D2D2D;">What founding reserve members access:</strong></p>
        <p class="highlight-text" style="margin: 15px 0 0 0;">
          Strategic connections that close deals<br>
          Verified expertise when decisions matter<br>
          Private introductions that skip the queue
        </p>
      </div>
      
      <p class="body-text">Your founding reserve seat is held at $199 monthly—a rate that remains fixed indefinitely, even if you pause and return. After the first 500 members, admission increases to $249 monthly.</p>
      
      <p class="body-text">Currently {{spots_remaining}} seats remain.</p>
      
      <div class="divider"></div>
      
      <p class="body-text" style="margin-bottom: 10px;">Your invitation code:</p>
      <p class="body-text" style="font-family: 'Courier New', monospace; font-size: 18px; letter-spacing: 0.1em; color: #E5C77E; margin-top: 0;">{{invite_code}}</p>
      
      <p class="body-text">This code expires {{expiry_date}}.</p>
      
      <div class="cta-container">
        <a href="{{invite_link}}" class="cta">SECURE YOUR SEAT</a>
      </div>
      
      <div class="signature">
        Regards,<br>
        Shehab Asheh<br>
        <span style="font-size: 13px; color: #999;">Founder, The Circle</span>
      </div>
      
      <div class="ps">
        <strong>P.S.</strong> Founding reserve members receive 5 priority invitations—the ability to bring trusted peers directly into the network. Select them carefully.
      </div>
    </div>
    
    <div class="footer">
      THE CIRCLE RESERVE<br>
      Where capital meets caliber
    </div>
  </div>
</body>
</html>
    `
  },

  founder_2: {
    subject: "{{new_members_count}} professionals joined this week",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif; line-height: 1.8; color: #2D2D2D; max-width: 600px; margin: 0 auto; padding: 0; background: #FAFAFA; }
    .container { background: #FFFFFF; margin: 40px 20px; }
    .header { padding: 50px 40px 30px; border-bottom: 1px solid #E5C77E20; }
    .logo-text { font-size: 11px; letter-spacing: 0.3em; color: #E5C77E; font-weight: 300; }
    .content { padding: 40px 40px 50px; }
    .greeting { font-size: 16px; color: #666; font-weight: 300; margin-bottom: 30px; }
    .body-text { font-size: 16px; line-height: 1.8; color: #2D2D2D; margin-bottom: 20px; font-weight: 300; }
    .stat-box { background: linear-gradient(135deg, #E5C77E15 0%, #E5C77E05 100%); padding: 35px; text-align: center; margin: 30px 0; }
    .stat-number { font-size: 52px; font-weight: 200; color: #E5C77E; letter-spacing: -0.02em; margin: 10px 0; }
    .stat-label { font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 300; }
    .member-list { background: #F8F8F8; padding: 25px 30px; margin: 25px 0; }
    .member-item { padding: 12px 0; color: #666; font-size: 15px; font-weight: 300; border-bottom: 1px solid #E5C77E10; }
    .member-item:last-child { border-bottom: none; }
    .cta-container { text-align: center; margin: 40px 0; }
    .cta { display: inline-block; background: #E5C77E; color: #0A0E27; padding: 16px 45px; text-decoration: none; font-size: 14px; font-weight: 400; letter-spacing: 0.05em; }
    .ps { font-size: 14px; color: #999; font-style: italic; padding-top: 30px; border-top: 1px solid #E5C77E15; margin-top: 40px; font-weight: 300; }
    .footer { padding: 40px; text-align: center; color: #999; font-size: 12px; font-weight: 300; letter-spacing: 0.05em; }
    .signature { font-size: 15px; color: #2D2D2D; margin-top: 35px; font-weight: 300; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-text">THE CIRCLE RESERVE</div>
    </div>
    
    <div class="content">
      <div class="greeting">{{first_name}},</div>
      
      <p class="body-text">A brief update on your reserved seat:</p>
      
      <div class="stat-box">
        <div class="stat-label">New members since your invitation</div>
        <div class="stat-number">{{new_members_count}}</div>
        <div class="stat-label">Founding reserve seats claimed</div>
      </div>
      
      <div class="member-list">
        <div style="font-size: 13px; color: #999; margin-bottom: 15px; letter-spacing: 0.05em;">RECENT ADDITIONS</div>
        <div class="member-item">Managing Partner, Private Equity</div>
        <div class="member-item">VP Product, Series C Technology</div>
        <div class="member-item">Principal, Tier-1 Venture Capital</div>
        <div class="member-item">Operating Partner, Growth Fund</div>
      </div>
      
      <p class="body-text"><strong style="color: #E5C77E;">{{spots_remaining}} founding reserve seats</strong> remain at the $199 monthly rate.</p>
      
      <p class="body-text">Your invitation code: <span style="font-family: 'Courier New', monospace; color: #E5C77E; letter-spacing: 0.1em;">{{invite_code}}</span></p>
      
      <div class="cta-container">
        <a href="{{invite_link}}" class="cta">CLAIM YOUR SEAT</a>
      </div>
      
      <div class="signature">
        Regards,<br>
        Shehab Asheh
      </div>
      
      <div class="ps">
        <strong>P.S.</strong> We maintain a cap of 500 founding members to preserve network quality and access.
      </div>
    </div>
    
    <div class="footer">
      THE CIRCLE RESERVE
    </div>
  </div>
</body>
</html>
    `
  },

  founder_3: {
    subject: "The value of your network",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif; line-height: 1.8; color: #2D2D2D; max-width: 600px; margin: 0 auto; padding: 0; background: #FAFAFA; }
    .container { background: #FFFFFF; margin: 40px 20px; }
    .header { padding: 50px 40px 30px; border-bottom: 1px solid #E5C77E20; }
    .logo-text { font-size: 11px; letter-spacing: 0.3em; color: #E5C77E; font-weight: 300; }
    .content { padding: 40px 40px 50px; }
    .greeting { font-size: 16px; color: #666; font-weight: 300; margin-bottom: 30px; }
    .body-text { font-size: 16px; line-height: 1.8; color: #2D2D2D; margin-bottom: 20px; font-weight: 300; }
    .case-study { background: #F8F8F8; padding: 25px 30px; margin: 20px 0; border-left: 2px solid #E5C77E; }
    .case-title { font-size: 15px; color: #2D2D2D; margin-bottom: 12px; font-weight: 400; }
    .case-detail { font-size: 14px; color: #666; line-height: 1.7; font-weight: 300; }
    .metric-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
    .metric { background: #FAFAFA; padding: 25px; text-align: center; border: 1px solid #E5C77E20; }
    .metric-value { font-size: 36px; font-weight: 200; color: #E5C77E; margin-bottom: 8px; }
    .metric-label { font-size: 13px; color: #666; font-weight: 300; }
    .cta-container { text-align: center; margin: 40px 0; }
    .cta { display: inline-block; background: #E5C77E; color: #0A0E27; padding: 16px 45px; text-decoration: none; font-size: 14px; font-weight: 400; letter-spacing: 0.05em; }
    .ps { font-size: 14px; color: #999; font-style: italic; padding-top: 30px; border-top: 1px solid #E5C77E15; margin-top: 40px; font-weight: 300; }
    .footer { padding: 40px; text-align: center; color: #999; font-size: 12px; font-weight: 300; letter-spacing: 0.05em; }
    .signature { font-size: 15px; color: #2D2D2D; margin-top: 35px; font-weight: 300; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-text">THE CIRCLE RESERVE</div>
    </div>
    
    <div class="content">
      <div class="greeting">{{first_name}},</div>
      
      <p class="body-text">Before your invitation expires, I wanted to share what members accomplish inside The Circle.</p>
      
      <p class="body-text">These are real outcomes from the past 30 days:</p>
      
      <div class="case-study">
        <div class="case-title">Series B Founder, Enterprise SaaS</div>
        <div class="case-detail">
          Request: "Need introduction to procurement at Fortune 500 companies"<br>
          Result: 3 warm introductions within 48 hours. Closed $1.8M enterprise contract.
        </div>
      </div>
      
      <div class="case-study">
        <div class="case-title">Managing Partner, Growth Fund</div>
        <div class="case-detail">
          Request: "Looking for LP co-investment in Series C round"<br>
          Result: Member-to-member connection led to $12M LP commitment.
        </div>
      </div>
      
      <div class="case-study">
        <div class="case-title">VP Engineering, Public Tech</div>
        <div class="case-detail">
          Request: "Hiring 3 senior engineers, exhausted my network"<br>
          Result: 7 qualified referrals. Filled all 3 positions through Circle introductions.
        </div>
      </div>
      
      <p class="body-text" style="margin-top: 35px;">The pattern is consistent:</p>
      
      <div class="metric-grid">
        <div class="metric">
          <div class="metric-value">$127M+</div>
          <div class="metric-label">Capital raised</div>
        </div>
        <div class="metric">
          <div class="metric-value">1,847</div>
          <div class="metric-label">Strategic intros</div>
        </div>
      </div>
      
      <p class="body-text">Your investment: $199 monthly as a founding member.</p>
      
      <p class="body-text">Your invitation remains valid for <strong style="color: #E5C77E;">7 days</strong>.</p>
      
      <div class="cta-container">
        <a href="{{invite_link}}" class="cta">SECURE YOUR SEAT</a>
      </div>
      
      <div class="signature">
        Regards,<br>
        Shehab Asheh
      </div>
      
      <div class="ps">
        <strong>P.S.</strong> The first 100 members have averaged 14 high-value connections each. Earlier entry compounds advantage.
      </div>
    </div>
    
    <div class="footer">
      THE CIRCLE RESERVE
    </div>
  </div>
</body>
</html>
    `
  },

  founder_4: {
    subject: "Final notice: Your reserved seat expires today",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif; line-height: 1.8; color: #2D2D2D; max-width: 600px; margin: 0 auto; padding: 0; background: #FAFAFA; }
    .container { background: #FFFFFF; margin: 40px 20px; }
    .header { padding: 50px 40px 30px; border-bottom: 1px solid #E5C77E20; }
    .logo-text { font-size: 11px; letter-spacing: 0.3em; color: #E5C77E; font-weight: 300; }
    .content { padding: 40px 40px 50px; }
    .greeting { font-size: 16px; color: #666; font-weight: 300; margin-bottom: 30px; }
    .body-text { font-size: 16px; line-height: 1.8; color: #2D2D2D; margin-bottom: 20px; font-weight: 300; }
    .notice-box { background: #FFF9F0; border: 1px solid #E5C77E40; padding: 30px; margin: 30px 0; text-align: center; }
    .notice-title { font-size: 20px; color: #C4A05A; margin-bottom: 15px; font-weight: 300; letter-spacing: 0.05em; }
    .notice-detail { font-size: 15px; color: #666; font-weight: 300; line-height: 1.7; }
    .detail-list { background: #FAFAFA; padding: 25px 30px; margin: 25px 0; }
    .detail-item { padding: 10px 0; color: #666; font-size: 15px; font-weight: 300; border-bottom: 1px solid #E5C77E10; }
    .detail-item:last-child { border-bottom: none; }
    .cta-container { text-align: center; margin: 40px 0; }
    .cta { display: inline-block; background: #C4A05A; color: #FFFFFF; padding: 18px 50px; text-decoration: none; font-size: 15px; font-weight: 400; letter-spacing: 0.05em; }
    .ps { font-size: 14px; color: #999; padding-top: 30px; border-top: 1px solid #E5C77E15; margin-top: 40px; font-weight: 300; }
    .footer { padding: 40px; text-align: center; color: #999; font-size: 12px; font-weight: 300; letter-spacing: 0.05em; }
    .signature { font-size: 15px; color: #2D2D2D; margin-top: 35px; font-weight: 300; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-text">THE CIRCLE RESERVE</div>
    </div>
    
    <div class="content">
      <div class="greeting">{{first_name}},</div>
      
      <p class="body-text">This is my final correspondence regarding your reserved seat.</p>
      
      <div class="notice-box">
        <div class="notice-title">Your invitation expires at midnight tonight</div>
        <div class="notice-detail">
          After this deadline, your invitation code and founding member rate are no longer valid
        </div>
      </div>
      
      <p class="body-text">Specifically, after tonight:</p>
      
      <div class="detail-list">
        <div class="detail-item">Your code ({{invite_code}}) becomes inactive</div>
        <div class="detail-item">The founding rate of $199/mo no longer applies</div>
        <div class="detail-item">Standard admission increases to $249/mo</div>
        <div class="detail-item">We may reach capacity and close applications</div>
      </div>
      
      <p class="body-text">If you choose to join, now is the time.</p>
      
      <div class="cta-container">
        <a href="{{invite_link}}" class="cta">CLAIM YOUR SEAT</a>
      </div>
      
      <p class="body-text">If not, I respect your decision.</p>
      
      <div class="signature">
        Regards,<br>
        Shehab Asheh<br>
        <span style="font-size: 13px; color: #999;">Founder, The Circle</span>
      </div>
      
      <div class="ps">
        {{spots_remaining}} founding reserve seats remain available.
      </div>
    </div>
    
    <div class="footer">
      THE CIRCLE RESERVE
    </div>
  </div>
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
    1: 2,  // Day 2 after initial (was 3)
    2: 3,  // Day 5 (2+3, was 7)
    3: 4,  // Day 9 (2+3+4, was 14)
    4: null // No more emails
  };
  return delays[currentStage];
}

export { PERSONAS, EMAIL_TEMPLATES };
