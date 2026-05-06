import { useCallback, useMemo, useState } from "react";
import { defaultPricingStrategy } from "@/patterns";  // ← STRATEGY: Imported for cart total calculation

// ============================================================
// CONTEXT DATA - What the strategy calculates
// ============================================================
export type CartTopping = {
  id: string;
  name: string;
  price: number;        // ← Each topping has a price
};

export type CartItem = {
  id: string;
  drink_id: string;
  drink_name: string;
  size: "regular" | "medium" | "large";
  drink_price: number;           // ← Base drink price
  sugar: string;                 // ← Sugar level label (e.g., "50%")
  sugar_percentage: number | null;  // ← Sugar percentage (e.g., 50)
  toppings: string[];            // ← Topping names for display
  topping_details: CartTopping[]; // ← Toppings with prices for calculation
  quantity: number;              // ← Quantity multiplier
  notes?: string;                // ← Special instructions
};

// ============================================================
// CUSTOM HOOK (Context) - Manages cart state
// ============================================================
export function useCart(staffUserId?: string) {
  void staffUserId;  // Reserved for future use
  const [cart, setCart] = useState<CartItem[]>([]);  // ← STATE: Array of cart items
  const [loading] = useState(false);

  const refresh = useCallback(async () => undefined, []);

  // ============================================================
  // STATE MUTATORS - These trigger the Strategy recalculation
  // ============================================================

  // Add new item or increase quantity if identical item exists
  const upsertItem = useCallback(async (item: Omit<CartItem, "id">) => {
    setCart((current) => {
      // Check if identical item already exists (same drink, size, sugar, toppings)
      const sameIndex = current.findIndex(
        (ci) =>
          ci.drink_id === item.drink_id &&
          ci.size === item.size &&
          ci.sugar === item.sugar &&
          ci.notes === item.notes &&
          JSON.stringify(ci.topping_details.map((t) => t.id).sort()) ===
            JSON.stringify(item.topping_details.map((t) => t.id).sort()),
      );

      if (sameIndex >= 0) {
        // Item exists → increase quantity
        return current.map((ci, index) =>
          index === sameIndex
            ? { ...ci, quantity: ci.quantity + item.quantity }
            : ci,
        );
      }

      // New item → add to cart
      return [
        ...current,
        {
          ...item,
          id: crypto.randomUUID(),
        },
      ];
    });
  }, []);

  // Decrease quantity of item at index (remove if quantity becomes 0)
  const decrementItemAtIndex = useCallback(async (index: number) => {
    setCart((current) => {
      const item = current[index];
      if (!item) return current;
      if (item.quantity <= 1) return current.filter((_, i) => i !== index);
      return current.map((ci, i) =>
        i === index ? { ...ci, quantity: ci.quantity - 1 } : ci,
      );
    });
  }, []);

  // Increase quantity of item at index
  const incrementItemAtIndex = useCallback(async (index: number) => {
    setCart((current) =>
      current.map((item, i) =>
        i === index ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }, []);

  // Remove entire item from cart
  const removeItemAtIndex = useCallback(async (index: number) => {
    setCart((current) => current.filter((_, i) => i !== index));
  }, []);

  // Replace item at index with new configuration (used for editing)
  const replaceItemAtIndex = useCallback(async (index: number, item: Omit<CartItem, "id">) => {
    setCart((current) =>
      current.map((ci, i) =>
        i === index ? { ...item, id: ci.id } : ci
      )
    );
  }, []);

  // Empty the entire cart
  const clearCart = useCallback(async () => {
    setCart([]);
  }, []);

  // ============================================================
  // STRATEGY PATTERN IN ACTION
  // ============================================================
  // Every time cart changes, Strategy recalculates total
  // - Re-runs when 'cart' array changes
  // - Calls the pricing strategy to calculate total including toppings
  // - Returns the updated total to display in cart sidebar
  const cartTotal = useMemo(
    () => defaultPricingStrategy.calculateCartTotal(cart),  // ← STRATEGY CALLED
    [cart],  // ← DEPENDENCY: re-run when cart changes
  );

  return {
    cart,                   // ← Current cart items
    cartId: null,           // ← Reserved for future
    loading,                // ← Loading state
    refresh,                // ← Refresh function
    upsertItem,             // ← Add/update item (triggers Strategy)
    decrementItemAtIndex,   // ← Decrease quantity (triggers Strategy)
    incrementItemAtIndex,   // ← Increase quantity (triggers Strategy)
    removeItemAtIndex,      // ← Remove item (triggers Strategy)
    replaceItemAtIndex,     // ← Replace item (triggers Strategy)
    clearCart,              // ← Empty cart (triggers Strategy)
    cartTotal,              // ← Calculated by Strategy
  };
}
