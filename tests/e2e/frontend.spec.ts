import { test, expect } from '@playwright/test';

test.describe('Frontend Conversion UI Tests', () => {

  test('Global Layout injects GA4 Tags natively', async ({ page }) => {
    await page.goto('/');

    // Locate the injected Google Tag Manager snippet block inside the head
    const headScripts = page.locator('head script');
    const ga4ScriptCount = await headScripts.filter({ hasText: 'G-HJ7BSBB2SF' }).count();
    
    // Validate tag presence natively
    expect(ga4ScriptCount).toBeGreaterThanOrEqual(1);
  });

  test('Pricing Matrix calculates correct localized Checkout variables', async ({ page }) => {
    await page.goto('/courses/data-analytics');

    // Asserts the 400K standard pricing baseline exists inside the localized card block
    const priceText = page.locator('text=IDR 400,000').first();
    await expect(priceText).toBeVisible();

    // Verify the normalized "Consult Advisor" CTA replaces old formatting
    const consultBtn = page.locator('a', { hasText: 'Consult Advisor' }).first();
    await expect(consultBtn).toBeVisible();
  });
});
