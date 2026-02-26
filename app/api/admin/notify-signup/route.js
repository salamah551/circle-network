export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userEmail, userName, membershipTier } = body;

    // Admin notifications via email have been removed.
    // New signups can be monitored through the admin dashboard.
    console.log(`New member signup: ${userName} (${userEmail}), tier: ${membershipTier || 'Founding'}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in notify-signup:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
