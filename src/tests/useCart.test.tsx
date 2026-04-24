import { afterAll, describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useCart, type CartItem } from "../hooks/useCart";
import { supabaseAdmin, supabaseTest } from "../lib/supabaseTestClient";

type CartRow = {
  id: string;
  barista_user_id: string;
  status: "active" | "checked_out" | "abandoned";
};

// type CartItemRow = Pick<
//   CartItem,
//   "id" | "cart_id" | "drink_id" | "drink_name" | "drink_price" | "sugar" | "toppings" | "quantity"
// >;

describe("useCart (integration, real Supabase DB)", () => {
  const testRunId = `vitest-useCart-${Date.now()}`;
  const createdCartIds: string[] = [];
  const createdBaristaUserIds: string[] = [];

  function trackCartId(id: string | null) {
    if (!id) return;
    if (!createdCartIds.includes(id)) createdCartIds.push(id);
  }

  function trackBaristaUserId(id: string) {
    if (!createdBaristaUserIds.includes(id)) createdBaristaUserIds.push(id);
  }

  function makeBaseItem(overrides?: Partial<Omit<CartItem, "id" | "cart_id">>) {
    return {
      drink_id: `drink-${testRunId}`,
      drink_name: `Hook Test Milk Tea (${testRunId})`,
      drink_price: 5.5,
      sugar: "75%",
      toppings: ["pearls"],
      quantity: 1,
      ...overrides,
    } satisfies Omit<CartItem, "id" | "cart_id">;
  }

  // Global Cleanup
  afterAll(async () => {
    if (createdCartIds.length) {
      await supabaseAdmin.from("cart_items").delete().in("cart_id", createdCartIds);
      await supabaseAdmin.from("carts").delete().in("id", createdCartIds);
    }

    if (createdBaristaUserIds.length) {
      await supabaseAdmin.from("carts").delete().in("barista_user_id", createdBaristaUserIds);
    }
  });

  // happy path
  it("creates and mutates a real cart through the hook", async () => {
    const baristaUserId = crypto.randomUUID();
    trackBaristaUserId(baristaUserId);

    // 1. Initialize the hook
    const { result, unmount } = renderHook(() => useCart(baristaUserId));

    // 2. Wait for initial cart creation
    await waitFor(() => expect(result.current.cartId).not.toBeNull(), { timeout: 10000 });
    
    const activeCartId = result.current.cartId as string;
    trackCartId(activeCartId);

    // Verify DB State for the Cart
    const { data: createdCart, error: cartErr } = await supabaseTest
      .from("carts")
      .select("id, barista_user_id, status")
      .eq("id", activeCartId)
      .single<CartRow>();

    expect(cartErr).toBeNull();
    expect(createdCart?.barista_user_id).toBe(baristaUserId);
    expect(createdCart?.status).toBe("active");

    // 3. Test Upsert (Insert)
    const baseItem = makeBaseItem();

    await result.current.upsertItem(baseItem);

    await waitFor(() => {
      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0]?.quantity).toBe(1);
    });

    // 4. Test Upsert (Update/Increment)
    await result.current.upsertItem(baseItem);

    await waitFor(() => {
      expect(result.current.cart[0]?.quantity).toBe(2);
    });

    // Verify DB State for Items
    const { data: items } = await supabaseTest
      .from("cart_items")
      .select("quantity")
      .eq("cart_id", activeCartId)
      .single();
    
    expect(items?.quantity).toBe(2);

    // 5. Test Index Mutation (Increment)
    await result.current.incrementItemAtIndex(0);
    await waitFor(() => expect(result.current.cart[0]?.quantity).toBe(3));

    // 6. Test Index Mutation (Decrement)
    await result.current.decrementItemAtIndex(0);
    await waitFor(() => expect(result.current.cart[0]?.quantity).toBe(2));

    // 7. Test Remove Item
    await result.current.removeItemAtIndex(0);
    await waitFor(() => expect(result.current.cart).toHaveLength(0));

    // 8. Test Clear Cart
    // Add two items first
    await result.current.upsertItem(baseItem);
    await result.current.upsertItem({
      ...baseItem,
      drink_id: `drink-${testRunId}-2`,
      drink_name: `Hook Test Taro (${testRunId})`,
    });

    await waitFor(() => expect(result.current.cart).toHaveLength(2));

    // Action
    await result.current.clearCart();

    // Assertion
    await waitFor(() => expect(result.current.cart).toHaveLength(0));

    const { data: finalItems } = await supabaseTest
      .from("cart_items")
      .select("id")
      .eq("cart_id", activeCartId);

    expect(finalItems).toHaveLength(0);

    unmount();
  }, 20000);

  it("computes cartTotal across multiple items", async () => {
    const baristaUserId = crypto.randomUUID();
    trackBaristaUserId(baristaUserId);

    const { result, unmount } = renderHook(() => useCart(baristaUserId));

    await waitFor(() => expect(result.current.cartId).not.toBeNull(), { timeout: 10000 });
    trackCartId(result.current.cartId);

    await result.current.upsertItem(makeBaseItem({ drink_price: 4.0, quantity: 2 })); // 8.00
    await result.current.upsertItem(
      makeBaseItem({
        drink_id: `drink-${testRunId}-total-2`,
        drink_name: `Hook Total Test Taro (${testRunId})`,
        drink_price: 6.25,
        quantity: 1,
      }),
    ); // 6.25

    await waitFor(() => expect(result.current.cart).toHaveLength(2));
    await waitFor(() => expect(result.current.cartTotal).toBeCloseTo(14.25, 5));

    unmount();
  }, 20000);

  it("decrementItemAtIndex deletes the row when quantity is 1", async () => {
    const baristaUserId = crypto.randomUUID();
    trackBaristaUserId(baristaUserId);

    const { result, unmount } = renderHook(() => useCart(baristaUserId));

    await waitFor(() => expect(result.current.cartId).not.toBeNull(), { timeout: 10000 });
    const activeCartId = result.current.cartId as string;
    trackCartId(activeCartId);

    await result.current.upsertItem(
      makeBaseItem({
        drink_id: `drink-${testRunId}-decr-1`,
        drink_name: `Hook Decrement Delete (${testRunId})`,
        quantity: 1,
      }),
    );

    await waitFor(() => expect(result.current.cart).toHaveLength(1));

    await result.current.decrementItemAtIndex(0);
    await waitFor(() => expect(result.current.cart).toHaveLength(0));

    const { data: remaining } = await supabaseTest
      .from("cart_items")
      .select("id")
      .eq("cart_id", activeCartId);

    expect(remaining ?? []).toHaveLength(0);

    unmount();
  }, 20000);

  it("reuses the same active cart for the same baristaUserId", async () => {
    const baristaUserId = crypto.randomUUID();
    trackBaristaUserId(baristaUserId);

    const first = renderHook(() => useCart(baristaUserId));
    await waitFor(() => expect(first.result.current.cartId).not.toBeNull(), { timeout: 10000 });

    const firstCartId = first.result.current.cartId as string;
    trackCartId(firstCartId);
    first.unmount();

    const second = renderHook(() => useCart(baristaUserId));
    await waitFor(() => expect(second.result.current.cartId).not.toBeNull(), { timeout: 10000 });

    const secondCartId = second.result.current.cartId as string;
    trackCartId(secondCartId);
    expect(secondCartId).toBe(firstCartId);

    const { data: activeCarts, error } = await supabaseTest
      .from("carts")
      .select("id")
      .eq("barista_user_id", baristaUserId)
      .eq("status", "active");

    expect(error).toBeNull();
    expect(activeCarts ?? []).toHaveLength(1);

    second.unmount();
  }, 20000);

  //sad path

  it("throws when upsertItem is called without baristaUserId", async () => {
    const { result } = renderHook(() => useCart(undefined));
    await expect(result.current.upsertItem(makeBaseItem())).rejects.toThrow("Missing baristaUserId");
  });

  it("no-ops when index mutations are called out of range", async () => {
    const { result } = renderHook(() => useCart(undefined));

    await expect(result.current.incrementItemAtIndex(0)).resolves.toBeUndefined();
    await expect(result.current.decrementItemAtIndex(0)).resolves.toBeUndefined();
    await expect(result.current.removeItemAtIndex(0)).resolves.toBeUndefined();
  });

  
});