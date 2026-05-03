import type { Drink } from "@/services/DrinkService";

interface DrinkGridProps {
  drinks: Drink[];
  isSubmitting: boolean;
  onCustomize: (drink: Drink) => void;
}

export const DrinkGrid = ({ drinks, isSubmitting, onCustomize }: DrinkGridProps) => (
  <section className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
    {drinks.map((drink) => (
      <button
        key={drink.id}
        type="button"
        disabled={isSubmitting}
        onClick={() => onCustomize(drink)}
        className={`flex h-[110px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3.5 text-left shadow-sm transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brown/50 ${
          isSubmitting ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-brown hover:bg-[#fcfbf7] hover:shadow-md hover:-translate-y-0.5"
        }`}
      >
        <h4 className="w-full font-bold text-sm leading-tight text-dark-brown mb-1 line-clamp-2">
          {drink.name}
        </h4>
        <div className="w-full flex items-center justify-between mt-auto">
          <span className="text-sm font-semibold text-gray-600">₱{drink.sizes.regular}</span>
          <span className="rounded bg-brown px-3 py-1 text-[11px] uppercase font-bold text-white tracking-wider shadow-sm">
            Add
          </span>
        </div>
      </button>
    ))}
  </section>
);
