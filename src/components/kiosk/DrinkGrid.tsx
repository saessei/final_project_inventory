import type { Drink } from "../../services/drinkService";
import { Plus } from "lucide-react";

interface DrinkGridProps {
  drinks: Drink[];
  isSubmitting: boolean;
  onCustomize: (drink: Drink) => void;
}

export const DrinkGrid = ({ drinks, isSubmitting, onCustomize }: DrinkGridProps) => (
  <section className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-4 xl:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
    {drinks.map((drink) => (
      <button
        key={drink.id}
        type="button"
        disabled={isSubmitting}
        onClick={() => onCustomize(drink)}
        className={`group relative flex h-[140px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-300 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-brown/50 ${
          isSubmitting 
            ? "opacity-60 cursor-not-allowed" 
            : "cursor-pointer hover:border-brown/40 hover:bg-gradient-to-br hover:from-white hover:to-cream hover:shadow-xl hover:-translate-y-1"
        }`}
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-brown/60 group-hover:text-brown transition-colors">
              {drink.category || "Drink"}
            </span>
            {drink.sizes.large && (
              <span className="text-[9px] font-bold text-slate-300 uppercase">Multiple Sizes</span>
            )}
          </div>
          <h4 className="w-full font-bold text-base md:text-lg leading-tight text-dark-brown line-clamp-2">
            {drink.name}
          </h4>
        </div>
        
        <div className="w-full flex items-center justify-between mt-auto pt-3 border-t border-slate-100/80">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-medium leading-none mb-1">Starting from</span>
            <span className="font-black text-lg text-dark-brown whitespace-nowrap">₱{drink.sizes.regular}</span>
          </div>
          
          <div className="relative flex items-center gap-2 overflow-hidden rounded-xl bg-brown px-4 py-2 text-xs uppercase font-black text-white tracking-wider shadow-md group-hover:bg-brown-two group-hover:shadow-brown/20 transition-all duration-300">
            <span className="relative z-10">Add</span>
            <Plus size={14} strokeWidth={3} className="relative z-10" />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </div>
        </div>
      </button>
    ))}
  </section>
);
