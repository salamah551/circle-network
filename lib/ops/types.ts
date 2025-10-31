/**
 * Type definitions for AI Ops Control Plane
 */

export type CheckStatus = 'pass' | 'fail' | 'warning' | 'error';
export type ChangeRisk = 'low' | 'medium' | 'high' | 'destructive';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type ChangeMode = 'plan' | 'apply';

export interface CheckResult {
  id: string;
  scope: string;
  name: string;
  status: CheckStatus;
  message: string;
  diff?: string;
  suggestedAction?: string;
  changeId?: string;
  risk?: ChangeRisk;
  requiresApproval?: boolean;
}

export interface AuditReport {
  timestamp: string;
  scope: string[];
  checks: CheckResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    errors: number;
  };
}

export interface Change {
  id: string;
  scope: string;
  type: string;
  description: string;
  risk: ChangeRisk;
  requiresApproval: boolean;
  approvalStatus?: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  actions: ChangeAction[];
}

export interface ChangeAction {
  type: 'sql' | 'api' | 'pr' | 'file';
  description: string;
  payload: any;
}

export interface ApplyResult {
  changeId: string;
  success: boolean;
  message: string;
  prUrl?: string;
  error?: string;
}

export interface DesiredState {
  supabase?: {
    tables?: Array<{
      name: string;
      columns: Array<{
        name: string;
        type: string;
        nullable?: boolean;
        defaultValue?: string;
      }>;
      indices?: Array<{
        name: string;
        columns: string[];
        unique?: boolean;
      }>;
      rlsPolicies?: Array<{
        name: string;
        operation: string;
        using?: string;
        withCheck?: string;
      }>;
    }>;
    storage?: {
      buckets?: Array<{
        name: string;
        public?: boolean;
        fileSizeLimit?: number;
        allowedMimeTypes?: string[];
      }>;
      policies?: Array<{
        name: string;
        bucket: string;
        operation: string;
        using?: string;
      }>;
    };
  };
  vercel?: {
    envVars?: Array<{
      key: string;
      environments: string[];
      required: boolean;
    }>;
    crons?: Array<{
      path: string;
      schedule: string;
    }>;
  };
  stripe?: {
    priceIds?: Array<{
      name: string;
      id: string;
      environment: string;
    }>;
    webhooks?: Array<{
      url: string;
      events: string[];
      environment: string;
    }>;
  };
  github?: {
    requiredLabels?: string[];
    branchProtection?: {
      branch: string;
      requiredReviews?: number;
      requireStatusChecks?: boolean;
    };
  };
  sendgrid?: {
    verifiedDomains?: string[];
    senderIdentities?: Array<{
      email: string;
      name: string;
    }>;
  };
  posthog?: {
    keyPresent: boolean;
  };
}

export interface ChangePolicy {
  approvalRules: {
    [key: string]: {
      requiresApproval: boolean;
      approvers?: string[];
      method?: 'slack' | 'github';
    };
  };
  autoApplyAllowed: {
    supabase?: boolean;
    vercel?: boolean;
    stripe?: boolean;
    github?: boolean;
  };
}

export interface ConnectorConfig {
  supabase?: {
    url: string;
    serviceKey: string;
  };
  vercel?: {
    token: string;
    projectId: string;
    teamId?: string;
  };
  github?: {
    token: string;
    owner: string;
    repo: string;
  };
  stripe?: {
    secretKey: string;
  };
  sendgrid?: {
    apiKey: string;
  };
  posthog?: {
    apiKey: string;
  };
  slack?: {
    token: string;
    signingSecret: string;
  };
}
