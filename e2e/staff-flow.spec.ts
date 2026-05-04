import { test, expect } from '@playwright/test';

test.describe('Staff Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to role selection (already logged in via storageState)
    await page.goto('/#/role-select');
    
    // Select Staff role
    await page.getByRole('button', { name: 'Staff' }).click();
    
    // Verify we are on the Order Taking (Kiosk) page
    await expect(page).toHaveURL(/.*kiosk/);
    await expect(page.getByRole('heading', { name: 'Order Taking' })).toBeVisible();
  });

  test('should create a new order and update its status in the queue', async ({ page }) => {
    const customerName = `Staff Test ${Date.now()}`;
    
    // 1. Create a new order
    // Click on the first drink in the grid (e.g., Classic Milk Tea)
    await page.getByText('Classic Milk Tea').first().click();
    
    // Customize and add to cart
    await expect(page.getByText('Customize drink')).toBeVisible();
    await page.getByRole('button', { name: 'Add to Cart' }).click();
    
    // Fill customer name in sidebar
    await page.getByPlaceholder('Customer Name').fill(customerName);
    
    // Checkout
    await page.getByRole('button', { name: 'Place Order' }).click();
    
    // Verify success modal
    await expect(page.getByText('Order successful')).toBeVisible();
    await page.getByRole('button', { name: 'New Order' }).click();
    
    // 2. Go to Queue Manager
    await page.getByText('Order Queue').click();
    await expect(page.getByRole('heading', { name: 'Order Queue' })).toBeVisible();
    
    // Find our order by customer name
    const orderCard = page.locator('article', { hasText: customerName });
    await expect(orderCard).toBeVisible();
    await expect(orderCard.getByText('Pending')).toBeVisible();
    
    // 3. Update status (Pending -> Preparing)
    await orderCard.getByRole('button').click(); // OrderStatusButton text changes, simpler to click by role
    await expect(orderCard.getByText('Preparing')).toBeVisible();
    
    // 4. Update status (Preparing -> Ready)
    await orderCard.getByRole('button').click();
    await expect(orderCard.getByText('Ready')).toBeVisible();

    // 5. Update status (Ready -> Completed)
    await orderCard.getByRole('button').click();
    
    // Verify it's no longer in the active list (or moved to history)
    await expect(orderCard).not.toBeVisible();
    
    // Switch to History to verify
    await page.getByRole('button', { name: 'History' }).click();
    await expect(page.locator('article', { hasText: customerName })).toBeVisible();
    await expect(page.locator('article', { hasText: customerName }).getByText('Completed')).toBeVisible();
  });
});
