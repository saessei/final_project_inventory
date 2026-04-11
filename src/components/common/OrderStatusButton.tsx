
type OrderStatus = "pending" | "preparing" | "completed";

interface OrderButtonProps {
  status: OrderStatus;
  onClick: () => void;
}

export const OrderStatusButton = ({ status, onClick }: OrderButtonProps) => {
  const config = {
    pending: { label: "Start Preparing", color: "bg-brown/20", text: "text-dark-brown" },
    preparing: { label: "Mark as Complete", color: "bg-orange-100", text: "text-brown-two" },
    completed: { label: "Archive Order", color: "bg-green-100", text:"text-green-500" },
  };

  const { label, color, text} = config[status];

  return (
    <div>
      <button
        className={`${color} ${text} cursor-pointer rounded-2xl font-quicksand px-4 py-2`}
        onClick={onClick}
      >
        {label}
      </button>
    </div>
  );
};
