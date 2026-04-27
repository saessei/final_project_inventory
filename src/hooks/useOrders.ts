import { useState, useEffect, useCallback } from "react";
import defaultSupabase from "../lib/supabaseClient";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface Order {
  id: string;
  customer_name: string;
  order_details: string;
  status: "pending" | "preparing" | "completed";
  created_at: string;
  claimed_by: string | null;
  claimed_at: string | null;
}

export const useOrders = (supabase: SupabaseClient = defaultSupabase) => {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at");
    if (data) setOrders(data);
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at");
      if (!cancelled && data) setOrders(data);
    };

    void run();

    const channel = supabase
      .channel("queue-tea-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        void run();
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return { orders, fetchOrders };
};