// lib/ops/knowledge-ingest.js
// Knowledge ingestion for AI Ops Control Plane

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { generateEmbedding, generateEmbeddings } from './embeddings.js';

// Priority documents to ingest
const PRIORITY_DOCS = [
  'IMPLEMENTATION-SUMMARY.md',
  'ONBOARDING_IMPLEMENTATION.md',
  'AI_ONBOARDING_IMPLEMENTATION.md',
  'README-DEPLOY-NOTES.md',
  'BULK_INVITES_FIX_SUMMARY.md',
  'CODE_EXAMPLES.md',
  'BriefPoint_Build_Spec_v1.md'
];

/**
 * Get Supabase client for ops operations
 */
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase credentials not configured');
  }
  
  return createClient(url, key);
}

/**
 * Calculate hash of content for change detection
 */
function calculateHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Split large content into chunks for embedding
 * @param {string} content - Content to split
 * @param {number} maxChunkSize - Maximum chunk size in characters (default 8000 for text-embedding-3-large)
 * @returns {string[]} - Array of content chunks
 */
function splitIntoChunks(content, maxChunkSize = parseInt(process.env.OPS_MAX_CHUNK_SIZE || '8000', 10)) {
  const chunks = [];
  
  // Try to split on paragraph boundaries
  const paragraphs = content.split(/\n\n+/);
  let currentChunk = '';
  
  for (const para of paragraphs) {
    if (currentChunk.length + para.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

/**
 * Ingest a single file into the knowledge base
 * @param {string} filePath - Path to the file
 * @param {string} sourceType - Type of source (code, markdown, config)
 * @returns {Promise<{success: boolean, chunks: number, path: string}>}
 */
export async function ingestFile(filePath, sourceType = 'markdown') {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const hash = calculateHash(content);
    const supabase = getSupabaseClient();
    
    // Check if file already exists with same hash
    const { data: existing } = await supabase
      .from('ops_knowledge')
      .select('id, source_hash')
      .eq('source_path', filePath)
      .single();
    
    if (existing && existing.source_hash === hash) {
      console.log(`Skipping ${filePath} - no changes detected`);
      return { success: true, chunks: 0, path: filePath, skipped: true };
    }
    
    // Delete old entries for this file
    if (existing) {
      await supabase
        .from('ops_knowledge')
        .delete()
        .eq('source_path', filePath);
    }
    
    // Split content into chunks
    const chunks = splitIntoChunks(content);
    console.log(`Processing ${filePath}: ${chunks.length} chunks`);
    
    // Generate embeddings for all chunks
    const embeddings = await generateEmbeddings(chunks);
    
    // Insert chunks with embeddings
    const records = chunks.map((chunk, index) => ({
      content: chunk,
      embedding: embeddings[index],
      source_type: sourceType,
      source_path: filePath,
      source_hash: hash,
      chunk_index: index,
      metadata: {
        file_name: path.basename(filePath),
        file_ext: path.extname(filePath),
        chunk_count: chunks.length,
        priority: PRIORITY_DOCS.some(doc => filePath.includes(doc))
      }
    }));
    
    const { error } = await supabase
      .from('ops_knowledge')
      .insert(records);
    
    if (error) {
      throw error;
    }
    
    console.log(`Ingested ${filePath}: ${chunks.length} chunks`);
    return { success: true, chunks: chunks.length, path: filePath };
    
  } catch (error) {
    console.error(`Error ingesting ${filePath}:`, error);
    return { success: false, error: error.message, path: filePath };
  }
}

/**
 * Find all markdown files in the repository
 * @param {string} rootDir - Root directory to search
 * @param {string[]} excludeDirs - Directories to exclude
 * @returns {string[]} - Array of markdown file paths
 */
function findMarkdownFiles(rootDir, excludeDirs = ['node_modules', '.next', '.git', 'archive']) {
  const files = [];
  
  function traverse(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!excludeDirs.includes(entry.name)) {
          traverse(fullPath);
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(rootDir);
  return files;
}

/**
 * Find code files (JS, TS, JSX, TSX) in specific directories
 * @param {string} rootDir - Root directory to search
 * @returns {string[]} - Array of code file paths
 */
function findCodeFiles(rootDir) {
  const files = [];
  const codeDirs = ['app', 'lib', 'components'];
  const extensions = ['.js', '.ts', '.jsx', '.tsx'];
  
  function traverse(dir) {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  for (const dir of codeDirs) {
    const fullDir = path.join(rootDir, dir);
    traverse(fullDir);
  }
  
  return files;
}

/**
 * Ingest all documentation and code into the knowledge base
 * @param {Object} options - Ingestion options
 * @param {boolean} options.includeCode - Include code files
 * @param {boolean} options.includeMarkdown - Include markdown files
 * @param {boolean} options.priorityOnly - Only ingest priority documents
 * @returns {Promise<{success: number, failed: number, skipped: number, results: Array}>}
 */
export async function ingestAll(options = {}) {
  const {
    includeCode = false,
    includeMarkdown = true,
    priorityOnly = false
  } = options;
  
  const rootDir = process.cwd();
  let filesToIngest = [];
  
  // Collect markdown files
  if (includeMarkdown) {
    const allMarkdownFiles = findMarkdownFiles(rootDir);
    
    if (priorityOnly) {
      // Only ingest priority documents
      filesToIngest = allMarkdownFiles.filter(file =>
        PRIORITY_DOCS.some(doc => file.includes(doc))
      );
    } else {
      filesToIngest = allMarkdownFiles;
    }
  }
  
  // Collect code files
  if (includeCode && !priorityOnly) {
    const codeFiles = findCodeFiles(rootDir);
    filesToIngest.push(...codeFiles);
  }
  
  console.log(`Found ${filesToIngest.length} files to ingest`);
  
  // Ingest files
  const results = [];
  let successCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  
  for (const file of filesToIngest) {
    const sourceType = file.endsWith('.md') ? 'markdown' : 'code';
    const result = await ingestFile(file, sourceType);
    
    if (result.success) {
      if (result.skipped) {
        skippedCount++;
      } else {
        successCount++;
      }
    } else {
      failedCount++;
    }
    
    results.push(result);
  }
  
  return {
    success: successCount,
    failed: failedCount,
    skipped: skippedCount,
    total: filesToIngest.length,
    results
  };
}

/**
 * Search the knowledge base using vector similarity
 * @param {string} query - Search query
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array>} - Array of relevant documents with similarity scores
 */
export async function searchKnowledge(query, limit = 5) {
  try {
    const supabase = getSupabaseClient();
    
    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);
    
    // Search using cosine similarity
    // Note: Supabase pgvector syntax
    const { data, error } = await supabase.rpc('match_ops_knowledge', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: limit
    });
    
    if (error) {
      // If RPC function doesn't exist, fall back to basic search
      console.warn('RPC function not found, using basic search');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('ops_knowledge')
        .select('*')
        .limit(limit);
      
      if (fallbackError) throw fallbackError;
      return fallbackData || [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    throw error;
  }
}
