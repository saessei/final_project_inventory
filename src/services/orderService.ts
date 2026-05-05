import supabase from "@/lib/supabaseClient";
import type { CartItem } from "@/hooks/useCart";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  OrderFactory,
  defaultOrderStatusStrategy,
  type OrderItemDetails,
  type OrderStatus,
} from "@/patterns";

export type { OrderStatus };

export const formatOrderDetails = (items: OrderItemDetails[]) =>
  OrderFactory.formatOrderDetails(items);

export const createOrder = async (
  order: {
    customer_name: string;
    status?: OrderStatus;
    total_price: number;
    created_by?: string | null;
    items: CartItem[];
    payment_method?: "cash" | "gcash" | "card" | "other";
  },
  client: SupabaseClient = supabase,
) => {
  const subtotal = Number(order.total_price) || 0;

  const { data: createdOrder, error: orderError } = await client
    .from("orders")
    .insert({
      customer_name: order.customer_name,
      status: order.status ?? "pending",
      created_by: order.created_by ?? null,
      subtotal,
      total_price: subtotal,
    })
    .select("*")
    .single();

  if (orderError) throw new Error(orderError.message);

  const orderItems = order.items.map((item) => ({
    order_id: createdOrder.id,
    drink_id: item.drink_id,
    drink_name: item.drink_name,
    size: item.size,
    sugar_label: item.sugar,
    sugar_percentage: item.sugar_percentage,
    quantity: item.quantity,
    unit_price: item.drink_price,
    line_total: Number(item.drink_price) * item.quantity,
  }));

  const { data: createdItems, error: itemError } = await client
    .from("order_items")
    .insert(orderItems)
    .select("id");

  if (itemError) {
    await client.from("orders").delete().eq("id", createdOrder.id);
    throw new Error(itemError.message);
  }

  const toppingRows = order.items.flatMap((item, index) => {
    const orderItemId = createdItems?.[index]?.id;
    if (!orderItemId) return [];
    return item.topping_details.map((topping) => ({
      order_item_id: orderItemId,
      topping_id: topping.id,
      topping_name: topping.name,
      price: topping.price,
    }));
  });

  if (toppingRows.length > 0) {
    const { error: toppingError } = await client
      .from("order_item_toppings")
      .insert(toppingRows);

    if (toppingError) {
      await client.from("orders").delete().eq("id", createdOrder.id);
      throw new Error(toppingError.message);
    }
  }

  await client.from("payments").insert({
    order_id: createdOrder.id,
    method: order.payment_method ?? "cash",
    status: "unpaid",
    amount_due: subtotal,
  });

  await client.from("order_status_history").insert({
    order_id: createdOrder.id,
    old_status: null,
    new_status: createdOrder.status,
    changed_by: order.created_by ?? null,
    note: "Order created",
  });

  return [{ ...createdOrder, order_items: createdItems }];
};

export const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
  options?: { claim?: boolean; staffUserId?: string },
  client: SupabaseClient = supabase,
) => {
  const { data: existing } = await client
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .maybeSingle();

  const patch = defaultOrderStatusStrategy.buildPatch(newStatus, options);

  let query = client.from("orders").update(patch).eq("id", orderId);

  if (options?.claim) {
    query = query.is("claimed_by", null);
  }

  const { data, error } = await query.select();

  if (error) {
    console.error("Update failed:", error.message);
    return null;
  }

  if (data?.length) {
    await client.from("order_status_history").insert({
      order_id: orderId,
      old_status: existing?.status ?? null,
      new_status: newStatus,
      changed_by: options?.staffUserId ?? null,
    });
  }

  return data;
};
