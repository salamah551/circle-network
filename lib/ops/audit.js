// lib/ops/audit.js
// Desired state audit for AI Ops Control Plane

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { createClient } from '@supabase/supabase-js';

/**
 * Load desired state configuration
 */
export function loadDesiredState() {
  const configPath = path.join(process.cwd(), 'ops', 'desired_state.yaml');
  
  if (!fs.existsSync(configPath)) {
    throw new Error('desired_state.yaml not found');
  }
  
  const content = fs.readFileSync(configPath, 'utf-8');
  return yaml.load(content);
}

/**
 * Load change policy configuration
 */
export function loadChangePolicy() {
  const configPath = path.join(process.cwd(), 'ops', 'change_policy.yaml');
  
  if (!fs.existsSync(configPath)) {
    throw new Error('change_policy.yaml not found');
  }
  
  const content = fs.readFileSync(configPath, 'utf-8');
  return yaml.load(content);
}

/**
 * Get Supabase client for ops operations
 */
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase credentials not configured');
  }
  
  return createClient(url, key);
}

/**
 * Audit Supabase database tables and policies
 */
export async function auditSupabase() {
  const desiredState = loadDesiredState();
  const supabase = getSupabaseClient();
  const changes = [];
  
  // Check tables
  for (const tableConfig of desiredState.database.tables) {
    const { name, rls_enabled, required_columns, optional, indexes } = tableConfig;
    
    // Check if table exists
    const { data: tableData, error: tableError } = await supabase
      .from(name)
      .select('*')
      .limit(0);
    
    if (tableError && tableError.code === 'PGRST116') {
      // Table doesn't exist
      if (!optional) {
        changes.push({
          id: `table_${name}`,
          type: 'create_table',
          scope: 'supabase',
          severity: 'high',
          description: `Table '${name}' does not exist`,
          desired: { name, columns: required_columns, rls_enabled },
          current: null,
          action: 'create'
        });
      }
      continue;
    }
    
    // Check RLS status (simplified check)
    // In production, would query pg_tables for rls_enabled
    // For now, we'll add a note about manual verification
    
    // Check columns (simplified - would need pg_catalog query)
    // This is a placeholder for column verification
    
    // Check indexes if specified
    if (indexes && indexes.length > 0) {
      for (const index of indexes) {
        changes.push({
          id: `index_${name}_${index.name}`,
          type: 'verify_index',
          scope: 'supabase',
          severity: 'low',
          description: `Verify index '${index.name}' exists on table '${name}'`,
          desired: index,
          current: null,
          action: 'verify'
        });
      }
    }
  }
  
  // Check storage buckets
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (!bucketsError) {
    for (const bucketConfig of desiredState.storage.buckets) {
      const existingBucket = buckets.find(b => b.name === bucketConfig.name);
      
      if (!existingBucket) {
        changes.push({
          id: `bucket_${bucketConfig.name}`,
          type: 'create_bucket',
          scope: 'supabase',
          severity: 'medium',
          description: `Storage bucket '${bucketConfig.name}' does not exist`,
          desired: bucketConfig,
          current: null,
          action: 'create'
        });
      } else {
        // Check bucket configuration
        if (bucketConfig.public !== existingBucket.public) {
          changes.push({
            id: `bucket_config_${bucketConfig.name}`,
            type: 'update_bucket',
            scope: 'supabase',
            severity: 'low',
            description: `Bucket '${bucketConfig.name}' public setting mismatch`,
            desired: { public: bucketConfig.public },
            current: { public: existingBucket.public },
            action: 'update'
          });
        }
      }
    }
  }
  
  return changes;
}

/**
 * Audit environment variables
 */
export function auditEnvironment() {
  const desiredState = loadDesiredState();
  const changes = [];
  
  // Check required environment variables
  for (const [category, vars] of Object.entries(desiredState.environment.required)) {
    for (const varName of vars) {
      if (!process.env[varName]) {
        changes.push({
          id: `env_${varName}`,
          type: 'set_env_var',
          scope: 'vercel',
          severity: 'high',
          description: `Required environment variable '${varName}' is not set (${category})`,
          desired: { name: varName, category },
          current: null,
          action: 'set'
        });
      }
    }
  }
  
  // Check optional environment variables
  if (desiredState.environment.optional) {
    for (const [category, vars] of Object.entries(desiredState.environment.optional)) {
      for (const varName of vars) {
        if (!process.env[varName]) {
          changes.push({
            id: `env_optional_${varName}`,
            type: 'set_env_var',
            scope: 'vercel',
            severity: 'low',
            description: `Optional environment variable '${varName}' is not set (${category})`,
            desired: { name: varName, category, optional: true },
            current: null,
            action: 'recommend'
          });
        }
      }
    }
  }
  
  return changes;
}

/**
 * Audit Stripe configuration (read-only)
 */
export async function auditStripe() {
  const desiredState = loadDesiredState();
  const changes = [];
  
  // Check if Stripe is configured
  if (!process.env.STRIPE_SECRET_KEY) {
    changes.push({
      id: 'stripe_not_configured',
      type: 'verify_stripe',
      scope: 'stripe',
      severity: 'medium',
      description: 'Stripe is not configured',
      desired: 'Stripe credentials set',
      current: null,
      action: 'manual'
    });
    return changes;
  }
  
  // Check price IDs (read-only verification)
  // Updated to use FOUNDING/PREMIUM/ELITE naming convention
  const priceVars = [
    'NEXT_PUBLIC_STRIPE_PRICE_FOUNDING',
    'NEXT_PUBLIC_STRIPE_PRICE_PREMIUM',
    'NEXT_PUBLIC_STRIPE_PRICE_ELITE'
  ];
  
  for (const priceVar of priceVars) {
    if (!process.env[priceVar]) {
      changes.push({
        id: `stripe_price_${priceVar}`,
        type: 'verify_price',
        scope: 'stripe',
        severity: 'low',
        description: `Stripe price ID '${priceVar}' not configured`,
        desired: { variable: priceVar },
        current: null,
        action: 'verify'
      });
    }
  }
  
  return changes;
}

/**
 * Run complete audit across all scopes
 */
export async function auditAll(scope = 'all') {
  const allChanges = [];
  
  if (scope === 'all' || scope === 'supabase') {
    const supabaseChanges = await auditSupabase();
    allChanges.push(...supabaseChanges);
  }
  
  if (scope === 'all' || scope === 'vercel') {
    const envChanges = auditEnvironment();
    allChanges.push(...envChanges);
  }
  
  if (scope === 'all' || scope === 'stripe') {
    const stripeChanges = await auditStripe();
    allChanges.push(...stripeChanges);
  }
  
  return {
    timestamp: new Date().toISOString(),
    scope,
    total_changes: allChanges.length,
    by_severity: {
      high: allChanges.filter(c => c.severity === 'high').length,
      medium: allChanges.filter(c => c.severity === 'medium').length,
      low: allChanges.filter(c => c.severity === 'low').length
    },
    by_scope: {
      supabase: allChanges.filter(c => c.scope === 'supabase').length,
      vercel: allChanges.filter(c => c.scope === 'vercel').length,
      stripe: allChanges.filter(c => c.scope === 'stripe').length
    },
    changes: allChanges
  };
}

/**
 * Generate change plan from audit results
 */
export function generateChangePlan(changes, mode = 'plan') {
  const policy = loadChangePolicy();
  
  return changes.map(change => {
    const changeTypePolicy = getChangeTypePolicy(policy, change);
    
    return {
      ...change,
      mode,
      requires_approval: changeTypePolicy?.requires_approval || false,
      risk_level: changeTypePolicy?.risk_level || 'unknown',
      recommended_action: changeTypePolicy?.action || 'manual',
      can_auto_apply: canAutoApply(change, changeTypePolicy, mode)
    };
  });
}

/**
 * Get change type policy
 */
function getChangeTypePolicy(policy, change) {
  const scopePolicy = policy[change.scope];
  if (!scopePolicy) return null;
  
  return scopePolicy.change_types?.[change.type] || null;
}

/**
 * Check if change can be auto-applied
 */
function canAutoApply(change, policy, mode) {
  if (mode !== 'apply') return false;
  
  // Check if direct apply is allowed by environment variable
  const allowDirectApply = process.env.OPS_ALLOW_DIRECT_APPLY === 'true';
  
  if (!allowDirectApply) return false;
  
  // Check policy
  if (!policy) return false;
  
  return policy.action === 'auto_apply' && !policy.requires_approval;
}
