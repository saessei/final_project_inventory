import { useState, useEffect } from "react";
import { Sidebar } from "../common/Sidebar";
import supabase from "../../lib/supabaseClient";
import {
  ShoppingBag,
  PhilippinePeso,
  Download,
  RefreshCw,
  Calendar,
  ChevronRight,
  Clock,
  TrendingUp,
  CupSoda,
  Sparkles,
  ListTodo,
} from "lucide-react";

interface Order {
  id: string;
  customer_name: string;
  order_details: string;
  status: string;
  created_at: string;
  total_price: number;
}

export const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [dateRange]);

  const loadOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", dateRange.startDate.toISOString())
      .lte("created_at", dateRange.endDate.toISOString())
      .order("created_at", { ascending: false });

    setOrders(data || []);
    setLoading(false);
  };

  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.total_price || 0),
    0,
  );
  const totalOrders = orders.length;

  // Parse drink names for top drinks
  const drinkCounts = new Map<string, number>();
  orders.forEach((order: Order) => {
    const items = order.order_details.split(" • ");
    items.forEach((item: string) => {
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

  // Parse toppings
  const toppingCounts = new Map<string, number>();
  orders.forEach((order: Order) => {
    const items = order.order_details.split(" • ");
    items.forEach((item: string) => {
      const toppingMatch = item.match(/,\s*([^,(]+)/g);
      if (toppingMatch) {
        toppingMatch.forEach((t: string) => {
          const name = t.replace(/,\s*/, "").trim();
          toppingCounts.set(name, (toppingCounts.get(name) || 0) + 1);
        });
      }
    });
  });

  const topToppings = Array.from(toppingCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Calculate busy hours (most common order hours)
  const hourCounts = new Map<number, number>();
  orders.forEach((order: Order) => {
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

  // Calculate today's sales
  const today = new Date().toDateString();
  const todayOrders = orders.filter(
    (order) => new Date(order.created_at).toDateString() === today,
  );
  const todayRevenue = todayOrders.reduce(
    (sum, order) => sum + (order.total_price || 0),
    0,
  );
  const todayCount = todayOrders.length;

  const handleExport = async () => {
    const csvRows = [
      ["Order ID", "Customer", "Items", "Status", "Date", "Total"],
      ...orders.map((order: Order) => [
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

      <main className="ml-0 lg:ml-64 h-screen overflow-y-auto p-4 lg:p-6 pt-28 lg:pt-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-black font-fredoka">Reports</h1>
              <p className="text-gray-500">Sales and order insights</p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border rounded-xl"
                >
                  <Calendar size={18} />
                  <span className="text-sm">
                    {dateRange.startDate.toLocaleDateString()} -{" "}
                    {dateRange.endDate.toLocaleDateString()}
                  </span>
                  <ChevronRight size={16} />
                </button>
                {showDatePicker && (
                  <div className="absolute right-0 mt-2 bg-white border rounded-xl shadow-lg z-20 w-48">
                    <button
                      onClick={() => setDatePreset(1)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => setDatePreset(7)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50"
                    >
                      Last 7 days
                    </button>
                    <button
                      onClick={() => setDatePreset(30)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50"
                    >
                      Last 30 days
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-dark-brown text-white rounded-xl"
              >
                <Download size={18} /> Export CSV
              </button>
              <button
                onClick={loadOrders}
                className="p-2 border rounded-xl hover:bg-white"
              >
                <RefreshCw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>

          {/* Stats Cards - 3 cards now */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide">
                    Total Orders
                  </p>
                  <p className="text-4xl font-black mt-1">{totalOrders}</p>
                </div>
                <div className="w-12 h-12 bg-brown/10 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="text-brown-two" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide">
                    Total Revenue
                  </p>
                  <p className="text-4xl font-black mt-1">
                    ₱{totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-brown/10 rounded-xl flex items-center justify-center">
                  <PhilippinePeso className="text-brown-two" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400 uppercase tracking-wide">
                    Today's Sales
                  </p>
                  <p className="text-2xl font-black mt-1">
                    {todayCount} orders
                  </p>
                  <p className="text-lg font-bold text-brown-two">
                    ₱{todayRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-brown/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-brown-two" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Top Drinks & Toppings */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Top Drinks */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex items-center gap-2 mb-4">
                <CupSoda className="text-brown-two" size={20} />
                <h3 className="font-bold text-lg">Top Selling Drinks</h3>
              </div>
              <div className="space-y-3">
                {topDrinks.map(([name, count], i) => (
                  <div
                    key={name}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          i === 0
                            ? "bg-yellow-500 text-white"
                            : i === 1
                              ? "bg-gray-400 text-white"
                              : i === 2
                                ? "bg-amber-600 text-white"
                                : "bg-brown/20 text-brown"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="font-bold text-dark-brown">
                      {count} orders
                    </div>
                  </div>
                ))}
                {topDrinks.length === 0 && (
                  <p className="text-gray-400 text-center py-4">
                    No orders yet
                  </p>
                )}
              </div>
            </div>

            {/* Popular Toppings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-brown-two" size={20} />
                <h3 className="font-bold text-lg">Popular Toppings</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {topToppings.map(([name, count]) => (
                  <div
                    key={name}
                    className="flex flex-col items-center p-3 bg-brown/5 rounded-xl min-w-[80px]"
                  >
                    <span className="font-medium text-dark-brown">{name}</span>
                    <span className="text-xs text-gray-500 mt-1">
                      {count} orders
                    </span>
                  </div>
                ))}
                {topToppings.length === 0 && (
                  <p className="text-gray-400 text-center py-4 col-span-full">
                    No toppings added yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Busy Hours - Useful for staffing */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-brown-two" size={20} />
              <h3 className="font-bold text-lg">Busiest Hours</h3>
            </div>
            {busyHours.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {busyHours.map(({ display, count }, i) => (
                  <div
                    key={display}
                    className="text-center p-4 bg-brown/5 rounded-xl"
                  >
                    <Clock className="w-6 h-6 mx-auto text-brown-two mb-2" />
                    <p className="text-2xl font-bold">{display}</p>
                    <p className="text-sm text-gray-500">{count} orders</p>
                    {i === 0 && (
                      <p className="text-xs text-green-600 mt-1">Peak hour</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No orders yet</p>
            )}
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center gap-2 mb-4">
              <ListTodo className="text-brown-two" size={20} />
              <h3 className="font-bold text-lg">Recent Orders</h3>
            </div>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No orders in this period
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-left text-gray-400">
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Items</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Total</th>
                      <th className="pb-3">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 10).map((order: Order) => (
                      <tr key={order.id} className="border-b last:border-0">
                        <td className="py-3 font-medium">
                          {order.customer_name}
                        </td>
                        <td
                          className="py-3 text-gray-600 max-w-md truncate"
                          title={order.order_details}
                        >
                          {order.order_details.length > 40
                            ? order.order_details.slice(0, 40) + "..."
                            : order.order_details}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs capitalize ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : order.status === "preparing"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 font-medium">
                          ₱{order.total_price?.toFixed(2) || "0.00"}
                        </td>
                        <td className="py-3 text-gray-400 text-xs">
                          {new Date(order.created_at).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
