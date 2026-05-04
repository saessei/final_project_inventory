import { describe, expect, it } from "vitest";
import { useReportMetrics } from "@/hooks/useReportMetrics";
import type { ReportOrder } from "@/types/reportTypes";

describe("useReportMetrics (integration)", () => {
  it("computes revenue and top metrics from live-shaped orders", () => {
    const orders: ReportOrder[] = [
      {
        id: "1",
        customer_name: "Ava",
        order_details: "",
        status: "completed",
        created_at: "2026-05-04T08:00:00.000Z",
        total_price: 120,
        order_items: [
          {
            id: "i1",
            drink_name: "Classic Milk Tea",
            quantity: 2,
            line_total: 200,
            order_item_toppings: [{ topping_name: "Pearl" }],
          },
        ],
      },
      {
        id: "2",
        customer_name: "Noah",
        order_details: "",
        status: "completed",
        created_at: "2026-05-04T08:30:00.000Z",
        total_price: 90,
        order_items: [
          {
            id: "i2",
            drink_name: "Classic Milk Tea",
            quantity: 1,
            line_total: 100,
            order_item_toppings: [{ topping_name: "Oreo" }],
          },
          {
            id: "i3",
            drink_name: "Matcha Latte",
            quantity: 1,
            line_total: 120,
            order_item_toppings: [{ topping_name: "Pearl" }],
          },
        ],
      },
    ];

    const metrics = useReportMetrics(orders);

    expect(metrics.totalOrders).toBe(2);
    expect(metrics.totalRevenue).toBe(210);
    expect(metrics.topDrinks[0]).toEqual(["Classic Milk Tea", 3]);
    expect(metrics.topToppings[0]).toEqual(["Pearl", 3]);
    expect(metrics.busyHours[0]?.hour).toBe(8);
    expect(metrics.todayCount).toBeGreaterThanOrEqual(0);
  });
});
