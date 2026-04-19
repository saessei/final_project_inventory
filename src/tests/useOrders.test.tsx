import { useEffect } from "react";
import { describe, it, expect, afterAll } from "vitest";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import { useOrders } from "../hooks/useOrders";
import { supabaseTest, supabaseAdmin } from "../lib/supabaseTestClient";
import { createOrder } from "../services/orderService";

describe("useOrders (integration, test DB)", () => {
  const testRunId = `vitest-useOrders-${Date.now()}`;
  const testCustomer = `HookUser-${testRunId}`;
  const createdOrderIds: string[] = [];

  afterAll(async () => {
    if (createdOrderIds.length) {
      await supabaseAdmin.from("orders").delete().in("id", createdOrderIds);
    } else {
      await supabaseAdmin
        .from("orders")
        .delete()
        .like("order_details", `%${testRunId}%`);
    }
  });

  it("fetchOrders loads orders from test DB and updates state", async () => {
    const a = await createOrder(
      {
        customer_name: testCustomer,
        order_details: `A (${testRunId})`,
        status: "pending",
      },
      supabaseTest,
    );
    const b = await createOrder(
      {
        customer_name: testCustomer,
        order_details: `B (${testRunId})`,
        status: "pending",
      },
      supabaseTest,
    );

    createdOrderIds.push(a![0].id, b![0].id);

    type OrderRow = {
      id: string;
      customer_name: string;
      order_details: string;
      status: "pending" | "preparing" | "completed" | "cancelled";
      created_at: string;
    };

    let latestOrders: OrderRow[] = [];
    let latestFetch: (() => Promise<void>) | null = null;

    function Harness() {
      const { orders, fetchOrders } = useOrders(supabaseTest);

      useEffect(() => {
        latestOrders = orders;
        latestFetch = fetchOrders;
      }, [orders, fetchOrders]);

      return null;
    }

    const el = document.createElement("div");
    document.body.appendChild(el);
    const root = createRoot(el);

    await act(async () => {
      root.render(<Harness />);
    });

    await act(async () => {
      await latestFetch?.();
    });

    const mine = latestOrders.filter((o) => o.customer_name === testCustomer);
    expect(mine.length).toBeGreaterThanOrEqual(2);

    const times = mine.map((o) => new Date(o.created_at).getTime());
    expect(times).toEqual([...times].sort((x, y) => x - y));

    await act(async () => root.unmount());
    el.remove();
  });
});
