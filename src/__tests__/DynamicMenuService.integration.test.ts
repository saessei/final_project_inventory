import { describe, expect, it } from "vitest";
import { dynamicMenu } from "@/services/dynamicMenuService";
import {
  createAnonTestClient,
  createServiceRoleTestClient,
  ensureSeedMenu,
} from "@/__tests__/integration/supabaseTestUtils";

const anon = createAnonTestClient();
const serviceRole = createServiceRoleTestClient();

describe("DynamicMenuService (integration)", () => {
  it("reads categories + drinks + toppings + sugar levels", async () => {
    await ensureSeedMenu({ anon, serviceRole });
    const readClient = serviceRole ?? anon;

    const cats = await dynamicMenu.getCategories(readClient);
    expect(Array.isArray(cats)).toBe(true);
    expect(cats.length).toBeGreaterThan(0);

    const drinks = await dynamicMenu.getAllDrinks(readClient);
    expect(drinks.length).toBeGreaterThan(0);

    const toppings = await dynamicMenu.getToppings(readClient);
    expect(toppings.length).toBeGreaterThan(0);

    const sugar = await dynamicMenu.getSugarLevels(readClient);
    expect(sugar.length).toBeGreaterThan(0);
  });

  it("can add/update/delete a category (service role)", async () => {
    if (!serviceRole) return;

    const created = await dynamicMenu.addCategory(
      { label: `Vitest ${Date.now()}`, description: "integration" },
      serviceRole,
    );

    expect(created).not.toBeNull();

    const categoryId = (created as any)?.id as string;
    expect(categoryId).toBeTruthy();

    const updated = await dynamicMenu.updateCategory(
      categoryId,
      { description: "updated", isActive: true },
      serviceRole,
    );

    expect(updated).toBe(true);

    const deleted = await dynamicMenu.deleteCategory(categoryId, serviceRole);
    expect(deleted).toBe(true);
  });
});
