import { useState } from "react";
import { Sidebar } from "@/components/ui/Sidebar";
import { useOrders, type Order } from "@/hooks/useOrders";
import { updateOrderStatus } from "@/services/orderService";
import { OrderStatusButton } from "@/components/ui/OrderStatusButton";
import { UserAuth } from "@/components/auth/AuthContext";
import { QueueSkeleton } from "@/components/ui/LoadingSkeletons";

const ITEMS_PER_PAGE = 6;

export const QueuedOrders = () => {
  const { orders, fetchOrders, loading } = useOrders();
  const [viewMode, setViewMode] = useState<"active" | "completed">("active");
  const [completedPage, setCompletedPage] = useState(1);

  // current logged-in staff member
  const { session } = UserAuth();
  const staffUserId = session?.user?.id;

  const incomingOrders = orders.filter((order) => order.status === "pending");
  const preparingOrders = orders.filter(
    (order) => order.status === "preparing",
  );
  const completedOrders = orders
    .filter((order) => order.status === "completed")
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

  const activeOrders = orders
    .filter(
      (order) =>
        order.status === "pending" || order.status === "preparing",
    )
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime(),
    );

  const paginatedCompleted = completedOrders.slice(
    (completedPage - 1) * ITEMS_PER_PAGE,
    completedPage * ITEMS_PER_PAGE,
  );

  const queueOrders = viewMode === "active" ? activeOrders : paginatedCompleted;
  const totalPages = Math.ceil(completedOrders.length / ITEMS_PER_PAGE);

  const handleStatusChange = async (order: Order) => {
    if (order.status === "pending") {
      if (!staffUserId) return;

      const updated = await updateOrderStatus(order.id, "preparing", {
        claim: true,
        staffUserId,
      });

      if (!updated) {
        console.warn("Order already claimed by someone else.");
      }

      fetchOrders();
      return;
    }

    // preparing -> completed
    if (order.status === "preparing") {
      await updateOrderStatus(order.id, "completed");
      fetchOrders();
      return;
    }

    // completed/cancelled -> no-op
  };

  return (
    <div className="bg-cream min-h-screen text-dark-brown font-quicksand">
      <div className="fixed top-0 left-0 h-screen w-64 z-10">
        <Sidebar />
      </div>

      <main className="ml-0 lg:ml-64 mr-0 lg:mr-[12rem] h-screen overflow-y-auto no-scrollbar p-4 lg:p-6 pt-28 lg:pt-6">
        <div className="mb-6">
          <h1 className="text-5xl font-black font-fredoka">Staff Station</h1>
          <p className="text-lg text-gray-500">
            Take orders and move the queue from one shared station.
          </p>
        </div>

        <QueueSkeleton loading={loading}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-400">
                Incoming
              </p>
              <p className="mt-4 text-5xl font-black">
                {incomingOrders.length.toString().padStart(2, "0")}
              </p>
            </div>
            <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-400">
                In queue
              </p>
              <p className="mt-4 text-5xl font-black">
                {preparingOrders.length.toString().padStart(2, "0")}
              </p>
            </div>
            <div className="rounded-[2rem] bg-[#e6f6dc] p-6 shadow-sm border border-slate-200">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-400">
                Completed
              </p>
              <p className="mt-4 text-5xl font-black">
                {completedOrders.length.toString().padStart(2, "0")}
              </p>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={() => setViewMode("active")}
              className={`rounded-full px-5 py-2 text-sm font-semibold ${
                viewMode === "active"
                  ? "bg-dark-brown text-white"
                  : "bg-white border border-slate-200 text-slate-600"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setViewMode("completed")}
              className={`rounded-full px-5 py-2 text-sm font-semibold ${
                viewMode === "completed"
                  ? "bg-dark-brown text-white"
                  : "bg-white border border-slate-200 text-slate-600"
              }`}
            >
              Completed
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {queueOrders.length === 0 ? (
              <div className="rounded-[2rem] bg-white p-10 text-center text-gray-500 shadow-sm border border-slate-200">
                {viewMode === "active"
                  ? "No incoming or preparing orders yet."
                  : "No completed orders yet."}
              </div>
            ) : (
              queueOrders.map((order) => {
                const items = order.order_details.split("\n").filter((line) => line.trim());
                return (
                  <article
                    key={order.id}
                    className="rounded-xl bg-white p-4 shadow-sm border border-slate-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Order #{order.id.substring(0, 8)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          • {items.length} item{items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          order.status === "pending"
                            ? "bg-orange-50 text-orange-700 border-orange-200"
                            : order.status === "preparing"
                              ? "bg-brown/10 text-brown border-brown/20"
                              : "bg-emerald-100 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {order.status === "pending"
                          ? "Incoming"
                          : order.status === "preparing"
                            ? "Preparing"
                            : "Completed"}
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-dark-brown mb-3">
                      {order.customer_name}
                    </h3>

                    <div className="space-y-2 mb-4">
                      {items.map((item, idx) => (
                        <p key={idx} className="text-xs text-gray-600 leading-relaxed">
                          {item}
                        </p>
                      ))}
                    </div>

                    {(order.status === "pending" ||
                      order.status === "preparing" ||
                      order.status === "completed") && (
                      <OrderStatusButton
                        status={order.status}
                        onClick={() => handleStatusChange(order)}
                      />
                    )}
                  </article>
                );
              })
            )}
          </div>
          {viewMode === "completed" && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCompletedPage(Math.max(1, completedPage - 1))}
                disabled={completedPage === 1}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {completedPage} of {totalPages}
              </span>
              <button
                onClick={() => setCompletedPage(Math.min(totalPages, completedPage + 1))}
                disabled={completedPage === totalPages}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          )}        </QueueSkeleton>
      </main>
    </div>
  );
};
