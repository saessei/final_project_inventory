import { useState, useEffect } from 'react';
import supabase from '../config/supabaseClient';

interface Order {
  id: string;
  customer_name: string;
  order_details: string;
  status: 'pending' | 'preparing' | 'completed' | 'cancelled';
  created_at: string;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at');
    if (data) setOrders(data);
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('queue-tea-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders(); // Re-fetch when the database changes
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { orders, fetchOrders };
};