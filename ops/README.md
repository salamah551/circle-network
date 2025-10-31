# AI Ops Control Plane Configuration

This directory contains configuration files for the AI Ops Control Plane.

## Files

### desired_state.yaml

Declares the desired state of infrastructure across:
- **Onboarding rules:** Required fields, gates, redirects
- **Pricing tiers:** Core ($179), Pro ($299), Elite ($499)
- **Database tables:** Schema requirements, RLS, indexes
- **Storage buckets:** Access policies, size limits
- **Environment variables:** Required and optional configuration
- **Vercel:** Environment completeness checks
- **Stripe:** Price ID verification

### change_policy.yaml

Defines policies for applying changes:
- **Risk levels:** High, medium, low per change type
- **Default actions:** PR generation vs direct apply
- **Approval requirements:** Which changes need review
- **Safety checks:** Pre/post apply validations
- **Rollback policy:** Automatic rollback configuration

## Usage

These configuration files are automatically loaded by the AI Ops Control Plane when running audits and applying changes.

### Auditing Against Desired State

```bash
# Audit all scopes
curl -X GET "https://your-app.vercel.app/api/ops/audit?scope=all&mode=plan" \
  -H "Authorization: Bearer YOUR_OPS_API_TOKEN"

# Audit specific scope
curl -X GET "https://your-app.vercel.app/api/ops/audit?scope=supabase&mode=plan" \
  -H "Authorization: Bearer YOUR_OPS_API_TOKEN"
```

### Applying Changes

```bash
# Generate PR for review
curl -X POST https://your-app.vercel.app/api/ops/apply \
  -H "Authorization: Bearer YOUR_OPS_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "changeIds": ["table_example", "bucket_example"],
    "options": {
      "generatePR": true
    }
  }'

# Direct apply (requires OPS_ALLOW_DIRECT_APPLY=true)
curl -X POST https://your-app.vercel.app/api/ops/apply \
  -H "Authorization: Bearer YOUR_OPS_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "changeIds": ["bucket_example"],
    "options": {
      "directApply": true
    }
  }'
```

## Customization

### Adding New Tables

Edit `desired_state.yaml` under `database.tables`:

```yaml
- name: my_new_table
  rls_enabled: true
  required_columns:
    - id
    - user_id
    - data
    - created_at
  indexes:
    - name: my_new_table_user_id_idx
      type: btree
      column: user_id
```

### Adding New Environment Variables

Edit `desired_state.yaml` under `environment.required` or `environment.optional`:

```yaml
environment:
  required:
    my_service:
      - MY_SERVICE_API_KEY
      - MY_SERVICE_ENDPOINT
```

### Changing Risk Policies

Edit `change_policy.yaml` to adjust risk levels and actions:

```yaml
database:
  change_types:
    create_table:
      risk_level: high
      requires_approval: true
      action: generate_migration_pr
```

## Best Practices

1. **Review Changes:** Always review audit results before applying
2. **Test in Dev:** Test changes in development environment first
3. **Use PRs:** Generate PRs for review when possible
4. **Backup Data:** Ensure backups before applying database changes
5. **Version Control:** Commit configuration changes to git
6. **Document Changes:** Update this README when adding new requirements

## Safety Features

- **Default PR Generation:** Database changes create PRs by default
- **Approval Requirements:** High-risk changes require review
- **Direct Apply Guard:** Requires `OPS_ALLOW_DIRECT_APPLY=true`
- **Rollback Scripts:** Migrations include rollback capability
- **Change Validation:** Pre-apply checks validate SQL syntax

## Related Documentation

- [AI_OPS_CONTROL_PLANE.md](../AI_OPS_CONTROL_PLANE.md) - Complete system documentation
- [Supabase Migrations](../supabase/migrations/) - Database migration files
- [API Routes](../app/api/ops/) - AI Ops API implementation

## Support

For questions or issues:
1. Review configuration file comments
2. Check AI_OPS_CONTROL_PLANE.md for detailed documentation
3. Test configuration with `GET /api/ops/audit`
