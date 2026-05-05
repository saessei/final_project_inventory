import { afterEach, describe, expect, it, vi } from "vitest";
import { useReportMetrics } from "@/hooks/useReportMetrics";
import type { ReportOrder } from "@/types/reportTypes";

const order = (
  overrides: Partial<ReportOrder> = {},
): ReportOrder => ({
  id: "order-1",
  customer_name: "Guest",
  order_details: "",
  status: "completed",
  created_at: "2026-05-05T01:00:00.000Z",
  total_price: 0,
  order_items: [],
  ...overrides,
});

describe("useReportMetrics", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("calculates revenue and order totals", () => {
    const metrics = useReportMetrics([
      order({ id: "order-1", total_price: 100 }),
      order({ id: "order-2", total_price: 250 }),
      order({ id: "order-3", total_price: 0 }),
    ]);

    expect(metrics.totalRevenue).toBe(350);
    expect(metrics.totalOrders).toBe(3);
  });

  it("ranks top drinks by ordered quantity", () => {
    const metrics = useReportMetrics([
      order({
        id: "order-1",
        order_items: [
          { id: "item-1", drink_name: "Matcha", quantity: 2, line_total: 200 },
          { id: "item-2", drink_name: "Taro", quantity: 1, line_total: 100 },
        ],
      }),
      order({
        id: "order-2",
        order_items: [
          { id: "item-3", drink_name: "Matcha", quantity: 3, line_total: 300 },
          { id: "item-4", drink_name: "Brown Sugar", quantity: 4, line_total: 400 },
        ],
      }),
    ]);

    expect(metrics.topDrinks).toEqual([
      ["Matcha", 5],
      ["Brown Sugar", 4],
      ["Taro", 1],
    ]);
  });

  it("ranks top toppings using the parent item quantity", () => {
    const metrics = useReportMetrics([
      order({
        id: "order-1",
        order_items: [
          {
            id: "item-1",
            drink_name: "Matcha",
            quantity: 2,
            line_total: 200,
            order_item_toppings: [{ topping_name: "Pearls" }],
          },
          {
            id: "item-2",
            drink_name: "Taro",
            quantity: 1,
            line_total: 100,
            order_item_toppings: [
              { topping_name: "Pearls" },
              { topping_name: "Pudding" },
            ],
          },
        ],
      }),
    ]);

    expect(metrics.topToppings).toEqual([
      ["Pearls", 3],
      ["Pudding", 1],
    ]);
  });

  it("returns the busiest hours with display labels", () => {
    const metrics = useReportMetrics([
      order({ id: "midnight", created_at: "2026-05-05T00:15:00" }),
      order({ id: "noon-1", created_at: "2026-05-05T12:00:00" }),
      order({ id: "noon-2", created_at: "2026-05-05T12:30:00" }),
      order({ id: "afternoon", created_at: "2026-05-05T15:00:00" }),
    ]);

    expect(metrics.busyHours).toEqual([
      { hour: 12, display: "12 PM", count: 2 },
      { hour: 0, display: "12 AM", count: 1 },
      { hour: 15, display: "3 PM", count: 1 },
    ]);
  });

  it("calculates today's revenue and order count", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-05T10:00:00"));

    const metrics = useReportMetrics([
      order({
        id: "today-1",
        created_at: "2026-05-05T09:00:00",
        total_price: 100,
      }),
      order({
        id: "today-2",
        created_at: "2026-05-05T18:00:00",
        total_price: 200,
      }),
      order({
        id: "yesterday",
        created_at: "2026-05-04T18:00:00",
        total_price: 300,
      }),
    ]);

    expect(metrics.todayRevenue).toBe(300);
    expect(metrics.todayCount).toBe(2);
  });
});
