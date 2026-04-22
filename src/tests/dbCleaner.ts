import { supabaseAdmin } from "../lib/supabaseTestClient";

async function fallbackCleanup() {
  const tables = ["cart_items", "carts", "orders", "profiles"];

  for (const table of tables) {
    const { error } = await supabaseAdmin
      .from(table)
      .delete()
      .not("id", "is", null);

    if (error) {
      throw new Error(`Fallback cleanup failed for table ${table}: ${error.message}`);
    }
  }
}

export async function clearTestDatabase() {
  const { error } = await supabaseAdmin.rpc("truncate_all_tables");

  if (error) {
    const isMissingRpc = error.message.toLowerCase().includes("could not find the function");

    if (isMissingRpc) {
      await fallbackCleanup();
      return;
    }

    throw new Error(`Failed to clean test database via truncate_all_tables RPC: ${error.message}`);
  }
}
