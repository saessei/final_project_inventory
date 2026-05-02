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
import {
  drinkService,
  type Drink,
  type Topping,
  type SugarLevel,
} from "@/services/DrinkService";
import { Skeleton } from "@/components/ui/Skeleton";


/** Extract size label from the cart drink_name, e.g. "Matcha (Large)" → "large" */
function extractSizeName(drinkName: string): string {
  const match = drinkName.match(/\((\w+)\)$/);
  return match ? match[1].toLowerCase() : "regular";
}

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
  const [loading, setLoading] = useState(true);

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
      setLoading(true);
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
        setLoading(false);
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

    // Build text summary (kept for backward compatibility)
    const orderDetails = cart
      .map((item) => {
        const toppings = item.toppings?.length
          ? `, ${item.toppings.join(", ")}`
          : "";
        return `${item.quantity}x ${item.drink_name} (${item.sugar}${toppings})`;
      })
      .join(" • ");

    // Build structured items for order_items + order_item_toppings
    const items = cart.map((item) => {
      const allToppings = (item.toppings ?? []).map((name) => {
        const found = selectedDrink?.available_toppings?.find(
          (t) => t.name === name,
        );
        return {
          topping_id: found?.id,
          topping_name: name,
          price: found?.price ?? 0,
        };
      });

      return {
        drink_id: item.drink_id,
        drink_name: item.drink_name,
        size_name: extractSizeName(item.drink_name),
        sugar_label: item.sugar,
        unit_price: Number(item.drink_price),
        quantity: item.quantity,
        line_total: Number(item.drink_price) * item.quantity,
        toppings: allToppings,
      };
    });

    try {
      await createOrder({
        customer_name: customerName.trim() || "Guest",
        order_details: orderDetails,
        status: "pending",
        total_price: Number(cartTotal),
        items,
      });

      await clearCart();
      setLastOrderSummary(orderDetails);
      setCustomerName("");
      setCheckoutSuccessOpen(true);
    } catch (error) {
      console.error("❌ Failed to send order to queue:", error);
    }
  };

  const hasNoMenu = drinks.length === 0;

  if (loading) {
    return (
      <div className="bg-cream min-h-screen text-dark-brown font-quicksand">
        <div className="fixed top-0 left-0 h-screen w-64 z-10 hidden lg:block">
          <Sidebar />
        </div>
        
        <div className="fixed top-0 right-0 h-screen w-full lg:w-[22rem] bg-white shadow-xl z-20 flex flex-col hidden lg:flex">
          <div className="p-6 border-b flex-1">
            <Skeleton className="h-8 w-32 mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-16 w-16 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-6 border-t bg-gray-50/50">
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>

        <main className="ml-0 lg:ml-64 mr-0 lg:mr-[22rem] h-screen overflow-y-auto no-scrollbar p-4 lg:p-6 pt-28 lg:pt-6">
          <div className="mb-6">
            <Skeleton className="h-12 w-48 mb-2 bg-gray-300" />
            <Skeleton className="h-5 w-64 bg-gray-200" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="aspect-[4/5] w-full rounded-3xl bg-white/60 border border-gray-100" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
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
          <h1 className="text-5xl font-black font-fredoka">Kiosk</h1>
          <p className="text-lg text-gray-500">Get ready to take orders!</p>
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
  );
};
