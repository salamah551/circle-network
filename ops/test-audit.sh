#!/bin/bash
# Test script for ops audit endpoint

set -e

echo "Testing AI Ops Control Plane Audit Endpoint"
echo "============================================"
echo ""

# Check if server is running
if ! curl -s http://localhost:5000 > /dev/null 2>&1; then
  echo "Error: Server not running on http://localhost:5000"
  echo "Please start with: npm run dev"
  exit 1
fi

# Set default secret if not provided
OPS_SECRET=${OPS_SECRET:-"test-secret"}

echo "1. Testing audit endpoint (all scopes)..."
curl -X POST "http://localhost:5000/api/ops/audit?scope=all" \
  -H "Authorization: Bearer $OPS_SECRET" \
  -H "Content-Type: application/json" \
  -s | jq '.' || echo "Failed or returned non-JSON"

echo ""
echo "2. Testing audit endpoint (single scope - posthog)..."
curl -X POST "http://localhost:5000/api/ops/audit?scope=posthog" \
  -H "Authorization: Bearer $OPS_SECRET" \
  -H "Content-Type: application/json" \
  -s | jq '.' || echo "Failed or returned non-JSON"

echo ""
echo "3. Testing unauthorized access (should fail)..."
curl -X POST "http://localhost:5000/api/ops/audit?scope=all" \
  -H "Authorization: Bearer wrong-secret" \
  -s | jq '.' || echo "Failed or returned non-JSON"

echo ""
echo "4. Testing GET method (should return 405)..."
curl -X GET "http://localhost:5000/api/ops/audit" \
  -H "Authorization: Bearer $OPS_SECRET" \
  -s | jq '.' || echo "Failed or returned non-JSON"

echo ""
echo "Tests complete!"
