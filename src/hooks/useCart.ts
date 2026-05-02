import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import supabase from "@/lib/supabaseClient";

export type CartItem = {
  id: string;
  cart_id: string;
  drink_id: string;
  drink_name: string;
  drink_price: number;
  sugar: string;
  toppings: string[];
  quantity: number;
};

type Cart = {
  id: string;
  barista_user_id: string;
  status: "active" | "checked_out" | "abandoned";
};

export function useCart(staffUserId?: string) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const hasLoadedOnce = useRef(false);

  const ensureActiveCart = useCallback(async () => {
    if (!staffUserId) return null;

    // 1) find existing active cart
    const { data: existing, error: existingErr } = await supabase
      .from("carts")
      .select("id, barista_user_id, status")
      .eq("barista_user_id", staffUserId)
      .eq("status", "active")
      .maybeSingle<Cart>();

    if (existingErr) throw existingErr;
    if (existing?.id) return existing.id;

    // 2) create one if missing
    const { data: created, error: createErr } = await supabase
      .from("carts")
      .insert([{ barista_user_id: staffUserId, status: "active" }])
      .select("id")
      .single();

    if (createErr) throw createErr;
    return created.id as string;
  }, [staffUserId]);

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    if (!staffUserId) return;

    const shouldShowLoading = !hasLoadedOnce.current && !options?.silent;
    if (shouldShowLoading) {
      setLoading(true);
    }
    try {
      const id = await ensureActiveCart();
      if (!id) return;

      setCartId(id);

      const { data, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("cart_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setCart((data ?? []) as CartItem[]);
    } finally {
      hasLoadedOnce.current = true;
      if (shouldShowLoading) {
        setLoading(false);
      }
    }
  }, [staffUserId, ensureActiveCart]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Optional: realtime updates if you want multi-tab sync
  useEffect(() => {
    if (!cartId) return;

    const channel = supabase
      .channel(`cart-items-${cartId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart_items",
          filter: `cart_id=eq.${cartId}`,
        },
        () => refresh({ silent: true }),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cartId, refresh]);

  const upsertItem = useCallback(
    async (item: Omit<CartItem, "id" | "cart_id">) => {
      if (!staffUserId) throw new Error("Missing staffUserId");
      const id = cartId ?? (await ensureActiveCart());
      if (!id) return;

      // Find "same item" (drink + sugar + toppings)
      const same = cart.find(
        (ci) =>
          ci.drink_id === item.drink_id &&
          ci.sugar === item.sugar &&
          JSON.stringify(ci.toppings) === JSON.stringify(item.toppings),
      );

      if (same) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: same.quantity + item.quantity })
          .eq("id", same.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("cart_items").insert([
          {
            cart_id: id,
            ...item,
          },
        ]);
        if (error) throw error;
      }

      await refresh({ silent: true });
    },
    [staffUserId, cartId, cart, ensureActiveCart, refresh],
  );

  const decrementItemAtIndex = useCallback(
    async (index: number) => {
      const item = cart[index];
      if (!item) return;

      if (item.quantity > 1) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: item.quantity - 1 })
          .eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cart_items")
          .delete()
          .eq("id", item.id);
        if (error) throw error;
      }
      await refresh({ silent: true });
    },
    [cart, refresh],
  );

  const incrementItemAtIndex = useCallback(
    async (index: number) => {
      const item = cart[index];
      if (!item) return;

      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: item.quantity + 1 })
        .eq("id", item.id);

      if (error) throw error;
      await refresh({ silent: true });
    },
    [cart, refresh],
  );

  const clearCart = useCallback(async () => {
    if (!cartId) return;
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cartId);
    if (error) throw error;
    await refresh({ silent: true });
  }, [cartId, refresh]);

  const cartTotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.quantity * Number(i.drink_price), 0),
    [cart],
  );

  const removeItemAtIndex = useCallback(
    async (index: number) => {
      const item = cart[index];
      if (!item) return;

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", item.id);
      if (error) throw error;

      await refresh({ silent: true });
    },
    [cart, refresh],
  );

  return {
    cart,
    cartId,
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
