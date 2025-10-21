import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * AI Operator Backend - Single Entry Point
 * POST /api/ai/operator
 * 
 * Accepts: { task: string, payload?: object }
 * Returns: { ok: boolean, task: string, data?: object, error?: string }
 */

// Simple in-memory rate limiter (token bucket per IP)
const rateLimits = new Map<string, { tokens: number; lastRefill: number }>();
const RATE_LIMIT_TOKENS = 10; // max requests
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds
const RATE_LIMIT_REFILL_RATE = 1; // tokens per second

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  let bucket = rateLimits.get(ip);
  
  if (!bucket) {
    bucket = { tokens: RATE_LIMIT_TOKENS, lastRefill: now };
    rateLimits.set(ip, bucket);
  }
  
  // Refill tokens based on time elapsed
  const timePassed = now - bucket.lastRefill;
  const tokensToAdd = Math.floor(timePassed / 1000) * RATE_LIMIT_REFILL_RATE;
  bucket.tokens = Math.min(RATE_LIMIT_TOKENS, bucket.tokens + tokensToAdd);
  bucket.lastRefill = now;
  
  // Check if we have tokens available
  if (bucket.tokens < 1) {
    return false;
  }
  
  bucket.tokens -= 1;
  return true;
}

// Task handlers - scaffolded implementations
async function handleAnalyzeAnalytics(payload?: any) {
  return {
    message: "Analytics analyzer ready",
    timestamp: new Date().toISOString(),
  };
}

async function handleGenerateDailyCampaigns(payload?: any) {
  return {
    message: "Campaign generator ready",
    timestamp: new Date().toISOString(),
  };
}

async function handleDiagnoseError(payload?: any) {
  return {
    message: "Diagnostics ready",
    error_description: payload?.error_description || null,
    timestamp: new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Rate limiting check
    if (!checkRateLimit(ip)) {
      console.log(`[AI Operator] Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { 
          ok: false, 
          task: null, 
          error: 'Rate limit exceeded. Please try again later.' 
        },
        { status: 429 }
      );
    }
    
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { ok: false, task: null, error: 'Unauthorized - No auth token provided' },
        { status: 401 }
      );
    }

    // Create Supabase admin client for verification
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify user and admin status
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, task: null, error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin, email')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { ok: false, task: null, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { task, payload } = body;

    // Validate input
    if (!task || typeof task !== 'string') {
      return NextResponse.json(
        { ok: false, task: null, error: 'Invalid request - task is required and must be a string' },
        { status: 400 }
      );
    }

    // Log task execution (no secrets)
    console.log(`[AI Operator] Task "${task}" requested by ${profile.email}`);

    // Task router
    let data;
    switch (task) {
      case 'analyze_analytics':
        data = await handleAnalyzeAnalytics(payload);
        break;
      
      case 'generate_daily_campaigns':
        data = await handleGenerateDailyCampaigns(payload);
        break;
      
      case 'diagnose_error':
        data = await handleDiagnoseError(payload);
        break;
      
      default:
        return NextResponse.json(
          { 
            ok: false, 
            task, 
            error: `Unknown task: ${task}. Supported tasks: analyze_analytics, generate_daily_campaigns, diagnose_error` 
          },
          { status: 400 }
        );
    }

    const duration = Date.now() - startTime;
    console.log(`[AI Operator] Task "${task}" completed in ${duration}ms`);

    return NextResponse.json({
      ok: true,
      task,
      data,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[AI Operator] Error:', error instanceof Error ? error.message : 'Unknown error');
    console.error(`[AI Operator] Request failed after ${duration}ms`);
    
    return NextResponse.json(
      {
        ok: false,
        task: null,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// Only POST is allowed
export async function GET() {
  return NextResponse.json(
    { ok: false, error: 'Method not allowed - use POST' },
    { status: 405 }
  );
}
