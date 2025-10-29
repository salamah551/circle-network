// app/api/requests/route.js
// GET /api/requests - Returns latest requests (global feed)
// POST /api/requests - Creates a new request (auth required)
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

export async function GET(request) {
  try {
    const supabase = createClient();
    
    // Get authenticated user (optional for GET - can view requests without auth)
    const { data: { session } } = await supabase.auth.getSession();
    
    // Fetch requests with profile info and reply counts
    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        profile:profiles!requests_user_id_fkey(*),
        replies:request_replies(count)
      `)
      .order('created_at', { ascending: false })
      .limit(200);
    
    if (error) {
      console.error('Error fetching requests:', error);
      return Response.json(
        { error: 'Failed to fetch requests' },
        { status: 500 }
      );
    }
    
    // Return empty array if no data
    return Response.json(data || []);
  } catch (error) {
    console.error('Error in GET /api/requests:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
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
    
    // Parse request body
    const body = await request.json();
    const { title, description, category } = body;
    
    // Validate required fields
    if (!title || !description) {
      return Response.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }
    
    // Create request in database
    const { data, error } = await supabase
      .from('requests')
      .insert({
        user_id: session.user.id,
        title: title.trim(),
        description: description.trim(),
        category: category || 'other',
        status: 'open'
      })
      .select(`
        *,
        profile:profiles!requests_user_id_fkey(*),
        replies:request_replies(count)
      `)
      .single();
    
    if (error) {
      console.error('Error creating request:', error);
      return Response.json(
        { error: 'Failed to create request' },
        { status: 500 }
      );
    }
    
    return Response.json(data);
  } catch (error) {
    console.error('Error in POST /api/requests:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
