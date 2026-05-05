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

//product interface 
export type DrinkModel = {
  id: string;
  name: string;
  category_id?: string | null;
  category?: string | null;
  is_available: boolean;
  sizes: DrinkSizeMap;
  available_toppings: ToppingModel[];
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

type DrinkRow = {
  id: string;
  name: string;
  category_id?: string | null;
  category?: { name?: string | null } | Array<{ name?: string | null }> | null;
  is_available?: boolean | null;
  sizes?: DrinkSizeRow[] | null;
  drink_toppings?: NestedToppingRow[] | null;
  created_at?: string | null;
};

// creator
export class DrinkFactory {
  static emptySizeMap(): DrinkSizeMap {
    return { regular: 0, medium: 0, large: 0 };
  }

  static createCategory(row: {
    id: string;
    name: string;
    is_active?: boolean | null;
  }): MenuCategoryModel {
    return {
      id: row.id,
      name: row.name,
      is_active: row.is_active ?? true,
    };
  }

  static createTopping(row: ToppingRow): ToppingModel {
    return {
      id: row.id,
      name: row.name,
      price: row.price ?? 0,
      is_available: row.is_available ?? true,
    };
  }

  static createSugarLevel(row: SugarLevelModel): SugarLevelModel {
    return {
      id: row.id,
      percentage: row.percentage,
      label: row.label,
      price_addition: row.price_addition ?? 0,
    };
  }

  static createSizeMap(rows: DrinkSizeRow[] | null | undefined): DrinkSizeMap {
    const sizeMap = DrinkFactory.emptySizeMap();

    rows?.forEach((row) => {
      if (row.size === "regular" || row.size === "medium" || row.size === "large") {
        sizeMap[row.size] = row.price;
      }
    });

    return sizeMap;
  }

  // concrete creator
  static createDrink(row: DrinkRow): DrinkModel {
    const category = Array.isArray(row.category)
      ? row.category[0]?.name
      : row.category?.name;

    const toppings =
      row.drink_toppings
        ?.map((drinkTopping) => {
          const topping = Array.isArray(drinkTopping.topping)
            ? drinkTopping.topping[0]
            : drinkTopping.topping;
          return topping ? DrinkFactory.createTopping(topping) : null;
        })
        .filter((topping): topping is ToppingModel => Boolean(topping)) ?? [];

    return {
      id: row.id,
      name: row.name,
      category_id: row.category_id,
      category: category ?? null,
      is_available: row.is_available ?? true,
      sizes: DrinkFactory.createSizeMap(row.sizes),
      available_toppings: toppings,
      created_at: row.created_at ?? "",
    };
  }
}
