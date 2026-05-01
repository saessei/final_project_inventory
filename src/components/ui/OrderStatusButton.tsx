import { Button } from "./Button";

type OrderStatus = "pending" | "preparing" | "completed";

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
    color: "bg-brown/20",
    text: "text-dark-brown",
  },
  preparing: {
    label: "Mark as Complete",
    color: "bg-orange-100",
    text: "text-brown-two",
  },
  completed: {
    label: "Archive Order",
    color: "bg-green-100",
    text: "text-green-500",
  },
};

export const OrderStatusButton = ({ status, onClick }: OrderButtonProps) => {
  const cfg = config[status];

  if (!cfg) return null;

  const { label, color, text } = cfg;

  return (
    <div>
      <Button
        variant="secondary"
        className={`${color} ${text} rounded-2xl font-quicksand font-bold hover:scale-100`}
        onClick={onClick}
      >
        {label}
      </Button>
    </div>
  );
};
