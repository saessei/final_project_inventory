// ============================================================
// PRODUCT (What the factory creates)
// ============================================================

export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type OrderItemDetails = {
  quantity: number;
  drink_name: string;
  size?: string;
  sugar_label?: string;
  sugar?: string;
  toppings?: string[];
  order_item_toppings?: Array<{ topping_name: string }>;
};

// ┌─────────────────────────────────────────────────────────────┐
// │  PRODUCT: The final object the factory creates              │
// │  This is what components actually use                       │
// └─────────────────────────────────────────────────────────────┘
export type QueueOrder = {
  id: string;
  customer_name: string;
  order_details: string;      // ← This field gets FORMATTED by the factory
  status: OrderStatus;
  created_at: string;
  claimed_by: string | null;
  claimed_at: string | null;
  total_price: number;
};

// ┌─────────────────────────────────────────────────────────────┐
// │  RAW INPUT: The messy database data                         │
// │  Missing the formatted order_details field                  │
// └─────────────────────────────────────────────────────────────┘
export type QueueOrderRow = Omit<QueueOrder, "order_details"> & {
  order_items?: OrderItemDetails[];
};


// ┌─────────────────────────────────────────────────────────────┐
// │  FACTORY CLASS: Contains methods to create products         │
// └─────────────────────────────────────────────────────────────┘
export class OrderFactory {

  // ┌─────────────────────────────────────────────────────────────┐
  // │  HELPER METHOD: Formats raw data into readable string       │
  // │  Takes: Array of order items                                │
  // │  Returns: "2x Milk Tea (Large, 50%) • 1x Boba (Regular)"    │
  // └─────────────────────────────────────────────────────────────┘
  static formatOrderDetails(items: OrderItemDetails[]): string {
    return items
      .map((item) => {
        const size = item.size
          ? ` (${item.size.charAt(0).toUpperCase()}${item.size.slice(1)})`
          : "";
        const sugar = item.sugar_label ?? item.sugar ?? "";
        const toppings =
          item.toppings ??
          item.order_item_toppings?.map((topping) => topping.topping_name) ??
          [];
        const additions = [sugar, ...toppings].filter(Boolean).join(", ");

        return `${item.quantity}x ${item.drink_name}${size}${
          additions ? ` (${additions})` : ""
        }`;
      })
      .join(" • ");
  }

  // ┌─────────────────────────────────────────────────────────────┐
  // │  FACTORY METHOD: Creates the final product                  │
  // │  Input: Raw database row (QueueOrderRow)                    │
  // │  Output: Clean product (QueueOrder)                         │
  // └─────────────────────────────────────────────────────────────┘
  static createQueueOrder(row: QueueOrderRow): QueueOrder {
    return {
      ...row,                                                    // Copy all raw data
      order_details: OrderFactory.formatOrderDetails(row.order_items ?? []), // Add formatted field
    };
  }
}