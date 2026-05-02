export interface OrderItemTopping {
  id: string;
  order_item_id: string;
  topping_id: string | null;
  topping_name: string;
  price: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  drink_id: string | null;
  drink_name: string;
  size_name: string;
  sugar_label: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  order_item_toppings: OrderItemTopping[];
}

export interface ReportOrder {
  id: string;
  customer_name: string;
  order_details: string;
  status: string;
  created_at: string;
  total_price: number;
  order_items: OrderItem[];
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface BusyHour {
  hour: number;
  display: string;
  count: number;
}
