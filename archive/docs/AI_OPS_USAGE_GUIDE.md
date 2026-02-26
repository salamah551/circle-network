# AI Ops Control Plane - Usage Guide

## Quick Start

The AI Ops Control Plane is now immediately usable end-to-end through the admin console. This guide shows you how to use it.

## Prerequisites

### Required Environment Variables

```bash
# Supabase (Required - must be set in production, gracefully handled in dev)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI (Required for embeddings and Q&A)
OPENAI_API_KEY=sk-...

# AI Ops API Security (Required)
OPS_API_TOKEN=your-secret-token-for-ops-api

# Enable Ops Console Access (Required to access /admin/ops)
OPS_ADMIN_ENABLED=true

# Stripe Price IDs (checked by audit - use FOUNDING/PREMIUM/ELITE names)
NEXT_PUBLIC_STRIPE_PRICE_FOUNDING=price_...
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM=price_...
NEXT_PUBLIC_STRIPE_PRICE_ELITE=price_...
```

### Optional Environment Variables

```bash
# GitHub (for PR creation)
GITHUB_TOKEN=ghp_...
GITHUB_REPO_OWNER=salamah551
GITHUB_REPO_NAME=circle-network

# Slack (for approval workflow - stub)
SLACK_SIGNING_SECRET=your-slack-signing-secret
SLACK_BOT_TOKEN=xoxb-...
SLACK_OPS_CHANNEL_ID=C01234567

# AI Ops Configuration
OPS_EMBEDDINGS_PROVIDER=openai
OPS_EMBEDDINGS_MODEL=text-embedding-3-large
OPS_ALLOW_DIRECT_APPLY=false
```

## Setup Steps

### 1. Apply Database Migration

The migration file creates the knowledge base table with vector embeddings support.

**Using Supabase CLI:**
```bash
supabase db push
```

**Using Supabase Dashboard:**
1. Go to SQL Editor in your Supabase dashboard
2. Copy contents of `supabase/migrations/20251031044850_create_ops_knowledge.sql`
3. Execute the SQL

**What the migration does:**
- Enables pgvector extension
- Creates `ops_knowledge` table with vector embeddings (dimension 3072)
- Creates indexes for efficient similarity search
- Creates RPC function `match_ops_knowledge` for semantic search
- Grants permissions to service role

### 2. Configure Environment Variables

Add the required environment variables to your `.env.local` file or Vercel project settings:

```bash
# Generate a secure OPS_API_TOKEN
OPS_API_TOKEN=$(openssl rand -hex 32)

# Add to .env.local
echo "OPS_API_TOKEN=$OPS_API_TOKEN" >> .env.local
```

### 3. Access Admin Ops Console

The Ops Console is available at:
```
https://your-app.vercel.app/admin/ops
```

Or locally:
```
http://localhost:5000/admin/ops
```

**Requirements:**
- You must be logged in as an admin user
- Your profile must have `is_admin = true` in the database

## Using the Admin Ops Console

### Tab 1: Ingest Knowledge

**Purpose:** Load documentation and code into the vector database for RAG-based Q&A.

**Steps:**
1. Navigate to the "Ingest Knowledge" tab
2. Select ingestion mode:
   - **Priority Documents Only (Recommended):** Ingests key documentation files
   - **Full Repository:** Includes all markdown and code files (slower)
3. Click "Start Ingestion"
4. Wait for completion (typically 30-60 seconds for priority mode)

**Priority Documents Ingested:**
- `IMPLEMENTATION-SUMMARY.md`
- `ONBOARDING_IMPLEMENTATION.md`
- `AI_ONBOARDING_IMPLEMENTATION.md`
- `README-DEPLOY-NOTES.md`
- `BULK_INVITES_FIX_SUMMARY.md`
- `CODE_EXAMPLES.md`
- `BriefPoint_Build_Spec_v1.md`

**Success Indicators:**
- Green checkmark with summary (Total, Success, Failed counts)
- Updated statistics showing total chunks ingested

### Tab 2: Ask Questions

**Purpose:** Query the knowledge base using natural language. Get AI-generated answers with citations.

**Steps:**
1. Navigate to the "Ask Questions" tab
2. Type your question in the text area
3. Click "Get Answer"
4. Review the answer and citations

**Example Questions:**
```
- How does the onboarding flow work?
- What are the pricing tiers and their limits?
- How do I configure the ARC request system?
- What environment variables are required?
- How does the email automation work?
```

**Answer Format:**
- **Answer Section:** AI-generated response based on knowledge base
- **Sources Section:** Citations with file names and similarity scores
- Citations are marked as [1], [2], etc. in the answer text

### Tab 3: Audit Infrastructure

**Purpose:** Check infrastructure against desired state defined in `ops/desired_state.yaml`.

**Steps:**
1. Navigate to the "Audit Infrastructure" tab
2. Select audit scope:
   - **All:** Checks Supabase, Vercel, and Stripe
   - **Supabase Only:** Database tables, columns, storage buckets
   - **Vercel Only:** Environment variables
   - **Stripe Only:** Price IDs and configuration
3. Click "Run Audit"
4. Review detected changes
5. Select changes to apply (checkboxes)
6. Click "Apply X Changes (Generate PR)" to create a pull request

**Change Severity Levels:**
- **High:** Critical changes (e.g., missing tables, RLS policies)
- **Medium:** Important but not critical (e.g., missing storage buckets)
- **Low:** Optional improvements (e.g., missing indexes, optional env vars)

**Audit Results:**
- **Total Changes:** Number of discrepancies detected
- **High Severity:** Critical issues requiring immediate attention
- **Can Auto-Apply:** Changes that can be safely applied automatically

**Apply Workflow:**
- Changes are applied via GitHub PR creation (safe by default)
- PRs include migration files for database changes
- Requires manual review and merge
- Direct apply is disabled by default for safety

## Security Features

### Safe by Default

1. **API Token Authentication:** All ops endpoints require `OPS_API_TOKEN` in Authorization header
2. **Admin Verification:** Server actions verify admin status before executing
3. **No Secrets in Browser:** API token and secrets stay on server, never exposed to client
4. **Server Actions:** All operations use Next.js server actions with server-side execution
5. **PR-Based Changes:** Database changes generate PRs for review by default

### Access Control

- Only users with `is_admin = true` in their profile can access the Ops Console
- Server actions verify admin status on every request
- Failed authentication redirects to login or dashboard

### Rate Limiting

Consider adding rate limiting to prevent abuse:

```bash
# In Vercel, you can use edge config or middleware
# For self-hosted, use nginx or similar
```

## API Endpoints (Advanced)

While the admin console is the recommended way to use the Ops Control Plane, you can also call the API endpoints directly.

### POST /api/ops/ingest

Ingest repository knowledge.

```bash
curl -X POST https://your-app.vercel.app/api/ops/ingest \
  -H "Authorization: Bearer $OPS_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "priority",
    "includeMarkdown": true,
    "includeCode": false
  }'
```

### POST /api/ops/ask

Ask questions using RAG.

```bash
curl -X POST https://your-app.vercel.app/api/ops/ask \
  -H "Authorization: Bearer $OPS_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How does the onboarding flow work?"
  }'
```

### GET /api/ops/audit

Audit infrastructure.

```bash
curl -X GET "https://your-app.vercel.app/api/ops/audit?scope=all&mode=plan" \
  -H "Authorization: Bearer $OPS_API_TOKEN"
```

### POST /api/ops/apply

Apply changes.

```bash
curl -X POST https://your-app.vercel.app/api/ops/apply \
  -H "Authorization: Bearer $OPS_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "changeIds": ["table_ops_knowledge", "bucket_arc-uploads"],
    "options": {
      "generatePR": true,
      "directApply": false
    }
  }'
```

## Troubleshooting

### Knowledge Base Not Responding

**Symptoms:** Ask tab returns "could not find relevant information"

**Solutions:**
1. Check that ingestion completed successfully (Ingest tab shows > 0 chunks)
2. Verify `OPENAI_API_KEY` is configured
3. Re-run ingestion with priority mode
4. Check Supabase connection and `ops_knowledge` table exists

### Audit Returns No Changes

**Symptoms:** Audit shows "No Changes Needed"

**Solutions:**
1. This is normal if infrastructure matches desired state
2. Check `ops/desired_state.yaml` to understand requirements
3. Try different scopes (Supabase, Vercel, Stripe individually)
4. Verify environment variables are accessible to the app

### Server Actions Fail

**Symptoms:** "Unauthorized: Admin access required" error

**Solutions:**
1. Verify you're logged in as an admin user
2. Check `is_admin` column in your profile: `SELECT is_admin FROM profiles WHERE id = 'your-user-id'`
3. Update admin status: `UPDATE profiles SET is_admin = true WHERE id = 'your-user-id'`
4. Clear cookies and log in again

### Migration Fails

**Symptoms:** Error applying migration in Supabase

**Solutions:**
1. Ensure pgvector extension is available (should be pre-installed in Supabase)
2. Check you have admin/service role permissions
3. Try running migration sections individually
4. Contact Supabase support if pgvector is not available

### GitHub PR Creation Fails

**Symptoms:** "Apply" fails with GitHub error

**Solutions:**
1. Verify `GITHUB_TOKEN` is set and has `repo` permissions
2. Check `GITHUB_REPO_OWNER` and `GITHUB_REPO_NAME` are correct
3. Ensure GitHub token hasn't expired
4. Check repository exists and you have write access

## Best Practices

### Regular Maintenance

1. **Weekly Audits:** Run infrastructure audits weekly to catch drift
2. **Re-ingest After Updates:** Re-run ingestion after major documentation updates
3. **Review PRs Promptly:** Review and merge generated PRs within 24-48 hours
4. **Monitor OpenAI Usage:** Track API usage and costs for embeddings and Q&A

### Knowledge Base Management

1. **Start with Priority Mode:** Always start with priority document ingestion
2. **Full Mode Occasionally:** Run full repository ingestion monthly for comprehensive coverage
3. **Update Documentation First:** Keep documentation up-to-date for best Q&A results
4. **Test Questions:** Test common questions after re-ingestion to verify quality

### Security Considerations

1. **Rotate Tokens:** Rotate `OPS_API_TOKEN` quarterly
2. **Limit Admin Access:** Only grant admin access to trusted users
3. **Review Logs:** Regularly review ops logs for suspicious activity
4. **Audit Trail:** Keep a record of all applied changes
5. **Backup Before Apply:** Always backup database before applying high-severity changes

## Support

For issues or questions:
1. Check this documentation first
2. Review the API endpoint documentation in `AI_OPS_CONTROL_PLANE.md`
3. Check configuration files in `ops/` directory
4. Review logs in Vercel dashboard or local console

## Next Steps

After setup:
1. Run your first ingestion (priority mode)
2. Ask a test question to verify RAG is working
3. Run an audit to understand current infrastructure state
4. Review and apply any critical changes
5. Set up regular audit schedules

## Summary

The AI Ops Control Plane provides:
- ✅ End-to-end workflow: ingest → ask → audit
- ✅ Secure by default: admin-only, key-gated, server-side
- ✅ User-friendly: no CLI required, full web UI
- ✅ Safe operations: PR-based changes, no direct apply by default
- ✅ Knowledge-aware: RAG-based Q&A over entire codebase
- ✅ Audit automation: detect drift, suggest fixes

You're now ready to use the AI Ops Control Plane! 🚀
