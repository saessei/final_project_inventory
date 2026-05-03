export type TabType = "drinks" | "toppings";

export interface SugarLevel {
  id: string;
  percentage: number;
  label: string;
  price_addition: number;
}

export interface DrinkType {
  id: string;
  name: string;
  category?: string | null;
  is_available: boolean;
  sizes: {
    regular: number;
    medium: number;
    large: number;
  };
  available_toppings: ToppingType[];
}

export interface ToppingType {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
}

export interface CategoryType {
  id: string;
  label: string;
  description: string;
  drinkIds: string[];
}

export interface MenuCategory {
  id: string;
  name: string;
  is_active: boolean;
}

export interface DrinkModalData {
  name: string;
  category: string;
  is_available: boolean;
  regular_price: string;
  medium_price: string;
  large_price: string;
  selected_toppings: string[];
}
