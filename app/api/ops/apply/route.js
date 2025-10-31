// app/api/ops/apply/route.js
// POST /api/ops/apply - Apply selected changes from audit

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

import { auditAll, generateChangePlan } from '@/lib/ops/audit';
import { applyChanges } from '@/lib/ops/apply';

/**
 * POST /api/ops/apply
 * 
 * Apply selected changes from audit results
 * 
 * Request body:
 * {
 *   "changeIds": ["change_id_1", "change_id_2"],
 *   "options": {
 *     "generatePR": true,
 *     "directApply": false
 *   }
 * }
 */
export async function POST(request) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.OPS_API_TOKEN;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { 
      changeIds = [],
      options = {}
    } = body;
    
    if (!changeIds || changeIds.length === 0) {
      return Response.json(
        { error: 'changeIds array is required and must not be empty' },
        { status: 400 }
      );
    }
    
    console.log(`Applying ${changeIds.length} changes`);
    
    // Run fresh audit to get current state
    const auditResults = await auditAll('all');
    
    // Filter changes by requested IDs
    const changesToApply = auditResults.changes.filter(c => 
      changeIds.includes(c.id)
    );
    
    if (changesToApply.length === 0) {
      return Response.json(
        { error: 'No matching changes found for the provided IDs' },
        { status: 404 }
      );
    }
    
    // Check for missing IDs
    const foundIds = changesToApply.map(c => c.id);
    const missingIds = changeIds.filter(id => !foundIds.includes(id));
    
    // Validate options
    const applyOptions = {
      generatePR: options.generatePR !== false, // Default true
      directApply: options.directApply === true  // Default false
    };
    
    // Check if direct apply requires OPS_ALLOW_DIRECT_APPLY
    if (applyOptions.directApply && process.env.OPS_ALLOW_DIRECT_APPLY !== 'true') {
      return Response.json(
        { 
          error: 'Direct apply not allowed',
          message: 'Set OPS_ALLOW_DIRECT_APPLY=true environment variable to enable direct apply',
          hint: 'Use generatePR: true to create a pull request instead'
        },
        { status: 403 }
      );
    }
    
    // Check for high-risk changes requiring approval
    const highRiskChanges = changesToApply.filter(c => c.severity === 'high');
    
    if (highRiskChanges.length > 0 && applyOptions.directApply) {
      const requiresApproval = highRiskChanges.some(c => {
        const plan = generateChangePlan([c], 'apply');
        return plan[0].requires_approval;
      });
      
      if (requiresApproval) {
        return Response.json(
          {
            error: 'High-risk changes require approval',
            message: 'Some changes require approval before direct apply',
            high_risk_changes: highRiskChanges.map(c => ({
              id: c.id,
              description: c.description,
              severity: c.severity
            })),
            hint: 'Use generatePR: true to create a pull request for review'
          },
          { status: 403 }
        );
      }
    }
    
    // Apply changes
    const applyResults = await applyChanges(changesToApply, applyOptions);
    
    // Build response
    const response = {
      success: true,
      timestamp: applyResults.timestamp,
      requested: changeIds.length,
      found: changesToApply.length,
      missing: missingIds.length > 0 ? missingIds : undefined,
      options: applyOptions,
      results: {
        applied: applyResults.applied,
        failed: applyResults.failed,
        skipped: applyResults.skipped
      },
      summary: {
        total_applied: applyResults.applied.length,
        total_failed: applyResults.failed.length,
        total_skipped: applyResults.skipped.length
      }
    };
    
    // Add next steps guidance
    if (applyResults.applied.length > 0) {
      const prResults = applyResults.applied.filter(r => r.method === 'github_pr');
      const migrationFiles = applyResults.applied.filter(r => r.method === 'local_migration_file');
      
      if (prResults.length > 0) {
        response.next_steps = {
          message: 'Pull requests created successfully',
          pull_requests: prResults.map(r => ({
            scope: r.scope,
            pr_url: r.pr?.pr_url,
            pr_number: r.pr?.pr_number
          }))
        };
      } else if (migrationFiles.length > 0) {
        response.next_steps = {
          message: 'Migration files created locally',
          files: migrationFiles.map(r => r.migration_file),
          instructions: 'Review the migration files in supabase/migrations/ and commit them to your repository'
        };
      }
    }
    
    return Response.json(response);
    
  } catch (error) {
    console.error('Error in /api/ops/apply:', error);
    return Response.json(
      { 
        error: 'Apply failed',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ops/apply
 * 
 * Get information about apply capabilities and configuration
 */
export async function GET(request) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.OPS_API_TOKEN;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const capabilities = {
      direct_apply_enabled: process.env.OPS_ALLOW_DIRECT_APPLY === 'true',
      github_pr_enabled: !!process.env.GITHUB_TOKEN,
      github_configured: !!(process.env.GITHUB_REPO_OWNER && process.env.GITHUB_REPO_NAME),
      vercel_api_enabled: false, // Stub
      stripe_api_enabled: false   // Read-only
    };
    
    return Response.json({
      success: true,
      capabilities,
      configuration: {
        max_changes_per_apply: 50,
        requires_approval_for: ['high_risk_changes', 'database_schema_changes'],
        supported_scopes: ['supabase', 'vercel', 'stripe'],
        supported_modes: ['plan', 'apply']
      },
      usage: {
        endpoint: 'POST /api/ops/apply',
        required_fields: ['changeIds'],
        optional_fields: ['options'],
        example: {
          changeIds: ['table_example_table', 'bucket_arc-uploads'],
          options: {
            generatePR: true,
            directApply: false
          }
        }
      }
    });
    
  } catch (error) {
    console.error('Error getting apply info:', error);
    return Response.json(
      { error: 'Failed to get apply information' },
      { status: 500 }
    );
  }
}
