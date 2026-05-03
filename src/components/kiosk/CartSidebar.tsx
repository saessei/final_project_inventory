import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { TextField } from "@/components/ui/TextField";
import { Select } from "@/components/ui/Select";
import { CreditCard, Wallet, Banknote, Trash, Edit2, Minus, Plus } from "lucide-react";
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

  const paymentOptions = [
    { value: "cash", label: "Cash", icon: <Banknote size={16}/>},
    { value: "gcash", label: "GCash", icon: <Wallet size={16} /> },
    { value: "card", label: "Card", icon: <CreditCard size={16} /> },
  ];

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
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="font-black text-sm text-dark-brown leading-tight pr-4">
                        {item.drink_name}
                      </span>
                      <span className="font-bold text-sm text-dark-brown whitespace-nowrap">
                        ₱{total.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {item.size}
                      </span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        {item.sugar}
                      </span>
                      {item.toppings?.length > 0 && (
                        <span className="text-[10px] font-medium text-gray-400 truncate max-w-[140px]">
                          + {item.toppings.join(", ")}
                        </span>
                      )}
                      {item.notes && (
                        <p className="w-full text-[10px] italic font-medium text-brown/70 truncate">
                          "{item.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                      <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden h-9">
                        <button
                          type="button"
                          onClick={() => onDecrementItem(idx)}
                          className="w-8 h-full flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-brown disabled:opacity-30 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} strokeWidth={3} />
                        </button>
                        <div className="px-3 h-full flex items-center justify-center text-xs font-black text-dark-brown bg-cream/20 min-w-[32px]">
                          {item.quantity}
                        </div>
                        <button
                          type="button"
                          onClick={() => onIncrementItem(idx)}
                          className="w-8 h-full flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-brown transition-colors"
                        >
                          <Plus size={14} strokeWidth={3} />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEditItem(idx)}
                          className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-brown hover:border-brown/30 transition-all shadow-sm"
                          title="Edit Item"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(idx)}
                          className="flex items-center justify-center w-9 h-9 rounded-xl border border-rose-100 bg-rose-50/30 text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm"
                          title="Remove Item"
                        >
                          <Trash size={16} />
                        </button>
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
            label="Customer Name"
            type="text"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            placeholder="Enter customer name"
            className="border-slate-200 bg-white text-slate-800 focus:border-brown focus:ring-0 shadow-sm"
          />
          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={onPaymentMethodChange}
            options={paymentOptions}
            className="mt-3"
          />
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
