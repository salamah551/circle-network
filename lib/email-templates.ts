/**
 * Email Template Loader
 * 
 * Reads markdown templates from /emails directory and provides
 * utilities to load and parse them for sending.
 * 
 * This is a helper utility only - does not change the current sending engine.
 */

import fs from 'fs';
import path from 'path';

export interface EmailTemplate {
  subject: string;
  audience: string;
  purpose: string;
  variant: string;
  variables: string[];
  content: string;
}

/**
 * Load an email template from the /emails directory
 * @param filename - Name of the template file (without extension)
 * @returns Parsed template with frontmatter and content
 */
export function loadEmailTemplate(filename: string): EmailTemplate | null {
  try {
    const emailsDir = path.join(process.cwd(), 'emails');
    const filePath = path.join(emailsDir, `${filename}.md`);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`Email template not found: ${filename}.md`);
      return null;
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Parse YAML frontmatter
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = fileContent.match(frontmatterRegex);
    
    if (!match) {
      console.warn(`Invalid template format: ${filename}.md`);
      return null;
    }
    
    const [, frontmatter, content] = match;
    
    // Parse frontmatter (simple YAML parser for our use case)
    const metadata: any = {};
    const lines = frontmatter.split('\n');
    let currentKey = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      if (trimmed.startsWith('-')) {
        // Array item
        if (currentKey === 'variables') {
          if (!metadata.variables) metadata.variables = [];
          metadata.variables.push(trimmed.substring(1).trim());
        }
      } else if (trimmed.includes(':')) {
        // Key-value pair
        const [key, ...valueParts] = trimmed.split(':');
        const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
        currentKey = key.trim();
        metadata[currentKey] = value;
      }
    }
    
    return {
      subject: metadata.subject || '',
      audience: metadata.audience || '',
      purpose: metadata.purpose || '',
      variant: metadata.variant || 'A',
      variables: metadata.variables || [],
      content: content.trim()
    };
  } catch (error) {
    console.error(`Error loading email template ${filename}:`, error);
    return null;
  }
}

/**
 * Replace variables in template content
 * @param content - Template content with {{variable}} placeholders
 * @param variables - Object with variable values
 * @returns Content with variables replaced
 */
export function replaceVariables(content: string, variables: Record<string, string>): string {
  let result = content;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value || '');
  }
  
  return result;
}

/**
 * Get all available email templates
 * @returns Array of template filenames (without extension)
 */
export function listEmailTemplates(): string[] {
  try {
    const emailsDir = path.join(process.cwd(), 'emails');
    
    if (!fs.existsSync(emailsDir)) {
      return [];
    }
    
    return fs
      .readdirSync(emailsDir)
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace('.md', ''));
  } catch (error) {
    console.error('Error listing email templates:', error);
    return [];
  }
}

/**
 * Get template name based on launch phase and sequence stage
 * @param phase - 'founding' or 'standard'
 * @param stage - Sequence stage (0-3)
 * @returns Template filename
 */
export function getTemplateForPhaseAndStage(phase: 'founding' | 'standard', stage: number): string {
  const templates = {
    founding: [
      'founding-member-1-intrigue',
      'founding-member-2-value',
      'founding-member-3-trust',
      'founding-member-4-urgency'
    ],
    standard: [
      'standard-member-1-invitation',
      'standard-member-2-proof',
      'standard-member-3-tiers',
      'standard-member-4-final-call'
    ]
  };
  
  const phaseTemplates = templates[phase] || templates.standard;
  return phaseTemplates[Math.min(stage, phaseTemplates.length - 1)];
}
