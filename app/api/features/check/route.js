import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Server-side feature flag check endpoint
 * 
 * This endpoint provides secure, server-side feature availability checks
 * that cannot be bypassed by manipulating client-side clocks or environment variables.
 * 
 * The launch date is checked against the server's system time, not the client's.
 */

// Launch date: November 10, 2025, 12:00 AM Eastern Time
const LAUNCH_DATE = process.env.NEXT_PUBLIC_LAUNCH_DATE 
  ? new Date(process.env.NEXT_PUBLIC_LAUNCH_DATE) 
  : new Date('2025-11-10T00:00:00-05:00');

// Admin user IDs who can bypass feature locks
const ADMIN_USER_IDS = ['9f305857-cf9b-47bd-aca1-75263d22973d'];

// Features that are always available (even before launch)
const ALWAYS_AVAILABLE = [
  'profile_edit',
  'profile_view',
  'settings',
  'help',
  'support',
  'notifications_view',
  'dashboard',
  'strategic_intros',
  'onboarding'
];

/**
 * GET /api/features/check
 * Check if features are available based on server-side launch date
 * 
 * Query params:
 * - feature: specific feature to check (optional)
 * 
 * Headers:
 * - Authorization: Bearer token for user authentication (optional)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const featureName = searchParams.get('feature');

    // Get current server time (cannot be manipulated by client)
    const now = new Date();
    const hasLaunched = now >= LAUNCH_DATE;
    
    // Check if user is authenticated and is admin
    let isAdmin = false;
    let userId = null;
    
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (!error && user) {
          userId = user.id;
          isAdmin = ADMIN_USER_IDS.includes(user.id);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Continue without auth - public endpoint
      }
    }

    // If checking a specific feature
    if (featureName) {
      const isUnlocked = checkFeatureUnlocked(featureName, hasLaunched, isAdmin);
      
      return NextResponse.json({
        feature: featureName,
        unlocked: isUnlocked,
        hasLaunched,
        isAdmin,
        launchDate: LAUNCH_DATE.toISOString(),
        serverTime: now.toISOString()
      });
    }

    // Return general status
    return NextResponse.json({
      hasLaunched,
      isAdmin,
      launchDate: LAUNCH_DATE.toISOString(),
      serverTime: now.toISOString(),
      daysUntilLaunch: hasLaunched ? 0 : Math.ceil((LAUNCH_DATE - now) / (1000 * 60 * 60 * 24))
    });

  } catch (error) {
    console.error('Feature check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/features/check
 * Batch check multiple features at once
 * 
 * Body:
 * - features: array of feature names to check
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { features } = body;

    if (!features || !Array.isArray(features)) {
      return NextResponse.json(
        { error: 'features array is required' },
        { status: 400 }
      );
    }

    // Get current server time
    const now = new Date();
    const hasLaunched = now >= LAUNCH_DATE;
    
    // Check if user is authenticated and is admin
    let isAdmin = false;
    
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (!error && user) {
          isAdmin = ADMIN_USER_IDS.includes(user.id);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    }

    // Check each feature
    const results = {};
    for (const feature of features) {
      results[feature] = checkFeatureUnlocked(feature, hasLaunched, isAdmin);
    }

    return NextResponse.json({
      features: results,
      hasLaunched,
      isAdmin,
      launchDate: LAUNCH_DATE.toISOString(),
      serverTime: now.toISOString()
    });

  } catch (error) {
    console.error('Batch feature check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Check if a specific feature is unlocked
 */
function checkFeatureUnlocked(featureName, hasLaunched, isAdmin) {
  // Admin bypass
  if (isAdmin) {
    return true;
  }
  
  // Always available features
  if (ALWAYS_AVAILABLE.includes(featureName)) {
    return true;
  }
  
  // All other features require launch
  return hasLaunched;
}
