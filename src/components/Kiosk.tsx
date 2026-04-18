import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash, Plus } from "lucide-react";
import { UserAuth } from "../context/AuthContext";
import { Sidebar } from "./common/Sidebar";
import placeholderImg from "../assets/Placeholder.jpg";
import {
  DrinkFactory,
  type DrinkType,
  type Drink,
} from "../patterns/DrinkFactory";
import { createOrder } from "../services/orderService";
import { useCart } from "../hooks/useCart";

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

export const Kiosk = () => {
  const navigate = useNavigate();
  const { session } = UserAuth();

  const baristaUserId = session?.user?.id; // used as owner key for Option C cart
  const {
    cart,
    upsertItem,
    decrementItemAtIndex,
    incrementItemAtIndex,
    clearCart,
  } = useCart(baristaUserId);

  const userName =
    session?.user?.user_metadata?.display_name ||
    session?.user?.email?.split("@")[0] ||
    "Guest";

  const baristaName = userName;
  const [customerName, setCustomerName] = useState("");

  const products = useMemo(
    () =>
      ["BrownSugar", "Matcha", "Taro", "Shrek"].map((id) =>
        DrinkFactory.createDrink(id as DrinkType),
      ),
    [],
  );

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

  const addToCart = async () => {
    if (!selectedDrink) return;

    await upsertItem({
      drink_id: selectedDrink.id,
      drink_name: selectedDrink.name,
      drink_price:
        selectedDrink.price +
        selectedToppings.reduce(
          (sum, t) => sum + toppingStrategy.priceAdjustment(t),
          0,
        ),
      sugar: sugarLevel,
      toppings: [...selectedToppings],
      quantity: 1,
    });

    setShowModal(false);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + Number(item.drink_price) * item.quantity,
    0,
  );

  const toggleTopping = (topping: string) => {
    setSelectedToppings((prev) =>
      prev.includes(topping)
        ? prev.filter((t) => t !== topping)
        : [...prev, topping],
    );
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const orderDetails = cart
      .map((item) => {
        const toppings = item.toppings?.length
          ? `, ${item.toppings.join(", ")}`
          : "";
        return `${item.quantity}x ${item.drink_name} (${item.sugar}${toppings})`;
      })
      .join(" • ");

    try {
      await createOrder({
        customer_name: customerName.trim() || "Guest",
        order_details: orderDetails,
        status: "pending",
      });

      await clearCart();
      navigate("/queued-orders");
    } catch (error) {
      console.error(
        "Failed to send order to queue:",
        error instanceof Error ? error.message : error,
      );
    }
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
              const total = Number(item.drink_price) * item.quantity;
              return (
                <div
                  key={item.id}
                  className="border rounded-xl p-3 bg-[#fcfcfc]"
                >
                  <div className="flex justify-between text-sm font-semibold">
                    <span>
                      {item.drink_name} x{item.quantity}
                    </span>
                    <span>₱{total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Sugar: {item.sugar}
                  </p>
                  <p className="text-xs text-gray-500">
                    Toppings:{" "}
                    {item.toppings?.length ? item.toppings.join(", ") : "None"}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => decrementItemAtIndex(idx)}
                      className="flex items-center justify-center rounded-full p-2 bg-red-100 text-red-600 hover:bg-red-200 transition-colors cursor-pointer"
                    >
                      <Trash size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => incrementItemAtIndex(idx)}
                      className="flex items-center justify-center rounded-full p-2 bg-green-100 text-green-600 hover:bg-green-200 transition-colors cursor-pointer"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-6 border-t pt-4">
          <label
            htmlFor="customerName"
            className="block text-sm font-semibold text-slate-700"
          >
            Customer name
          </label>
          <input
            id="customerName"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name"
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-dark-brown focus:ring-2 focus:ring-dark-brown/20"
          />

          <p className="mt-3 text-xs text-gray-500">Barista: {baristaName}</p>

          <div className="mt-4">
            <p className="text-sm text-gray-500">Subtotal</p>
            <p className="text-3xl font-bold">₱{cartTotal.toFixed(2)}</p>
            <button
              type="button"
              onClick={handleCheckout}
              className="mt-4 w-full rounded-xl bg-dark-brown px-4 py-2 text-white disabled:opacity-50 cursor-pointer"
              disabled={cart.length === 0 || customerName.trim() === ""}
            >
              Check Out
            </button>
          </div>
        </div>
      </aside>

      <main className="ml-0 lg:ml-64 mr-0 lg:mr-[22rem] h-screen overflow-y-auto p-4 lg:p-6 pt-28 lg:pt-6">
        <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-2 auto-rows-fr">
          {products.map((drink) => (
            <article
              key={drink.id}
              className="flex h-full flex-col border border-slate-200 rounded-3xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={drink.image || placeholderImg}
                alt={drink.name}
                className="h-44 w-full shrink-0 object-cover rounded-2xl"
                onError={(e) =>
                  ((e.target as HTMLImageElement).src = placeholderImg)
                }
              />

              <div className="mt-4 flex flex-1 flex-col">
                <h3 className="text-2xl font-bold">{drink.name}</h3>

                <p className="mt-1 text-sm text-gray-500 line-clamp-3 min-h-[3rem]">
                  {drink.description}
                </p>

                <div className="mt-auto">
                  <p className="mt-3 text-2xl font-extrabold">
                    ₱{drink.price.toFixed(2)}
                  </p>

                  <button
                    type="button"
                    onClick={() => openCustomization(drink)}
                    className="mt-4 w-full rounded-xl bg-brown text-white py-3 font-semibold hover:bg-brown-dark transition-colors cursor-pointer"
                  >
                    + Add to Order
                  </button>
                </div>
              </div>
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
                onError={(e) =>
                  ((e.target as HTMLImageElement).src = placeholderImg)
                }
              />
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-sm font-bold hover:bg-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-3xl font-bold">{selectedDrink.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedDrink.description}
                  </p>
                </div>
                <span className="text-2xl font-black">
                  ₱{selectedDrink.price.toFixed(2)}
                </span>
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
                        className={`rounded-xl px-3 py-2 text-sm border font-semibold ${
                          selected
                            ? "bg-dark-brown text-white border-dark-brown"
                            : "bg-[#f3f1eb] text-[#6b5d4d] border-transparent"
                        } cursor-pointer`}
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
                        className={`text-xs rounded-full px-3 py-2 font-semibold border ${
                          selected
                            ? "bg-dark-brown text-white border-dark-brown"
                            : "bg-[#f3f1eb] text-[#6b5d4d] border-transparent"
                        } cursor-pointer`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 rounded-xl border border-slate-300 text-sm font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addToCart}
                  className="px-5 py-2 rounded-xl bg-dark-brown text-white text-sm font-semibold hover:bg-brown-dark cursor-pointer"
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
