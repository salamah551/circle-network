/**
 * PostHog connector for verifying API key presence (read-only)
 */

import { BaseConnector } from './base';
import { CheckResult } from '../types';

export class PostHogConnector extends BaseConnector {
  private apiKey: string;

  constructor(config: { apiKey: string }, private desiredState: any) {
    super(config);
    this.apiKey = config.apiKey;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async audit(): Promise<CheckResult[]> {
    const checks: CheckResult[] = [];

    if (this.desiredState.posthog?.keyPresent) {
      if (!this.isConfigured()) {
        checks.push({
          id: 'posthog-key',
          scope: 'posthog',
          name: 'API Key Check',
          status: 'warning',
          message: 'PostHog API key not configured (optional)',
          suggestedAction: 'Add NEXT_PUBLIC_POSTHOG_KEY to environment variables',
        });
      } else {
        // Verify key format (PostHog keys start with 'phc_')
        if (this.apiKey.startsWith('phc_')) {
          checks.push({
            id: 'posthog-key',
            scope: 'posthog',
            name: 'API Key Check',
            status: 'pass',
            message: 'PostHog API key is configured and has valid format',
          });
        } else {
          checks.push({
            id: 'posthog-key',
            scope: 'posthog',
            name: 'API Key Check',
            status: 'warning',
            message: 'PostHog API key format appears invalid (should start with phc_)',
            suggestedAction: 'Verify API key from PostHog dashboard',
          });
        }
      }
    }

    return checks;
  }

  async apply(changeId: string, action: any): Promise<{ success: boolean; message: string }> {
    // PostHog connector is read-only
    return {
      success: false,
      message: 'PostHog connector is read-only. Update environment variables manually.',
    };
  }
}
