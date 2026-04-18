import { useState, useEffect, useCallback } from "react";
import defaultSupabase from "../lib/supabaseClient";
import type { SupabaseClient } from "@supabase/supabase-js";

interface Order {
  id: string;
  customer_name: string;
  order_details: string;
  status: "pending" | "preparing" | "completed" | "cancelled";
  created_at: string;
}

export const useOrders = (supabase: SupabaseClient = defaultSupabase) => {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at");
    if (data) setOrders(data);
  }, [supabase]);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("queue-tea-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders, supabase]);

  return { orders, fetchOrders };
};