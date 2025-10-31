/**
 * Base Connector Interface for AI Ops
 * Defines common interface for all infrastructure connectors
 */

export interface ConnectorConfig {
  [key: string]: any;
}

export interface DiffResult {
  type: 'create' | 'update' | 'delete' | 'no-change';
  resource: string;
  details: any;
  risk: 'low' | 'medium' | 'high';
  requiresApproval?: boolean;
}

export interface PlanResult {
  connector: string;
  diffs: DiffResult[];
  summary: string;
  requiresApproval: boolean;
}

export interface ApplyResult {
  success: boolean;
  applied: number;
  failed: number;
  errors: string[];
  changes: any[];
}

export abstract class BaseConnector {
  protected config: ConnectorConfig;

  constructor(config: ConnectorConfig) {
    this.config = config;
  }

  /**
   * Get current state from the infrastructure
   */
  abstract getCurrentState(): Promise<any>;

  /**
   * Compare desired state with current state
   */
  abstract plan(desiredState: any): Promise<PlanResult>;

  /**
   * Apply changes to infrastructure
   */
  abstract apply(plan: PlanResult, options?: any): Promise<ApplyResult>;

  /**
   * Verify connection and configuration
   */
  abstract verify(): Promise<{ success: boolean; message: string }>;
}
