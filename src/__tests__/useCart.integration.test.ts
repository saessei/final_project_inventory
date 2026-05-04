import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useCart } from "../hooks/useCart";

describe("useCart (integration)", () => {
  it("manages cart items and totals", async () => {
    const { result } = renderHook(() => useCart());

    await act(async () => {
      await result.current.upsertItem({
        drink_id: "drink-1",
        drink_name: "Classic Milk Tea",
        size: "regular",
        drink_price: 100,
        sugar: "50% - Half Sweet",
        sugar_percentage: 50,
        toppings: ["Pearl"],
        topping_details: [{ id: "topping-1", name: "Pearl", price: 10 }],
        quantity: 1,
        notes: "less ice",
      });
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cartTotal).toBe(110);

    await act(async () => {
      await result.current.upsertItem({
        drink_id: "drink-1",
        drink_name: "Classic Milk Tea",
        size: "regular",
        drink_price: 100,
        sugar: "50% - Half Sweet",
        sugar_percentage: 50,
        toppings: ["Pearl"],
        topping_details: [{ id: "topping-1", name: "Pearl", price: 10 }],
        quantity: 1,
        notes: "less ice",
      });
    });

    expect(result.current.cart[0]?.quantity).toBe(2);

    await act(async () => {
      await result.current.incrementItemAtIndex(0);
    });
    expect(result.current.cart[0]?.quantity).toBe(3);

    await act(async () => {
      await result.current.decrementItemAtIndex(0);
    });
    expect(result.current.cart[0]?.quantity).toBe(2);

    await act(async () => {
      await result.current.replaceItemAtIndex(0, {
        drink_id: "drink-1",
        drink_name: "Classic Milk Tea",
        size: "large",
        drink_price: 120,
        sugar: "0% - No Sugar",
        sugar_percentage: 0,
        toppings: [],
        topping_details: [],
        quantity: 1,
        notes: undefined,
      });
    });

    expect(result.current.cart[0]?.size).toBe("large");
    expect(result.current.cartTotal).toBe(120);

    await act(async () => {
      await result.current.clearCart();
    });
    expect(result.current.cart).toHaveLength(0);
    expect(result.current.cartTotal).toBe(0);
  });
});
