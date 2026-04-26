import supabase from "../lib/supabaseClient";

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

class DynamicMenuService {
  private static instance: DynamicMenuService;

  private constructor() {}

  static getInstance(): DynamicMenuService {
    if (!DynamicMenuService.instance) {
      DynamicMenuService.instance = new DynamicMenuService();
    }
    return DynamicMenuService.instance;
  }

  async getCategories(): Promise<DynamicCategory[]> {
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
    return data || [];
  }

  async addCategory(category: { label: string; description: string }): Promise<DynamicCategory | null> {
    const categories = await this.getCategories();
    const newCategory: DynamicCategory = {
      id: `cat_${Date.now()}`,
      label: category.label,
      description: category.description,
      drinkIds: [],
      displayOrder: categories.length + 1,
      isActive: true,
    };
    
    const { data, error } = await supabase
      .from('menu_categories')
      .insert([newCategory])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding category:', error);
      return null;
    }
    return data;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('menu_categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting category:', error);
      return false;
    }
    return true;
  }

  async getDrinksByCategory(categoryId: string): Promise<DynamicDrink[]> {
    const { data, error } = await supabase
      .from('menu_drinks')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_available', true);
    
    if (error) {
      console.error('Error fetching drinks:', error);
      return [];
    }
    return data || [];
  }

  async getAllDrinks(): Promise<DynamicDrink[]> {
    const { data, error } = await supabase
      .from('menu_drinks')
      .select('*')
      .eq('is_available', true);
    
    if (error) {
      console.error('Error fetching drinks:', error);
      return [];
    }
    return data || [];
  }

  async addDrink(drink: Omit<DynamicDrink, 'id'>): Promise<DynamicDrink | null> {
    const newDrink: DynamicDrink = {
      ...drink,
      id: `drink_${Date.now()}`,
      isAvailable: true,
    };
    
    const { data, error } = await supabase
      .from('menu_drinks')
      .insert([newDrink])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding drink:', error);
      return null;
    }
    return data;
  }

  async deleteDrink(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('menu_drinks')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting drink:', error);
      return false;
    }
    return true;
  }

  async getToppings(): Promise<Topping[]> {
    const { data, error } = await supabase
      .from('menu_toppings')
      .select('*')
      .eq('is_available', true);
    
    if (error) {
      console.error('Error fetching toppings:', error);
      return [];
    }
    return data || [];
  }

  async getToppingPrice(toppingName: string): Promise<number> {
    const toppings = await this.getToppings();
    const topping = toppings.find(t => t.name === toppingName);
    return topping?.price || 0;
  }

  async getSugarLevels(): Promise<SugarLevel[]> {
    const { data, error } = await supabase
      .from('menu_sugar_levels')
      .select('*')
      .eq('is_available', true);
    
    if (error) {
      console.error('Error fetching sugar levels:', error);
      return [];
    }
    return data || [];
  }
}

export const dynamicMenu = DynamicMenuService.getInstance();