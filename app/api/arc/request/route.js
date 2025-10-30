// app/api/arc/request/route.js
// POST /api/arc/request - Submit a new ARC™ request
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

export async function POST(request) {
  try {
    const supabase = createClient();
    
    // Get authenticated user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { request: arcRequest, context } = body;

    if (!arcRequest || typeof arcRequest !== 'string' || !arcRequest.trim()) {
      return Response.json(
        { error: 'Request text is required' },
        { status: 400 }
      );
    }

    // Generate title from first ~120 chars of request
    const title = arcRequest.trim().substring(0, 120);
    
    // Insert into arc_requests table
    const { data, error } = await supabase
      .from('arc_requests')
      .insert({
        user_id: session.user.id,
        title: title,
        content: arcRequest.trim(),
        status: 'processing'
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting ARC request:', error);
      return Response.json(
        { error: 'Failed to create ARC request' },
        { status: 500 }
      );
    }
    
    return Response.json({
      id: data.id,
      status: data.status,
      message: 'ARC request queued successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error submitting ARC request:', error);
    return Response.json(
      { error: 'Failed to submit ARC request' },
      { status: 500 }
    );
  }
}
