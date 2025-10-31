/**
 * Stripe connector for auditing prices and webhooks (read-only)
 */

import { BaseConnector } from './base';
import { CheckResult } from '../types';

export class StripeConnector extends BaseConnector {
  private secretKey: string;
  private baseUrl = 'https://api.stripe.com/v1';

  constructor(config: { secretKey: string }, private desiredState: any) {
    super(config);
    this.secretKey = config.secretKey;
  }

  isConfigured(): boolean {
    return !!this.secretKey;
  }

  async audit(): Promise<CheckResult[]> {
    const checks: CheckResult[] = [];

    if (!this.isConfigured()) {
      checks.push({
        id: 'stripe-config',
        scope: 'stripe',
        name: 'Configuration Check',
        status: 'error',
        message: 'Stripe credentials not configured',
      });
      return checks;
    }

    // Check price IDs
    if (this.desiredState.stripe?.priceIds) {
      for (const price of this.desiredState.stripe.priceIds) {
        const priceCheck = await this.checkPrice(price);
        checks.push(priceCheck);
      }
    }

    // Check webhooks
    if (this.desiredState.stripe?.webhooks) {
      for (const webhook of this.desiredState.stripe.webhooks) {
        const webhookCheck = await this.checkWebhook(webhook);
        checks.push(webhookCheck);
      }
    }

    return checks;
  }

  private async checkPrice(price: any): Promise<CheckResult> {
    try {
      const url = `${this.baseUrl}/prices/${price.id}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      });

      if (response.status === 404) {
        return {
          id: `stripe-price-${price.name}`,
          scope: 'stripe',
          name: `Price: ${price.name}`,
          status: 'fail',
          message: `Price ID '${price.id}' not found in Stripe`,
          suggestedAction: `Verify price ID or create new price in Stripe dashboard`,
        };
      } else if (!response.ok) {
        return {
          id: `stripe-price-${price.name}`,
          scope: 'stripe',
          name: `Price: ${price.name}`,
          status: 'error',
          message: `Failed to check price: ${response.statusText}`,
        };
      }

      const data = await response.json();

      return {
        id: `stripe-price-${price.name}`,
        scope: 'stripe',
        name: `Price: ${price.name}`,
        status: 'pass',
        message: `Price '${price.name}' exists (${data.currency} ${(data.unit_amount / 100).toFixed(2)})`,
      };
    } catch (err: any) {
      return {
        id: `stripe-price-${price.name}`,
        scope: 'stripe',
        name: `Price: ${price.name}`,
        status: 'error',
        message: `Error checking price: ${err.message}`,
      };
    }
  }

  private async checkWebhook(webhook: any): Promise<CheckResult> {
    try {
      const url = `${this.baseUrl}/webhook_endpoints`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      });

      if (!response.ok) {
        return {
          id: `stripe-webhook-${webhook.url}`,
          scope: 'stripe',
          name: `Webhook: ${webhook.url}`,
          status: 'error',
          message: `Failed to list webhooks: ${response.statusText}`,
        };
      }

      const data = await response.json();
      const webhooks = data.data || [];

      const existing = webhooks.find((w: any) => w.url === webhook.url);

      if (!existing) {
        return {
          id: `stripe-webhook-${webhook.url}`,
          scope: 'stripe',
          name: `Webhook: ${webhook.url}`,
          status: 'fail',
          message: `Webhook for '${webhook.url}' not found`,
          suggestedAction: `Create webhook in Stripe dashboard with events: ${webhook.events.join(', ')}`,
        };
      }

      // Check if all required events are enabled
      const missingEvents = webhook.events.filter((event: string) => 
        !existing.enabled_events.includes(event)
      );

      if (missingEvents.length > 0) {
        return {
          id: `stripe-webhook-${webhook.url}`,
          scope: 'stripe',
          name: `Webhook: ${webhook.url}`,
          status: 'warning',
          message: `Missing events: ${missingEvents.join(', ')}`,
          suggestedAction: `Update webhook to include missing events`,
        };
      }

      return {
        id: `stripe-webhook-${webhook.url}`,
        scope: 'stripe',
        name: `Webhook: ${webhook.url}`,
        status: 'pass',
        message: `Webhook configured correctly with ${existing.enabled_events.length} events`,
      };
    } catch (err: any) {
      return {
        id: `stripe-webhook-${webhook.url}`,
        scope: 'stripe',
        name: `Webhook: ${webhook.url}`,
        status: 'error',
        message: `Error checking webhook: ${err.message}`,
      };
    }
  }

  async apply(changeId: string, action: any): Promise<{ success: boolean; message: string }> {
    // Stripe changes are read-only
    return {
      success: false,
      message: 'Stripe connector is read-only. Make changes via Stripe dashboard.',
    };
  }
}
