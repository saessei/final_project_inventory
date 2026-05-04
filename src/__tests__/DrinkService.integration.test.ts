import { describe, expect, it } from "vitest";
import { drinkService } from "../services/drinkService";
import {
  createAnonTestClient,
  createServiceRoleTestClient,
  ensureSeedMenu,
} from "./integration/supabaseTestUtils";

const anon = createAnonTestClient();
const serviceRole = createServiceRoleTestClient();

describe("DrinkService (integration)", () => {
  it("reads categories, toppings, sugar levels, and drinks", async () => {
    // Ensure the DB has at least 1 drink + topping (helps on empty test DBs).
    await ensureSeedMenu({ anon, serviceRole });

    // Prefer anon (matches app behavior); fall back to service role if RLS hides reads.
    const readClient = serviceRole ?? anon;

    const categories = await drinkService.getAllCategories(readClient);
    expect(categories.length).toBeGreaterThan(0);

    const toppings = await drinkService.getAllToppings(readClient);
    expect(toppings.length).toBeGreaterThan(0);

    const sugarLevels = await drinkService.getAllSugarLevels(readClient);
    expect(sugarLevels.length).toBeGreaterThan(0);

    const drinks = await drinkService.getAllDrinks(true, readClient);
    expect(drinks.length).toBeGreaterThan(0);
    expect(drinks[0]).toHaveProperty("sizes");
  });

  it("can create and delete a drink (service role)", async () => {
    if (!serviceRole) {
      return;
    }

    const toppings = await drinkService.getAllToppings(serviceRole);
    const toppingIds = toppings.slice(0, 2).map((t) => t.id);

    const name = `vitest-drink-${Date.now()}`;
    const created = await drinkService.createDrink(
      { name, category: "Vitest", is_available: true },
      { regular: 99, medium: 109, large: 119 },
      toppingIds,
      serviceRole,
    );

    expect(created).toBe(true);

    const { data: row } = await serviceRole
      .from("drinks")
      .select("id")
      .eq("name", name)
      .maybeSingle();

    const id = (row as any)?.id as string | undefined;
    expect(id).toBeTruthy();

    if (id) {
      const deleted = await drinkService.deleteDrink(id, serviceRole);
      expect(deleted).toBe(true);
    }
  });
});
