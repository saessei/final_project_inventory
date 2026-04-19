import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

const TEST_EMAIL = process.env.E2E_EMAIL || "e2e-user@test.com";
const TEST_PASSWORD = process.env.E2E_PASSWORD || "Password123!";

test.beforeEach(async ({ page }) => {
  await login(page, TEST_EMAIL, TEST_PASSWORD);
});

test("kiosk: can add item to cart and see cart count increase", async ({ page }) => {
  await page.goto("/kiosk");

  await page.getByRole("button", { name: "+ Add to Order" }).first().click();
  await page.getByRole("button", { name: "Add to Cart" }).click();

  const cartBadge = page.locator("aside").getByText(/items$/).first();
  await expect(cartBadge).toContainText("1 items", { timeout: 15000 });
});