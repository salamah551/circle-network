// app/api/messages/mark-read/route.js
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    // Get cookies
    const cookieStore = cookies();
    
    // Create Supabase client with cookie support
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            try {
              cookieStore.set(name, value, options);
            } catch (error) {
              // Server component - ignore
            }
          },
          remove(name, options) {
            try {
              cookieStore.set(name, '', { ...options, maxAge: 0 });
            } catch (error) {
              // Server component - ignore
            }
          }
        }
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get message IDs from request body
    const { messageIds } = await request.json();
    
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid message IDs' },
        { status: 400 }
      );
    }

    // Mark messages as read
    const { error: updateError } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .in('id', messageIds)
      .eq('to_user_id', user.id); // Ensure user can only mark their own messages

    if (updateError) {
      console.error('Error marking messages as read:', updateError);
      return NextResponse.json(
        { error: 'Failed to mark messages as read' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      count: messageIds.length 
    });

  } catch (error) {
    console.error('Error in mark-read API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
