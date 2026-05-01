import { CheckCircle2 } from "lucide-react";

interface CheckoutSuccessModalProps {
  orderSummary: string;
  onNewOrder: () => void;
}

export const CheckoutSuccessModal = ({
  orderSummary,
  onNewOrder,
}: CheckoutSuccessModalProps) => (
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
        {orderSummary && (
          <div className="mt-4 rounded-2xl bg-[#f8f7f1] p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
              Order details
            </p>
            <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
              {orderSummary}
            </p>
          </div>
        )}
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onNewOrder}
            className="px-5 py-2 rounded-xl bg-dark-brown text-white text-sm font-semibold hover:bg-brown-dark cursor-pointer"
          >
            New order
          </button>
        </div>
      </div>
    </div>
  </div>
);
