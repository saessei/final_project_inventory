import { useCallback, useEffect, useState } from "react";
import defaultSupabase from "@/lib/supabaseClient";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  OrderFactory,
  OrderRealtimeObserver,
  type QueueOrder,
  type QueueOrderRow,
} from "@/patterns";

export type Order = QueueOrder;

const orderWithItemsSelect = "*, order_items(*, order_item_toppings(topping_name))";

export const useOrders = (supabase: SupabaseClient = defaultSupabase) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select(orderWithItemsSelect)
      .order("created_at");

    if (data) {
      setOrders((data as QueueOrderRow[]).map(OrderFactory.createQueueOrder));
    }
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
        .select(orderWithItemsSelect)
        .order("created_at");

      if (!cancelled && data) {
        setOrders((data as QueueOrderRow[]).map(OrderFactory.createQueueOrder));
      }
      if (!cancelled) setLoading(false);
    };

    void run();

    const observer = new OrderRealtimeObserver(supabase);
    observer.subscribe({
      onInsert: async (orderId) => {
        if (cancelled) return;

        const { data } = await supabase
          .from("orders")
          .select(orderWithItemsSelect)
          .eq("id", orderId)
          .single();

        if (!cancelled && data) {
          setOrders((previousOrders) => {
            const alreadyExists = previousOrders.some(
              (order) => order.id === data.id,
            );
            if (alreadyExists) return previousOrders;
            return [
              ...previousOrders,
              OrderFactory.createQueueOrder(data as QueueOrderRow),
            ];
          });
        }
      },
      onUpdate: (updatedOrder) => {
        if (cancelled) return;

        setOrders((previousOrders) =>
          previousOrders.map((order) =>
            order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order,
          ),
        );
      },
      onDelete: (orderId) => {
        if (cancelled) return;
        setOrders((previousOrders) =>
          previousOrders.filter((order) => order.id !== orderId),
        );
      },
    });

    return () => {
      cancelled = true;
      observer.unsubscribe();
    };
  }, [supabase]);

  return { orders, fetchOrders, loading, updateOrderInState };
};
