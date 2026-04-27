import { describe, it, expect, afterAll } from "vitest";
import { supabaseAdmin } from "../lib/supabaseTestClient";

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

describe("Cart Integration Test", () => {
  const testRunId = `vitest-cart-api-${Date.now()}`;
  const baristaUserId = crypto.randomUUID();

  const createdCartIds: string[] = [];
  const createdCartItemIds: string[] = [];

  async function ensureActiveCart(): Promise<string> {
    // Swapped to supabaseAdmin to bypass RLS
    const { data: existing, error: existingErr } = await supabaseAdmin
      .from("carts")
      .select("id, barista_user_id, status")
      .eq("barista_user_id", baristaUserId)
      .eq("status", "active")
      .maybeSingle<CartRow>();

    if (existingErr) throw existingErr;
    if (existing?.id) return existing.id;

    const { data: created, error: createErr } = await supabaseAdmin
      .from("carts")
      .insert([{ barista_user_id: baristaUserId, status: "active" }])
      .select("id")
      .single();

    if (createErr) throw createErr;

    const id = created.id as string;
    createdCartIds.push(id);
    return id;
  }

  afterAll(async () => {
    // Cleanup using supabaseAdmin
    if (createdCartItemIds.length) {
      await supabaseAdmin
        .from("cart_items")
        .delete()
        .in("id", createdCartItemIds);
    } else if (createdCartIds.length) {
      await supabaseAdmin
        .from("cart_items")
        .delete()
        .in("cart_id", createdCartIds);
    }

    if (createdCartIds.length) {
      await supabaseAdmin.from("carts").delete().in("id", createdCartIds);
    } else {
      await supabaseAdmin
        .from("carts")
        .delete()
        .eq("barista_user_id", baristaUserId);
    }
  });

  // Happy Path

  it("creates an active cart for a barista user", async () => {
    const cartId = await ensureActiveCart();

    const { data, error } = await supabaseAdmin
      .from("carts")
      .select("id, barista_user_id, status")
      .eq("id", cartId)
      .single<CartRow>();

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data!.barista_user_id).toBe(baristaUserId);
    expect(data!.status).toBe("active");
  });

  it("inserts cart items and reads them back ordered by created_at", async () => {
    const cartId = await ensureActiveCart();

    const itemA = {
      cart_id: cartId,
      drink_id: `drink-a-${testRunId}`,
      drink_name: `Classic Milk Tea (${testRunId})`,
      drink_price: 5.5,
      sugar: "75%",
      toppings: ["pearls"],
      quantity: 1,
    };

    const itemB = {
      cart_id: cartId,
      drink_id: `drink-b-${testRunId}`,
      drink_name: `Taro Milk Tea (${testRunId})`,
      drink_price: 6.25,
      sugar: "50%",
      toppings: ["pudding"],
      quantity: 2,
    };

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from("cart_items")
      .insert([itemA, itemB])
      .select(
        "id, cart_id, drink_id, drink_name, drink_price, sugar, toppings, quantity, created_at",
      );

    expect(insertErr).toBeNull();
    expect(inserted).toBeTruthy();
    expect(inserted!.length).toBeGreaterThanOrEqual(2);

    for (const row of inserted as CartItemRow[]) {
      createdCartItemIds.push(row.id);
    }

    const { data: readBack, error: readErr } = await supabaseAdmin
      .from("cart_items")
      .select(
        "id, cart_id, drink_id, drink_name, drink_price, sugar, toppings, quantity, created_at",
      )
      .eq("cart_id", cartId)
      .order("created_at", { ascending: true });

    expect(readErr).toBeNull();
    expect(Array.isArray(readBack)).toBe(true);

    const mine = (readBack as CartItemRow[]).filter((r) =>
      r.drink_id.includes(testRunId),
    );
    expect(mine.length).toBeGreaterThanOrEqual(2);

    const times = mine
      .map((r) => (r.created_at ? new Date(r.created_at).getTime() : 0))
      .filter((t) => t > 0);

    if (times.length >= 2) {
      expect(times).toEqual([...times].sort((a, b) => a - b));
    }
  });

  it("updates quantity and then deletes an item", async () => {
    const cartId = await ensureActiveCart();

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from("cart_items")
      .insert([
        {
          cart_id: cartId,
          drink_id: `drink-inc-${testRunId}`,
          drink_name: `Increment Test (${testRunId})`,
          drink_price: 4.0,
          sugar: "100%",
          toppings: [],
          quantity: 1,
        },
      ])
      .select("id, quantity")
      .single<CartItemRow>();

    expect(insertErr).toBeNull();
    expect(inserted).toBeTruthy();
    createdCartItemIds.push(inserted!.id);

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from("cart_items")
      .update({ quantity: 2 })
      .eq("id", inserted!.id)
      .select("id, quantity")
      .single<CartItemRow>();

    expect(updateErr).toBeNull();
    expect(updated!.quantity).toBe(2);

    const { error: delErr } = await supabaseAdmin
      .from("cart_items")
      .delete()
      .eq("id", inserted!.id);
    expect(delErr).toBeNull();
  });

  // --- Sad Path ---

  it("fails to insert cart_item when cart_id does not exist (FK constraint)", async () => {
    const fakeCartId = crypto.randomUUID();

    const { error } = await supabaseAdmin.from("cart_items").insert([
      {
        cart_id: fakeCartId,
        drink_id: `drink-fk-${testRunId}`,
        drink_name: `FK Fail (${testRunId})`,
        drink_price: 1.0,
        sugar: "0%",
        toppings: [],
        quantity: 1,
      },
    ]);

    // This still fails correctly because it triggers a Database Constraint (FK),
    // which the service_role key does NOT bypass.
    expect(error).toBeTruthy();
  });
});