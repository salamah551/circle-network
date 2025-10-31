/**
 * Slack connector for sending notifications and handling approvals
 */

import { BaseConnector } from './base';
import { CheckResult } from '../types';

export class SlackConnector extends BaseConnector {
  private token: string;
  private signingSecret: string;

  constructor(config: { token: string; signingSecret: string }, private desiredState: any = {}) {
    super(config);
    this.token = config.token;
    this.signingSecret = config.signingSecret;
  }

  isConfigured(): boolean {
    return !!(this.token && this.signingSecret);
  }

  async audit(): Promise<CheckResult[]> {
    const checks: CheckResult[] = [];

    if (!this.isConfigured()) {
      checks.push({
        id: 'slack-config',
        scope: 'slack',
        name: 'Configuration Check',
        status: 'warning',
        message: 'Slack credentials not configured (optional)',
      });
      return checks;
    }

    // Verify token by testing API
    try {
      const response = await fetch('https://slack.com/api/auth.test', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.ok) {
        checks.push({
          id: 'slack-auth',
          scope: 'slack',
          name: 'Authentication Check',
          status: 'pass',
          message: `Connected to workspace: ${data.team}`,
        });
      } else {
        checks.push({
          id: 'slack-auth',
          scope: 'slack',
          name: 'Authentication Check',
          status: 'fail',
          message: `Authentication failed: ${data.error}`,
          suggestedAction: 'Verify Slack token',
        });
      }
    } catch (err: any) {
      checks.push({
        id: 'slack-auth',
        scope: 'slack',
        name: 'Authentication Check',
        status: 'error',
        message: `Error testing auth: ${err.message}`,
      });
    }

    return checks;
  }

  async apply(changeId: string, action: any): Promise<{ success: boolean; message: string }> {
    // Slack is used for notifications, not direct applies
    return {
      success: false,
      message: 'Slack connector is for notifications only',
    };
  }

  /**
   * Send a notification to a Slack channel
   */
  async sendNotification(channel: string, message: string, blocks?: any[]): Promise<boolean> {
    if (!this.isConfigured()) {
      console.error('Slack not configured');
      return false;
    }

    try {
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel,
          text: message,
          blocks: blocks || undefined,
        }),
      });

      const data = await response.json();
      return data.ok;
    } catch (err: any) {
      console.error('Error sending Slack notification:', err);
      return false;
    }
  }

  /**
   * Send an approval request to Slack
   */
  async sendApprovalRequest(
    channel: string, 
    changeId: string, 
    description: string,
    risk: string
  ): Promise<boolean> {
    if (!this.isConfigured()) {
      console.error('Slack not configured');
      return false;
    }

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🔔 Ops Change Approval Required',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Change ID:* ${changeId}\n*Risk Level:* ${risk}\n*Description:* ${description}`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Approve',
            },
            style: 'primary',
            value: changeId,
            action_id: `ops_approve_${changeId}`,
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Reject',
            },
            style: 'danger',
            value: changeId,
            action_id: `ops_reject_${changeId}`,
          },
        ],
      },
    ];

    return this.sendNotification(channel, `Approval required for ${changeId}`, blocks);
  }

  /**
   * Verify Slack request signature
   */
  verifySignature(signature: string, timestamp: string, body: string): boolean {
    if (!this.signingSecret) {
      return false;
    }

    const crypto = require('crypto');
    const time = Math.floor(Date.now() / 1000);

    // Reject old requests (older than 5 minutes)
    if (Math.abs(time - parseInt(timestamp)) > 300) {
      return false;
    }

    const sigBasestring = `v0:${timestamp}:${body}`;
    const mySignature = 'v0=' + crypto
      .createHmac('sha256', this.signingSecret)
      .update(sigBasestring)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(mySignature),
      Buffer.from(signature)
    );
  }
}
