import type { ReportOrder } from "@/types/reportTypes";

export const useReportMetrics = (orders: ReportOrder[]) => {
  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.total_price || 0),
    0,
  );
  const totalOrders = orders.length;

  const drinkCounts = new Map<string, number>();
  orders.forEach((order) => {
    const items = order.order_details.split(" • ");
    items.forEach((item) => {
      const match = item.match(/\d+x\s+(.+?)(?:\s*\(|,|$)/);
      if (match) {
        let name = match[1].trim();
        name = name.replace(/\s*\([^)]+\)/, "").trim();
        drinkCounts.set(name, (drinkCounts.get(name) || 0) + 1);
      }
    });
  });

  const topDrinks = Array.from(drinkCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const toppingCounts = new Map<string, number>();
  orders.forEach((order) => {
    const items = order.order_details.split(" • ");
    items.forEach((item) => {
      const toppingMatch = item.match(/,\s*([^,(]+)/g);
      if (toppingMatch) {
        toppingMatch.forEach((topping) => {
          const name = topping.replace(/,\s*/, "").trim();
          toppingCounts.set(name, (toppingCounts.get(name) || 0) + 1);
        });
      }
    });
  });

  const topToppings = Array.from(toppingCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const hourCounts = new Map<number, number>();
  orders.forEach((order) => {
    const hour = new Date(order.created_at).getHours();
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
  });

  const busyHours = Array.from(hourCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour, count]) => ({
      hour,
      display:
        hour === 0
          ? "12 AM"
          : hour === 12
            ? "12 PM"
            : hour > 12
              ? `${hour - 12} PM`
              : `${hour} AM`,
      count,
    }));

  const today = new Date().toDateString();
  const todayOrders = orders.filter(
    (order) => new Date(order.created_at).toDateString() === today,
  );
  const todayRevenue = todayOrders.reduce(
    (sum, order) => sum + (order.total_price || 0),
    0,
  );
  const todayCount = todayOrders.length;

  return {
    totalRevenue,
    totalOrders,
    topDrinks,
    topToppings,
    busyHours,
    todayRevenue,
    todayCount,
  };
};
