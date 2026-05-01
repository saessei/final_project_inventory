import {
  Candy,
  CirclePlus,
  CupSoda,
  FolderOpen,
  Plus,
  TrendingUp,
} from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import {
  CategoryCard,
  DrinkCard,
  SugarLevelCard,
  ToppingCard,
} from "./AdminCards";
import type {
  CategoryType,
  DrinkType,
  SugarLevel,
  TabType,
  ToppingType,
} from "../../types/menuTypes";

interface AdminTabsProps {
  activeTab: TabType;
  categories: CategoryType[];
  drinks: DrinkType[];
  toppings: ToppingType[];
  sugarLevels: SugarLevel[];
  onTabChange: (tab: TabType) => void;
  onAddCategory: () => void;
  onEditCategory: (category: CategoryType) => void;
  onDeleteCategory: (id: string, label: string) => void;
  onAddDrink: () => void;
  onEditDrink: (drink: DrinkType) => void;
  onDeleteDrink: (id: string, name: string) => void;
  onAddTopping: () => void;
  onEditTopping: (topping: ToppingType) => void;
  onDeleteTopping: (id: string, name: string) => void;
  onUpdateSugarLevel: (id: string, price: number) => void;
}

export const AdminTabs = ({
  activeTab,
  categories,
  drinks,
  toppings,
  sugarLevels,
  onTabChange,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onAddDrink,
  onEditDrink,
  onDeleteDrink,
  onAddTopping,
  onEditTopping,
  onDeleteTopping,
  onUpdateSugarLevel,
}: AdminTabsProps) => {
  const tabs = [
    {
      type: "categories" as const,
      label: `Categories (${categories.length})`,
      icon: <FolderOpen size={18} />,
    },
    {
      type: "drinks" as const,
      label: `Drinks (${drinks.length})`,
      icon: <CupSoda size={18} />,
    },
    {
      type: "toppings" as const,
      label: `Toppings (${toppings.length})`,
      icon: <CirclePlus size={18} />,
    },
    {
      type: "sugar-levels" as const,
      label: "Sugar Levels",
      icon: <Candy size={18} />,
    },
  ];

  return (
    <>
      <div className="flex gap-2 mb-6 border-b flex-wrap">
        {tabs.map((tab) => (
          <Button
            key={tab.type}
            onClick={() => onTabChange(tab.type)}
            variant="ghost"
            className={`px-6 py-3 rounded-b-none ${
              activeTab === tab.type
                ? "text-dark-brown border-b-2 border-dark-brown bg-white"
                : "text-gray-500 hover:text-dark-brown"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </span>
          </Button>
        ))}
      </div>

      {activeTab === "categories" && (
        <div>
          <Button
            onClick={onAddCategory}
            variant="solid"
            leftIcon={<Plus size={18} />}
            className="mb-4 rounded-lg hover:opacity-90"
          >
            Add Category
          </Button>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={() => onEditCategory(category)}
                onDelete={() => onDeleteCategory(category.id, category.label)}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === "drinks" && (
        <div>
          <Button
            onClick={onAddDrink}
            variant="solid"
            leftIcon={<Plus size={18} />}
            className="mb-4 rounded-lg hover:opacity-90"
          >
            Add Drink
          </Button>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {drinks.map((drink) => (
              <DrinkCard
                key={drink.id}
                drink={drink}
                onEdit={() => onEditDrink(drink)}
                onDelete={() => onDeleteDrink(drink.id, drink.name)}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === "toppings" && (
        <div>
          <Button
            onClick={onAddTopping}
            variant="solid"
            leftIcon={<Plus size={18} />}
            className="mb-4 rounded-lg hover:opacity-90"
          >
            Add Topping
          </Button>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {toppings.map((topping) => (
              <ToppingCard
                key={topping.id}
                topping={topping}
                onEdit={() => onEditTopping(topping)}
                onDelete={() => onDeleteTopping(topping.id, topping.name)}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === "sugar-levels" && (
        <div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {sugarLevels.map((level) => (
              <SugarLevelCard
                key={level.id}
                level={level}
                onUpdate={onUpdateSugarLevel}
              />
            ))}
          </div>
          <Alert
            variant="info"
            className="mt-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 text-yellow-800 font-normal"
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-yellow-600" />
              <span className="text-sm">
                Sugar levels: 25%, 50%, 75% have no additional charge by
                default. 100% sweetness adds ₱5.00. Just type the price directly
                in the input field. Press Enter or click outside to save.
              </span>
            </div>
          </Alert>
        </div>
      )}
    </>
  );
};
