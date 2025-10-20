/**
 * POST /api/onboarding/calibrate
 * 
 * AI Onboarding Concierge Backend
 * Persists user onboarding preferences to customize their AI experience
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No auth token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      strategicGoal,
      dealPreferences,
      reputationKeywords,
      industries,
      geos,
      competitorWatch
    } = body;

    // Validate required fields
    if (!strategicGoal) {
      return NextResponse.json(
        { error: 'Strategic goal is required' },
        { status: 400 }
      );
    }

    // Create admin client for updating profiles
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Prepare onboarding profile data
    const onboardingProfile = {
      strategicGoal,
      dealPreferences: dealPreferences || null,
      reputationKeywords: reputationKeywords || null,
      industries: industries || null,
      geos: geos || null,
      competitorWatch: competitorWatch || null,
      completedAt: new Date().toISOString()
    };

    // Update user profile with onboarding data
    // Try to update onboarding_profile JSONB column first
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        onboarding_profile: onboardingProfile,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      
      // If onboarding_profile column doesn't exist, store in individual columns
      // This is a fallback for legacy schema
      const fallbackUpdate: any = {
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      };

      // Add individual fields if they exist in schema
      if (strategicGoal) fallbackUpdate.strategic_goal = strategicGoal;
      if (industries) fallbackUpdate.industries = industries;
      if (geos) fallbackUpdate.geos = geos;

      const { error: fallbackError } = await supabaseAdmin
        .from('profiles')
        .update(fallbackUpdate)
        .eq('id', user.id);

      if (fallbackError) {
        console.error('Fallback update error:', fallbackError);
        return NextResponse.json(
          { 
            error: 'Failed to save onboarding data',
            details: process.env.NODE_ENV === 'development' ? fallbackError.message : undefined
          },
          { status: 500 }
        );
      }
    }

    console.log(`Onboarding completed for user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Onboarding profile saved successfully'
    });

  } catch (error: any) {
    console.error('Onboarding calibrate error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
