import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextArea } from "@/components/ui/TextArea";
import { TextField } from "@/components/ui/TextField";
import type {
  CategoryType,
  DrinkModalData,
  DrinkType,
  ToppingType,
} from "@/types/menuTypes";

interface CategoryModalProps {
  item: CategoryType | null;
  onSave: (data: { label: string; description: string }) => void;
  onClose: () => void;
}

export const CategoryModal = ({
  item,
  onSave,
  onClose,
}: CategoryModalProps) => {
  const [formData, setFormData] = useState({
    label: item?.label || "",
    description: item?.description || "",
  });

  return (
    <Modal
      title={`${item?.id ? "Edit" : "Add"} Category`}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="solid" onClick={() => onSave(formData)}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <TextField
          placeholder="Category Name"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          className="rounded-lg py-2"
        />
        <TextArea
          placeholder="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="rounded-lg py-2"
          rows={3}
        />
      </div>
    </Modal>
  );
};

interface DrinkModalProps {
  item: DrinkType | null;
  onSave: (data: DrinkModalData) => void;
  onClose: () => void;
  allToppings: ToppingType[];
  categories: string[];
}

export const DrinkModal = ({
  item,
  onSave,
  onClose,
  allToppings,
  categories,
}: DrinkModalProps) => {
  const initialCategory = item?.category || "";
  const initialCategoryExists = initialCategory
    ? categories.includes(initialCategory)
    : false;
  const [formData, setFormData] = useState<DrinkModalData>({
    name: item?.name || "",
    description: item?.description || "",
    image_url: item?.image_url || "",
    category: initialCategory,
    regular_price: item?.sizes?.regular?.toString() || "",
    medium_price: item?.sizes?.medium?.toString() || "",
    large_price: item?.sizes?.large?.toString() || "",
    selected_toppings: item?.available_toppings?.map((t) => t.id) || [],
  });
  const [categorySelection, setCategorySelection] = useState(
    initialCategoryExists ? initialCategory : "__new__",
  );
  const [customCategory, setCustomCategory] = useState(
    initialCategoryExists ? "" : initialCategory,
  );

  const handleNumberChange = (
    field: keyof Pick<
      DrinkModalData,
      "regular_price" | "medium_price" | "large_price"
    >,
    value: string,
  ) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFormData({ ...formData, [field]: value });
    }
  };

  const formatNumber = (
    field: keyof Pick<
      DrinkModalData,
      "regular_price" | "medium_price" | "large_price"
    >,
  ) => {
    const value = formData[field];
    if (value === "" || value === undefined) {
      setFormData({ ...formData, [field]: "0" });
    }
  };

  const categoryOptions = categories.length > 0 ? categories : [];
  const showCustomCategory = categorySelection === "__new__";

  const handleCategorySelection = (value: string) => {
    setCategorySelection(value);
    if (value !== "__new__") {
      setCustomCategory("");
      setFormData({ ...formData, category: value });
    } else {
      setFormData({ ...formData, category: customCategory.trim() });
    }
  };

  const handleCustomCategoryChange = (value: string) => {
    setCustomCategory(value);
    setFormData({
      ...formData,
      category: value.trim(),
    });
  };

  return (
    <Modal
      title={`${item?.id ? "Edit" : "Add"} Drink`}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="solid" onClick={() => onSave(formData)}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <TextField
          label="Drink Name *"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="rounded-lg py-2"
          required
        />

        <div>
          <label className="font-semibold text-sm">Category</label>
          <div className="mt-1 space-y-2">
            <select
              value={categorySelection}
              onChange={(e) => handleCategorySelection(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-dark-brown"
            >
              <option value="">Select a category</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
              <option value="__new__">Add new category</option>
            </select>

            {showCustomCategory && (
              <TextField
                label="New Category Name"
                type="text"
                value={customCategory}
                onChange={(e) => handleCustomCategoryChange(e.target.value)}
                placeholder="e.g., Fruit Tea"
                className="rounded-lg py-2"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <TextField
            label="Regular Price (₱) *"
            type="text"
            value={formData.regular_price}
            onChange={(e) =>
              handleNumberChange("regular_price", e.target.value)
            }
            onBlur={() => formatNumber("regular_price")}
            className="rounded-lg py-2"
            placeholder="0"
          />
          <TextField
            label="Medium Price (₱) *"
            type="text"
            value={formData.medium_price}
            onChange={(e) => handleNumberChange("medium_price", e.target.value)}
            onBlur={() => formatNumber("medium_price")}
            className="rounded-lg py-2"
            placeholder="0"
          />
          <TextField
            label="Large Price (₱) *"
            type="text"
            value={formData.large_price}
            onChange={(e) => handleNumberChange("large_price", e.target.value)}
            onBlur={() => formatNumber("large_price")}
            className="rounded-lg py-2"
            placeholder="0"
          />
        </div>

        <div>
          <label className="font-semibold text-sm">Available Toppings</label>
          <div className="grid grid-cols-2 gap-2 mt-1 border rounded-lg p-2 max-h-40 overflow-y-auto no-scrollbar">
            {allToppings.map((topping) => (
              <label
                key={topping.id}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={formData.selected_toppings.includes(topping.id)}
                  onChange={(e) => {
                    const newToppings = e.target.checked
                      ? [...formData.selected_toppings, topping.id]
                      : formData.selected_toppings.filter(
                          (id) => id !== topping.id,
                        );
                    setFormData({
                      ...formData,
                      selected_toppings: newToppings,
                    });
                  }}
                />
                {topping.name} (+₱{topping.price})
              </label>
            ))}
          </div>
          {allToppings.length === 0 && (
            <p className="text-sm text-gray-500 mt-1">
              No toppings available. Go to Toppings tab to add some.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

interface ToppingModalProps {
  item: ToppingType | null;
  onSave: (data: { name: string; price: number }) => void | Promise<void>;
  onClose: () => void;
}

export const ToppingModal = ({ item, onSave, onClose }: ToppingModalProps) => {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    price: item?.price?.toString() || "0",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleNumberChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFormData({ ...formData, price: value });
    }
  };

  const handleSubmit = async () => {
    setError("");

    if (!formData.name.trim()) {
      setError("Please enter a topping name");
      return;
    }

    const price = formData.price === "" ? 0 : parseFloat(formData.price);
    if (isNaN(price)) {
      setError("Please enter a valid price");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: formData.name.trim(),
        price,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={`${item?.id ? "Edit" : "Add"} Topping`}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="solid"
            onClick={handleSubmit}
            isLoading={saving}
            loadingText="Saving..."
          >
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}
        <TextField
          label="Topping Name *"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Pearl (Boba)"
          className="rounded-lg py-2"
          required
        />
        <TextField
          label="Price (₱) *"
          type="text"
          value={formData.price}
          onChange={(e) => handleNumberChange(e.target.value)}
          placeholder="0"
          className="rounded-lg py-2"
          required
        />
      </div>
    </Modal>
  );
};
