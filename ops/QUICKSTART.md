# AI Ops Control Plane - Quick Start Guide

Get the ops control plane running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Access to your service APIs (Supabase, Vercel, GitHub, etc.)
- API keys/tokens for services you want to audit

## Step 1: Configure Environment Variables

Add to your `.env` or `.env.local`:

```bash
# Required: Ops authentication
OPS_SECRET=your-random-secret-here

# Required: For Supabase checks (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: GitHub (for PR creation)
OPS_GITHUB_TOKEN=ghp_your_token
OPS_GITHUB_OWNER=salamah551
OPS_GITHUB_REPO=circle-network

# Optional: Vercel (for env var checks)
OPS_VERCEL_TOKEN=your_vercel_token
OPS_VERCEL_PROJECT_ID=prj_xxxxx

# Optional: Stripe (for price/webhook verification)
STRIPE_SECRET_KEY=sk_test_or_live_xxxxx

# Optional: SendGrid (for domain verification)
SENDGRID_API_KEY=SG.xxxxx

# Optional: PostHog (for key verification)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx

# Optional: Slack (for approvals and notifications)
OPS_SLACK_TOKEN=xoxb-xxxxx
OPS_SLACK_SIGNING_SECRET=xxxxx
```

## Step 2: Start the Development Server

```bash
npm install
npm run dev
```

The server will start at `http://localhost:5000`.

## Step 3: Run Your First Audit

### Option A: Using curl

```bash
export OPS_SECRET="your-secret-from-env"

curl -X POST "http://localhost:5000/api/ops/audit?scope=all" \
  -H "Authorization: Bearer $OPS_SECRET" \
  | jq '.'
```

### Option B: Using the test script

```bash
OPS_SECRET=your-secret ./ops/test-audit.sh
```

### Option C: Using a REST client (Postman, Insomnia)

- **Method:** POST
- **URL:** `http://localhost:5000/api/ops/audit?scope=all`
- **Headers:**
  - `Authorization: Bearer your-secret`
  - `Content-Type: application/json`

## Step 4: Understand the Response

You'll get a JSON response like:

```json
{
  "mode": "plan",
  "timestamp": "2025-10-31T04:30:00Z",
  "scope": ["supabase", "vercel", "stripe"],
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
      "message": "Environment variable missing",
      "suggestedAction": "Add to production environment",
      "changeId": "vercel.env.add.STRIPE_SECRET_KEY",
      "risk": "medium"
    }
  ],
  "summary": {
    "total": 15,
    "passed": 12,
    "failed": 2,
    "warnings": 1,
    "errors": 0
  }
}
```

### Status Types

- ✅ **pass** - Check succeeded, configuration is correct
- ❌ **fail** - Check failed, action needed
- ⚠️ **warning** - Non-critical issue or informational
- 🔴 **error** - Connector or API error

## Step 5: Customize Configuration

Edit `ops/desired-state.yaml` to define what your infrastructure should look like:

```yaml
supabase:
  tables:
    - name: your_table
      columns: [...]
      
vercel:
  envVars:
    - key: YOUR_ENV_VAR
      environments: [production]
      required: true
```

## Step 6: Apply Changes (Optional)

⚠️ **Warning:** This will make real changes to your infrastructure!

### Low-Risk Changes (Direct Apply)

```bash
curl -X POST "http://localhost:5000/api/ops/apply" \
  -H "Authorization: Bearer $OPS_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "changes": [{
      "id": "github.label.create.ops",
      "scope": "github",
      "type": "create",
      "description": "Create ops label",
      "risk": "low",
      "requiresApproval": false,
      "actions": [{
        "type": "api",
        "description": "Create label",
        "payload": {"name": "ops", "color": "0052cc"}
      }]
    }]
  }'
```

### High-Risk Changes (PR-Based)

High-risk changes (like database migrations) will automatically create a GitHub PR instead of applying directly. The PR will contain:

- SQL migration files (for Supabase changes)
- Configuration files (for other changes)
- Detailed description and change log

## Common Use Cases

### 1. Daily Infrastructure Audit

Add to your cron or CI/CD:

```bash
#!/bin/bash
# Run daily at 9 AM
curl -X POST "https://your-app.com/api/ops/audit?scope=all" \
  -H "Authorization: Bearer $OPS_SECRET" \
  > /var/log/ops-audit-$(date +%Y%m%d).json
```

### 2. Pre-Deployment Check

Before deploying:

```bash
# Check critical services
curl -X POST "http://localhost:5000/api/ops/audit?scope=supabase,vercel" \
  -H "Authorization: Bearer $OPS_SECRET" \
  | jq '.checks[] | select(.status == "fail" or .status == "error")'
```

### 3. Verify Secrets are Set

```bash
# Check environment variables
curl -X POST "http://localhost:5000/api/ops/audit?scope=vercel" \
  -H "Authorization: Bearer $OPS_SECRET" \
  | jq '.checks[] | select(.name | startswith("Env Var"))'
```

### 4. Monitor Stripe Configuration

```bash
# Check Stripe prices and webhooks
curl -X POST "http://localhost:5000/api/ops/audit?scope=stripe" \
  -H "Authorization: Bearer $OPS_SECRET" \
  | jq '.checks'
```

## Troubleshooting

### "Unauthorized" Error

- Check that `OPS_SECRET` is set in your environment
- Verify the Authorization header: `Bearer your-secret`

### "Configuration not loaded" Error

- Ensure `ops/desired-state.yaml` exists and is valid YAML
- Check file permissions

### "Connector not configured" Warnings

- This is normal for optional services
- Add the relevant API keys to enable those connectors

### No Checks Run

- Verify at least one connector is configured
- Check that environment variables are loaded
- Look at server logs for errors

## Next Steps

1. **Customize** `ops/desired-state.yaml` for your infrastructure
2. **Adjust** `ops/change-policy.yaml` approval rules
3. **Set up** Slack integration for notifications
4. **Configure** GitHub token for PR-based changes
5. **Schedule** regular audits via cron or GitHub Actions

## Getting Help

- 📖 See [README.md](./README.md) for detailed documentation
- 🐛 Check server logs with `npm run dev`
- 💬 Review code in `lib/ops/` for connector details

## Security Notes

- Never commit `.env` files with real secrets
- Use separate tokens with minimal required permissions
- Review all changes before applying in production
- Enable approval workflows for destructive changes
- Regularly rotate API tokens and secrets
