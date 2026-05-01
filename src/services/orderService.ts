import supabase from "@/lib/supabaseClient";
import type { SupabaseClient } from "@supabase/supabase-js";

export const createOrder = async (
  order: {
    customer_name: string;
    order_details: string;
    status: string;
    total_price?: number;
  },
  client: SupabaseClient = supabase,
) => {
  console.log("Received order object:", order);
  console.log("total_price value:", order.total_price);

  const orderToSave = {
    customer_name: order.customer_name,
    order_details: order.order_details,
    status: order.status,
    total_price: order.total_price || 0,
    created_at: new Date().toISOString(),
  };

  console.log("🔍 DEBUG - Saving this to database:", orderToSave);

  const { data, error } = await client
    .from("orders")
    .insert([orderToSave])
    .select();

  if (error) {
    console.error("❌ Create order failed:", error);
    throw new Error(error.message);
  }

  console.log("✅ Order saved successfully:", data);
  return data;
};

export const updateOrderStatus = async (
  orderId: string,
  newStatus: "pending" | "preparing" | "completed",
  options?: { claim?: boolean; baristaUserId?: string },
  client: SupabaseClient = supabase,
) => {
  const patch: Record<string, unknown> = { status: newStatus };

  if (options?.claim) {
    if (!options.baristaUserId) {
      throw new Error("baristaUserId is required when claim=true");
    }
    patch.claimed_by = options.baristaUserId;
    patch.claimed_at = new Date().toISOString();
  }

  let query = client.from("orders").update(patch).eq("id", orderId);

  if (options?.claim) {
    query = query.is("claimed_by", null);
  }

  const { data, error } = await query.select();

  if (error) {
    console.error("Update failed:", error.message);
    return null;
  }

  return data;
};
