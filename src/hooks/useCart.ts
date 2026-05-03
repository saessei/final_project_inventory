import { useCallback, useMemo, useState } from "react";

export type CartTopping = {
  id: string;
  name: string;
  price: number;
};

export type CartItem = {
  id: string;
  drink_id: string;
  drink_name: string;
  size: "regular" | "medium" | "large";
  drink_price: number;
  sugar: string;
  sugar_percentage: number | null;
  toppings: string[];
  topping_details: CartTopping[];
  quantity: number;
};

export function useCart(_staffUserId?: string) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading] = useState(false);

  const refresh = useCallback(async () => undefined, []);

  const upsertItem = useCallback(async (item: Omit<CartItem, "id">) => {
    setCart((current) => {
      const sameIndex = current.findIndex(
        (ci) =>
          ci.drink_id === item.drink_id &&
          ci.size === item.size &&
          ci.sugar === item.sugar &&
          JSON.stringify(ci.topping_details.map((t) => t.id).sort()) ===
            JSON.stringify(item.topping_details.map((t) => t.id).sort()),
      );

      if (sameIndex >= 0) {
        return current.map((ci, index) =>
          index === sameIndex
            ? { ...ci, quantity: ci.quantity + item.quantity }
            : ci,
        );
      }

      return [
        ...current,
        {
          ...item,
          id: crypto.randomUUID(),
        },
      ];
    });
  }, []);

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

  const incrementItemAtIndex = useCallback(async (index: number) => {
    setCart((current) =>
      current.map((item, i) =>
        i === index ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }, []);

  const clearCart = useCallback(async () => {
    setCart([]);
  }, []);

  const removeItemAtIndex = useCallback(async (index: number) => {
    setCart((current) => current.filter((_, i) => i !== index));
  }, []);

  const cartTotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.quantity * Number(i.drink_price), 0),
    [cart],
  );

  return {
    cart,
    cartId: null,
    loading,
    refresh,
    upsertItem,
    decrementItemAtIndex,
    incrementItemAtIndex,
    removeItemAtIndex,
    clearCart,
    cartTotal,
  };
}
