// lib/sendgrid-templates.js
// Circle Network - Automated Email Sequences
// Updated: October 16, 2025
// New Pricing: $2,497/year (Founding) | All Industries

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://thecirclenetwork.org';

const PERSONAS = {
  founder: {
    name: 'Business Owner',
    target: 'Founders and CEOs'
  },
  executive: {
    name: 'Executive',
    target: 'Senior Leaders'
  },
  investor: {
    name: 'Investor',
    target: 'VCs and Angels'
  },
  professional: {
    name: 'Professional',
    target: 'Accomplished Professionals'
  },
  wildcard: {
    name: 'Professional',
    target: 'High Achievers'
  }
};

// ========================================
// EMAIL 1: INITIAL INVITATION (Day 0)
// ========================================
const EMAIL_1_TEMPLATE = {
  subject: "{{first_name}}, you've been selected for Circle Network",
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif; 
      line-height: 1.7; 
      color: #FFFFFF; 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 0; 
      background: #000000; 
    }
    .container { background: #0A0A0A; margin: 40px 20px; border: 1px solid #D4AF3720; border-radius: 12px; overflow: hidden; }
    .header { padding: 50px 40px 30px; border-bottom: 1px solid #D4AF3730; background: linear-gradient(135deg, #0A0A0A 0%, #18181b 100%); }
    .logo-container { text-align: center; margin-bottom: 20px; }
    .logo-icon { display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #D4AF37, #C9A131); border-radius: 10px; line-height: 48px; text-align: center; font-size: 24px; }
    .logo-text { font-size: 11px; letter-spacing: 0.3em; color: #D4AF37; font-weight: 600; margin-top: 12px; }
    .content { padding: 40px 40px 50px; }
    .greeting { font-size: 16px; color: rgba(255, 255, 255, 0.7); font-weight: 300; margin-bottom: 30px; }
    .body-text { font-size: 16px; line-height: 1.7; color: rgba(255, 255, 255, 0.9); margin-bottom: 20px; font-weight: 300; }
    .highlight-box { background: rgba(212, 175, 55, 0.05); border-left: 3px solid #D4AF37; padding: 20px 25px; margin: 25px 0; border-radius: 4px; }
    .highlight-text { font-size: 15px; color: rgba(255, 255, 255, 0.85); line-height: 1.7; font-weight: 300; }
    .value-grid { display: grid; grid-template-columns: 1fr; gap: 12px; margin: 25px 0; }
    .value-item { padding: 12px 0; color: rgba(255, 255, 255, 0.8); font-size: 15px; position: relative; padding-left: 24px; }
    .value-item:before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; }
    .invite-code-box { background: rgba(212, 175, 55, 0.1); border: 2px solid rgba(212, 175, 55, 0.3); border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
    .invite-code-label { font-size: 12px; color: rgba(212, 175, 55, 0.7); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; font-weight: 600; }
    .invite-code { font-family: 'Courier New', monospace; font-size: 24px; letter-spacing: 3px; color: #D4AF37; font-weight: 700; }
    .cta-container { text-align: center; margin: 35px 0; }
    .cta { display: inline-block; background: linear-gradient(135deg, #D4AF37, #C9A131); color: #000000; padding: 16px 48px; text-decoration: none; font-size: 15px; font-weight: 700; letter-spacing: 0.5px; border-radius: 8px; box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3); }
    .urgency-box { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 16px 20px; margin: 25px 0; }
    .urgency-text { font-size: 14px; color: rgba(255, 255, 255, 0.9); margin: 0; }
    .guarantee { text-align: center; padding: 20px; background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 8px; margin: 25px 0; }
    .guarantee-text { font-size: 13px; color: rgba(16, 185, 129, 0.9); margin: 0; }
    .signature { font-size: 15px; color: rgba(255, 255, 255, 0.9); margin-top: 35px; font-weight: 300; line-height: 1.6; }
    .ps { font-size: 14px; color: rgba(255, 255, 255, 0.5); font-style: italic; padding-top: 25px; border-top: 1px solid rgba(212, 175, 55, 0.15); margin-top: 30px; }
    .footer { padding: 30px; text-align: center; color: rgba(255, 255, 255, 0.3); font-size: 11px; font-weight: 300; letter-spacing: 0.5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-container">
        <div class="logo-icon">👑</div>
        <div class="logo-text">CIRCLE NETWORK</div>
      </div>
    </div>
    
    <div class="content">
      <div class="greeting">{{first_name}},</div>
      
      <p class="body-text">You've been personally selected to join <strong style="color: #D4AF37;">Circle Network</strong>—an invitation-only community of 250 accomplished professionals across all industries.</p>
      
      <p class="body-text">This isn't a typical networking group. Circle Network is where high-achievers transform connections into tangible results: strategic partnerships, key hires, funding opportunities, and accelerated business growth.</p>
      
      <div class="highlight-box">
        <p class="highlight-text" style="margin: 0 0 15px 0;"><strong style="color: #D4AF37;">What you get immediate access to:</strong></p>
        <div class="value-grid">
          <div class="value-item">AI-powered strategic introductions (3 curated matches weekly)</div>
          <div class="value-item">Direct messaging with 250 pre-vetted professionals</div>
          <div class="value-item">Request board for expert problem-solving</div>
          <div class="value-item">Exclusive events and industry roundtables</div>
          <div class="value-item">Real-time collaboration tools and resources</div>
        </div>
      </div>
      
      <p class="body-text">Your founding member rate: <strong style="color: #D4AF37;">$2,497/year</strong>—locked in for life, even if you pause and return. After the first 250 members, rates increase significantly.</p>
      
      <div class="urgency-box">
        <p class="urgency-text">
          <strong style="color: #D4AF37;">Only {{spots_remaining}} founding spots remain.</strong> Platform launches November 10, 2025. Join now to be ready on day one.
        </p>
      </div>
      
      <div class="invite-code-box">
        <div class="invite-code-label">Your Invitation Code</div>
        <div class="invite-code">{{invite_code}}</div>
      </div>
      
      <p class="body-text" style="text-align: center; font-size: 14px; color: rgba(255, 255, 255, 0.6);">
        This code expires in 7 days: {{expiry_date}}
      </p>
      
      <div class="cta-container">
        <a href="{{invite_link}}" class="cta">ACCEPT YOUR INVITATION →</a>
      </div>
      
      <div class="guarantee">
        <p class="guarantee-text">
          <strong>30-Day Money-Back Guarantee</strong><br/>
          If Circle Network doesn't deliver meaningful value, we'll refund 100%. Zero risk.
        </p>
      </div>
      
      <div class="signature">
        Looking forward to welcoming you,<br/><br/>
        The Circle Network Team<br/>
        <span style="font-size: 13px; color: rgba(255, 255, 255, 0.5);">Personally reviewed by the founder</span>
      </div>
      
      <div class="ps">
        <strong>P.S.</strong> Founding members get early access to our premium AI services (Competitive Intelligence, Reputation Guardian, Deal Flow) at exclusive rates. More on this in a few days.
      </div>
    </div>
    
    <div class="footer">
      CIRCLE NETWORK © 2025
    </div>
  </div>
</body>
</html>
  `
};

// ========================================
// EMAIL 2: SOCIAL PROOF (Day 2)
// ========================================
const EMAIL_2_TEMPLATE = {
  subject: "{{new_members_count}} professionals joined this week",
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif; line-height: 1.7; color: #FFFFFF; max-width: 600px; margin: 0 auto; padding: 0; background: #000000; }
    .container { background: #0A0A0A; margin: 40px 20px; border: 1px solid #D4AF3720; border-radius: 12px; overflow: hidden; }
    .header { padding: 40px 40px 30px; border-bottom: 1px solid #D4AF3730; background: linear-gradient(135deg, #0A0A0A 0%, #18181b 100%); text-align: center; }
    .logo-text { font-size: 11px; letter-spacing: 0.3em; color: #D4AF37; font-weight: 600; }
    .content { padding: 40px 40px 50px; }
    .greeting { font-size: 16px; color: rgba(255, 255, 255, 0.7); font-weight: 300; margin-bottom: 30px; }
    .body-text { font-size: 16px; line-height: 1.7; color: rgba(255, 255, 255, 0.9); margin-bottom: 20px; font-weight: 300; }
    .stat-box { background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.02) 100%); padding: 35px; text-align: center; margin: 30px 0; border-radius: 8px; border: 1px solid rgba(212, 175, 55, 0.2); }
    .stat-number { font-size: 56px; font-weight: 200; color: #D4AF37; letter-spacing: -1px; margin: 10px 0; }
    .stat-label { font-size: 13px; color: rgba(255, 255, 255, 0.6); text-transform: uppercase; letter-spacing: 1px; font-weight: 400; }
    .member-list { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); padding: 25px 30px; margin: 25px 0; border-radius: 8px; }
    .member-list-title { font-size: 12px; color: rgba(255, 255, 255, 0.5); margin-bottom: 15px; letter-spacing: 1px; text-transform: uppercase; font-weight: 600; }
    .member-item { padding: 10px 0; color: rgba(255, 255, 255, 0.7); font-size: 15px; font-weight: 300; border-bottom: 1px solid rgba(212, 175, 55, 0.1); }
    .member-item:last-child { border-bottom: none; }
    .cta-container { text-align: center; margin: 35px 0; }
    .cta { display: inline-block; background: linear-gradient(135deg, #D4AF37, #C9A131); color: #000000; padding: 16px 48px; text-decoration: none; font-size: 15px; font-weight: 700; letter-spacing: 0.5px; border-radius: 8px; }
    .spots-remaining { text-align: center; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 16px; margin: 25px 0; }
    .signature { font-size: 15px; color: rgba(255, 255, 255, 0.9); margin-top: 35px; font-weight: 300; }
    .ps { font-size: 14px; color: rgba(255, 255, 255, 0.5); font-style: italic; padding-top: 25px; border-top: 1px solid rgba(212, 175, 55, 0.15); margin-top: 30px; }
    .footer { padding: 30px; text-align: center; color: rgba(255, 255, 255, 0.3); font-size: 11px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-text">CIRCLE NETWORK</div>
    </div>
    
    <div class="content">
      <div class="greeting">{{first_name}},</div>
      
      <p class="body-text">A quick update on your reserved spot:</p>
      
      <div class="stat-box">
        <div class="stat-label">New members since your invitation</div>
        <div class="stat-number">{{new_members_count}}</div>
        <div class="stat-label">Founding spots claimed</div>
      </div>
      
      <div class="member-list">
        <div class="member-list-title">RECENT MEMBERS</div>
        <div class="member-item">CEO, Healthcare Technology</div>
        <div class="member-item">Managing Partner, Private Equity</div>
        <div class="member-item">VP of Sales, SaaS Company</div>
        <div class="member-item">Founder, E-commerce Brand</div>
        <div class="member-item">Senior Director, Fortune 500</div>
        <div class="member-item">Angel Investor, Tech Sector</div>
      </div>
      
      <div class="spots-remaining">
        <p style="margin: 0; font-size: 15px; color: rgba(255, 255, 255, 0.9);">
          <strong style="color: #D4AF37;">{{spots_remaining}} founding spots</strong> remain at the $2,497/year rate.
        </p>
      </div>
      
      <p class="body-text">Your invitation code: <span style="font-family: 'Courier New', monospace; color: #D4AF37; letter-spacing: 2px; font-weight: 600;">{{invite_code}}</span></p>
      
      <div class="cta-container">
        <a href="{{invite_link}}" class="cta">CLAIM YOUR SPOT →</a>
      </div>
      
      <div class="signature">
        — The Circle Network Team
      </div>
      
      <div class="ps">
        <strong>Note:</strong> We cap membership at 250 founding members to preserve network quality. Once full, we'll have a 6-month waitlist.
      </div>
    </div>
    
    <div class="footer">
      CIRCLE NETWORK © 2025
    </div>
  </div>
</body>
</html>
  `
};

// ========================================
// EMAIL 3: AI SERVICES TEASER (Day 5) - 💰 CONVERSION DRIVER
// ========================================
const EMAIL_3_TEMPLATE = {
  subject: "{{first_name}}, exclusive early access to our AI services",
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif; line-height: 1.7; color: #FFFFFF; max-width: 600px; margin: 0 auto; padding: 0; background: #000000; }
    .container { background: #0A0A0A; margin: 40px 20px; border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; overflow: hidden; }
    .header { padding: 40px; border-bottom: 1px solid rgba(139, 92, 246, 0.2); background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.05)); text-align: center; }
    .header-icon { display: inline-block; width: 56px; height: 56px; background: linear-gradient(135deg, #8b5cf6, #3b82f6); border-radius: 12px; line-height: 56px; font-size: 28px; margin-bottom: 16px; box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4); }
    .header-badge { display: inline-block; background: rgba(139, 92, 246, 0.2); border: 1px solid rgba(139, 92, 246, 0.4); border-radius: 20px; padding: 6px 16px; margin-bottom: 12px; }
    .header-badge-text { font-size: 11px; color: #a78bfa; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; }
    .header-title { font-size: 28px; font-weight: 700; color: #FFFFFF; margin: 8px 0; }
    .header-subtitle { font-size: 14px; color: rgba(255, 255, 255, 0.6); }
    .content { padding: 40px; }
    .greeting { font-size: 16px; color: rgba(255, 255, 255, 0.7); margin-bottom: 25px; }
    .body-text { font-size: 16px; line-height: 1.7; color: rgba(255, 255, 255, 0.9); margin-bottom: 20px; }
    .service-box { background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(59, 130, 246, 0.03)); border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 10px; padding: 24px; margin-bottom: 20px; }
    .service-header { display: flex; align-items: center; margin-bottom: 16px; }
    .service-icon { width: 44px; height: 44px; background: rgba(139, 92, 246, 0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 16px; font-size: 22px; flex-shrink: 0; }
    .service-title { font-size: 18px; font-weight: 700; color: #FFFFFF; margin: 0 0 4px 0; }
    .service-price { font-size: 13px; color: #a78bfa; font-weight: 600; margin: 0; }
    .service-description { font-size: 15px; line-height: 1.6; color: rgba(255, 255, 255, 0.8); margin-bottom: 14px; }
    .service-benefits { background: rgba(0, 0, 0, 0.3); border-radius: 6px; padding: 14px; }
    .service-benefit { font-size: 13px; color: rgba(255, 255, 255, 0.75); margin: 6px 0; padding-left: 20px; position: relative; }
    .service-benefit:before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; }
    .value-prop { background: linear-gradient(135deg, rgba(212, 175, 55, 0.12), rgba(212, 175, 55, 0.04)); border: 2px solid rgba(212, 175, 55, 0.35); border-radius: 10px; padding: 24px; text-align: center; margin: 30px 0; }
    .value-prop-title { font-size: 20px; font-weight: 700; color: #D4AF37; margin: 0 0 12px 0; }
    .value-prop-text { font-size: 15px; color: rgba(255, 255, 255, 0.85); margin: 0 0 8px 0; }
    .value-prop-detail { font-size: 13px; color: rgba(255, 255, 255, 0.6); margin: 0; }
    .cta-container { text-align: center; margin: 30px 0; }
    .cta { display: inline-block; background: linear-gradient(135deg, #D4AF37, #C9A131); color: #000000; padding: 16px 48px; text-decoration: none; font-size: 15px; font-weight: 700; border-radius: 8px; }
    .signature { font-size: 15px; color: rgba(255, 255, 255, 0.9); margin-top: 30px; }
    .footer { padding: 30px; text-align: center; color: rgba(255, 255, 255, 0.3); font-size: 11px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-icon">🤖</div>
      <div class="header-badge">
        <span class="header-badge-text">Founding Member Exclusive</span>
      </div>
      <h1 class="header-title">Circle AI Services</h1>
      <p class="header-subtitle">Enterprise-grade AI tools for high-achievers</p>
    </div>
    
    <div class="content">
      <div class="greeting">{{first_name}},</div>
      
      <p class="body-text">Before you decide on Circle Network membership, I want to share something we've been quietly building: <strong style="color: #a78bfa;">Circle AI Services</strong>.</p>
      
      <p class="body-text">These are enterprise-grade AI tools designed specifically for accomplished professionals like you. And as a founding member, you'll get priority access at exclusive rates.</p>
      
      <!-- Service 1 -->
      <div class="service-box">
        <div class="service-header">
          <div class="service-icon">🎯</div>
          <div>
            <h3 class="service-title">AI Competitive Intelligence</h3>
            <p class="service-price">Member Rate: $8,000/month (normally $10,000)</p>
          </div>
        </div>
        <p class="service-description">
          Know what your competitors are doing <em>before</em> they do it. Our AI monitors 10,000+ sources 24/7, tracking pricing changes, product launches, hiring, and strategic moves.
        </p>
        <div class="service-benefits">
          <div class="service-benefit">Daily competitive intelligence briefs</div>
          <div class="service-benefit">Weekly strategic analysis reports</div>
          <div class="service-benefit">Real-time alerts for major competitive moves</div>
        </div>
      </div>
      
      <!-- Service 2 -->
      <div class="service-box">
        <div class="service-header">
          <div class="service-icon">🛡️</div>
          <div>
            <h3 class="service-title">AI Reputation Guardian</h3>
            <p class="service-price">Member Rate: $6,000/month (normally $7,000)</p>
          </div>
        </div>
        <p class="service-description">
          Protect your reputation before damage happens. 24/7 monitoring across the entire internet, including dark web, to catch threats early.
        </p>
        <div class="service-benefits">
          <div class="service-benefit">Real-time reputation threat alerts</div>
          <div class="service-benefit">Dark web monitoring for leaked data</div>
          <div class="service-benefit">Automated takedown assistance</div>
        </div>
      </div>
      
      <!-- Service 3 -->
      <div class="service-box">
        <div class="service-header">
          <div class="service-icon">💎</div>
          <div>
            <h3 class="service-title">Deal Flow Alert Service</h3>
            <p class="service-price">Member Rate: $2,000/month (normally $3,000)</p>
          </div>
        </div>
        <p class="service-description">
          See investment opportunities before they're public. Weekly curated deals with AI-powered analysis and scoring.
        </p>
        <div class="service-benefits">
          <div class="service-benefit">Weekly curated investment opportunities</div>
          <div class="service-benefit">AI-powered deal analysis & risk scoring</div>
          <div class="service-benefit">Pre-public and exclusive opportunities</div>
        </div>
      </div>
      
      <!-- Value Proposition -->
      <div class="value-prop">
        <h3 class="value-prop-title">Why This Matters for Your Decision</h3>
        <p class="value-prop-text">
          Circle Network membership ($2,497/year) unlocks 20-33% discounts on these AI services.
        </p>
        <p class="value-prop-detail">
          If you use just ONE AI service, your Circle membership pays for itself in savings within 45 days.
        </p>
      </div>
      
      <p class="body-text">These AI services aren't available to the general public yet. Only Circle Network members get early access.</p>
      
      <p class="body-text">Your invitation is still valid. Code: <span style="font-family: 'Courier New', monospace; color: #D4AF37; font-weight: 600;">{{invite_code}}</span></p>
      
      <div class="cta-container">
        <a href="{{invite_link}}" class="cta">JOIN CIRCLE NETWORK →</a>
      </div>
      
      <div class="signature">
        — The Circle Network Team
      </div>
    </div>
    
    <div class="footer">
      CIRCLE NETWORK © 2025
    </div>
  </div>
</body>
</html>
  `
};

// ========================================
// EMAIL 4: FINAL URGENCY (Day 9)
// ========================================
const EMAIL_4_TEMPLATE = {
  subject: "Final notice: Your invitation expires today",
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif; line-height: 1.7; color: #FFFFFF; max-width: 600px; margin: 0 auto; padding: 0; background: #000000; }
    .container { background: #0A0A0A; margin: 40px 20px; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; overflow: hidden; }
    .header { padding: 40px; border-bottom: 1px solid rgba(239, 68, 68, 0.2); background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.02)); text-align: center; }
    .logo-text { font-size: 11px; letter-spacing: 0.3em; color: #D4AF37; font-weight: 600; margin-bottom: 20px; }
    .content { padding: 40px; }
    .greeting { font-size: 16px; color: rgba(255, 255, 255, 0.7); margin-bottom: 25px; }
    .body-text { font-size: 16px; line-height: 1.7; color: rgba(255, 255, 255, 0.9); margin-bottom: 20px; }
    .urgency-box { background: rgba(239, 68, 68, 0.1); border: 2px solid rgba(239, 68, 68, 0.4); border-radius: 10px; padding: 24px; text-align: center; margin: 30px 0; }
    .urgency-title { font-size: 22px; color: #ef4444; margin: 0 0 12px 0; font-weight: 700; }
    .urgency-detail { font-size: 15px; color: rgba(255, 255, 255, 0.8); margin: 0; }
    .expiry-list { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); padding: 20px 25px; margin: 25px 0; border-radius: 8px; }
    .expiry-item { padding: 10px 0; color: rgba(255, 255, 255, 0.8); font-size: 15px; border-bottom: 1px solid rgba(212, 175, 55, 0.1); }
    .expiry-item:last-child { border-bottom: none; }
    .cta-container { text-align: center; margin: 35px 0; }
    .cta { display: inline-block; background: linear-gradient(135deg, #ef4444, #dc2626); color: #FFFFFF; padding: 18px 52px; text-decoration: none; font-size: 16px; font-weight: 700; border-radius: 8px; box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4); }
    .signature { font-size: 15px; color: rgba(255, 255, 255, 0.9); margin-top: 30px; }
    .ps { font-size: 14px; color: rgba(255, 255, 255, 0.5); padding-top: 25px; border-top: 1px solid rgba(212, 175, 55, 0.15); margin-top: 30px; }
    .footer { padding: 30px; text-align: center; color: rgba(255, 255, 255, 0.3); font-size: 11px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-text">CIRCLE NETWORK</div>
    </div>
    
    <div class="content">
      <div class="greeting">{{first_name}},</div>
      
      <p class="body-text">This is my final message about your Circle Network invitation.</p>
      
      <div class="urgency-box">
        <div class="urgency-title">Your invitation expires at midnight tonight</div>
        <div class="urgency-detail">
          After this deadline, your invitation code and founding member rate are no longer valid
        </div>
      </div>
      
      <p class="body-text">Specifically, after tonight:</p>
      
      <div class="expiry-list">
        <div class="expiry-item">✗ Your code ({{invite_code}}) becomes inactive</div>
        <div class="expiry-item">✗ The founding rate of $2,497/year no longer applies</div>
        <div class="expiry-item">✗ Standard rates increase to $4,997/year (100% higher)</div>
        <div class="expiry-item">✗ Priority access to AI services is lost</div>
        <div class="expiry-item">✗ We may reach capacity and close new applications</div>
      </div>
      
      <p class="body-text">If you want to join the 250 founding members, now is the time.</p>
      
      <div class="cta-container">
        <a href="{{invite_link}}" class="cta">CLAIM YOUR SPOT NOW →</a>
      </div>
      
      <p class="body-text" style="text-align: center; font-size: 15px; color: rgba(255, 255, 255, 0.7);">
        If not, I respect your decision and wish you continued success.
      </p>
      
      <div class="signature">
        Best regards,<br/><br/>
        The Circle Network Team
      </div>
      
      <div class="ps">
        {{spots_remaining}} founding spots remain as of this email.
      </div>
    </div>
    
    <div class="footer">
      CIRCLE NETWORK © 2025
    </div>
  </div>
</body>
</html>
  `
};

// ========================================
// WELCOME EMAIL (Triggered on Signup)
// ========================================
const WELCOME_EMAIL_TEMPLATE = {
  subject: "Welcome to Circle Network, {{first_name}}! 🎉",
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif; line-height: 1.7; color: #FFFFFF; max-width: 600px; margin: 0 auto; padding: 0; background: #000000; }
    .container { background: #0A0A0A; margin: 40px 20px; border: 1px solid #D4AF3720; border-radius: 12px; overflow: hidden; }
    .header { padding: 50px 40px 30px; text-align: center; border-bottom: 1px solid #D4AF3730; background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02)); }
    .header-icon { width: 64px; height: 64px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3); }
    .header-title { font-size: 32px; font-weight: 700; color: #FFFFFF; margin: 8px 0; }
    .header-subtitle { font-size: 16px; color: #10b981; }
    .content { padding: 40px; }
    .body-text { font-size: 16px; line-height: 1.7; color: rgba(255, 255, 255, 0.9); margin-bottom: 20px; }
    .quick-start { background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 10px; padding: 24px; margin: 25px 0; }
    .quick-start-title { font-size: 18px; font-weight: 700; color: #10b981; margin: 0 0 16px 0; }
    .step { padding: 14px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
    .step:last-child { border-bottom: none; }
    .step-number { display: inline-block; width: 24px; height: 24px; background: rgba(16, 185, 129, 0.2); border-radius: 50%; text-align: center; line-height: 24px; font-size: 13px; font-weight: 700; color: #10b981; margin-right: 12px; }
    .step-title { font-weight: 600; color: #FFFFFF; margin-bottom: 4px; }
    .step-detail { font-size: 14px; color: rgba(255, 255, 255, 0.7); }
    .cta-container { text-align: center; margin: 30px 0; }
    .cta { display: inline-block; background: linear-gradient(135deg, #D4AF37, #C9A131); color: #000000; padding: 16px 48px; text-decoration: none; font-size: 15px; font-weight: 700; border-radius: 8px; }
    .footer { padding: 30px; text-align: center; color: rgba(255, 255, 255, 0.3); font-size: 11px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-icon">🎉</div>
      <h1 class="header-title">Welcome to Circle Network!</h1>
      <p class="header-subtitle">You're now a {{membership_tier}} Member</p>
    </div>
    
    <div class="content">
      <p class="body-text">Hi {{first_name}},</p>
      
      <p class="body-text">Welcome to Circle Network—we're thrilled to have you. You're now part of an exclusive community of 250 founding members across all industries.</p>
      
      <div class="quick-start">
        <div class="quick-start-title">🚀 Quick Start Guide</div>
        <div class="step">
          <span class="step-number">1</span>
          <div style="display: inline-block; vertical-align: top; width: calc(100% - 40px);">
            <div class="step-title">Complete Your Profile</div>
            <div class="step-detail">Add your bio, expertise, and goals. Great profiles get 3x more connections.</div>
          </div>
        </div>
        <div class="step">
          <span class="step-number">2</span>
          <div style="display: inline-block; vertical-align: top; width: calc(100% - 40px);">
            <div class="step-title">Check Your Strategic Intros</div>
            <div class="step-detail">Our AI has already matched you with high-value connections. Review them!</div>
          </div>
        </div>
        <div class="step">
          <span class="step-number">3</span>
          <div style="display: inline-block; vertical-align: top; width: calc(100% - 40px);">
            <div class="step-title">Browse the Directory</div>
            <div class="step-detail">Explore members by industry and expertise. Message anyone directly.</div>
          </div>
        </div>
        <div class="step">
          <span class="step-number">4</span>
          <div style="display: inline-block; vertical-align: top; width: calc(100% - 40px);">
            <div class="step-title">Post Your First Request</div>
            <div class="step-detail">Need help or advice? The community responds fast.</div>
          </div>
        </div>
      </div>
      
      <div class="cta-container">
        <a href="{{dashboard_url}}" class="cta">GO TO DASHBOARD →</a>
      </div>
      
      <p class="body-text" style="text-align: center; font-size: 14px; color: rgba(255, 255, 255, 0.6); margin-top: 30px;">
        Platform launches November 10, 2025. You have early access to Strategic Intros and profile setup. All features unlock on launch day.
      </p>
    </div>
    
    <div class="footer">
      CIRCLE NETWORK © 2025
    </div>
  </div>
</body>
</html>
  `
};

// ========================================
// APPLY TEMPLATES TO ALL PERSONAS
// ========================================
const EMAIL_TEMPLATES = {};

Object.keys(PERSONAS).forEach(persona => {
  EMAIL_TEMPLATES[`${persona}_1`] = EMAIL_1_TEMPLATE;
  EMAIL_TEMPLATES[`${persona}_2`] = EMAIL_2_TEMPLATE;
  EMAIL_TEMPLATES[`${persona}_3`] = EMAIL_3_TEMPLATE;
  EMAIL_TEMPLATES[`${persona}_4`] = EMAIL_4_TEMPLATE;
  EMAIL_TEMPLATES[`${persona}_welcome`] = WELCOME_EMAIL_TEMPLATE;
});

// ========================================
// HELPER FUNCTIONS
// ========================================
export function generateEmail(persona, sequenceNumber, variables) {
  const templateKey = sequenceNumber === 'welcome' 
    ? `${persona}_welcome` 
    : `${persona}_${sequenceNumber}`;
  
  const template = EMAIL_TEMPLATES[templateKey];
  
  if (!template) {
    throw new Error(`Template ${templateKey} not found`);
  }

  let html = template.html;
  let subject = template.subject;
  
  // Replace all variables
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, value || '');
    subject = subject.replace(regex, value || '');
  });

  return { subject, html };
}

export function getNextEmailDelay(currentStage) {
  const delays = {
    1: 2,  // Email 2 sends 2 days after Email 1
    2: 3,  // Email 3 sends 3 days after Email 2 (Day 5 total)
    3: 4,  // Email 4 sends 4 days after Email 3 (Day 9 total)
    4: null // No more automated emails
  };
  return delays[currentStage];
}

export { PERSONAS, EMAIL_TEMPLATES };
