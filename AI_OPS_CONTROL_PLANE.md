# AI Ops Control Plane Documentation

## Overview

The AI Ops Control Plane is a self-hosted, knowledge-aware system that understands the entire Circle Network codebase, documentation, onboarding flow, pricing strategy, and business goals. It provides automated auditing and fixing of configuration across Supabase, Vercel, GitHub, and Stripe.

## Key Capabilities

### 1. Knowledge Ingestion + Q&A (RAG)

The system ingests repository code and documentation into a Supabase `ops_knowledge` table with vector embeddings for semantic search.

**Priority Documents Ingested:**
- `IMPLEMENTATION-SUMMARY.md`
- `ONBOARDING_IMPLEMENTATION.md`
- `AI_ONBOARDING_IMPLEMENTATION.md`
- `README-DEPLOY-NOTES.md`
- `BULK_INVITES_FIX_SUMMARY.md`
- `CODE_EXAMPLES.md`
- `BriefPoint_Build_Spec_v1.md`
- All other markdown files (optional)
- Code files in `app/`, `lib/`, `components/` (optional)

**Embeddings Configuration:**
- Provider: OpenAI (configurable via `OPS_EMBEDDINGS_PROVIDER`)
- Model: `text-embedding-3-large` (configurable via `OPS_EMBEDDINGS_MODEL`)
- Dimension: 3072

### 2. Desired State Orchestration

The system uses `ops/desired_state.yaml` to declare infrastructure requirements:

**Onboarding Rules:**
- Needs assessment gate with redirects
- Required profile columns: `subscription_status`, `status`, `is_admin`, `needs_assessment`, `needs_assessment_completed_at`

**Pricing Tiers:**
- Core: $179/month, 10 ARC requests, 5 BriefPoint caps
- Pro: $299/month, 30 ARC requests, 10 BriefPoint caps
- Elite: $499/month, 50 ARC requests, 20 BriefPoint caps

**Database Tables:**
- `arc_requests`, `arc_request_attachments`, `requests`, `profiles`
- Optional: `referrals`, `invites`, `bulk_invites`
- `ops_knowledge` with embeddings and indexes
- RLS enabled where applicable

**Storage:**
- Private `arc-uploads` bucket
- Owner-only access with path prefix `user_id/`
- 20MB file size limit

**Environment Variables:**
- Required: Supabase, ARC, Stripe, App, Ops credentials
- Optional: GitHub, Slack, Stripe price IDs

### 3. Plan/Apply Loop with Safety

The system provides audit and apply capabilities with safety policies.

**Change Policy:**
- Database changes: Generate PR by default (or direct apply with `OPS_ALLOW_DIRECT_APPLY=true`)
- Vercel env: Auto-apply low-risk changes if allowed
- Storage: Auto-apply bucket creation
- Stripe: Read-only verification

**Safety Features:**
- Risk levels: high, medium, low
- Approval requirements for high-risk changes
- Migration file generation with rollback support
- GitHub PR creation for review

## API Endpoints

### POST /api/ops/ingest

Ingest repository knowledge into the knowledge base.

**Request:**
```json
{
  "mode": "priority",  // "full", "incremental", "priority"
  "includeCode": false,
  "includeMarkdown": true
}
```

**Response:**
```json
{
  "success": true,
  "mode": "priority",
  "summary": {
    "total": 10,
    "success": 10,
    "failed": 0,
    "skipped": 0
  },
  "results": [...]
}
```

**Authorization:** Bearer token via `OPS_API_TOKEN` environment variable.

### GET /api/ops/ingest

Get ingestion statistics.

**Response:**
```json
{
  "success": true,
  "statistics": {
    "total_chunks": 45,
    "by_type": {
      "markdown": 40,
      "code": 5
    },
    "recent_ingestions": [...]
  }
}
```

### POST /api/ops/ask

Ask questions about the codebase using RAG.

**Request:**
```json
{
  "question": "How does the onboarding flow work?",
  "generatePlan": false
}
```

**Response:**
```json
{
  "success": true,
  "question": "How does the onboarding flow work?",
  "answer": "The onboarding flow consists of...",
  "citations": [
    {
      "index": 1,
      "source": "ONBOARDING_IMPLEMENTATION.md",
      "type": "markdown",
      "similarity": 0.92
    }
  ],
  "context_used": 3
}
```

### GET /api/ops/audit

Audit infrastructure against desired state.

**Query Parameters:**
- `scope`: `all` (default), `supabase`, `vercel`, `stripe`
- `mode`: `plan` (default), `apply`

**Response:**
```json
{
  "success": true,
  "mode": "plan",
  "scope": "all",
  "summary": {
    "total_changes": 5,
    "by_severity": {
      "high": 2,
      "medium": 2,
      "low": 1
    },
    "requires_approval": 2,
    "can_auto_apply": 1
  },
  "changes": [
    {
      "id": "table_ops_knowledge",
      "type": "create_table",
      "scope": "supabase",
      "severity": "high",
      "description": "Table 'ops_knowledge' does not exist",
      "risk_level": "high",
      "requires_approval": true,
      "recommended_action": "generate_migration_pr",
      "can_auto_apply": false
    }
  ]
}
```

### POST /api/ops/apply

Apply selected changes from audit.

**Request:**
```json
{
  "changeIds": ["table_ops_knowledge", "bucket_arc-uploads"],
  "options": {
    "generatePR": true,
    "directApply": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "requested": 2,
  "found": 2,
  "results": {
    "applied": [
      {
        "scope": "database",
        "method": "github_pr",
        "pr": {
          "pr_number": 123,
          "pr_url": "https://github.com/..."
        }
      }
    ],
    "failed": [],
    "skipped": []
  }
}
```

### POST /api/ops/slack

Slack webhook for approval workflow (stub).

**Supported Commands:**
- `/ops approve <change_id>` - Approve a change
- `/ops reject <change_id>` - Reject a change
- `/ops review <change_id>` - Request review details
- `/ops status` - Get pending approvals
- `/ops help` - Show help message

## Environment Variables

### Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI (for embeddings and Q&A)
OPENAI_API_KEY=sk-...

# AI Ops API Security
OPS_API_TOKEN=your-secret-token-for-ops-api
```

### Optional

```bash
# AI Ops Configuration
OPS_EMBEDDINGS_PROVIDER=openai
OPS_EMBEDDINGS_MODEL=text-embedding-3-large
OPS_ALLOW_DIRECT_APPLY=false

# GitHub (for PR creation)
GITHUB_TOKEN=ghp_...
GITHUB_REPO_OWNER=your-org-or-username
GITHUB_REPO_NAME=circle-network

# Slack (for approval workflow)
SLACK_SIGNING_SECRET=your-slack-signing-secret
SLACK_BOT_TOKEN=xoxb-...
SLACK_OPS_CHANNEL_ID=C01234567
```

## Setup Instructions

### 1. Install Dependencies

Dependencies are already installed:
- `openai` - OpenAI SDK for embeddings and chat
- `js-yaml` - YAML parsing for configuration
- `@octokit/rest` - GitHub API client

### 2. Apply Database Migration

Run the migration to create the `ops_knowledge` table:

```bash
# Using Supabase CLI (if available)
supabase db push

# Or apply directly via Supabase dashboard
# Copy contents of supabase/migrations/20251031044850_create_ops_knowledge.sql
# and execute in SQL Editor
```

### 3. Configure Environment Variables

Add required environment variables to your `.env` file or Vercel project settings:

```bash
# Minimum required
OPENAI_API_KEY=sk-...
OPS_API_TOKEN=your-secret-token-for-ops-api

# Optional but recommended
GITHUB_TOKEN=ghp_...
GITHUB_REPO_OWNER=salamah551
GITHUB_REPO_NAME=circle-network
```

### 4. Ingest Knowledge Base

Ingest priority documents:

```bash
curl -X POST https://your-app.vercel.app/api/ops/ingest \
  -H "Authorization: Bearer YOUR_OPS_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "priority",
    "includeMarkdown": true,
    "includeCode": false
  }'
```

### 5. Run Initial Audit

Check infrastructure against desired state:

```bash
curl -X GET "https://your-app.vercel.app/api/ops/audit?scope=all&mode=plan" \
  -H "Authorization: Bearer YOUR_OPS_API_TOKEN"
```

### 6. Review and Apply Changes

Review the audit results and apply selected changes:

```bash
curl -X POST https://your-app.vercel.app/api/ops/apply \
  -H "Authorization: Bearer YOUR_OPS_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "changeIds": ["table_ops_knowledge", "bucket_arc-uploads"],
    "options": {
      "generatePR": true,
      "directApply": false
    }
  }'
```

## Usage Examples

### Ask a Question

```bash
curl -X POST https://your-app.vercel.app/api/ops/ask \
  -H "Authorization: Bearer YOUR_OPS_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are the pricing tiers and their limits?"
  }'
```

### Audit Specific Scope

```bash
# Audit only Supabase
curl -X GET "https://your-app.vercel.app/api/ops/audit?scope=supabase&mode=plan" \
  -H "Authorization: Bearer YOUR_OPS_API_TOKEN"

# Audit only environment variables
curl -X GET "https://your-app.vercel.app/api/ops/audit?scope=vercel&mode=plan" \
  -H "Authorization: Bearer YOUR_OPS_API_TOKEN"
```

### Apply Changes Directly (with OPS_ALLOW_DIRECT_APPLY=true)

```bash
curl -X POST https://your-app.vercel.app/api/ops/apply \
  -H "Authorization: Bearer YOUR_OPS_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "changeIds": ["bucket_arc-uploads"],
    "options": {
      "directApply": true
    }
  }'
```

## Security Considerations

1. **API Authentication:** All endpoints require `OPS_API_TOKEN` in Authorization header
2. **Direct Apply:** Disabled by default. Set `OPS_ALLOW_DIRECT_APPLY=true` to enable
3. **High-Risk Changes:** Require approval by default, cannot be directly applied
4. **Slack Signature Verification:** Validates Slack webhook signatures when `SLACK_SIGNING_SECRET` is configured
5. **Migration Review:** Database changes generate PRs for review by default

## Configuration Files

### ops/desired_state.yaml

Declares the desired state of infrastructure:
- Database tables and columns
- Storage buckets and policies
- Environment variables
- Pricing tiers and limits
- Onboarding rules

### ops/change_policy.yaml

Defines policies for applying changes:
- Risk levels per change type
- Approval requirements
- Default actions (PR vs direct apply)
- Safety checks
- Rollback policies

## Troubleshooting

### Knowledge Base Not Responding

Check that:
1. Migration has been applied: `ops_knowledge` table exists
2. OpenAI API key is configured
3. Documents have been ingested (check via `GET /api/ops/ingest`)

### Audit Returns No Changes

This is normal if infrastructure matches desired state. To test:
1. Check environment variables are set
2. Review `ops/desired_state.yaml` requirements
3. Try different scopes: `supabase`, `vercel`, `stripe`

### Apply Fails with "Direct apply not allowed"

Set `OPS_ALLOW_DIRECT_APPLY=true` or use `generatePR: true` to create a PR instead.

### GitHub PR Creation Fails

Ensure these environment variables are set:
- `GITHUB_TOKEN` - Personal access token with repo permissions
- `GITHUB_REPO_OWNER` - Repository owner/organization
- `GITHUB_REPO_NAME` - Repository name

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   AI Ops Control Plane                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Ingest     │  │     Ask      │  │    Audit     │  │
│  │   /ingest    │  │     /ask     │  │    /audit    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                  │                  │          │
│         v                  v                  v          │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Knowledge Base (ops_knowledge)           │   │
│  │       Vector Embeddings + Metadata              │   │
│  └──────────────────────────────────────────────────┘   │
│         │                  │                  │          │
│         v                  v                  v          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  OpenAI API  │  │  Supabase    │  │   GitHub     │  │
│  │  Embeddings  │  │  Audit       │  │   PRs        │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    Apply     │  │    Slack     │  │   Policy     │  │
│  │    /apply    │  │    /slack    │  │   Engine     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Future Enhancements

1. **Full Approval Workflow:** Complete Slack integration with persistent approval state
2. **Vercel API Integration:** Automated environment variable management
3. **Stripe API Integration:** Price verification and creation
4. **Rollback Automation:** Automatic rollback on failed migrations
5. **Change History:** Track all applied changes with audit log
6. **Multi-Provider Support:** Support for different embedding providers (Azure, Cohere, etc.)
7. **Advanced Scheduling:** Scheduled audits and automatic remediation
8. **Metrics Dashboard:** Web UI for monitoring ops activities
9. **Integration Tests:** Comprehensive test coverage for all endpoints
10. **Terraform Export:** Generate Terraform configs from desired state

## Support

For issues or questions:
1. Check this documentation
2. Review configuration files in `ops/` directory
3. Check API endpoint responses for detailed error messages
4. Review logs in Vercel dashboard or local console

## License

Part of the Circle Network application.
