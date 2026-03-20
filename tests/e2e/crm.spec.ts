import { test, expect } from '@playwright/test';

test.describe('CRM Lifecycle Authorization', () => {
    // Note: This suite uses login abstractions for the e2e testing.
    // In a fully seeded test.db, admin@gdifuture.works exists.
    
    test.beforeEach(async ({ page }) => {
        // Hydrate NextAuth Session state natively via credentials
        await page.goto('/admin/login');
        await page.fill('input[type="email"]', 'admin@gdifuture.works');
        await page.fill('input[type="password"]', 'testadminpassword');
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL(/\/admin$/);
    });

    test('Super Admin traverses Client Directory unhindered', async ({ page }) => {
        await page.goto('/admin/clients');
        
        // Assert the Global Directory render passes Role validations
        const heading = page.locator('h1');
        await expect(heading).toContainText(/Clients Directory/i);

        // Account Manager Column specific to super_admin or wide-visibility toggles
        const tableHeader = page.locator('table th', { hasText: 'Account Manager' });
        await expect(tableHeader).toBeVisible();
    });

    test('Accessing granular User Permissions node functions', async ({ page }) => {
        await page.goto('/admin/users');

        // Locate super_admin seeded via `bandurkas@gmail.com`
        const userRow = page.locator('tr').filter({ hasText: 'bandurkas@gmail.com' });
        const configureButton = userRow.locator('a', { hasText: 'Configure' });
        
        await expect(configureButton).toBeVisible();
    });
});
