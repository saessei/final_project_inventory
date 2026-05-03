import { ListTodo } from "lucide-react";
import type { ReportOrder } from "@/types/reportTypes";
import { Skeleton } from "boneyard-js/react";

interface RecentOrdersTableProps {
  loading: boolean;
  orders: ReportOrder[];
}

export const RecentOrdersTable = ({
  loading,
  orders,
}: RecentOrdersTableProps) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
    <div className="flex items-center gap-2 mb-4">
      <ListTodo className="text-brown-two" size={20} />
      <h3 className="font-bold text-lg">Recent Orders</h3>
    </div>
    {loading ? (
      <Skeleton
        name="recent-orders-table"
        loading={loading}
        fallback={
          <div className="space-y-3 py-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-5 gap-4 rounded-xl border border-slate-200 p-3"
              >
                <div className="h-4 w-24 rounded-full bg-slate-200/80 animate-pulse" />
                <div className="h-4 w-full rounded-full bg-slate-200/80 animate-pulse" />
                <div className="h-4 w-20 rounded-full bg-slate-200/80 animate-pulse" />
                <div className="h-4 w-16 rounded-full bg-slate-200/80 animate-pulse" />
                <div className="h-4 w-16 rounded-full bg-slate-200/80 animate-pulse" />
              </div>
            ))}
          </div>
        }
      >
        <div />
      </Skeleton>
    ) : orders.length === 0 ? (
      <div className="text-center py-8 text-gray-400">
        No orders in this period
      </div>
    ) : (
      <div className="overflow-x-auto -mx-6 sm:mx-0">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/50">
            <tr className="text-left text-slate-400">
              <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest">Customer</th>
              <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest">Items</th>
              <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest text-right">Total</th>
              <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest text-right">Time</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 10).map((order) => (
              <tr key={order.id} className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-black text-dark-brown">{order.customer_name}</p>
                  <p className="text-[10px] text-slate-300 font-bold tracking-tight">#{order.id.slice(0, 8)}</p>
                </td>
                <td className="px-6 py-4 max-w-xs sm:max-w-md">
                  <div 
                    className="text-slate-500 text-xs line-clamp-1 group-hover:line-clamp-none transition-all duration-300"
                    title={order.order_details}
                  >
                    {order.order_details}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      order.status === "completed"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : order.status === "ready"
                          ? "bg-blue-50 text-blue-600 border-blue-100"
                          : order.status === "preparing"
                            ? "bg-amber-50 text-amber-600 border-amber-100"
                            : order.status === "cancelled"
                              ? "bg-rose-50 text-rose-600 border-rose-100"
                              : "bg-slate-50 text-slate-500 border-slate-100"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-black text-dark-brown text-right">
                  ₱{order.total_price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-slate-400 text-[10px] font-bold text-right tabular-nums">
                  {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
