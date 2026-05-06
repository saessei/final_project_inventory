// ============================================================
// PRODUCT INTERFACE (What all products must have)
// ============================================================

export type DrinkSizeMap = {
  regular: number;
  medium: number;
  large: number;
};

export type ToppingModel = {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
};

// ┌─────────────────────────────────────────────────────────────┐
// │  PRODUCT INTERFACE: Defines the shape of Drink objects      │
// │  Every drink created by the factory must match this         │
// └─────────────────────────────────────────────────────────────┘
export type DrinkModel = {
  id: string;
  name: string;
  category_id?: string | null;
  category?: string | null;
  is_available: boolean;
  sizes: DrinkSizeMap;                    // ← Complex type (converted from array)
  available_toppings: ToppingModel[];     // ← Nested data (extracted)
  created_at: string;
};

export type SugarLevelModel = {
  id: string;
  percentage: number;
  label: string;
  price_addition: number;
};

export type MenuCategoryModel = {
  id: string;
  name: string;
  is_active: boolean;
};

// ============================================================
// RAW INPUT TYPES (The messy database data)
// ============================================================

type DrinkSizeRow = {
  size: string;
  price: number;
};

type NestedToppingRow = {
  topping?: ToppingRow | ToppingRow[] | null;
};

type ToppingRow = {
  id: string;
  name: string;
  price?: number | null;
  is_available?: boolean | null;
};

// ┌─────────────────────────────────────────────────────────────┐
// │  RAW INPUT: The messy database structure                    │
// │  - sizes is an ARRAY, not an object                         │
// │  - toppings are deeply nested                               │
// │  - category can be array or object                          │
// └─────────────────────────────────────────────────────────────┘
type DrinkRow = {
  id: string;
  name: string;
  category_id?: string | null;
  category?: { name?: string | null } | Array<{ name?: string | null }> | null;
  is_available?: boolean | null;
  sizes?: DrinkSizeRow[] | null;           // ← Array format, not object
  drink_toppings?: NestedToppingRow[] | null;  // ← Deeply nested
  created_at?: string | null;
};

// ============================================================
// FACTORY CLASS (Creator)
// ============================================================

// ┌─────────────────────────────────────────────────────────────┐
// │  FACTORY CLASS: Contains all creation methods               │
// └─────────────────────────────────────────────────────────────┘
export class DrinkFactory {

  // ┌─────────────────────────────────────────────────────────────┐
  // │  HELPER METHOD: Creates empty size map                      │
  // │  Used as default/fallback                                   │
  // └─────────────────────────────────────────────────────────────┘
  static emptySizeMap(): DrinkSizeMap {
    return { regular: 0, medium: 0, large: 0 };
  }

  // ┌─────────────────────────────────────────────────────────────┐
  // │  CONCRETE CREATOR: Creates Category objects                 │
  // │  Input: Raw category row                                    │
  // │  Output: Clean CategoryModel                                │
  // └─────────────────────────────────────────────────────────────┘
  static createCategory(row: {
    id: string;
    name: string;
    is_active?: boolean | null;
  }): MenuCategoryModel {
    return {
      id: row.id,
      name: row.name,
      is_active: row.is_active ?? true,    // ← Default if missing
    };
  }

  // ┌─────────────────────────────────────────────────────────────┐
  // │  CONCRETE CREATOR: Creates Topping objects                  │
  // │  Input: Raw topping row                                     │
  // │  Output: Clean ToppingModel                                 │
  // └─────────────────────────────────────────────────────────────┘
  static createTopping(row: ToppingRow): ToppingModel {
    return {
      id: row.id,
      name: row.name,
      price: row.price ?? 0,               // ← Default 0 if missing
      is_available: row.is_available ?? true,  // ← Default true
    };
  }

  // ┌─────────────────────────────────────────────────────────────┐
  // │  CONCRETE CREATOR: Creates SugarLevel objects               │
  // │  Input: Raw sugar level row                                 │
  // │  Output: Clean SugarLevelModel                              │
  // └─────────────────────────────────────────────────────────────┘
  static createSugarLevel(row: SugarLevelModel): SugarLevelModel {
    return {
      id: row.id,
      percentage: row.percentage,
      label: row.label,
      price_addition: row.price_addition ?? 0,
    };
  }

  // ┌─────────────────────────────────────────────────────────────┐
  // │  HELPER METHOD: Converts size array to size object          │
  // │  Input: [{size:"regular", price:85}, ...]                   │
  // │  Output: { regular: 85, medium: 105, large: 125 }          │
  // └─────────────────────────────────────────────────────────────┘
  static createSizeMap(rows: DrinkSizeRow[] | null | undefined): DrinkSizeMap {
    const sizeMap = DrinkFactory.emptySizeMap();

    rows?.forEach((row) => {
      if (row.size === "regular" || row.size === "medium" || row.size === "large") {
        sizeMap[row.size] = row.price;
      }
    });

    return sizeMap;
  }

  // ┌─────────────────────────────────────────────────────────────┐
  // │  MAIN FACTORY METHOD (Concrete Creator)                     │
  // │  Creates the main product: DrinkModel                       │
  // │  Input: Raw database row (DrinkRow)                         │
  // │  Output: Clean product (DrinkModel)                         │
  // │                                                             │
  // │  This method:                                               │
  // │  1. Extracts category name from nested structure            │
  // │  2. Extracts toppings from nested structure                 │
  // │  3. Converts sizes array to object                          │
  // │  4. Returns clean, usable Drink object                      │
  // └─────────────────────────────────────────────────────────────┘
  static createDrink(row: DrinkRow): DrinkModel {
    // Step 1: Extract category name (handles array or object)
    const category = Array.isArray(row.category)
      ? row.category[0]?.name
      : row.category?.name;

    // Step 2: Extract and create toppings from nested structure
    const toppings =
      row.drink_toppings
        ?.map((drinkTopping) => {
          const topping = Array.isArray(drinkTopping.topping)
            ? drinkTopping.topping[0]
            : drinkTopping.topping;
          return topping ? DrinkFactory.createTopping(topping) : null;
        })
        .filter((topping): topping is ToppingModel => Boolean(topping)) ?? [];

    // Step 3: Return clean product
    return {
      id: row.id,
      name: row.name,
      category_id: row.category_id,
      category: category ?? null,
      is_available: row.is_available ?? true,
      sizes: DrinkFactory.createSizeMap(row.sizes),        // ← Convert array to object
      available_toppings: toppings,                        // ← Clean toppings list
      created_at: row.created_at ?? "",
    };
  }
}