import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";
import type { Drink, SugarLevel, Topping } from "@/services/DrinkService";

interface CustomizationModalProps {
  drink: Drink;
  sugarLevels: SugarLevel[];
  selectedIce: string;
  selectedSize: string;
  selectedSugar: SugarLevel | null;
  selectedToppings: Topping[];
  isSubmitting: boolean;
  totalPrice: number;
  onClose: () => void;
  onIceChange: (ice: string) => void;
  onSizeChange: (size: string) => void;
  onSugarChange: (sugar: SugarLevel) => void;
  onToggleTopping: (topping: Topping) => void;
  onAddToOrder: () => void;
}

export const CustomizationModal = ({
  drink,
  sugarLevels,
  selectedIce,
  selectedSize,
  selectedSugar,
  selectedToppings,
  isSubmitting,
  totalPrice,
  onClose,
  onIceChange,
  onSizeChange,
  onSugarChange,
  onToggleTopping,
  onAddToOrder,
}: CustomizationModalProps) => {
  const iceOptions = ["No Ice", "Less Ice", "Regular Ice", "Extra Ice"];
  const sizeOptions = [
    { key: "regular", label: "Regular", price: drink.sizes.regular },
    { key: "medium", label: "Medium", price: drink.sizes.medium },
    { key: "large", label: "Large", price: drink.sizes.large },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 slide-in-from-bottom-10">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <h3 className="text-3xl font-bold">{drink.name}</h3>
            <p className="text-sm text-gray-500 mt-1">Customize your drink</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full bg-white p-2 text-sm font-bold hover:bg-slate-50 transition-colors duration-200 cursor-pointer shadow-sm border border-slate-200"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-500">Total</p>
              <span className="text-2xl font-black text-dark-brown">
                ₱{totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-lg font-semibold mb-2">Ice Level</p>
            <div className="grid grid-cols-2 gap-2">
              {iceOptions.map((ice) => (
                <Button
                  key={ice}
                  onClick={() => onIceChange(ice)}
                  variant="outline"
                  className={`px-3 py-2 transition-colors ${
                    selectedIce === ice
                      ? "bg-dark-brown text-cream border-dark-brown"
                      : "bg-[#f3f1eb] text-[#6b5d4d] border-transparent hover:bg-brown/20"
                  }`}
                >
                  {ice}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-lg font-semibold mb-2">Select Size</p>
            <div className="grid grid-cols-3 gap-2">
              {sizeOptions.map((option) => (
                <Button
                  key={option.key}
                  onClick={() => onSizeChange(option.key)}
                  variant="outline"
                  className={`px-3 py-2 transition-colors ${
                    selectedSize === option.key
                      ? "bg-dark-brown text-cream border-dark-brown"
                      : "bg-[#f3f1eb] text-[#6b5d4d] border-transparent hover:bg-brown/20"
                  }`}
                >
                  {option.label}
                  <br />₱{option.price}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-lg font-semibold mb-2">Sugar Level</p>
            <div className="grid grid-cols-2 gap-2">
              {sugarLevels.map((level) => (
                <Button
                  key={level.id}
                  onClick={() => onSugarChange(level)}
                  variant="outline"
                  className={`px-3 py-2 transition-colors ${
                    selectedSugar?.id === level.id
                      ? "bg-dark-brown text-cream border-dark-brown"
                      : "bg-[#f3f1eb] text-[#6b5d4d] border-transparent hover:bg-brown/20"
                  }`}
                >
                  {level.label}
                  {level.price_addition > 0 && (
                    <span className="text-xs block">
                      +₱{level.price_addition}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {drink.available_toppings.length > 0 && (
            <div className="mb-6">
              <p className="text-lg font-semibold mb-2">Add Toppings</p>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto no-scrollbar">
                {drink.available_toppings.map((topping) => (
                  <Button
                    key={topping.id}
                    onClick={() => onToggleTopping(topping)}
                    variant="outline"
                    className={`px-3 py-2 transition-colors ${
                      selectedToppings.some((t) => t.id === topping.id)
                        ? "bg-brown text-cream border-brown"
                        : "bg-[#f3f1eb] text-[#6b5d4d] border-transparent hover:bg-brown/20"
                    }`}
                  >
                    {topping.name}
                    <br />
                    +₱{topping.price}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button onClick={onClose} variant="outline" className="px-5">
              Cancel
            </Button>
            <Button
              onClick={onAddToOrder}
              variant="solid"
              isLoading={isSubmitting}
              loadingText="Adding..."
              className="px-5"
            >
              Add to Cart - ₱{totalPrice.toFixed(2)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
