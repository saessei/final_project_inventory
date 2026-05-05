import { describe, expect, it } from "vitest";
import { formatOrderDetails } from "@/services/orderService";

describe("formatOrderDetails", () => {
  it("formats quantity, drink name, size, sugar, and toppings", () => {
    const details = formatOrderDetails([
      {
        quantity: 2,
        drink_name: "Brown Sugar Boba",
        size: "large",
        sugar_label: "50%",
        toppings: ["Pearls", "Pudding"],
      },
    ]);

    expect(details).toBe(
      "2x Brown Sugar Boba (Large) (50%, Pearls, Pudding)",
    );
  });

  it("falls back to sugar and order item toppings when labels are not present", () => {
    const details = formatOrderDetails([
      {
        quantity: 1,
        drink_name: "Matcha Milk Tea",
        sugar: "Less Sugar",
        order_item_toppings: [
          { topping_name: "Grass Jelly" },
          { topping_name: "Coffee Jelly" },
        ],
      },
    ]);

    expect(details).toBe(
      "1x Matcha Milk Tea (Less Sugar, Grass Jelly, Coffee Jelly)",
    );
  });

  it("omits optional sections when size, sugar, and toppings are missing", () => {
    const details = formatOrderDetails([
      {
        quantity: 1,
        drink_name: "Taro Milk Tea",
      },
    ]);

    expect(details).toBe("1x Taro Milk Tea");
  });

  it("joins multiple order items into one display string", () => {
    const details = formatOrderDetails([
      {
        quantity: 1,
        drink_name: "Taro Milk Tea",
        size: "regular",
      },
      {
        quantity: 3,
        drink_name: "Passion Fruit Green Tea",
        toppings: ["Aloe"],
      },
    ]);

    expect(details).toContain("1x Taro Milk Tea (Regular)");
    expect(details).toContain("3x Passion Fruit Green Tea (Aloe)");
  });
});
