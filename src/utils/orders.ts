import  supabase  from "../config/supabaseClient.ts";

export const updateOrderStatus = async (orderId: string, newStatus: string) => {
  const { data, error } = await supabase
    .from('orders') // The table we just created
    .update({ status: newStatus })
    .eq('id', orderId) // Find the specific order
    .select(); // Returns the updated row

  if (error) {
    console.error('Update failed:', error.message);
    return null;
  }
  
  return data;
};