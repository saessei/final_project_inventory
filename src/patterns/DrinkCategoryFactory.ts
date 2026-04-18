import { DrinkFactory, type DrinkType, type Drink } from "./DrinkFactory";

export type DrinkCategoryId = "milktea" | "specials";

export type DrinkCategory = {
  id: DrinkCategoryId;
  label: string;
  drinkIds: readonly DrinkType[];
};

const Categories: readonly DrinkCategory[] = [
  {
    id: "milktea",
    label: "Milk Tea",
    drinkIds: ["BrownSugar", "Taro"],
  },
  {
    id: "specials",
    label: "Specials",
    drinkIds: ["Matcha", "Shrek"],
  },
] as const;

export function getCategoryFactories(): DrinkCategory[] {
  return [...Categories];
}

export function getCategoryFactory(id: DrinkCategoryId): DrinkCategory {
  const found = Categories.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown category: ${id}`);
  return found;
}

export function createDrinksForCategory(id: DrinkCategoryId): Drink[] {
  const category = getCategoryFactory(id);
  return category.drinkIds.map((drinkId) => DrinkFactory.createDrink(drinkId));
}