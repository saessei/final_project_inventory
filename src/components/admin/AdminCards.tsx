import { useState } from "react";
import { Edit, Tag, Trash2 } from "lucide-react";
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
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <h3 className="text-center text-xl font-bold">{level.label}</h3>
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
          <p className="mt-1 text-xs text-gray-400">
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

export const DrinkCard = ({ drink, onEdit, onDelete }: DrinkCardProps) => (
  <div className="group rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h3 className="truncate font-bold text-base">{drink.name}</h3>
        <p className="truncate text-xs text-gray-500">
          ₱{drink.sizes.regular} / ₱{drink.sizes.medium} / ₱{drink.sizes.large}
        </p>
      </div>
      <div className="flex gap-2 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
        <IconButton
          label={`Edit ${drink.name}`}
          onClick={onEdit}
          variant="ghost"
          className="h-auto w-auto rounded-full p-2"
        >
          <Edit size={16} />
        </IconButton>
        <IconButton
          label={`Delete ${drink.name}`}
          onClick={onDelete}
          variant="danger"
          className="h-auto w-auto rounded-full p-2 bg-transparent"
        >
          <Trash2 size={16} />
        </IconButton>
      </div>
    </div>
  </div>
);

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
  <div className="group rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 flex items-center gap-2">
        <Tag size={16} className="shrink-0 text-brown-two" />
        <div className="min-w-0">
          <h3 className="truncate font-bold text-base">{topping.name}</h3>
          <p className="text-xs text-gray-500">₱{topping.price}</p>
        </div>
      </div>
      <div className="flex gap-2 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
        <IconButton
          label={`Edit ${topping.name}`}
          onClick={onEdit}
          variant="ghost"
          className="h-auto w-auto rounded-full p-2"
        >
          <Edit size={16} />
        </IconButton>
        <IconButton
          label={`Delete ${topping.name}`}
          onClick={onDelete}
          variant="danger"
          className="h-auto w-auto rounded-full p-2 bg-transparent"
        >
          <Trash2 size={16} />
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
  <div className="group rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h3 className="truncate font-bold text-base">{category.label}</h3>
        <p className="truncate text-xs text-gray-500">
          {category.drinkIds.length} drinks
        </p>
      </div>
      <div className="flex gap-2 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
        <IconButton
          label={`Edit ${category.label}`}
          onClick={onEdit}
          variant="ghost"
          className="h-auto w-auto rounded-full p-2"
        >
          <Edit size={16} />
        </IconButton>
        <IconButton
          label={`Delete ${category.label}`}
          onClick={onDelete}
          variant="danger"
          className="h-auto w-auto rounded-full p-2 bg-transparent"
        >
          <Trash2 size={16} />
        </IconButton>
      </div>
    </div>
  </div>
);
