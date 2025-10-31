/**
 * Base connector interface
 */

import { CheckResult } from '../types';

export abstract class BaseConnector {
  protected config: any;

  constructor(config: any) {
    this.config = config;
  }

  /**
   * Run audit checks for this connector
   */
  abstract audit(): Promise<CheckResult[]>;

  /**
   * Apply a change
   */
  abstract apply(changeId: string, action: any): Promise<{ success: boolean; message: string; prUrl?: string }>;

  /**
   * Verify connector is properly configured
   */
  abstract isConfigured(): boolean;
}
