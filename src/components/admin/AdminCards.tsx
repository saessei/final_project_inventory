import { useState } from "react";
import { Edit, Tag, Trash2 } from "lucide-react";
import placeholderImg from "@/assets/Placeholder.jpg";
import { IconButton } from "@/components/ui/IconButton";
import { TextField } from "@/components/ui/TextField";
import type {
  CategoryType,
  DrinkType,
  SugarLevel,
  ToppingType,
} from "@/types/menuTypes";

interface SugarLevelCardProps {
  level: SugarLevel;
  onUpdate: (id: string, price: number) => void;
}

export const SugarLevelCard = ({ level, onUpdate }: SugarLevelCardProps) => {
  const [price, setPrice] = useState(level.price_addition.toString());
  const [isDirty, setIsDirty] = useState(false);

  const handleBlur = () => {
    const numPrice = parseFloat(price) || 0;
    if (isDirty && numPrice !== level.price_addition) {
      onUpdate(level.id, numPrice);
      setIsDirty(false);
    }
    setPrice(numPrice.toString());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setPrice(value);
      setIsDirty(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <h3 className="font-bold text-xl text-center">{level.label}</h3>
      <p className="text-center text-gray-500">{level.percentage}% sweetness</p>
      <div className="mt-4">
        <TextField
          label="Additional Price: ₱"
          type="text"
          value={price}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="rounded-lg py-2 focus:ring-dark-brown"
          placeholder="0"
        />
        {isDirty && (
          <p className="text-xs text-gray-400 mt-1">
            Press Enter or click outside to save
          </p>
        )}
      </div>
    </div>
  );
};

interface DrinkCardProps {
  drink: DrinkType;
  onEdit: () => void;
  onDelete: () => void;
}

export const DrinkCard = ({ drink, onEdit, onDelete }: DrinkCardProps) => {
  const [imageError, setImageError] = useState(false);

  const getImageSrc = () => {
    if (imageError) return placeholderImg;
    if (drink.image_url && drink.image_url !== "") return drink.image_url;
    return placeholderImg;
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer overflow-hidden">
      <div className="relative">
        <img
          src={getImageSrc()}
          alt={drink.name}
          className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <IconButton
            label={`Edit ${drink.name}`}
            onClick={onEdit}
            variant="outline"
            className="h-auto w-auto rounded-full p-2 bg-white shadow-md"
          >
            <Edit size={16} />
          </IconButton>
          <IconButton
            label={`Delete ${drink.name}`}
            onClick={onDelete}
            variant="danger"
            className="h-auto w-auto rounded-full p-2 bg-white shadow-md"
          >
            <Trash2 size={16} />
          </IconButton>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg">{drink.name}</h3>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {drink.description}
        </p>
        <div className="mt-3 pt-2 border-t border-slate-200">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center">
              <span className="text-xs text-gray-500">Regular</span>
              <p className="font-semibold">₱{drink.sizes.regular}</p>
            </div>
            <div className="text-center">
              <span className="text-xs text-gray-500">Medium</span>
              <p className="font-semibold">₱{drink.sizes.medium}</p>
            </div>
            <div className="text-center">
              <span className="text-xs text-gray-500">Large</span>
              <p className="font-semibold">₱{drink.sizes.large}</p>
            </div>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          <p>
            Toppings:{" "}
            {drink.available_toppings?.map((t) => t.name).join(", ") || "None"}
          </p>
        </div>
      </div>
    </div>
  );
};

interface ToppingCardProps {
  topping: ToppingType;
  onEdit: () => void;
  onDelete: () => void;
}

export const ToppingCard = ({
  topping,
  onEdit,
  onDelete,
}: ToppingCardProps) => (
  <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
    <div className="flex justify-between items-center">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Tag size={20} className="text-brown-two" />
          <h3 className="font-bold text-lg">{topping.name}</h3>
        </div>
        <p className="text-2xl font-bold text-dark-brown mt-2">
          ₱{topping.price}
        </p>
      </div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <IconButton
          label={`Edit ${topping.name}`}
          onClick={onEdit}
          variant="ghost"
          className="h-auto w-auto rounded-full p-2"
        >
          <Edit size={18} />
        </IconButton>
        <IconButton
          label={`Delete ${topping.name}`}
          onClick={onDelete}
          variant="danger"
          className="h-auto w-auto rounded-full p-2 bg-transparent"
        >
          <Trash2 size={18} />
        </IconButton>
      </div>
    </div>
  </div>
);

interface CategoryCardProps {
  category: CategoryType;
  onEdit: () => void;
  onDelete: () => void;
}

export const CategoryCard = ({
  category,
  onEdit,
  onDelete,
}: CategoryCardProps) => (
  <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-bold text-lg">{category.label}</h3>
        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
        <p className="text-xs text-gray-400 mt-1">
          {category.drinkIds.length} drinks
        </p>
      </div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <IconButton
          label={`Edit ${category.label}`}
          onClick={onEdit}
          variant="ghost"
          className="h-auto w-auto rounded-full p-2"
        >
          <Edit size={18} />
        </IconButton>
        <IconButton
          label={`Delete ${category.label}`}
          onClick={onDelete}
          variant="danger"
          className="h-auto w-auto rounded-full p-2 bg-transparent"
        >
          <Trash2 size={18} />
        </IconButton>
      </div>
    </div>
  </div>
);
