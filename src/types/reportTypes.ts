export interface ReportOrder {
  id: string;
  customer_name: string;
  order_details: string;
  status: string;
  created_at: string;
  total_price: number;
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
