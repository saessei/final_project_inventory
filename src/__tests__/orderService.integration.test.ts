import { describe, expect, it, afterEach, afterAll } from "vitest";
import {
  cleanupSeedMenu,
  createAnonTestClient,
  createServiceRoleTestClient,
  ensureSeedMenu,
  safeCleanupOrder,
} from "@/__tests__/integration/supabaseTestUtils";
import { createOrder, updateOrderStatus } from "@/services/orderService";

const anon = createAnonTestClient();
const serviceRole = createServiceRoleTestClient();

const cleanupClient = serviceRole ?? anon;
const itCanWriteOrders = serviceRole ? it : it.skip;

let createdOrderIds: string[] = [];
let seededMenu: Awaited<ReturnType<typeof ensureSeedMenu>> | null = null;

afterEach(async () => {
  const ids = createdOrderIds;
  createdOrderIds = [];
  await Promise.all(ids.map((id) => safeCleanupOrder(id, cleanupClient)));
});

afterAll(async () => {
  if (serviceRole && seededMenu?.seeded) {
    await cleanupSeedMenu(seededMenu.seeded, serviceRole);
  }
});

describe("orderService (integration)", () => {
  itCanWriteOrders("creates an order with items + toppings + payment", async () => {
    seededMenu = seededMenu ?? (await ensureSeedMenu({ anon, serviceRole }));
    const drink = seededMenu.drink;
    const topping = seededMenu.topping;

    const drinkPrice = drink.regularPrice || 100;

    const result = await createOrder(
      {
        customer_name: `vitest-integration-${Date.now()}`,
        total_price: drinkPrice + topping.price,
        items: [
          {
            id: crypto.randomUUID(),
            drink_id: drink.id,
            drink_name: drink.name,
            size: "regular",
            drink_price: drinkPrice,
            sugar: "50% - Half Sweet",
            sugar_percentage: 50,
            toppings: [topping.name],
            topping_details: [topping],
            quantity: 1,
          },
        ],
        payment_method: "cash",
      },
      serviceRole!,
    );

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);

    const created = result[0] as any;
    expect(created.id).toBeTruthy();

    createdOrderIds.push(created.id);

    const { data: orderRow, error: orderErr } = await serviceRole!
      .from("orders")
      .select("id, customer_name, status, total_price")
      .eq("id", created.id)
      .single();

    expect(orderErr).toBeNull();
    expect(orderRow?.status).toBe("pending");

    const { data: items, error: itemsErr } = await serviceRole!
      .from("order_items")
      .select("id, order_id, drink_id, drink_name, size, quantity")
      .eq("order_id", created.id);

    expect(itemsErr).toBeNull();
    expect(items?.length).toBe(1);
    expect(items?.[0]?.drink_id).toBe(drink.id);

    const orderItemId = items?.[0]?.id as string;
    const { data: toppingRows, error: toppingErr } = await serviceRole!
      .from("order_item_toppings")
      .select("order_item_id, topping_id, topping_name")
      .eq("order_item_id", orderItemId);

    expect(toppingErr).toBeNull();
    expect(toppingRows?.length).toBe(1);
    expect(toppingRows?.[0]?.topping_id).toBe(topping.id);

    const { data: paymentRows, error: paymentErr } = await serviceRole!
      .from("payments")
      .select("order_id, method, status, amount_due")
      .eq("order_id", created.id);

    expect(paymentErr).toBeNull();
    expect(paymentRows?.length).toBe(1);
    expect(paymentRows?.[0]?.method).toBe("cash");
  });

  itCanWriteOrders("updates an order status and writes status history", async () => {
    seededMenu = seededMenu ?? (await ensureSeedMenu({ anon, serviceRole }));
    const drink = seededMenu.drink;
    const drinkPrice = drink.regularPrice || 100;

    const created = await createOrder(
      {
        customer_name: `vitest-status-${Date.now()}`,
        total_price: drinkPrice,
        items: [
          {
            id: crypto.randomUUID(),
            drink_id: drink.id,
            drink_name: drink.name,
            size: "regular",
            drink_price: drinkPrice,
            sugar: "0% - No Sugar",
            sugar_percentage: 0,
            toppings: [],
            topping_details: [],
            quantity: 1,
          },
        ],
      },
      serviceRole!,
    );

    const orderId = (created[0] as any).id as string;
    createdOrderIds.push(orderId);

    const updated = await updateOrderStatus(
      orderId,
      "completed",
      undefined,
      serviceRole!,
    );
    expect(updated).not.toBeNull();
    expect(updated?.[0]?.status).toBe("completed");

    const { data: history, error: histErr } = await serviceRole!
      .from("order_status_history")
      .select("order_id, old_status, new_status")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(1);

    expect(histErr).toBeNull();
    expect(history?.[0]?.new_status).toBe("completed");
  });
});
