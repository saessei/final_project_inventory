import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { drinkService } from "../services/drinkService";
import { supabaseAdmin } from "../lib/supabaseTestClient";

describe("DrinkService Integration Test", () => {
  let testToppingId: string;
  let testDrinkId: string;

  // Cleanup helper to keep the test DB clean
  const cleanup = async () => {
    if (testDrinkId) {
      await supabaseAdmin.from("drinks").delete().eq("id", testDrinkId);
    }
    if (testToppingId) {
      await supabaseAdmin.from("default_toppings").delete().eq("id", testToppingId);
    }
  };

  beforeAll(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
  });

  it("creates a topping and lists it via getAllToppings", async () => {
    const toppingName = `Test Topping ${Date.now()}`;
    
    // Inject supabaseAdmin to bypass RLS 42501
    const created = await drinkService.addTopping(toppingName, 10, supabaseAdmin);
    expect(created).toBe(true);

    const toppings = await drinkService.getAllToppings(supabaseAdmin);
    const found = toppings.find((t) => t.name === toppingName);
    
    expect(found).toBeDefined();
    if (found) testToppingId = found.id;
  });

  it("creates a drink with sizes + topping, reads it back, updates it, then deletes it", async () => {
    const drinkName = `Test Drink ${Date.now()}`;
    const drinkData = {
      name: drinkName,
      description: "A refreshing test drink",
      image_url: "http://example.com/test.jpg",
    };
    const sizes = { regular: 50, medium: 65, large: 80 };

    // 1. Create
    const created = await drinkService.createDrink(
      drinkData,
      sizes,
      [testToppingId],
      supabaseAdmin // Bypass RLS
    );
    expect(created).toBe(true);

    // 2. Read Back & Verify
    const allDrinks = await drinkService.getAllDrinks(supabaseAdmin);
    const foundDrink = allDrinks.find((d) => d.name === drinkName);
    expect(foundDrink).toBeDefined();
    testDrinkId = foundDrink!.id;

    expect(foundDrink?.sizes.medium).toBe(65);
    expect(foundDrink?.available_toppings.some(t => t.id === testToppingId)).toBe(true);

    // 3. Update
    const updated = await drinkService.updateDrink(
      testDrinkId,
      { name: drinkName + " Updated" },
      { regular: 55, medium: 70, large: 85 },
      [], // Remove toppings
      supabaseAdmin
    );
    expect(updated).toBe(true);

    // 4. Delete
    const deleted = await drinkService.deleteDrink(testDrinkId, supabaseAdmin);
    expect(deleted).toBe(true);
    testDrinkId = ""; // Reset for cleanup
  });
});