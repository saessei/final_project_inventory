import { useState } from "react";
import { Edit, Tag, Trash2, MoreHorizontal } from "lucide-react";
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

export const DrinkCard = ({ drink, onEdit, onDelete }: DrinkCardProps) => {
  const [actionsOpen, setActionsOpen] = useState(false);

  return (
  <div
    className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
    onClick={() => setActionsOpen((prev) => !prev)}
  >
    <div className="flex items-center justify-between gap-3 mb-2">
      <div className="min-w-0">
        <h3 className="truncate font-black text-dark-brown text-base leading-tight">{drink.name}</h3>
        <p className="truncate text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
          ₱{drink.sizes.regular} / ₱{drink.sizes.medium} / ₱{drink.sizes.large}
        </p>
      </div>
      <div
        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
          drink.is_available
            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
            : "bg-rose-50 text-rose-600 border border-rose-100"
        }`}
      >
        {drink.is_available ? "Available" : "Unavailable"}
      </div>
    </div>

    <div
      className={`absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-2xl bg-white/95 transition-opacity duration-200 ${
        actionsOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <IconButton
        label={`Edit ${drink.name}`}
        onClick={(event) => {
          event.stopPropagation();
          onEdit();
        }}
        variant="ghost"
        className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-brown hover:bg-slate-100 transition-all border border-slate-200"
      >
        <Edit size={14} /> Edit
      </IconButton>
      <IconButton
        label={`Delete ${drink.name}`}
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
        variant="danger"
        className="rounded-xl bg-rose-50 p-2 text-rose-500 hover:bg-rose-100 hover:text-rose-700 transition-all border border-rose-100"
      >
        <Trash2 size={16} />
      </IconButton>
    </div>

    <div
      className={`mt-2 flex items-center justify-between text-[10px] text-slate-300 font-bold uppercase tracking-widest transition-opacity ${
        actionsOpen ? "opacity-0" : "opacity-100"
      }`}
    >
      <span>Manage Item</span>
      <MoreHorizontal size={14} />
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
}: ToppingCardProps) => {
  const [actionsOpen, setActionsOpen] = useState(false);

  return (
  <div
    className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
    onClick={() => setActionsOpen((prev) => !prev)}
  >
    <div className="flex items-center justify-between gap-3 mb-2">
      <div className="min-w-0 flex items-center gap-2">
        <Tag size={16} className="shrink-0 text-brown-two" />
        <div className="min-w-0">
          <h3 className="truncate font-black text-dark-brown text-base leading-tight">{topping.name}</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">₱{topping.price}</p>
        </div>
      </div>
      <div
        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
          topping.is_available
            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
            : "bg-rose-50 text-rose-600 border border-rose-100"
        }`}
      >
        {topping.is_available ? "Available" : "Unavailable"}
      </div>
    </div>

    <div
      className={`absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-2xl bg-white/95 transition-opacity duration-200 ${
        actionsOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <IconButton
        label={`Edit ${topping.name}`}
        onClick={(event) => {
          event.stopPropagation();
          onEdit();
        }}
        variant="ghost"
        className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-brown hover:bg-slate-100 transition-all border border-slate-200"
      >
        <Edit size={14} /> Edit
      </IconButton>
      <IconButton
        label={`Delete ${topping.name}`}
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
        variant="danger"
        className="rounded-xl bg-rose-50 p-2 text-rose-500 hover:bg-rose-100 hover:text-rose-700 transition-all border border-rose-100"
      >
        <Trash2 size={16} />
      </IconButton>
    </div>

    <div
      className={`mt-2 flex items-center justify-between text-[10px] text-slate-300 font-bold uppercase tracking-widest transition-opacity ${
        actionsOpen ? "opacity-0" : "opacity-100"
      }`}
    >
      <span>Manage Topping</span>
      <MoreHorizontal size={14} />
    </div>
  </div>
  );
};

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
