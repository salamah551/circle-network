/**
 * SendGrid connector for auditing domain and sender verification (read-only)
 */

import { BaseConnector } from './base';
import { CheckResult } from '../types';

export class SendGridConnector extends BaseConnector {
  private apiKey: string;
  private baseUrl = 'https://api.sendgrid.com/v3';

  constructor(config: { apiKey: string }, private desiredState: any) {
    super(config);
    this.apiKey = config.apiKey;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async audit(): Promise<CheckResult[]> {
    const checks: CheckResult[] = [];

    if (!this.isConfigured()) {
      checks.push({
        id: 'sendgrid-config',
        scope: 'sendgrid',
        name: 'Configuration Check',
        status: 'warning',
        message: 'SendGrid credentials not configured (optional)',
      });
      return checks;
    }

    // Check verified domains
    if (this.desiredState.sendgrid?.verifiedDomains) {
      for (const domain of this.desiredState.sendgrid.verifiedDomains) {
        const domainCheck = await this.checkDomain(domain);
        checks.push(domainCheck);
      }
    }

    // Check sender identities
    if (this.desiredState.sendgrid?.senderIdentities) {
      for (const sender of this.desiredState.sendgrid.senderIdentities) {
        const senderCheck = await this.checkSender(sender);
        checks.push(senderCheck);
      }
    }

    return checks;
  }

  private async checkDomain(domain: string): Promise<CheckResult> {
    try {
      const url = `${this.baseUrl}/whitelabel/domains`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        return {
          id: `sendgrid-domain-${domain}`,
          scope: 'sendgrid',
          name: `Domain: ${domain}`,
          status: 'error',
          message: `Failed to check domain: ${response.statusText}`,
        };
      }

      const data = await response.json();
      const domains = data || [];

      const existing = domains.find((d: any) => d.domain === domain);

      if (!existing) {
        return {
          id: `sendgrid-domain-${domain}`,
          scope: 'sendgrid',
          name: `Domain: ${domain}`,
          status: 'fail',
          message: `Domain '${domain}' not configured in SendGrid`,
          suggestedAction: `Add and verify domain in SendGrid dashboard`,
        };
      }

      if (!existing.valid) {
        return {
          id: `sendgrid-domain-${domain}`,
          scope: 'sendgrid',
          name: `Domain: ${domain}`,
          status: 'warning',
          message: `Domain '${domain}' not verified`,
          suggestedAction: `Complete DNS verification for domain`,
        };
      }

      return {
        id: `sendgrid-domain-${domain}`,
        scope: 'sendgrid',
        name: `Domain: ${domain}`,
        status: 'pass',
        message: `Domain '${domain}' verified`,
      };
    } catch (err: any) {
      return {
        id: `sendgrid-domain-${domain}`,
        scope: 'sendgrid',
        name: `Domain: ${domain}`,
        status: 'error',
        message: `Error checking domain: ${err.message}`,
      };
    }
  }

  private async checkSender(sender: any): Promise<CheckResult> {
    try {
      const url = `${this.baseUrl}/verified_senders`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        return {
          id: `sendgrid-sender-${sender.email}`,
          scope: 'sendgrid',
          name: `Sender: ${sender.email}`,
          status: 'error',
          message: `Failed to check sender: ${response.statusText}`,
        };
      }

      const data = await response.json();
      const senders = data.results || [];

      const existing = senders.find((s: any) => s.from_email === sender.email);

      if (!existing) {
        return {
          id: `sendgrid-sender-${sender.email}`,
          scope: 'sendgrid',
          name: `Sender: ${sender.email}`,
          status: 'fail',
          message: `Sender '${sender.email}' not configured`,
          suggestedAction: `Add and verify sender identity in SendGrid dashboard`,
        };
      }

      if (!existing.verified) {
        return {
          id: `sendgrid-sender-${sender.email}`,
          scope: 'sendgrid',
          name: `Sender: ${sender.email}`,
          status: 'warning',
          message: `Sender '${sender.email}' not verified`,
          suggestedAction: `Complete email verification`,
        };
      }

      return {
        id: `sendgrid-sender-${sender.email}`,
        scope: 'sendgrid',
        name: `Sender: ${sender.email}`,
        status: 'pass',
        message: `Sender '${sender.email}' verified`,
      };
    } catch (err: any) {
      return {
        id: `sendgrid-sender-${sender.email}`,
        scope: 'sendgrid',
        name: `Sender: ${sender.email}`,
        status: 'error',
        message: `Error checking sender: ${err.message}`,
      };
    }
  }

  async apply(changeId: string, action: any): Promise<{ success: boolean; message: string }> {
    // SendGrid changes are read-only
    return {
      success: false,
      message: 'SendGrid connector is read-only. Make changes via SendGrid dashboard.',
    };
  }
}
