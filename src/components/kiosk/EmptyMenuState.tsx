import { Plus } from "lucide-react";

interface EmptyMenuStateProps {
  onAddMenuItems: () => void;
}

export const EmptyMenuState = ({ onAddMenuItems }: EmptyMenuStateProps) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <h2 className="text-3xl font-bold text-dark-brown mb-3">
        No Menu Available
      </h2>
      <p className="text-gray-500 mb-8 max-w-md">
        The menu is currently empty. Please add some drinks to start taking
        orders.
      </p>
      <button
        onClick={onAddMenuItems}
        className="inline-flex items-center gap-2 px-6 py-3 bg-dark-brown text-white rounded-xl hover:bg-brown-dark transition-colors font-semibold"
      >
        <Plus size={20} />
        Add Menu Items
      </button>
    </div>
  </div>
);
