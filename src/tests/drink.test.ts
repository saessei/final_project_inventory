import { describe, it, expect, afterAll, beforeAll } from "vitest";
import supabase from "../lib/supabaseClient";
import { drinkService } from "../services/DrinkService";
import { supabaseAdmin } from "../lib/supabaseTestClient";

type DrinkRow = {
	id: string;
	name: string;
	description: string;
	image_url: string;
	is_available: boolean;
};

type ToppingRow = {
	id: string;
	name: string;
	price: number;
	is_available: boolean;
};

describe("DrinkService Integration Test", () => {
	const testRunId = `vitest-drink-service-${Date.now()}`;
	const tempEmail = `drink-svc-${testRunId}@example.com`;
	const tempPassword = "Password123!";

	let userId: string | undefined;
	const createdToppingIds: string[] = [];
	const createdDrinkIds: string[] = [];

	beforeAll(async () => {
		// Keep client auth state clean between test runs
		try {
			await supabase.auth.signOut();
		} catch {
			// ignore
		}
		try {
			localStorage.clear();
		} catch {
			// ignore
		}

		const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
			email: tempEmail,
			password: tempPassword,
			email_confirm: true,
		});

		if (adminError) throw adminError;
		userId = adminData.user?.id;
		expect(userId).toBeTruthy();

		const { error: signInError } = await supabase.auth.signInWithPassword({
			email: tempEmail,
			password: tempPassword,
		});

		if (signInError) throw signInError;
	});

	afterAll(async () => {
		// Clean up DB rows first (in case FK constraints exist)
		if (createdDrinkIds.length) {
			await supabaseAdmin.from("drink_toppings").delete().in("drink_id", createdDrinkIds);
			await supabaseAdmin.from("drink_sizes").delete().in("drink_id", createdDrinkIds);
			await supabaseAdmin.from("drinks").delete().in("id", createdDrinkIds);
		} else {
			// fallback cleanup by name prefix
			await supabaseAdmin.from("drink_toppings").delete().like("drink_id", `%${testRunId}%`);
			await supabaseAdmin.from("drink_sizes").delete().like("drink_id", `%${testRunId}%`);
			await supabaseAdmin.from("drinks").delete().like("name", `%${testRunId}%`);
		}

		if (createdToppingIds.length) {
			await supabaseAdmin.from("default_toppings").delete().in("id", createdToppingIds);
		} else {
			await supabaseAdmin.from("default_toppings").delete().like("name", `%${testRunId}%`);
		}

		try {
			await supabase.auth.signOut();
		} catch {
			// ignore
		}

		if (userId) {
			await supabaseAdmin.auth.admin.deleteUser(userId);
		}
	});

	it("creates a topping and lists it via getAllToppings", async () => {
		const toppingName = `Pearl (${testRunId})`;

		const created = await drinkService.addTopping(toppingName, 10);
		expect(created).toBe(true);

		// Fetch ID for cleanup + later linking
		const { data: toppingRow, error } = await supabaseAdmin
			.from("default_toppings")
			.select("id, name, price, is_available")
			.eq("name", toppingName)
			.maybeSingle<ToppingRow>();

		expect(error).toBeNull();
		expect(toppingRow?.id).toBeTruthy();
		if (toppingRow?.id) createdToppingIds.push(toppingRow.id);

		const toppings = await drinkService.getAllToppings();
		const found = toppings.find((t) => t.name === toppingName);
		expect(found).toBeTruthy();
		expect(found?.price).toBe(10);
	});

	it("creates a drink with sizes + topping, reads it back, updates it, then deletes it", async () => {
		const toppingName = `Pudding (${testRunId})`;

		const toppingCreated = await drinkService.addTopping(toppingName, 12);
		expect(toppingCreated).toBe(true);

		const { data: toppingRow, error: toppingErr } = await supabaseAdmin
			.from("default_toppings")
			.select("id, name")
			.eq("name", toppingName)
			.single<{ id: string; name: string }>();

		expect(toppingErr).toBeNull();
		const toppingId = toppingRow?.id;
		expect(toppingId).toBeTruthy();
		if (!toppingId) {
			throw new Error("Expected topping row to be created");
		}
		createdToppingIds.push(toppingId);

		const drinkName = `Honey Milk Tea (${testRunId})`;
		const created = await drinkService.createDrink(
			{
				name: drinkName,
				description: "Initial description",
				image_url: "",
			},
			{ regular: 85, medium: 95, large: 110 },
			[toppingId],
		);

		expect(created).toBe(true);

		const { data: drinkRow, error: drinkErr } = await supabaseAdmin
			.from("drinks")
			.select("id, name, description, image_url, is_available")
			.eq("name", drinkName)
			.maybeSingle<DrinkRow>();

		expect(drinkErr).toBeNull();
		const drinkId = drinkRow?.id;
		expect(drinkId).toBeTruthy();
		if (!drinkId) {
			throw new Error("Expected drink row to be created");
		}
		createdDrinkIds.push(drinkId);

		const drinks = await drinkService.getAllDrinks();
		const found = drinks.find((d) => d.id === drinkId);
		expect(found).toBeTruthy();
		expect(found?.name).toBe(drinkName);
		expect(found?.sizes.regular).toBe(85);
		expect(found?.available_toppings.map((t) => t.id)).toContain(toppingId);

		const updated = await drinkService.updateDrink(
			drinkId,
			{ description: "Updated description" },
			{ regular: 90, medium: 100, large: 120 },
			[],
		);

		expect(updated).toBe(true);

		const afterUpdate = await drinkService.getAllDrinks();
		const updatedDrink = afterUpdate.find((d) => d.id === drinkId);
		expect(updatedDrink).toBeTruthy();
		expect(updatedDrink?.description).toBe("Updated description");
		expect(updatedDrink?.sizes.regular).toBe(90);

		// If toppings were cleared, it should not include the original topping anymore
		const toppingIds = updatedDrink?.available_toppings?.map((t) => t.id) ?? [];
		expect(toppingIds).not.toContain(toppingId);

		const deleted = await drinkService.deleteDrink(drinkId);
		expect(deleted).toBe(true);

		const { data: exists, error: existsErr } = await supabaseAdmin
			.from("drinks")
			.select("id")
			.eq("id", drinkId)
			.maybeSingle<{ id: string }>();

		expect(existsErr).toBeNull();
		expect(exists).toBeNull();
	});
});