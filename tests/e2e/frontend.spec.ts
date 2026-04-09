import { test, expect } from '@playwright/test';

test.describe('Frontend Smoke Tests', () => {

  test('Homepage loads successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
    await expect(page).toHaveTitle(/.+/);
  });

  test('Course page loads with MYR pricing', async ({ page }) => {
    await page.goto('/courses/data-analytics');
    await expect(page.locator('text=MYR').first()).toBeVisible({ timeout: 10000 });
  });

  test('About page loads', async ({ page }) => {
    const response = await page.goto('/about');
    expect(response?.status()).toBeLessThan(400);
  });

  test('Privacy page loads', async ({ page }) => {
    const response = await page.goto('/privacy');
    expect(response?.status()).toBeLessThan(400);
  });
});
