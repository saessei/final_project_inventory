import type { Meta, StoryObj } from "@storybook/react";
import { DrinkCard, ToppingCard, CategoryCard, SugarLevelCard } from "@/components/admin/AdminCards";

const meta: Meta = {
  title: "Admin/Cards",
  tags: ["autodocs"],
};

export default meta;

export const Drink: StoryObj<typeof DrinkCard> = {
  render: (args) => (
    <div className="max-w-xs">
      <DrinkCard {...args} />
    </div>
  ),
  args: {
    drink: {
      id: "1",
      name: "Signature Wintermelon",
      category: "milk-tea",
      is_available: true,
      sizes: { regular: 85, medium: 95, large: 105 },
      available_toppings: [],
    },
    onEdit: () => console.log("Edit clicked"),
    onDelete: () => console.log("Delete clicked"),
  },
};

export const DrinkUnavailable: StoryObj<typeof DrinkCard> = {
  ...Drink,
  args: {
    ...Drink.args,
    drink: {
      ...Drink.args!.drink!,
      is_available: false,
    },
  },
};

export const Topping: StoryObj<typeof ToppingCard> = {
  render: (args) => (
    <div className="max-w-xs">
      <ToppingCard {...args} />
    </div>
  ),
  args: {
    topping: {
      id: "1",
      name: "Pearl",
      price: 15,
      is_available: true,
    },
    onEdit: () => console.log("Edit clicked"),
    onDelete: () => console.log("Delete clicked"),
  },
};

export const Category: StoryObj<typeof CategoryCard> = {
  render: (args) => (
    <div className="max-w-xs">
      <CategoryCard {...args} />
    </div>
  ),
  args: {
    category: {
      id: "milk-tea",
      label: "Milk Tea",
      description: "Creamy classic milk teas",
      drinkIds: ["1", "2", "3", "4"],
    },
    onEdit: () => console.log("Edit clicked"),
    onDelete: () => console.log("Delete clicked"),
  },
};

export const SugarLevel: StoryObj<typeof SugarLevelCard> = {
  render: (args) => (
    <div className="max-w-xs">
      <SugarLevelCard {...args} />
    </div>
  ),
  args: {
    level: {
      id: "1",
      label: "Full Sugar",
      percentage: 100,
      price_addition: 0,
    },
    onUpdate: (id, price) => console.log(`Updated level ${id} with price ₱${price}`),
  },
};
