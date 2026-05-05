import { expect, test, type Page } from "@playwright/test";

const EMAIL = process.env.TEST_USER_EMAIL ?? "test@user.com";
const PASSWORD = process.env.TEST_USER_PASSWORD ?? "Password123";

async function signIn(page: Page) {
  await page.goto("/#/signin");
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByPlaceholder("Password").fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForLoadState("networkidle");

  await page.waitForTimeout(3000);

  await expect(page).toHaveURL(/#\/role-select/);
}

async function chooseAdmin(page: Page) {
  await page.getByRole("button", { name: /^admin$/i }).click();
  await expect(page).toHaveURL(/#\/admin\/menu/);
  await expect(
    page.getByRole("heading", { name: /menu manager/i }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /add drink/i })).toBeVisible({
    timeout: 15_000,
  });
}

test.describe("admin flow", () => {
  test("logs in as admin, adds a topping and menu item, then views reports", async ({
    page,
  }) => {
    const unique = Date.now();
    const toppingName = `Boba Pearl ${unique}`;
    const drinkName = `QueueTea Signature ${unique}`;
    const categoryName = `Special ${unique}`;

    await signIn(page);
    await chooseAdmin(page);

    await page.getByRole("button", { name: /toppings/i }).click();
    await page.getByRole("button", { name: /add topping/i }).click();

    const toppingDialog = page.getByRole("dialog", { name: /add topping/i });
    await expect(toppingDialog).toBeVisible();
    await toppingDialog.getByLabel("Topping Name *").fill(toppingName);
    await toppingDialog.getByLabel(/price/i).fill("15");
    await toppingDialog.getByRole("button", { name: /^save$/i }).click();

    await expect(toppingDialog).not.toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("heading", { name: toppingName })).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole("button", { name: /drinks/i }).click();
    await page.getByRole("button", { name: /add drink/i }).click();

    const drinkDialog = page.getByRole("dialog", { name: /add drink/i });
    await expect(drinkDialog).toBeVisible();
    await drinkDialog.getByLabel("Drink Name *").fill(drinkName);
    await drinkDialog.getByLabel("New Category Name").fill(categoryName);
    await drinkDialog.getByLabel("Regular Size *").fill("100");
    await drinkDialog.getByLabel("Medium Size *").fill("120");
    await drinkDialog.getByLabel("Large Size *").fill("140");
    await drinkDialog.getByPlaceholder("Search toppings...").fill(toppingName);
    await drinkDialog
      .getByRole("button", { name: new RegExp(toppingName) })
      .click();
    await drinkDialog.getByRole("button", { name: /save changes/i }).click();

    await expect(drinkDialog).not.toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("heading", { name: drinkName })).toBeVisible({
      timeout: 15_000,
    });

    await page.getByText("Reports", { exact: true }).click();
    await expect(page).toHaveURL(/#\/reports/);
    await expect(page.getByRole("heading", { name: /reports/i })).toBeVisible();
    await expect(page.getByText(/sales and order insights/i)).toBeVisible();
  });
});
