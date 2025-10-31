/**
 * Audit Engine - Orchestrates audits across all connectors
 */

import { AuditReport, CheckResult, ConnectorConfig, DesiredState } from './types';
import { SupabaseConnector } from './connectors/supabase';
import { VercelConnector } from './connectors/vercel';
import { GitHubConnector } from './connectors/github';
import { StripeConnector } from './connectors/stripe';
import { SendGridConnector } from './connectors/sendgrid';
import { PostHogConnector } from './connectors/posthog';
import { SlackConnector } from './connectors/slack';

export class AuditEngine {
  private desiredState: DesiredState;
  private connectors: Map<string, any> = new Map();

  constructor(desiredState: DesiredState, config: ConnectorConfig) {
    this.desiredState = desiredState;

    // Initialize connectors
    if (config.supabase) {
      this.connectors.set('supabase', new SupabaseConnector(config.supabase, desiredState));
    }
    
    if (config.vercel) {
      this.connectors.set('vercel', new VercelConnector(config.vercel, desiredState));
    }
    
    if (config.github) {
      this.connectors.set('github', new GitHubConnector(config.github, desiredState));
    }
    
    if (config.stripe) {
      this.connectors.set('stripe', new StripeConnector(config.stripe, desiredState));
    }
    
    if (config.sendgrid) {
      this.connectors.set('sendgrid', new SendGridConnector(config.sendgrid, desiredState));
    }
    
    if (config.posthog) {
      this.connectors.set('posthog', new PostHogConnector(config.posthog, desiredState));
    }
    
    if (config.slack) {
      this.connectors.set('slack', new SlackConnector(config.slack, desiredState));
    }
  }

  /**
   * Run audit across specified scopes
   */
  async runAudit(scopes: string[] = ['all']): Promise<AuditReport> {
    const checks: CheckResult[] = [];
    const scopesToCheck = scopes.includes('all') 
      ? Array.from(this.connectors.keys()) 
      : scopes;

    // Run audits in parallel for efficiency
    const auditPromises = scopesToCheck.map(async (scope) => {
      const connector = this.connectors.get(scope);
      if (connector) {
        try {
          const scopeChecks = await connector.audit();
          return scopeChecks;
        } catch (error: any) {
          // Sanitize scope for logging to prevent format string injection
          const sanitizedScope = String(scope).replace(/[^\w-]/g, '_');
          console.error('Error auditing scope:', sanitizedScope, error.message);
          return [{
            id: `${sanitizedScope}-error`,
            scope: sanitizedScope,
            name: `${sanitizedScope} Audit`,
            status: 'error' as const,
            message: `Audit failed: ${error.message}`,
          }];
        }
      }
      return [];
    });

    const results = await Promise.all(auditPromises);
    results.forEach((scopeChecks) => checks.push(...scopeChecks));

    // Calculate summary
    const summary = {
      total: checks.length,
      passed: checks.filter(c => c.status === 'pass').length,
      failed: checks.filter(c => c.status === 'fail').length,
      warnings: checks.filter(c => c.status === 'warning').length,
      errors: checks.filter(c => c.status === 'error').length,
    };

    return {
      timestamp: new Date().toISOString(),
      scope: scopesToCheck,
      checks,
      summary,
    };
  }

  /**
   * Get a specific connector
   */
  getConnector(scope: string): any {
    return this.connectors.get(scope);
  }
}
