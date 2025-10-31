/**
 * Vercel connector for auditing and applying environment variable and cron changes
 */

import { BaseConnector } from './base';
import { CheckResult } from '../types';

export class VercelConnector extends BaseConnector {
  private token: string;
  private projectId: string;
  private teamId?: string;
  private baseUrl = 'https://api.vercel.com';

  constructor(config: { token: string; projectId: string; teamId?: string }, private desiredState: any) {
    super(config);
    this.token = config.token;
    this.projectId = config.projectId;
    this.teamId = config.teamId;
  }

  isConfigured(): boolean {
    return !!(this.token && this.projectId);
  }

  async audit(): Promise<CheckResult[]> {
    const checks: CheckResult[] = [];

    if (!this.isConfigured()) {
      checks.push({
        id: 'vercel-config',
        scope: 'vercel',
        name: 'Configuration Check',
        status: 'error',
        message: 'Vercel credentials not configured',
      });
      return checks;
    }

    // Check environment variables
    if (this.desiredState.vercel?.envVars) {
      for (const envVar of this.desiredState.vercel.envVars) {
        const envCheck = await this.checkEnvVar(envVar);
        checks.push(envCheck);
      }
    }

    // Check cron jobs
    if (this.desiredState.vercel?.crons) {
      for (const cron of this.desiredState.vercel.crons) {
        const cronCheck = await this.checkCron(cron);
        checks.push(cronCheck);
      }
    }

    return checks;
  }

  private async checkEnvVar(envVar: any): Promise<CheckResult> {
    try {
      const url = `${this.baseUrl}/v9/projects/${this.projectId}/env${this.teamId ? `?teamId=${this.teamId}` : ''}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        return {
          id: `vercel-env-${envVar.key}`,
          scope: 'vercel',
          name: `Env Var: ${envVar.key}`,
          status: 'error',
          message: `Failed to fetch env vars: ${response.statusText}`,
        };
      }

      const data = await response.json();
      const envVars = data.envs || [];
      
      const existing = envVars.find((e: any) => e.key === envVar.key);

      if (!existing) {
        return {
          id: `vercel-env-${envVar.key}`,
          scope: 'vercel',
          name: `Env Var: ${envVar.key}`,
          status: envVar.required ? 'fail' : 'warning',
          message: `Environment variable '${envVar.key}' is missing`,
          suggestedAction: `Add '${envVar.key}' to environments: ${envVar.environments.join(', ')}`,
          changeId: `vercel.env.add.${envVar.key}`,
          risk: 'medium',
          requiresApproval: false,
        };
      }

      // Check if it's present in all required environments
      const missingEnvs = envVar.environments.filter((env: string) => {
        return !existing.target?.includes(env);
      });

      if (missingEnvs.length > 0) {
        return {
          id: `vercel-env-${envVar.key}`,
          scope: 'vercel',
          name: `Env Var: ${envVar.key}`,
          status: 'warning',
          message: `Missing in environments: ${missingEnvs.join(', ')}`,
          suggestedAction: `Add to missing environments`,
          changeId: `vercel.env.update.${envVar.key}`,
          risk: 'medium',
          requiresApproval: true,
        };
      }

      return {
        id: `vercel-env-${envVar.key}`,
        scope: 'vercel',
        name: `Env Var: ${envVar.key}`,
        status: 'pass',
        message: `Present in all required environments`,
      };
    } catch (err: any) {
      return {
        id: `vercel-env-${envVar.key}`,
        scope: 'vercel',
        name: `Env Var: ${envVar.key}`,
        status: 'error',
        message: `Error checking env var: ${err.message}`,
      };
    }
  }

  private async checkCron(cron: any): Promise<CheckResult> {
    try {
      // Get project config to check crons (from vercel.json)
      const url = `${this.baseUrl}/v9/projects/${this.projectId}${this.teamId ? `?teamId=${this.teamId}` : ''}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        return {
          id: `vercel-cron-${cron.path}`,
          scope: 'vercel',
          name: `Cron: ${cron.path}`,
          status: 'error',
          message: `Failed to fetch project config: ${response.statusText}`,
        };
      }

      const data = await response.json();
      
      // Crons are typically defined in vercel.json, not directly via API
      // This is a simplified check
      return {
        id: `vercel-cron-${cron.path}`,
        scope: 'vercel',
        name: `Cron: ${cron.path}`,
        status: 'warning',
        message: `Cron verification requires vercel.json file check`,
        suggestedAction: `Verify cron schedule for ${cron.path} is "${cron.schedule}"`,
      };
    } catch (err: any) {
      return {
        id: `vercel-cron-${cron.path}`,
        scope: 'vercel',
        name: `Cron: ${cron.path}`,
        status: 'error',
        message: `Error checking cron: ${err.message}`,
      };
    }
  }

  async apply(changeId: string, action: any): Promise<{ success: boolean; message: string }> {
    const parts = changeId.split('.');
    const actionType = parts[2]; // 'add', 'update', 'delete'

    if (parts[1] === 'env') {
      if (actionType === 'add') {
        return this.addEnvVar(action);
      } else if (actionType === 'update') {
        return this.updateEnvVar(action);
      }
    }

    return {
      success: false,
      message: `Unsupported change type: ${changeId}`,
    };
  }

  private async addEnvVar(action: any): Promise<{ success: boolean; message: string }> {
    try {
      const url = `${this.baseUrl}/v10/projects/${this.projectId}/env${this.teamId ? `?teamId=${this.teamId}` : ''}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: action.key,
          value: action.value || '',
          type: 'encrypted',
          target: action.environments || ['production'],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: `Failed to add env var: ${error.error?.message || response.statusText}`,
        };
      }

      return {
        success: true,
        message: `Environment variable '${action.key}' added successfully`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Error adding env var: ${err.message}`,
      };
    }
  }

  private async updateEnvVar(action: any): Promise<{ success: boolean; message: string }> {
    // Similar to add, but would need to find existing ID first
    return {
      success: false,
      message: 'Env var update not yet implemented - requires fetching existing ID',
    };
  }
}
