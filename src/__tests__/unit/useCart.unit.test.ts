import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { type CartItem, useCart } from "@/hooks/useCart";

const cartItem = (
  overrides: Partial<Omit<CartItem, "id">> = {},
): Omit<CartItem, "id"> => ({
  drink_id: "drink-1",
  drink_name: "Brown Sugar Boba",
  size: "regular",
  drink_price: 100,
  sugar: "50%",
  sugar_percentage: 50,
  toppings: [],
  topping_details: [],
  quantity: 1,
  ...overrides,
});

describe("useCart", () => {
  it("adds a new item to the cart", async () => {
    const { result } = renderHook(() => useCart());

    await act(async () => {
      await result.current.upsertItem(cartItem());
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0]).toMatchObject({
      drink_id: "drink-1",
      drink_name: "Brown Sugar Boba",
      quantity: 1,
    });
    expect(result.current.cart[0].id).toEqual(expect.any(String));
  });

  it("merges matching items and ignores topping order when comparing", async () => {
    const { result } = renderHook(() => useCart());

    await act(async () => {
      await result.current.upsertItem(
        cartItem({
          quantity: 1,
          topping_details: [
            { id: "pearls", name: "Pearls", price: 15 },
            { id: "pudding", name: "Pudding", price: 20 },
          ],
          toppings: ["Pearls", "Pudding"],
        }),
      );
      await result.current.upsertItem(
        cartItem({
          quantity: 2,
          topping_details: [
            { id: "pudding", name: "Pudding", price: 20 },
            { id: "pearls", name: "Pearls", price: 15 },
          ],
          toppings: ["Pudding", "Pearls"],
        }),
      );
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].quantity).toBe(3);
  });

  it("keeps items separate when customization differs", async () => {
    const { result } = renderHook(() => useCart());

    await act(async () => {
      await result.current.upsertItem(cartItem({ sugar: "50%" }));
      await result.current.upsertItem(cartItem({ sugar: "100%" }));
    });

    expect(result.current.cart).toHaveLength(2);
    expect(result.current.cart.map((item) => item.sugar)).toEqual([
      "50%",
      "100%",
    ]);
  });

  it("increments, decrements, removes, and clears items", async () => {
    const { result } = renderHook(() => useCart());

    await act(async () => {
      await result.current.upsertItem(cartItem({ quantity: 2 }));
      await result.current.incrementItemAtIndex(0);
    });

    expect(result.current.cart[0].quantity).toBe(3);

    await act(async () => {
      await result.current.decrementItemAtIndex(0);
    });

    expect(result.current.cart[0].quantity).toBe(2);

    await act(async () => {
      await result.current.removeItemAtIndex(0);
    });

    expect(result.current.cart).toHaveLength(0);

    await act(async () => {
      await result.current.upsertItem(cartItem());
      await result.current.clearCart();
    });

    expect(result.current.cart).toHaveLength(0);
  });

  it("removes an item when decrementing a quantity of one", async () => {
    const { result } = renderHook(() => useCart());

    await act(async () => {
      await result.current.upsertItem(cartItem({ quantity: 1 }));
      await result.current.decrementItemAtIndex(0);
    });

    expect(result.current.cart).toHaveLength(0);
  });

  it("replaces an item while preserving its cart id", async () => {
    const { result } = renderHook(() => useCart());

    await act(async () => {
      await result.current.upsertItem(cartItem());
    });

    const originalId = result.current.cart[0].id;

    await act(async () => {
      await result.current.replaceItemAtIndex(
        0,
        cartItem({
          drink_name: "Matcha Milk Tea",
          size: "large",
          drink_price: 150,
        }),
      );
    });

    expect(result.current.cart[0]).toMatchObject({
      id: originalId,
      drink_name: "Matcha Milk Tea",
      size: "large",
      drink_price: 150,
    });
  });

  it("calculates cart totals from drink price, toppings, and quantity", async () => {
    const { result } = renderHook(() => useCart());

    await act(async () => {
      await result.current.upsertItem(
        cartItem({
          drink_price: 100,
          quantity: 2,
          topping_details: [
            { id: "pearls", name: "Pearls", price: 15 },
            { id: "pudding", name: "Pudding", price: 20 },
          ],
        }),
      );
      await result.current.upsertItem(
        cartItem({
          drink_id: "drink-2",
          drink_name: "Taro Milk Tea",
          drink_price: 120,
          quantity: 1,
        }),
      );
    });

    expect(result.current.cartTotal).toBe(390);
  });
});
