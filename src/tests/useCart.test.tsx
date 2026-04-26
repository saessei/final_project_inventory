import { afterAll, describe, expect, it } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react"; // Added act
import { useCart, type CartItem } from "../hooks/useCart";
import { supabaseAdmin } from "../lib/supabaseTestClient";

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

  afterAll(async () => {
    if (createdCartIds.length) {
      await supabaseAdmin.from("cart_items").delete().in("cart_id", createdCartIds);
      await supabaseAdmin.from("carts").delete().in("id", createdCartIds);
    }
    if (createdBaristaUserIds.length) {
      await supabaseAdmin.from("carts").delete().in("barista_user_id", createdBaristaUserIds);
    }
  });

  it("creates and mutates a real cart through the hook", async () => {
    const baristaUserId = crypto.randomUUID();
    trackBaristaUserId(baristaUserId);

    const { result, unmount } = renderHook(() => useCart(baristaUserId));

    await waitFor(() => expect(result.current.cartId).not.toBeNull(), { timeout: 10000 });
    const activeCartId = result.current.cartId as string;
    trackCartId(activeCartId);

    const baseItem = makeBaseItem();

    // mutations wrapped in act
    await act(async () => { await result.current.upsertItem(baseItem); });
    await waitFor(() => expect(result.current.cart).toHaveLength(1));

    await act(async () => { await result.current.upsertItem(baseItem); });
    await waitFor(() => expect(result.current.cart[0]?.quantity).toBe(2));

    await act(async () => { await result.current.incrementItemAtIndex(0); });
    await waitFor(() => expect(result.current.cart[0]?.quantity).toBe(3));

    await act(async () => { await result.current.decrementItemAtIndex(0); });
    await waitFor(() => expect(result.current.cart[0]?.quantity).toBe(2));

    await act(async () => { await result.current.removeItemAtIndex(0); });
    await waitFor(() => expect(result.current.cart).toHaveLength(0));

    await act(async () => { await result.current.upsertItem(baseItem); });
    await act(async () => { await result.current.clearCart(); });
    await waitFor(() => expect(result.current.cart).toHaveLength(0));

    unmount();
  }, 20000);

  it("computes cartTotal across multiple items", async () => {
    const baristaUserId = crypto.randomUUID();
    trackBaristaUserId(baristaUserId);
    const { result, unmount } = renderHook(() => useCart(baristaUserId));

    await waitFor(() => expect(result.current.cartId).not.toBeNull());
    trackCartId(result.current.cartId);

    await act(async () => {
      await result.current.upsertItem(makeBaseItem({ drink_price: 4.0, quantity: 2 }));
      await result.current.upsertItem(makeBaseItem({ drink_id: `total-2`, drink_price: 6.25 }));
    });

    await waitFor(() => expect(result.current.cartTotal).toBeCloseTo(14.25, 5));
    unmount();
  }, 20000);

  it("decrementItemAtIndex deletes the row when quantity is 1", async () => {
    const baristaUserId = crypto.randomUUID();
    trackBaristaUserId(baristaUserId);
    const { result, unmount } = renderHook(() => useCart(baristaUserId));

    await waitFor(() => expect(result.current.cartId).not.toBeNull());
    trackCartId(result.current.cartId);

    await act(async () => {
      await result.current.upsertItem(makeBaseItem({ quantity: 1 }));
    });

    await waitFor(() => expect(result.current.cart).toHaveLength(1));

    await act(async () => {
      await result.current.decrementItemAtIndex(0);
    });

    await waitFor(() => expect(result.current.cart).toHaveLength(0));
    unmount();
  }, 20000);

  it("reuses the same active cart for the same baristaUserId", async () => {
    const baristaUserId = crypto.randomUUID();
    trackBaristaUserId(baristaUserId);

    const first = renderHook(() => useCart(baristaUserId));
    await waitFor(() => expect(first.result.current.cartId).not.toBeNull());
    trackCartId(first.result.current.cartId);
    first.unmount();

    const second = renderHook(() => useCart(baristaUserId));
    await waitFor(() => expect(second.result.current.cartId).not.toBeNull());
    expect(second.result.current.cartId).toBe(first.result.current.cartId);
    second.unmount();
  }, 20000);

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