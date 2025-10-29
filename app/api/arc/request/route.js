import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * POST /api/arc/request
 * Create a new ARC brief for the current user and enqueue processing.
 * Constraints: Validate input; never expose AI keys to client; log server errors only.
 */
export async function POST(req) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const cookieStore = cookies();
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set(name, value, options);
        },
        remove(name, options) {
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        },
      },
    });

    const { data: { user } = {} } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate input
    const body = await req.json();
    const { request, context } = body;

    if (!request || typeof request !== 'string' || request.trim().length === 0) {
      return NextResponse.json({ error: 'Request text is required' }, { status: 400 });
    }

    if (request.length > 5000) {
      return NextResponse.json({ error: 'Request text too long (max 5000 characters)' }, { status: 400 });
    }

    // TODO(server): Insert into arc_requests table and enqueue for AI processing
    // For now, return mock response indicating processing has started
    const mockBriefId = Date.now();

    // In production, this would:
    // 1. Insert into database
    // 2. Enqueue processing job (e.g., via background worker)
    // 3. Never expose AI API keys to client
    
    console.log(`ARC request created for user ${user.id}: ${request.substring(0, 50)}...`);

    return NextResponse.json({
      id: mockBriefId,
      status: 'processing'
    });
  } catch (error) {
    console.error('Error in /api/arc/request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
