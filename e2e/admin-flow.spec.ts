import { test, expect } from '@playwright/test';

test.describe('Admin Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/role-select');

    // Select Admin role
    await page.getByRole('button', { name: 'Admin' }).click();

    // Wait for dashboard to load
    await expect(page).toHaveURL(/admin\/menu/);
    await expect(page.getByRole('heading', { name: 'Menu Manager' })).toBeVisible();

    // Wait for UI to fully hydrate (important for Supabase-driven apps)
    await page.waitForLoadState('networkidle');

    // Ensure main action button is ready
    await expect(page.getByRole('button', { name: 'Add Drink' }))
      .toBeVisible({ timeout: 10000 });
  });

  test('should add a new menu item with a topping and verify it', async ({ page }) => {
    const itemName = `Test Drink ${Date.now()}`;

    // Open Add Drink modal
    const addButton = page.getByRole('button', { name: 'Add Drink' });
    await addButton.click();

    // Fill in basic info
    await page.getByLabel('Drink Name *').fill(itemName);

    // CATEGORY SELECT
    await page.getByLabel('Category').click();

    await page.getByRole('button', { name: 'Milk Tea' }).click();

    // Prices
    await page.getByLabel('Regular Size *').fill('100');
    await page.getByLabel('Medium Size *').fill('120');
    await page.getByLabel('Large Size *').fill('140');

    // Select topping
    await page.getByRole('button', { name: 'Pearl' }).click();

    // Save item
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // VERIFY (more stable than raw text search)
    await expect(page.getByRole('heading', { name: itemName }))
      .toBeVisible({ timeout: 10000 });
  });

  test('should navigate to Reports page and verify it loads', async ({ page }) => {
    await page.getByRole('link', { name: 'Reports' }).click();

    await expect(page).toHaveURL(/.*reports/);
    await expect(page.getByRole('heading', { name: 'Business Reports' }))
      .toBeVisible();

    await expect(page.getByText('Sales Summary')).toBeVisible();
  });
});