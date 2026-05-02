import { useState, useEffect, useCallback } from "react";
import defaultSupabase from "@/lib/supabaseClient";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { OrderItem, OrderItemTopping } from "@/types/reportTypes";

export interface Order {
  id: string;
  customer_name: string;
  order_details: string;
  status: "pending" | "preparing" | "completed";
  total_price: number;
  created_at: string;
  claimed_by: string | null;
  claimed_at: string | null;
  items: OrderItem[];
}

/**
 * Build a display string from structured items (replaces text blob).
 * Example output: "1x Matcha Milk Tea (Large) (50% - Half Sweet, Pearl, Oreo)"
 */
export function formatOrderItems(items: OrderItem[]): string {
  return items
    .map((item) => {
      const toppings = item.order_item_toppings
        ?.map((t) => t.topping_name)
        .join(", ");
      const extras = toppings ? `, ${toppings}` : "";
      return `${item.quantity}x ${item.drink_name} (${capitalize(item.size_name)}) (${item.sugar_label}${extras})`;
    })
    .join(" • ");
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapRawOrder(raw: any): Order {
  const items: OrderItem[] = (raw.order_items ?? []).map((oi: any) => ({
    id: oi.id,
    order_id: oi.order_id,
    drink_id: oi.drink_id,
    drink_name: oi.drink_name,
    size_name: oi.size_name,
    sugar_label: oi.sugar_label,
    unit_price: Number(oi.unit_price),
    quantity: oi.quantity,
    line_total: Number(oi.line_total),
    order_item_toppings: (oi.order_item_toppings ?? []).map((oit: any) => ({
      id: oit.id,
      order_item_id: oit.order_item_id,
      topping_id: oit.topping_id,
      topping_name: oit.topping_name,
      price: Number(oit.price),
    })) as OrderItemTopping[],
  }));

  return {
    id: raw.id,
    customer_name: raw.customer_name,
    order_details: raw.order_details ?? "",
    status: raw.status,
    total_price: Number(raw.total_price ?? 0),
    created_at: raw.created_at,
    claimed_by: raw.claimed_by,
    claimed_at: raw.claimed_at,
    items,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const ORDER_SELECT = `
  *,
  order_items(
    *,
    order_item_toppings(*)
  )
`;

export const useOrders = (supabase: SupabaseClient = defaultSupabase) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .order("created_at");
    if (data) setOrders(data.map(mapRawOrder));
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const { data } = await supabase
        .from("orders")
        .select(ORDER_SELECT)
        .order("created_at");
        if (!cancelled && data) {
          setOrders(data.map(mapRawOrder));
          setLoading(false);
        }
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

  return { orders, fetchOrders, loading };
};
