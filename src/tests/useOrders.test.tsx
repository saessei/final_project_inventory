import { describe, it, expect, afterAll } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react"; // Added act
import { useOrders } from "../hooks/useOrders";
import { supabaseTest, supabaseAdmin } from "../lib/supabaseTestClient";
import { createOrder } from "../services/orderService";

describe("useOrders (integration, test DB)", () => {
  const testRunId = `vitest-useOrders-${Date.now()}`;
  const testCustomer = `User-${testRunId}`;
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

    if (a?.[0]?.id && b?.[0]?.id) {
      createdOrderIds.push(a[0].id, b[0].id);
    }

    const { result } = renderHook(() => useOrders(supabaseTest));

    await act(async () => {
      await result.current.fetchOrders();
    });

    await waitFor(() => {
      const mine = result.current.orders.filter(
        (o) => o.customer_name === testCustomer
      );
      expect(mine.length).toBeGreaterThanOrEqual(2);
    }, { timeout: 10000 });

    const mine = result.current.orders.filter(
      (o) => o.customer_name === testCustomer
    );
    
    const times = mine.map((o) => new Date(o.created_at).getTime());
    expect(times).toEqual([...times].sort((x, y) => x - y));
  });
});