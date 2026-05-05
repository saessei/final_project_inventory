import { useState, useMemo, useEffect } from "react";
import { Sidebar } from "@/components/ui/Sidebar";
import { useOrders, type Order } from "@/hooks/useOrders";
import { updateOrderStatus } from "@/services/orderService";
import { OrderStatusButton } from "@/components/ui/OrderStatusButton";
import { UserAuth } from "@/components/auth/AuthContext";
import { TextField } from "@/components/ui/TextField";
import { Search, ArrowUpDown, Coffee, Clock, CheckCircle2 } from "lucide-react";
import { QueueSummarySkeleton, QueueCardsSkeleton } from "@/components/ui/LoadingSkeletons";

const ITEMS_PER_PAGE = 6;

export const QueuedOrders = () => {
  const { orders, loading, updateOrderInState } = useOrders();
  const [viewMode, setViewMode] = useState<"active" | "completed">("active");
  const [activePage, setActivePage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // current logged-in staff member
  const { session } = UserAuth();
  const staffUserId = session?.user?.id;

  const filteredOrders = useMemo(() => {
    const result = orders.filter((order) => {
      const matchesSearch = 
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [orders, searchQuery, sortOrder]);

  const incomingOrders = filteredOrders.filter((order) => order.status === "pending");
  const preparingOrders = filteredOrders.filter((order) => order.status === "preparing");
  const readyOrders = filteredOrders.filter((order) => order.status === "ready");
  
  const completedOrders = filteredOrders
    .filter((order) => order.status === "completed")
    .filter((order) => order.status !== "cancelled");

  const activeOrders = filteredOrders.filter(
    (order) =>
      order.status === "pending" ||
      order.status === "preparing" ||
      order.status === "ready",
  );

  const activeTotalPages = Math.max(1, Math.ceil(activeOrders.length / ITEMS_PER_PAGE));
  const paginatedActive = activeOrders.slice(
    (activePage - 1) * ITEMS_PER_PAGE,
    activePage * ITEMS_PER_PAGE,
  );

  const paginatedCompleted = completedOrders.slice(
    (completedPage - 1) * ITEMS_PER_PAGE,
    completedPage * ITEMS_PER_PAGE,
  );

  const completedTotalPages = Math.max(1, Math.ceil(completedOrders.length / ITEMS_PER_PAGE));

  const queueOrders =
    viewMode === "active"
      ? paginatedActive
      : paginatedCompleted.filter((order) => order.status !== "cancelled");

  const currentPage = viewMode === "active" ? activePage : completedPage;
  const totalPages = viewMode === "active" ? activeTotalPages : completedTotalPages;

  useEffect(() => {
    setActivePage((current) => Math.min(current, activeTotalPages));
  }, [activeTotalPages]);

  useEffect(() => {
    setCompletedPage((current) => Math.min(current, completedTotalPages));
  }, [completedTotalPages]);

  const handleViewModeChange = (mode: "active" | "completed") => {
    setViewMode(mode);
  };

  const handleStatusChange = async (order: Order) => {
    if (order.status === "pending") {
      if (!staffUserId) return;

      const updated = await updateOrderStatus(order.id, "preparing", {
        claim: true,
        staffUserId,
      });

      if (!updated) {
        console.warn("Order already claimed by someone else.");
        return;
      }

      updateOrderInState(order.id, "preparing");
      return;
    }

    // preparing -> ready
    if (order.status === "preparing") {
      await updateOrderStatus(order.id, "ready");
      updateOrderInState(order.id, "ready");
      return;
    }

    // ready -> completed
    if (order.status === "ready") {
      await updateOrderStatus(order.id, "completed");
      updateOrderInState(order.id, "completed");
      return;
    }

    // completed -> cancelled (archive)
    if (order.status === "completed") {
      await updateOrderStatus(order.id, "cancelled");
      updateOrderInState(order.id, "cancelled");
      return;
    }

    // cancelled -> no-op (archived orders cannot be modified)
  };

  return (
    <div className="bg-cream min-h-screen text-dark-brown font-quicksand">
      <div className="fixed top-0 left-0 h-screen w-0 lg:w-64 z-50">
        <Sidebar />
      </div>

      <main className="ml-0 lg:ml-64 mr-0 lg:mr-[12rem] h-screen overflow-y-auto no-scrollbar p-4 lg:p-6 pt-16 lg:pt-6">
        <div className="mb-6">
          <h1 className="text-4xl font-black font-fredoka">Order Queue</h1>
          <p className="text-lg text-gray-500">
            Take orders and move the queue from one shared station.
          </p>
        </div>

        <QueueSummarySkeleton loading={loading}>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200 group hover:border-brown/20 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={14} className="text-gray-400" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Pending
                </p>
              </div>
              <p className="text-4xl font-black text-dark-brown">
                {incomingOrders.length.toString().padStart(2, "0")}
              </p>
            </div>
            <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200 group hover:border-brown/20 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <Coffee size={14} className="text-gray-400" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Preparing
                </p>
              </div>
              <p className="text-4xl font-black text-dark-brown">
                {preparingOrders.length.toString().padStart(2, "0")}
              </p>
            </div>
            <div className="rounded-[2rem] bg-amber-50 p-6 shadow-sm border border-amber-100 group transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <ArrowUpDown size={14} className="text-amber-400 rotate-90" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
                  Ready
                </p>
              </div>
              <p className="text-4xl font-black text-amber-700">
                {readyOrders.length.toString().padStart(2, "0")}
              </p>
            </div>
            <div className="rounded-[2rem] bg-[#e6f6dc] p-6 shadow-sm border border-emerald-100 group transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                  Completed
                </p>
              </div>
              <p className="text-4xl font-black text-emerald-700">
                {completedOrders.length.toString().padStart(2, "0")}
              </p>
            </div>
          </div>
        </QueueSummarySkeleton>

        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <TextField
              placeholder="Search by customer name or Order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={18} />}
              className="rounded-2xl border-slate-200 bg-white"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex bg-white rounded-full p-1 border border-slate-200 shadow-sm">
              <button
                onClick={() => handleViewModeChange("active")}
                className={`rounded-full px-5 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
                  viewMode === "active"
                    ? "bg-dark-brown text-white shadow-md"
                    : "text-slate-400 hover:text-dark-brown"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => handleViewModeChange("completed")}
                className={`rounded-full px-5 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
                  viewMode === "completed"
                    ? "bg-dark-brown text-white shadow-md"
                    : "text-slate-400 hover:text-dark-brown"
                }`}
              >
                History
              </button>
            </div>
            <button
              onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-wider text-dark-brown hover:bg-slate-50 transition-all shadow-sm"
            >
              <ArrowUpDown size={14} />
              {sortOrder === "newest" ? "Newest First" : "Oldest First"}
            </button>
          </div>
        </div>

          <QueueCardsSkeleton loading={loading}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {queueOrders.length === 0 ? (
              <div className="rounded-[2rem] bg-white p-10 text-center text-gray-500 shadow-sm border border-slate-200 col-span-full">
                {viewMode === "active"
                  ? "No incoming or preparing orders yet."
                  : "No completed orders to archive."}
              </div>
            ) : (
              queueOrders.map((order) => {
                const items = order.order_details
                  .split(/\s*•\s*|\n+/)
                  .map((line) => line.trim())
                  .filter(Boolean);
                return (
                  <article
                    key={order.id}
                    className="flex h-full flex-col rounded-xl bg-white p-4 shadow-sm border border-slate-200"
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
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                          order.status === "pending"
                            ? "bg-orange-50 text-orange-700 border-orange-200"
                            : order.status === "preparing"
                              ? "bg-brown/5 text-brown border-brown/20"
                              : order.status === "ready"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : order.status === "completed"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                  : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {order.status === "pending"
                          ? "Pending"
                          : order.status === "preparing"
                            ? "Preparing"
                            : order.status === "ready"
                              ? "Ready"
                              : order.status === "completed"
                                ? "Completed"
                                : "Archived"}
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-dark-brown mb-3">
                      {order.customer_name}
                    </h3>

                    <div className="mb-4 rounded-xl bg-[#f8f7f1] p-3 flex-1">
                      {items.map((item, idx) => (
                        <p
                          key={idx}
                          className={`text-xs text-gray-700 leading-relaxed line-clamp-3 hover:line-clamp-none transition-all cursor-help ${
                            idx === 0 ? "" : "mt-1 pt-1 border-t border-slate-200/50"
                          }`}
                          title={item}
                        >
                          {item}
                        </p>
                      ))}
                    </div>

                    <div className="mt-auto pt-2">
                      {order.status !== "cancelled" && (
                        <OrderStatusButton
                          status={order.status}
                          onClick={() => handleStatusChange(order)}
                        />
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() =>
                  viewMode === "active"
                    ? setActivePage(Math.max(1, activePage - 1))
                    : setCompletedPage(Math.max(1, completedPage - 1))
                }
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  viewMode === "active"
                    ? setActivePage(Math.min(totalPages, activePage + 1))
                    : setCompletedPage(Math.min(totalPages, completedPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          )}
        </QueueCardsSkeleton>
      </main>
    </div>
  );
};
