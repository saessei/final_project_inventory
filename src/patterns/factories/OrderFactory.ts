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

export type QueueOrder = {
  id: string;
  customer_name: string;
  order_details: string;
  status: OrderStatus;
  created_at: string;
  claimed_by: string | null;
  claimed_at: string | null;
  total_price: number;
};

export type QueueOrderRow = Omit<QueueOrder, "order_details"> & {
  order_items?: OrderItemDetails[];
};

export class OrderFactory {
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

  static createQueueOrder(row: QueueOrderRow): QueueOrder {
    return {
      ...row,
      order_details: OrderFactory.formatOrderDetails(row.order_items ?? []),
    };
  }
}
