/* eslint-disable @typescript-eslint/no-explicit-any */
import supabase from "../lib/supabaseClient";

export interface Drink {
  id: string;
  name: string;
  description: string;
  image_url: string;
  is_available: boolean;
  sizes: {
    regular: number;
    medium: number;
    large: number;
  };
  available_toppings: Topping[];
  created_at: string;
}

export interface Topping {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
}

export interface SugarLevel {
  id: string;
  percentage: number;
  label: string;
  price_addition: number;
}

class DrinkService {
  private static instance: DrinkService;
  private listeners: Set<() => void> = new Set();

  private constructor() {}

  static getInstance(): DrinkService {
    if (!DrinkService.instance) {
      DrinkService.instance = new DrinkService();
    }
    return DrinkService.instance;
  }

  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify(): void {
    this.listeners.forEach(callback => callback());
  }

  // ============ TOPPINGS ============
  async getAllToppings(): Promise<Topping[]> {
    const { data, error } = await supabase
      .from("default_toppings")
      .select("*")
      .eq("is_available", true)
      .order("name");

    if (error) {
      console.error("Error fetching toppings:", error);
      return [];
    }
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      price: item.price ?? 0,
      is_available: item.is_available,
    }));
  }

  async addTopping(name: string, price: number): Promise<boolean> {
    const { error } = await supabase
      .from("default_toppings")
      .insert({ name, price });

    if (error) {
      console.error("Error adding topping:", error);
      return false;
    }
    this.notify();
    return true;
  }

  async updateTopping(id: string, name: string, price: number): Promise<boolean> {
    const { error } = await supabase
      .from("default_toppings")
      .update({ name, price })
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
      .from("default_toppings")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting topping:", error);
      return false;
    }
    this.notify();
    return true;
  }

  // ============ SUGAR LEVELS ============
  async getAllSugarLevels(): Promise<SugarLevel[]> {
    const { data, error } = await supabase
      .from("sugar_levels")
      .select("*")
      .order("percentage");

    if (error) {
      console.error("Error fetching sugar levels:", error);
      return [];
    }
    return data || [];
  }

  async updateSugarLevel(id: string, price_addition: number): Promise<boolean> {
    const { error } = await supabase
      .from("sugar_levels")
      .update({ price_addition })
      .eq("id", id);

    if (error) {
      console.error("Error updating sugar level:", error);
      return false;
    }
    this.notify();
    return true;
  }

  // ============ DRINKS ============
  async getAllDrinks(): Promise<Drink[]> {
    const { data: drinks, error } = await supabase
      .from("drinks")
      .select("*")
      .eq("is_available", true)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching drinks:", error);
      return [];
    }

    const drinksWithDetails = await Promise.all(
      (drinks || []).map(async (drink) => ({
        ...drink,
        sizes: await this.getDrinkSizes(drink.id),
        available_toppings: await this.getDrinkToppings(drink.id),
      }))
    );

    return drinksWithDetails;
  }

  async getDrinkSizes(drinkId: string): Promise<{ regular: number; medium: number; large: number }> {
    const { data, error } = await supabase
      .from("drink_sizes")
      .select("size, price")
      .eq("drink_id", drinkId);

    if (error) {
      console.error("Error fetching sizes:", error);
      return { regular: 0, medium: 0, large: 0 };
    }

    const result = { regular: 0, medium: 0, large: 0 };
    (data || []).forEach((item: { size: string; price: number }) => {
    result[item.size as keyof typeof result] = item.price;
    });
    return result;
  }

    async getDrinkToppings(drinkId: string): Promise<Topping[]> {
    const { data, error } = await supabase
        .from("drink_toppings")
        .select(`
        topping:default_toppings(*)
        `)
        .eq("drink_id", drinkId);

    if (error) {
        console.error("Error fetching drink toppings:", error);
        return [];
    }

    if (!data) return [];

    return data.map((item: any) => {
        // Handle case where topping might be an array
        const toppingData = Array.isArray(item.topping) ? item.topping[0] : item.topping;
        
        if (!toppingData) return null;
        
        return {
        id: toppingData.id,
        name: toppingData.name,
        price: toppingData.price ?? 0,
        is_available: toppingData.is_available,
        };
    }).filter(Boolean) as Topping[];
    }

  async createDrink(
    drink: { name: string; description: string; image_url: string },
    sizes: { regular: number; medium: number; large: number },
    toppingIds: string[]
  ): Promise<boolean> {
    // Insert drink
    const { data: drinkData, error: drinkError } = await supabase
      .from("drinks")
      .insert({
        name: drink.name,
        description: drink.description,
        image_url: drink.image_url,
        is_available: true,
      })
      .select()
      .single();

    if (drinkError) {
      console.error("Error creating drink:", drinkError);
      return false;
    }

    // Insert sizes
    const sizeInserts = [
      { drink_id: drinkData.id, size: "regular", price: sizes.regular },
      { drink_id: drinkData.id, size: "medium", price: sizes.medium },
      { drink_id: drinkData.id, size: "large", price: sizes.large },
    ];

    const { error: sizeError } = await supabase.from("drink_sizes").insert(sizeInserts);
    if (sizeError) {
      console.error("Error inserting sizes:", sizeError);
      return false;
    }

    // Insert toppings
    if (toppingIds.length > 0) {
      const toppingInserts = toppingIds.map(toppingId => ({
        drink_id: drinkData.id,
        topping_id: toppingId,
      }));
      const { error: toppingError } = await supabase.from("drink_toppings").insert(toppingInserts);
      if (toppingError) {
        console.error("Error inserting toppings:", toppingError);
      }
    }

    this.notify();
    return true;
  }

  async updateDrink(
    drinkId: string,
    updates: { name?: string; description?: string; image_url?: string },
    sizes?: { regular: number; medium: number; large: number },
    toppingIds?: string[]
  ): Promise<boolean> {
    // Update drink
    const { error: drinkError } = await supabase
      .from("drinks")
      .update({ ...updates })
      .eq("id", drinkId);

    if (drinkError) {
      console.error("Error updating drink:", drinkError);
      return false;
    }

    // Update sizes
    if (sizes) {
      for (const [size, price] of Object.entries(sizes)) {
        await supabase
          .from("drink_sizes")
          .update({ price })
          .eq("drink_id", drinkId)
          .eq("size", size);
      }
    }

    // Update toppings (delete existing, insert new)
    if (toppingIds !== undefined) {
      await supabase.from("drink_toppings").delete().eq("drink_id", drinkId);
      
      if (toppingIds.length > 0) {
        const toppingInserts = toppingIds.map(toppingId => ({
          drink_id: drinkId,
          topping_id: toppingId,
        }));
        await supabase.from("drink_toppings").insert(toppingInserts);
      }
    }

    this.notify();
    return true;
  }

  async deleteDrink(drinkId: string): Promise<boolean> {
    const { error } = await supabase.from("drinks").delete().eq("id", drinkId);
    if (error) {
      console.error("Error deleting drink:", error);
      return false;
    }
    this.notify();
    return true;
  }
}

export const drinkService = DrinkService.getInstance();