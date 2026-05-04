import { Button } from "@/components/ui/Button";

type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled";

interface OrderButtonProps {
  status: OrderStatus;
  onClick: () => void;
}

const config: Record<
  OrderStatus,
  { label: string; color: string; text: string }
> = {
  pending: {
    label: "Start Preparing",
    color: "bg-brown/10",
    text: "text-dark-brown",
  },
  preparing: {
    label: "Mark Ready",
    color: "bg-orange-50",
    text: "text-orange-600",
  },
  ready: {
    label: "Mark Picked Up",
    color: "bg-green-50",
    text: "text-emerald-600",
  },
  completed: {
    label: "Archive Order",
    color: "bg-gray-50",
    text: "text-gray-500",
  },
  cancelled: {
    label: "Archived",
    color: "bg-gray-100",
    text: "text-gray-400",
  },
};

export const OrderStatusButton = ({ status, onClick }: OrderButtonProps) => {
  const cfg = config[status];

  if (!cfg) return null;

  const { label, color, text } = cfg;

  return (
    <div className="w-full">
      <Button
        variant="secondary"
        fullWidth
        className={`${color} ${text} rounded-2xl font-quicksand font-black text-xs uppercase tracking-wider hover:scale-100 transition-all border border-current/10`}
        onClick={onClick}
      >
        {label}
      </Button>
    </div>
  );
};
