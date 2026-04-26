// src/patterns/DynamicStrategies.ts
import { dynamicMenu } from "../services/DynamicMenuService";

export interface CustomizationStrategy {
  name: string;
  options: string[];
  priceAdjustment(option: string): Promise<number> | number;
}

export class DynamicSugarStrategy implements CustomizationStrategy {
  name = "Sugar Level";
  private optionsCache: string[] = [];
  
  get options(): string[] {
    return this.optionsCache;
  }

  async loadOptions(): Promise<void> {
    const levels = await dynamicMenu.getSugarLevels();
    this.optionsCache = levels.map(s => s.label);
  }
  
  priceAdjustment(): number {
    return 0;
  }
}

export class DynamicToppingStrategy implements CustomizationStrategy {
  name = "Toppings";
  private optionsCache: string[] = [];
  
  get options(): string[] {
    return this.optionsCache;
  }

  async loadOptions(): Promise<void> {
    const toppings = await dynamicMenu.getToppings();
    this.optionsCache = toppings.map(t => t.name);
  }
  
  async priceAdjustment(option: string): Promise<number> {
    return await dynamicMenu.getToppingPrice(option);
  }
}

export const sugarStrategy = new DynamicSugarStrategy();
export const toppingStrategy = new DynamicToppingStrategy();

// Initialize strategies
sugarStrategy.loadOptions();
toppingStrategy.loadOptions();