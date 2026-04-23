import { useEffect } from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import { useOrders } from "../hooks/useOrders";
import supabase from "../lib/supabaseClient";
import { createOrder } from "../services/orderService";
import { clearDatabase } from "../utils/db";

describe("useOrders Integration", () => {
  const testCustomer = "HookUser";

  beforeEach(async () => {
    await clearDatabase();
  });

  it("fetchOrders loads orders from test DB and updates state", async () => {
    // Insert real data
    await createOrder({
      customer_name: testCustomer,
      order_details: "Order A",
      status: "pending",
    }, supabase);

    await createOrder({
      customer_name: testCustomer,
      order_details: "Order B",
      status: "pending",
    }, supabase);

    let latestOrders: any[] = [];
    let latestFetch: (() => Promise<void>) | null = null;

    function Harness() {
      const { orders, fetchOrders } = useOrders(supabase);
      useEffect(() => {
        latestOrders = orders;
        latestFetch = fetchOrders;
      }, [orders, fetchOrders]);
      return null;
    }

    const el = document.createElement("div");
    document.body.appendChild(el);
    const root = createRoot(el);

    await act(async () => { root.render(<Harness />); });
    await act(async () => { await latestFetch?.(); });

    expect(latestOrders.length).toBe(2);
    expect(latestOrders[0].customer_name).toBe(testCustomer);

    await act(async () => root.unmount());
    el.remove();
  });

  it("fetchOrders keeps state empty when there are no orders", async () => {
    let latestOrders: any[] = [];
    let latestFetch: (() => Promise<void>) | null = null;

    function Harness() {
      const { orders, fetchOrders } = useOrders(supabase);
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

    expect(latestOrders).toEqual([]);

    await act(async () => root.unmount());
    el.remove();
  });
});