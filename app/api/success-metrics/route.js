export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const cookieStore = cookies();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

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
              // Cookie setting might fail in some contexts
            }
          },
          remove(name, options) {
            try {
              cookieStore.set(name, '', { ...options, maxAge: 0 });
            } catch (error) {
              // Cookie removal might fail in some contexts
            }
          }
        }
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get member profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('id', userId)
      .single();

    // Count intros accepted
    const { count: introsAccepted } = await supabase
      .from('strategic_intros')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'accepted');

    // Count unique connections (people messaged)
    const { data: messages } = await supabase
      .from('messages')
      .select('sender_id, recipient_id')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`);

    const uniqueConnections = new Set();
    messages?.forEach(msg => {
      const otherId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
      uniqueConnections.add(otherId);
    });

    // Count requests helped (replies to requests)
    const { count: requestsHelped } = await supabase
      .from('request_replies')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Count messages exchanged
    const { count: messagesExchanged } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`);

    // Count events attended
    const { count: eventsAttended } = await supabase
      .from('event_attendees')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'confirmed');

    // Calculate impact score (0-100)
    let impactScore = 0;
    impactScore += Math.min((introsAccepted || 0) * 15, 30); // Max 30 from intros
    impactScore += Math.min(uniqueConnections.size * 3, 20); // Max 20 from connections
    impactScore += Math.min((requestsHelped || 0) * 10, 25); // Max 25 from helping
    impactScore += Math.min((messagesExchanged || 0) * 0.5, 15); // Max 15 from messages
    impactScore += Math.min((eventsAttended || 0) * 20, 10); // Max 10 from events
    impactScore = Math.min(Math.round(impactScore), 100);

    return NextResponse.json({
      introsAccepted: introsAccepted || 0,
      connectionsMade: uniqueConnections.size,
      requestsHelped: requestsHelped || 0,
      messagesExchanged: messagesExchanged || 0,
      eventsAttended: eventsAttended || 0,
      memberSince: profile?.created_at || new Date().toISOString(),
      impactScore
    });

  } catch (error) {
    console.error('Error in success-metrics API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}