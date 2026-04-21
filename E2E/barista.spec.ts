import { expect, test, type Page, type Route } from "@playwright/test";

type SessionRole = "cashier" | "barista";

interface SessionUser {
  id: string;
  email: string;
  user_metadata: {
    role: SessionRole;
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

interface OrderRow {
  id: string;
  customer_name: string;
  order_details: string;
  status: "pending" | "preparing" | "completed";
  created_at: string;
  claimed_by: string | null;
  claimed_by_name: string | null;
  claimed_at: string | null;
}

type BaristaOrdersState = {
  orders: OrderRow[];
  baristaUserId: string;
  baristaName: string;
};

function buildSession(role: SessionRole, email: string, userId: string): AuthSession {
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
        role,
        display_name: role === "cashier" ? "Cashier QA" : "Barista QA",
      },
    },
  };
}

function readEqParam(param: string | null): string | null {
  if (!param) return null;
  if (!param.startsWith("eq.")) return param;
  return decodeURIComponent(param.slice(3));
}

async function seedSession(page: Page, role: SessionRole, email: string, userId: string) {
  await page.addInitScript((session: AuthSession) => {
    window.localStorage.setItem("queuetea-auth", JSON.stringify(session));
  }, buildSession(role, email, userId));
}

async function mockBaristaOrdersApi(
  page: Page,
  ordersRef: BaristaOrdersState,
) {
  await page.route("**/rest/v1/**", async (route: Route) => {
    const req = route.request();
    const method = req.method();
    const url = new URL(req.url());
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

    if (pathname.endsWith("/orders") && method === "GET") {
      await route.fulfill({ status: 200, ...common, body: JSON.stringify(ordersRef.orders) });
      return;
    }

    if (pathname.endsWith("/orders") && method === "PATCH") {
      const id = readEqParam(url.searchParams.get("id"));
      const patch = req.postDataJSON() as Partial<OrderRow>;
      const onlyIfUnclaimed = url.searchParams.get("claimed_by") === "is.null";

      const target = ordersRef.orders.find((order) => order.id === id);
      if (!target) {
        await route.fulfill({ status: 200, ...common, body: JSON.stringify([]) });
        return;
      }

      if (onlyIfUnclaimed && target.claimed_by !== null) {
        await route.fulfill({ status: 200, ...common, body: JSON.stringify([]) });
        return;
      }

      Object.assign(target, patch);

      if (patch.status === "preparing") {
        target.claimed_by = ordersRef.baristaUserId;
        target.claimed_by_name = ordersRef.baristaName;
        target.claimed_at = new Date().toISOString();
      }

      await route.fulfill({ status: 200, ...common, body: JSON.stringify([target]) });
      return;
    }

    await route.fulfill({ status: 200, ...common, body: "[]" });
  });
}

test.describe("Barista flow", () => {
  test("barista can claim and complete an order", async ({ page }) => {
    const ordersRef: BaristaOrdersState = {
      baristaUserId: "barista-user-1",
      baristaName: "Barista QA",
      orders: [
      {
        id: "order-1001",
        customer_name: "Alice",
        order_details: "1x Wintermelon (50%, Boba)",
        status: "pending",
        created_at: new Date("2026-04-20T10:00:00.000Z").toISOString(),
        claimed_by: null,
        claimed_by_name: null,
        claimed_at: null,
      },
      ],
    };

    await seedSession(page, "barista", "barista@example.com", ordersRef.baristaUserId);
    await mockBaristaOrdersApi(page, ordersRef);

    await page.goto("/queued-orders");

    await expect(page.getByRole("heading", { name: "Barista Station" })).toBeVisible();
    await expect(page.getByText("Alice")).toBeVisible();
    await expect(page.getByRole("article").getByText("Incoming")).toBeVisible();

    await page.getByRole("button", { name: "Start Preparing" }).click();
    await expect(page.getByText("In queue")).toBeVisible();
    await expect(page.getByText("Barista: Barista QA")).toBeVisible();

    await page.getByRole("button", { name: "Mark as Complete" }).click();

    await page.getByRole("button", { name: "Completed" }).click();
    await expect(page.getByText("Alice")).toBeVisible();
    await expect(page.getByRole("button", { name: "Archive Order" })).toBeVisible();

    expect(ordersRef.orders[0].status).toBe("completed");
  });

  test("barista can view completed queue and archive action", async ({ page }) => {
    const ordersRef: BaristaOrdersState = {
      baristaUserId: "barista-user-2",
      baristaName: "Barista QA",
      orders: [
        {
          id: "order-2001",
          customer_name: "Brian",
          order_details: "2x Okinawa (70%, None)",
          status: "completed",
          created_at: new Date("2026-04-20T14:30:00.000Z").toISOString(),
          claimed_by: "barista-user-2",
          claimed_by_name: "Barista QA",
          claimed_at: new Date("2026-04-20T14:35:00.000Z").toISOString(),
        },
      ],
    };

    await seedSession(page, "barista", "barista2@example.com", ordersRef.baristaUserId);
    await mockBaristaOrdersApi(page, ordersRef);

    await page.goto("/queued-orders");
    await expect(page.getByText("No incoming or preparing orders yet.")).toBeVisible();

    await page.getByRole("button", { name: "Completed" }).click();
    await expect(page.getByText("Brian")).toBeVisible();
    await expect(page.getByRole("button", { name: "Archive Order" })).toBeVisible();
  });

  test("unauthenticated user is redirected to signin from barista station", async ({ page }) => {
    await page.goto("/queued-orders");
    await expect(page).toHaveURL(/\/signin$/);
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  });
});
