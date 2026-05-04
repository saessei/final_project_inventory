import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const readEnv = (key: string): string | undefined => {
  // Vitest exposes Vite env vars on import.meta.env, but we also sync them to process.env in vitest.config.ts.
  return (import.meta as any)?.env?.[key] ?? process.env[key];
};

export const getRequiredEnv = (key: string): string => {
  const value = readEnv(key);
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

export const getOptionalEnv = (key: string): string | undefined => readEnv(key);

export const createAnonTestClient = (): SupabaseClient => {
  const url = getRequiredEnv("VITE_SUPABASE_URL");
  const anonKey = getRequiredEnv("VITE_SUPABASE_ANON_KEY");

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};

export const createServiceRoleTestClient = (): SupabaseClient | null => {
  const url = readEnv("VITE_SUPABASE_URL");
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) return null;

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};

export type TempAuthUser = {
  id: string;
  email: string;
  password: string;
};

export const createTempAuthUser = async (
  client: SupabaseClient,
  prefix = "vitest-profile",
): Promise<TempAuthUser> => {
  const email = `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
  const password = `Temp-${Math.random().toString(36).slice(2)}a1!`;

  const { data, error } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user?.id) {
    throw new Error(`Failed to create temp auth user: ${error?.message ?? "unknown"}`);
  }

  return { id: data.user.id, email, password };
};

export const deleteTempAuthUser = async (
  client: SupabaseClient,
  userId: string,
): Promise<void> => {
  const { error } = await client.auth.admin.deleteUser(userId);
  if (error) {
    throw new Error(`Failed to delete temp auth user: ${error.message}`);
  }
};

export const ensureProfileRow = async (
  client: SupabaseClient,
  userId: string,
  fullName: string,
): Promise<void> => {
  const { error } = await client
    .from("profiles")
    .upsert({ id: userId, full_name: fullName }, { onConflict: "id" });

  if (error) {
    throw new Error(`Failed to seed profile row: ${error.message}`);
  }
};

export const safeCleanupOrder = async (
  orderId: string,
  client: SupabaseClient,
): Promise<void> => {
  // Best-effort cleanup for the tables written by orderService.createOrder/updateOrderStatus.
  // Using service role for cleanup is recommended (RLS may block anon deletes).
  try {
    const { data: orderItems } = await client
      .from("order_items")
      .select("id")
      .eq("order_id", orderId);

    const orderItemIds = (orderItems || []).map((r: { id: string }) => r.id);
    if (orderItemIds.length) {
      await client
        .from("order_item_toppings")
        .delete()
        .in("order_item_id", orderItemIds);
    }

    await client.from("order_items").delete().eq("order_id", orderId);
    await client.from("payments").delete().eq("order_id", orderId);
    await client.from("order_status_history").delete().eq("order_id", orderId);
    await client.from("orders").delete().eq("id", orderId);
  } catch {
    // ignore cleanup errors
  }
};

export const pickSeedDrink = async (client: SupabaseClient) => {
  const { data, error } = await client
    .from("drinks")
    .select("id, name")
    .eq("is_available", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data?.id) {
    throw new Error(`Unable to pick a seed drink: ${error?.message ?? "no rows"}`);
  }

  return { id: data.id as string, name: data.name as string };
};

export const pickSeedTopping = async (client: SupabaseClient) => {
  const { data, error } = await client
    .from("toppings")
    .select("id, name, price")
    .eq("is_available", true)
    .order("name", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data?.id) {
    throw new Error(
      `Unable to pick a seed topping: ${error?.message ?? "no rows"}`,
    );
  }

  return {
    id: data.id as string,
    name: data.name as string,
    price: Number((data as any).price ?? 0),
  };
};

export const getRegularDrinkPrice = async (
  client: SupabaseClient,
  drinkId: string,
): Promise<number> => {
  const { data, error } = await client
    .from("drink_sizes")
    .select("price")
    .eq("drink_id", drinkId)
    .eq("size", "regular")
    .maybeSingle();

  if (error) return 0;
  return Number((data as any)?.price ?? 0);
};

type SeedMenuResult = {
  drink: { id: string; name: string; regularPrice: number };
  topping: { id: string; name: string; price: number };
  seeded: {
    categoryId?: string;
    drinkId?: string;
    toppingId?: string;
  };
};

const uniqueName = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const ensureSeedMenu = async (params: {
  anon: SupabaseClient;
  serviceRole?: SupabaseClient | null;
}): Promise<SeedMenuResult> => {
  const { anon, serviceRole } = params;

  const tryPick = async (
    client: SupabaseClient,
  ): Promise<SeedMenuResult | null> => {
    try {
      const drink = await pickSeedDrink(client);
      const topping = await pickSeedTopping(client);
      const regularPrice = await getRegularDrinkPrice(client, drink.id);
      return {
        drink: { ...drink, regularPrice },
        topping,
        seeded: {},
      };
    } catch {
      return null;
    }
  };

  const pickedAnon = await tryPick(anon);
  if (pickedAnon) return pickedAnon;

  if (serviceRole) {
    const pickedService = await tryPick(serviceRole);
    if (pickedService) return pickedService;

    // Seed minimal rows using service role.
    const categoryName = "Vitest";
    const { data: category } = await serviceRole
      .from("categories")
      .upsert({ name: categoryName, is_active: true }, { onConflict: "name" })
      .select("id")
      .single();

    const categoryId = (category as any)?.id as string | undefined;

    const toppingName = uniqueName("Vitest Topping");
    const { data: createdTopping, error: toppingError } = await serviceRole
      .from("toppings")
      .insert({ name: toppingName, price: 12, is_available: true })
      .select("id, name, price")
      .single();
    if (toppingError || !createdTopping?.id) {
      throw new Error(
        `Failed to seed topping: ${toppingError?.message ?? "unknown"}`,
      );
    }

    const drinkName = uniqueName("Vitest Drink");
    const { data: createdDrink, error: drinkError } = await serviceRole
      .from("drinks")
      .insert({
        name: drinkName,
        category_id: categoryId ?? null,
        is_available: true,
        description: "integration test seed",
      })
      .select("id, name")
      .single();

    if (drinkError || !createdDrink?.id) {
      throw new Error(
        `Failed to seed drink: ${drinkError?.message ?? "unknown"}`,
      );
    }

    const drinkId = createdDrink.id as string;
    const regularPrice = 99;
    const { error: sizeError } = await serviceRole.from("drink_sizes").insert([
      { drink_id: drinkId, size: "regular", price: regularPrice, is_available: true },
      { drink_id: drinkId, size: "medium", price: 109, is_available: true },
      { drink_id: drinkId, size: "large", price: 119, is_available: true },
    ]);
    if (sizeError) {
      throw new Error(`Failed to seed drink sizes: ${sizeError.message}`);
    }

    return {
      drink: { id: drinkId, name: createdDrink.name as string, regularPrice },
      topping: {
        id: createdTopping.id as string,
        name: createdTopping.name as string,
        price: Number((createdTopping as any).price ?? 0),
      },
      seeded: {
        categoryId,
        drinkId,
        toppingId: createdTopping.id as string,
      },
    };
  }

  throw new Error(
    "No readable seed menu rows (drinks/toppings). Seed your test DB or set SUPABASE_SERVICE_ROLE_KEY in .env.test so integration tests can self-seed.",
  );
};

export const cleanupSeedMenu = async (
  seeded: SeedMenuResult["seeded"],
  client: SupabaseClient,
): Promise<void> => {
  const drinkId = seeded.drinkId;
  const toppingId = seeded.toppingId;

  try {
    if (drinkId) {
      await client.from("drink_toppings").delete().eq("drink_id", drinkId);
      await client.from("drink_sizes").delete().eq("drink_id", drinkId);
      await client.from("drinks").delete().eq("id", drinkId);
    }
    if (toppingId) {
      await client.from("toppings").delete().eq("id", toppingId);
    }
  } catch {
    // ignore
  }
};
