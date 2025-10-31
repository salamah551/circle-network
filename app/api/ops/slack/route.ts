/**
 * POST /api/ops/slack
 * 
 * Slack events endpoint for interactive approvals
 * Handles button clicks and slash commands for ops approvals
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadConnectorConfig } from '@/lib/ops/config-loader';
import { SlackConnector } from '@/lib/ops/connectors/slack';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory approval store (in production, use database)
const approvals = new Map<string, { status: 'approved' | 'rejected'; by: string; at: string }>();

export async function POST(request: NextRequest) {
  try {
    const connectorConfig = loadConnectorConfig();
    
    if (!connectorConfig.slack) {
      return NextResponse.json(
        { error: 'Slack not configured' },
        { status: 400 }
      );
    }

    const slackConnector = new SlackConnector(connectorConfig.slack);

    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-slack-signature') || '';
    const timestamp = request.headers.get('x-slack-request-timestamp') || '';

    // Verify Slack signature
    if (!slackConnector.verifySignature(signature, timestamp, rawBody)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse body
    const body = JSON.parse(rawBody);

    // Handle Slack URL verification challenge
    if (body.type === 'url_verification') {
      return NextResponse.json({ challenge: body.challenge });
    }

    // Handle interactive actions (button clicks)
    if (body.type === 'block_actions') {
      const action = body.actions[0];
      const actionId = action.action_id;
      
      // Parse action (format: ops_approve_changeId or ops_reject_changeId)
      if (actionId.startsWith('ops_approve_') || actionId.startsWith('ops_reject_')) {
        const isApproval = actionId.startsWith('ops_approve_');
        const changeId = action.value;
        const user = body.user.username || body.user.id;

        // Store approval/rejection
        approvals.set(changeId, {
          status: isApproval ? 'approved' : 'rejected',
          by: user,
          at: new Date().toISOString(),
        });

        // Send confirmation
        await slackConnector.sendNotification(
          body.channel.id,
          `${isApproval ? '✅' : '❌'} Change \`${changeId}\` ${isApproval ? 'approved' : 'rejected'} by @${user}`
        );

        return NextResponse.json({ ok: true });
      }
    }

    // Handle slash commands
    if (body.type === 'slash_command') {
      const command = body.command;
      const text = body.text;

      if (command === '/ops') {
        // Parse command: /ops approve <changeId> or /ops status <changeId>
        const parts = text.trim().split(/\s+/);
        const subcommand = parts[0];
        const changeId = parts[1];

        if (subcommand === 'approve' && changeId) {
          const user = body.user_name || body.user_id;
          
          approvals.set(changeId, {
            status: 'approved',
            by: user,
            at: new Date().toISOString(),
          });

          return NextResponse.json({
            response_type: 'in_channel',
            text: `✅ Change \`${changeId}\` approved by @${user}`,
          });
        } else if (subcommand === 'reject' && changeId) {
          const user = body.user_name || body.user_id;
          
          approvals.set(changeId, {
            status: 'rejected',
            by: user,
            at: new Date().toISOString(),
          });

          return NextResponse.json({
            response_type: 'in_channel',
            text: `❌ Change \`${changeId}\` rejected by @${user}`,
          });
        } else if (subcommand === 'status' && changeId) {
          const approval = approvals.get(changeId);
          
          if (approval) {
            return NextResponse.json({
              response_type: 'ephemeral',
              text: `Change \`${changeId}\`: ${approval.status} by @${approval.by} at ${approval.at}`,
            });
          } else {
            return NextResponse.json({
              response_type: 'ephemeral',
              text: `Change \`${changeId}\`: pending approval`,
            });
          }
        } else {
          return NextResponse.json({
            response_type: 'ephemeral',
            text: 'Usage: `/ops approve <changeId>`, `/ops reject <changeId>`, or `/ops status <changeId>`',
          });
        }
      }
    }

    return NextResponse.json({ ok: true });

  } catch (error: any) {
    console.error('Slack endpoint error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Return approval status for a change ID
  const { searchParams } = new URL(request.url);
  const changeId = searchParams.get('changeId');

  if (!changeId) {
    return NextResponse.json(
      { error: 'changeId required' },
      { status: 400 }
    );
  }

  const approval = approvals.get(changeId);

  if (approval) {
    return NextResponse.json({
      changeId,
      ...approval,
    });
  } else {
    return NextResponse.json({
      changeId,
      status: 'pending',
    });
  }
}
