export interface ReportOrder {
  id: string;
  customer_name: string;
  order_details: string;
  status: string;
  created_at: string;
  total_price: number;
  order_items?: ReportOrderItem[];
}

export interface ReportOrderItem {
  id: string;
  drink_name: string;
  quantity: number;
  line_total: number;
  order_item_toppings?: ReportOrderItemTopping[];
}

export interface ReportOrderItemTopping {
  topping_name: string;
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
