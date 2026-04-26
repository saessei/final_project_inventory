import { Sidebar } from "./common/Sidebar";

export const Dashboard = () => {
  return (
    <div className="bg-cream min-h-screen text-dark-brown font-quicksand">
      {/* Sidebar - Fixed on the left */}
      <div className="fixed top-0 left-0 h-screen w-64 z-10">
        <Sidebar />
      </div>

      {/* Main Content - With margin to account for sidebar */}
      <main className="ml-0 lg:ml-64 h-screen overflow-y-auto p-4 lg:p-6 pt-28 lg:pt-6">
        <div className="mb-6">
          <h1 className="text-5xl font-black font-fredoka">Reports Dashboard</h1>
          <p className="text-lg text-gray-500 mt-2">
            Sales analytics and performance metrics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200">
            <p className="text-xs uppercase tracking-[0.24em] text-gray-400">
              Total Orders
            </p>
            <p className="mt-4 text-5xl font-black">0</p>
          </div>
          
          <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200">
            <p className="text-xs uppercase tracking-[0.24em] text-gray-400">
              Revenue
            </p>
            <p className="mt-4 text-5xl font-black">₱0</p>
          </div>
          
          <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200">
            <p className="text-xs uppercase tracking-[0.24em] text-gray-400">
              Popular Drink
            </p>
            <p className="mt-4 text-2xl font-bold">—</p>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
          <p className="text-center text-gray-500 py-12">
            No orders yet. Orders will appear here once customers place them.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => window.location.href = "/kiosk"}
              className="px-6 py-3 bg-dark-brown text-white rounded-xl hover:bg-brown-dark transition-colors"
            >
              Take New Order
            </button>
            <button 
              onClick={() => window.location.href = "/queued-orders"}
              className="px-6 py-3 bg-brown-two text-white rounded-xl hover:bg-brown-dark transition-colors"
            >
              View Queue
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};