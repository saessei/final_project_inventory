import { describe, it, expect, afterAll } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { waitFor } from "@testing-library/dom";
import { useOrders } from "@/hooks/useOrders";
import { supabaseAdmin } from "@/tests/supabaseTestClient";
import { createOrder } from "@/services/orderService";

describe("useOrders (integration, test DB)", () => {
  const testRunId = `vitest-useOrders-${Date.now()}`;
  const testCustomer = `User-${testRunId}`;
  const createdOrderIds: string[] = [];

  afterAll(async () => {
    // Cleanup with admin privileges
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
      supabaseAdmin,
    );
    const b = await createOrder(
      {
        customer_name: testCustomer,
        order_details: `B (${testRunId})`,
        status: "pending",
      },
      supabaseAdmin,
    );

    if (a?.[0]?.id && b?.[0]?.id) {
      createdOrderIds.push(a[0].id, b[0].id);
    }

    const { result } = renderHook(() => useOrders(supabaseAdmin));

    await act(async () => {
      await result.current.fetchOrders();
    });

    // 3. Verify state updates
    await waitFor(
      () => {
        const mine = result.current.orders.filter(
          (o) => o.customer_name === testCustomer,
        );
        expect(mine.length).toBeGreaterThanOrEqual(2);
      },
      { timeout: 5000 },
    );

    const mine = result.current.orders.filter(
      (o) => o.customer_name === testCustomer,
    );

    const times = mine.map((o) => new Date(o.created_at).getTime());
    // Verify sorting logic (ascending by created_at)
    expect(times).toEqual([...times].sort((x, y) => x - y));
  });
});
