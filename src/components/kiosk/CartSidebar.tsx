import { Trash, Edit2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { TextField } from "@/components/ui/TextField";
import type { CartItem } from "@/hooks/useCart";

interface CartSidebarProps {
  cart: CartItem[];
  cartTotal: number;
  customerName: string;
  paymentMethod: string;
  isCheckingOut?: boolean;
  onCustomerNameChange: (name: string) => void;
  onPaymentMethodChange: (method: string) => void;
  onCheckout: () => void;
  onDecrementItem: (index: number) => void;
  onIncrementItem: (index: number) => void;
  onRemoveItem: (index: number) => void;
  onEditItem: (index: number) => void;
}

export const CartSidebar = ({
  cart,
  cartTotal,
  customerName,
  paymentMethod,
  isCheckingOut = false,
  onCustomerNameChange,
  onPaymentMethodChange,
  onCheckout,
  onDecrementItem,
  onIncrementItem,
  onRemoveItem,
  onEditItem,
}: CartSidebarProps) => {
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleCheckoutClick = () => {
    onCheckout();
    setIsMobileOpen(false);
  };

  const panelClassName =
    "fixed bg-white border-slate-200 p-5 overflow-y-auto no-scrollbar transition-transform duration-300 ease-in-out " +
    "lg:top-0 lg:right-0 lg:left-auto lg:bottom-auto lg:h-screen lg:w-full lg:max-w-[22rem] lg:border-l lg:border-t-0 lg:rounded-none lg:z-10 " +
    "bottom-0 left-0 right-0 h-[85vh] rounded-t-3xl border-t z-50 " +
    (isMobileOpen ? "translate-y-0" : "translate-y-full lg:translate-y-0");

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-40 rounded-full bg-dark-brown text-white px-4 py-3 shadow-xl"
        aria-label="Open cart"
        aria-expanded={isMobileOpen}
      >
        Cart ({itemCount})
      </button>

      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={panelClassName}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Cart</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wide bg-green-100 text-emerald-700 px-2 py-1 rounded-full">
              {itemCount} items
            </span>
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700"
              aria-label="Close cart"
            >
              Close
            </button>
          </div>
        </div>

        <div className="space-y-3 max-h-[45vh] lg:max-h-[50vh] overflow-y-auto no-scrollbar pb-3">
          {cart.length === 0 ? (
            <div className="py-6 text-center text-gray-500">
              <p className="font-semibold text-gray-600 mb-1">No items added yet</p>
              <p className="text-sm">Select a drink to begin an order</p>
            </div>
          ) : (
            cart.map((item, idx) => {
              const total = Number(item.drink_price) * item.quantity;
              return (
                <div
                  key={item.id}
                  className="border border-slate-200 rounded-xl p-3 bg-white shadow-sm"
                >
                  <div className="flex justify-between text-sm font-bold text-dark-brown">
                    <span>{item.drink_name}</span>
                    <span>₱{total.toFixed(2)}</span>
                  </div>
                  <div className="mt-1 space-y-0.5">
                    <p className="text-xs text-gray-500 capitalize">
                      Size: {item.size}
                    </p>
                    <p className="text-xs text-gray-500">
                      Sugar: {item.sugar}
                    </p>
                    <p className="text-xs text-gray-500">
                      Toppings:{" "}
                      {item.toppings?.length ? item.toppings.join(", ") : "None"}
                    </p>
                    {item.notes && (
                      <p className="text-xs font-medium text-brown">
                        Notes: {item.notes}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => onDecrementItem(idx)}
                        className="h-8 w-8 grid place-items-center text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <div className="h-8 min-w-8 px-2 grid place-items-center text-sm font-bold text-slate-800 bg-white">
                        {item.quantity}
                      </div>
                      <button
                        type="button"
                        onClick={() => onIncrementItem(idx)}
                        className="h-8 w-8 grid place-items-center text-slate-700 hover:bg-slate-200"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onEditItem(idx)}
                        className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1.5 text-xs font-semibold text-gray-600 hover:bg-slate-50 hover:text-brown"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <IconButton
                        label={`Remove ${item.drink_name}`}
                        onClick={() => onRemoveItem(idx)}
                        variant="danger"
                        className="h-auto w-auto rounded-md p-1.5"
                      >
                        <Trash size={16} />
                      </IconButton>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 border-t pt-4">
          <TextField
            id="customerName"
            label="Customer Name (Optional)"
            type="text"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            placeholder="Enter customer name"
            className="border-slate-200 bg-white text-slate-800 focus:border-brown focus:ring-0 shadow-sm"
          />
          <div className="mt-3">
            <label className="block text-sm font-semibold mb-1 text-slate-700">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brown focus:outline-none focus:ring-0 shadow-sm"
            >
              <option value="cash">Cash</option>
              <option value="gcash">GCash</option>
              <option value="card">Card</option>
            </select>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold text-gray-600">Subtotal</p>
              <p className="text-2xl font-black text-dark-brown">₱{cartTotal.toFixed(2)}</p>
            </div>
            <Button
              onClick={handleCheckoutClick}
              variant="solid"
              fullWidth
              disabled={isCheckingOut || cart.length === 0}
              isLoading={isCheckingOut}
              loadingText="Sending to queue..."
              className="py-3 text-lg bg-brown hover:bg-dark-brown"
            >
              Place Order
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};
