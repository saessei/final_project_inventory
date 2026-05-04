import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const STORAGE_STATE = path.join(__dirname, '../.playwright/user.json');

setup('authenticate', async ({ page }) => {
  // Navigate to sign-in page
  await page.goto('/#/signin');

  // Fill in credentials
  // NOTE: You should set these in your .env file
  const email = process.env.TEST_USER_EMAIL || 'test@user.com';
  const password = process.env.TEST_USER_PASSWORD || 'Password123';

  await page.getByLabel('Email').fill(email);
  await page.getByPlaceholder('Password').fill(password);
  
  // Click Sign In
  await page.getByRole('button', { name: 'SIGN IN' }).click();

  // Verify we reached the role selection page
  await expect(page).toHaveURL(/#\/role-select/);
  await expect(page.getByText('Select Dashboard')).toBeVisible();

  // Save storage state to reuse across tests
  await page.context().storageState({ path: STORAGE_STATE });
});
