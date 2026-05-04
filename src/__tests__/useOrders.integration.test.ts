import { afterAll, describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useOrders } from "@/hooks/useOrders";
import { createOrder } from "@/services/orderService";
import {
  cleanupSeedMenu,
  createAnonTestClient,
  createServiceRoleTestClient,
  ensureSeedMenu,
  safeCleanupOrder,
} from "@/__tests__/integration/supabaseTestUtils";

const anon = createAnonTestClient();
const serviceRole = createServiceRoleTestClient();

const cleanupClient = serviceRole ?? anon;
const skipIfNoServiceRole = serviceRole ? it : it.skip;

let createdOrderIds: string[] = [];
let seededMenu: Awaited<ReturnType<typeof ensureSeedMenu>> | null = null;

afterAll(async () => {
  await Promise.all(createdOrderIds.map((id) => safeCleanupOrder(id, cleanupClient)));
  if (serviceRole && seededMenu?.seeded) {
    await cleanupSeedMenu(seededMenu.seeded, serviceRole);
  }
});

describe("useOrders (integration)", () => {
  skipIfNoServiceRole("loads and formats live orders from Supabase", async () => {
    seededMenu = seededMenu ?? (await ensureSeedMenu({ anon, serviceRole }));
    const drink = seededMenu.drink;
    const topping = seededMenu.topping;

    const created = await createOrder(
      {
        customer_name: `vitest-hook-${Date.now()}`,
        total_price: drink.regularPrice + topping.price,
        items: [
          {
            id: crypto.randomUUID(),
            drink_id: drink.id,
            drink_name: drink.name,
            size: "regular",
            drink_price: drink.regularPrice,
            sugar: "50% - Half Sweet",
            sugar_percentage: 50,
            toppings: [topping.name],
            topping_details: [topping],
            quantity: 1,
          },
        ],
      },
      serviceRole!,
    );

    const orderId = (created[0] as any).id as string;
    createdOrderIds.push(orderId);

    const { result, unmount } = renderHook(() => useOrders(serviceRole!));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.orders.some((order) => order.id === orderId)).toBe(true);
    });

    const order = result.current.orders.find((item) => item.id === orderId);
    expect(order?.order_details).toContain(drink.name);
    expect(order?.order_details).toContain(topping.name);

    act(() => {
      result.current.updateOrderInState(orderId, "completed");
    });

    expect(
      result.current.orders.find((item) => item.id === orderId)?.status,
    ).toBe("completed");

    unmount();
  });
});
