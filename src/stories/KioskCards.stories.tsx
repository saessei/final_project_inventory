import type { Meta, StoryObj } from "@storybook/react-vite";
import { DrinkGrid } from "@/components/kiosk/DrinkGrid";

const meta: Meta<typeof DrinkGrid> = {
  title: "Kiosk/DrinkGrid",
  component: DrinkGrid,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockDrinks = [
  {
    id: "1",
    name: "Classic Milk Tea",
    sizes: { regular: 85, medium: 95, large: 105 },
    category: "milk-tea",
    is_available: true,
    available_toppings: [],
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Wintermelon Cream Latte",
    sizes: { regular: 95, medium: 105, large: 115 },
    category: "milk-tea",
    is_available: true,
    available_toppings: [],
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Matcha Berry Twist with Extra Cream",
    sizes: { regular: 110, medium: 120, large: 130 },
    category: "fruit-tea",
    is_available: true,
    available_toppings: [],
    created_at: new Date().toISOString(),
  },
];

export const Default: Story = {
  args: {
    drinks: mockDrinks,
    isSubmitting: false,
    onCustomize: (drink) => console.log("Customize:", drink.name),
  },
};

export const Submitting: Story = {
  args: {
    ...Default.args,
    isSubmitting: true,
  },
};
