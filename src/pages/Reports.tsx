import { useCallback, useState, useEffect } from "react";
import { Sidebar } from "@/components/ui/Sidebar";
import supabase from "@/lib/supabaseClient";
import { BusyHoursPanel } from "@/components/reports/BusyHoursPanel";
import { RecentOrdersTable } from "@/components/reports/RecentOrdersTable";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { StatsCards } from "@/components/reports/StatsCards";
import { TopDrinksPanel } from "@/components/reports/TopDrinksPanel";
import { TopToppingsPanel } from "@/components/reports/TopToppingsPanel";
import { useReportMetrics } from "@/hooks/useReportMetrics";
import { ReportsSkeleton } from "@/components/ui/LoadingSkeletons";
import type { ReportOrder } from "@/types/reportTypes";
import { formatOrderDetails } from "@/services/orderService";

export const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<ReportOrder[]>([]);
  const [dateRange, setDateRange] = useState(() => ({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  }));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select(
        "*, order_items(*, order_item_toppings(topping_name))",
      )
      .gte("created_at", dateRange.startDate.toISOString())
      .lte("created_at", dateRange.endDate.toISOString())
      .order("created_at", { ascending: false });

    setOrders(
      ((data || []) as ReportOrder[]).map((order) => ({
        ...order,
        order_details: formatOrderDetails(order.order_items ?? []),
      })),
    );
    setLoading(false);
  }, [dateRange]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadOrders();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadOrders]);

  const {
    totalRevenue,
    totalOrders,
    topDrinks,
    topToppings,
    busyHours,
    todayRevenue,
    todayCount,
  } = useReportMetrics(orders);

  const handleExport = async () => {
    const csvRows = [
      ["Order ID", "Customer", "Items", "Status", "Date", "Total"],
      ...orders.map((order) => [
        order.id.slice(0, 8),
        order.customer_name,
        order.order_details,
        order.status,
        new Date(order.created_at).toLocaleString(),
        order.total_price,
      ]),
    ];

    const csv = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const setDatePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setDateRange({ startDate: start, endDate: end });
    setShowDatePicker(false);
  };

  return (
    <div className="bg-cream min-h-screen text-dark-brown font-quicksand">
      <div className="fixed top-0 left-0 h-screen w-64 z-10">
        <Sidebar />
      </div>

      <main className="ml-0 lg:ml-64 h-screen overflow-y-auto no-scrollbar p-4 lg:p-6 pt-28 lg:pt-6">
        <div className="max-w-7xl mx-auto mb-6">
          <ReportsHeader
            dateRange={dateRange}
            loading={loading}
            showDatePicker={showDatePicker}
            onToggleDatePicker={() => setShowDatePicker(!showDatePicker)}
            onSetDatePreset={setDatePreset}
            onExport={handleExport}
            onRefresh={loadOrders}
          />
        </div>

        <ReportsSkeleton loading={loading}>
          <div className="max-w-7xl mx-auto">
            <StatsCards
              totalOrders={totalOrders}
              totalRevenue={totalRevenue}
              todayCount={todayCount}
              todayRevenue={todayRevenue}
            />

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <TopDrinksPanel topDrinks={topDrinks} />
              <TopToppingsPanel topToppings={topToppings} />
            </div>

            <BusyHoursPanel busyHours={busyHours} />
            <RecentOrdersTable loading={loading} orders={orders} />
          </div>
        </ReportsSkeleton>
      </main>
    </div>
  );
};
