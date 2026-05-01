// src/components/Admin/MenuManager.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Upload,
  Tag,
  TrendingUp,
  FolderOpen,
  CupSoda,
  CirclePlus,
  Candy,
} from "lucide-react";
import { dynamicMenu } from "@/services/DynamicMenuService";
import { drinkService } from "@/services/DrinkService";
import { Sidebar } from "@/components/ui/Sidebar";
import { UserAuth } from "@/components/auth/AuthContext";
import { AdminPinModal } from "@/components/ui/AdminPinModal";
import { useNavigate } from "react-router-dom";
import supabase from "@/lib/supabaseClient";
import placeholderImg from "@/assets/Placeholder.jpg";

type TabType = "categories" | "drinks" | "toppings" | "sugar-levels";

interface SugarLevel {
  id: string;
  percentage: number;
  label: string;
  price_addition: number;
}

interface DrinkType {
  id: string;
  name: string;
  description: string;
  image_url: string;
  sizes: {
    regular: number;
    medium: number;
    large: number;
  };
  available_toppings: ToppingType[];
}

interface ToppingType {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
}

interface CategoryType {
  id: string;
  label: string;
  description: string;
  drinkIds: string[];
}

interface DrinkModalData {
  name: string;
  description: string;
  image_url: string;
  regular_price: string;
  medium_price: string;
  large_price: string;
  selected_toppings: string[];
}

// Sugar Level Card Component
const SugarLevelCard = ({
  level,
  onUpdate,
}: {
  level: SugarLevel;
  onUpdate: (id: string, price: number) => void;
}) => {
  const [price, setPrice] = useState(level.price_addition.toString());
  const [isDirty, setIsDirty] = useState(false);

  const handleBlur = () => {
    const numPrice = parseFloat(price) || 0;
    if (isDirty && numPrice !== level.price_addition) {
      onUpdate(level.id, numPrice);
      setIsDirty(false);
    }
    setPrice(numPrice.toString());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setPrice(value);
      setIsDirty(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <h3 className="font-bold text-xl text-center">{level.label}</h3>
      <p className="text-center text-gray-500">{level.percentage}% sweetness</p>
      <div className="mt-4">
        <label className="text-sm font-semibold block mb-1">
          Additional Price: ₱
        </label>
        <input
          type="text"
          value={price}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-dark-brown focus:border-transparent"
          placeholder="0"
        />
        {isDirty && (
          <p className="text-xs text-gray-400 mt-1">
            Press Enter or click outside to save
          </p>
        )}
      </div>
    </div>
  );
};

// Drink Card Component
const DrinkCard = ({
  drink,
  onEdit,
  onDelete,
}: {
  drink: DrinkType;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const [imageError, setImageError] = useState(false);

  const getImageSrc = () => {
    if (imageError) return placeholderImg;
    if (drink.image_url && drink.image_url !== "") return drink.image_url;
    return placeholderImg;
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer overflow-hidden">
      <div className="relative">
        <img
          src={getImageSrc()}
          alt={drink.name}
          className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={onEdit}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-white rounded-full shadow-md hover:bg-red-100 text-red-600 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg">{drink.name}</h3>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {drink.description}
        </p>
        <div className="mt-3 pt-2 border-t border-slate-200">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center">
              <span className="text-xs text-gray-500">Regular</span>
              <p className="font-semibold">₱{drink.sizes.regular}</p>
            </div>
            <div className="text-center">
              <span className="text-xs text-gray-500">Medium</span>
              <p className="font-semibold">₱{drink.sizes.medium}</p>
            </div>
            <div className="text-center">
              <span className="text-xs text-gray-500">Large</span>
              <p className="font-semibold">₱{drink.sizes.large}</p>
            </div>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          <p>
            Toppings:{" "}
            {drink.available_toppings
              ?.map((t: ToppingType) => t.name)
              .join(", ") || "None"}
          </p>
        </div>
      </div>
    </div>
  );
};

// Topping Card Component
const ToppingCard = ({
  topping,
  onEdit,
  onDelete,
}: {
  topping: ToppingType;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Tag size={20} className="text-brown-two" />
            <h3 className="font-bold text-lg">{topping.name}</h3>
          </div>
          <p className="text-2xl font-bold text-dark-brown mt-2">
            ₱{topping.price}
          </p>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-100 text-red-600 rounded-full transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Category Card Component
const CategoryCard = ({
  category,
  onEdit,
  onDelete,
}: {
  category: CategoryType;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{category.label}</h3>
          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
          <p className="text-xs text-gray-400 mt-1">
            {category.drinkIds.length} drinks
          </p>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-100 text-red-600 rounded-full transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const MenuManager = () => {
  const [activeTab, setActiveTab] = useState<TabType>("drinks");
  const [showModal, setShowModal] = useState(false);
  const [showToppingModal, setShowToppingModal] = useState(false);
  const [editingItem, setEditingItem] = useState<
    DrinkType | CategoryType | null
  >(null);
  const [editingTopping, setEditingTopping] = useState<ToppingType | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [drinks, setDrinks] = useState<DrinkType[]>([]);
  const [toppings, setToppings] = useState<ToppingType[]>([]);
  const [sugarLevels, setSugarLevels] = useState<SugarLevel[]>([]);

  const { session, loading: authLoading, refreshSession } = UserAuth();
  const navigate = useNavigate();

  const pinVerifiedRef = useRef(false);
  const modalShownRef = useRef(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const cats = await dynamicMenu.getCategories();
    setCategories(cats);

    const [drinksData, toppingsData, sugarData] = await Promise.all([
      drinkService.getAllDrinks(),
      drinkService.getAllToppings(),
      drinkService.getAllSugarLevels(),
    ]);

    setDrinks(drinksData);
    setToppings(toppingsData);
    setSugarLevels(sugarData);
    setLoading(false);
  }, []);

  const checkAccess = useCallback(async () => {
    if (authLoading) return;
    if (!session?.user?.id) {
      navigate("/signin");
      return;
    }
    if (pinVerifiedRef.current) {
      setIsAuthorized(true);
      loadData();
      return;
    }
    if (modalShownRef.current) return;
    modalShownRef.current = true;
    setShowPinModal(true);
  }, [authLoading, session, navigate, loadData]);

  useEffect(() => {
    if (!authLoading) {
      checkAccess();
    }
  }, [authLoading, checkAccess]);

  const handlePinSuccess = async () => {
    pinVerifiedRef.current = true;
    setShowPinModal(false);
    await refreshSession();
    setIsAuthorized(true);
    loadData();
  };

  const handlePinCancel = () => {
    setShowPinModal(false);
    navigate("/kiosk");
  };

  const handleSaveCategory = async (data: {
    label: string;
    description: string;
  }) => {
    if (editingItem && "id" in editingItem) {
      await dynamicMenu.updateCategory(editingItem.id, data);
    } else {
      await dynamicMenu.addCategory(data);
    }
    setShowModal(false);
    setEditingItem(null);
    await loadData();
  };

  const handleDeleteCategory = async (id: string, label: string) => {
    if (confirm(`Delete category "${label}"?`)) {
      await dynamicMenu.deleteCategory(id);
      await loadData();
    }
  };

  const handleSaveDrink = async (data: DrinkModalData) => {
    if (editingItem && "id" in editingItem) {
      await drinkService.updateDrink(
        editingItem.id,
        {
          name: data.name,
          description: data.description,
          image_url: data.image_url,
        },
        {
          regular: parseFloat(data.regular_price) || 0,
          medium: parseFloat(data.medium_price) || 0,
          large: parseFloat(data.large_price) || 0,
        },
        data.selected_toppings,
      );
    } else {
      await drinkService.createDrink(
        {
          name: data.name,
          description: data.description,
          image_url: data.image_url,
        },
        {
          regular: parseFloat(data.regular_price) || 0,
          medium: parseFloat(data.medium_price) || 0,
          large: parseFloat(data.large_price) || 0,
        },
        data.selected_toppings || [],
      );
    }
    setShowModal(false);
    setEditingItem(null);
    await loadData();
  };

  const handleDeleteDrink = async (id: string, name: string) => {
    if (confirm(`Delete drink "${name}"?`)) {
      await drinkService.deleteDrink(id);
      await loadData();
    }
  };

  const handleAddTopping = () => {
    setEditingTopping(null);
    setShowToppingModal(true);
  };

  const handleEditTopping = (topping: ToppingType) => {
    setEditingTopping(topping);
    setShowToppingModal(true);
  };

  const handleSaveTopping = async (data: { name: string; price: number }) => {
    if (editingTopping?.id) {
      await drinkService.updateTopping(
        editingTopping.id,
        data.name,
        data.price,
      );
    } else {
      await drinkService.addTopping(data.name, data.price);
    }
    setShowToppingModal(false);
    setEditingTopping(null);
    await loadData();
  };

  const handleDeleteTopping = async (id: string, name: string) => {
    if (
      confirm(`Delete topping "${name}"? This will remove it from all drinks.`)
    ) {
      await drinkService.deleteTopping(id);
      await loadData();
    }
  };

  const handleUpdateSugarLevel = async (id: string, price_addition: number) => {
    await drinkService.updateSugarLevel(id, price_addition);
    await loadData();
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `drinks/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("drink-images")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("drink-images")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  if (authLoading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-brown mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized && !showPinModal) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <p className="text-gray-500">Verifying access...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading && isAuthorized) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="text-center">Loading menu manager...</div>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen text-dark-brown font-quicksand">
      <div className={showPinModal ? "pointer-events-none opacity-60" : ""}>
        <div className="fixed top-0 left-0 h-screen w-64 z-10">
          <Sidebar />
        </div>

        <main className="ml-0 lg:ml-64 h-screen overflow-y-auto p-4 lg:p-6 pt-20 lg:pt-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-black font-fredoka">Menu Manager</h1>
              <p className="text-gray-600 mt-1">
                Manage categories, drinks, toppings, and sugar levels
              </p>
            </div>

            <div className="flex gap-2 mb-6 border-b flex-wrap">
              <button
                onClick={() => setActiveTab("categories")}
                className={`px-6 py-3 font-semibold transition-all rounded-t-lg ${
                  activeTab === "categories"
                    ? "text-dark-brown border-b-2 border-dark-brown bg-white"
                    : "text-gray-500 hover:text-dark-brown"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <FolderOpen size={18} />
                  Categories ({categories.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab("drinks")}
                className={`px-6 py-3 font-semibold transition-all rounded-t-lg ${
                  activeTab === "drinks"
                    ? "text-dark-brown border-b-2 border-dark-brown bg-white"
                    : "text-gray-500 hover:text-dark-brown"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <CupSoda size={18} />
                  Drinks ({drinks.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab("toppings")}
                className={`px-6 py-3 font-semibold transition-all rounded-t-lg ${
                  activeTab === "toppings"
                    ? "text-dark-brown border-b-2 border-dark-brown bg-white"
                    : "text-gray-500 hover:text-dark-brown"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <CirclePlus size={18} />
                  Toppings ({toppings.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab("sugar-levels")}
                className={`px-6 py-3 font-semibold transition-all rounded-t-lg ${
                  activeTab === "sugar-levels"
                    ? "text-dark-brown border-b-2 border-dark-brown bg-white"
                    : "text-gray-500 hover:text-dark-brown"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Candy size={18} />
                  Sugar Levels
                </span>
              </button>
            </div>

            {/* Categories Tab */}
            {activeTab === "categories" && (
              <div>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setShowModal(true);
                  }}
                  className="mb-4 flex items-center gap-2 px-4 py-2 bg-dark-brown text-white rounded-lg hover:opacity-90"
                >
                  <Plus size={18} /> Add Category
                </button>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categories.map((cat) => (
                    <CategoryCard
                      key={cat.id}
                      category={cat}
                      onEdit={() => {
                        setEditingItem(cat);
                        setShowModal(true);
                      }}
                      onDelete={() => handleDeleteCategory(cat.id, cat.label)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Drinks Tab */}
            {activeTab === "drinks" && (
              <div>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setShowModal(true);
                  }}
                  className="mb-4 flex items-center gap-2 px-4 py-2 bg-dark-brown text-white rounded-lg hover:opacity-90"
                >
                  <Plus size={18} /> Add Drink
                </button>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {drinks.map((drink: DrinkType) => (
                    <DrinkCard
                      key={drink.id}
                      drink={drink}
                      onEdit={() => {
                        setEditingItem(drink);
                        setShowModal(true);
                      }}
                      onDelete={() => handleDeleteDrink(drink.id, drink.name)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Toppings Tab */}
            {activeTab === "toppings" && (
              <div>
                <button
                  onClick={handleAddTopping}
                  className="mb-4 flex items-center gap-2 px-4 py-2 bg-dark-brown text-white rounded-lg hover:opacity-90 transition-colors"
                >
                  <Plus size={18} /> Add Topping
                </button>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {toppings.map((topping: ToppingType) => (
                    <ToppingCard
                      key={topping.id}
                      topping={topping}
                      onEdit={() => handleEditTopping(topping)}
                      onDelete={() =>
                        handleDeleteTopping(topping.id, topping.name)
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sugar Levels Tab */}
            {activeTab === "sugar-levels" && (
              <div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {sugarLevels.map((level: SugarLevel) => (
                    <SugarLevelCard
                      key={level.id}
                      level={level}
                      onUpdate={handleUpdateSugarLevel}
                    />
                  ))}
                </div>
                <div className="mt-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={20} className="text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      Sugar levels: 25%, 50%, 75% have no additional charge by
                      default. 100% sweetness adds ₱5.00. Just type the price
                      directly in the input field. Press Enter or click outside
                      to save.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Category Modal */}
        {showModal && activeTab === "categories" && (
          <CategoryModal
            item={editingItem as CategoryType}
            onSave={handleSaveCategory}
            onClose={() => {
              setShowModal(false);
              setEditingItem(null);
            }}
          />
        )}

        {/* Drink Modal */}
        {showModal && activeTab === "drinks" && (
          <DrinkModal
            item={editingItem as DrinkType}
            onSave={handleSaveDrink}
            onClose={() => {
              setShowModal(false);
              setEditingItem(null);
            }}
            allToppings={toppings}
            uploadImage={uploadImage}
          />
        )}

        {/* Topping Modal */}
        {showToppingModal && (
          <ToppingModalComponent
            item={editingTopping}
            onSave={handleSaveTopping}
            onClose={() => {
              setShowToppingModal(false);
              setEditingTopping(null);
            }}
          />
        )}
      </div>

      {showPinModal && session && (
        <AdminPinModal onSuccess={handlePinSuccess} onClose={handlePinCancel} />
      )}
    </div>
  );
};

// Category Modal Component
const CategoryModal = ({
  item,
  onSave,
  onClose,
}: {
  item: CategoryType | null;
  onSave: (data: { label: string; description: string }) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    label: item?.label || "",
    description: item?.description || "",
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {item?.id ? "Edit" : "Add"} Category
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <input
            placeholder="Category Name"
            value={formData.label}
            onChange={(e) =>
              setFormData({ ...formData, label: e.target.value })
            }
            className="w-full p-2 border rounded-lg"
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full p-2 border rounded-lg"
            rows={3}
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-dark-brown text-white rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// Drink Modal Component
const DrinkModal = ({
  item,
  onSave,
  onClose,
  allToppings,
  uploadImage,
}: {
  item: DrinkType | null;
  onSave: (data: DrinkModalData) => void;
  onClose: () => void;
  allToppings: ToppingType[];
  uploadImage: (file: File) => Promise<string>;
}) => {
  const [formData, setFormData] = useState<DrinkModalData>({
    name: item?.name || "",
    description: item?.description || "",
    image_url: item?.image_url || "",
    regular_price: item?.sizes?.regular?.toString() || "",
    medium_price: item?.sizes?.medium?.toString() || "",
    large_price: item?.sizes?.large?.toString() || "",
    selected_toppings: item?.available_toppings?.map((t) => t.id) || [],
  });
  const [imagePreview, setImagePreview] = useState(item?.image_url || "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");
    try {
      const url = await uploadImage(file);
      setImagePreview(url);
      setFormData({ ...formData, image_url: url });
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

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

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {item?.id ? "Edit" : "Add"} Drink
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="font-semibold text-sm">Drink Photo</label>
            <div className="mt-1 flex items-center gap-4">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded-lg"
                />
              )}
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2">
                <Upload size={18} />
                <span>{uploading ? "Uploading..." : "Choose Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            {uploadError && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {uploadError}
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="font-semibold text-sm">Drink Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-2 border rounded-lg mt-1"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-semibold text-sm">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-2 border rounded-lg mt-1"
              rows={3}
              placeholder="Describe the drink..."
            />
          </div>

          {/* Sizes */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-sm">
                Regular Price (₱) *
              </label>
              <input
                type="text"
                value={formData.regular_price}
                onChange={(e) =>
                  handleNumberChange("regular_price", e.target.value)
                }
                onBlur={() => formatNumber("regular_price")}
                className="w-full p-2 border rounded-lg mt-1"
                placeholder="0"
              />
            </div>
            <div>
              <label className="font-semibold text-sm">
                Medium Price (₱) *
              </label>
              <input
                type="text"
                value={formData.medium_price}
                onChange={(e) =>
                  handleNumberChange("medium_price", e.target.value)
                }
                onBlur={() => formatNumber("medium_price")}
                className="w-full p-2 border rounded-lg mt-1"
                placeholder="0"
              />
            </div>
            <div>
              <label className="font-semibold text-sm">Large Price (₱) *</label>
              <input
                type="text"
                value={formData.large_price}
                onChange={(e) =>
                  handleNumberChange("large_price", e.target.value)
                }
                onBlur={() => formatNumber("large_price")}
                className="w-full p-2 border rounded-lg mt-1"
                placeholder="0"
              />
            </div>
          </div>

          {/* Toppings Selection */}
          <div>
            <label className="font-semibold text-sm">Available Toppings</label>
            <div className="grid grid-cols-2 gap-2 mt-1 border rounded-lg p-2 max-h-40 overflow-y-auto">
              {allToppings.map((topping: ToppingType) => (
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
                            (id: string) => id !== topping.id,
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

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-dark-brown text-white rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// Topping Modal Component
const ToppingModalComponent = ({
  item,
  onSave,
  onClose,
}: {
  item: ToppingType | null;
  onSave: (data: { name: string; price: number }) => void;
  onClose: () => void;
}) => {
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
        price: price,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {item?.id ? "Edit" : "Add"} Topping
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={24} />
          </button>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="font-semibold text-sm">Topping Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Pearl (Boba)"
              className="w-full p-2 border rounded-lg mt-1"
              required
            />
          </div>
          <div>
            <label className="font-semibold text-sm">Price (₱) *</label>
            <input
              type="text"
              value={formData.price}
              onChange={(e) => handleNumberChange(e.target.value)}
              placeholder="0"
              className="w-full p-2 border rounded-lg mt-1"
              required
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-dark-brown text-white rounded-lg hover:bg-brown-dark disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};
