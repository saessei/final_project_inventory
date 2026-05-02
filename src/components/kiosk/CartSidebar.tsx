import { Trash } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { TextField } from "@/components/ui/TextField";
import type { CartItem } from "@/hooks/useCart";

interface CartSidebarProps {
  cart: CartItem[];
  cartTotal: number;
  customerName: string;
  onCustomerNameChange: (name: string) => void;
  onCheckout: () => void;
  onDecrementItem: (index: number) => void;
  onIncrementItem: (index: number) => void;
  onRemoveItem: (index: number) => void;
}

export const CartSidebar = ({
  cart,
  cartTotal,
  customerName,
  onCustomerNameChange,
  onCheckout,
  onDecrementItem,
  onIncrementItem,
  onRemoveItem,
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

        <div className="space-y-3 max-h-[45vh] lg:max-h-[60vh] overflow-y-auto no-scrollbar pb-3">
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
                  {item.ice && (
                    <p className="text-xs text-gray-500">Ice: {item.ice}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Toppings:{" "}
                    {item.toppings?.length ? item.toppings.join(", ") : "None"}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white shadow-sm overflow-hidden">
                      <button
                        type="button"
                        onClick={() => onDecrementItem(idx)}
                        className="h-9 w-10 grid place-items-center text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <div className="h-9 min-w-10 px-3 grid place-items-center text-sm font-bold text-slate-800">
                        {item.quantity}
                      </div>
                      <button
                        type="button"
                        onClick={() => onIncrementItem(idx)}
                        className="h-9 w-10 grid place-items-center text-slate-700 hover:bg-slate-50"
                      >
                        +
                      </button>
                    </div>
                    <IconButton
                      label={`Remove ${item.drink_name}`}
                      onClick={() => onRemoveItem(idx)}
                      variant="danger"
                      className="h-auto w-auto rounded-full p-2"
                    >
                      <Trash size={16} />
                    </IconButton>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-6 border-t pt-4">
          <TextField
            id="customerName"
            label="Customer name"
            type="text"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            placeholder="Enter customer name"
            className="border-slate-300 bg-slate-50 text-slate-800 focus:border-dark-brown focus:ring-dark-brown/20"
          />
          <div className="mt-4">
            <p className="text-sm text-gray-500">Subtotal</p>
            <p className="text-3xl font-bold">₱{cartTotal.toFixed(2)}</p>
            <Button
              onClick={handleCheckoutClick}
              variant="solid"
              fullWidth
              className="mt-4"
              disabled={cart.length === 0 || customerName.trim() === ""}
            >
              Check Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};
