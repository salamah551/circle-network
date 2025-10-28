/**
 * POST /api/needs-assessment/save
 * 
 * Saves the needs assessment quiz responses for new members
 * This personalizes their dashboard experience
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
      industry,
      goals,
      travelFrequency,
      motivation
    } = body;

    // Validate required fields
    if (!industry) {
      return NextResponse.json(
        { error: 'Industry is required' },
        { status: 400 }
      );
    }

    if (!goals || goals.length === 0) {
      return NextResponse.json(
        { error: 'At least one goal is required' },
        { status: 400 }
      );
    }

    if (typeof travelFrequency !== 'number') {
      return NextResponse.json(
        { error: 'Travel frequency is required' },
        { status: 400 }
      );
    }

    // Create admin client for updating profiles
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Prepare needs assessment data
    const needsAssessment = {
      industry,
      goals,
      travelFrequency,
      motivation: motivation || null,
      completedAt: new Date().toISOString()
    };

    // Update user profile with needs assessment data
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        needs_assessment: needsAssessment,
        needs_assessment_completed_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json(
        { 
          error: 'Failed to save assessment data',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }

    console.log(`Needs assessment completed for user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Needs assessment saved successfully'
    });

  } catch (error: any) {
    console.error('Needs assessment save error:', error);
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
