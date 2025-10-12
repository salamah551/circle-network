// app/api/admin/export-members/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Initialize Supabase clients at runtime
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin status
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get all members
    const { data: members, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Check for duplicate emails
    const emailMap = new Map();
    const duplicates = [];
    
    members.forEach(member => {
      if (emailMap.has(member.email)) {
        duplicates.push({
          email: member.email,
          count: emailMap.get(member.email) + 1
        });
        emailMap.set(member.email, emailMap.get(member.email) + 1);
      } else {
        emailMap.set(member.email, 1);
      }
    });

    // Create CSV header
    let csv = 'Name,Email,Status,Industry,Company,Title,Is Founding Member,Created At,Duplicate Warning\n';

    // Add member data
    members.forEach(member => {
      const isDuplicate = emailMap.get(member.email) > 1 ? 'DUPLICATE EMAIL' : '';
      const name = `"${member.name || ''}"`;
      const email = `"${member.email || ''}"`;
      const status = member.status || 'pending';
      const industry = `"${member.industry || ''}"`;
      const company = `"${member.company || ''}"`;
      const title = `"${member.title || ''}"`;
      const isFounding = member.is_founding_member ? 'Yes' : 'No';
      const createdAt = member.created_at ? new Date(member.created_at).toLocaleDateString() : '';
      
      csv += `${name},${email},${status},${industry},${company},${title},${isFounding},${createdAt},${isDuplicate}\n`;
    });

    // Return CSV with proper headers
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="circle-members-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export members' },
      { status: 500 }
    );
  }
}
