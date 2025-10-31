/**
 * Storage Connector for AI Ops
 * Manages Supabase Storage buckets and policies
 */

import { createClient } from '@supabase/supabase-js';
import { BaseConnector, PlanResult, DiffResult, ApplyResult, ConnectorConfig } from './base';

export class StorageConnector extends BaseConnector {
  private supabase: ReturnType<typeof createClient>;

  constructor(config: ConnectorConfig) {
    super(config);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  async verify(): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await this.supabase.storage.listBuckets();

      if (error) {
        return { success: false, message: `Storage connection failed: ${error.message}` };
      }

      return { success: true, message: 'Storage connection verified' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async getCurrentState(): Promise<any> {
    const { data: buckets } = await this.supabase.storage.listBuckets();

    const state: any = {
      buckets: buckets?.map(b => ({
        name: b.name,
        public: b.public,
        file_size_limit: b.file_size_limit,
      })) || [],
    };

    return state;
  }

  async plan(desiredState: any): Promise<PlanResult> {
    const diffs: DiffResult[] = [];
    const currentState = await this.getCurrentState();

    if (desiredState.storage?.buckets) {
      for (const desiredBucket of desiredState.storage.buckets) {
        const exists = currentState.buckets.find((b: any) => b.name === desiredBucket.name);

        if (!exists) {
          diffs.push({
            type: 'create',
            resource: `bucket:${desiredBucket.name}`,
            details: {
              name: desiredBucket.name,
              public: desiredBucket.public,
              file_size_limit_mb: desiredBucket.file_size_limit_mb,
            },
            risk: 'low',
            requiresApproval: false,
          });
        } else {
          // Check for configuration differences
          if (exists.public !== desiredBucket.public) {
            diffs.push({
              type: 'update',
              resource: `bucket:${desiredBucket.name}`,
              details: {
                action: 'update_public_setting',
                current: exists.public,
                desired: desiredBucket.public,
              },
              risk: 'high',
              requiresApproval: true,
            });
          }
        }
      }
    }

    return {
      connector: 'storage',
      diffs,
      summary: `Found ${diffs.length} differences in Storage buckets`,
      requiresApproval: diffs.some(d => d.requiresApproval),
    };
  }

  async apply(plan: PlanResult, options?: any): Promise<ApplyResult> {
    const result: ApplyResult = {
      success: true,
      applied: 0,
      failed: 0,
      errors: [],
      changes: [],
    };

    const allowDirectApply = process.env.OPS_ALLOW_DIRECT_APPLY === 'true';

    if (!allowDirectApply) {
      result.errors.push('Direct apply disabled. Manual bucket creation required.');
      result.success = false;
      return result;
    }

    for (const diff of plan.diffs) {
      try {
        if (diff.type === 'create' && diff.resource.startsWith('bucket:')) {
          const { name, public: isPublic, file_size_limit_mb } = diff.details;
          
          const { data, error } = await this.supabase.storage.createBucket(name, {
            public: isPublic,
            fileSizeLimit: file_size_limit_mb ? file_size_limit_mb * 1024 * 1024 : undefined,
          });

          if (error) throw error;

          result.changes.push({
            type: 'bucket_created',
            bucket: name,
          });
          result.applied++;
        }
      } catch (error: any) {
        result.errors.push(`Failed to apply ${diff.resource}: ${error.message}`);
        result.failed++;
        result.success = false;
      }
    }

    return result;
  }
}
