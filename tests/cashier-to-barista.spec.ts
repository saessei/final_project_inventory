import { test, expect, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";

const TEST_PASSWORD = "Password123!";
const E2E_TEST_TIMEOUT = 120_000;

const signUp = async ({
  page,
  name,
  email,
  password,
  role,
}: {
  page: Page;
  name: string;
  email: string;
  password: string;
  role: "cashier" | "barista";
}) => {
  await page.goto("/signup");
  await expect(page).toHaveURL(/\/signup$/);

  await page.getByPlaceholder("Name").fill(name);
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").fill(password);

  if (role === "barista") {
    await page.getByRole("button", { name: "Barista" }).click();
    await expect(
      page.getByRole("button", { name: "Barista" }),
    ).toHaveAttribute("aria-pressed", "true");
  }

  await page.getByRole("button", { name: "Create Account" }).click();
};

test("cashier to barista happy-path order flow", async ({ page }) => {
  test.setTimeout(E2E_TEST_TIMEOUT);

  const unique = randomUUID();

  const cashierName = `Cashier ${unique}`;
  const cashierEmail = `cashier-${unique}@example.com`;
  const customerName = `Customer ${unique}`;

  await signUp({
    page,
    name: cashierName,
    email: cashierEmail,
    password: TEST_PASSWORD,
    role: "cashier",
  });

  await expect(page).toHaveURL(/\/kiosk$/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: "Kiosk" })).toBeVisible();

  const brownSugarCard = page.locator("article", {
    has: page.getByRole("heading", { name: "Brown Sugar Boba" }),
  });
  await brownSugarCard.getByRole("button", { name: "+ Add to Order" }).click();
  await expect(page.getByRole("button", { name: "Add to Cart" })).toBeVisible();
  await page.getByRole("button", { name: "Add to Cart" }).click();

  await page.getByPlaceholder("Enter customer name").fill(customerName);
  await page.getByRole("button", { name: "Check Out" }).click();

  await expect(page.getByRole("heading", { name: "Order successful" })).toBeVisible();
  await page.getByRole("button", { name: "New order" }).click();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/signin$/, { timeout: 30_000 });

  const baristaName = `Barista ${unique}`;
  const baristaEmail = `barista-${unique}@example.com`;

  await page.getByRole("link", { name: "Sign Up" }).click();
  await signUp({
    page,
    name: baristaName,
    email: baristaEmail,
    password: TEST_PASSWORD,
    role: "barista",
  });

  await expect(page).toHaveURL(/\/queued-orders$/, { timeout: 30_000 });
  await expect(
    page.getByRole("heading", { name: "Barista Station" }),
  ).toBeVisible();

  const orderByCustomer = page.locator("article", { hasText: customerName });
  const targetOrder = orderByCustomer.first();
  await expect(orderByCustomer).toHaveCount(1, {
    timeout: 30_000,
  });
  await expect(targetOrder).toBeVisible({ timeout: 30_000 });

  await targetOrder.getByRole("button", { name: "Start Preparing" }).click();
  await expect(
    targetOrder.getByRole("button", { name: "Mark as Complete" }),
  ).toBeVisible();

  await targetOrder.getByRole("button", { name: "Mark as Complete" }).click();

  await page.getByRole("button", { name: "Completed" }).click();
  await expect(
    page.locator("article", { hasText: customerName }).first(),
  ).toBeVisible({ timeout: 30_000 });
});
