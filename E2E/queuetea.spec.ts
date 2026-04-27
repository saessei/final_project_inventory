import { expect, test, type Page, type Route } from "@playwright/test";

interface SessionUser {
  id: string;
  email: string;
  user_metadata: {
    display_name: string;
  };
}

interface AuthSession {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
  expires_at: number;
  user: SessionUser;
}

interface CartItem {
  id: string;
  cart_id: string;
  drink_id: string;
  drink_name: string;
  drink_price: number;
  sugar: string;
  toppings: string[];
  quantity: number;
}

interface DrinkRow {
  id: string;
  name: string;
  description: string;
  image_url: string;
  is_available: boolean;
  created_at: string;
}

interface DrinkSizeRow {
  drink_id: string;
  size: "regular" | "medium" | "large";
  price: number;
}

interface DefaultToppingRow {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
}

interface DrinkToppingRow {
  drink_id: string;
  topping_id: string;
}
interface SugarLevelRow {
  id: string;
  percentage: number;
  label: string;
  price_addition: number;
}

interface OrderRow {
  id: string;
  customer_name: string;
  order_details: string;
  status: "pending" | "preparing" | "completed";
  created_at: string;
  claimed_by: string | null;
  claimed_at: string | null;
}

interface UserState {
  cartId: string;
  userId: string;
  displayName: string;
  cartItems: CartItem[];
  orders: OrderRow[];

  drinks: DrinkRow[];
  drinkSizes: DrinkSizeRow[];
  defaultToppings: DefaultToppingRow[];
  drinkToppings: DrinkToppingRow[];
  sugarLevels: SugarLevelRow[];
}

function buildSession(email: string, userId: string, displayName: string): AuthSession {
  const now = Math.floor(Date.now() / 1000);

  return {
    access_token: "pw-access-token",
    refresh_token: "pw-refresh-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: now + 3600,
    user: {
      id: userId,
      email,
      user_metadata: {
        display_name: displayName,
      },
    },
  };
}

function readEqParam(param: string | null): string | null {
  if (!param) return null;
  if (!param.startsWith("eq.")) return param;
  return decodeURIComponent(param.slice(3));
}

function wantsObjectResponse(request: { headers(): Record<string, string> }): boolean {
  const accept = request.headers()["accept"]?.toLowerCase() ?? "";
  return accept.includes("application/vnd.pgrst.object+json");
}

async function seedSession(
  page: Page,
  email: string,
  userId: string,
  displayName: string,
) {
  await page.addInitScript((session: AuthSession) => {
    window.localStorage.setItem("queuetea-auth", JSON.stringify(session));
  }, buildSession(email, userId, displayName));
}

async function mockUnifiedApi(page: Page, state: UserState) {
  await page.route("**/rest/v1/**", async (route: Route) => {
    const req = route.request();
    const url = new URL(req.url());
    const method = req.method();
    const pathname = url.pathname;
    const objectResponse = wantsObjectResponse(req);

    const common = {
      headers: {
        "content-type": "application/json",
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
        "access-control-allow-headers": "*",
      },
    };

    if (method === "OPTIONS") {
      await route.fulfill({ status: 200, ...common, body: "{}" });
      return;
    }

    if (pathname.endsWith("/carts") && method === "GET") {
      const byBarista = readEqParam(url.searchParams.get("barista_user_id"));
      const byStatus = readEqParam(url.searchParams.get("status"));
      const cart = {
        id: state.cartId,
        barista_user_id: state.userId,
        status: "active",
      };

      const matches =
        (!byBarista || byBarista === cart.barista_user_id) &&
        (!byStatus || byStatus === cart.status);

      if (!matches) {
        // Supabase/PostgREST returns 406 when Accept: object and no rows.
        if (objectResponse) {
          await route.fulfill({ status: 406, ...common, body: JSON.stringify({ message: "Results contain 0 rows" }) });
        } else {
          await route.fulfill({ status: 200, ...common, body: JSON.stringify([]) });
        }
        return;
      }

      await route.fulfill({
        status: 200,
        ...common,
        body: JSON.stringify(objectResponse ? cart : [cart]),
      });
      return;
    }

    if (pathname.endsWith("/carts") && method === "POST") {
      const payload = req.postDataJSON() as Array<Pick<DrinkRow, never> & { barista_user_id: string; status: string }>;
      const created = {
        id: state.cartId,
        barista_user_id: payload?.[0]?.barista_user_id ?? state.userId,
        status: payload?.[0]?.status ?? "active",
      };

      await route.fulfill({
        status: 201,
        ...common,
        body: JSON.stringify(objectResponse ? created : [created]),
      });
      return;
    }

    if (pathname.endsWith("/cart_items") && method === "GET") {
      const byCartId = readEqParam(url.searchParams.get("cart_id"));
      const items = byCartId
        ? state.cartItems.filter((item) => item.cart_id === byCartId)
        : state.cartItems;
      await route.fulfill({ status: 200, ...common, body: JSON.stringify(items) });
      return;
    }

    if (pathname.endsWith("/cart_items") && method === "POST") {
      const payload = req.postDataJSON() as Array<Omit<CartItem, "id">>;
      const inserted = {
        id: `item-${state.cartItems.length + 1}`,
        ...payload[0],
      };
      state.cartItems.push(inserted);

      await route.fulfill({ status: 201, ...common, body: JSON.stringify([inserted]) });
      return;
    }

    if (pathname.endsWith("/cart_items") && method === "PATCH") {
      const id = readEqParam(url.searchParams.get("id"));
      const patch = req.postDataJSON() as Partial<CartItem>;
      const target = state.cartItems.find((item) => item.id === id);

      if (!target) {
        await route.fulfill({ status: 200, ...common, body: JSON.stringify([]) });
        return;
      }

      Object.assign(target, patch);
      await route.fulfill({ status: 200, ...common, body: JSON.stringify([target]) });
      return;
    }

    if (pathname.endsWith("/cart_items") && method === "DELETE") {
      const byId = readEqParam(url.searchParams.get("id"));
      const byCartId = readEqParam(url.searchParams.get("cart_id"));

      if (byId) {
        state.cartItems = state.cartItems.filter((item) => item.id !== byId);
      }

      if (byCartId) {
        state.cartItems = state.cartItems.filter((item) => item.cart_id !== byCartId);
      }

      await route.fulfill({ status: 200, ...common, body: JSON.stringify([]) });
      return;
    }

    if (pathname.endsWith("/orders") && method === "GET") {
      await route.fulfill({ status: 200, ...common, body: JSON.stringify(state.orders) });
      return;
    }

    if (pathname.endsWith("/orders") && method === "POST") {
      const payload = req.postDataJSON() as Array<
        Pick<OrderRow, "customer_name" | "order_details" | "status">
      >;

      const inserted: OrderRow = {
        id: `order-${state.orders.length + 1}`,
        customer_name: payload[0].customer_name,
        order_details: payload[0].order_details,
        status: payload[0].status,
        created_at: new Date().toISOString(),
        claimed_by: null,
        claimed_at: null,
      };

      state.orders.push(inserted);

      await route.fulfill({ status: 201, ...common, body: JSON.stringify([inserted]) });
      return;
    }

    if (pathname.endsWith("/orders") && method === "PATCH") {
      const id = readEqParam(url.searchParams.get("id"));
      const patch = req.postDataJSON() as Partial<OrderRow>;
      const onlyIfUnclaimed = url.searchParams.get("claimed_by") === "is.null";

      const target = state.orders.find((order) => order.id === id);
      if (!target) {
        await route.fulfill({ status: 200, ...common, body: JSON.stringify([]) });
        return;
      }

      if (onlyIfUnclaimed && target.claimed_by !== null) {
        await route.fulfill({ status: 200, ...common, body: JSON.stringify([]) });
        return;
      }

      Object.assign(target, patch);

      await route.fulfill({ status: 200, ...common, body: JSON.stringify([target]) });
      return;
    }

    if (pathname.endsWith("/sugar_levels") && method === "GET") {
      await route.fulfill({ status: 200, ...common, body: JSON.stringify(state.sugarLevels) });
      return;
    }

    if (pathname.endsWith("/drinks") && method === "GET") {
      // DrinkService filters available drinks via eq("is_available", true)
      const onlyAvailable = readEqParam(url.searchParams.get("is_available"));
      const rows = onlyAvailable === "true"
        ? state.drinks.filter((d) => d.is_available)
        : state.drinks;
      await route.fulfill({ status: 200, ...common, body: JSON.stringify(rows) });
      return;
    }

    if (pathname.endsWith("/drink_sizes") && method === "GET") {
      const drinkId = readEqParam(url.searchParams.get("drink_id"));
      const rows = drinkId
        ? state.drinkSizes.filter((s) => s.drink_id === drinkId)
        : state.drinkSizes;
      await route.fulfill({ status: 200, ...common, body: JSON.stringify(rows) });
      return;
    }

    if (pathname.endsWith("/drink_toppings") && method === "GET") {
      const drinkId = readEqParam(url.searchParams.get("drink_id"));
      const rows = (drinkId
        ? state.drinkToppings.filter((dt) => dt.drink_id === drinkId)
        : state.drinkToppings
      ).map((dt) => {
        const topping = state.defaultToppings.find((t) => t.id === dt.topping_id) ?? null;
        return { topping };
      });

      await route.fulfill({ status: 200, ...common, body: JSON.stringify(rows) });
      return;
    }

    await route.fulfill({ status: 200, ...common, body: "[]" });
  });
}

test.describe("User flow", () => {
  test("protected routes redirect to sign in when unauthenticated", async ({ page }) => {
    // No seeded session.
    await page.goto("/kiosk");
    await expect(page).toHaveURL(/\/signin$/);
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  });

  test("kiosk checkout is disabled until customer name is provided", async ({ page }) => {
    const state: UserState = {
      cartId: "cart-user-checkout-disabled",
      userId: "user-checkout-disabled",
      displayName: "User QA",
      cartItems: [],
      orders: [],

      drinks: [
        {
          id: "drink-1",
          name: "Wintermelon",
          description: "Classic wintermelon milk tea",
          image_url: "",
          is_available: true,
          created_at: new Date().toISOString(),
        },
      ],
      drinkSizes: [
        { drink_id: "drink-1", size: "regular", price: 90 },
        { drink_id: "drink-1", size: "medium", price: 110 },
        { drink_id: "drink-1", size: "large", price: 130 },
      ],
      defaultToppings: [
        { id: "topping-1", name: "Boba", price: 10, is_available: true },
      ],
      drinkToppings: [
        { drink_id: "drink-1", topping_id: "topping-1" },
      ],
      sugarLevels: [
        { id: "sugar-50", percentage: 50, label: "50%", price_addition: 0 },
      ],
    };

    await seedSession(page, "user-checkout@example.com", state.userId, state.displayName);
    await mockUnifiedApi(page, state);

    await page.goto("/kiosk");
    await expect(page.getByRole("heading", { name: "Kiosk" })).toBeVisible();

    const checkoutButton = page.getByRole("button", { name: "Check Out" });
    await expect(checkoutButton).toBeDisabled();

    await page.getByRole("button", { name: "+ Customize Order" }).first().click();
    await page.getByRole("button", { name: /^Add to Cart/i }).click();

    // Still disabled until customer name is filled.
    await expect(checkoutButton).toBeDisabled();

    await page.getByLabel("Customer name").fill("Customer QA");
    await expect(checkoutButton).toBeEnabled();
  });

  test("queued orders shows empty state when there are no active orders", async ({ page }) => {
    const state: UserState = {
      cartId: "cart-user-empty-queue",
      userId: "user-empty-queue",
      displayName: "User QA",
      cartItems: [],
      orders: [],

      drinks: [],
      drinkSizes: [],
      defaultToppings: [],
      drinkToppings: [],
      sugarLevels: [],
    };

    await seedSession(page, "user-empty-queue@example.com", state.userId, state.displayName);
    await mockUnifiedApi(page, state);

    await page.goto("/queued-orders");
    await expect(page.getByRole("heading", { name: "Barista Station" })).toBeVisible();
    await expect(page.getByText("No incoming or preparing orders yet.")).toBeVisible();
  });

  test("user can create order in kiosk", async ({ page }) => {
    const state: UserState = {
      cartId: "cart-user-1",
      userId: "user-1",
      displayName: "User QA",
      cartItems: [],
      orders: [],

      drinks: [
        {
          id: "drink-1",
          name: "Wintermelon",
          description: "Classic wintermelon milk tea",
          image_url: "",
          is_available: true,
          created_at: new Date().toISOString(),
        },
      ],
      drinkSizes: [
        { drink_id: "drink-1", size: "regular", price: 90 },
        { drink_id: "drink-1", size: "medium", price: 110 },
        { drink_id: "drink-1", size: "large", price: 130 },
      ],
      defaultToppings: [
        { id: "topping-1", name: "Boba", price: 10, is_available: true },
      ],
      drinkToppings: [
        { drink_id: "drink-1", topping_id: "topping-1" },
      ],
      sugarLevels: [
        { id: "sugar-0", percentage: 0, label: "0%", price_addition: 0 },
        { id: "sugar-50", percentage: 50, label: "50%", price_addition: 0 },
        { id: "sugar-70", percentage: 70, label: "70%", price_addition: 0 },
        { id: "sugar-100", percentage: 100, label: "100%", price_addition: 0 },
      ],
    };

    await seedSession(page, "user@example.com", state.userId, state.displayName);
    await mockUnifiedApi(page, state);

    await page.goto("/kiosk");
    await expect(page.getByRole("heading", { name: "Kiosk" })).toBeVisible();

    await page.getByRole("button", { name: "+ Customize Order" }).first().click();
    await page.getByRole("button", { name: /Boba/i }).click();
    await page.getByRole("button", { name: "70%" }).click();
    await page.getByRole("button", { name: /^Add to Cart/i }).click();
    await expect(page.getByText("1 items")).toBeVisible();

    await page.getByLabel("Customer name").fill("One User Customer");
    await page.getByRole("button", { name: "Check Out" }).click();

    await expect(page.getByRole("heading", { name: "Order successful" })).toBeVisible();
    expect(state.orders).toHaveLength(1);
    expect(state.orders[0].customer_name).toBe("One User Customer");
    expect(state.orders[0].status).toBe("pending");
    expect(state.cartItems).toHaveLength(0);

    await page.getByRole("button", { name: "New order" }).click();
    await expect(page.getByRole("heading", { name: "Order successful" })).not.toBeVisible();
  });

  test("user can process queued order lifecycle", async ({ page }) => {
    const state: UserState = {
      cartId: "cart-user-2",
      userId: "user-2",
      displayName: "User QA",
      cartItems: [],
      orders: [
        {
          id: "order-1",
          customer_name: "Queue Customer",
          order_details: "1x Wintermelon (70%, Boba)",
          status: "pending",
          created_at: new Date().toISOString(),
          claimed_by: null,
          claimed_at: null,
        },
      ],

      drinks: [],
      drinkSizes: [],
      defaultToppings: [],
      drinkToppings: [],
      sugarLevels: [],
    };

    await seedSession(page, "user2@example.com", state.userId, state.displayName);
    await mockUnifiedApi(page, state);

    await page.goto("/queued-orders");
    await expect(page.getByRole("heading", { name: "Barista Station" })).toBeVisible();

    const activeCard = page.getByRole("article").filter({ hasText: "Queue Customer" });
    await expect(activeCard).toBeVisible();
    await expect(activeCard.getByText("Incoming")).toBeVisible();

    await page.getByRole("button", { name: "Start Preparing" }).click();
    await expect(page.getByText("In queue")).toBeVisible();

    await page.getByRole("button", { name: "Mark as Complete" }).click();
    await page.getByRole("button", { name: "Completed" }).click();
    const completedCard = page.getByRole("article").filter({ hasText: "Queue Customer" });
    await expect(completedCard).toBeVisible();
    await expect(completedCard.getByText("Completed")).toBeVisible();
    await expect(completedCard.getByRole("button", { name: "Archive Order" })).toBeVisible();

    expect(state.orders[0].status).toBe("completed");
  });

  test("single user can create in kiosk and process in queue", async ({ page }) => {
    const state: UserState = {
      cartId: "cart-user-3",
      userId: "user-3",
      displayName: "User QA",
      cartItems: [],
      orders: [],

      drinks: [
        {
          id: "drink-1",
          name: "Wintermelon",
          description: "Classic wintermelon milk tea",
          image_url: "",
          is_available: true,
          created_at: new Date().toISOString(),
        },
      ],
      drinkSizes: [
        { drink_id: "drink-1", size: "regular", price: 90 },
        { drink_id: "drink-1", size: "medium", price: 110 },
        { drink_id: "drink-1", size: "large", price: 130 },
      ],
      defaultToppings: [
        { id: "topping-1", name: "Boba", price: 10, is_available: true },
      ],
      drinkToppings: [
        { drink_id: "drink-1", topping_id: "topping-1" },
      ],
      sugarLevels: [
        { id: "sugar-0", percentage: 0, label: "0%", price_addition: 0 },
        { id: "sugar-50", percentage: 50, label: "50%", price_addition: 0 },
        { id: "sugar-70", percentage: 70, label: "70%", price_addition: 0 },
        { id: "sugar-100", percentage: 100, label: "100%", price_addition: 0 },
      ],
    };

    await seedSession(page, "user3@example.com", state.userId, state.displayName);
    await mockUnifiedApi(page, state);

    await page.goto("/kiosk");
    await expect(page.getByRole("heading", { name: "Kiosk" })).toBeVisible();

    await page.getByRole("button", { name: "+ Customize Order" }).first().click();
    await page.getByRole("button", { name: /Boba/i }).click();
    await page.getByRole("button", { name: "70%" }).click();
    await page.getByRole("button", { name: /^Add to Cart/i }).click();
    await expect(page.getByText("1 items")).toBeVisible();

    await page.getByLabel("Customer name").fill("One User Customer");
    await page.getByRole("button", { name: "Check Out" }).click();

    await expect(page.getByRole("heading", { name: "Order successful" })).toBeVisible();
    expect(state.orders).toHaveLength(1);
    expect(state.orders[0].customer_name).toBe("One User Customer");

    await page.getByRole("button", { name: "New order" }).click();
    await expect(page.getByRole("heading", { name: "Order successful" })).not.toBeVisible();

    await page.getByText("Queued Orders").click();
    await expect(page).toHaveURL(/\/queued-orders$/);
    await expect(page.getByRole("heading", { name: "Barista Station" })).toBeVisible();

    const activeCard = page.getByRole("article").filter({ hasText: "One User Customer" });
    await expect(activeCard).toBeVisible();
    await expect(activeCard.getByText("Incoming")).toBeVisible();

    await page.getByRole("button", { name: "Start Preparing" }).click();
    await expect(page.getByText("In queue")).toBeVisible();

    await page.getByRole("button", { name: "Mark as Complete" }).click();
    await page.getByRole("button", { name: "Completed" }).click();
    const completedCard = page.getByRole("article").filter({ hasText: "One User Customer" });
    await expect(completedCard).toBeVisible();
    await expect(completedCard.getByText("Completed")).toBeVisible();
    await expect(completedCard.getByRole("button", { name: "Archive Order" })).toBeVisible();

    expect(state.orders[0].status).toBe("completed");
    expect(state.cartItems).toHaveLength(0);
  });
});