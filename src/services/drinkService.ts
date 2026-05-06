/* eslint-disable @typescript-eslint/no-explicit-any */
import supabase from "@/lib/supabaseClient";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DrinkFactory,                    // ← FACTORY: Creates objects from database rows
  type DrinkModel,
  type DrinkSizeMap,
  type MenuCategoryModel,
  type SugarLevelModel,
  type ToppingModel,
} from "@/patterns";

export type Drink = DrinkModel;
export type Topping = ToppingModel;
export type SugarLevel = SugarLevelModel;
export type MenuCategory = MenuCategoryModel;

// ============================================================
// SINGLETON + OBSERVER PATTERNS
// ============================================================
class DrinkService {
  // SINGLETON: Single instance storage
  private static instance: DrinkService;
  
  // OBSERVER: List of subscribers to notify
  private listeners: Set<() => void> = new Set();

  // SINGLETON: Private constructor prevents 'new DrinkService()'
  private constructor() {}

  // SINGLETON: Returns the one and only instance
  static getInstance(): DrinkService {
    if (!DrinkService.instance) {
      DrinkService.instance = new DrinkService();
    }
    return DrinkService.instance;
  }

  // OBSERVER: Subscribe to receive notifications
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // OBSERVER: Notify all subscribers of changes
  private notify(): void {
    this.listeners.forEach((callback) => callback());
  }

  // Helper: Gets database client
  private getClient(client?: SupabaseClient) {
    return client || supabase;
  }

  // Helper: Finds or creates category by name
  private async ensureCategoryId(
    categoryName?: string | null,
    client?: SupabaseClient,
  ): Promise<string | null> {
    const name = categoryName?.trim();
    if (!name) return null;

    const db = this.getClient(client);
    const { data: existing, error: findError } = await db
      .from("categories")
      .select("id")
      .eq("name", name)
      .maybeSingle();

    if (findError) {
      console.error("Error finding category:", findError);
      return null;
    }

    if (existing?.id) return existing.id as string;

    const { data: created, error: createError } = await db
      .from("categories")
      .insert({ name, is_active: true })
      .select("id")
      .single();

    if (createError) {
      console.error("Error creating category:", createError);
      return null;
    }

    return created.id as string;
  }

  // ============================================================
  // CATEGORY METHODS
  // ============================================================
  async getAllCategories(client?: SupabaseClient): Promise<MenuCategory[]> {
    const { data, error } = await this.getClient(client)
      .from("categories")
      .select("id, name, is_active")
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    // FACTORY: Converts raw rows to Category objects
    return (data || []).map(DrinkFactory.createCategory);
  }

  async deleteCategory(id: string, client?: SupabaseClient): Promise<boolean> {
    const db = this.getClient(client);

    const { error: detachError } = await db
      .from("drinks")
      .update({ category_id: null })
      .eq("category_id", id);

    if (detachError) {
      console.error("Error detaching drinks from category:", detachError);
      return false;
    }

    const { error } = await db.from("categories").delete().eq("id", id);

    if (error) {
      console.error("Error deleting category:", error);
      return false;
    }

    // OBSERVER: Notify subscribers that data changed
    this.notify();
    return true;
  }

  // ============================================================
  // TOPPING METHODS
  // ============================================================
  async getAllToppings(client?: SupabaseClient): Promise<Topping[]> {
    const { data, error } = await this.getClient(client)
      .from("toppings")
      .select("*")
      .eq("is_available", true)
      .order("name");

    if (error) {
      console.error("Error fetching toppings:", error);
      return [];
    }
    
    // FACTORY: Converts raw rows to Topping objects
    return (data || []).map(DrinkFactory.createTopping);
  }

  async addTopping(
    name: string,
    price: number,
    client?: SupabaseClient,
  ): Promise<boolean> {
    const { error } = await this.getClient(client)
      .from("toppings")
      .insert({ name, price });

    if (error) {
      console.error("Error adding topping:", error);
      return false;
    }
    
    // OBSERVER: Notify subscribers that data changed
    this.notify();
    return true;
  }

  async updateTopping(
    id: string,
    name: string,
    price: number,
    client?: SupabaseClient,
  ): Promise<boolean> {
    const { error } = await this.getClient(client)
      .from("toppings")
      .update({ name, price })
      .eq("id", id);

    if (error) {
      console.error("Error updating topping:", error);
      return false;
    }
    
    // OBSERVER: Notify subscribers that data changed
    this.notify();
    return true;
  }

  async deleteTopping(id: string, client?: SupabaseClient): Promise<boolean> {
    const { error } = await this.getClient(client)
      .from("toppings")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting topping:", error);
      return false;
    }
    
    // OBSERVER: Notify subscribers that data changed
    this.notify();
    return true;
  }

  // ============================================================
  // SUGAR LEVEL METHODS
  // ============================================================
  async getAllSugarLevels(client?: SupabaseClient): Promise<SugarLevel[]> {
    const { data, error } = await this.getClient(client)
      .from("sugar_levels")
      .select("*")
      .order("percentage");

    if (error) {
      console.error("Error fetching sugar levels:", error);
      return [];
    }
    
    // FACTORY: Converts raw rows to SugarLevel objects
    return (data || []).map(DrinkFactory.createSugarLevel);
  }

  async updateSugarLevel(
    id: string,
    price_addition: number,
    client?: SupabaseClient,
  ): Promise<boolean> {
    const { error } = await this.getClient(client)
      .from("sugar_levels")
      .update({ price_addition })
      .eq("id", id);

    if (error) {
      console.error("Error updating sugar level:", error);
      return false;
    }
    
    // OBSERVER: Notify subscribers that data changed
    this.notify();
    return true;
  }

  // ============================================================
  // DRINK METHODS
  // ============================================================
  async getAllDrinks(onlyAvailable: boolean = true, client?: SupabaseClient): Promise<Drink[]> {
    let query = this.getClient(client)
      .from("drinks")
      .select(`
        *,
        category:categories(name),
        sizes:drink_sizes(size, price),
        drink_toppings:drink_toppings(
          topping:toppings(*)
        )
      `);
    
    if (onlyAvailable) {
      query = query.eq("is_available", true);
    }

    const { data: drinks, error } = await query
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching drinks:", error);
      return [];
    }

    // FACTORY: Converts raw rows to Drink objects
    return (drinks || []).map((drink: any) => DrinkFactory.createDrink(drink));
  }

  async getDrinkSizes(
    drinkId: string,
    client?: SupabaseClient,  
  ): Promise<DrinkSizeMap> {
    const { data, error } = await this.getClient(client)
      .from("drink_sizes")
      .select("size, price")
      .eq("drink_id", drinkId);

    if (error) {
      console.error("Error fetching sizes:", error);
      return DrinkFactory.emptySizeMap();
    }

    // FACTORY: Converts size array to size object
    return DrinkFactory.createSizeMap(data || []);
  }

  async getDrinkToppings(
    drinkId: string,
    client?: SupabaseClient,
  ): Promise<Topping[]> {
    const { data, error } = await this.getClient(client)
      .from("drink_toppings")
      .select(`topping:toppings(*)`)
      .eq("drink_id", drinkId);

    if (error) {
      console.error("Error fetching drink toppings:", error);
      return [];
    }

    if (!data) return [];

    return data
      .map((item: any) => {
        const toppingData = Array.isArray(item.topping)
          ? item.topping[0]
          : item.topping;
        if (!toppingData) return null;

        // FACTORY: Converts raw topping row to Topping object
        return DrinkFactory.createTopping(toppingData);
      })
      .filter(Boolean) as Topping[];
  }

  async createDrink(
    drink: { name: string; category?: string; is_available?: boolean },
    sizes: { regular: number; medium: number; large: number },
    toppingIds: string[],
    client?: SupabaseClient,
  ): Promise<boolean> {
    const db = this.getClient(client);
    const categoryId = await this.ensureCategoryId(drink.category, client);

    // 1. Insert drink
    const { data: drinkData, error: drinkError } = await db
      .from("drinks")
      .insert({
        category_id: categoryId,
        name: drink.name,
        is_available: drink.is_available ?? true,
      })
      .select()
      .single();

    if (drinkError) {
      console.error("Error creating drink:", drinkError);
      return false;
    }

    // 2. Insert sizes
    const sizeInserts = [
      { drink_id: drinkData.id, size: "regular", price: sizes.regular },
      { drink_id: drinkData.id, size: "medium", price: sizes.medium },
      { drink_id: drinkData.id, size: "large", price: sizes.large },
    ];

    const { error: sizeError } = await db
      .from("drink_sizes")
      .insert(sizeInserts);
    if (sizeError) {
      console.error("Error inserting sizes:", sizeError);
      return false;
    }

    // 3. Insert toppings
    if (toppingIds.length > 0) {
      const toppingInserts = toppingIds.map((toppingId) => ({
        drink_id: drinkData.id,
        topping_id: toppingId,
      }));
      const { error: toppingError } = await db
        .from("drink_toppings")
        .insert(toppingInserts);
      if (toppingError) {
        console.error("Error inserting toppings:", toppingError);
      }
    }

    // OBSERVER: Notify subscribers that data changed
    this.notify();
    return true;
  }

  async updateDrink(
    drinkId: string,
    updates: { name?: string; category?: string | null; is_available?: boolean },
    sizes?: { regular: number; medium: number; large: number },
    toppingIds?: string[],
    client?: SupabaseClient,
  ): Promise<boolean> {
    const db = this.getClient(client);
    const updateRow = { ...updates } as Record<string, unknown>;
    if ("category" in updates) {
      updateRow.category_id = await this.ensureCategoryId(
        updates.category,
        client,
      );
      delete updateRow.category;
    }

    // 1. Update drink
    const { error: drinkError } = await db
      .from("drinks")
      .update(updateRow)
      .eq("id", drinkId);

    if (drinkError) {
      console.error("Error updating drink:", drinkError);
      return false;
    }

    // 2. Update sizes
    if (sizes) {
      for (const [size, price] of Object.entries(sizes)) {
        await db
          .from("drink_sizes")
          .update({ price })
          .eq("drink_id", drinkId)
          .eq("size", size);
      }
    }

    // 3. Update toppings (delete existing, insert new)
    if (toppingIds !== undefined) {
      await db.from("drink_toppings").delete().eq("drink_id", drinkId);

      if (toppingIds.length > 0) {
        const toppingInserts = toppingIds.map((toppingId) => ({
          drink_id: drinkId,
          topping_id: toppingId,
        }));
        await db.from("drink_toppings").insert(toppingInserts);
      }
    }

    // OBSERVER: Notify subscribers that data changed
    this.notify();
    return true;
  }

  async deleteDrink(
    drinkId: string,
    client?: SupabaseClient,
  ): Promise<boolean> {
    const { error } = await this.getClient(client)
      .from("drinks")
      .delete()
      .eq("id", drinkId);

    if (error) {
      console.error("Error deleting drink:", error);
      return false;
    }
    
    // OBSERVER: Notify subscribers that data changed
    this.notify();
    return true;
  }
}

// SINGLETON: Export the single instance for the whole app to use
export const drinkService = DrinkService.getInstance();
