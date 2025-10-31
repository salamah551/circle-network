/**
 * Vercel Connector for AI Ops
 * Manages environment variables and cron jobs
 */

import { BaseConnector, PlanResult, DiffResult, ApplyResult, ConnectorConfig } from './base';

export class VercelConnector extends BaseConnector {
  private apiToken: string;
  private projectId: string;

  constructor(config: ConnectorConfig) {
    super(config);
    this.apiToken = process.env.VERCEL_API_TOKEN || '';
    this.projectId = process.env.VERCEL_PROJECT_ID || '';
  }

  async verify(): Promise<{ success: boolean; message: string }> {
    if (!this.apiToken) {
      return { success: false, message: 'VERCEL_API_TOKEN not configured' };
    }

    try {
      const response = await fetch(`https://api.vercel.com/v9/projects/${this.projectId}`, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      });

      if (!response.ok) {
        return { success: false, message: `Vercel API error: ${response.status}` };
      }

      return { success: true, message: 'Vercel connection verified' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async getCurrentState(): Promise<any> {
    const state: any = {
      env: {},
      cron: [],
    };

    if (!this.apiToken || !this.projectId) {
      return state;
    }

    try {
      // Get environment variables
      const envResponse = await fetch(
        `https://api.vercel.com/v9/projects/${this.projectId}/env`,
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
          },
        }
      );

      if (envResponse.ok) {
        const envData = await envResponse.json();
        state.env = envData.envs || [];
      }

      return state;
    } catch (error) {
      console.error('Error getting Vercel state:', error);
      return state;
    }
  }

  async plan(desiredState: any): Promise<PlanResult> {
    const diffs: DiffResult[] = [];
    const currentState = await this.getCurrentState();

    // Check environment variables
    if (desiredState.environment?.required) {
      const allRequired = [
        ...(desiredState.environment.required.all_environments || []),
        ...(desiredState.environment.required.production || []),
      ];

      const existingEnvKeys = new Set(
        currentState.env.map((e: any) => e.key)
      );

      for (const requiredVar of allRequired) {
        if (!existingEnvKeys.has(requiredVar)) {
          diffs.push({
            type: 'create',
            resource: `env:${requiredVar}`,
            details: {
              key: requiredVar,
              target: ['production', 'preview', 'development'],
            },
            risk: 'medium',
            requiresApproval: true,
          });
        }
      }
    }

    // Check cron jobs (from vercel.json)
    if (desiredState.vercel?.cron_jobs) {
      for (const cronJob of desiredState.vercel.cron_jobs) {
        diffs.push({
          type: 'update',
          resource: `cron:${cronJob.name}`,
          details: {
            name: cronJob.name,
            path: cronJob.path,
            schedule: cronJob.schedule,
            action: 'verify_in_vercel_json',
          },
          risk: 'low',
          requiresApproval: false,
        });
      }
    }

    return {
      connector: 'vercel',
      diffs,
      summary: `Found ${diffs.length} differences in Vercel configuration`,
      requiresApproval: diffs.some(d => d.requiresApproval),
    };
  }

  async apply(plan: PlanResult, options?: any): Promise<ApplyResult> {
    const result: ApplyResult = {
      success: true,
      applied: 0,
      failed: 0,
      errors: [],
      changes: [],
    };

    // Vercel changes require manual intervention or GitHub PR
    result.errors.push('Vercel changes require manual setup or GitHub PR');
    result.success = false;

    for (const diff of plan.diffs) {
      result.changes.push({
        type: 'documentation_required',
        diff,
        message: 'Add to deployment checklist or environment setup docs',
      });
    }

    return result;
  }
}
