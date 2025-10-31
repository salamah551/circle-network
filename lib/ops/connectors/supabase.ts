/**
 * Supabase connector for auditing and applying changes
 */

import { createClient } from '@supabase/supabase-js';
import { BaseConnector } from './base';
import { CheckResult, CheckStatus } from '../types';

export class SupabaseConnector extends BaseConnector {
  private client: any;

  constructor(config: { url: string; serviceKey: string }, private desiredState: any) {
    super(config);
    if (config.url && config.serviceKey) {
      this.client = createClient(config.url, config.serviceKey);
    }
  }

  isConfigured(): boolean {
    return !!(this.config.url && this.config.serviceKey);
  }

  async audit(): Promise<CheckResult[]> {
    const checks: CheckResult[] = [];

    if (!this.isConfigured()) {
      checks.push({
        id: 'supabase-config',
        scope: 'supabase',
        name: 'Configuration Check',
        status: 'error',
        message: 'Supabase credentials not configured',
      });
      return checks;
    }

    // Check tables
    if (this.desiredState.supabase?.tables) {
      for (const table of this.desiredState.supabase.tables) {
        const tableCheck = await this.checkTable(table);
        checks.push(...tableCheck);
      }
    }

    // Check storage buckets
    if (this.desiredState.supabase?.storage?.buckets) {
      for (const bucket of this.desiredState.supabase.storage.buckets) {
        const bucketCheck = await this.checkStorageBucket(bucket);
        checks.push(bucketCheck);
      }
    }

    return checks;
  }

  private async checkTable(table: any): Promise<CheckResult[]> {
    const checks: CheckResult[] = [];

    try {
      // Check if table exists by querying it
      const { data, error } = await this.client
        .from(table.name)
        .select('*')
        .limit(1);

      if (error && error.message.includes('does not exist')) {
        checks.push({
          id: `supabase-table-${table.name}`,
          scope: 'supabase',
          name: `Table: ${table.name}`,
          status: 'fail',
          message: `Table '${table.name}' does not exist`,
          suggestedAction: `Create table '${table.name}' with specified columns`,
          changeId: `supabase.table.create.${table.name}`,
          risk: 'high',
          requiresApproval: true,
        });
      } else if (!error) {
        checks.push({
          id: `supabase-table-${table.name}`,
          scope: 'supabase',
          name: `Table: ${table.name}`,
          status: 'pass',
          message: `Table '${table.name}' exists`,
        });

        // Check columns (requires more detailed schema query)
        // This is simplified - in production would use pg_catalog queries
        checks.push({
          id: `supabase-table-${table.name}-columns`,
          scope: 'supabase',
          name: `Table Columns: ${table.name}`,
          status: 'warning',
          message: `Column verification requires detailed schema access`,
        });
      }
    } catch (err: any) {
      checks.push({
        id: `supabase-table-${table.name}`,
        scope: 'supabase',
        name: `Table: ${table.name}`,
        status: 'error',
        message: `Error checking table: ${err.message}`,
      });
    }

    return checks;
  }

  private async checkStorageBucket(bucket: any): Promise<CheckResult> {
    try {
      const { data, error } = await this.client.storage.getBucket(bucket.name);

      if (error && error.message.includes('not found')) {
        return {
          id: `supabase-bucket-${bucket.name}`,
          scope: 'supabase',
          name: `Storage Bucket: ${bucket.name}`,
          status: 'fail',
          message: `Bucket '${bucket.name}' does not exist`,
          suggestedAction: `Create storage bucket '${bucket.name}'`,
          changeId: `supabase.storage.bucket.create.${bucket.name}`,
          risk: 'low',
          requiresApproval: false,
        };
      } else if (data) {
        return {
          id: `supabase-bucket-${bucket.name}`,
          scope: 'supabase',
          name: `Storage Bucket: ${bucket.name}`,
          status: 'pass',
          message: `Bucket '${bucket.name}' exists`,
        };
      } else {
        return {
          id: `supabase-bucket-${bucket.name}`,
          scope: 'supabase',
          name: `Storage Bucket: ${bucket.name}`,
          status: 'error',
          message: `Error checking bucket: ${error?.message || 'Unknown error'}`,
        };
      }
    } catch (err: any) {
      return {
        id: `supabase-bucket-${bucket.name}`,
        scope: 'supabase',
        name: `Storage Bucket: ${bucket.name}`,
        status: 'error',
        message: `Error checking bucket: ${err.message}`,
      };
    }
  }

  async apply(changeId: string, action: any): Promise<{ success: boolean; message: string; prUrl?: string }> {
    // Parse changeId to determine action type
    const parts = changeId.split('.');
    const actionType = parts[2]; // e.g., 'create', 'update', 'delete'
    const resourceType = parts[1]; // e.g., 'table', 'bucket'

    if (resourceType === 'storage' && actionType === 'bucket' && parts[3] === 'create') {
      return this.createStorageBucket(action);
    }

    // For DB changes, generate migration file instead of direct apply
    if (resourceType === 'table') {
      return {
        success: false,
        message: 'Database changes require PR-based migration. Use PR generation instead.',
      };
    }

    return {
      success: false,
      message: `Unsupported change type: ${changeId}`,
    };
  }

  private async createStorageBucket(action: any): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await this.client.storage.createBucket(action.name, {
        public: action.public || false,
        fileSizeLimit: action.fileSizeLimit || 52428800, // 50MB default
        allowedMimeTypes: action.allowedMimeTypes,
      });

      if (error) {
        return {
          success: false,
          message: `Failed to create bucket: ${error.message}`,
        };
      }

      return {
        success: true,
        message: `Storage bucket '${action.name}' created successfully`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Error creating bucket: ${err.message}`,
      };
    }
  }
}
