import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";
import type { Drink, SugarLevel, Topping } from "@/services/DrinkService";

interface CustomizationModalProps {
  drink: Drink;
  sugarLevels: SugarLevel[];
  selectedSize: string;
  selectedSugar: SugarLevel | null;
  selectedToppings: Topping[];
  isSubmitting: boolean;
  totalPrice: number;
  onClose: () => void;
  onSizeChange: (size: string) => void;
  onSugarChange: (sugar: SugarLevel) => void;
  onToggleTopping: (topping: Topping) => void;
  onAddToOrder: () => void;
}

const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="rounded-3xl border border-slate-200 bg-[#fcfbf7] p-4 shadow-sm">
    <div className="mb-3 flex items-center justify-between">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">
        {title}
      </p>
    </div>
    {children}
  </section>
);

export const CustomizationModal = ({
  drink,
  sugarLevels,
  selectedSize,
  selectedSugar,
  selectedToppings,
  isSubmitting,
  totalPrice,
  onClose,
  onSizeChange,
  onSugarChange,
  onToggleTopping,
  onAddToOrder,
}: CustomizationModalProps) => {
  const sizeOptions = [
    { key: "regular", label: "Regular", price: drink.sizes.regular },
    { key: "medium", label: "Medium", price: drink.sizes.medium },
    { key: "large", label: "Large", price: drink.sizes.large },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar transform transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-10 border border-slate-200">
        <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-200 bg-[#fcfbf7]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">
              Customize drink
            </p>
            <h3 className="mt-2 text-3xl font-black font-fredoka text-dark-brown">
              {drink.name}
            </h3>
          </div>
          <div className="rounded-2xl bg-dark-brown px-4 py-2 text-right text-white shadow-sm">
            <p className="text-[0.65rem] uppercase tracking-[0.24em] text-white/70">
              Total
            </p>
            <p className="text-xl font-black">₱{totalPrice.toFixed(2)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full bg-gray-100 p-2 text-sm font-bold transition-colors duration-200 cursor-pointer z-10 hover:bg-gray-200"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <SectionCard title="Size">
            <div className="grid grid-cols-3 gap-2">
              {sizeOptions.map((option) => (
                <Button
                  key={option.key}
                  onClick={() => onSizeChange(option.key)}
                  variant="outline"
                  className={`rounded-2xl px-3 py-3 transition-all ${
                    selectedSize === option.key
                      ? "!bg-brown !text-white !border-brown shadow-md ring-2 ring-brown/15"
                      : "bg-white text-[#6b5d4d] border-slate-200"
                  }`}
                >
                  <span className="text-sm font-semibold">{option.label}</span>
                  <span className="text-xs opacity-80">₱{option.price}</span>
                </Button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Sugar level">
            <div className="grid grid-cols-2 gap-2">
              {sugarLevels.map((level) => (
                <Button
                  key={level.id}
                  onClick={() => onSugarChange(level)}
                  variant="outline"
                  className={`rounded-2xl px-3 py-3 transition-all ${
                    selectedSugar?.id === level.id
                      ? "!bg-brown !text-white !border-brown shadow-md ring-2 ring-brown/15"
                      : "bg-white text-[#6b5d4d] border-slate-200"
                  }`}
                >
                  <span className="text-sm font-semibold">{level.label}</span>
                  {level.price_addition > 0 && (
                    <span className="text-xs block opacity-80">
                      +₱{level.price_addition}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </SectionCard>

          {drink.available_toppings.length > 0 && (
            <SectionCard title="Toppings">
              <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto no-scrollbar">
                {drink.available_toppings.map((topping) => (
                  <Button
                    key={topping.id}
                    onClick={() => onToggleTopping(topping)}
                    variant="outline"
                    className={`rounded-2xl px-3 py-3 transition-all ${
                      selectedToppings.some((t) => t.id === topping.id)
                        ? "!bg-brown !text-white !border-brown shadow-md ring-2 ring-brown/15"
                        : "bg-white text-[#6b5d4d] border-slate-200"
                    }`}
                  >
                    <span className="text-sm font-semibold">{topping.name}</span>
                    <span className="text-xs opacity-80">+₱{topping.price}</span>
                  </Button>
                ))}
              </div>
            </SectionCard>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-1">
            <Button
              onClick={onClose}
              variant="outline"
              className="px-5 rounded-2xl"
            >
              Cancel
            </Button>
            <Button
              onClick={onAddToOrder}
              variant="solid"
              isLoading={isSubmitting}
              loadingText="Adding..."
              className="px-5 rounded-2xl"
            >
              Add to Cart - ₱{totalPrice.toFixed(2)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
