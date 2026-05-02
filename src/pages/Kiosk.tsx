// src/components/Kiosk.tsx
import { useState, useEffect } from "react";
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
import {
  drinkService,
  type Drink,
  type Topping,
  type SugarLevel,
} from "@/services/drinkService";

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
    clearCart,
  } = useCart(staffUserId);

  const [customerName, setCustomerName] = useState("");
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [sugarLevels, setSugarLevels] = useState<SugarLevel[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);

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
  const loading = menuLoading || cartLoading;

  return (
    <KioskSkeleton loading={loading}>
      <div className="bg-cream min-h-screen text-dark-brown font-quicksand">
        <div className="fixed top-0 left-0 h-screen w-64 z-10">
          <Sidebar />
        </div>

        <CartSidebar
          cart={cart}
          cartTotal={cartTotal}
          customerName={customerName}
          onCustomerNameChange={setCustomerName}
          onCheckout={handleCheckout}
          onDecrementItem={decrementItemAtIndex}
          onIncrementItem={incrementItemAtIndex}
          onRemoveItem={removeItemAtIndex}
        />

        {/* Main Content */}
        <main className="ml-0 lg:ml-64 mr-0 lg:mr-[22rem] h-screen overflow-y-auto no-scrollbar p-4 lg:p-6 pt-28 lg:pt-6">
          <div className="mb-6">
            <h1 className="text-5xl font-black font-fredoka">Order Taking</h1>
            <p className="text-lg text-gray-500">
              Build customer orders and send them to the queue.
            </p>
          </div>

          {hasNoMenu ? (
            <EmptyMenuState onAddMenuItems={() => navigate("/admin/menu")} />
          ) : (
            <DrinkGrid
              drinks={drinks}
              isSubmitting={isSubmitting}
              onCustomize={openCustomization}
            />
          )}
        </main>

        {showModal && selectedDrink && (
          <CustomizationModal
            drink={selectedDrink}
            sugarLevels={sugarLevels}
            selectedSize={selectedSize}
            selectedSugar={selectedSugar}
            selectedToppings={selectedToppings}
            isSubmitting={isSubmitting}
            totalPrice={calculateTotalPrice()}
            onClose={() => setShowModal(false)}
            onSizeChange={setSelectedSize}
            onSugarChange={setSelectedSugar}
            onToggleTopping={toggleTopping}
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
    </KioskSkeleton>
  );
};
