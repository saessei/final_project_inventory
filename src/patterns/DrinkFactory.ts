// src/factories/DrinkFactory.ts
import placeholderImg from "@/assets/Placeholder.jpg";

export type DrinkType = "BrownSugar" | "Matcha" | "Taro" | "PassionFruit";

export interface Drink {
  id: DrinkType;
  name: string;
  description: string;
  price: number;
  image: string;
}

class MilkTea implements Drink {
  constructor(
    public id: DrinkType,
    public name: string,
    public description: string,
    public price: number,
    public image: string,
  ) {}
}

export class DrinkFactory {
  static createDrink(type: DrinkType): Drink {
    const common: Record<
      DrinkType,
      { name: string; description: string; image: string; price: number }
    > = {
      BrownSugar: {
        name: "Brown Sugar Boba",
        description: "Classic favorite with caramelized sugar and pearls.",
        image: placeholderImg,
        price: 100,
      },
      Matcha: {
        name: "Matcha Milk Tea",
        description: "Creamy matcha with a mild bitterness.",
        image: placeholderImg,
        price: 120,
      },
      Taro: {
        name: "Taro Milk Tea",
        description: "Sweet taro flavor with purple swirl.",
        image: placeholderImg,
        price: 110,
      },
      PassionFruit: {
        name: "Passion Fruit Green Tea",
        description:
          "A refreshing, tart, and sweet beverage combining brewed green tea with passion fruit puree or syrup.",
        image: placeholderImg,
        price: 90,
      },
    };

    const d = common[type];
    return new MilkTea(type, d.name, d.description, d.price, d.image);
  }
}
