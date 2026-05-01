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

  // Category Management
  async getCategories(): Promise<DynamicCategory[]> {
    const { data, error } = await supabase
      .from("menu_categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
    return data || [];
  }

  async addCategory(
    category: Omit<DynamicCategory, "id" | "drinkIds" | "displayOrder">,
  ): Promise<DynamicCategory | null> {
    const categories = await this.getCategories();
    const newCategory: DynamicCategory = {
      ...category,
      id: `cat_${Date.now()}`,
      drinkIds: [],
      displayOrder: categories.length + 1,
      isActive: true,
    };

    const { data, error } = await supabase
      .from("menu_categories")
      .insert([newCategory])
      .select()
      .single();

    if (error) {
      console.error("Error adding category:", error);
      return null;
    }
    this.notify();
    return data;
  }

  async updateCategory(
    id: string,
    updates: Partial<DynamicCategory>,
  ): Promise<boolean> {
    const { error } = await supabase
      .from("menu_categories")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Error updating category:", error);
      return false;
    }
    this.notify();
    return true;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("menu_categories")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting category:", error);
      return false;
    }
    this.notify();
    return true;
  }

  // Drink Management
  async getDrinksByCategory(categoryId: string): Promise<DynamicDrink[]> {
    const { data, error } = await supabase
      .from("menu_drinks")
      .select("*")
      .eq("category_id", categoryId)
      .eq("is_available", true);

    if (error) {
      console.error("Error fetching drinks:", error);
      return [];
    }
    return data || [];
  }

  async getAllDrinks(): Promise<DynamicDrink[]> {
    const { data, error } = await supabase
      .from("menu_drinks")
      .select("*")
      .eq("is_available", true);

    if (error) {
      console.error("Error fetching drinks:", error);
      return [];
    }
    return data || [];
  }

  async addDrink(
    drink: Omit<DynamicDrink, "id">,
  ): Promise<DynamicDrink | null> {
    const newDrink: DynamicDrink = {
      ...drink,
      id: `drink_${Date.now()}`,
      isAvailable: true,
    };

    const { data, error } = await supabase
      .from("menu_drinks")
      .insert([newDrink])
      .select()
      .single();

    if (error) {
      console.error("Error adding drink:", error);
      return null;
    }
    this.notify();
    return data;
  }

  async updateDrink(
    id: string,
    updates: Partial<DynamicDrink>,
  ): Promise<boolean> {
    const { error } = await supabase
      .from("menu_drinks")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Error updating drink:", error);
      return false;
    }
    this.notify();
    return true;
  }

  async deleteDrink(id: string): Promise<boolean> {
    const { error } = await supabase.from("menu_drinks").delete().eq("id", id);

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
      .from("menu_toppings")
      .select("*")
      .eq("is_available", true);

    if (error) {
      console.error("Error fetching toppings:", error);
      return [];
    }
    return data || [];
  }

  async getToppingPrice(toppingName: string): Promise<number> {
    const toppings = await this.getToppings();
    const topping = toppings.find((t) => t.name === toppingName);
    return topping?.price || 0;
  }

  async addTopping(topping: Omit<Topping, "id">): Promise<Topping | null> {
    const newTopping: Topping = {
      ...topping,
      id: `top_${Date.now()}`,
      isAvailable: true,
    };

    const { data, error } = await supabase
      .from("menu_toppings")
      .insert([newTopping])
      .select()
      .single();

    if (error) {
      console.error("Error adding topping:", error);
      return null;
    }
    this.notify();
    return data;
  }

  async updateTopping(id: string, updates: Partial<Topping>): Promise<boolean> {
    const { error } = await supabase
      .from("menu_toppings")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Error updating topping:", error);
      return false;
    }
    this.notify();
    return true;
  }

  async deleteTopping(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("menu_toppings")
      .delete()
      .eq("id", id);

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
      .from("menu_sugar_levels")
      .select("*")
      .eq("is_available", true);

    if (error) {
      console.error("Error fetching sugar levels:", error);
      return [];
    }
    return data || [];
  }

  async addSugarLevel(
    level: Omit<SugarLevel, "id">,
  ): Promise<SugarLevel | null> {
    const newLevel: SugarLevel = {
      ...level,
      id: `sugar_${Date.now()}`,
      isAvailable: true,
    };

    const { data, error } = await supabase
      .from("menu_sugar_levels")
      .insert([newLevel])
      .select()
      .single();

    if (error) {
      console.error("Error adding sugar level:", error);
      return null;
    }
    this.notify();
    return data;
  }

  async updateSugarLevel(
    id: string,
    updates: Partial<SugarLevel>,
  ): Promise<boolean> {
    const { error } = await supabase
      .from("menu_sugar_levels")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Error updating sugar level:", error);
      return false;
    }
    this.notify();
    return true;
  }

  async deleteSugarLevel(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("menu_sugar_levels")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting sugar level:", error);
      return false;
    }
    this.notify();
    return true;
  }
}

export const dynamicMenu = DynamicMenuService.getInstance();
