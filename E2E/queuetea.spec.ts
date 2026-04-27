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
      await route.fulfill({
        status: 200,
        ...common,
        body: JSON.stringify({ id: state.cartId, barista_user_id: state.userId, status: "active" }),
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

    await route.fulfill({ status: 200, ...common, body: "[]" });
  });
}

test.describe("User flow", () => {
  test("user can create order in kiosk", async ({ page }) => {
    const state: UserState = {
      cartId: "cart-user-1",
      userId: "user-1",
      displayName: "User QA",
      cartItems: [],
      orders: [],
    };

    await seedSession(page, "user@example.com", state.userId, state.displayName);
    await mockUnifiedApi(page, state);

    await page.goto("/kiosk");
    await expect(page.getByRole("heading", { name: "Kiosk" })).toBeVisible();

    await page.getByRole("button", { name: "+ Add to Order" }).first().click();
    await page.getByRole("button", { name: "Boba (+₱10)" }).click();
    await page.getByRole("button", { name: "70%" }).click();
    await page.getByRole("button", { name: "Add to Cart" }).click();
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
    };

    await seedSession(page, "user3@example.com", state.userId, state.displayName);
    await mockUnifiedApi(page, state);

    await page.goto("/kiosk");
    await expect(page.getByRole("heading", { name: "Kiosk" })).toBeVisible();

    await page.getByRole("button", { name: "+ Add to Order" }).first().click();
    await page.getByRole("button", { name: "Boba (+₱10)" }).click();
    await page.getByRole("button", { name: "70%" }).click();
    await page.getByRole("button", { name: "Add to Cart" }).click();
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
    await expect(completedCard.getByRole("button", { name: "Archive Order" })).toBeVisible();

    expect(state.orders[0].status).toBe("completed");
    expect(state.cartItems).toHaveLength(0);
  });
});