import { useState, useEffect, useCallback } from "react";
import defaultSupabase from "@/lib/supabaseClient";
import type { SupabaseClient } from "@supabase/supabase-js";
import { formatOrderDetails, type OrderStatus } from "@/services/orderService";

const POLL_INTERVAL_MS = 4000;

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

  const fetchOrders = useCallback(
    async (showLoading: boolean = true) => {
      if (showLoading) setLoading(true);

      const { data, error } = await supabase
        .from("orders")
        .select(
          "*, order_items(*, order_item_toppings(topping_name))",
        )
        .order("created_at");

      if (error) {
        console.error("Failed to fetch orders:", error.message);
      } else if (data) {
        setOrders((data as OrderRow[]).map(mapOrder));
      }

      if (showLoading) setLoading(false);
    },
    [supabase],
  );

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

    const syncOrders = async (showLoading: boolean = false) => {
      await fetchOrders(showLoading);
      if (!cancelled && showLoading) {
        setLoading(false);
      }
    };

    void syncOrders(true);

    const channelName = `queue-tea-live-orders-${Math.random().toString(36).slice(2)}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          if (!cancelled) {
            void syncOrders(false);
          }
        },
      )
      .on("system", {}, () => {
        if (!cancelled) {
          void syncOrders(false);
        }
      })
      .subscribe();

    const pollId = window.setInterval(() => {
      if (!cancelled) {
        void syncOrders(false);
      }
    }, POLL_INTERVAL_MS);

    const onFocus = () => {
      if (!cancelled) {
        void syncOrders(false);
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      cancelled = true;
      window.clearInterval(pollId);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
      supabase.removeChannel(channel);
    };
  }, [fetchOrders, supabase]);

  return { orders, fetchOrders, loading, updateOrderInState };
};
