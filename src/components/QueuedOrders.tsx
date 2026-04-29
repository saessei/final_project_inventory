import { useState } from "react";
import { Sidebar } from "./common/Sidebar";
import { useOrders, type Order } from "../hooks/useOrders";
import { updateOrderStatus } from "../services/orderService";
import { OrderStatusButton } from "./common/OrderStatusButton";
import { UserAuth } from "../auth/AuthContext";

export const QueuedOrders = () => {
  const { orders, fetchOrders } = useOrders();
  const [viewMode, setViewMode] = useState<"active" | "completed">("active");

  // current logged-in barista
  const { session } = UserAuth();
  const baristaUserId = session?.user?.id;

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
      ? orders.filter(
          (order) => order.status === "pending" || order.status === "preparing",
        )
        .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      : completedOrders;

  const handleStatusChange = async (order: Order) => {
    if (order.status === "pending") {
      if (!baristaUserId) return;

      const updated = await updateOrderStatus(order.id, "preparing", {
        claim: true,
        baristaUserId,
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

      <main className="ml-0 lg:ml-64 mr-0 lg:mr-[12rem] h-screen overflow-y-auto p-4 lg:p-6 pt-28 lg:pt-6">
        <div className="mb-6">
          <h1 className="text-5xl font-black font-fredoka">Barista Station</h1>
          <p className="text-lg text-gray-500">
            Live queue orders for your team.
          </p>
        </div>

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
                className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-[0.7rem] uppercase tracking-[0.3em] text-gray-400">
                      ORDER #{order.id.substring(0, 8)}
                    </p>
                    <h2 className="mt-3 text-3xl font-bold">
                      {order.customer_name}
                    </h2>
                  </div>
                  <div
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
                      order.status === "pending"
                        ? "bg-orange-50 text-orange-700"
                        : order.status === "preparing"
                          ? "bg-brown/10 text-brown"
                          : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {order.status === "pending"
                      ? "Incoming"
                      : order.status === "preparing"
                        ? "In queue"
                        : "Completed"}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-[#f8f7f1] p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
                      Order details
                    </p>
                    <p className="mt-3 text-sm text-gray-600 whitespace-pre-wrap">
                      {order.order_details}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-[#f8f7f1] p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
                      Received
                    </p>
                    <p className="mt-3 text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  {(order.status === "pending" ||
                    order.status === "preparing" ||
                    order.status === "completed") && (
                    <OrderStatusButton
                      status={order.status}
                      onClick={() => handleStatusChange(order)}
                    />
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  );
};
