// src/components/Kiosk.tsx
import { useState, useEffect } from "react";
import { Trash, CheckCircle2, Plus } from "lucide-react";
import { UserAuth } from "@/components/auth/AuthContext";
import { Sidebar } from "@/components/ui/Sidebar";
import placeholderImg from "@/assets/Placeholder.jpg";
import { createOrder } from "@/services/orderService";
import { useCart } from "@/hooks/useCart";
import { useNavigate } from "react-router-dom";
import {
  drinkService,
  type Drink,
  type Topping,
  type SugarLevel,
} from "@/services/DrinkService";

// Image component with placeholder fallback
const DrinkImage = ({ imageUrl, name }: { imageUrl: string; name: string }) => {
  const [imageError, setImageError] = useState(false);

  const getImageSrc = () => {
    if (imageError) return placeholderImg;
    if (imageUrl && imageUrl.trim() !== "") return imageUrl;
    return placeholderImg;
  };

  return (
    <img
      src={getImageSrc()}
      alt={name}
      className="h-44 w-full shrink-0 object-cover rounded-2xl group-hover:scale-110 transition-transform duration-500"
      onError={() => setImageError(true)}
    />
  );
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
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [sugarLevels, setSugarLevels] = useState<SugarLevel[]>([]);

  // Customization state
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("regular");
  const [selectedSugar, setSelectedSugar] = useState<SugarLevel | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutSuccessOpen, setCheckoutSuccessOpen] = useState(false);
  const [lastOrderSummary, setLastOrderSummary] = useState("");

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [drinksData, sugarData] = await Promise.all([
          drinkService.getAllDrinks(),
          drinkService.getAllSugarLevels(),
        ]);
        setDrinks(drinksData);
        setSugarLevels(sugarData);

        // Set default sugar level (50%)
        const defaultSugar = sugarData.find((s) => s.percentage === 50);
        if (defaultSugar) setSelectedSugar(defaultSugar);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, []);

  const openCustomization = (drink: Drink) => {
    setSelectedDrink(drink);
    setSelectedSize("regular");
    const defaultSugar = sugarLevels.find((s) => s.percentage === 50);
    if (defaultSugar) setSelectedSugar(defaultSugar);
    setSelectedToppings([]);
    setShowModal(true);
  };

  const calculateTotalPrice = () => {
    if (!selectedDrink) return 0;

    // Base price from size
    const sizePrice =
      selectedDrink.sizes[selectedSize as keyof typeof selectedDrink.sizes];

    // Sugar addition price
    const sugarPrice = selectedSugar?.price_addition || 0;

    // Toppings total price
    const toppingsPrice = selectedToppings.reduce(
      (total, topping) => total + topping.price,
      0,
    );

    return sizePrice + sugarPrice + toppingsPrice;
  };

  const addToCart = async () => {
    if (!selectedDrink || !selectedSugar) return;

    const totalPrice = calculateTotalPrice();
    const sizeLabel =
      selectedSize.charAt(0).toUpperCase() + selectedSize.slice(1);

    await upsertItem({
      drink_id: selectedDrink.id,
      drink_name: `${selectedDrink.name} (${sizeLabel})`,
      drink_price: totalPrice,
      sugar: selectedSugar.label,
      toppings: selectedToppings.map((t) => t.name),
      quantity: 1,
    });

    setShowModal(false);
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

  const toggleTopping = (topping: Topping) => {
    setSelectedToppings((prev) =>
      prev.some((t) => t.id === topping.id)
        ? prev.filter((t) => t.id !== topping.id)
        : [...prev, topping],
    );
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + Number(item.drink_price) * item.quantity,
    0,
  );

  const handleCheckout = async () => {
    if (cart.length === 0 || isSubmitting) return;

    console.log("🛒 Cart before checkout:", cart);
    console.log("💰 cartTotal being sent:", cartTotal);
    console.log("💰 cartTotal type:", typeof cartTotal);

    const orderDetails = cart
      .map((item) => {
        const toppings = item.toppings?.length
          ? `, ${item.toppings.join(", ")}`
          : "";
        return `${item.quantity}x ${item.drink_name} (${item.sugar}${toppings})`;
      })
      .join(" • ");

    console.log("📝 Order details:", orderDetails);

    try {
      const result = await createOrder({
        customer_name: customerName.trim() || "Guest",
        order_details: orderDetails,
        status: "pending",
        total_price: Number(cartTotal), // Force to number
      });

      console.log("✅ Order result:", result);

      await clearCart();
      setLastOrderSummary(orderDetails);
      setCustomerName("");
      setCheckoutSuccessOpen(true);
    } catch (error) {
      console.error("❌ Failed to send order to queue:", error);
    }
  };

  const hasNoMenu = drinks.length === 0;

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
                <div
                  key={item.id}
                  className="border rounded-xl p-3 bg-[#fcfcfc]"
                >
                  <div className="flex justify-between text-sm font-semibold">
                    <span>{item.drink_name}</span>
                    <span>₱{total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Sugar: {item.sugar}
                  </p>
                  <p className="text-xs text-gray-500">
                    Toppings:{" "}
                    {item.toppings?.length ? item.toppings.join(", ") : "None"}
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
              <h2 className="text-3xl font-bold text-dark-brown mb-3">
                No Menu Available
              </h2>
              <p className="text-gray-500 mb-8 max-w-md">
                The menu is currently empty. Please add some drinks to start
                taking orders.
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
            {/* Products Grid */}
            <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-2 auto-rows-fr">
              {drinks.map((drink) => (
                <article
                  key={drink.id}
                  className="flex h-full flex-col border border-slate-200 rounded-3xl bg-white p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="relative overflow-hidden rounded-2xl">
                    <DrinkImage imageUrl={drink.image_url} name={drink.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="mt-4 flex flex-1 flex-col">
                    <h3 className="text-2xl font-bold">{drink.name}</h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-3 min-h-[3rem]">
                      {drink.description}
                    </p>
                    <div className="mt-auto">
                      <p className="mt-3 text-3xl font-bold">
                        ₱{drink.sizes.regular}
                      </p>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => openCustomization(drink)}
                        className={`mt-4 w-full rounded-xl py-3 font-semibold transition-all duration-300 cursor-pointer hover:scale-105 ${
                          isSubmitting
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-brown text-white hover:bg-brown-dark"
                        }`}
                      >
                        + Add to Cart
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </main>

      {/* Customization Modal - Floating with animations */}
      {showModal && selectedDrink && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-in zoom-in-95 duration-300 slide-in-from-bottom-10 hover:scale-[1.02] hover:shadow-3xl">
            <div className="relative h-56 group overflow-hidden">
              <img
                src={selectedDrink.image_url || placeholderImg}
                alt={selectedDrink.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) =>
                  ((e.target as HTMLImageElement).src = placeholderImg)
                }
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-sm font-bold hover:bg-white hover:scale-110 hover:rotate-90 transition-all duration-200 cursor-pointer shadow-lg z-10"
              >
                ✕
              </button>
            </div>
            <div className="p-5 transition-all duration-300 hover:translate-y-[-2px]">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-3xl font-bold">{selectedDrink.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedDrink.description}
                  </p>
                </div>
                <span className="text-2xl font-black text-dark-brown">
                  ₱{calculateTotalPrice().toFixed(2)}
                </span>
              </div>

              {/* Size Selection */}
              <div className="mb-4">
                <p className="text-lg font-semibold mb-2">Select Size</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedSize("regular")}
                    className={`rounded-xl px-3 py-2 text-sm border font-semibold cursor-pointer transition-all duration-200 hover:scale-105 ${
                      selectedSize === "regular"
                        ? "bg-dark-brown text-white border-dark-brown"
                        : "bg-[#f3f1eb] text-[#6b5d4d] border-transparent hover:bg-brown/20"
                    }`}
                  >
                    Regular
                    <br />₱{selectedDrink.sizes.regular}
                  </button>
                  <button
                    onClick={() => setSelectedSize("medium")}
                    className={`rounded-xl px-3 py-2 text-sm border font-semibold cursor-pointer transition-all duration-200 hover:scale-105 ${
                      selectedSize === "medium"
                        ? "bg-dark-brown text-white border-dark-brown"
                        : "bg-[#f3f1eb] text-[#6b5d4d] border-transparent hover:bg-brown/20"
                    }`}
                  >
                    Medium
                    <br />₱{selectedDrink.sizes.medium}
                  </button>
                  <button
                    onClick={() => setSelectedSize("large")}
                    className={`rounded-xl px-3 py-2 text-sm border font-semibold cursor-pointer transition-all duration-200 hover:scale-105 ${
                      selectedSize === "large"
                        ? "bg-dark-brown text-white border-dark-brown"
                        : "bg-[#f3f1eb] text-[#6b5d4d] border-transparent hover:bg-brown/20"
                    }`}
                  >
                    Large
                    <br />₱{selectedDrink.sizes.large}
                  </button>
                </div>
              </div>

              {/* Sugar Level Selection */}
              <div className="mb-4">
                <p className="text-lg font-semibold mb-2">Sugar Level</p>
                <div className="grid grid-cols-2 gap-2">
                  {sugarLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setSelectedSugar(level)}
                      className={`rounded-xl px-3 py-2 text-sm border font-semibold cursor-pointer transition-all duration-200 hover:scale-105 ${
                        selectedSugar?.id === level.id
                          ? "bg-dark-brown text-white border-dark-brown"
                          : "bg-[#f3f1eb] text-[#6b5d4d] border-transparent hover:bg-brown/20"
                      }`}
                    >
                      {level.label}
                      {level.price_addition > 0 && (
                        <span className="text-xs block">
                          +₱{level.price_addition}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toppings Selection */}
              {selectedDrink.available_toppings.length > 0 && (
                <div className="mb-6">
                  <p className="text-lg font-semibold mb-2">Add Toppings</p>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {selectedDrink.available_toppings.map((topping) => (
                      <button
                        key={topping.id}
                        onClick={() => toggleTopping(topping)}
                        className={`rounded-xl px-3 py-2 text-sm border font-semibold cursor-pointer transition-all duration-200 hover:scale-105 ${
                          selectedToppings.some((t) => t.id === topping.id)
                            ? "bg-dark-brown text-white border-dark-brown"
                            : "bg-[#f3f1eb] text-[#6b5d4d] border-transparent hover:bg-brown/20"
                        }`}
                      >
                        {topping.name}
                        <br />
                        +₱{topping.price}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Toppings Summary */}
              {selectedToppings.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold">Selected Toppings:</p>
                  <p className="text-sm text-gray-600">
                    {selectedToppings.map((t) => t.name).join(", ")}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition-all duration-200 hover:scale-105 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleAddToOrder}
                  className="px-5 py-2 rounded-xl bg-dark-brown text-white text-sm font-semibold hover:bg-brown-dark transition-all duration-200 hover:scale-105 cursor-pointer disabled:opacity-50"
                >
                  Add to Cart - ₱{calculateTotalPrice().toFixed(2)}
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
                  <h3 className="text-2xl font-black font-fredoka text-dark-brown">
                    Order successful
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Your order has been sent to the queue.
                  </p>
                </div>
              </div>
              {lastOrderSummary && (
                <div className="mt-4 rounded-2xl bg-[#f8f7f1] p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
                    Order details
                  </p>
                  <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                    {lastOrderSummary}
                  </p>
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
