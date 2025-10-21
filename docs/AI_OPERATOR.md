# AI Operator Documentation

## Overview

The AI Operator is a backend AI service designed to automate and assist with various administrative and operational tasks for the Circle Network platform. It provides a single endpoint API that routes tasks to specialized handlers and returns structured responses.

## Environment Variables

### Required

- **`OPENAI_API_KEY`** (server-only): Your OpenAI API key for AI-powered operations.
  - This is required for the AI Operator to function.
  - Keep this secret secure and never commit it to version control.
  - Set this in your hosting environment (e.g., Vercel environment variables).

### Existing Variables

The AI Operator also uses these existing environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key for admin operations
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key for client operations

## API Endpoint

### POST /api/ai/operator

Single entry point for all AI Operator tasks.

#### Authentication

Requires admin authentication via Supabase session token in the Authorization header:

```
Authorization: Bearer <session_access_token>
```

#### Request Format

```json
{
  "task": "string",
  "payload": {
    // optional task-specific data
  }
}
```

#### Response Format

Success response:
```json
{
  "ok": true,
  "task": "string",
  "data": {
    // task-specific response data
  }
}
```

Error response:
```json
{
  "ok": false,
  "task": "string | null",
  "error": "string"
}
```

#### HTTP Status Codes

- `200` - Success
- `400` - Bad request (invalid task or missing parameters)
- `401` - Unauthorized (missing or invalid authentication)
- `403` - Forbidden (user is not an admin)
- `429` - Rate limit exceeded
- `500` - Internal server error

#### Rate Limiting

The API implements a token bucket rate limiter per IP address:
- **Max requests**: 10 requests
- **Time window**: 60 seconds
- **Refill rate**: 1 token per second

When rate limit is exceeded, the API returns a 429 status code.

## Available Tasks

### 1. analyze_analytics

Analyzes platform analytics and provides strategic insights.

**Request:**
```json
{
  "task": "analyze_analytics"
}
```

**Response:**
```json
{
  "ok": true,
  "task": "analyze_analytics",
  "data": {
    "message": "Analytics analyzer ready",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Note**: This is currently a placeholder. Full implementation will be added in milestone 2.

### 2. generate_daily_campaigns

Generates daily email campaigns for community engagement.

**Request:**
```json
{
  "task": "generate_daily_campaigns"
}
```

**Response:**
```json
{
  "ok": true,
  "task": "generate_daily_campaigns",
  "data": {
    "message": "Campaign generator ready",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Note**: This is currently a placeholder. Full implementation will be added in milestone 2.

### 3. diagnose_error

Diagnoses errors and provides AI-powered recommendations.

**Request:**
```json
{
  "task": "diagnose_error",
  "payload": {
    "error_description": "Description of the error or problem"
  }
}
```

**Response:**
```json
{
  "ok": true,
  "task": "diagnose_error",
  "data": {
    "message": "Diagnostics ready",
    "error_description": "Description of the error or problem",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Note**: This is currently a placeholder. Full AI-powered diagnostics will be added in milestone 2.

## Accessing the AI Command Center

### Web Interface

1. Log in to your Circle Network account
2. Navigate to the Admin Dashboard at `/admin`
3. Click on the "AI Command Center" card in the Quick Actions section
4. You'll be redirected to `/admin/operator`

### Authorization Requirements

- User must be logged in with a valid Supabase session
- User's profile must have `is_admin` set to `true` in the profiles table
- Non-admin users will be redirected to `/dashboard`
- Unauthenticated users will be redirected to `/login`

### UI Features

The AI Command Center provides:

1. **Analytics & Strategic Insights Section**
   - "Ping Analytics Engine" button to test the analytics analyzer

2. **Community & Campaign Management Section**
   - "Ping Campaign Generator" button to test the campaign generator

3. **Error Diagnostics Section**
   - Text area to describe errors or problems
   - "Get AI Recommendation" button to get diagnostics

4. **Output Pane**
   - Displays task execution results
   - Shows loading states during task execution
   - Displays error messages if tasks fail
   - Shows JSON response data on success

## Security Considerations

### What is Logged

The system logs only:
- Task names
- Task execution timing (in milliseconds)
- Admin email (who triggered the task)
- Generic error messages

### What is NOT Logged

The system never logs:
- API keys or secrets
- Sensitive user data
- Full payload contents that might contain private information

### Best Practices

1. Always use HTTPS in production
2. Keep `OPENAI_API_KEY` secure and rotate periodically
3. Monitor rate limit patterns for abuse
4. Review admin access regularly
5. Keep Supabase service role key secure

## Development

### Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables in `.env.local`:
   ```
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Access the AI Command Center at: `http://localhost:5000/admin/operator`

### Testing the API

You can test the API using curl or any HTTP client:

```bash
# Get session token from browser dev tools or Supabase auth

curl -X POST http://localhost:5000/api/ai/operator \
  -H "Authorization: Bearer <your_session_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "diagnose_error",
    "payload": {
      "error_description": "Test error"
    }
  }'
```

## Future Enhancements (Milestone 2+)

- Integration with PostHog for real analytics data
- Integration with Supabase for campaign management
- Full AI-powered analysis and recommendations using OpenAI
- More sophisticated task handlers
- Task scheduling and automation
- Audit logging for all AI operations
- Extended rate limiting with Redis for multi-instance deployments
- Webhook support for async task completion

## Support

For questions or issues with the AI Operator:
1. Check the logs in Vercel console
2. Verify environment variables are set correctly
3. Ensure admin access is properly configured
4. Review the API response error messages
