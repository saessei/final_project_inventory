import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextArea } from "@/components/ui/TextArea";
import { TextField } from "@/components/ui/TextField";
import { Select } from "@/components/ui/Select";
import { Coffee, Search, Check, Tag, DollarSign, Layers, Plus, Trash2 } from "lucide-react";
import { cx } from "@/components/ui/utils";
import type {
  DrinkModalData,
  DrinkType,
  MenuCategory,
  ToppingType,
} from "@/types/menuTypes";

const SectionLabel = ({ icon: Icon, children }: { icon: any; children: React.ReactNode }) => (
  <div className="flex items-center gap-2 mb-3">
    <Icon size={16} className="text-brown" />
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
      {children}
    </label>
  </div>
);

export const CategoryModal = ({
  item,
  onSave,
  onClose,
}: {
  item: { id?: string; label: string; description: string } | null;
  onSave: (data: { label: string; description: string }) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    label: item?.label || "",
    description: item?.description || "",
  });

  return (
    <Modal
      title={`${item?.id ? "Edit" : "Add"} Category`}
      description="Organize your menu by grouping drinks into categories."
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="rounded-xl px-6">
            Cancel
          </Button>
          <Button variant="solid" onClick={() => onSave(formData)} className="rounded-xl px-8">
            Save Category
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <TextField
          label="Category Name"
          placeholder="e.g. Milk Tea, Fruit Tea"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          className="rounded-2xl py-3"
        />
        <TextArea
          label="Description"
          placeholder="Optional description for this category"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="rounded-2xl py-3"
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
  categories: MenuCategory[];
  onDeleteCategory: (categoryId: string) => Promise<boolean> | boolean;
}

export const DrinkModal = ({
  item,
  onSave,
  onClose,
  allToppings,
  categories,
  onDeleteCategory,
}: DrinkModalProps) => {
  const initialCategory = item?.category || "";
  const initialCategoryExists = initialCategory
    ? categories.some((category) => category.name === initialCategory)
    : false;
  
  const [formData, setFormData] = useState<DrinkModalData>({
    name: item?.name || "",
    category: initialCategory,
    is_available: item?.is_available ?? true,
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
  const [toppingSearch, setToppingSearch] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<MenuCategory | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deletingCategory, setDeletingCategory] = useState(false);

  const filteredToppings = allToppings.filter((t) =>
    t.name.toLowerCase().includes(toppingSearch.toLowerCase()),
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

  const categoryOptions = categories
    .filter((category) => category.name.toLowerCase() !== "beverages")
    .map((category) => category.name);
  const showCustomCategory = categorySelection === "__new__";

  const selectOptions = [
    ...categoryOptions.map((cat) => ({ value: cat, label: cat })),
    {
      value: "__new__",
      label: "+ Add new category",
      icon: <Plus size={14} className="text-brown" />,
    },
  ];

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

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    setDeletingCategory(true);
    setDeleteError("");

    const success = await onDeleteCategory(categoryToDelete.id);
    if (!success) {
      setDeleteError(`Unable to delete \"${categoryToDelete.name}\" right now.`);
      setDeletingCategory(false);
      return;
    }

    if (formData.category === categoryToDelete.name) {
      setFormData({ ...formData, category: "" });
      setCategorySelection("__new__");
      setCustomCategory("");
    }

    setDeletingCategory(false);
    setCategoryToDelete(null);
  };

  return (
    <>
      <Modal
        title={`${item?.id ? "Edit" : "Add"} Drink`}
        description="Update drink details, prices, toppings, and availability."
        icon={<Coffee size={32} strokeWidth={2.5} />}
        onClose={onClose}
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={onClose} className="rounded-xl px-6">
              Cancel
            </Button>
            <Button variant="solid" onClick={() => onSave(formData)} className="rounded-xl px-10">
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-8">
        {/* Availability Toggle Section */}
        <div className="flex items-center justify-between p-5 bg-cream/30 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className={cx(
              "p-3 rounded-2xl",
              formData.is_available ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            )}>
              <Tag size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-dark-brown uppercase tracking-wider">Availability Status</p>
              <p className="text-xs text-gray-500 font-medium">Is this drink currently available for purchase?</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className={cx(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border",
              formData.is_available 
                ? "bg-green-50 text-emerald-600 border-emerald-100" 
                : "bg-red-50 text-rose-600 border-rose-100"
            )}>
              {formData.is_available ? "Available" : "Unavailable"}
            </span>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_available: !formData.is_available })}
              className={cx(
                "relative inline-flex h-7 w-12 items-center rounded-full transition-all focus:outline-none shadow-inner",
                formData.is_available ? "bg-brown" : "bg-gray-300"
              )}
            >
              <span
                className={cx(
                  "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md",
                  formData.is_available ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </div>

        {/* Basic Information Section */}
        <section>
          <SectionLabel icon={Tag}>Basic Information</SectionLabel>
          <div className="grid grid-cols-2 gap-4 p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
            <TextField
              label="Drink Name *"
              placeholder="e.g. Classic Pearl Milk Tea"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="rounded-2xl py-3.5"
              required
            />
            <div className="space-y-4">
              <Select
                label="Category"
                value={categorySelection}
                onChange={handleCategorySelection}
                options={selectOptions}
                placeholder="Select a category"
                optionAction={{
                  label: "Delete category",
                  render: (option, isSelected, closeDropdown) =>
                    option.value !== "__new__" ? (
                      <button
                        type="button"
                        onClick={() => {
                          const matchedCategory = categories.find(
                            (category) => category.name === option.value,
                          );
                          if (!matchedCategory) return;
                          closeDropdown();
                          setDeleteError("");
                          setCategoryToDelete(matchedCategory);
                        }}
                        className={cx(
                          "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all",
                          isSelected
                            ? "border-white/25 text-white hover:bg-white/10"
                            : "border-slate-200 bg-white text-rose-500 hover:border-rose-200 hover:bg-rose-50",
                        )}
                        aria-label={`Delete ${option.label}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    ) : null,
                }}
              />

              {showCustomCategory && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <TextField
                    label="New Category Name"
                    type="text"
                    value={customCategory}
                    onChange={(e) => handleCustomCategoryChange(e.target.value)}
                    placeholder="e.g., Fruit Tea"
                    className="rounded-2xl py-3.5"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section>
          <SectionLabel icon={DollarSign}>Pricing Options (₱)</SectionLabel>
          <div className="grid grid-cols-3 gap-4 p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
            <div className="relative">
              <div className="absolute left-4 top-10 text-gray-400 font-bold">₱</div>
              <TextField
                label="Regular Size *"
                type="text"
                value={formData.regular_price}
                onChange={(e) => handleNumberChange("regular_price", e.target.value)}
                onBlur={() => formatNumber("regular_price")}
                className="rounded-2xl py-3.5 pl-8"
                placeholder="0"
                required
              />
            </div>
            <div className="relative">
              <div className="absolute left-4 top-10 text-gray-400 font-bold">₱</div>
              <TextField
                label="Medium Size *"
                type="text"
                value={formData.medium_price}
                onChange={(e) => handleNumberChange("medium_price", e.target.value)}
                onBlur={() => formatNumber("medium_price")}
                className="rounded-2xl py-3.5 pl-8"
                placeholder="0"
                required
              />
            </div>
            <div className="relative">
              <div className="absolute left-4 top-10 text-gray-400 font-bold">₱</div>
              <TextField
                label="Large Size *"
                type="text"
                value={formData.large_price}
                onChange={(e) => handleNumberChange("large_price", e.target.value)}
                onBlur={() => formatNumber("large_price")}
                className="rounded-2xl py-3.5 pl-8"
                placeholder="0"
                required
              />
            </div>
          </div>
        </section>

        {/* Toppings Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <SectionLabel icon={Layers}>Available Toppings</SectionLabel>
            <div className="relative w-64">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search toppings..." 
                className="w-full pl-11 pr-4 py-2.5 text-sm rounded-2xl border border-slate-200 focus:border-brown focus:ring-4 focus:ring-brown/5 outline-none transition-all placeholder:text-gray-400 font-medium"
                value={toppingSearch}
                onChange={(e) => setToppingSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-[#fcfbf7]/50 rounded-[2rem] border border-slate-100 p-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[18rem] overflow-y-auto no-scrollbar pr-1">
              {filteredToppings.map(topping => {
                const isSelected = formData.selected_toppings.includes(topping.id);
                return (
                  <button
                    key={topping.id}
                    type="button"
                    onClick={() => {
                      const newToppings = isSelected
                        ? formData.selected_toppings.filter(id => id !== topping.id)
                        : [...formData.selected_toppings, topping.id];
                      setFormData({ ...formData, selected_toppings: newToppings });
                    }}
                    className={cx(
                      "flex flex-col items-start p-4 rounded-2xl border transition-all text-left relative group",
                      isSelected 
                        ? "bg-white border-brown ring-1 ring-brown/20 shadow-md translate-y-[-1px]" 
                        : "bg-white border-slate-100 hover:border-slate-200 shadow-sm"
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={cx(
                        "text-sm font-black truncate",
                        isSelected ? "text-brown" : "text-dark-brown"
                      )}>
                        {topping.name}
                      </span>
                      <div className={cx(
                        "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                        isSelected ? "bg-brown border-brown text-white" : "bg-gray-50 border-slate-200"
                      )}>
                        {isSelected && <Check size={12} strokeWidth={4} />}
                      </div>
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-gray-400 group-hover:text-brown transition-colors">
                      +₱{topping.price}
                    </span>
                  </button>
                );
              })}
              {filteredToppings.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <Layers size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-medium text-gray-500">
                    No toppings found matching "{toppingSearch}"
                  </p>
                </div>
              )}
            </div>
            {allToppings.length === 0 && (
              <p className="text-sm text-center text-gray-400 py-8 italic font-medium">
                No toppings available. Go to Toppings tab to add some.
              </p>
            )}
          </div>
        </section>
        </div>
      </Modal>

      {categoryToDelete && (
        <Modal
          title={`Delete ${categoryToDelete.name}?`}
          description="This will remove the category from all drinks."
          onClose={() => {
            if (deletingCategory) return;
            setCategoryToDelete(null);
            setDeleteError("");
          }}
          size="sm"
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setCategoryToDelete(null);
                  setDeleteError("");
                }}
                className="rounded-xl px-6"
                disabled={deletingCategory}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => void handleDeleteCategory()}
                className="rounded-xl px-8"
                isLoading={deletingCategory}
                loadingText="Deleting..."
              >
                Delete
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            {deleteError && <Alert type="error">{deleteError}</Alert>}
            <p className="text-sm text-gray-600">
              Delete "{categoryToDelete.name}"? This will detach it from any drinks that use it.
            </p>
          </div>
        </Modal>
      )}
    </>
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
        {error && <Alert type="error">{error}</Alert>}
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
