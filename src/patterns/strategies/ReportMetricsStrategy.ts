import type { ReportOrder } from "@/types/reportTypes";

// ============================================================
// OUTPUT TYPE - What the strategy returns
// ============================================================
export type ReportMetrics = {
  totalRevenue: number;
  totalOrders: number;
  topDrinks: Array<[string, number]>;
  topToppings: Array<[string, number]>;
  busyHours: Array<{ hour: number; display: string; count: number }>;
  todayRevenue: number;
  todayCount: number;
};

// ============================================================
// STRATEGY INTERFACE - Defines what all strategies must do
// ============================================================
export interface ReportMetricsStrategy {
  calculate(orders: ReportOrder[]): ReportMetrics;
}

// ============================================================
// CONCRETE STRATEGY - The actual calculation logic
// ============================================================
export class SalesReportMetricsStrategy implements ReportMetricsStrategy {
  calculate(orders: ReportOrder[]): ReportMetrics {
    // Calculate total revenue from all orders
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.total_price || 0),
      0,
    );
    
    // Count total number of orders
    const totalOrders = orders.length;

    // Maps to store counts
    const drinkCounts = new Map<string, number>();     // Tracks how many times each drink was ordered
    const toppingCounts = new Map<string, number>();   // Tracks how many times each topping was added
    const hourCounts = new Map<number, number>();      // Tracks orders per hour

    // Loop through each order to collect data
    orders.forEach((order) => {
      // Count orders by hour (for busy hours chart)
      hourCounts.set(
        new Date(order.created_at).getHours(),
        (hourCounts.get(new Date(order.created_at).getHours()) || 0) + 1,
      );

      // Loop through each item in the order
      order.order_items?.forEach((item) => {
        // Count drink (multiply by quantity)
        drinkCounts.set(
          item.drink_name,
          (drinkCounts.get(item.drink_name) || 0) + item.quantity,
        );

        // Count toppings (multiply by quantity)
        item.order_item_toppings?.forEach((topping) => {
          toppingCounts.set(
            topping.topping_name,
            (toppingCounts.get(topping.topping_name) || 0) + item.quantity,
          );
        });
      });
    });

    // Filter orders from today only
    const today = new Date().toDateString();
    const todayOrders = orders.filter(
      (order) => new Date(order.created_at).toDateString() === today,
    );

    // Return all calculated metrics
    return {
      totalRevenue,
      totalOrders,
      
      // Top 5 drinks (sorted by count, highest first)
      topDrinks: Array.from(drinkCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      
      // Top 5 toppings (sorted by count, highest first)
      topToppings: Array.from(toppingCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      
      // Top 3 busiest hours
      busyHours: Array.from(hourCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hour, count]) => ({
          hour,
          display: this.formatHour(hour),  // Convert 14 → "2 PM"
          count,
        })),
      
      todayRevenue: todayOrders.reduce(
        (sum, order) => sum + (order.total_price || 0),
        0,
      ),
      todayCount: todayOrders.length,
    };
  }

  // Helper method: Converts 24-hour format to 12-hour display
  // 0 → "12 AM", 12 → "12 PM", 14 → "2 PM"
  private formatHour(hour: number): string {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  }
}

// ============================================================
// DEFAULT STRATEGY - Pre-created instance for the app to use
// ============================================================
export const defaultReportMetricsStrategy = new SalesReportMetricsStrategy();