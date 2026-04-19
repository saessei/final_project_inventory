import { test, expect } from '@playwright/test';

test('should allow a user to sign up', async ({ page }) => {
  await page.goto('/signup');

  await page.getByPlaceholder('Name').fill('Cardo Dalisay');
  await page.getByPlaceholder('Email').fill('cardo.test@example.com');
  await page.getByPlaceholder('Password').fill('Password123!');

  await page.getByRole('button', { name: /create account/i }).click();

  await expect(page).toHaveURL(/.*kiosk/); 
});