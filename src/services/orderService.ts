  import supabaseDefault from "../lib/supabaseClient.ts";

  export const createOrder = async (
    order: {
      customer_name: string;
      order_details: string;
      status: string;
      user_id?: string;
    },
    supabase = supabaseDefault 
  ) => {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select();

    if (error) {
      console.error('Create order failed:', error.message);
      throw new Error(error.message);
    }

    return data;
  };

  export const updateOrderStatus = async (
  orderId: string,
  newStatus: "pending" | "preparing" | "completed" ,
    options?: { claim?: boolean; baristaUserId?: string },
  supabase = supabaseDefault,
) => {
  const patch: Record<string, unknown> = { status: newStatus };

  // If claiming, write claimed_by/claimed_at
  if (options?.claim) {
    if (!options.baristaUserId) {
      throw new Error("baristaUserId is required when claim=true");
    }
    patch.claimed_by = options.baristaUserId;
    patch.claimed_at = new Date().toISOString();
  }

  let query = supabase.from("orders").update(patch).eq("id", orderId);

  // prevent two baristas claiming the same order
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