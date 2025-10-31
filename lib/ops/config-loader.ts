/**
 * Configuration loader for ops control plane
 */

import * as yaml from 'yaml';
import * as fs from 'fs';
import * as path from 'path';
import { DesiredState, ChangePolicy, ConnectorConfig } from './types';

/**
 * Load desired state from YAML file
 */
export function loadDesiredState(filePath?: string): DesiredState {
  const configPath = filePath || path.join(process.cwd(), 'ops', 'desired-state.yaml');
  
  try {
    const fileContent = fs.readFileSync(configPath, 'utf-8');
    return yaml.parse(fileContent) as DesiredState;
  } catch (error: any) {
    console.error('Error loading desired state:', error.message);
    throw new Error(`Failed to load desired state from ${configPath}: ${error.message}`);
  }
}

/**
 * Load change policy from YAML file
 */
export function loadChangePolicy(filePath?: string): ChangePolicy {
  const configPath = filePath || path.join(process.cwd(), 'ops', 'change-policy.yaml');
  
  try {
    const fileContent = fs.readFileSync(configPath, 'utf-8');
    return yaml.parse(fileContent) as ChangePolicy;
  } catch (error: any) {
    console.error('Error loading change policy:', error.message);
    throw new Error(`Failed to load change policy from ${configPath}: ${error.message}`);
  }
}

/**
 * Load connector configuration from environment variables
 */
export function loadConnectorConfig(): ConnectorConfig {
  const config: ConnectorConfig = {};

  // Supabase
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    config.supabase = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    };
  }

  // Vercel
  if (process.env.OPS_VERCEL_TOKEN && process.env.OPS_VERCEL_PROJECT_ID) {
    config.vercel = {
      token: process.env.OPS_VERCEL_TOKEN,
      projectId: process.env.OPS_VERCEL_PROJECT_ID,
      teamId: process.env.OPS_VERCEL_TEAM_ID,
    };
  }

  // GitHub
  if (process.env.OPS_GITHUB_TOKEN && process.env.OPS_GITHUB_OWNER && process.env.OPS_GITHUB_REPO) {
    config.github = {
      token: process.env.OPS_GITHUB_TOKEN,
      owner: process.env.OPS_GITHUB_OWNER,
      repo: process.env.OPS_GITHUB_REPO,
    };
  }

  // Stripe
  if (process.env.STRIPE_SECRET_KEY) {
    config.stripe = {
      secretKey: process.env.STRIPE_SECRET_KEY,
    };
  }

  // SendGrid
  if (process.env.SENDGRID_API_KEY) {
    config.sendgrid = {
      apiKey: process.env.SENDGRID_API_KEY,
    };
  }

  // PostHog
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    config.posthog = {
      apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    };
  }

  // Slack
  if (process.env.OPS_SLACK_TOKEN && process.env.OPS_SLACK_SIGNING_SECRET) {
    config.slack = {
      token: process.env.OPS_SLACK_TOKEN,
      signingSecret: process.env.OPS_SLACK_SIGNING_SECRET,
    };
  }

  return config;
}

/**
 * Verify ops secret for API authentication
 */
export function verifyOpsSecret(providedSecret: string): boolean {
  const opsSecret = process.env.OPS_SECRET || process.env.CRON_SECRET;
  
  if (!opsSecret) {
    console.warn('OPS_SECRET not configured - ops endpoints are unprotected!');
    return false;
  }

  return providedSecret === opsSecret;
}
