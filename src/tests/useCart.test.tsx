import { beforeEach, describe, expect, it } from "vitest";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import { useEffect } from "react";
import { useCart } from "../hooks/useCart";
import  supabase from "../lib/supabaseClient";
import { clearDatabase } from "../utils/db";

describe("useCart Integration", () => {
  const baristaUserId = crypto.randomUUID();

  beforeEach(async () => {
    await clearDatabase();
  });

  async function waitFor(predicate: () => boolean, timeoutMs = 10000) {
    const started = Date.now();
    while (!predicate()) {
      if (Date.now() - started > timeoutMs) throw new Error("Timed out");
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });
    }
  }

  function mountHarness() {
    let latest: ReturnType<typeof useCart> | null = null;
    function Harness() {
      const cart = useCart(baristaUserId);
      useEffect(() => { latest = cart; }, [cart]);
      return null;
    }
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    return {
      render: async () => { await act(async () => { root.render(<Harness />); }); },
      cleanup: async () => { await act(async () => { root.unmount(); }); container.remove(); },
      getLatest: () => { if (!latest) throw new Error("Not init"); return latest; },
    };
  }

  it("creates and mutates a real cart through the hook", async () => {
    const harness = mountHarness();
    try {
      await harness.render();

      await waitFor(() => harness.getLatest().cartId !== null);
      const activeCartId = harness.getLatest().cartId!;

      const baseItem = {
        drink_id: "classic-tea",
        drink_name: "Hook Test Milk Tea",
        drink_price: 5.5,
        sugar: "75%",
        toppings: ["pearls"],
        quantity: 1,
      };

      await act(async () => { await harness.getLatest().upsertItem(baseItem); });
      await waitFor(() => harness.getLatest().cart.length === 1);

      // Directly verify DB state
      const { data: items } = await supabase
        .from("cart_items")
        .select("*")
        .eq("cart_id", activeCartId);

      expect(items).toHaveLength(1);
      expect(items![0].quantity).toBe(1);

      // Increment
      await act(async () => { await harness.getLatest().incrementItemAtIndex(0); });
      await waitFor(() => harness.getLatest().cart[0]?.quantity === 2);

      // Clear
      await act(async () => { await harness.getLatest().clearCart(); });
      await waitFor(() => harness.getLatest().cart.length === 0);
    } finally {
      await harness.cleanup();
    }
  }, 20000);
});