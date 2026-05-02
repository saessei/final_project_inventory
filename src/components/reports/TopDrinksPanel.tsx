import { CupSoda } from "lucide-react";

interface TopDrinksPanelProps {
  topDrinks: [string, number][];
}

export const TopDrinksPanel = ({ topDrinks }: TopDrinksPanelProps) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
    <div className="flex items-center gap-2 mb-4">
      <CupSoda className="text-brown-two" size={20} />
      <h3 className="font-bold text-lg">Top Selling Drinks</h3>
    </div>
    <div className="space-y-3">
      {topDrinks.map(([name, count], index) => (
        <div
          key={name}
          className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                index === 0
                  ? "bg-yellow-500 text-white"
                  : index === 1
                    ? "bg-gray-400 text-white"
                    : index === 2
                      ? "bg-amber-600 text-white"
                      : "bg-brown/20 text-brown"
              }`}
            >
              {index + 1}
            </div>
            <span className="font-medium">{name}</span>
          </div>
          <div className="font-bold text-dark-brown">{count} orders</div>
        </div>
      ))}
      {topDrinks.length === 0 && (
        <p className="text-gray-400 text-center py-4">No orders yet</p>
      )}
    </div>
  </div>
);
