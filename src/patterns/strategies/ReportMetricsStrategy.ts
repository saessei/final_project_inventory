import type { ReportOrder } from "@/types/reportTypes";

export type ReportMetrics = {
  totalRevenue: number;
  totalOrders: number;
  topDrinks: Array<[string, number]>;
  topToppings: Array<[string, number]>;
  busyHours: Array<{ hour: number; display: string; count: number }>;
  todayRevenue: number;
  todayCount: number;
};

export interface ReportMetricsStrategy {
  calculate(orders: ReportOrder[]): ReportMetrics;
}

export class SalesReportMetricsStrategy implements ReportMetricsStrategy {
  calculate(orders: ReportOrder[]): ReportMetrics {
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.total_price || 0),
      0,
    );
    const totalOrders = orders.length;

    const drinkCounts = new Map<string, number>();
    const toppingCounts = new Map<string, number>();
    const hourCounts = new Map<number, number>();

    orders.forEach((order) => {
      hourCounts.set(
        new Date(order.created_at).getHours(),
        (hourCounts.get(new Date(order.created_at).getHours()) || 0) + 1,
      );

      order.order_items?.forEach((item) => {
        drinkCounts.set(
          item.drink_name,
          (drinkCounts.get(item.drink_name) || 0) + item.quantity,
        );

        item.order_item_toppings?.forEach((topping) => {
          toppingCounts.set(
            topping.topping_name,
            (toppingCounts.get(topping.topping_name) || 0) + item.quantity,
          );
        });
      });
    });

    const today = new Date().toDateString();
    const todayOrders = orders.filter(
      (order) => new Date(order.created_at).toDateString() === today,
    );

    return {
      totalRevenue,
      totalOrders,
      topDrinks: Array.from(drinkCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      topToppings: Array.from(toppingCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      busyHours: Array.from(hourCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hour, count]) => ({
          hour,
          display: this.formatHour(hour),
          count,
        })),
      todayRevenue: todayOrders.reduce(
        (sum, order) => sum + (order.total_price || 0),
        0,
      ),
      todayCount: todayOrders.length,
    };
  }

  private formatHour(hour: number): string {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  }
}

export const defaultReportMetricsStrategy = new SalesReportMetricsStrategy();
