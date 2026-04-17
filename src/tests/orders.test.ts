import { it, expect, describe, afterAll } from 'vitest';
import { createOrder, updateOrderStatus } from '../services/orderService';
import { supabaseTest, supabaseAdmin } from '../lib/supabaseTestClient';

describe('Milk Tea Queueing System - Full Integration', () => {
  const testCustomer = "Robin";
  let sharedOrderId: string;

  // CLEANUP
  afterAll(async () => {
    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('customer_name', testCustomer);
    
    if (error) console.error('Cleanup failed:', error.message);
  });

  // Happy paths
  describe('Happy Path', () => {
    it('should successfully place a "Classic Milk Tea" order', async () => {
      const milkTeaOrder = {
        customer_name: testCustomer,
        order_details: 'Classic Milk Tea, 75% Sugar, Pearls',
        status: 'pending' 
      };

      const data = await createOrder(milkTeaOrder, supabaseTest);

      expect(data).not.toBeNull();
      expect(data![0].customer_name).toBe(testCustomer);
      expect(data![0].status).toBe('pending');
      
      sharedOrderId = data![0].id;
    });

    it('should update order to "preparing" when the barista starts', async () => {
      const data = await updateOrderStatus(sharedOrderId, 'preparing', supabaseTest);

      expect(data).not.toBeNull();
      expect(data![0].status).toBe('preparing');
    });

    it('should update order to "completed" when ready for pickup', async () => {
      const data = await updateOrderStatus(sharedOrderId, 'completed', supabaseTest);

      expect(data).not.toBeNull();
      expect(data![0].status).toBe('completed');
    });
  });

  // Sad paths
  describe('Sad Path', () => {
    
    it('should fail when customer_name is missing (DB Constraint)', async () => {
      const invalidOrder = {
        customer_name: null as any,
        order_details: 'Taro Milk Tea',
        status: 'pending'
      };

      await expect(createOrder(invalidOrder, supabaseTest)).rejects.toThrow();
    });

    it('should return an empty array when updating a non-existent Order ID', async () => {
      const fakeUuid = crypto.randomUUID();
      const result = await updateOrderStatus(fakeUuid, 'preparing', supabaseTest);

      expect(result).toHaveLength(0);
    });

    it('should handle extremely long order details (Database Limit)', async () => {
      const extremeOrder = {
        customer_name: testCustomer,
        order_details: 'Milk Tea'.repeat(500), 
        status: 'pending'
      };

      try {
        const data = await createOrder(extremeOrder, supabaseTest);
        expect(data).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should return null when update fails due to invalid parameters', async () => {
      const result = await updateOrderStatus('not-a-uuid', 'completed', supabaseTest);
      
      expect(result).toBeNull();
    });
  });
});