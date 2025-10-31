# AI Ops Control Plane

A self-hosted infrastructure automation system that audits and fixes configuration across Supabase, Vercel, GitHub, Stripe, and other services based on declared desired state.

## Overview

The AI Ops Control Plane helps reduce operational workload by:
- 🔍 **Auditing** infrastructure configuration against desired state
- 📊 **Generating** human-readable reports and diffs
- 🔧 **Applying** fixes via pull requests or direct API calls
- 🔒 **Enforcing** safety rails with approval workflows
- 📝 **Logging** all changes for audit trails

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Desired State YAML                     │
│  (defines expected config for all services)              │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Audit Engine                          │
│  (runs checks via service connectors)                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Check Results                          │
│  (pass/fail/warning with suggested actions)              │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Apply Engine                          │
│  (executes changes with approval checks)                 │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
      ┌─────────────────┬─────────────────┐
      ▼                 ▼                 ▼
  GitHub PR        Direct Apply      Slack Approval
  (preferred)      (if allowed)      (if required)
```

## Configuration Files

### desired-state.yaml

Defines the expected configuration for all services:

```yaml
supabase:
  tables:
    - name: profiles
      columns: [...]
      rlsPolicies: [...]
  storage:
    buckets: [...]

vercel:
  envVars: [...]
  crons: [...]

stripe:
  priceIds: [...]
  webhooks: [...]
```

### change-policy.yaml

Defines approval requirements and risk levels:

```yaml
approvalRules:
  supabase.table.drop:
    requiresApproval: true
    approvers: ["admin", "dba"]
    method: slack

autoApplyAllowed:
  supabase: false  # Never auto-apply DB changes
  vercel: true     # Can auto-apply low-risk changes
```

## API Endpoints

### POST /api/ops/audit

Runs infrastructure audits and returns a report.

**Query Parameters:**
- `scope` - Services to audit: `supabase`, `vercel`, `stripe`, `github`, `sendgrid`, `posthog`, or `all` (default)
- `mode` - `plan` (read-only) or `apply` (with changes)

**Headers:**
- `Authorization: Bearer <OPS_SECRET>`

**Example Request:**
```bash
curl -X POST "http://localhost:5000/api/ops/audit?scope=supabase,vercel" \
  -H "Authorization: Bearer your-ops-secret"
```

**Example Response:**
```json
{
  "mode": "plan",
  "timestamp": "2025-10-31T04:30:00Z",
  "scope": ["supabase", "vercel"],
  "checks": [
    {
      "id": "supabase-table-profiles",
      "scope": "supabase",
      "name": "Table: profiles",
      "status": "pass",
      "message": "Table 'profiles' exists"
    },
    {
      "id": "vercel-env-STRIPE_SECRET_KEY",
      "scope": "vercel",
      "name": "Env Var: STRIPE_SECRET_KEY",
      "status": "fail",
      "message": "Environment variable 'STRIPE_SECRET_KEY' is missing",
      "suggestedAction": "Add 'STRIPE_SECRET_KEY' to environments: production, preview",
      "changeId": "vercel.env.add.STRIPE_SECRET_KEY",
      "risk": "medium",
      "requiresApproval": false
    }
  ],
  "summary": {
    "total": 25,
    "passed": 20,
    "failed": 3,
    "warnings": 2,
    "errors": 0
  }
}
```

### POST /api/ops/apply

Applies infrastructure changes with approval checks.

**Headers:**
- `Authorization: Bearer <OPS_SECRET>`

**Request Body:**
```json
{
  "changes": [
    {
      "id": "vercel.env.add.STRIPE_SECRET_KEY",
      "scope": "vercel",
      "type": "add",
      "description": "Add STRIPE_SECRET_KEY to production",
      "risk": "medium",
      "requiresApproval": false,
      "actions": [
        {
          "type": "api",
          "description": "Add env var via Vercel API",
          "payload": {
            "key": "STRIPE_SECRET_KEY",
            "value": "",
            "environments": ["production"]
          }
        }
      ]
    }
  ]
}
```

**Example Response:**
```json
{
  "success": true,
  "results": [
    {
      "changeId": "vercel.env.add.STRIPE_SECRET_KEY",
      "success": true,
      "message": "Environment variable 'STRIPE_SECRET_KEY' added successfully"
    }
  ],
  "summary": {
    "total": 1,
    "succeeded": 1,
    "failed": 0
  }
}
```

### POST /api/ops/slack

Handles Slack interactive approvals and slash commands.

**Supported Commands:**
- `/ops approve <changeId>` - Approve a change
- `/ops reject <changeId>` - Reject a change  
- `/ops status <changeId>` - Check approval status

**Interactive Buttons:**
Approval requests sent to Slack include Approve/Reject buttons for easy approval.

## Service Connectors

### Supabase
- **Checks:** Tables, columns, indices, RLS policies, storage buckets, storage policies
- **Apply:** Creates storage buckets; DB changes via PR with SQL migrations
- **Read-only:** RLS policy verification

### Vercel
- **Checks:** Environment variables presence and target environments, cron schedules
- **Apply:** Add/update environment variables (with caution)
- **Read-only:** Cron verification (defined in vercel.json)

### GitHub
- **Checks:** Required labels, branch protection rules
- **Apply:** Create labels, create PRs with migration files
- **Read-only:** Branch protection verification

### Stripe
- **Checks:** Price IDs, webhook configurations
- **Apply:** None (read-only)
- **Read-only:** All operations

### SendGrid
- **Checks:** Domain verification, sender identities
- **Apply:** None (read-only)
- **Read-only:** All operations

### PostHog
- **Checks:** API key presence and format
- **Apply:** None (read-only)
- **Read-only:** All operations

### Slack
- **Checks:** Authentication and workspace connection
- **Apply:** Send notifications and approval requests
- **Interactive:** Handle button clicks and slash commands

## Environment Variables

Add these to your `.env` or deployment environment:

```bash
# Ops Authentication
OPS_SECRET=your-random-ops-secret

# Vercel API (for env var and deployment checks)
OPS_VERCEL_TOKEN=your-vercel-token
OPS_VERCEL_PROJECT_ID=prj_xxxxx
OPS_VERCEL_TEAM_ID=team_xxxxx  # Optional

# GitHub API (for PR creation and config checks)
OPS_GITHUB_TOKEN=ghp_xxxxx
OPS_GITHUB_OWNER=salamah551
OPS_GITHUB_REPO=circle-network

# Slack API (optional, for notifications and approvals)
OPS_SLACK_TOKEN=xoxb-xxxxx
OPS_SLACK_SIGNING_SECRET=xxxxx

# Existing vars used by connectors:
# NEXT_PUBLIC_SUPABASE_URL
# SUPABASE_SERVICE_ROLE_KEY
# STRIPE_SECRET_KEY
# SENDGRID_API_KEY
# NEXT_PUBLIC_POSTHOG_KEY
```

## Usage Examples

### 1. Run a Full Audit

```bash
curl -X POST "https://your-app.vercel.app/api/ops/audit?scope=all" \
  -H "Authorization: Bearer $OPS_SECRET" | jq
```

### 2. Audit Specific Services

```bash
curl -X POST "https://your-app.vercel.app/api/ops/audit?scope=supabase,stripe" \
  -H "Authorization: Bearer $OPS_SECRET" | jq
```

### 3. Apply Low-Risk Changes

```bash
curl -X POST "https://your-app.vercel.app/api/ops/apply" \
  -H "Authorization: Bearer $OPS_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "changes": [
      {
        "id": "github.label.create.security",
        "scope": "github",
        "type": "create",
        "description": "Create security label",
        "risk": "low",
        "requiresApproval": false,
        "actions": [
          {
            "type": "api",
            "description": "Create label via GitHub API",
            "payload": {
              "name": "security",
              "color": "d73a4a"
            }
          }
        ]
      }
    ]
  }'
```

### 4. Request Approval via Slack

For high-risk changes, the system will send an approval request to Slack:

```bash
# This happens automatically when applying high-risk changes
# Users can then approve via Slack:
/ops approve supabase.table.create.new_feature
```

### 5. Check Approval Status

```bash
curl "https://your-app.vercel.app/api/ops/slack?changeId=supabase.table.create.new_feature" \
  -H "Authorization: Bearer $OPS_SECRET"
```

## Safety Features

### Approval Requirements
- **Destructive changes** (table/column drops) require explicit approval
- **High-risk changes** (RLS policies, new tables) require approval
- Approvals via Slack (interactive) or GitHub (PR review)

### Change Logging
- All changes logged with timestamp, user, and result
- Logs stored for audit trail (90-day retention)
- Failed changes captured with error details

### PR-Based Workflow
- Database changes generate SQL migration files
- Changes committed to a new branch
- Pull request created automatically
- CI/CD runs tests before merge
- Human review required for approval

### Auto-Apply Restrictions
- Never auto-apply database changes
- Low-risk changes (labels, storage buckets) can auto-apply
- Configuration via `change-policy.yaml`

## Development

### Adding a New Connector

1. Create `lib/ops/connectors/your-service.ts`
2. Extend `BaseConnector`
3. Implement `audit()` and `apply()` methods
4. Add configuration to `config-loader.ts`
5. Register in `AuditEngine` constructor

Example:
```typescript
export class YourServiceConnector extends BaseConnector {
  async audit(): Promise<CheckResult[]> {
    // Run checks
  }
  
  async apply(changeId: string, action: any): Promise<ApplyResult> {
    // Execute change
  }
}
```

### Running Tests

```bash
npm test
```

### Local Development

```bash
# Set up environment
cp .env.example .env
# Edit .env with your credentials

# Run dev server
npm run dev

# Test audit endpoint
curl -X POST "http://localhost:5000/api/ops/audit" \
  -H "Authorization: Bearer test-secret"
```

## Security Considerations

1. **Authentication:** All ops endpoints require `OPS_SECRET` in Authorization header
2. **API Keys:** Store sensitive keys in environment variables, never in code
3. **Approval Flow:** High-risk changes require explicit approval
4. **Slack Verification:** Request signatures verified using signing secret
5. **Audit Logging:** All changes logged for compliance and debugging
6. **Least Privilege:** Use service accounts with minimal required permissions

## Troubleshooting

### "Unauthorized" Errors
- Verify `OPS_SECRET` is set and matches request header
- Check Authorization header format: `Bearer <secret>`

### "Connector Not Configured" Warnings
- Verify required environment variables are set
- Check `.env.example` for required keys
- Run audit to see which connectors are missing

### "Approval Required" Errors
- High-risk changes need approval before apply
- Use Slack `/ops approve <changeId>` or approve via GitHub PR
- Check `change-policy.yaml` for approval rules

### PR Creation Fails
- Verify `OPS_GITHUB_TOKEN` has repo write permissions
- Check repository name and owner are correct
- Ensure default branch is accessible

## Roadmap

- [ ] Database table to store approval history
- [ ] Web UI for viewing audit reports
- [ ] Email notifications for approvals
- [ ] Scheduled audit cron job
- [ ] Terraform connector for IaC
- [ ] Datadog connector for monitoring config
- [ ] PagerDuty connector for on-call config

## Contributing

Contributions welcome! Please:
1. Follow existing code patterns
2. Add tests for new connectors
3. Update documentation
4. Test with real APIs before submitting PR

## License

Part of Circle Network - Internal Operations Tool
