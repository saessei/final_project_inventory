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
    const toppingNameInput = toppingDialog.getByLabel("Topping Name *");
    await expect(toppingNameInput).toBeEditable({ timeout: 15_000 });
    await toppingNameInput.fill(toppingName);
    const toppingPriceInput = toppingDialog.getByLabel(/price/i);
    await expect(toppingPriceInput).toBeEditable({ timeout: 15_000 });
    await toppingPriceInput.fill("15");
    await toppingDialog.getByRole("button", { name: /^save$/i }).click();

    await expect(toppingDialog).not.toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("heading", { name: toppingName })).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole("button", { name: /drinks/i }).click();
    await page.getByRole("button", { name: /add drink/i }).click();

    const drinkDialog = page.getByRole("dialog", { name: /add drink/i });
    await expect(drinkDialog).toBeVisible();
    const drinkNameInput = drinkDialog.getByLabel("Drink Name *");
    await expect(drinkNameInput).toBeEditable({ timeout: 15_000 });
    await drinkNameInput.fill(drinkName);
    const newCategoryInput = drinkDialog.getByLabel("New Category Name");
    await expect(newCategoryInput).toBeEditable({ timeout: 15_000 });
    await newCategoryInput.fill(categoryName);
    const regularSize = drinkDialog.getByLabel("Regular Size *");
    await expect(regularSize).toBeEditable({ timeout: 15_000 });
    await regularSize.fill("100");
    const mediumSize = drinkDialog.getByLabel("Medium Size *");
    await expect(mediumSize).toBeEditable({ timeout: 15_000 });
    await mediumSize.fill("120");
    const largeSize = drinkDialog.getByLabel("Large Size *");
    await expect(largeSize).toBeEditable({ timeout: 15_000 });
    await largeSize.fill("140");
    const searchToppings = drinkDialog.getByPlaceholder("Search toppings...");
    await expect(searchToppings).toBeEditable({ timeout: 15_000 });
    await searchToppings.fill(toppingName);
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

  test("edits an existing topping price", async ({ page }) => {
    const unique = Date.now();
    const toppingName = `E2E Edit Topping ${unique}`;
    const initialPrice = "20";
    const updatedPrice = "35";

    await signIn(page);
    await chooseAdmin(page);

    await page.getByRole("button", { name: /toppings/i }).click();
    await page.getByRole("button", { name: /add topping/i }).click();

    const toppingDialog = page.getByRole("dialog", { name: /add topping/i });
    await expect(toppingDialog).toBeVisible();
    await toppingDialog.getByLabel("Topping Name *").fill(toppingName);
    await toppingDialog.getByLabel(/price/i).fill(initialPrice);
    await toppingDialog.getByRole("button", { name: /^save$/i }).click();

    await expect(toppingDialog).not.toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("heading", { name: toppingName })).toBeVisible({ timeout: 15_000 });

    // Open topping card to reveal actions and edit
    await page.getByRole("heading", { name: toppingName }).click();
    await page.getByRole("button", { name: new RegExp(`Edit ${toppingName.replace(/[-\\/\\^$*+?.()|[\]{}]/g, "\\$&")}`) }).click();

    const editDialog = page.getByRole("dialog", { name: /edit topping/i });
    await expect(editDialog).toBeVisible();
    const editPrice = editDialog.getByLabel(/price/i);
    await expect(editPrice).toBeEditable({ timeout: 15_000 });
    await editPrice.fill(updatedPrice);
    await editDialog.getByRole("button", { name: /save/i }).click();

    await expect(editDialog).not.toBeVisible({ timeout: 15_000 });
    // Verify updated price visible on card (get the first match since we just created this topping)
    await expect(page.getByRole("heading", { name: toppingName }).locator("..").getByText(new RegExp(`₱${updatedPrice}`))).toBeVisible({ timeout: 15_000 });
  });
});
