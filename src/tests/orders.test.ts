import { it, expect, describe, beforeEach } from "vitest";
import { createOrder, updateOrderStatus } from "../services/orderService";
// Use your flexible client that swaps to Service Role in test mode
import supabase from "../lib/supabaseClient"; 
import { clearDatabase } from "../utils/db";

describe("Milk Tea Queueing System - Full Integration (frfr)", () => {
  const testCustomer = "Robin";

  beforeEach(async () => {
    await clearDatabase();
  });

  describe("Orders API Integration", () => {
    it('should successfully place a "Classic Milk Tea" order', async () => {
      const milkTeaOrder = {
        customer_name: testCustomer,
        order_details: "Classic Milk Tea, 75% Sugar, Pearls",
        status: "pending",
      };

      const data = await createOrder(milkTeaOrder, supabase);

      expect(data).not.toBeNull();
      expect(data![0].customer_name).toBe(testCustomer);
      expect(data![0].status).toBe("pending");
    });

    it('should update order to "preparing" when the barista starts (claim)', async () => {
      const baristaUserId = crypto.randomUUID();
      const baristaName = "Test Barista";

      const created = await createOrder(
        {
          customer_name: testCustomer,
          order_details: "Classic Milk Tea, 75% Sugar, Pearls",
          status: "pending",
        },
        supabase,
      );

      const orderId = created?.[0]?.id;
      expect(orderId).toBeTruthy();

      const data = await updateOrderStatus(
        orderId as string,
        "preparing",
        { claim: true, baristaUserId, baristaName },
        supabase,
      );

      expect(data).not.toBeNull();
      expect(data![0].status).toBe("preparing");
      expect(data![0].claimed_by).toBe(baristaUserId);
      expect(data![0].claimed_at).toBeTruthy();
    });

    it("should prevent a second barista from claiming an already claimed order", async () => {
      const created = await createOrder(
        {
          customer_name: testCustomer,
          order_details: "Brown Sugar Milk Tea",
          status: "pending",
        },
        supabase,
      );

      const orderId = created?.[0]?.id;
      expect(orderId).toBeTruthy();

      const firstClaim = await updateOrderStatus(
        orderId as string,
        "preparing",
        {
          claim: true,
          baristaUserId: crypto.randomUUID(),
          baristaName: "First Barista",
        },
        supabase,
      );

      expect(firstClaim).toHaveLength(1);

      const secondClaim = await updateOrderStatus(
        orderId as string,
        "preparing",
        {
          claim: true,
          baristaUserId: crypto.randomUUID(),
          baristaName: "Second Barista",
        },
        supabase,
      );

      expect(secondClaim).toHaveLength(0);
    });

    it('should update order to "completed" without claim metadata', async () => {
      const created = await createOrder(
        {
          customer_name: testCustomer,
          order_details: "Jasmine Milk Tea",
          status: "pending",
        },
        supabase,
      );

      const orderId = created?.[0]?.id;
      expect(orderId).toBeTruthy();

      const data = await updateOrderStatus(orderId as string, "completed", undefined, supabase);

      expect(data).not.toBeNull();
      expect(data![0].status).toBe("completed");
      expect(data![0].claimed_by).toBeNull();
      expect(data![0].claimed_at).toBeNull();
    });

    it("should fail when customer_name is missing (DB Constraint)", async () => {
      const invalidOrder = {
        customer_name: null as unknown as string,
        order_details: "Taro Milk Tea",
        status: "pending",
      };

      await expect(createOrder(invalidOrder, supabase)).rejects.toThrow();
    });

    it("should return an empty array when updating a non-existent Order ID", async () => {
      const result = await updateOrderStatus(
        crypto.randomUUID(),
        "preparing",
        undefined,
        supabase,
      );

      expect(result).toHaveLength(0);
    });

    //sad path
    it("should return null when update fails due to invalid parameters (not a UUID)", async () => {
      const result = await updateOrderStatus(
        "not-a-uuid",
        "completed",
        undefined,
        supabase,
      );

      expect(result).toBeNull();
    });

    it("should throw when claim=true and baristaUserId is missing", async () => {
      const created = await createOrder(
        {
          customer_name: testCustomer,
          order_details: "Wintermelon Tea",
          status: "pending",
        },
        supabase,
      );

      const orderId = created?.[0]?.id;
      expect(orderId).toBeTruthy();

      await expect(
        updateOrderStatus(orderId as string, "preparing", { claim: true }, supabase),
      ).rejects.toThrow("baristaUserId is required when claim=true");
    });
  });
});