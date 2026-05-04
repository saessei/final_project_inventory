import type { SupabaseClient } from "@supabase/supabase-js";
import supabase from "@/lib/supabaseClient";

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
  type: string;
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
  description?: string | null;
  image_url?: string | null;
  category_id?: string | null;
  is_available?: boolean | null;
};

type ToppingRow = {
  id: string;
  name: string;
  price?: number | null;
  is_available?: boolean | null;
};

type SugarLevelRow = {
  id: string;
  label: string;
  percentage?: number | null;
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

  private getClient(client?: SupabaseClient) {
    return client || supabase;
  }

  private async getRegularPrice(
    drinkId: string,
    client?: SupabaseClient,
  ): Promise<number> {
    const { data, error } = await this.getClient(client)
      .from("drink_sizes")
      .select("price")
      .eq("drink_id", drinkId)
      .eq("size", "regular")
      .maybeSingle();

    if (error) return 0;
    return (data?.price as number | null) ?? 0;
  }

  private async ensureCategoryId(
    categoryName?: string,
    client?: SupabaseClient,
  ): Promise<string | null> {
    const name = categoryName?.trim();
    if (!name) return null;

    const db = this.getClient(client);
    const { data: existing } = await db
      .from("categories")
      .select("id")
      .eq("name", name)
      .maybeSingle();

    if (existing?.id) return existing.id as string;

    const { data: created, error } = await db
      .from("categories")
      .insert({ name })
      .select("id")
      .single();

    if (error) return null;
    return created.id as string;
  }

  // Category Management
  async getCategories(client?: SupabaseClient): Promise<DynamicCategory[]> {
    const { data, error } = await this.getClient(client)
      .from("categories")
      .select("id, name, description, display_order, is_active, drinks(id)")
      .order("display_order", { ascending: true });

    if (error) return [];

    return (data || []).map((row: any) => ({
      id: row.id,
      label: row.name,
      description: row.description ?? "",
      drinkIds: (row.drinks || []).map((drink: { id: string }) => drink.id),
      isActive: row.is_active ?? true,
      displayOrder: row.display_order ?? 0,
    }));
  }

  async addCategory(
    category: { label: string; description: string },
    client?: SupabaseClient,
  ): Promise<DynamicCategory | null> {
    const { data, error } = await this.getClient(client)
      .from("categories")
      .insert({ name: category.label, description: category.description })
      .select("*")
      .single();

    if (error) return null;
    this.notify();
    return {
      id: data.id,
      label: data.name,
      description: data.description ?? "",
      drinkIds: [],
      isActive: data.is_active ?? true,
      displayOrder: data.display_order ?? 0,
    };
  }

  async updateCategory(
    id: string,
    data: Partial<DynamicCategory>,
    client?: SupabaseClient,
  ): Promise<boolean> {
    const updateRow: Record<string, unknown> = {};
    if (data.label !== undefined) updateRow.name = data.label;
    if (data.description !== undefined) updateRow.description = data.description;
    if (data.isActive !== undefined) updateRow.is_active = data.isActive;
    if (data.displayOrder !== undefined)
      updateRow.display_order = data.displayOrder;

    const { error } = await this.getClient(client)
      .from("categories")
      .update(updateRow)
      .eq("id", id);

    if (error) return false;
    this.notify();
    return true;
  }

  async deleteCategory(
    id: string,
    client?: SupabaseClient,
  ): Promise<boolean> {
    const { error } = await this.getClient(client)
      .from("categories")
      .delete()
      .eq("id", id);
    if (error) return false;
    this.notify();
    return true;
  }

  // Drink Management
  async getDrinksByCategory(
    _categoryId: string,
    client?: SupabaseClient,
  ): Promise<DynamicDrink[]> {
    // No category support in current schema; return all available drinks.
    return this.getAllDrinks(client);
  }

  async getAllDrinks(client?: SupabaseClient): Promise<DynamicDrink[]> {
    const { data, error } = await this.getClient(client)
      .from("drinks")
      .select("*")
      .eq("is_available", true)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching drinks:", error);
      return [];
    }

    const rows = data || [];
    const mapped = await Promise.all(
      (rows as DrinkRow[]).map(async (row) => {
        const regularPrice = await this.getRegularPrice(row.id, client);
        return {
          id: row.id,
          type: "",
          name: row.name,
          description: row.description ?? "",
          price: regularPrice,
          image: row.image_url ?? "",
          categoryId: row.category_id ?? "",
          availableToppings: [],
          availableSugarLevels: [],
          isAvailable: row.is_available ?? true,
        } satisfies DynamicDrink;
      }),
    );

    return mapped;
  }

  async addDrink(
    drink: Omit<DynamicDrink, "id">,
    client?: SupabaseClient,
  ): Promise<DynamicDrink | null> {
    const db = this.getClient(client);

    const { data: created, error: drinkError } = await db
      .from("drinks")
      .insert({
        category_id: await this.ensureCategoryId(drink.categoryId, client),
        name: drink.name,
        description: drink.description,
        image_url: drink.image,
        is_available: true,
      })
      .select("*")
      .single();

    if (drinkError) {
      console.error("Error adding drink:", drinkError);
      return null;
    }

    const drinkId = created.id as string;

    // Mirror the existing schema: prices live in drink_sizes
    const sizes = [
      { drink_id: drinkId, size: "regular", price: drink.price },
      { drink_id: drinkId, size: "medium", price: drink.price },
      { drink_id: drinkId, size: "large", price: drink.price },
    ];

    const { error: sizeError } = await db.from("drink_sizes").insert(sizes);
    if (sizeError) {
      console.error("Error adding drink sizes:", sizeError);
      // best-effort cleanup
      await db.from("drinks").delete().eq("id", drinkId);
      return null;
    }

    // Optional: if caller passed topping IDs, create join rows.
    if (
      Array.isArray(drink.availableToppings) &&
      drink.availableToppings.length
    ) {
      const joins = drink.availableToppings.map((toppingId) => ({
        drink_id: drinkId,
        topping_id: toppingId,
      }));
      await db.from("drink_toppings").insert(joins);
    }

    this.notify();
    return {
      id: drinkId,
      type: "",
      name: created.name,
      description: created.description ?? "",
      price: drink.price,
      image: created.image_url ?? "",
      categoryId: created.category_id ?? "",
      availableToppings: drink.availableToppings ?? [],
      availableSugarLevels: drink.availableSugarLevels ?? [],
      isAvailable: true,
    };
  }

  async updateDrink(
    id: string,
    data: Partial<DynamicDrink>,
    client?: SupabaseClient,
  ): Promise<boolean> {
    const db = this.getClient(client);

    const updateRow: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.name !== undefined) updateRow.name = data.name;
    if (data.description !== undefined)
      updateRow.description = data.description;
    if (data.image !== undefined) updateRow.image_url = data.image;
    if (data.isAvailable !== undefined)
      updateRow.is_available = data.isAvailable;

    const { error } = await db.from("drinks").update(updateRow).eq("id", id);
    if (error) {
      console.error("Error updating drink:", error);
      return false;
    }

    if (data.price !== undefined) {
      const { error: sizeError } = await db
        .from("drink_sizes")
        .update({ price: data.price })
        .eq("drink_id", id)
        .eq("size", "regular");
      if (sizeError) {
        console.error("Error updating drink size:", sizeError);
        return false;
      }
    }

    this.notify();
    return true;
  }

  async deleteDrink(id: string, client?: SupabaseClient): Promise<boolean> {
    const db = this.getClient(client);

    // Best-effort deletes of related rows
    await db.from("drink_toppings").delete().eq("drink_id", id);
    await db.from("drink_sizes").delete().eq("drink_id", id);

    const { error } = await db.from("drinks").delete().eq("id", id);
    if (error) {
      console.error("Error deleting drink:", error);
      return false;
    }

    this.notify();
    return true;
  }

  // Topping Management
  async getToppings(client?: SupabaseClient): Promise<Topping[]> {
    const { data, error } = await this.getClient(client)
      .from("toppings")
      .select("*")
      .eq("is_available", true)
      .order("name");

    if (error) {
      console.error("Error fetching toppings:", error);
      return [];
    }

    return ((data || []) as ToppingRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      price: row.price ?? 0,
      isAvailable: row.is_available ?? true,
    }));
  }

  async getToppingPrice(
    toppingName: string,
    client?: SupabaseClient,
  ): Promise<number> {
    const toppings = await this.getToppings(client);
    const topping = toppings.find((t) => t.name === toppingName);
    return topping?.price || 0;
  }

  async addTopping(
    topping: Omit<Topping, "id">,
    client?: SupabaseClient,
  ): Promise<Topping | null> {
    const { data, error } = await this.getClient(client)
      .from("toppings")
      .insert({ name: topping.name, price: topping.price })
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

  async updateTopping(
    id: string,
    data: Partial<Topping>,
    client?: SupabaseClient,
  ): Promise<boolean> {
    const updateRow: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (data.name !== undefined) updateRow.name = data.name;
    if (data.price !== undefined) updateRow.price = data.price;
    if (data.isAvailable !== undefined)
      updateRow.is_available = data.isAvailable;

    const { error } = await this.getClient(client)
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

  async deleteTopping(id: string, client?: SupabaseClient): Promise<boolean> {
    const { error } = await this.getClient(client)
      .from("toppings")
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
  async getSugarLevels(client?: SupabaseClient): Promise<SugarLevel[]> {
    const { data, error } = await this.getClient(client)
      .from("sugar_levels")
      .select("*")
      .order("percentage");

    if (error) {
      console.error("Error fetching sugar levels:", error);
      return [];
    }

    return ((data || []) as SugarLevelRow[]).map((row) => ({
      id: row.id,
      label: row.label,
      percentage: row.percentage ?? 0,
      isAvailable: true,
    }));
  }

  async addSugarLevel(
    level: Omit<SugarLevel, "id">,
    client?: SupabaseClient,
  ): Promise<SugarLevel | null> {
    const { data, error } = await this.getClient(client)
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
    data: Partial<SugarLevel>,
    client?: SupabaseClient,
  ): Promise<boolean> {
    const updateRow: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (data.label !== undefined) updateRow.label = data.label;
    if (data.percentage !== undefined) updateRow.percentage = data.percentage;

    const { error } = await this.getClient(client)
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

  async deleteSugarLevel(
    id: string,
    client?: SupabaseClient,
  ): Promise<boolean> {
    const { error } = await this.getClient(client)
      .from("sugar_levels")
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
