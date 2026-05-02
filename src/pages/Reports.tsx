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
import type { ReportOrder } from "@/types/reportTypes";
import { Skeleton } from "@/components/ui/Skeleton";

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
      .select(`
        *,
        order_items(
          *,
          order_item_toppings(*)
        )
      `)
      .gte("created_at", dateRange.startDate.toISOString())
      .lte("created_at", dateRange.endDate.toISOString())
      .order("created_at", { ascending: false });

    setOrders((data || []) as ReportOrder[]);
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
    const csvRows: (string | number)[][] = [
      ["Order ID", "Customer", "Items", "Status", "Date", "Total"],
      ...orders.map((order) => {
        const itemsText =
          order.order_items?.length > 0
            ? order.order_items
                .map((i) => `${i.quantity}x ${i.drink_name}`)
                .join("; ")
            : order.order_details;
        return [
          order.id.slice(0, 8),
          `"${order.customer_name}"`,
          `"${itemsText}"`,
          order.status,
          new Date(order.created_at).toLocaleString(),
          order.total_price,
        ];
      }),
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

  if (loading && orders.length === 0) {
    return (
      <div className="bg-cream min-h-screen text-dark-brown font-quicksand">
        <div className="fixed top-0 left-0 h-screen w-64 z-10 hidden lg:block">
          <Sidebar />
        </div>
        <main className="ml-0 lg:ml-64 h-screen overflow-y-auto no-scrollbar p-4 lg:p-6 pt-28 lg:pt-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-10 w-48 bg-gray-300" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32 bg-gray-200" />
                <Skeleton className="h-10 w-24 bg-gray-200" />
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 rounded-2xl bg-white border border-gray-100" />
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <Skeleton className="h-64 rounded-[2rem] bg-white border border-gray-100" />
              <Skeleton className="h-64 rounded-[2rem] bg-white border border-gray-100" />
            </div>

            <Skeleton className="h-80 rounded-[2rem] bg-white border border-gray-100 mb-6" />
            <Skeleton className="h-96 rounded-[2rem] bg-white border border-gray-100" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen text-dark-brown font-quicksand">
      <div className="fixed top-0 left-0 h-screen w-64 z-10">
        <Sidebar />
      </div>

      <main className="ml-0 lg:ml-64 h-screen overflow-y-auto no-scrollbar p-4 lg:p-6 pt-28 lg:pt-6">
        <div className="max-w-7xl mx-auto">
          <ReportsHeader
            dateRange={dateRange}
            loading={loading}
            showDatePicker={showDatePicker}
            onToggleDatePicker={() => setShowDatePicker(!showDatePicker)}
            onSetDatePreset={setDatePreset}
            onExport={handleExport}
            onRefresh={loadOrders}
          />

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
      </main>
    </div>
  );
};
