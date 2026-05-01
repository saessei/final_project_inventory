import { Sparkles } from "lucide-react";

interface TopToppingsPanelProps {
  topToppings: [string, number][];
}

export const TopToppingsPanel = ({ topToppings }: TopToppingsPanelProps) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border">
    <div className="flex items-center gap-2 mb-4">
      <Sparkles className="text-brown-two" size={20} />
      <h3 className="font-bold text-lg">Popular Toppings</h3>
    </div>
    <div className="flex flex-wrap gap-2">
      {topToppings.map(([name, count]) => (
        <div
          key={name}
          className="flex flex-col items-center p-3 bg-brown/5 rounded-xl min-w-[80px]"
        >
          <span className="font-medium text-dark-brown">{name}</span>
          <span className="text-xs text-gray-500 mt-1">{count} orders</span>
        </div>
      ))}
      {topToppings.length === 0 && (
        <p className="text-gray-400 text-center py-4 col-span-full">
          No toppings added yet
        </p>
      )}
    </div>
  </div>
);
