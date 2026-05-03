// src/components/Kiosk.tsx
import { useRef, useState, useEffect } from "react";
import { UserAuth } from "@/components/auth/AuthContext";
import { Sidebar } from "@/components/ui/Sidebar";
import { createOrder } from "@/services/orderService";
import { useCart } from "@/hooks/useCart";
import { useNavigate } from "react-router-dom";
import { CartSidebar } from "@/components/kiosk/CartSidebar";
import { CheckoutSuccessModal } from "@/components/kiosk/CheckoutSuccessModal";
import { CustomizationModal } from "@/components/kiosk/CustomizationModal";
import { DrinkGrid } from "@/components/kiosk/DrinkGrid";
import { EmptyMenuState } from "@/components/kiosk/EmptyMenuState";
import { KioskSkeleton } from "@/components/ui/LoadingSkeletons";
import { TextField } from "@/components/ui/TextField";
import { Search } from "lucide-react";
import {
  drinkService,
  type Drink,
  type Topping,
  type SugarLevel,
} from "@/services/DrinkService";

export const Kiosk = () => {
  const { session } = UserAuth();
  const navigate = useNavigate();
  const staffUserId = session?.user?.id;
  const {
    cart,
    loading: cartLoading,
    upsertItem,
    decrementItemAtIndex,
    incrementItemAtIndex,
    removeItemAtIndex,
    replaceItemAtIndex,
    clearCart,
  } = useCart(staffUserId);

  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [sugarLevels, setSugarLevels] = useState<SugarLevel[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Customization state
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("regular");
  const [selectedSugar, setSelectedSugar] = useState<SugarLevel | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [notes, setNotes] = useState("");
  const [editingCartIndex, setEditingCartIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutSuccessOpen, setCheckoutSuccessOpen] = useState(false);
  const [lastOrderSummary, setLastOrderSummary] = useState("");
  const checkoutLockRef = useRef(false);

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
      } finally {
        setMenuLoading(false);
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
    setNotes("");
    setEditingCartIndex(null);
    setShowModal(true);
  };

  const openEditCustomization = (index: number) => {
    const item = cart[index];
    const drink = drinks.find((d) => d.id === item.drink_id);
    if (!drink) return;

    setSelectedDrink(drink);
    setSelectedSize(item.size);
    const sugar = sugarLevels.find((s) => s.label === item.sugar);
    setSelectedSugar(sugar || null);
    
    const toppings: Topping[] = item.topping_details.map(t => ({
      id: t.id,
      name: t.name,
      price: t.price,
      is_available: true
    }));
    setSelectedToppings(toppings);
    setNotes(item.notes || "");
    setEditingCartIndex(index);
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

  const categories = Array.from(
    new Set(
      drinks
        .map((drink) => drink.category?.trim())
        .filter((category): category is string => Boolean(category))
        .filter((category) => category.toLowerCase() !== "beverages"),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const filteredDrinks = drinks.filter((drink) => {
    const matchesSearch = drink.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || drink.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = async () => {
    if (!selectedDrink || !selectedSugar) return;

    const totalPrice = calculateTotalPrice();

    const itemData = {
      drink_id: selectedDrink.id,
      drink_name: selectedDrink.name,
      size: selectedSize as "regular" | "medium" | "large",
      drink_price: totalPrice,
      sugar: selectedSugar.label,
      sugar_percentage: selectedSugar.percentage,
      toppings: selectedToppings.map((t) => t.name),
      topping_details: selectedToppings.map((t) => ({
        id: t.id,
        name: t.name,
        price: t.price,
      })),
      quantity: editingCartIndex !== null ? cart[editingCartIndex].quantity : 1,
      notes: notes.trim() || undefined,
    };

    if (editingCartIndex !== null) {
      await replaceItemAtIndex(editingCartIndex, itemData);
    } else {
      await upsertItem(itemData);
    }

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
    if (cart.length === 0 || isSubmitting || checkoutLockRef.current) return;

    checkoutLockRef.current = true;
    setIsSubmitting(true);

    const orderDetails = cart
      .map((item) => {
        const toppings = item.toppings?.length
          ? `, ${item.toppings.join(", ")}`
          : "";
        return `${item.quantity}x ${item.drink_name} (${item.sugar}${toppings})`;
      })
      .join(" • ");

    try {
      const result = await createOrder({
        customer_name: customerName.trim() || "Guest",
        status: "pending",
        total_price: Number(cartTotal),
        created_by: staffUserId ?? null,
        items: cart,
        payment_method: paymentMethod as "cash" | "gcash" | "card" | "other",
      });

      console.log("Order created:", result);
      await clearCart();
      setLastOrderSummary(orderDetails);
      setCustomerName("");
      setCheckoutSuccessOpen(true);
    } catch (error) {
      console.error("❌ Failed to send order to queue:", error);
    } finally {
      checkoutLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  const hasNoMenu = drinks.length === 0;

  return (
    <div className="bg-cream min-h-screen text-dark-brown font-quicksand">
      <div className="fixed top-0 left-0 h-screen w-64 z-10">
        <Sidebar />
      </div>

      <CartSidebar
        cart={cart}
        cartTotal={cartTotal}
        customerName={customerName}
        paymentMethod={paymentMethod}
        onCustomerNameChange={setCustomerName}
        onPaymentMethodChange={setPaymentMethod}
        onCheckout={handleCheckout}
        isCheckingOut={isSubmitting}
        onDecrementItem={decrementItemAtIndex}
        onIncrementItem={incrementItemAtIndex}
        onRemoveItem={removeItemAtIndex}
        onEditItem={openEditCustomization}
      />

      <main className="ml-0 lg:ml-64 mr-0 lg:mr-[22rem] h-screen overflow-y-auto no-scrollbar relative">
        <div className="sticky top-0 z-20 bg-cream px-4 lg:px-6 pt-28 lg:pt-6 pb-2 mb-4 shadow-sm border-b border-slate-200/60">
          <div className="mb-4">
            <h1 className="text-4xl font-black font-fredoka">Order Taking</h1>
            <p className="text-lg text-gray-500">
              Build customer orders and send them to the queue.
            </p>
          </div>

          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <TextField
                type="text"
                placeholder="Search drinks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search size={16} />}
                className="border-slate-200 bg-white text-dark-brown placeholder-gray-400 focus:border-dark-brown focus:ring-dark-brown/20"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-48 md:hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-dark-brown outline-none transition-all focus:border-dark-brown focus:ring-2 focus:ring-dark-brown/20"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Tabs */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-bold transition-colors active:scale-95 ${
                selectedCategory === "all"
                  ? "bg-brown text-white border border-brown"
                  : "bg-white text-gray-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-bold transition-colors active:scale-95 ${
                  selectedCategory === cat
                    ? "bg-brown text-white border border-brown"
                    : "bg-white text-gray-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 lg:px-6 pb-6">
          <KioskSkeleton loading={menuLoading || cartLoading}>
            {hasNoMenu ? (
              <EmptyMenuState onAddMenuItems={() => navigate("/admin/menu")} />
            ) : (
              <>
                {filteredDrinks.length === 0 ? (
                  <div className="rounded-lg bg-white p-8 text-center text-gray-500 border border-slate-200">
                    No drinks found matching your search.
                  </div>
                ) : (
                  <DrinkGrid
                    drinks={filteredDrinks}
                    isSubmitting={isSubmitting}
                    onCustomize={openCustomization}
                  />
                )}
              </>
            )}
          </KioskSkeleton>
        </div>
      </main>

      {showModal && selectedDrink && (
        <CustomizationModal
          drink={selectedDrink}
          sugarLevels={sugarLevels}
          selectedSize={selectedSize}
          selectedSugar={selectedSugar}
          selectedToppings={selectedToppings}
          notes={notes}
          isSubmitting={isSubmitting}
          totalPrice={calculateTotalPrice()}
          onClose={() => setShowModal(false)}
          onSizeChange={setSelectedSize}
          onSugarChange={setSelectedSugar}
          onToggleTopping={toggleTopping}
          onNotesChange={setNotes}
          onAddToOrder={handleAddToOrder}
        />
      )}

      {checkoutSuccessOpen && (
        <CheckoutSuccessModal
          orderSummary={lastOrderSummary}
          onNewOrder={() => {
            setCheckoutSuccessOpen(false);
            setLastOrderSummary("");
          }}
        />
      )}
    </div>
  );
};
