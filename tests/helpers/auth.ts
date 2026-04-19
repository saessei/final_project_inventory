import { expect, type Page } from "@playwright/test";

export async function login(page: Page, email: string, password: string) {
  // Adjust this route if your app uses /signin instead of /login
  await page.goto("/signin");

  await page.getByPlaceholder(/email/i).fill(email);
  await page.getByPlaceholder(/password/i).fill(password);

  await page.getByRole("button", { name: /sign in/i }).click();

  // Wait for a post-login page (change to whatever your app does)
  await expect(page).toHaveURL(/kiosk|queued-orders|dashboard/i, { timeout: 15000 });
}