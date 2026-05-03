import { useState, useEffect, useCallback } from "react";
import defaultSupabase from "@/lib/supabaseClient";
import type { SupabaseClient } from "@supabase/supabase-js";
import { formatOrderDetails, type OrderStatus } from "@/services/orderService";

export interface Order {
  id: string;
  customer_name: string;
  order_details: string;
  status: OrderStatus;
  created_at: string;
  claimed_by: string | null;
  claimed_at: string | null;
  total_price: number;
}

type OrderItemRow = {
  quantity: number;
  drink_name: string;
  size: string;
  sugar_label: string;
  order_item_toppings?: Array<{ topping_name: string }>;
};

type OrderRow = Omit<Order, "order_details"> & {
  order_items?: OrderItemRow[];
};

const mapOrder = (order: OrderRow): Order => ({
  ...order,
  order_details: formatOrderDetails(order.order_items ?? []),
});

export const useOrders = (supabase: SupabaseClient = defaultSupabase) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select(
        "*, order_items(*, order_item_toppings(topping_name))",
      )
      .order("created_at");
    if (data) setOrders((data as OrderRow[]).map(mapOrder));
    setLoading(false);
  }, [supabase]);

  const updateOrderInState = useCallback(
    (orderId: string, status: Order["status"]) => {
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? { ...order, status } : order,
        ),
      );
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const { data } = await supabase
        .from("orders")
        .select(
          "*, order_items(*, order_item_toppings(topping_name))",
        )
        .order("created_at");
      if (!cancelled && data) setOrders((data as OrderRow[]).map(mapOrder));
      if (!cancelled) setLoading(false);
    };

    void run();

    const channel = supabase
      .channel("queue-tea-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          void run();
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return { orders, fetchOrders, loading, updateOrderInState };
};
