'use server';

import { createClient } from '@supabase/supabase-js';

// Server actions for ops console - secrets stay on server
const OPS_API_TOKEN = process.env.OPS_API_TOKEN;
const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verify admin access
async function verifyAdmin(userId: string): Promise<boolean> {
  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return false;
  }
  
  const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();
  
  return !error && profile?.is_admin === true;
}

export async function ingestKnowledge(userId: string, mode: 'priority' | 'full' = 'priority') {
  try {
    const isAdmin = await verifyAdmin(userId);
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/ops/ingest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPS_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode,
        includeMarkdown: true,
        includeCode: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Ingestion failed' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to ingest knowledge' };
  }
}

export async function askQuestion(userId: string, question: string) {
  try {
    const isAdmin = await verifyAdmin(userId);
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    if (!question || question.trim().length === 0) {
      return { success: false, error: 'Question is required' };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/ops/ask`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPS_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to get answer' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to ask question' };
  }
}

export async function auditInfrastructure(userId: string, scope: 'all' | 'supabase' | 'vercel' | 'stripe' = 'all') {
  try {
    const isAdmin = await verifyAdmin(userId);
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/ops/audit?scope=${scope}&mode=plan`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${OPS_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Audit failed' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to audit infrastructure' };
  }
}

export async function applyChanges(userId: string, changeIds: string[], generatePR: boolean = true) {
  try {
    const isAdmin = await verifyAdmin(userId);
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    if (!changeIds || changeIds.length === 0) {
      return { success: false, error: 'No changes selected' };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/ops/apply`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPS_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        changeIds,
        options: {
          generatePR,
          directApply: false, // Always safe by default
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Apply failed' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to apply changes' };
  }
}

export async function getIngestionStats(userId: string) {
  try {
    const isAdmin = await verifyAdmin(userId);
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/ops/ingest`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPS_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to get stats' };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to get ingestion stats' };
  }
}
