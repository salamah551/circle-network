// app/api/arc/request/route.js
// POST /api/arc/request - Submit a new ARC™ request with attachments
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// Tier-based monthly limits (configurable via env)
const USAGE_LIMITS = {
  founding: parseInt(process.env.ARC_LIMIT_FOUNDING || '100', 10),
  elite: parseInt(process.env.ARC_LIMIT_ELITE || '100', 10),
  charter: parseInt(process.env.ARC_LIMIT_CHARTER || '10', 10),
  professional: parseInt(process.env.ARC_LIMIT_PROFESSIONAL || '5', 10),
};

// Allowed file types
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/webp',
];

const MAX_FILE_SIZE = parseInt(process.env.ARC_MAX_FILE_SIZE_MB || '20', 10) * 1024 * 1024; // 20MB in bytes
const STORAGE_BUCKET = process.env.ARC_STORAGE_BUCKET || 'arc-uploads';

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

async function checkMonthlyUsage(supabase, userId, tier) {
  // Get current month's usage
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const { data, error } = await supabase
    .from('arc_requests')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString());
  
  if (error) {
    console.error('Error checking usage:', error);
    return { used: 0, limit: USAGE_LIMITS[tier] || 5, remaining: USAGE_LIMITS[tier] || 5 };
  }
  
  const used = data?.length || 0;
  const limit = USAGE_LIMITS[tier] || 5;
  const remaining = Math.max(0, limit - used);
  
  return { used, limit, remaining };
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

    // Get user profile to check tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('membership_tier, is_founding_member')
      .eq('id', session.user.id)
      .single();
    
    const tier = profile?.membership_tier || 'professional';
    
    // Check monthly usage cap
    const usage = await checkMonthlyUsage(supabase, session.user.id, tier);
    
    if (usage.remaining <= 0) {
      return Response.json(
        { 
          error: 'Monthly usage limit reached',
          message: `You've reached your monthly limit of ${usage.limit} ARC requests. Upgrade your tier for more requests.`,
          used: usage.used,
          limit: usage.limit,
          remaining: 0
        },
        { status: 429 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const type = formData.get('type') || 'brief';
    const content = formData.get('content');
    const files = formData.getAll('files');

    // Validate service type
    if (!['brief', 'travel', 'intel'].includes(type)) {
      return Response.json(
        { error: 'Invalid service type. Must be: brief, travel, or intel' },
        { status: 400 }
      );
    }

    // Validate content
    if (!content || typeof content !== 'string' || !content.trim()) {
      return Response.json(
        { error: 'Request content is required' },
        { status: 400 }
      );
    }

    // Validate files
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return Response.json(
          { error: `File "${file.name}" exceeds maximum size of ${process.env.ARC_MAX_FILE_SIZE_MB || '20'}MB` },
          { status: 400 }
        );
      }
      
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return Response.json(
          { error: `File type "${file.type}" is not allowed for "${file.name}"` },
          { status: 400 }
        );
      }
    }

    // Generate title from first ~120 chars of content
    const title = content.trim().substring(0, 120);
    
    // Insert into arc_requests table
    const { data: arcRequest, error: insertError } = await supabase
      .from('arc_requests')
      .insert({
        user_id: session.user.id,
        type: type,
        title: title,
        content: content.trim(),
        status: 'processing'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting ARC request:', insertError);
      return Response.json(
        { error: 'Failed to create ARC request' },
        { status: 500 }
      );
    }
    
    // Upload files to storage and create attachment records
    const attachments = [];
    for (const file of files) {
      if (file && file.size > 0) {
        try {
          // Generate storage path: {user_id}/{request_id}/{filename}
          const storagePath = `${session.user.id}/${arcRequest.id}/${file.name}`;
          
          // Convert File to Buffer
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(storagePath, buffer, {
              contentType: file.type,
              upsert: false
            });
          
          if (uploadError) {
            console.error('Error uploading file:', uploadError);
            continue; // Skip this file but don't fail the whole request
          }
          
          // Create attachment record
          const { data: attachment, error: attachmentError } = await supabase
            .from('arc_request_attachments')
            .insert({
              request_id: arcRequest.id,
              user_id: session.user.id,
              file_name: file.name,
              file_size: file.size,
              file_type: file.type,
              storage_path: storagePath
            })
            .select()
            .single();
          
          if (!attachmentError && attachment) {
            attachments.push(attachment);
          }
        } catch (fileError) {
          console.error('Error processing file:', file.name, fileError);
          // Continue with other files
        }
      }
    }
    
    // Get updated usage
    const updatedUsage = await checkMonthlyUsage(supabase, session.user.id, tier);
    
    return Response.json({
      id: arcRequest.id,
      status: arcRequest.status,
      type: arcRequest.type,
      attachments: attachments.length,
      message: 'Request submitted! Check My ARC Briefs for updates.',
      usage: {
        used: updatedUsage.used,
        limit: updatedUsage.limit,
        remaining: updatedUsage.remaining
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error submitting ARC request:', error);
    return Response.json(
      { error: 'Failed to submit ARC request' },
      { status: 500 }
    );
  }
}
