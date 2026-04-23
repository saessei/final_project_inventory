// src/tests/utils/db.ts
import supabase from "../lib/supabaseClient";

export const clearDatabase = async () => {
  const allZeroUuid = '00000000-0000-0000-0000-000000000000';

  // 1. Delete children first (items in the cart)
  await supabase.from('cart_items').delete().neq('id', allZeroUuid);

  // 2. Delete parents (the carts themselves)
  await supabase.from('carts').delete().neq('id', allZeroUuid);

  // 3. Delete orders (resolves the "8 to be 2" error)
  const { error } = await supabase.from('orders').delete().neq('id', allZeroUuid);

  if (error) {
    console.error("Database cleanup failed:", error.message);
    throw error;
  }
};