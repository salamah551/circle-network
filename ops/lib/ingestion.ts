/**
 * Knowledge Ingestion System for AI Ops
 * Ingests documentation, code, and configuration into the ops_knowledge table
 */

import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from './embeddings';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

interface IngestionOptions {
  sourcePaths?: string[];
  sourceTypes?: string[];
  forceReindex?: boolean;
}

interface IngestionResult {
  success: boolean;
  ingested: number;
  updated: number;
  skipped: number;
  errors: string[];
}

interface KnowledgeEntry {
  source_type: string;
  source_path: string;
  content: string;
  metadata: Record<string, any>;
  embedding: number[];
  keywords: string;
  checksum: string;
}

/**
 * Calculate checksum for content change detection
 */
function calculateChecksum(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Generate tsvector keywords from content
 */
function generateKeywords(content: string): string {
  // Simple keyword extraction - remove code blocks and extract meaningful words
  const cleanContent = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/[^\w\s]/g, ' ') // Remove special chars
    .toLowerCase();
  
  return cleanContent;
}

/**
 * Determine source type from file extension
 */
function getSourceType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const typeMap: Record<string, string> = {
    '.md': 'markdown',
    '.mdx': 'markdown',
    '.ts': 'code',
    '.tsx': 'code',
    '.js': 'code',
    '.jsx': 'code',
    '.sql': 'sql',
    '.yaml': 'config',
    '.yml': 'config',
    '.json': 'config',
  };
  
  return typeMap[ext] || 'unknown';
}

/**
 * Extract metadata from file
 */
function extractMetadata(filePath: string, content: string): Record<string, any> {
  const metadata: Record<string, any> = {
    file_extension: path.extname(filePath),
    file_size: content.length,
    line_count: content.split('\n').length,
  };

  // Extract frontmatter from markdown files
  if (filePath.endsWith('.md') || filePath.endsWith('.mdx')) {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      metadata.has_frontmatter = true;
      // Could parse YAML frontmatter here if needed
    }
  }

  // Detect if file is in app directory (route)
  if (filePath.includes('/app/')) {
    metadata.is_route = true;
    metadata.route_path = filePath.split('/app/')[1];
  }

  return metadata;
}

/**
 * Read and parse file content
 */
function readFileContent(filePath: string): string | null {
  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    return fs.readFileSync(fullPath, 'utf-8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

/**
 * Get list of files to ingest
 */
function getFilesToIngest(basePath: string, options: IngestionOptions): string[] {
  const files: string[] = [];
  
  // Define patterns to include
  const includePatterns = [
    '*.md',
    '*.mdx',
    'app/**/*.{ts,tsx,js,jsx}',
    'lib/**/*.{ts,tsx,js,jsx}',
    'components/**/*.{ts,tsx,js,jsx}',
    'supabase/migrations/*.sql',
    'ops/**/*.{ts,yaml,yml}',
  ];

  // Define patterns to exclude
  const excludePatterns = [
    'node_modules/**',
    '.next/**',
    '.git/**',
    '*.test.{ts,tsx,js,jsx}',
    '*.spec.{ts,tsx,js,jsx}',
  ];

  // For now, return a predefined list of important files
  const defaultFiles = [
    'README.md',
    'IMPLEMENTATION-SUMMARY.md',
    'ONBOARDING_IMPLEMENTATION.md',
    'AI_ONBOARDING_IMPLEMENTATION.md',
    'README-DEPLOY-NOTES.md',
    'BULK_INVITES_FIX_SUMMARY.md',
    'CODE_EXAMPLES.md',
    'ops/config/desired_state.yaml',
  ];

  return defaultFiles
    .map(f => path.join(basePath, f))
    .filter(f => fs.existsSync(f));
}

/**
 * Ingest a single file into the knowledge base
 */
async function ingestFile(
  supabase: any,
  filePath: string,
  basePath: string,
  forceReindex: boolean
): Promise<{ success: boolean; action: 'inserted' | 'updated' | 'skipped'; error?: string }> {
  const content = readFileContent(filePath);
  if (!content) {
    return { success: false, action: 'skipped', error: 'Could not read file' };
  }

  const relativePath = path.relative(basePath, filePath);
  const sourceType = getSourceType(filePath);
  const checksum = calculateChecksum(content);
  const metadata = extractMetadata(relativePath, content);

  // Check if file already exists and hasn't changed
  if (!forceReindex) {
    const { data: existing, error: existingError } = await supabase
      .from('ops_knowledge')
      .select('id, checksum')
      .eq('source_path', relativePath)
      .maybeSingle();

    if (!existingError && existing && (existing as any).checksum === checksum) {
      return { success: true, action: 'skipped' };
    }
  }

  try {
    // Generate embedding
    const embedding = await generateEmbedding(content);
    const keywords = generateKeywords(content);

    const entry: KnowledgeEntry = {
      source_type: sourceType,
      source_path: relativePath,
      content,
      metadata,
      embedding,
      keywords,
      checksum,
    };

    // Upsert into database
    const { error } = await (supabase as any)
      .from('ops_knowledge')
      .upsert(entry, {
        onConflict: 'source_path',
      });

    if (error) {
      return { success: false, action: 'skipped', error: error.message };
    }

    return { success: true, action: 'inserted' };
  } catch (error: any) {
    return { success: false, action: 'skipped', error: error.message };
  }
}

/**
 * Main ingestion function
 */
export async function ingestKnowledge(
  basePath: string,
  options: IngestionOptions = {}
): Promise<IngestionResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration missing');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const result: IngestionResult = {
    success: true,
    ingested: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  // Get files to ingest
  const files = getFilesToIngest(basePath, options);

  console.log(`Ingesting ${files.length} files...`);

  // Process files
  for (const file of files) {
    console.log(`Processing: ${file}`);
    const fileResult = await ingestFile(
      supabase,
      file,
      basePath,
      options.forceReindex || false
    );

    if (fileResult.success) {
      if (fileResult.action === 'inserted') {
        result.ingested++;
      } else if (fileResult.action === 'updated') {
        result.updated++;
      } else {
        result.skipped++;
      }
    } else {
      result.errors.push(`${file}: ${fileResult.error}`);
    }
  }

  result.success = result.errors.length === 0;

  return result;
}
