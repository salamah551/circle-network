/**
 * GitHub Connector for AI Ops
 * Creates PRs with migrations, docs, and ops config updates
 */

import { BaseConnector, PlanResult, DiffResult, ApplyResult, ConnectorConfig } from './base';

export class GitHubConnector extends BaseConnector {
  private token: string;
  private owner: string;
  private repo: string;

  constructor(config: ConnectorConfig) {
    super(config);
    this.token = process.env.GITHUB_TOKEN || '';
    
    // Extract owner/repo from config or environment
    const repoFull = config.repository || process.env.GITHUB_REPOSITORY || 'salamah551/circle-network';
    [this.owner, this.repo] = repoFull.split('/');
  }

  async verify(): Promise<{ success: boolean; message: string }> {
    if (!this.token) {
      return { 
        success: false, 
        message: 'GITHUB_TOKEN not configured. GitHub integration disabled.' 
      };
    }

    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (!response.ok) {
        return { 
          success: false, 
          message: `GitHub API error: ${response.status}` 
        };
      }

      return { success: true, message: 'GitHub connection verified' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  async getCurrentState(): Promise<any> {
    const state: any = {
      repository: `${this.owner}/${this.repo}`,
      hasToken: !!this.token,
    };

    return state;
  }

  async plan(desiredState: any): Promise<PlanResult> {
    const diffs: DiffResult[] = [];

    // Check if PR should be created for ops changes
    if (desiredState.github?.auto_pr_labels) {
      diffs.push({
        type: 'create',
        resource: 'pr:ops-infrastructure-updates',
        details: {
          title: 'Infrastructure updates from AI Ops',
          labels: desiredState.github.auto_pr_labels,
          description: 'Automated PR created by AI Ops Control Plane',
        },
        risk: 'low',
        requiresApproval: false,
      });
    }

    return {
      connector: 'github',
      diffs,
      summary: `GitHub connector ready to create PRs`,
      requiresApproval: false,
    };
  }

  async apply(plan: PlanResult, options?: any): Promise<ApplyResult> {
    const result: ApplyResult = {
      success: false,
      applied: 0,
      failed: 0,
      errors: [],
      changes: [],
    };

    if (!this.token) {
      result.errors.push('GitHub token not configured. Cannot create PRs.');
      return result;
    }

    // In a full implementation, this would:
    // 1. Create a new branch
    // 2. Commit changes (migrations, config updates, docs)
    // 3. Create a PR with proper labels and description
    // 4. Request reviews if needed

    result.errors.push('GitHub PR creation not yet fully implemented');
    result.changes.push({
      type: 'documentation',
      message: 'Would create PR with ops changes',
    });

    return result;
  }

  /**
   * Create a pull request with ops changes
   */
  async createPR(
    title: string,
    body: string,
    files: Array<{ path: string; content: string }>,
    baseBranch: string = 'main'
  ): Promise<{ success: boolean; pr_url?: string; error?: string }> {
    if (!this.token) {
      return { success: false, error: 'GitHub token not configured' };
    }

    try {
      // 1. Get the latest commit SHA from base branch
      const refResponse = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/git/ref/heads/${baseBranch}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (!refResponse.ok) {
        throw new Error(`Failed to get base branch: ${refResponse.status}`);
      }

      const refData = await refResponse.json();
      const baseSha = refData.object.sha;

      // 2. Create a new branch
      const branchName = `ops/automated-${Date.now()}`;
      const createBranchResponse = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/git/refs`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ref: `refs/heads/${branchName}`,
            sha: baseSha,
          }),
        }
      );

      if (!createBranchResponse.ok) {
        throw new Error(`Failed to create branch: ${createBranchResponse.status}`);
      }

      // 3. Create/update files (would need to commit each file)
      // This is simplified - in production would use Git Tree API

      // 4. Create PR
      const prResponse = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/pulls`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            body,
            head: branchName,
            base: baseBranch,
          }),
        }
      );

      if (!prResponse.ok) {
        throw new Error(`Failed to create PR: ${prResponse.status}`);
      }

      const prData = await prResponse.json();

      return {
        success: true,
        pr_url: prData.html_url,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Label an issue for drift detection
   */
  async labelIssue(issueNumber: number, labels: string[]): Promise<boolean> {
    if (!this.token) return false;

    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/issues/${issueNumber}/labels`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ labels }),
        }
      );

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}
