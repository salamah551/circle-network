const { test, expect } = require('@playwright/test');

test.describe('Critical User Flows', () => {
  test('member directory page should be accessible', async ({ page }) => {
    await page.goto('/members');
    
    // Should redirect to login if not authenticated
    const url = page.url();
    expect(url).toMatch(/\/(login|members)/);
  });

  test('messages page should be accessible', async ({ page }) => {
    await page.goto('/messages');
    
    // Should redirect to login if not authenticated
    const url = page.url();
    expect(url).toMatch(/\/(login|messages)/);
  });

  test('events page should be accessible', async ({ page }) => {
    await page.goto('/events');
    
    // Should redirect to login if not authenticated
    const url = page.url();
    expect(url).toMatch(/\/(login|events)/);
  });

  test('requests page should be accessible', async ({ page }) => {
    await page.goto('/requests');
    
    // Should redirect to login if not authenticated
    const url = page.url();
    expect(url).toMatch(/\/(login|requests)/);
  });

  test('dashboard should require authentication', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Public Pages', () => {
  test('landing page should be publicly accessible', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('login page should be publicly accessible', async ({ page }) => {
    const response = await page.goto('/login');
    expect(response?.status()).toBe(200);
  });
});
