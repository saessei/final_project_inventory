import { useState } from "react";
import { Sidebar } from "@/components/ui/Sidebar";
import { useOrders, type Order } from "@/hooks/useOrders";
import { updateOrderStatus } from "@/services/orderService";
import { OrderStatusButton } from "@/components/ui/OrderStatusButton";
import { UserAuth } from "@/components/auth/AuthContext";
import { QueueSkeleton } from "@/components/ui/LoadingSkeletons";

export const QueuedOrders = () => {
  const { orders, fetchOrders, loading } = useOrders();
  const [viewMode, setViewMode] = useState<"active" | "completed">("active");

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

  const queueOrders =
    viewMode === "active"
      ? orders
          .filter(
            (order) =>
              order.status === "pending" || order.status === "preparing",
          )
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          )
      : completedOrders;

  const getItemCount = (orderDetails: string) =>
    orderDetails.split(" • ").filter((item) => item.trim().length > 0).length;

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

          <div className="grid gap-5">
            {queueOrders.length === 0 ? (
              <div className="rounded-[2rem] bg-white p-10 text-center text-gray-500 shadow-sm border border-slate-200">
                {viewMode === "active"
                  ? "No incoming or preparing orders yet."
                  : "No completed orders yet."}
              </div>
            ) : (
              queueOrders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[0.65rem] uppercase tracking-[0.28em] text-gray-400">
                          Order #{order.id.substring(0, 8)}
                        </p>
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                            order.status === "pending"
                              ? "bg-orange-50 text-orange-700 border-orange-100"
                              : order.status === "preparing"
                                ? "bg-brown/10 text-brown border-brown/20"
                                : "bg-emerald-100 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {order.status === "pending"
                            ? "Incoming"
                            : order.status === "preparing"
                              ? "In queue"
                              : "Completed"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span className="font-semibold text-dark-brown text-lg">
                          {order.customer_name}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                          {getItemCount(order.order_details)} items
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2">
                        {order.order_details}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-2 lg:items-end lg:shrink-0">
                      <p className="text-xs uppercase tracking-[0.22em] text-gray-400">
                        Queue action
                      </p>
                      {(order.status === "pending" ||
                        order.status === "preparing" ||
                        order.status === "completed") && (
                        <OrderStatusButton
                          status={order.status}
                          onClick={() => handleStatusChange(order)}
                        />
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </QueueSkeleton>
      </main>
    </div>
  );
};
