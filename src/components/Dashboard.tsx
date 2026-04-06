import { useMemo, useState } from "react";
import { UserAuth } from "../context/AuthContext";
import { Sidebar } from "./common/Sidebar";
import placeholderImg from "../assets/Placeholder.jpg";

// Factory Method
export type DrinkType = "BrownSugar" | "Matcha" | "Taro";

interface Drink {
  id: DrinkType;
  name: string;
  description: string;
  price: number;
  image: string;
}

class MilkTea implements Drink {
  id: DrinkType;
  name: string;
  description: string;
  price: number;
  image: string;

  constructor(id: DrinkType, name: string, description: string, price: number, image: string) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.image = image;
  }
}

class DrinkFactory {
  static createDrink(type: DrinkType): Drink {
    const placeholder = placeholderImg;
    const common: Record<DrinkType, { name: string; description: string; image: string }> = {
      BrownSugar: {
        name: "Brown Sugar Boba",
        description: "Classic favorite with caramelized sugar and pearls.",
        image: placeholder,
      },
      Matcha: {
        name: "Matcha Milk Tea",
        description: "Creamy matcha with a mild bitterness.",
        image: placeholder,
      },
      Taro: {
        name: "Taro Milk Tea",
        description: "Sweet taro flavor with purple swirl.",
        image: placeholder,
      },
    };

    const basePrice = 100;
    const d = common[type];
    return new MilkTea(type, d.name, d.description, basePrice, d.image);
  }
}

// Strategy pattern
interface CustomizationStrategy {
  name: string;
  options: string[];
  priceAdjustment(option: string): number;
}

class SugarStrategy implements CustomizationStrategy {
  name = "Sugar Level";
  options = ["0%", "30%", "50%", "70%", "100%"];
  priceAdjustment() {
    return 0;
  }
}

class ToppingStrategy implements CustomizationStrategy {
  name = "Toppings";
  options = ["Boba", "Pudding", "Grass Jelly", "Aloe"];

  priceAdjustment(option: string) {
    return option === "Boba" ? 10 : 15;
  }
}

interface CartItem {
  drink: Drink;
  quantity: number;
  sugar: string;
  toppings: string[];
}

export const Dashboard = () => {
  const { session } = UserAuth();

  const userName =
    session?.user?.user_metadata?.display_name ||
    session?.user?.email?.split("@")[0] ||
    "Guest";

  const products = useMemo(
    () => ["BrownSugar", "Matcha", "Taro"].map((id) => DrinkFactory.createDrink(id as DrinkType)),
    [],
  );

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [showModal, setShowModal] = useState(false);

  const sugarStrategy = new SugarStrategy();
  const toppingStrategy = new ToppingStrategy();

  const [sugarLevel, setSugarLevel] = useState(sugarStrategy.options[2]);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

  const openCustomization = (drink: Drink) => {
    setSelectedDrink(drink);
    setSugarLevel(sugarStrategy.options[2]);
    setSelectedToppings([]);
    setShowModal(true);
  };

  const addToCart = () => {
    if (!selectedDrink) return;

    const sameIndex = cart.findIndex(
      (item) =>
        item.drink.id === selectedDrink.id &&
        item.sugar === sugarLevel &&
        JSON.stringify(item.toppings) === JSON.stringify(selectedToppings),
    );

    if (sameIndex > -1) {
      const updated = [...cart];
      updated[sameIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart((prev) => [
        ...prev,
        {
          drink: selectedDrink,
          quantity: 1,
          sugar: sugarLevel,
          toppings: [...selectedToppings],
        },
      ]);
    }

    setShowModal(false);
  };

  const removeItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const cartTotal = cart.reduce((sum, item) => {
    const toppingCost = item.toppings.reduce((total, topping) => total + toppingStrategy.priceAdjustment(topping), 0);
    return sum + (item.drink.price + toppingCost) * item.quantity;
  }, 0);

  const toggleTopping = (topping: string) => {
    setSelectedToppings((prev) =>
      prev.includes(topping) ? prev.filter((t) => t !== topping) : [...prev, topping],
    );
  };

  return (
    <div className="bg-cream min-h-screen text-dark-brown font-quicksand">
      <div className="fixed top-0 left-0 h-screen w-64 z-10">
        <Sidebar />
      </div>

      <aside className="fixed top-0 right-0 h-screen w-full max-w-xs lg:max-w-[22rem] bg-white border-l border-slate-200 p-5 overflow-y-auto z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Cart</h2>
          <span className="text-xs uppercase tracking-wide bg-green-100 text-emerald-700 px-2 py-1 rounded-full">
            {cart.reduce((c, i) => c + i.quantity, 0)} items
          </span>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pb-3">
          {cart.length === 0 ? (
            <p className="text-sm text-gray-500">Cart is empty.</p>
          ) : (
            cart.map((item, idx) => {
              const extraCost = item.toppings.reduce((a, t) => a + toppingStrategy.priceAdjustment(t), 0);
              const total = (item.drink.price + extraCost) * item.quantity;
              return (
                <div key={`${item.drink.id}-${idx}`} className="border rounded-xl p-3 bg-[#fcfcfc]">
                  <div className="flex justify-between text-sm font-semibold">
                    <span>{item.drink.name} x{item.quantity}</span>
                    <span>₱{total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Sugar: {item.sugar}</p>
                  <p className="text-xs text-gray-500">Toppings: {item.toppings.length > 0 ? item.toppings.join(", ") : "None"}</p>
                  <button onClick={() => removeItem(idx)} className="mt-2 text-xs text-red-500 hover:underline">
                    Remove
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-6 border-t pt-4">
          <p className="text-sm text-gray-500">Subtotal</p>
          <p className="text-3xl font-bold">₱{cartTotal.toFixed(2)}</p>
          <button className="mt-4 w-full rounded-xl bg-dark-brown px-4 py-2 text-white disabled:opacity-50" disabled={cart.length === 0}>
            Check Out
          </button>
        </div>
      </aside>

      <main className="ml-0 lg:ml-64 mr-0 lg:mr-[22rem] h-screen overflow-y-auto p-4 lg:p-6 pt-28 lg:pt-6">
        <div className="mb-6">
          <h1 className="text-5xl font-black font-fredoka">Good morning, {userName}</h1>
          <p className="text-lg text-gray-500">Get ready to take orders!</p>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <button className="rounded-full px-5 py-2 bg-dark-brown text-white">Milktea</button>
          <button className="rounded-full px-5 py-2 bg-white border border-slate-200 text-slate-600">Coffee</button>
          <button className="rounded-full px-5 py-2 bg-white border border-slate-200 text-slate-600">Snacks</button>
        </div>

        <section className="grid lg:grid-cols-2 xl:grid-cols-2 gap-5">
          {products.map((drink) => (
            <article
              key={drink.id}
              className="border border-slate-200 rounded-3xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={drink.image || placeholderImg}
                alt={drink.name}
                className="h-44 w-full object-cover rounded-2xl"
                onError={(e) => ((e.target as HTMLImageElement).src = placeholderImg)}
              />
              <div className="mt-4">
                <h3 className="text-2xl font-bold">{drink.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{drink.description}</p>
                <p className="mt-3 text-2xl font-extrabold">₱{drink.price.toFixed(2)}</p>
              </div>
              <button
                onClick={() => openCustomization(drink)}
                className="mt-4 w-full rounded-xl bg-brown text-white py-3 font-semibold hover:bg-brown-dark transition-colors"
              >
                + Add to Order
              </button>
            </article>
          ))}
        </section>
      </main>

      {showModal && selectedDrink && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-5">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="relative h-56">
              <img
                src={selectedDrink.image || placeholderImg}
                alt={selectedDrink.name}
                className="h-full w-full object-cover"
                onError={(e) => ((e.target as HTMLImageElement).src = placeholderImg)}
              />
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-sm font-bold hover:bg-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-3xl font-bold">{selectedDrink.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{selectedDrink.description}</p>
                </div>
                <span className="text-2xl font-black">₱{selectedDrink.price.toFixed(2)}</span>
              </div>

              <div className="mb-4">
                <p className="text-lg font-semibold mb-2">Toppings</p>
                <div className="grid grid-cols-2 gap-2">
                  {toppingStrategy.options.map((option) => {
                    const selected = selectedToppings.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleTopping(option)}
                        className={`rounded-xl px-3 py-2 text-sm border font-semibold ${selected ? "bg-dark-brown text-white border-dark-brown" : "bg-[#f3f1eb] text-[#6b5d4d] border-transparent"}`}
                      >
                        {option} (+₱{toppingStrategy.priceAdjustment(option)})
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-lg font-semibold mb-2">Sugar Level</p>
                <div className="grid grid-cols-5 gap-2">
                  {sugarStrategy.options.map((option) => {
                    const selected = sugarLevel === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSugarLevel(option)}
                        className={`text-xs rounded-full px-3 py-2 font-semibold border ${selected ? "bg-dark-brown text-white border-dark-brown" : "bg-[#f3f1eb] text-[#6b5d4d] border-transparent"}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 rounded-xl border border-slate-300 text-sm font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={addToCart}
                  className="px-5 py-2 rounded-xl bg-dark-brown text-white text-sm font-semibold hover:bg-brown-dark"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
