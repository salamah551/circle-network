#!/usr/bin/env node

/**
 * Invite Readiness Preflight Script
 * Performs quick checks to ensure the environment is properly configured
 * Usage: npm run invite:preflight
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load .env.local if it exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=');
        // Only set if not already in environment
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
}

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SENDGRID_API_KEY',
  'SENDGRID_FROM_EMAIL',
  'CRON_SECRET',
  'NEXT_PUBLIC_APP_URL'
];

const OPTIONAL_ENV_VARS = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_POSTHOG_KEY',
  'CAMPAIGN_ENABLE_INTRO_PLAINTEXT',
  'INVITES_FROM_EMAIL',
  'INVITES_FROM_NAME'
];

console.log('🔍 Circle Network - Invite Readiness Preflight Check\n');
console.log('═'.repeat(60));

// Check 1: Environment Variables
console.log('\n📋 Checking Required Environment Variables...\n');

let missingRequired = [];
let foundRequired = [];

REQUIRED_ENV_VARS.forEach(varName => {
  if (process.env[varName]) {
    foundRequired.push(varName);
    const value = process.env[varName];
    const displayValue = varName.includes('KEY') || varName.includes('SECRET')
      ? `${value.substring(0, 8)}...`
      : value.length > 50 
        ? `${value.substring(0, 40)}...`
        : value;
    console.log(`  ✅ ${varName}: ${displayValue}`);
  } else {
    missingRequired.push(varName);
    console.log(`  ❌ ${varName}: MISSING`);
  }
});

console.log('\n📋 Checking Optional Environment Variables...\n');

OPTIONAL_ENV_VARS.forEach(varName => {
  if (process.env[varName]) {
    const value = process.env[varName];
    const displayValue = varName.includes('KEY') || varName.includes('SECRET')
      ? `${value.substring(0, 8)}...`
      : value;
    console.log(`  ✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`  ⚪ ${varName}: Not set (optional)`);
  }
});

// Check 2: Stripe Key Type
console.log('\n🔐 Checking Stripe Configuration...\n');

if (process.env.STRIPE_SECRET_KEY) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (stripeKey.startsWith('sk_test_')) {
    console.log('  ✅ Using TEST mode Stripe key (recommended for development)');
  } else if (stripeKey.startsWith('sk_live_')) {
    console.log('  ⚠️  WARNING: Using LIVE mode Stripe key!');
    console.log('     Make sure this is intentional and you are in production.');
  } else {
    console.log('  ⚠️  WARNING: Stripe key format not recognized');
  }
} else {
  console.log('  ⚪ Stripe not configured (optional)');
}

// Check 3: Feature Flags
console.log('\n🚩 Feature Flags Status...\n');

const introPlaintextEnabled = process.env.CAMPAIGN_ENABLE_INTRO_PLAINTEXT === 'true';
console.log(`  ${introPlaintextEnabled ? '✅' : '⚪'} Plain-text Email #0: ${introPlaintextEnabled ? 'ENABLED' : 'DISABLED (default)'}`);

// Check 4: Health Endpoint
console.log('\n🏥 Checking Health Endpoint...\n');

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000';
const healthUrl = `${appUrl}/api/health`;

function pingHealth() {
  return new Promise((resolve) => {
    const protocol = healthUrl.startsWith('https:') ? https : http;
    
    const req = protocol.get(healthUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          resolve({ success: true, health });
        } catch (error) {
          resolve({ success: false, error: 'Invalid JSON response' });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ success: false, error: 'Request timeout' });
    });
  });
}

pingHealth().then(result => {
  if (result.success) {
    console.log(`  ✅ Health endpoint responsive at ${healthUrl}`);
    console.log(`     Status: ${result.health.status}`);
    console.log(`     Environment: ${result.health.environment?.nodeEnv || 'unknown'}`);
  } else {
    console.log(`  ⚠️  Could not reach health endpoint at ${healthUrl}`);
    console.log(`     Error: ${result.error}`);
    console.log(`     Note: This is expected if the server is not running.`);
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('\n📊 Preflight Summary\n');

  if (missingRequired.length === 0) {
    console.log('  ✅ All required environment variables are set');
  } else {
    console.log(`  ❌ Missing ${missingRequired.length} required variable(s):`);
    missingRequired.forEach(v => console.log(`     - ${v}`));
  }

  console.log(`\n  📧 Email #0 (plain-text intro): ${introPlaintextEnabled ? 'ENABLED' : 'DISABLED'}`);
  console.log('     Toggle with: CAMPAIGN_ENABLE_INTRO_PLAINTEXT=true');

  console.log('\n💡 Tips:');
  console.log('  - Review INVITE_READINESS.md for detailed setup instructions');
  console.log('  - Use Stripe TEST keys (sk_test_...) during development');
  console.log('  - Run `npm run dev` to start the development server');
  console.log('  - Test cron endpoints with CRON_SECRET authentication');

  console.log('\n' + '═'.repeat(60) + '\n');

  // Exit with error code if required vars missing
  if (missingRequired.length > 0) {
    process.exit(1);
  }
});
