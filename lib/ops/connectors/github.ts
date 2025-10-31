/**
 * GitHub connector for auditing and applying repository configuration
 */

import { BaseConnector } from './base';
import { CheckResult } from '../types';

export class GitHubConnector extends BaseConnector {
  private token: string;
  private owner: string;
  private repo: string;
  private baseUrl = 'https://api.github.com';

  constructor(config: { token: string; owner: string; repo: string }, private desiredState: any) {
    super(config);
    this.token = config.token;
    this.owner = config.owner;
    this.repo = config.repo;
  }

  isConfigured(): boolean {
    return !!(this.token && this.owner && this.repo);
  }

  async audit(): Promise<CheckResult[]> {
    const checks: CheckResult[] = [];

    if (!this.isConfigured()) {
      checks.push({
        id: 'github-config',
        scope: 'github',
        name: 'Configuration Check',
        status: 'error',
        message: 'GitHub credentials not configured',
      });
      return checks;
    }

    // Check labels
    if (this.desiredState.github?.requiredLabels) {
      for (const label of this.desiredState.github.requiredLabels) {
        const labelCheck = await this.checkLabel(label);
        checks.push(labelCheck);
      }
    }

    // Check branch protection
    if (this.desiredState.github?.branchProtection) {
      const protectionCheck = await this.checkBranchProtection(this.desiredState.github.branchProtection);
      checks.push(protectionCheck);
    }

    return checks;
  }

  private async checkLabel(label: string): Promise<CheckResult> {
    try {
      const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/labels/${label}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/vnd.github+json',
        },
      });

      if (response.status === 404) {
        return {
          id: `github-label-${label}`,
          scope: 'github',
          name: `Label: ${label}`,
          status: 'fail',
          message: `Label '${label}' does not exist`,
          suggestedAction: `Create label '${label}'`,
          changeId: `github.label.create.${label}`,
          risk: 'low',
          requiresApproval: false,
        };
      } else if (!response.ok) {
        return {
          id: `github-label-${label}`,
          scope: 'github',
          name: `Label: ${label}`,
          status: 'error',
          message: `Failed to check label: ${response.statusText}`,
        };
      }

      return {
        id: `github-label-${label}`,
        scope: 'github',
        name: `Label: ${label}`,
        status: 'pass',
        message: `Label '${label}' exists`,
      };
    } catch (err: any) {
      return {
        id: `github-label-${label}`,
        scope: 'github',
        name: `Label: ${label}`,
        status: 'error',
        message: `Error checking label: ${err.message}`,
      };
    }
  }

  private async checkBranchProtection(config: any): Promise<CheckResult> {
    try {
      const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/branches/${config.branch}/protection`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/vnd.github+json',
        },
      });

      if (response.status === 404) {
        return {
          id: `github-protection-${config.branch}`,
          scope: 'github',
          name: `Branch Protection: ${config.branch}`,
          status: 'fail',
          message: `Branch protection not configured for '${config.branch}'`,
          suggestedAction: `Configure branch protection with ${config.requiredReviews || 0} required reviews`,
          changeId: `github.protection.update.${config.branch}`,
          risk: 'high',
          requiresApproval: true,
        };
      } else if (!response.ok) {
        return {
          id: `github-protection-${config.branch}`,
          scope: 'github',
          name: `Branch Protection: ${config.branch}`,
          status: 'error',
          message: `Failed to check branch protection: ${response.statusText}`,
        };
      }

      const data = await response.json();
      
      // Verify settings
      const requiredReviews = data.required_pull_request_reviews?.required_approving_review_count || 0;
      if (config.requiredReviews && requiredReviews < config.requiredReviews) {
        return {
          id: `github-protection-${config.branch}`,
          scope: 'github',
          name: `Branch Protection: ${config.branch}`,
          status: 'warning',
          message: `Required reviews: ${requiredReviews}, expected: ${config.requiredReviews}`,
          suggestedAction: `Update to require ${config.requiredReviews} reviews`,
        };
      }

      return {
        id: `github-protection-${config.branch}`,
        scope: 'github',
        name: `Branch Protection: ${config.branch}`,
        status: 'pass',
        message: `Branch protection configured correctly`,
      };
    } catch (err: any) {
      return {
        id: `github-protection-${config.branch}`,
        scope: 'github',
        name: `Branch Protection: ${config.branch}`,
        status: 'error',
        message: `Error checking branch protection: ${err.message}`,
      };
    }
  }

  async apply(changeId: string, action: any): Promise<{ success: boolean; message: string }> {
    const parts = changeId.split('.');
    const resourceType = parts[1]; // 'label', 'protection'
    const actionType = parts[2]; // 'create', 'update'

    if (resourceType === 'label' && actionType === 'create') {
      return this.createLabel(action);
    }

    return {
      success: false,
      message: `Unsupported change type: ${changeId}`,
    };
  }

  private async createLabel(action: any): Promise<{ success: boolean; message: string }> {
    try {
      const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/labels`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: action.name,
          color: action.color || 'd73a4a', // default red
          description: action.description || '',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: `Failed to create label: ${error.message || response.statusText}`,
        };
      }

      return {
        success: true,
        message: `Label '${action.name}' created successfully`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Error creating label: ${err.message}`,
      };
    }
  }

  /**
   * Create a pull request with migration files
   */
  async createPR(title: string, body: string, files: Array<{ path: string; content: string }>): Promise<{ success: boolean; message: string; prUrl?: string }> {
    try {
      // Validate file paths to prevent path traversal and request forgery
      for (const file of files) {
        // Only allow specific safe paths
        if (!file.path.match(/^(supabase\/migrations|ops\/config|docs)\/[a-zA-Z0-9_\-\.\/]+\.(sql|yaml|yml|md)$/)) {
          return {
            success: false,
            message: `Invalid file path: ${file.path}. Only supabase/migrations/, ops/config/, and docs/ are allowed.`,
          };
        }
        // Prevent path traversal
        if (file.path.includes('..') || file.path.startsWith('/')) {
          return {
            success: false,
            message: `Invalid file path: ${file.path}. Path traversal not allowed.`,
          };
        }
      }

      // Get default branch
      const repoUrl = `${this.baseUrl}/repos/${this.owner}/${this.repo}`;
      const repoResponse = await fetch(repoUrl, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/vnd.github+json',
        },
      });

      if (!repoResponse.ok) {
        return {
          success: false,
          message: `Failed to get repository info: ${repoResponse.statusText}`,
        };
      }

      const repoData = await repoResponse.json();
      const defaultBranch = repoData.default_branch;

      // Create a new branch
      const branchName = `ops/auto-migration-${Date.now()}`;
      
      // Get reference to default branch
      const refUrl = `${this.baseUrl}/repos/${this.owner}/${this.repo}/git/refs/heads/${defaultBranch}`;
      const refResponse = await fetch(refUrl, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/vnd.github+json',
        },
      });

      if (!refResponse.ok) {
        return {
          success: false,
          message: `Failed to get default branch ref: ${refResponse.statusText}`,
        };
      }

      const refData = await refResponse.json();
      const sha = refData.object.sha;

      // Create new branch
      const createBranchUrl = `${this.baseUrl}/repos/${this.owner}/${this.repo}/git/refs`;
      const createBranchResponse = await fetch(createBranchUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: sha,
        }),
      });

      if (!createBranchResponse.ok) {
        return {
          success: false,
          message: `Failed to create branch: ${createBranchResponse.statusText}`,
        };
      }

      // Create/update files
      for (const file of files) {
        const fileUrl = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${file.path}`;
        
        // Check if file exists
        const checkResponse = await fetch(fileUrl, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github+json',
          },
        });

        const existingSha = checkResponse.ok ? (await checkResponse.json()).sha : undefined;

        const updateFileResponse = await fetch(fileUrl, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Add ${file.path}`,
            content: Buffer.from(file.content).toString('base64'),
            branch: branchName,
            ...(existingSha ? { sha: existingSha } : {}),
          }),
        });

        if (!updateFileResponse.ok) {
          return {
            success: false,
            message: `Failed to create file ${file.path}: ${updateFileResponse.statusText}`,
          };
        }
      }

      // Create pull request
      const prUrl = `${this.baseUrl}/repos/${this.owner}/${this.repo}/pulls`;
      const prResponse = await fetch(prUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          body,
          head: branchName,
          base: defaultBranch,
        }),
      });

      if (!prResponse.ok) {
        const error = await prResponse.json();
        return {
          success: false,
          message: `Failed to create PR: ${error.message || prResponse.statusText}`,
        };
      }

      const prData = await prResponse.json();

      return {
        success: true,
        message: `Pull request created successfully`,
        prUrl: prData.html_url,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Error creating PR: ${err.message}`,
      };
    }
  }
}
