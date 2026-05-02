import type { Drink } from "@/services/drinkService";

interface DrinkGridProps {
  drinks: Drink[];
  isSubmitting: boolean;
  onCustomize: (drink: Drink) => void;
}

export const DrinkGrid = ({ drinks, isSubmitting, onCustomize }: DrinkGridProps) => (
  <section className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
    {drinks.map((drink) => (
      <button
        key={drink.id}
        type="button"
        disabled={isSubmitting}
        onClick={() => onCustomize(drink)}
        className={`flex flex-col items-start justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition-transform duration-150 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          isSubmitting ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <div className="w-full">
          <h4 className="truncate font-semibold text-base">{drink.name}</h4>
          <p className="mt-1 text-sm text-gray-500">₱{drink.sizes.regular}</p>
        </div>
        <div className="w-full flex justify-end">
          <span className="inline-block rounded-md bg-brown px-3 py-1 text-sm font-semibold text-white">
            Add
          </span>
        </div>
      </button>
    ))}
  </section>
);
