import { test, expect } from '@playwright/test';

test.describe('Authentication & Authorization Suite', () => {

  test('Owner can securely authenticate via Admin Credentials', async ({ page }) => {
    // Navigate to Admin Login
    await page.goto('/admin/login');
    
    // Default Owner Seed account
    await page.fill('input[type="email"]', 'admin@gdifuture.works');
    // Using corresponding ADMIN_SEED_PASSWORD environment fallback securely
    await page.fill('input[type="password"]', 'testadminpassword');
    await page.click('button[type="submit"]');

    // Wait for the Edge Middleware to confirm the HttpOnly Auth Cookie securely and route
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.locator('h1')).toContainText(/Dashboard/i);
  });

  test('Identity Matrix Guard - Edge Middleware forcibly redirects unauthenticated users', async ({ page }) => {
    // Attempt forced deep-link traversal to secure `/admin` directory
    await page.goto('/admin/users');
    await expect(page).toHaveURL(/\/admin\/login/);

    // Attempt traversal to Student Profile panel
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login/);
  });
});
