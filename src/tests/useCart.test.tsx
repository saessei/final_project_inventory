import { afterAll, describe, expect, it } from "vitest";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import { useEffect } from "react";
import { useCart, type CartItem } from "../hooks/useCart";
import { supabaseAdmin, supabaseTest } from "../lib/supabaseTestClient";

type CartRow = {
  id: string;
  barista_user_id: string;
  status: "active" | "checked_out" | "abandoned";
};

type CartItemRow = Pick<
  CartItem,
  "id" | "cart_id" | "drink_id" | "drink_name" | "drink_price" | "sugar" | "toppings" | "quantity"
>;

describe("useCart (integration, real Supabase DB)", () => {
  const testRunId = `vitest-useCart-${Date.now()}`;
  const baristaUserId = crypto.randomUUID();
  let cartId: string | null = null;

  afterAll(async () => {
    if (cartId) {
      await supabaseAdmin.from("cart_items").delete().eq("cart_id", cartId);
      await supabaseAdmin.from("carts").delete().eq("id", cartId);
      return;
    }

    await supabaseAdmin.from("carts").delete().eq("barista_user_id", baristaUserId);
  });

  async function waitFor(predicate: () => boolean, timeoutMs = 10000) {
    const started = Date.now();

    while (!predicate()) {
      if (Date.now() - started > timeoutMs) {
        throw new Error("Timed out waiting for useCart state to settle");
      }

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });
    }
  }

  function mountHarness() {
    let latest: ReturnType<typeof useCart> | null = null;

    function Harness() {
      const cart = useCart(baristaUserId);

      useEffect(() => {
        latest = cart;
      }, [cart]);

      return null;
    }

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    return {
      render: async () => {
        await act(async () => {
          root.render(<Harness />);
        });
      },
      cleanup: async () => {
        await act(async () => {
          root.unmount();
        });
        container.remove();
      },
      getLatest: () => {
        if (!latest) {
          throw new Error("useCart hook did not initialize");
        }

        return latest;
      },
    };
  }

  it("creates and mutates a real cart through the hook", async () => {
    const harness = mountHarness();

    try {
      await harness.render();

      await waitFor(() => harness.getLatest().cartId !== null);
      cartId = harness.getLatest().cartId;
      expect(cartId).toBeTruthy();
      if (!cartId) {
        throw new Error("Cart ID was not created");
      }

      const activeCartId = cartId;

      const { data: createdCart, error: cartErr } = await supabaseTest
        .from("carts")
        .select("id, barista_user_id, status")
        .eq("id", activeCartId)
        .single<CartRow>();

      expect(cartErr).toBeNull();
      expect(createdCart).toBeTruthy();
      expect(createdCart!.barista_user_id).toBe(baristaUserId);
      expect(createdCart!.status).toBe("active");

      const baseItem = {
        drink_id: `drink-${testRunId}`,
        drink_name: `Hook Test Milk Tea (${testRunId})`,
        drink_price: 5.5,
        sugar: "75%",
        toppings: ["pearls"],
        quantity: 1,
      };

      await act(async () => {
        await harness.getLatest().upsertItem(baseItem);
      });

      await waitFor(
        () =>
          harness.getLatest().cart.length === 1 &&
          harness.getLatest().cart[0]?.quantity === 1,
      );

      const { data: items, error: itemsErr } = await supabaseTest
        .from("cart_items")
        .select(
          "id, cart_id, drink_id, drink_name, drink_price, sugar, toppings, quantity",
        )
        .eq("cart_id", activeCartId)
        .order("created_at", { ascending: true });

      expect(itemsErr).toBeNull();
      expect(items).toHaveLength(1);
      expect(items![0]).toMatchObject({
        cart_id: activeCartId,
        drink_id: baseItem.drink_id,
        drink_name: baseItem.drink_name,
        quantity: 1,
      } satisfies Partial<CartItemRow>);

      await act(async () => {
        await harness.getLatest().upsertItem(baseItem);
      });

      await waitFor(
        () =>
          harness.getLatest().cart.length === 1 &&
          harness.getLatest().cart[0]?.quantity === 2,
      ); 

      const { data: moreItems, error: moreItemsErr } = await supabaseTest
        .from("cart_items")
        .select(
          "id, cart_id, drink_id, drink_name, drink_price, sugar, toppings, quantity",
        )
        .eq("cart_id", activeCartId)
        .order("created_at", { ascending: true });

      expect(moreItemsErr).toBeNull();
      expect(moreItems).toHaveLength(1);
      expect(moreItems![0].quantity).toBe(2);

      await act(async () => {
        await harness.getLatest().incrementItemAtIndex(0);
      });

      await waitFor(() => harness.getLatest().cart[0]?.quantity === 3);

      await act(async () => {
        await harness.getLatest().decrementItemAtIndex(0);
      });

      await waitFor(() => harness.getLatest().cart[0]?.quantity === 2);

      await act(async () => {
        await harness.getLatest().removeItemAtIndex(0);
      });

      await waitFor(() => harness.getLatest().cart.length === 0);

      const { data: emptyItems, error: emptyItemsErr } = await supabaseTest
        .from("cart_items")
        .select("id")
        .eq("cart_id", activeCartId);

      expect(emptyItemsErr).toBeNull();
      expect(emptyItems).toHaveLength(0);

      await act(async () => {
        await harness.getLatest().upsertItem(baseItem);
        await harness.getLatest().upsertItem({
          ...baseItem,
          drink_id: `drink-${testRunId}-2`,
          drink_name: `Hook Test Taro (${testRunId})`,
          toppings: ["pudding"],
        });
      });

      await waitFor(() => harness.getLatest().cart.length === 2);

      await act(async () => {
        await harness.getLatest().clearCart();
      });

      await waitFor(() => harness.getLatest().cart.length === 0);

      const { data: clearedItems, error: clearedItemsErr } = await supabaseTest
        .from("cart_items")
        .select("id")
        .eq("cart_id", activeCartId);

      expect(clearedItemsErr).toBeNull();
      expect(clearedItems).toHaveLength(0);
    } finally {
      await harness.cleanup();
    }
  }, 20000);
});