import type { Drink } from "@/services/drinkService";
import { DrinkImage } from "./DrinkImage";

interface DrinkGridProps {
  drinks: Drink[];
  isSubmitting: boolean;
  onCustomize: (drink: Drink) => void;
}

export const DrinkGrid = ({
  drinks,
  isSubmitting,
  onCustomize,
}: DrinkGridProps) => (
  <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-2 auto-rows-fr">
    {drinks.map((drink) => (
      <article
        key={drink.id}
        className="flex h-full flex-col border border-slate-200 rounded-3xl bg-white p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
      >
        <div className="relative overflow-hidden rounded-2xl">
          <DrinkImage imageUrl={drink.image_url} name={drink.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        <div className="mt-4 flex flex-1 flex-col">
          <h3 className="text-2xl font-bold">{drink.name}</h3>
          <p className="mt-1 text-sm text-gray-500 line-clamp-3 min-h-[3rem]">
            {drink.description}
          </p>
          <div className="mt-auto">
            <p className="mt-3 text-3xl font-bold">₱{drink.sizes.regular}</p>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onCustomize(drink)}
              className={`mt-4 w-full rounded-xl py-3 font-semibold transition-all duration-300 cursor-pointer hover:scale-105 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-brown text-white hover:bg-brown-dark"
              }`}
            >
              + Add to Cart
            </button>
          </div>
        </div>
      </article>
    ))}
  </section>
);
