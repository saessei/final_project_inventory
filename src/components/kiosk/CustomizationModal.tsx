import placeholderImg from "@/assets/Placeholder.jpg";
import { Button } from "@/components/ui/Button";
import type { Drink, SugarLevel, Topping } from "@/services/drinkService";

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
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-10 hover:scale-[1.02] hover:shadow-3xl">
        <div className="relative h-56 group overflow-hidden">
          <img
            src={drink.image_url || placeholderImg}
            alt={drink.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) =>
              ((e.target as HTMLImageElement).src = placeholderImg)
            }
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-sm font-bold hover:bg-white hover:scale-110 hover:rotate-90 transition-all duration-200 cursor-pointer shadow-lg z-10"
          >
            x
          </button>
        </div>
        <div className="p-5 transition-all duration-300 hover:translate-y-[-2px]">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-3xl font-bold">{drink.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{drink.description}</p>
            </div>
            <span className="text-2xl font-black text-dark-brown">
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
                  className={`px-3 py-2 hover:scale-105 ${
                    selectedSize === option.key
                      ? "bg-dark-brown text-white border-dark-brown"
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
                  className={`px-3 py-2 hover:scale-105 ${
                    selectedSugar?.id === level.id
                      ? "bg-dark-brown text-white border-dark-brown"
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
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {drink.available_toppings.map((topping) => (
                  <Button
                    key={topping.id}
                    onClick={() => onToggleTopping(topping)}
                    variant="outline"
                    className={`px-3 py-2 hover:scale-105 ${
                      selectedToppings.some((t) => t.id === topping.id)
                        ? "bg-dark-brown text-white border-dark-brown"
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
              className="px-5 hover:scale-105"
            >
              Cancel
            </Button>
            <Button
              onClick={onAddToOrder}
              variant="solid"
              isLoading={isSubmitting}
              loadingText="Adding..."
              className="px-5 hover:scale-105"
            >
              Add to Cart - ₱{totalPrice.toFixed(2)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
