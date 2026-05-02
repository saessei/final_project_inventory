import { CirclePlus, CupSoda, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DrinkCard, ToppingCard } from "./AdminCards";
import type { DrinkType, TabType, ToppingType } from "@/types/menuTypes";

interface AdminTabsProps {
  activeTab: TabType;
  drinks: DrinkType[];
  toppings: ToppingType[];
  onTabChange: (tab: TabType) => void;
  onAddDrink: () => void;
  onEditDrink: (drink: DrinkType) => void;
  onDeleteDrink: (id: string, name: string) => void;
  onAddTopping: () => void;
  onEditTopping: (topping: ToppingType) => void;
  onDeleteTopping: (id: string, name: string) => void;
}

export const AdminTabs = ({
  activeTab,
  drinks,
  toppings,
  onTabChange,
  onAddDrink,
  onEditDrink,
  onDeleteDrink,
  onAddTopping,
  onEditTopping,
  onDeleteTopping,
}: AdminTabsProps) => {
  const tabs = [
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

    </>
  );
};
