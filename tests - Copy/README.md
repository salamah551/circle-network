# Testing Documentation

## Overview

The Circle Network has two testing approaches:

1. **Manual Test Plan** - Comprehensive checklist for thorough feature validation
2. **Playwright E2E Tests** - Automated browser tests for critical flows

## Manual Testing

See [MANUAL_TEST_PLAN.md](./MANUAL_TEST_PLAN.md) for the complete manual testing checklist.

### When to Use Manual Testing
- Pre-launch feature validation
- Post-launch regression testing  
- UI/UX verification
- Cross-browser compatibility checks
- Security and performance validation

## Automated Testing (Playwright)

### Setup

The project includes Playwright configuration and test files:

- `playwright.config.js` - Playwright configuration
- `tests/landing-page.spec.js` - Landing page tests
- `tests/pricing.spec.js` - Pricing logic tests
- `tests/critical-flows.spec.js` - Authentication and routing tests

### Running Tests

```bash
# Run all tests
npm test

# Run tests in UI mode (for debugging)
npm run test:ui

# Show test report
npm run test:report
```

### Replit Environment Setup

Due to Replit's environment limitations, Playwright requires system-level browser dependencies installed via Nix:

1. **Add System Dependencies** (via Replit UI or replit.nix):
   - `playwright-driver`
   - `chromium`

2. **Install Playwright browsers**:
   ```bash
   npx playwright install chromium
   ```

3. **Verify setup**:
   ```bash
   npm test
   ```

### Test Coverage

#### Landing Page Tests
- Countdown timer display
- Founding member scarcity messaging
- Member login functionality
- Success stories section

#### Pricing Tests
- Pre-launch: Founding member plan visibility
- Post-launch: Monthly and annual plan display
- Stripe checkout integration

#### Critical Flow Tests
- Authentication requirement for protected pages
- Public page accessibility
- Proper redirects for unauthenticated users
- Page routing and navigation

### Writing New Tests

Create new test files in `tests/` directory:

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/path');
    await expect(page.locator('text=Something')).toBeVisible();
  });
});
```

### Authentication in Tests

For tests requiring authentication, use Supabase test credentials:

```javascript
test('authenticated flow', async ({ page }) => {
  // Login logic here
  await page.goto('/login');
  // Fill in credentials
  // Proceed with authenticated test
});
```

## Test Data

### Required Test Accounts
- Admin: nahdasheh@gmail.com
- 5 test members with varied profiles

### Test Database
Tests should use development database (not production)

## Continuous Integration

When setting up CI/CD:

1. Install Playwright in CI environment
2. Run `npx playwright install --with-deps`
3. Execute tests: `npm test`
4. Archive test reports as CI artifacts

## Troubleshooting

### Browser Installation Fails
- Verify Nix dependencies are installed
- Check Replit system dependencies panel
- Try: `npx playwright install chromium` (without --with-deps)

### Tests Timeout
- Increase timeout in playwright.config.js
- Check dev server is running on port 5000
- Verify no firewall blocks

### Authentication Issues
- Clear browser state between tests
- Use separate test database
- Check Supabase test credentials

## Best Practices

1. **Keep tests independent** - Each test should work in isolation
2. **Use data-testid attributes** - For stable selectors
3. **Mock external services** - Stripe, SendGrid in test mode
4. **Test user journeys** - Focus on complete flows, not individual actions
5. **Maintain test data** - Keep test accounts and data consistent

## Coverage Goals

- ✅ Core navigation and routing
- ✅ Public pages accessibility
- ✅ Authentication flows
- 🔄 Member onboarding journey (requires auth setup)
- 🔄 Feature interactions (requires auth setup)
- 🔄 Real-time updates (requires WebSocket mocking)

## Next Steps

To achieve comprehensive automated coverage:

1. Set up Supabase test authentication
2. Add tests for authenticated user flows
3. Mock Stripe checkout for payment tests
4. Test real-time features with WebSocket mocks
5. Add visual regression testing
6. Integrate with CI/CD pipeline

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Replit Nix Guide](https://docs.replit.com/replit-workspace/dependency-management)
- [Supabase Testing Guide](https://supabase.com/docs/guides/auth/testing)
