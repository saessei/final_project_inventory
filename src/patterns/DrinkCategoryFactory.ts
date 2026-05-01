import { Drink } from "./DrinkFactory";
import { DrinkFactory } from "./DrinkFactory";
import { dynamicMenu } from "@/services/dynamicMenuService";

export type DrinkCategoryId = string;

export interface DrinkCategory {
  id: string;
  label: string;
  description: string;
}

export async function getCategoryFactories(): Promise<DrinkCategory[]> {
  const categories = await dynamicMenu.getCategories();
  return categories.map((cat) => ({
    id: cat.id,
    label: cat.label,
    description: cat.description,
  }));
}

export async function createDrinksForCategory(
  id: DrinkCategoryId,
): Promise<Drink[]> {
  const dynamicDrinks = await dynamicMenu.getDrinksByCategory(id);

  // Convert dynamic drinks to the Drink interface using the factory
  return dynamicDrinks.map((dynamicDrink) => {
    // Map the dynamic drink to use DrinkFactory
    const validType = dynamicDrink.type as
      | "BrownSugar"
      | "Matcha"
      | "Taro"
      | "PassionFruit";
    return DrinkFactory.createDrink(validType);
  });
}
