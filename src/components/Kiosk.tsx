import { useState, useEffect } from "react";
import { Trash, CheckCircle2, Plus } from "lucide-react";
import { UserAuth } from "../auth/AuthContext";
import { Sidebar } from "./common/Sidebar";
import placeholderImg from "../assets/Placeholder.jpg";
import { type Drink } from "../patterns/DrinkFactory";
import { DrinkFactory } from "../patterns/DrinkFactory";
import { createOrder } from "../services/orderService";
import { useCart } from "../hooks/useCart";
import { useNavigate } from "react-router-dom";
import { dynamicMenu, DynamicCategory, DynamicDrink } from "../services/DynamicMenuService";

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

const sugarStrategy = new SugarStrategy();
const toppingStrategy = new ToppingStrategy();

// Helper to convert dynamic drink to Drink interface
const convertToDrink = (dynamicDrink: DynamicDrink): Drink => {
  return DrinkFactory.createDrink(dynamicDrink.type as any);
};

export const Kiosk = () => {
  const { session } = UserAuth();
  const navigate = useNavigate();
  const baristaUserId = session?.user?.id;
  const {
    cart,
    upsertItem,
    decrementItemAtIndex,
    incrementItemAtIndex,
    removeItemAtIndex,
    clearCart,
  } = useCart(baristaUserId);

  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<DynamicCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [products, setProducts] = useState<Drink[]>([]);
  const [allToppings, setAllToppings] = useState<string[]>([]);
  const [allSugarLevels, setAllSugarLevels] = useState<string[]>([]);

  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sugarLevel, setSugarLevel] = useState("");
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [checkoutSuccessOpen, setCheckoutSuccessOpen] = useState(false);
  const [lastOrderSummary, setLastOrderSummary] = useState("");

  // Load categories and toppings on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load categories
        const cats = await dynamicMenu.getCategories();
        setCategories(cats);
        if (cats.length > 0) {
          setSelectedCategoryId(cats[0].id);
        }
        
        // Load toppings for the strategy options
        const toppings = await dynamicMenu.getToppings();
        setAllToppings(toppings.map(t => t.name));
        toppingStrategy.options = toppings.map(t => t.name);
        
        // Load sugar levels
        const sugarLevels = await dynamicMenu.getSugarLevels();
        setAllSugarLevels(sugarLevels.map(s => s.label));
        sugarStrategy.options = sugarLevels.map(s => s.label);
        
        // Set default sugar level
        if (sugarLevels.length > 0) {
          const middleIndex = Math.floor(sugarLevels.length / 2);
          setSugarLevel(sugarLevels[middleIndex]?.label || sugarLevels[0].label);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Load products when category changes
  useEffect(() => {
    const loadProducts = async () => {
      if (selectedCategoryId) {
        const dynamicDrinks = await dynamicMenu.getDrinksByCategory(selectedCategoryId);
        const drinkProducts = dynamicDrinks.map(convertToDrink);
        setProducts(drinkProducts);
      }
    };
    loadProducts();
  }, [selectedCategoryId]);

  const openCustomization = (drink: Drink) => {
    setSelectedDrink(drink);
    const middleIndex = Math.floor(allSugarLevels.length / 2);
    setSugarLevel(allSugarLevels[middleIndex] || allSugarLevels[0] || "");
    setSelectedToppings([]);
    setShowModal(true);
  };

  const handleAddToOrder = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addToCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  const addToCart = async () => {
    if (!selectedDrink) return;

    let toppingsTotal = 0;
    for (const topping of selectedToppings) {
      const price = await dynamicMenu.getToppingPrice(topping);
      toppingsTotal += price;
    }

    await upsertItem({
      drink_id: selectedDrink.id,
      drink_name: selectedDrink.name,
      drink_price: selectedDrink.price + toppingsTotal,
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
    if (cart.length === 0 || isSubmitting) return;

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
      setLastOrderSummary(orderDetails);
      setCustomerName("");
      setCheckoutSuccessOpen(true);
    } catch (error) {
      console.error("Failed to send order to queue:", error);
    }
  };

  if (loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🥤</div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  const hasNoMenu = categories.length === 0;

  return (
    <div className="bg-cream min-h-screen text-dark-brown font-quicksand">
      <div className="fixed top-0 left-0 h-screen w-64 z-10">
        <Sidebar />
      </div>

      {/* Cart Sidebar */}
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
                <div key={item.id} className="border rounded-xl p-3 bg-[#fcfcfc]">
                  <div className="flex justify-between text-sm font-semibold">
                    <span>{item.drink_name}</span>
                    <span>₱{total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Sugar: {item.sugar}</p>
                  <p className="text-xs text-gray-500">
                    Toppings: {item.toppings?.length ? item.toppings.join(", ") : "None"}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white shadow-sm overflow-hidden">
                      <button
                        type="button"
                        onClick={() => decrementItemAtIndex(idx)}
                        className="h-9 w-10 grid place-items-center text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <div className="h-9 min-w-10 px-3 grid place-items-center text-sm font-bold text-slate-800">
                        {item.quantity}
                      </div>
                      <button
                        type="button"
                        onClick={() => incrementItemAtIndex(idx)}
                        className="h-9 w-10 grid place-items-center text-slate-700 hover:bg-slate-50"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItemAtIndex(idx)}
                      className="inline-flex items-center justify-center rounded-full p-2 bg-red-100 text-red-600 hover:bg-red-200"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-6 border-t pt-4">
          <label htmlFor="customerName" className="block text-sm font-semibold text-slate-700">
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

      {/* Main Content */}
      <main className="ml-0 lg:ml-64 mr-0 lg:mr-[22rem] h-screen overflow-y-auto p-4 lg:p-6 pt-28 lg:pt-6">
        <div className="mb-6">
          <h1 className="text-5xl font-black font-fredoka">Kiosk</h1>
          <p className="text-lg text-gray-500">Get ready to take orders!</p>
        </div>

        {hasNoMenu ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="text-8xl mb-6">🍵</div>
              <h2 className="text-3xl font-bold text-dark-brown mb-3">No Menu Available</h2>
              <p className="text-gray-500 mb-8 max-w-md">
                The menu is currently empty. Please add some drinks to start taking orders.
              </p>
              <button
                onClick={() => navigate("/admin/menu")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-dark-brown text-white rounded-xl hover:bg-brown-dark transition-colors font-semibold"
              >
                <Plus size={20} />
                Add Menu Items
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Category Tabs */}
            <div className="mb-6 flex items-center gap-3 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`rounded-full px-5 py-2 cursor-pointer ${
                    selectedCategoryId === cat.id
                      ? "bg-dark-brown text-white"
                      : "bg-white border border-slate-200 text-slate-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Products Grid */}
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
                    onError={(e) => ((e.target as HTMLImageElement).src = placeholderImg)}
                  />
                  <div className="mt-4 flex flex-1 flex-col">
                    <h3 className="text-2xl font-bold">{drink.name}</h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-3 min-h-[3rem]">
                      {drink.description}
                    </p>
                    <div className="mt-auto">
                      <p className="mt-3 text-2xl font-extrabold">₱{drink.price.toFixed(2)}</p>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => openCustomization(drink)}
                        className={`mt-4 w-full rounded-xl py-3 font-semibold transition-colors cursor-pointer ${
                          isSubmitting
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-brown text-white hover:bg-brown-dark"
                        }`}
                      >
                        + Add to Order
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </main>

      {/* Customization Modal */}
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
                  <p className="text-sm text-gray-500 mt-1">{selectedDrink.description}</p>
                </div>
                <span className="text-2xl font-black">₱{selectedDrink.price.toFixed(2)}</span>
              </div>

              <div className="mb-4">
                <p className="text-lg font-semibold mb-2">Toppings</p>
                <div className="grid grid-cols-2 gap-2">
                  {allToppings.map((option) => {
                    const selected = selectedToppings.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleTopping(option)}
                        className={`rounded-xl px-3 py-2 text-sm border font-semibold cursor-pointer ${
                          selected
                            ? "bg-dark-brown text-white border-dark-brown"
                            : "bg-[#f3f1eb] text-[#6b5d4d] border-transparent"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-lg font-semibold mb-2">Sugar Level</p>
                <div className="grid grid-cols-5 gap-2">
                  {allSugarLevels.map((option) => {
                    const selected = sugarLevel === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSugarLevel(option)}
                        className={`text-xs rounded-full px-3 py-2 font-semibold border cursor-pointer ${
                          selected
                            ? "bg-dark-brown text-white border-dark-brown"
                            : "bg-[#f3f1eb] text-[#6b5d4d] border-transparent"
                        }`}
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
                  disabled={isSubmitting}
                  onClick={handleAddToOrder}
                  className="px-5 py-2 rounded-xl bg-dark-brown text-white text-sm font-semibold hover:bg-brown-dark cursor-pointer"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Success Modal */}
      {checkoutSuccessOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-5">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="p-6">
              <div className="flex items-start gap-3">
                <div className="text-emerald-600">
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black font-fredoka text-dark-brown">Order successful</h3>
                  <p className="mt-1 text-sm text-gray-600">Your order has been sent to the queue.</p>
                </div>
              </div>
              {lastOrderSummary && (
                <div className="mt-4 rounded-2xl bg-[#f8f7f1] p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Order details</p>
                  <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{lastOrderSummary}</p>
                </div>
              )}
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCheckoutSuccessOpen(false);
                    setLastOrderSummary("");
                  }}
                  className="px-5 py-2 rounded-xl bg-dark-brown text-white text-sm font-semibold hover:bg-brown-dark cursor-pointer"
                >
                  New order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};