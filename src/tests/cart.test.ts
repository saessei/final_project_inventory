import { describe, it, expect, beforeEach } from "vitest";
import supabase from "../lib/supabaseClient"; 
import { clearDatabase } from "../utils/db";

type CartRow = {
  id: string;
  barista_user_id: string;
  status: "active" | "checked_out" | "abandoned";
};

type CartItemRow = {
  id: string;
  cart_id: string;
  drink_id: string;
  drink_name: string;
  drink_price: number;
  sugar: string;
  toppings: string[];
  quantity: number;
  created_at?: string;
};

describe("Cart API Integration", () => {
  const baristaUserId = crypto.randomUUID();

  // 1. CLEAN SLATE: Use your new utility before every test
  beforeEach(async () => {
    await clearDatabase();
  });

  // Helper to keep tests DRY
  async function ensureActiveCart(): Promise<string> {
    const { data: created, error } = await supabase
      .from("carts")
      .insert([{ barista_user_id: baristaUserId, status: "active" }])
      .select("id")
      .single();

    if (error) throw error;
    return created.id;
  }

  it("creates an active cart for a barista user", async () => {
    const cartId = await ensureActiveCart();

    const { data, error } = await supabase
      .from("carts")
      .select("*")
      .eq("id", cartId)
      .single<CartRow>();

    expect(error).toBeNull();
    expect(data?.barista_user_id).toBe(baristaUserId);
    expect(data?.status).toBe("active");
  });

  it("inserts cart items and reads them back ordered by created_at", async () => {
    const cartId = await ensureActiveCart();

    const items = [
      {
        cart_id: cartId,
        drink_id: "drink-a",
        drink_name: "Classic Milk Tea",
        drink_price: 5.5,
        sugar: "75%",
        toppings: ["pearls"],
        quantity: 1,
      },
      {
        cart_id: cartId,
        drink_id: "drink-b",
        drink_name: "Taro Milk Tea",
        drink_price: 6.25,
        sugar: "50%",
        toppings: ["pudding"],
        quantity: 2,
      }
    ];

    const { error: insertErr } = await supabase.from("cart_items").insert(items);
    expect(insertErr).toBeNull();

    const { data: readBack, error: readErr } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cartId)
      .order("created_at", { ascending: true });

    expect(readErr).toBeNull();
    expect(readBack).toHaveLength(2);
    expect(readBack![0].drink_name).toBe("Classic Milk Tea");
  });

  it("updates quantity and then deletes an item", async () => {
    const cartId = await ensureActiveCart();

    // Insert
    const { data: item } = await supabase
      .from("cart_items")
      .insert([{
        cart_id: cartId,
        drink_id: "drink-update",
        drink_name: "Update Test",
        drink_price: 4.0,
        sugar: "100%",
        toppings: [],
        quantity: 1,
      }])
      .select()
      .single<CartItemRow>();

    // Update
    const { data: updated } = await supabase
      .from("cart_items")
      .update({ quantity: 5 })
      .eq("id", item!.id)
      .select()
      .single<CartItemRow>();

    expect(updated?.quantity).toBe(5);

    // Delete
    const { error: delErr } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", item!.id);

    expect(delErr).toBeNull();
    
    // Verify deletion
    const { data: verify } = await supabase.from("cart_items").select().eq("id", item!.id);
    expect(verify).toHaveLength(0);
  });

  it("fails to insert cart_item when cart_id does not exist (FK constraint)", async () => {
    const fakeCartId = crypto.randomUUID();

    const { error } = await supabase.from("cart_items").insert([{
      cart_id: fakeCartId,
      drink_id: "fail-test",
      drink_name: "I should fail",
      drink_price: 1.0,
      sugar: "0%",
      toppings: [],
      quantity: 1,
    }]);

    // This proves your "frfr" database constraints are working!
    expect(error).toBeTruthy();
    expect(error?.code).toBe("23503"); // Postgres FK violation code
  });
});