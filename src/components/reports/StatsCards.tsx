import { PhilippinePeso, ShoppingBag, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  totalOrders: number;
  totalRevenue: number;
  todayCount: number;
  todayRevenue: number;
}

export const StatsCards = ({
  totalOrders,
  totalRevenue,
  todayCount,
  todayRevenue,
}: StatsCardsProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
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

    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
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

    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-400 uppercase tracking-wide">
            Today's Sales
          </p>
          <p className="text-2xl font-black mt-1">{todayCount} orders</p>
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
);
