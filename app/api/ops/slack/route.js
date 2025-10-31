// app/api/ops/slack/route.js
// POST /api/ops/slack - Slack webhook for approval workflow (stub)

export const dynamic = 'force-dynamic';

import crypto from 'crypto';

/**
 * Verify Slack request signature
 * @param {Request} request 
 * @returns {boolean}
 */
async function verifySlackSignature(request, body) {
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  
  if (!signingSecret) {
    console.warn('SLACK_SIGNING_SECRET not configured');
    return false;
  }
  
  const timestamp = request.headers.get('x-slack-request-timestamp');
  const signature = request.headers.get('x-slack-signature');
  
  if (!timestamp || !signature) {
    return false;
  }
  
  // Verify timestamp is recent (within 5 minutes)
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - parseInt(timestamp)) > 300) {
    console.warn('Slack request timestamp too old');
    return false;
  }
  
  // Calculate expected signature
  const sigBasestring = `v0:${timestamp}:${body}`;
  const expectedSignature = 'v0=' + crypto
    .createHmac('sha256', signingSecret)
    .update(sigBasestring)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Parse Slack slash command
 * @param {string} text - Command text
 * @returns {Object} - Parsed command
 */
function parseSlackCommand(text) {
  const parts = text.trim().split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1);
  
  return { command, args };
}

/**
 * POST /api/ops/slack
 * 
 * Handle Slack slash commands for AI Ops approval workflow
 * 
 * Supported commands:
 * - /ops approve <change_id> - Approve a change
 * - /ops reject <change_id> - Reject a change
 * - /ops review <change_id> - Request review details
 * - /ops status - Get pending approvals
 */
export async function POST(request) {
  try {
    const body = await request.text();
    
    // Verify Slack signature
    const isValid = await verifySlackSignature(request, body);
    
    if (!isValid && process.env.SLACK_SIGNING_SECRET) {
      return Response.json(
        { 
          response_type: 'ephemeral',
          text: 'Invalid request signature'
        },
        { status: 401 }
      );
    }
    
    // Parse form data
    const params = new URLSearchParams(body);
    const text = params.get('text') || '';
    const userId = params.get('user_id');
    const userName = params.get('user_name');
    const channelId = params.get('channel_id');
    
    console.log(`Slack command from ${userName}: ${text}`);
    
    // Parse command
    const { command, args } = parseSlackCommand(text);
    
    // Handle commands (stub implementation)
    switch (command) {
      case 'approve':
        if (args.length === 0) {
          return Response.json({
            response_type: 'ephemeral',
            text: 'Usage: `/ops approve <change_id>`'
          });
        }
        
        return Response.json({
          response_type: 'ephemeral',
          text: `✅ Change \`${args[0]}\` approved by @${userName}\n\n_Note: Approval workflow is currently a stub implementation. Changes still need to be applied via the API._`
        });
      
      case 'reject':
        if (args.length === 0) {
          return Response.json({
            response_type: 'ephemeral',
            text: 'Usage: `/ops reject <change_id>`'
          });
        }
        
        return Response.json({
          response_type: 'ephemeral',
          text: `❌ Change \`${args[0]}\` rejected by @${userName}\n\n_Note: Approval workflow is currently a stub implementation._`
        });
      
      case 'review':
        if (args.length === 0) {
          return Response.json({
            response_type: 'ephemeral',
            text: 'Usage: `/ops review <change_id>`'
          });
        }
        
        return Response.json({
          response_type: 'ephemeral',
          text: `📋 Review request for change \`${args[0]}\`\n\n_Note: Review details would be fetched from the audit system. This is a stub implementation._`
        });
      
      case 'status':
        return Response.json({
          response_type: 'ephemeral',
          text: `📊 *AI Ops Status*\n\n_Pending approvals: 0_\n_Recent changes: 0_\n\n_Note: This is a stub implementation. Full status tracking will be available in future versions._`
        });
      
      case 'help':
      case '':
        return Response.json({
          response_type: 'ephemeral',
          text: `*AI Ops Control Plane - Slack Commands*\n\n` +
                `Available commands:\n` +
                `• \`/ops approve <change_id>\` - Approve a pending change\n` +
                `• \`/ops reject <change_id>\` - Reject a pending change\n` +
                `• \`/ops review <change_id>\` - Get details about a change\n` +
                `• \`/ops status\` - View pending approvals and recent activity\n` +
                `• \`/ops help\` - Show this help message\n\n` +
                `_Note: Approval workflow is currently in stub mode._`
        });
      
      default:
        return Response.json({
          response_type: 'ephemeral',
          text: `Unknown command: \`${command}\`\n\nType \`/ops help\` for available commands.`
        });
    }
    
  } catch (error) {
    console.error('Error in /api/ops/slack:', error);
    return Response.json({
      response_type: 'ephemeral',
      text: `Error processing command: ${error.message}`
    });
  }
}

/**
 * GET /api/ops/slack
 * 
 * Get Slack webhook configuration status
 */
export async function GET(request) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.OPS_API_TOKEN;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const configured = {
      signing_secret: !!process.env.SLACK_SIGNING_SECRET,
      bot_token: !!process.env.SLACK_BOT_TOKEN,
      channel_id: !!process.env.SLACK_OPS_CHANNEL_ID
    };
    
    const allConfigured = Object.values(configured).every(v => v);
    
    return Response.json({
      success: true,
      status: allConfigured ? 'configured' : 'partially_configured',
      configured,
      webhook_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/ops/slack`,
      supported_commands: [
        '/ops approve <change_id>',
        '/ops reject <change_id>',
        '/ops review <change_id>',
        '/ops status',
        '/ops help'
      ],
      note: 'This is a stub implementation. Full approval workflow will be implemented in future versions.'
    });
    
  } catch (error) {
    console.error('Error getting Slack config:', error);
    return Response.json(
      { error: 'Failed to get Slack configuration' },
      { status: 500 }
    );
  }
}
