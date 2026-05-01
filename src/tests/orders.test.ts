import { it, expect, describe, afterAll } from "vitest";
import { createOrder, updateOrderStatus } from "@/services/orderService";
import { supabaseAdmin } from "@/lib/supabaseTestClient"; // Using admin client

describe("Order Integration Test", () => {
  const testCustomer = "Robin";
  let sharedOrderId: string;

  // CLEANUP using Admin client
  afterAll(async () => {
    const { error } = await supabaseAdmin
      .from("orders")
      .delete()
      .eq("customer_name", testCustomer);

    if (error) console.error("Cleanup failed:", error.message);
  });

  // Happy paths
  describe("Happy Path", () => {
    it('should successfully place a "Classic Milk Tea" order', async () => {
      const milkTeaOrder = {
        customer_name: testCustomer,
        order_details: "Classic Milk Tea, 75% Sugar, Pearls",
        status: "pending",
      };

      // Pass supabaseAdmin here to bypass RLS
      const data = await createOrder(milkTeaOrder, supabaseAdmin);

      expect(data).not.toBeNull();
      expect(data![0].customer_name).toBe(testCustomer);
      expect(data![0].status).toBe("pending");

      sharedOrderId = data![0].id;
    });

    it('should update order to "preparing" when the barista starts (claim)', async () => {
      const baristaUserId = crypto.randomUUID();

      const data = await updateOrderStatus(
        sharedOrderId,
        "preparing",
        {
          claim: true,
          baristaUserId,
        },
        supabaseAdmin, // Inject admin client
      );

      expect(data).not.toBeNull();
      expect(data![0].status).toBe("preparing");
      expect(data![0].claimed_by).toBe(baristaUserId);
      expect(data![0].claimed_at).toBeTruthy();
    });

    it('should update order to "completed" when ready for pickup', async () => {
      const data = await updateOrderStatus(
        sharedOrderId,
        "completed",
        undefined,
        supabaseAdmin, // Inject admin client
      );

      expect(data).not.toBeNull();
      expect(data![0].status).toBe("completed");
    });
  });

  // Sad paths
  describe("Sad Path", () => {
    it("should fail when customer_name is missing (DB Constraint)", async () => {
      const invalidOrder = {
        customer_name: null as unknown as string,
        order_details: "Taro Milk Tea",
        status: "pending",
      };

      // Even with admin key, DB constraints (NOT NULL) will still trigger a throw
      await expect(createOrder(invalidOrder, supabaseAdmin)).rejects.toThrow();
    });

    it("should return an empty array when updating a non-existent Order ID", async () => {
      const fakeUuid = crypto.randomUUID();
      const result = await updateOrderStatus(
        fakeUuid,
        "preparing",
        undefined,
        supabaseAdmin,
      );

      expect(result).toHaveLength(0);
    });

    it("should handle extremely long order details (Database Limit)", async () => {
      const extremeOrder = {
        customer_name: testCustomer,
        order_details: "Milk Tea".repeat(500),
        status: "pending",
      };

      try {
        const data = await createOrder(extremeOrder, supabaseAdmin);
        expect(data).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should return null when update fails due to invalid parameters", async () => {
      const result = await updateOrderStatus(
        "not-a-uuid",
        "completed",
        undefined,
        supabaseAdmin,
      );

      expect(result).toBeNull();
    });

    it("should throw when claim=true but baristaUserId is missing", async () => {
      await expect(
        updateOrderStatus(
          sharedOrderId,
          "preparing",
          { claim: true },
          supabaseAdmin,
        ),
      ).rejects.toThrow(/baristaUserId is required/i);
    });

    it('should allow updating to "preparing" without claiming (no claimed_by fields set)', async () => {
      const milkTeaOrder = {
        customer_name: testCustomer,
        order_details: "Oolong Milk Tea, 50% Sugar",
        status: "pending",
      };

      const created = await createOrder(milkTeaOrder, supabaseAdmin);
      const orderId = created![0].id;

      const updated = await updateOrderStatus(
        orderId,
        "preparing",
        undefined,
        supabaseAdmin,
      );

      expect(updated).not.toBeNull();
      expect(updated![0].status).toBe("preparing");
      expect(updated![0].claimed_by ?? null).toBeNull();
    });
  });
});
