# AI Ops Control Plane

The AI Ops Control Plane is a knowledge-aware autonomous agent that understands the Circle Network platform and can audit and fix infrastructure configuration end-to-end.

## Features

### 1. Knowledge Ingestion & Q&A
- **Ingests** documentation, code, and configuration into a vector database
- **RAG-powered Q&A** using OpenAI embeddings and GPT models
- **Incremental reindexing** with change detection via content checksums
- **Keyword + Vector search** for comprehensive context retrieval

### 2. Desired State Orchestration
- **YAML configuration** defining the complete platform state
- **Multi-environment support** (dev, preview, production)
- **Connectors** for Supabase, Storage, Vercel, Stripe, and GitHub
- **Plan/Apply workflow** with approval gates

### 3. Infrastructure Connectors

#### Supabase Connector
- Diffs database tables and RLS policies
- Generates SQL migrations for schema changes
- Supports direct apply when `OPS_ALLOW_DIRECT_APPLY=true`

#### Storage Connector
- Verifies bucket existence and configuration
- Checks RLS policies on storage objects
- Creates private buckets with proper access controls

#### Vercel Connector
- Audits environment variables across environments
- Verifies cron job definitions
- Generates deployment checklist for missing config

#### Stripe Connector
- Read-only by default for safety
- Verifies products, prices, and webhook endpoints
- Generates documentation for manual setup

### 4. Chat/Q&A Interface
The `/api/ops/ask` endpoint answers questions and can generate infrastructure plans:

```bash
curl -X POST https://your-domain.com/api/ops/ask \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Make sure Supabase has all the right tables",
    "generatePlan": true
  }'
```

## Setup

### 1. Environment Variables

Add to `.env.local`:

```bash
# Required for AI Ops
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional
OPS_EMBEDDINGS_PROVIDER=openai
OPS_EMBEDDINGS_MODEL=text-embedding-3-large
OPS_GPT_MODEL=gpt-4-turbo-preview
OPS_ALLOW_DIRECT_APPLY=false

# Vercel integration (optional)
VERCEL_API_TOKEN=your-token
VERCEL_PROJECT_ID=your-project-id

# Slack integration (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

### 2. Database Setup

Run the ops migration to create required tables:

```bash
# Apply migration in Supabase SQL Editor
supabase/migrations/20251031_ops_knowledge.sql
```

This creates:
- `ops_knowledge` - Vector store for documentation/code
- `ops_plans` - Infrastructure change plans
- `ops_audit_log` - Audit trail for all operations

### 3. Initial Knowledge Ingestion

Ingest documentation and code into the knowledge base:

```bash
curl -X POST https://your-domain.com/api/ops/ingest \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"forceReindex": true}'
```

This indexes:
- All markdown documentation files
- Key configuration files
- Database migrations
- Application routes and code

### 4. Configuration

Edit `ops/config/desired_state.yaml` to define your infrastructure:

- App routes and access controls
- Onboarding rules and gates
- Pricing tiers and capabilities
- Required environment variables
- Database schema requirements
- Storage bucket configuration
- Vercel cron jobs
- Stripe products and webhooks

## API Endpoints

### Health Check
```bash
GET /api/ops/ingest
GET /api/ops/ask
```

### Knowledge Ingestion
```bash
POST /api/ops/ingest
{
  "forceReindex": false,
  "sourcePaths": ["README.md", "ops/config/desired_state.yaml"],
  "sourceTypes": ["markdown", "config"]
}
```

### Q&A
```bash
POST /api/ops/ask
{
  "question": "What are the pricing tiers and their ARC caps?",
  "generatePlan": false,
  "maxResults": 10,
  "similarityThreshold": 0.7
}
```

### Generate Plan
```bash
POST /api/ops/plan
{
  "connectors": ["supabase", "storage", "vercel", "stripe"],
  "saveToDatabase": true
}
```

Returns a plan showing differences between desired and current state.

### Apply Plan
```bash
POST /api/ops/apply
{
  "plan_id": "uuid-of-saved-plan",
  "force": false
}
```

Applies infrastructure changes. By default generates migrations/PRs. Set `OPS_ALLOW_DIRECT_APPLY=true` for direct changes (dangerous).

### Get Plans
```bash
GET /api/ops/plan
```

Returns recent infrastructure plans.

## Architecture

### Knowledge Base
```
ops_knowledge table
├── source_type (markdown, code, sql, config)
├── source_path (relative path)
├── content (full text)
├── embedding (vector(1536))
├── keywords (tsvector)
└── checksum (SHA256)
```

Uses pgvector for similarity search and PostgreSQL full-text search for keywords.

### Connectors
```
ops/connectors/
├── base.ts          # Base connector interface
├── supabase.ts      # Database & RLS
├── storage.ts       # Storage buckets
├── vercel.ts        # Env vars & cron
└── stripe.ts        # Products & webhooks
```

Each connector:
1. **Verifies** connection
2. **Plans** changes by diffing desired vs current state
3. **Applies** changes (or generates migrations/PRs)

### Plan/Apply Workflow
```
1. Generate Plan
   ├── Load desired_state.yaml
   ├── Query current infrastructure state
   ├── Diff desired vs current
   └── Save plan to ops_plans table

2. Review Plan
   ├── Check risk levels (low/medium/high)
   ├── Review required approvals
   └── Approve or reject

3. Apply Plan
   ├── Direct apply (if OPS_ALLOW_DIRECT_APPLY=true)
   └── Generate migrations/PRs (default)
```

## Security

- **Admin-only access** - All endpoints require admin role
- **Approval workflow** - High-risk changes require approval
- **Audit logging** - All operations logged to ops_audit_log
- **RLS enabled** - All ops tables protected by RLS
- **Read-only by default** - Stripe connector is read-only
- **Migration-based** - Supabase changes generate SQL migrations

## Examples

### Example 1: Check Infrastructure Drift
```bash
# Ask about current state
curl -X POST /api/ops/ask \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"question": "Are all required environment variables configured?"}'

# Generate drift plan
curl -X POST /api/ops/plan \
  -H "Authorization: Bearer $TOKEN"
```

### Example 2: Ensure Supabase Tables Exist
```bash
curl -X POST /api/ops/ask \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "question": "Make sure Supabase has all the right tables for ARC and BriefPoint",
    "generatePlan": true
  }'
```

### Example 3: Verify Pricing Configuration
```bash
curl -X POST /api/ops/ask \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "question": "Verify that Stripe has Core, Pro, and Elite tiers configured correctly"
  }'
```

## Troubleshooting

### "Embeddings API key not configured"
Set `OPENAI_API_KEY` in your environment variables.

### "Unauthorized - Admin access required"
Ensure your user has `role = 'admin'` in the profiles table and you're passing a valid Bearer token.

### "Direct apply is disabled"
This is the default safe behavior. Changes generate migrations/PRs instead of applying directly. Set `OPS_ALLOW_DIRECT_APPLY=true` to override (not recommended for production).

### "Vector search not working"
Ensure pgvector extension is enabled in Supabase and the ivfflat index is created.

## Future Enhancements

- [ ] GitHub connector for automated PR creation
- [ ] Slack approval workflow integration
- [ ] Advanced migration diff generation
- [ ] Rollback functionality
- [ ] Scheduled drift detection
- [ ] Cost estimation for infrastructure changes
- [ ] Integration with BriefPoint and HNWI specs
- [ ] Support for alternative embedding providers
