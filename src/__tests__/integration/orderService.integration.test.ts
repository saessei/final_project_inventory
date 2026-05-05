import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createOrder, updateOrderStatus } from "../../services/orderService";
import supabase from "../../lib/supabaseClient";

describe("OrderService Integration Tests (Real DB)", () => {
  let userId: string | null = null;
  let testOrderId: string | null = null;

  beforeAll(async () => {
    // Sign in to the test database
    const email = import.meta.env.TEST_USER_EMAIL;
    const password = import.meta.env.TEST_USER_PASSWORD;

    if (email && password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error("Failed to sign in for integration tests:", error.message);
      } else {
        userId = data.user?.id;
      }
    }
  });

  afterAll(async () => {
    // Cleanup: Delete the test order and related data if created
    if (testOrderId) {
      await supabase.from("order_item_toppings").delete().eq("order_item_id", (
        await supabase.from("order_items").select("id").eq("order_id", testOrderId)
      ).data?.[0]?.id);
      await supabase.from("order_items").delete().eq("order_id", testOrderId);
      await supabase.from("payments").delete().eq("order_id", testOrderId);
      await supabase.from("order_status_history").delete().eq("order_id", testOrderId);
      await supabase.from("orders").delete().eq("id", testOrderId);
    }
    await supabase.auth.signOut();
  });

  describe("createOrder", () => {
    it("should successfully create an order (Happy Path)", async () => {
      // Need at least one real drink ID to create an order item
      const { data: drinks } = await supabase.from("drinks").select("id, name").limit(1);
      if (!drinks || drinks.length === 0) {
        console.warn("No drinks found in test DB, skipping real order creation test");
        return;
      }

      const drink = drinks[0];
      const cartItems = [
        {
          drink_id: drink.id,
          drink_name: drink.name,
          drink_price: 100,
          quantity: 1,
          size: "regular",
          sugar: "100%",
          sugar_percentage: 100,
          topping_details: [],
          total_price: 100
        }
      ];

      const result = await createOrder({
        customer_name: "Integration Test User",
        total_price: 100,
        items: cartItems as any,
        payment_method: "cash",
        created_by: userId
      });

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      testOrderId = result[0].id;
      expect(result[0].customer_name).toBe("Integration Test User");
    });

    it("should fail when customer name is missing (Sad Path)", async () => {
      await expect(createOrder({
        customer_name: null as any,
        total_price: 100,
        items: []
      })).rejects.toThrow();
    });
  });

  describe("updateOrderStatus", () => {
    it("should update the status of the test order (Happy Path)", async () => {
      if (!testOrderId) return;

      const result = await updateOrderStatus(testOrderId, "preparing", { staffUserId: userId || undefined });
      expect(result).toBeDefined();
      expect(result![0].status).toBe("preparing");
    });

    it("should return null or fail for non-existent order (Sad Path)", async () => {
      const result = await updateOrderStatus("00000000-0000-0000-0000-000000000000", "completed");
      expect(result).toEqual([]);
    });
  });
});
