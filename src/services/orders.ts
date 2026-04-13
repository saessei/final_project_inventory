import supabase from "../config/supabaseClient.ts";
// comment for ci purposes
export const createOrder = async (order: {
  customer_name: string;
  order_details: string;
  status: string;
  user_id?: string;
}) => {
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

export const updateOrderStatus = async (orderId: string, newStatus: string) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)
    .select();

  if (error) {
    console.error('Update failed:', error.message);
    return null;
  }
  
  return data;
};