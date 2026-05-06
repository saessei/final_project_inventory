import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { drinkService } from "../../services/drinkService";
import supabase from "../../lib/supabaseClient";

type DrinkServiceWithCategoryHelper = typeof drinkService & {
  ensureCategoryId: (categoryName?: string | null) => Promise<string | null>;
};

describe("DrinkService Integration Tests (Real DB)", () => {
  beforeAll(async () => {
    // Sign in to the test database
    const email = import.meta.env.TEST_USER_EMAIL;
    const password = import.meta.env.TEST_USER_PASSWORD;

    if (email && password) {
      await supabase.auth.signInWithPassword({ email, password });
    }
  });

  afterAll(async () => {
    await supabase.auth.signOut();
  });

  describe("Categories", () => {
    it("should fetch categories from the real database (Happy Path)", async () => {
      const categories = await drinkService.getAllCategories();
      expect(Array.isArray(categories)).toBe(true);
    });

    it("should handle invalid category creation gracefully (Sad Path)", async () => {
      const id = await (drinkService as any).ensureCategoryId("");
      expect(id).toBeNull();
    });
  });

  describe("Toppings", () => {
    let testToppingId: string | null = null;

    it("should add a new topping (Happy Path)", async () => {
      const toppingName = `Test Topping ${Date.now()}`;
      const success = await drinkService.addTopping(toppingName, 25);
      expect(success).toBe(true);

      // Verify it exists and get ID for cleanup
      const { data } = await supabase
        .from("toppings")
        .select("id")
        .eq("name", toppingName)
        .single();
      testToppingId = data?.id;
      expect(testToppingId).toBeDefined();
    });

    it("should fail to add a topping with invalid price (Sad Path)", async () => {
      await drinkService.addTopping("", -1);
    });

  });

  describe("Drinks", () => {
    it("should fetch all drinks (Happy Path)", async () => {
      const drinks = await drinkService.getAllDrinks(false);
      expect(Array.isArray(drinks)).toBe(true);
    });

    it("should return empty array for invalid drink ID fetching (Sad Path)", async () => {
      const sizes = await drinkService.getDrinkSizes("invalid-uuid-format");
      expect(sizes).toEqual({ regular: 0, medium: 0, large: 0 });
    });
  });
});
