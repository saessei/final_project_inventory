export type PricedCartItem = {
  quantity: number;
  drink_price: number;
  topping_details?: Array<{ price: number }>;
};

export interface PricingStrategy {
  calculateCartTotal(items: PricedCartItem[]): number;
}

export class SizeAndToppingPricingStrategy implements PricingStrategy {
  calculateCartTotal(items: PricedCartItem[]): number {
    return items.reduce((sum, item) => {
      const toppingTotal =
        item.topping_details?.reduce(
          (toppingSum, topping) => toppingSum + Number(topping.price),
          0,
        ) ?? 0;

      return sum + item.quantity * (Number(item.drink_price) + toppingTotal);
    }, 0);
  }
}

export const defaultPricingStrategy = new SizeAndToppingPricingStrategy();
