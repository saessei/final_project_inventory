import supabase from "@/lib/supabaseClient";
import { DrinkType } from "@/patterns/DrinkFactory";

export interface Topping {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface SugarLevel {
  id: string;
  label: string;
  percentage: number;
  isAvailable: boolean;
}

export interface DynamicDrink {
  id: string;
  type: DrinkType;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  availableToppings: string[];
  availableSugarLevels: string[];
  isAvailable: boolean;
}

export interface DynamicCategory {
  id: string;
  label: string;
  description: string;
  drinkIds: string[];
  isActive: boolean;
  displayOrder: number;
}

type DrinkRow = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  is_available: boolean | null;
};

class DynamicMenuService {
  private static instance: DynamicMenuService;
  private listeners: Set<() => void> = new Set();

  private constructor() {}

  static getInstance(): DynamicMenuService {
    if (!DynamicMenuService.instance) {
      DynamicMenuService.instance = new DynamicMenuService();
    }
    return DynamicMenuService.instance;
  }

  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify(): void {
    this.listeners.forEach((callback) => callback());
  }

  private async getRegularPrice(drinkId: string): Promise<number> {
    const { data, error } = await supabase
      .from("drink_sizes")
      .select("price")
      .eq("drink_id", drinkId)
      .eq("size", "regular")
      .maybeSingle();

    if (error) return 0;
    return (data?.price as number | null) ?? 0;
  }

  private async mapDrink(row: DrinkRow): Promise<DynamicDrink> {
    const price = await this.getRegularPrice(row.id);
    return {
      id: row.id,
      type: "BrownSugar",
      name: row.name,
      description: row.description ?? "",
      price,
      image: row.image_url ?? "",
      categoryId: row.category ?? "",
      availableToppings: [],
      availableSugarLevels: [],
      isAvailable: row.is_available ?? true,
    };
  }

  // Category Management
  async getCategories(): Promise<DynamicCategory[]> {
    const { data, error } = await supabase
      .from("drinks")
      .select("id, category")
      .eq("is_available", true)
      .order("category");

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    const grouped = new Map<string, string[]>();
    (data || []).forEach((row) => {
      const label = row.category || "Uncategorized";
      grouped.set(label, [...(grouped.get(label) || []), row.id]);
    });

    return Array.from(grouped.entries()).map(([label, drinkIds], index) => ({
      id: label,
      label,
      description: "",
      drinkIds,
      isActive: true,
      displayOrder: index + 1,
    }));
  }

  async addCategory(): Promise<DynamicCategory | null> {
    return null;
  }

  async updateCategory(): Promise<boolean> {
    return false;
  }

  async deleteCategory(): Promise<boolean> {
    return false;
  }

  // Drink Management
  async getDrinksByCategory(categoryId: string): Promise<DynamicDrink[]> {
    const { data, error } = await supabase
      .from("drinks")
      .select("*")
      .eq("category", categoryId)
      .eq("is_available", true);

    if (error) {
      console.error("Error fetching drinks:", error);
      return [];
    }

    return Promise.all(((data || []) as DrinkRow[]).map((row) => this.mapDrink(row)));
  }

  async getAllDrinks(): Promise<DynamicDrink[]> {
    const { data, error } = await supabase
      .from("drinks")
      .select("*")
      .eq("is_available", true);

    if (error) {
      console.error("Error fetching drinks:", error);
      return [];
    }

    return Promise.all(((data || []) as DrinkRow[]).map((row) => this.mapDrink(row)));
  }

  async addDrink(
    drink: Omit<DynamicDrink, "id">,
  ): Promise<DynamicDrink | null> {
    const { data, error } = await supabase
      .from("drinks")
      .insert({
        name: drink.name,
        description: drink.description,
        image_url: drink.image,
        category: drink.categoryId,
        is_available: true,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error adding drink:", error);
      return null;
    }

    const drinkId = data.id as string;
    const sizes = ["regular", "medium", "large"].map((size) => ({
      drink_id: drinkId,
      size,
      price: drink.price,
    }));

    const { error: sizeError } = await supabase.from("drink_sizes").insert(sizes);
    if (sizeError) {
      console.error("Error adding drink sizes:", sizeError);
      await supabase.from("drinks").delete().eq("id", drinkId);
      return null;
    }

    this.notify();
    return this.mapDrink(data as DrinkRow);
  }

  async updateDrink(
    id: string,
    updates: Partial<DynamicDrink>,
  ): Promise<boolean> {
    const updateRow: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.name !== undefined) updateRow.name = updates.name;
    if (updates.description !== undefined)
      updateRow.description = updates.description;
    if (updates.image !== undefined) updateRow.image_url = updates.image;
    if (updates.categoryId !== undefined) updateRow.category = updates.categoryId;
    if (updates.isAvailable !== undefined)
      updateRow.is_available = updates.isAvailable;

    const { error } = await supabase.from("drinks").update(updateRow).eq("id", id);
    if (error) {
      console.error("Error updating drink:", error);
      return false;
    }

    if (updates.price !== undefined) {
      const { error: sizeError } = await supabase
        .from("drink_sizes")
        .update({ price: updates.price })
        .eq("drink_id", id)
        .eq("size", "regular");
      if (sizeError) {
        console.error("Error updating drink price:", sizeError);
        return false;
      }
    }

    this.notify();
    return true;
  }

  async deleteDrink(id: string): Promise<boolean> {
    await supabase.from("drink_toppings").delete().eq("drink_id", id);
    await supabase.from("drink_sizes").delete().eq("drink_id", id);

    const { error } = await supabase.from("drinks").delete().eq("id", id);
    if (error) {
      console.error("Error deleting drink:", error);
      return false;
    }
    this.notify();
    return true;
  }

  // Topping Management
  async getToppings(): Promise<Topping[]> {
    const { data, error } = await supabase
      .from("toppings")
      .select("*")
      .eq("is_available", true)
      .order("name");

    if (error) {
      console.error("Error fetching toppings:", error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      price: row.price ?? 0,
      isAvailable: row.is_available ?? true,
    }));
  }

  async getToppingPrice(toppingName: string): Promise<number> {
    const toppings = await this.getToppings();
    const topping = toppings.find((t) => t.name === toppingName);
    return topping?.price || 0;
  }

  async addTopping(topping: Omit<Topping, "id">): Promise<Topping | null> {
    const { data, error } = await supabase
      .from("toppings")
      .insert({
        name: topping.name,
        price: topping.price,
        is_available: topping.isAvailable,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error adding topping:", error);
      return null;
    }
    this.notify();
    return {
      id: data.id,
      name: data.name,
      price: data.price ?? 0,
      isAvailable: data.is_available ?? true,
    };
  }

  async updateTopping(id: string, updates: Partial<Topping>): Promise<boolean> {
    const updateRow: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.name !== undefined) updateRow.name = updates.name;
    if (updates.price !== undefined) updateRow.price = updates.price;
    if (updates.isAvailable !== undefined)
      updateRow.is_available = updates.isAvailable;

    const { error } = await supabase
      .from("toppings")
      .update(updateRow)
      .eq("id", id);

    if (error) {
      console.error("Error updating topping:", error);
      return false;
    }
    this.notify();
    return true;
  }

  async deleteTopping(id: string): Promise<boolean> {
    const { error } = await supabase.from("toppings").delete().eq("id", id);

    if (error) {
      console.error("Error deleting topping:", error);
      return false;
    }
    this.notify();
    return true;
  }

  // Sugar Level Management
  async getSugarLevels(): Promise<SugarLevel[]> {
    const { data, error } = await supabase
      .from("sugar_levels")
      .select("*")
      .order("percentage");

    if (error) {
      console.error("Error fetching sugar levels:", error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      label: row.label,
      percentage: row.percentage ?? 0,
      isAvailable: true,
    }));
  }

  async addSugarLevel(
    level: Omit<SugarLevel, "id">,
  ): Promise<SugarLevel | null> {
    const { data, error } = await supabase
      .from("sugar_levels")
      .insert({
        label: level.label,
        percentage: level.percentage,
        price_addition: 0,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error adding sugar level:", error);
      return null;
    }
    this.notify();
    return {
      id: data.id,
      label: data.label,
      percentage: data.percentage ?? 0,
      isAvailable: true,
    };
  }

  async updateSugarLevel(
    id: string,
    updates: Partial<SugarLevel>,
  ): Promise<boolean> {
    const updateRow: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.label !== undefined) updateRow.label = updates.label;
    if (updates.percentage !== undefined)
      updateRow.percentage = updates.percentage;

    const { error } = await supabase
      .from("sugar_levels")
      .update(updateRow)
      .eq("id", id);

    if (error) {
      console.error("Error updating sugar level:", error);
      return false;
    }
    this.notify();
    return true;
  }

  async deleteSugarLevel(id: string): Promise<boolean> {
    const { error } = await supabase.from("sugar_levels").delete().eq("id", id);

    if (error) {
      console.error("Error deleting sugar level:", error);
      return false;
    }
    this.notify();
    return true;
  }
}

export const dynamicMenu = DynamicMenuService.getInstance();
