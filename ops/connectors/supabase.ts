/**
 * Supabase Connector for AI Ops
 * Manages database schema, RLS policies, and migrations
 */

import { createClient } from '@supabase/supabase-js';
import { BaseConnector, PlanResult, DiffResult, ApplyResult, ConnectorConfig } from './base';
import * as fs from 'fs';
import * as path from 'path';

interface TableSchema {
  name: string;
  columns: ColumnSchema[];
  indexes: IndexSchema[];
  rlsPolicies: RLSPolicy[];
}

interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  default?: string;
}

interface IndexSchema {
  name: string;
  columns: string[];
  unique: boolean;
}

interface RLSPolicy {
  name: string;
  table: string;
  operation: string;
  check?: string;
  using?: string;
}

export class SupabaseConnector extends BaseConnector {
  private supabase: ReturnType<typeof createClient>;

  constructor(config: ConnectorConfig) {
    super(config);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  async verify(): Promise<{ success: boolean; message: string }> {
    try {
      // Test connection by querying system tables
      const { data, error } = await this.supabase
        .from('information_schema.tables')
        .select('table_name')
        .limit(1);

      if (error) {
        return { success: false, message: `Connection failed: ${error.message}` };
      }

      return { success: true, message: 'Supabase connection verified' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async getCurrentState(): Promise<any> {
    const state: any = {
      tables: {},
      rlsPolicies: {},
    };

    try {
      // Get all tables
      const { data: tables } = await this.supabase
        .rpc('get_tables_info')
        .select('*');

      // For now, return a simplified state
      // In production, this would query information_schema extensively
      return state;
    } catch (error) {
      console.error('Error getting current state:', error);
      return state;
    }
  }

  async plan(desiredState: any): Promise<PlanResult> {
    const diffs: DiffResult[] = [];
    const currentState = await this.getCurrentState();

    // Check required tables
    if (desiredState.database?.tables) {
      for (const table of desiredState.database.tables) {
        const exists = await this.tableExists(table.name);
        
        if (!exists) {
          diffs.push({
            type: 'create',
            resource: `table:${table.name}`,
            details: {
              name: table.name,
              columns: table.required_columns,
              description: table.description,
            },
            risk: 'medium',
            requiresApproval: true,
          });
        } else {
          // Check for missing columns
          const missingColumns = await this.getMissingColumns(table.name, table.required_columns);
          if (missingColumns.length > 0) {
            diffs.push({
              type: 'update',
              resource: `table:${table.name}`,
              details: {
                action: 'add_columns',
                columns: missingColumns,
              },
              risk: 'low',
              requiresApproval: false,
            });
          }
        }
      }
    }

    const requiresApproval = diffs.some(d => d.requiresApproval);

    return {
      connector: 'supabase',
      diffs,
      summary: `Found ${diffs.length} differences in Supabase schema`,
      requiresApproval,
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
      // Generate migration files instead of applying directly
      for (const diff of plan.diffs) {
        try {
          const migration = this.generateMigration(diff);
          const filename = this.saveMigration(migration);
          result.changes.push({
            type: 'migration_generated',
            file: filename,
            diff,
          });
          result.applied++;
        } catch (error: any) {
          result.errors.push(`Failed to generate migration: ${error.message}`);
          result.failed++;
        }
      }
    } else {
      // Apply directly (dangerous!)
      for (const diff of plan.diffs) {
        try {
          await this.applyDiff(diff);
          result.changes.push({
            type: 'applied_directly',
            diff,
          });
          result.applied++;
        } catch (error: any) {
          result.errors.push(`Failed to apply ${diff.resource}: ${error.message}`);
          result.failed++;
          result.success = false;
        }
      }
    }

    return result;
  }

  private async tableExists(tableName: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from(tableName)
      .select('*')
      .limit(0);

    return !error || !error.message.includes('does not exist');
  }

  private async getMissingColumns(tableName: string, requiredColumns: string[]): Promise<string[]> {
    // This would query information_schema.columns in production
    // For now, return empty array
    return [];
  }

  private generateMigration(diff: DiffResult): string {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14);
    let sql = `-- Generated by AI Ops\n`;
    sql += `-- Type: ${diff.type}\n`;
    sql += `-- Resource: ${diff.resource}\n\n`;

    if (diff.type === 'create' && diff.resource.startsWith('table:')) {
      const tableName = diff.resource.split(':')[1];
      sql += `-- TODO: Create table ${tableName}\n`;
      sql += `-- This is a placeholder. Review and complete the migration.\n`;
    } else if (diff.type === 'update') {
      sql += `-- TODO: Update ${diff.resource}\n`;
      sql += `-- Details: ${JSON.stringify(diff.details, null, 2)}\n`;
    }

    return sql;
  }

  private saveMigration(sql: string): string {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15).replace('T', '_');
    const filename = `${timestamp}_ops_generated.sql`;
    const migrationsPath = path.join(process.cwd(), 'supabase', 'migrations');
    const filePath = path.join(migrationsPath, filename);

    fs.writeFileSync(filePath, sql, 'utf-8');

    return filename;
  }

  private async applyDiff(diff: DiffResult): Promise<void> {
    // This would execute SQL directly
    // Only enabled when OPS_ALLOW_DIRECT_APPLY=true
    throw new Error('Direct apply not yet implemented');
  }
}
