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
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar transform transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-10">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h3 className="text-2xl font-bold">{drink.name}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full bg-gray-100 p-2 text-sm font-bold transition-colors duration-200 cursor-pointer z-10 hover:bg-gray-200"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="p-5">
          <div className="flex justify-between items-center mb-6">
            <span className="text-2xl font-bold text-dark-brown">
              ₱{totalPrice.toFixed(2)}
            </span>
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
                      : "bg-[#f3f1eb] text-[#6b5d4d] border-transparent"
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
                      : "bg-[#f3f1eb] text-[#6b5d4d] border-transparent"
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
                        ? "bg-dark-brown text-cream border-dark-brown"
                        : "bg-[#f3f1eb] text-[#6b5d4d] border-transparent"
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

          {selectedToppings.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold">Selected Toppings:</p>
              <p className="text-sm text-gray-600">
                {selectedToppings.map((t) => t.name).join(", ")}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="px-5"
            >
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
