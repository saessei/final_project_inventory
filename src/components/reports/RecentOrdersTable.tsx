import { ListTodo } from "lucide-react";
import type { ReportOrder } from "../../types/reportTypes";

interface RecentOrdersTableProps {
  loading: boolean;
  orders: ReportOrder[];
}

export const RecentOrdersTable = ({
  loading,
  orders,
}: RecentOrdersTableProps) => (
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
            {orders.slice(0, 10).map((order) => (
              <tr key={order.id} className="border-b last:border-0">
                <td className="py-3 font-medium">{order.customer_name}</td>
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
);
