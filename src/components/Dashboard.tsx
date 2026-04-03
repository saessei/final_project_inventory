import { useMemo, useState } from "react";
import { UserAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "./common/Sidebar";

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
    const common = {
      BrownSugar: {
        name: "Brown Sugar Boba",
        description: "Classic with caramelized sugar and pearls.",
        image: "/assets/brown-sugar-boba.png",
      },
      Matcha: {
        name: "Matcha Milk Tea",
        description: "Creamy matcha with a mild bitterness.",
        image: "/assets/matcha-milk-tea.png",
      },
      Taro: {
        name: "Taro Milk Tea",
        description: "Sweet taro flavor with purple swirl.",
        image: "/assets/taro-milk-tea.png",
      },
    };
    const basePrice = 100;

    const d = common[type];
    return new MilkTea(type, d.name, d.description, basePrice, d.image);
  }
}

// Strategy method
interface CustomizationStrategy {
  name: string;
  options: string[];
  priceAdjustment(option: string): number;
}

class SugarStrategy implements CustomizationStrategy {
  name = "Sugar Level";
  options = ["0%", "30%", "50%", "70%", "100%"];
  priceAdjustment(option: string) {
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
  const navigate = useNavigate();
  const location = useLocation();

  const userName =
    session?.user?.user_metadata?.display_name ||
    session?.user?.email?.split("@")[0] ||
    "Guest";

  const products = useMemo(() => ["BrownSugar", "Matcha", "Taro"].map((id) => DrinkFactory.createDrink(id as DrinkType)), []);

  const [activeCategory] = useState("MilkTea");
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
    const sameIndex = cart.findIndex((item) => item.drink.id === selectedDrink.id && item.sugar === sugarLevel && JSON.stringify(item.toppings) === JSON.stringify(selectedToppings));

    if (sameIndex > -1) {
      const copy = [...cart];
      copy[sameIndex].quantity += 1;
      setCart(copy);
    } else {
      setCart((prev) => [...prev, { drink: selectedDrink, quantity: 1, sugar: sugarLevel, toppings: [...selectedToppings] }]);
    }

    setShowModal(false);
  };

  const removeItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const cartTotal = cart.reduce((sum, item) => {
    const toppingCost = item.toppings.reduce((t, topping) => t + toppingStrategy.priceAdjustment(topping), 0);
    return sum + (item.drink.price + toppingCost) * item.quantity;
  }, 0);

  const toggleTopping = (topping: string) => {
    setSelectedToppings((prev) =>
      prev.includes(topping) ? prev.filter((t) => t !== topping) : [...prev, topping],
    );
  };

  return (
    <div className="bg-cream min-h-screen w-full flex font-quicksand">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-5xl font-black font-fredoka text-dark-brown">Good morning, {userName}</h1>
          <p className="text-lg text-gray-500">Get ready to take orders!</p>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <button className="rounded-full px-5 py-2 bg-dark-brown text-white">Milktea</button>
          <button className="rounded-full px-5 py-2 bg-white border border-slate-200 text-slate-600">Coffee</button>
          <button className="rounded-full px-5 py-2 bg-white border border-slate-200 text-slate-600">Snacks</button>
        </div>

        <div className="grid lg:grid-cols-2 xl:grid-cols-2 gap-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-5">
              {products.map((drink) => (
                <article key={drink.id} className="rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
                  <div>
                    <img src={drink.image} alt={drink.name} className="h-40 w-full object-cover rounded-lg" onError={(e) => ((e.target as HTMLImageElement).src = "https://via.placeholder.com/320x220")} />
                    <h3 className="text-2xl font-bold mt-4 text-dark-brown">{drink.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{drink.description}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold">₱{drink.price.toFixed(2)}</span>
                    <button className="rounded-full bg-beige px-4 py-2 text-sm font-semibold text-dark-brown" onClick={() => openCustomization(drink)}>
                      + Add to Order
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-dark-brown">Cart</h2>
              <span className="text-xs uppercase tracking-wide bg-green-100 text-emerald-700 px-2 py-1 rounded-full">{cart.reduce((c, i) => c + i.quantity, 0)} items</span>
            </div>
            <div className="space-y-3 max-h-[50vh] overflow-auto">
              {cart.length === 0 ? (
                <p className="text-sm text-gray-500">Cart is empty.</p>
              ) : (
                cart.map((item, idx) => (
                  <div key={`${item.drink.id}-${idx}`} className="border rounded-xl p-3">
                    <div className="flex justify-between text-sm font-bold text-dark-brown">
                      <span>{item.drink.name} x{item.quantity}</span>
                      <span>₱{((item.drink.price + item.toppings.reduce((a,t)=>a+toppingStrategy.priceAdjustment(t),0)) * item.quantity).toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-500 leading-tight mt-1">
                      <p>Sugar: {item.sugar}</p>
                      <p>Toppings: {item.toppings.length > 0 ? item.toppings.join(", ") : "None"}</p>
                    </div>
                    <button onClick={() => removeItem(idx)} className="mt-2 text-xs text-red-500 hover:underline">Remove</button>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 border-t pt-4">
              <p className="text-sm text-gray-500">Subtotal</p>
              <p className="text-2xl font-bold">₱{cartTotal.toFixed(2)}</p>
              <button className="mt-3 w-full rounded-xl bg-dark-brown px-4 py-2 text-white disabled:opacity-50" disabled={cart.length === 0}>
                Check Out
              </button>
            </div>
          </aside>
        </div>

        {showModal && selectedDrink && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-5">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-2xl font-bold mb-3">Customize {selectedDrink.name}</h3>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">{sugarStrategy.name}</label>
                <select value={sugarLevel} onChange={(e) => setSugarLevel(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2">
                  {sugarStrategy.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">{toppingStrategy.name}</p>
                <div className="grid grid-cols-2 gap-2">
                  {toppingStrategy.options.map((top) => (
                    <button key={top} type="button" onClick={() => toggleTopping(top)} className={`rounded-lg px-3 py-2 text-sm border ${selectedToppings.includes(top) ? "bg-dark-brown text-white border-dark-brown" : "bg-white text-gray-800 border-gray-300"}`}>
                      {top} (+₱{toppingStrategy.priceAdjustment(top)})
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button className="px-4 py-2 rounded-lg bg-slate-200" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="px-4 py-2 rounded-lg bg-dark-brown text-white" onClick={addToCart}>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
