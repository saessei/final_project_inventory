export type TabType = "categories" | "drinks" | "toppings" | "sugar-levels";

export interface SugarLevel {
  id: string;
  percentage: number;
  label: string;
  price_addition: number;
}

export interface DrinkType {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
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

// CategoryType removed

export interface DrinkModalData {
  name: string;
  description: string;
  image_url: string;
  category: string;
  regular_price: string;
  medium_price: string;
  large_price: string;
  selected_toppings: string[];
}
