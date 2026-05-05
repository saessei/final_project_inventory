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
    const customerName = `Customer ${Date.now()}`;

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

    const startPreparingBtn = page.getByRole("button", { name: /start preparing/i });
    await expect(startPreparingBtn).toBeVisible({ timeout: 15_000 });
    await expect(startPreparingBtn).toBeEnabled({ timeout: 15_000 });
    try {
      await startPreparingBtn.click({ timeout: 15_000 });
    } catch {
      await startPreparingBtn.evaluate((el) => (el as HTMLElement).click());
    }
    await expect(page.getByText("Preparing", { exact: true })).toBeVisible({ timeout: 15_000 });

    const markReadyBtn = page.getByRole("button", { name: /mark ready/i });
    await expect(markReadyBtn).toBeVisible({ timeout: 15_000 });
    await expect(markReadyBtn).toBeEnabled({ timeout: 15_000 });
    try {
      await markReadyBtn.click({ timeout: 15_000 });
    } catch {
      await markReadyBtn.evaluate((el) => (el as HTMLElement).click());
    }
    await expect(page.getByText("Ready", { exact: true })).toBeVisible({ timeout: 15_000 });

    const markPickedUpBtn = page.getByRole("button", { name: /mark picked up/i });
    await expect(markPickedUpBtn).toBeVisible({ timeout: 15_000 });
    await expect(markPickedUpBtn).toBeEnabled({ timeout: 15_000 });
    try {
      await markPickedUpBtn.click({ timeout: 15_000 });
    } catch {
      await markPickedUpBtn.evaluate((el) => (el as HTMLElement).click());
    }
    await expect(
      page.getByRole("heading", { name: customerName }),
    ).not.toBeVisible({ timeout: 15_000 });

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

  test("edits the cart: add two items, remove one, edit an item, then place order", async ({
    page,
  }) => {
    const customerName = `CartUser ${Date.now()}`;

    await signIn(page);
    await chooseStaff(page);

    const firstDrink = page.locator("main section").getByRole("button").first();
    const secondDrink = page.locator("main section").getByRole("button").nth(1);

    await expect(firstDrink).toBeVisible({ timeout: 15_000 });
    await firstDrink.click();
    await page.getByRole("button", { name: /large/i }).click();
    await page.getByRole("button", { name: /add to cart/i }).click();

    await expect(secondDrink).toBeVisible({ timeout: 15_000 });
    await secondDrink.click();
    await page.getByRole("button", { name: /medium/i }).click();
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Cart should show 2 items
    await expect(page.getByText(/2 items/i)).toBeVisible({ timeout: 10_000 });

    // Open cart on mobile if the floating button is visible; on desktop the sidebar is already visible
    const openCartBtn = page.getByLabel("Open cart");
    if (await openCartBtn.isVisible().catch(() => false)) {
      await openCartBtn.click();
      await expect(page.getByRole("heading", { name: /cart/i })).toBeVisible();
    } else {
      await expect(page.getByRole("heading", { name: /cart/i })).toBeVisible();
    }

    // Remove an item
    await page.getByTitle("Remove Item").first().click();
    await expect(page.getByText(/1 items/i)).toBeVisible({ timeout: 10_000 });

    // Edit remaining item
    await page.getByTitle("Edit Item").first().click();
    await expect(page.getByText(/customize drink/i)).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /large/i }).click();
    await page.getByRole("button", { name: /add to cart/i }).click();

    // Place the order
    await page.getByLabel("Customer Name").fill(customerName);
    await page.getByRole("button", { name: /place order/i }).click();
    await expect(page.getByRole("heading", { name: /order successful/i })).toBeVisible({ timeout: 20_000 });
  });
});
