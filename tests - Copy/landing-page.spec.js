const { test, expect } = require('@playwright/test');

test.describe('Landing Page', () => {
  test('should display countdown timer and founding member scarcity', async ({ page }) => {
    await page.goto('/');
    
    // Check countdown timer exists
    await expect(page.locator('text=Official Launch:')).toBeVisible();
    await expect(page.locator('text=October 15, 2025')).toBeVisible();
    
    // Check scarcity messaging
    await expect(page.locator('text=/.*Founding Spots Left.*/i')).toBeVisible();
    
    // Check main headline
    await expect(page.locator('text=/Stop Building Alone/i')).toBeVisible();
  });

  test('should have working member login button', async ({ page }) => {
    await page.goto('/');
    
    const loginButton = page.locator('text=Member Login');
    await expect(loginButton).toBeVisible();
    
    await loginButton.click();
    await expect(page).toHaveURL('/login');
  });

  test('should display success stories section', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to success stories
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check for success stories heading
    await expect(page.locator('text=/Success Stories/i')).toBeVisible();
    
    // Check for value created banner
    await expect(page.locator('text=/\\$.*in value created/i')).toBeVisible();
  });
});
