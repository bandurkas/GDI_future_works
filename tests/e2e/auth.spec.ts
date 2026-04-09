import { test, expect } from '@playwright/test';

test.describe('Auth & Route Guards', () => {

  test('CRM: unauthenticated user redirected to /crm/login', async ({ page }) => {
    await page.goto('/crm/students');
    await expect(page).toHaveURL(/\/crm\/login/);
  });

  test('CRM: login page renders form', async ({ page }) => {
    await page.goto('/crm/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('Student profile: unauthenticated user redirected to /login', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Dashboard: unauthenticated user redirected to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
