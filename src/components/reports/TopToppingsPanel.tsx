import { Sparkles } from "lucide-react";

interface TopToppingsPanelProps {
  topToppings: [string, number][];
}

export const TopToppingsPanel = ({ topToppings }: TopToppingsPanelProps) => {
  const maxOrders = topToppings[0]?.[1] || 1;

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-brown/10 rounded-xl">
          <Sparkles className="text-brown-two" size={22} />
        </div>
        <div>
          <h3 className="font-black text-xl text-dark-brown">Popular Toppings</h3>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">Customer favorites</p>
        </div>
      </div>
      <div className="space-y-4">
        {topToppings.map(([name, count], index) => {
          const widthPercentage = (count / maxOrders) * 100;
          return (
            <div key={name} className="relative group">
              <div className="flex items-center justify-between p-3 rounded-xl relative z-10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                    index === 0 ? "bg-amber-100 text-amber-600" : 
                    index === 1 ? "bg-slate-100 text-slate-500" : 
                    index === 2 ? "bg-orange-50 text-orange-600" : 
                    "bg-slate-50 text-slate-400"
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-black text-dark-brown text-sm">{name}</span>
                </div>
                <div className="text-right">
                  <p className="font-black text-dark-brown text-sm">{count}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Usage</p>
                </div>
              </div>
              {/* Progress Bar Background */}
              <div className="absolute inset-0 rounded-xl bg-slate-50 opacity-50" />
              <div 
                className="absolute left-0 top-0 bottom-0 rounded-xl bg-brown/5 transition-all duration-1000 ease-out" 
                style={{ width: `${widthPercentage}%` }} 
              />
            </div>
          );
        })}
        {topToppings.length === 0 && (
          <p className="text-gray-400 text-center py-8 font-bold italic">No data available for this period</p>
        )}
      </div>
    </div>
  );
};
