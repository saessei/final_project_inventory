import { expect, test, type Page } from "@playwright/test";

const EMAIL = process.env.TEST_USER_EMAIL ?? "test@user.com";
const PASSWORD = process.env.TEST_USER_PASSWORD ?? "Password123";

async function signIn(page: Page) {
  await page.goto("/#/signin");
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByPlaceholder("Password").fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/#\/role-select/);
}

async function chooseStaff(page: Page) {
  await page.getByRole("button", { name: /^staff$/i }).click();
  await expect(page).toHaveURL(/#\/kiosk/);
  await expect(
    page.getByRole("heading", { name: /order taking/i }),
  ).toBeVisible();
}

test.describe("staff flow", () => {
  test("places an order and moves it through the queue manager", async ({
    page,
  }) => {
    const customerName = `E2E Customer ${Date.now()}`;

    await signIn(page);
    await chooseStaff(page);

    const firstDrink = page.locator("main section").getByRole("button").first();
    await expect(firstDrink).toBeVisible({ timeout: 15_000 });
    await firstDrink.click();

    const customizeDialog = page
      .locator(".fixed")
      .filter({ hasText: /customize drink/i })
      .first();
    await expect(customizeDialog).toBeVisible();
    await page.getByRole("button", { name: /large/i }).click();

    const firstTopping = page
      .getByText("Toppings", { exact: true })
      .locator("..")
      .locator("..")
      .getByRole("button")
      .first();
    if (await firstTopping.isVisible().catch(() => false)) {
      await firstTopping.click();
    }

    await page.getByRole("button", { name: /add to cart/i }).click();
    await expect(customizeDialog).not.toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/1 items/i)).toBeVisible();

    await page.getByLabel("Customer Name").fill(customerName);
    await page.getByRole("button", { name: /place order/i }).click();
    await expect(
      page.getByRole("heading", { name: /order successful/i }),
    ).toBeVisible({
      timeout: 20_000,
    });
    await page.getByRole("button", { name: /new order/i }).click();

    await page.getByText("Order Queue", { exact: true }).click();
    await expect(page).toHaveURL(/#\/queued-orders/);
    await expect(
      page.getByRole("heading", { name: /order queue/i }),
    ).toBeVisible();

    await page.getByPlaceholder(/search by customer name/i).fill(customerName);
    await expect(page.getByRole("heading", { name: customerName })).toBeVisible(
      {
        timeout: 15_000,
      },
    );

    await page.getByRole("button", { name: /start preparing/i }).click();
    await expect(page.getByText("Preparing", { exact: true })).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole("button", { name: /mark ready/i }).click();
    await expect(page.getByText("Ready", { exact: true })).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole("button", { name: /mark picked up/i }).click();
    await expect(
      page.getByRole("heading", { name: customerName }),
    ).not.toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole("button", { name: /^history$/i }).click();
    await expect(page.getByRole("heading", { name: customerName })).toBeVisible(
      {
        timeout: 15_000,
      },
    );
    await expect(
      page.locator("div", { hasText: "Completed" }).first(),
    ).toBeVisible();
  });
});
