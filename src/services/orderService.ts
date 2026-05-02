import supabase from "@/lib/supabaseClient";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface CreateOrderItemInput {
  drink_id: string;
  drink_name: string;
  size_name: string;
  sugar_label: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  toppings: { topping_id?: string; topping_name: string; price: number }[];
}

export const createOrder = async (
  order: {
    customer_name: string;
    order_details: string;
    status: string;
    total_price?: number;
    items?: CreateOrderItemInput[];
  },
  client: SupabaseClient = supabase,
) => {
  const orderToSave = {
    customer_name: order.customer_name,
    order_details: order.order_details,
    status: order.status,
    total_price: order.total_price || 0,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await client
    .from("orders")
    .insert([orderToSave])
    .select()
    .single();

  if (error) {
    console.error("❌ Create order failed:", error);
    throw new Error(error.message);
  }

  const orderId = data.id as string;

  // Insert structured order_items + order_item_toppings
  if (order.items && order.items.length > 0) {
    for (const item of order.items) {
      const { data: itemData, error: itemError } = await client
        .from("order_items")
        .insert({
          order_id: orderId,
          drink_id: item.drink_id,
          drink_name: item.drink_name,
          size_name: item.size_name,
          sugar_label: item.sugar_label,
          unit_price: item.unit_price,
          quantity: item.quantity,
          line_total: item.line_total,
        })
        .select()
        .single();

      if (itemError) {
        console.error("❌ Insert order_item failed:", itemError);
        continue;
      }

      if (item.toppings.length > 0) {
        const toppingRows = item.toppings.map((t) => ({
          order_item_id: itemData.id,
          topping_id: t.topping_id || null,
          topping_name: t.topping_name,
          price: t.price,
        }));

        const { error: toppingError } = await client
          .from("order_item_toppings")
          .insert(toppingRows);

        if (toppingError) {
          console.error("❌ Insert order_item_toppings failed:", toppingError);
        }
      }
    }
  }

  return [data];
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
