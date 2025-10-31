/**
 * Stripe Connector for AI Ops
 * Verifies Stripe configuration (read-only by default)
 */

import { BaseConnector, PlanResult, DiffResult, ApplyResult, ConnectorConfig } from './base';
import Stripe from 'stripe';

export class StripeConnector extends BaseConnector {
  private stripe: Stripe | null = null;

  constructor(config: ConnectorConfig) {
    super(config);
    
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (apiKey) {
      this.stripe = new Stripe(apiKey, {
        apiVersion: '2025-08-27.basil',
      });
    }
  }

  async verify(): Promise<{ success: boolean; message: string }> {
    if (!this.stripe) {
      return { success: false, message: 'STRIPE_SECRET_KEY not configured' };
    }

    try {
      await this.stripe.products.list({ limit: 1 });
      return { success: true, message: 'Stripe connection verified' };
    } catch (error: any) {
      return { success: false, message: `Stripe API error: ${error.message}` };
    }
  }

  async getCurrentState(): Promise<any> {
    if (!this.stripe) {
      return { products: [], prices: [], webhooks: [] };
    }

    try {
      const [products, prices, webhooks] = await Promise.all([
        this.stripe.products.list({ limit: 100 }),
        this.stripe.prices.list({ limit: 100 }),
        this.stripe.webhookEndpoints.list({ limit: 100 }),
      ]);

      return {
        products: products.data,
        prices: prices.data,
        webhooks: webhooks.data,
      };
    } catch (error) {
      console.error('Error getting Stripe state:', error);
      return { products: [], prices: [], webhooks: [] };
    }
  }

  async plan(desiredState: any): Promise<PlanResult> {
    const diffs: DiffResult[] = [];
    const currentState = await this.getCurrentState();

    // Check for required products
    if (desiredState.stripe?.products) {
      for (const desiredProduct of desiredState.stripe.products) {
        const exists = currentState.products.find(
          (p: Stripe.Product) => p.name.toLowerCase() === desiredProduct.name.toLowerCase()
        );

        if (!exists) {
          diffs.push({
            type: 'create',
            resource: `product:${desiredProduct.id}`,
            details: {
              name: desiredProduct.name,
              prices: desiredProduct.prices,
            },
            risk: 'high',
            requiresApproval: true,
          });
        } else {
          // Check for missing prices
          for (const desiredPrice of desiredProduct.prices) {
            const priceExists = currentState.prices.find(
              (p: Stripe.Price) => 
                p.product === exists.id &&
                p.unit_amount === desiredPrice.amount &&
                p.recurring?.interval === desiredPrice.interval
            );

            if (!priceExists) {
              diffs.push({
                type: 'create',
                resource: `price:${desiredProduct.id}:${desiredPrice.interval}`,
                details: {
                  product: desiredProduct.name,
                  amount: desiredPrice.amount,
                  interval: desiredPrice.interval,
                },
                risk: 'high',
                requiresApproval: true,
              });
            }
          }
        }
      }
    }

    // Check webhook endpoints
    if (desiredState.stripe?.webhooks) {
      for (const desiredWebhook of desiredState.stripe.webhooks) {
        const exists = currentState.webhooks.find(
          (w: Stripe.WebhookEndpoint) => w.url.includes(desiredWebhook.endpoint)
        );

        if (!exists) {
          diffs.push({
            type: 'create',
            resource: `webhook:${desiredWebhook.endpoint}`,
            details: {
              endpoint: desiredWebhook.endpoint,
              events: desiredWebhook.events,
            },
            risk: 'medium',
            requiresApproval: true,
          });
        }
      }
    }

    return {
      connector: 'stripe',
      diffs,
      summary: `Found ${diffs.length} differences in Stripe configuration`,
      requiresApproval: diffs.some(d => d.requiresApproval),
    };
  }

  async apply(plan: PlanResult, options?: any): Promise<ApplyResult> {
    const result: ApplyResult = {
      success: false,
      applied: 0,
      failed: 0,
      errors: ['Stripe changes are read-only by default for safety'],
      changes: [],
    };

    // Generate documentation for manual setup
    for (const diff of plan.diffs) {
      result.changes.push({
        type: 'documentation_required',
        diff,
        message: 'Create products and prices manually in Stripe Dashboard',
      });
    }

    return result;
  }
}
