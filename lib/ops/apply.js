// lib/ops/apply.js
// Apply changes for AI Ops Control Plane

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { Octokit } from '@octokit/rest';

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
 * Get GitHub Octokit client
 */
function getGitHubClient() {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    throw new Error('GITHUB_TOKEN not configured');
  }
  
  return new Octokit({ auth: token });
}

/**
 * Generate SQL migration for database changes
 */
function generateMigrationSQL(changes) {
  let sql = `-- Auto-generated migration by AI Ops Control Plane\n`;
  sql += `-- Generated at: ${new Date().toISOString()}\n\n`;
  
  for (const change of changes) {
    sql += `-- ${change.description}\n`;
    
    switch (change.type) {
      case 'create_table':
        sql += generateCreateTableSQL(change);
        break;
      
      case 'add_column':
        sql += generateAddColumnSQL(change);
        break;
      
      case 'create_index':
        sql += generateCreateIndexSQL(change);
        break;
      
      case 'enable_rls':
        sql += generateEnableRLSSQL(change);
        break;
      
      case 'create_policy':
        sql += generateCreatePolicySQL(change);
        break;
      
      default:
        sql += `-- Manual intervention required for: ${change.type}\n`;
    }
    
    sql += '\n';
  }
  
  return sql;
}

/**
 * Generate CREATE TABLE SQL
 */
function generateCreateTableSQL(change) {
  const { name, columns, rls_enabled } = change.desired;
  
  let sql = `CREATE TABLE IF NOT EXISTS public.${name} (\n`;
  sql += `  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n`;
  
  if (columns) {
    for (const col of columns) {
      if (col !== 'id' && col !== 'created_at') {
        sql += `  ${col} text,\n`;
      }
    }
  }
  
  sql += `  created_at timestamptz DEFAULT now()\n`;
  sql += `);\n`;
  
  if (rls_enabled) {
    sql += `ALTER TABLE public.${name} ENABLE ROW LEVEL SECURITY;\n`;
  }
  
  return sql;
}

/**
 * Generate ADD COLUMN SQL
 */
function generateAddColumnSQL(change) {
  const { table, column, type } = change.desired;
  return `ALTER TABLE public.${table} ADD COLUMN IF NOT EXISTS ${column} ${type};\n`;
}

/**
 * Generate CREATE INDEX SQL
 */
function generateCreateIndexSQL(change) {
  const { name, table, column, type } = change.desired;
  
  if (type === 'gin') {
    return `CREATE INDEX IF NOT EXISTS ${name} ON public.${table} USING gin (${column});\n`;
  } else if (type === 'ivfflat') {
    return `CREATE INDEX IF NOT EXISTS ${name} ON public.${table} USING ivfflat (${column});\n`;
  }
  
  return `CREATE INDEX IF NOT EXISTS ${name} ON public.${table} (${column});\n`;
}

/**
 * Generate ENABLE RLS SQL
 */
function generateEnableRLSSQL(change) {
  const { table } = change.desired;
  return `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;\n`;
}

/**
 * Generate CREATE POLICY SQL
 */
function generateCreatePolicySQL(change) {
  const { table, policy_name, operation, check } = change.desired;
  return `CREATE POLICY ${policy_name} ON public.${table}\n  FOR ${operation}\n  USING (${check});\n`;
}

/**
 * Create migration file with SQL
 */
async function createMigrationFile(sql, description = 'auto_generated') {
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const fileName = `${timestamp}_${description.replace(/\s+/g, '_').toLowerCase()}.sql`;
  const filePath = path.join(process.cwd(), 'supabase', 'migrations', fileName);
  
  fs.writeFileSync(filePath, sql);
  
  return {
    fileName,
    filePath,
    content: sql
  };
}

/**
 * Create GitHub PR with migration
 */
async function createGitHubPR(migrationFile, changes) {
  const octokit = getGitHubClient();
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  
  if (!owner || !repo) {
    throw new Error('GITHUB_REPO_OWNER and GITHUB_REPO_NAME must be configured');
  }
  
  // Get default branch
  const { data: repoData } = await octokit.repos.get({ owner, repo });
  const defaultBranch = repoData.default_branch;
  
  // Get SHA of default branch
  const { data: refData } = await octokit.git.getRef({
    owner,
    repo,
    ref: `heads/${defaultBranch}`
  });
  const baseSha = refData.object.sha;
  
  // Create new branch
  const branchName = `ai-ops/migration-${Date.now()}`;
  await octokit.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${branchName}`,
    sha: baseSha
  });
  
  // Get file content as base64
  const content = Buffer.from(migrationFile.content).toString('base64');
  
  // Create file
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: `supabase/migrations/${migrationFile.fileName}`,
    message: `[AI Ops] Auto-generated migration\n\n${changes.map(c => `- ${c.description}`).join('\n')}`,
    content,
    branch: branchName
  });
  
  // Create PR
  const { data: pr } = await octokit.pulls.create({
    owner,
    repo,
    title: '[AI Ops] Auto-generated database migration',
    head: branchName,
    base: defaultBranch,
    body: `## Auto-generated Migration\n\nThis PR was automatically generated by the AI Ops Control Plane.\n\n### Changes\n\n${changes.map(c => `- **${c.severity.toUpperCase()}**: ${c.description}`).join('\n')}\n\n### Files\n\n- \`${migrationFile.fileName}\`\n\n### Review Required\n\nPlease review the migration carefully before merging.`
  });
  
  return {
    pr_number: pr.number,
    pr_url: pr.html_url,
    branch: branchName
  };
}

/**
 * Apply database changes directly (requires OPS_ALLOW_DIRECT_APPLY=true)
 * 
 * Note: Direct SQL execution requires a custom RPC function 'exec_sql' which is not
 * included in the base migration due to security concerns. For direct apply to work,
 * you must create this function manually in Supabase:
 * 
 * CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
 * RETURNS void
 * LANGUAGE plpgsql
 * SECURITY DEFINER
 * AS $$
 * BEGIN
 *   EXECUTE sql_query;
 * END;
 * $$;
 * GRANT EXECUTE ON FUNCTION exec_sql TO service_role;
 * 
 * WARNING: This function is powerful and should only be used with trusted input.
 * The default behavior (generatePR) is recommended for production use.
 */
async function applyDatabaseChanges(changes) {
  const allowDirectApply = process.env.OPS_ALLOW_DIRECT_APPLY === 'true';
  
  if (!allowDirectApply) {
    throw new Error('Direct apply not allowed. Set OPS_ALLOW_DIRECT_APPLY=true or use PR workflow.');
  }
  
  const supabase = getSupabaseClient();
  const sql = generateMigrationSQL(changes);
  
  // Execute SQL using custom RPC function (must be created manually - see function comment)
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    throw error;
  }
  
  return { success: true, executed_sql: sql };
}

/**
 * Apply storage bucket changes
 */
async function applyStorageChanges(changes) {
  const supabase = getSupabaseClient();
  const results = [];
  
  for (const change of changes) {
    try {
      if (change.type === 'create_bucket') {
        const { name, public: isPublic, file_size_limit } = change.desired;
        
        const { data, error } = await supabase.storage.createBucket(name, {
          public: isPublic,
          fileSizeLimit: file_size_limit
        });
        
        if (error && !error.message.includes('already exists')) {
          throw error;
        }
        
        results.push({
          changeId: change.id,
          success: true,
          message: `Bucket '${name}' created successfully`
        });
      }
    } catch (error) {
      results.push({
        changeId: change.id,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

/**
 * Apply environment variable changes (stub - would integrate with Vercel API)
 */
async function applyEnvironmentChanges(changes) {
  const results = [];
  
  for (const change of changes) {
    // This is a stub - in production would use Vercel API
    results.push({
      changeId: change.id,
      success: false,
      message: 'Environment variable changes require manual configuration via Vercel dashboard',
      manual_action_required: true,
      variable: change.desired.name
    });
  }
  
  return results;
}

/**
 * Apply selected changes
 */
export async function applyChanges(changes, options = {}) {
  const { 
    generatePR = true,
    directApply = false 
  } = options;
  
  const results = {
    timestamp: new Date().toISOString(),
    total: changes.length,
    applied: [],
    failed: [],
    skipped: []
  };
  
  // Group changes by scope
  const dbChanges = changes.filter(c => c.scope === 'supabase' && c.type !== 'create_bucket');
  const storageChanges = changes.filter(c => c.type === 'create_bucket');
  const envChanges = changes.filter(c => c.scope === 'vercel');
  const stripeChanges = changes.filter(c => c.scope === 'stripe');
  
  // Handle database changes
  if (dbChanges.length > 0) {
    try {
      if (directApply && process.env.OPS_ALLOW_DIRECT_APPLY === 'true') {
        const result = await applyDatabaseChanges(dbChanges);
        results.applied.push({
          scope: 'database',
          method: 'direct_apply',
          changes: dbChanges.length,
          result
        });
      } else if (generatePR) {
        const sql = generateMigrationSQL(dbChanges);
        const migrationFile = await createMigrationFile(sql, 'ops_audit_fixes');
        
        // Try to create PR if GitHub is configured
        if (process.env.GITHUB_TOKEN) {
          try {
            const prResult = await createGitHubPR(migrationFile, dbChanges);
            results.applied.push({
              scope: 'database',
              method: 'github_pr',
              changes: dbChanges.length,
              pr: prResult,
              migration_file: migrationFile.fileName
            });
          } catch (prError) {
            results.applied.push({
              scope: 'database',
              method: 'local_migration_file',
              changes: dbChanges.length,
              migration_file: migrationFile.fileName,
              note: 'Migration file created locally. GitHub PR creation failed: ' + prError.message
            });
          }
        } else {
          results.applied.push({
            scope: 'database',
            method: 'local_migration_file',
            changes: dbChanges.length,
            migration_file: migrationFile.fileName,
            note: 'Migration file created locally. Configure GITHUB_TOKEN for PR creation.'
          });
        }
      }
    } catch (error) {
      results.failed.push({
        scope: 'database',
        error: error.message
      });
    }
  }
  
  // Handle storage changes
  if (storageChanges.length > 0) {
    try {
      const storageResults = await applyStorageChanges(storageChanges);
      results.applied.push({
        scope: 'storage',
        method: 'direct_apply',
        changes: storageChanges.length,
        results: storageResults
      });
    } catch (error) {
      results.failed.push({
        scope: 'storage',
        error: error.message
      });
    }
  }
  
  // Handle environment changes
  if (envChanges.length > 0) {
    const envResults = await applyEnvironmentChanges(envChanges);
    results.skipped.push({
      scope: 'environment',
      changes: envChanges.length,
      reason: 'Manual configuration required',
      details: envResults
    });
  }
  
  // Handle Stripe changes (read-only)
  if (stripeChanges.length > 0) {
    results.skipped.push({
      scope: 'stripe',
      changes: stripeChanges.length,
      reason: 'Read-only verification - manual configuration required'
    });
  }
  
  return results;
}
