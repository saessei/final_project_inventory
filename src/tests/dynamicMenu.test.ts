import { describe, it, expect, afterAll } from "vitest";
import { supabaseAdmin } from "@/tests/supabaseTestClient";
import { dynamicMenu } from "@/services/DynamicMenuService";

describe("DynamicMenuService (integration, real Supabase DB)", () => {
  const testRunId = `vitest-dynamicMenu-${Date.now()}`;

  const createdDrinkIds: string[] = [];
  const createdToppingIds: string[] = [];
  const createdSugarLevelIds: string[] = [];

  afterAll(async () => {
    // Delete children first (if FK constraints exist)
    if (createdDrinkIds.length) {
      await supabaseAdmin
        .from("drink_toppings")
        .delete()
        .in("drink_id", createdDrinkIds);
      await supabaseAdmin
        .from("drink_sizes")
        .delete()
        .in("drink_id", createdDrinkIds);
      await supabaseAdmin.from("drinks").delete().in("id", createdDrinkIds);
    }
    if (createdToppingIds.length) {
      await supabaseAdmin
        .from("default_toppings")
        .delete()
        .in("id", createdToppingIds);
    }
    if (createdSugarLevelIds.length) {
      await supabaseAdmin
        .from("sugar_levels")
        .delete()
        .in("id", createdSugarLevelIds);
    }
  });

  it("creates a drink, reads it back, marks it unavailable, then deletes it", async () => {
    const drink = await dynamicMenu.addDrink(
      {
        type: "milk-tea",
        name: `Drink (${testRunId})`,
        description: `Drink Desc (${testRunId})`,
        price: 123,
        image: "https://example.com/test.png",
        categoryId: "",
        availableToppings: [],
        availableSugarLevels: [],
        isAvailable: true,
      },
      supabaseAdmin,
    );

    expect(drink).not.toBeNull();
    createdDrinkIds.push(drink!.id);

    const all = await dynamicMenu.getAllDrinks(supabaseAdmin);
    const found = all.find((d) => d.id === drink!.id);
    expect(found).toBeDefined();
    expect(found!.price).toBe(123);

    const ok = await dynamicMenu.updateDrink(
      drink!.id,
      { isAvailable: false },
      supabaseAdmin,
    );
    expect(ok).toBe(true);

    // getAllDrinks only returns is_available=true, so it should disappear
    const afterUnavailable = await dynamicMenu.getAllDrinks(supabaseAdmin);
    expect(afterUnavailable.some((d) => d.id === drink!.id)).toBe(false);

    const deleted = await dynamicMenu.deleteDrink(drink!.id, supabaseAdmin);
    expect(deleted).toBe(true);

    // Remove from cleanup list since it's already deleted
    createdDrinkIds.splice(createdDrinkIds.indexOf(drink!.id), 1);
  }, 20000);

  it("creates, updates, reads, and deletes a topping (including pricing lookup)", async () => {
    const toppingName = `Topping (${testRunId})`;

    const topping = await dynamicMenu.addTopping(
      {
        name: toppingName,
        price: 9.5,
        isAvailable: true,
      },
      supabaseAdmin,
    );

    expect(topping).not.toBeNull();
    createdToppingIds.push(topping!.id);

    const toppings = await dynamicMenu.getToppings(supabaseAdmin);
    expect(toppings.some((t) => t.id === topping!.id)).toBe(true);

    const price = await dynamicMenu.getToppingPrice(toppingName, supabaseAdmin);
    expect(price).toBeGreaterThan(0);

    const updateOk = await dynamicMenu.updateTopping(
      topping!.id,
      { price: 12.75 },
      supabaseAdmin,
    );
    expect(updateOk).toBe(true);

    const updatedPrice = await dynamicMenu.getToppingPrice(
      toppingName,
      supabaseAdmin,
    );
    expect(updatedPrice).toBeCloseTo(12.75, 5);

    const deleted = await dynamicMenu.deleteTopping(topping!.id, supabaseAdmin);
    expect(deleted).toBe(true);

    createdToppingIds.splice(createdToppingIds.indexOf(topping!.id), 1);
  }, 20000);

  it("creates, updates, lists, and deletes a sugar level", async () => {
    const candidatePercentages = [13, 17, 23, 37, 42, 58, 63, 67, 88, 93];
    let sugar = null as Awaited<ReturnType<typeof dynamicMenu.addSugarLevel>>;

    for (const percentage of candidatePercentages) {
      sugar = await dynamicMenu.addSugarLevel(
        {
          label: `Sugar ${percentage}% (${testRunId})`,
          percentage,
          isAvailable: true,
        },
        supabaseAdmin,
      );
      if (sugar) break;
    }

    expect(sugar).not.toBeNull();
    createdSugarLevelIds.push(sugar!.id);

    const sugars = await dynamicMenu.getSugarLevels(supabaseAdmin);
    expect(sugars.some((s) => s.id === sugar!.id)).toBe(true);

    const sugarUpdateOk = await dynamicMenu.updateSugarLevel(
      sugar!.id,
      { label: `Sugar Updated (${testRunId})` },
      supabaseAdmin,
    );
    expect(sugarUpdateOk).toBe(true);

    const after = await dynamicMenu.getSugarLevels(supabaseAdmin);
    const updatedSugar = after.find((s) => s.id === sugar!.id);
    expect(updatedSugar).toBeDefined();
    expect(updatedSugar!.label).toContain("Updated");

    const deleted = await dynamicMenu.deleteSugarLevel(
      sugar!.id,
      supabaseAdmin,
    );
    expect(deleted).toBe(true);
    createdSugarLevelIds.splice(createdSugarLevelIds.indexOf(sugar!.id), 1);
  }, 20000);
});
