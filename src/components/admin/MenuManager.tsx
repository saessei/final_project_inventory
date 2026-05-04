// src/components/Admin/MenuManager.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { drinkService } from "@/services/drinkService";
import { Sidebar } from "@/components/ui/Sidebar";
import { UserAuth } from "@/components/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { MenuManagerSkeleton } from "@/components/ui/LoadingSkeletons";
import { DrinkModal, ToppingModal } from "./AdminModals";
import { TextField } from "@/components/ui/TextField";
import { Select } from "@/components/ui/Select";
import { Search } from "lucide-react";
import type {
  DrinkModalData,
  DrinkType,
  MenuCategory,
  TabType,
  ToppingType,
} from "@/types/menuTypes";

export const MenuManager = () => {
  const [activeTab, setActiveTab] = useState<TabType>("drinks");
  const [showModal, setShowModal] = useState(false);
  const [showToppingModal, setShowToppingModal] = useState(false);
  const [editingItem, setEditingItem] = useState<DrinkType | null>(null);
  const [editingTopping, setEditingTopping] = useState<ToppingType | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const [drinks, setDrinks] = useState<DrinkType[]>([]);
  const [toppings, setToppings] = useState<ToppingType[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const categoryNames = categories.map((category) => category.name);

  const { session, loading: authLoading } = UserAuth();
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    setLoading(true);
    const [drinksData, toppingsData, categoriesData] = await Promise.all([
      drinkService.getAllDrinks(false),
      drinkService.getAllToppings(),
      drinkService.getAllCategories(),
    ]);

    setDrinks(drinksData);
    setToppings(toppingsData);
    setCategories(
      categoriesData.filter(
        (category) => category.name.toLowerCase() !== "beverages",
      ),
    );
    setLoading(false);
  }, []);

  const handleDeleteCategory = async (categoryId: string) => {
    const success = await drinkService.deleteCategory(categoryId);
    if (success) {
      await loadData();
    }
    return success;
  };

  const filteredDrinks = useMemo(() => {
    return drinks.filter((drink) => {
      const matchesSearch = drink.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || drink.category === categoryFilter;
      const matchesAvailability = 
        availabilityFilter === "all" || 
        (availabilityFilter === "available" ? drink.is_available : !drink.is_available);
      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [drinks, searchQuery, categoryFilter, availabilityFilter]);

  const filteredToppings = useMemo(() => {
    return toppings.filter((topping) => {
      const matchesSearch = topping.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAvailability = 
        availabilityFilter === "all" || 
        (availabilityFilter === "available" ? topping.is_available : !topping.is_available);
      return matchesSearch && matchesAvailability;
    });
  }, [toppings, searchQuery, availabilityFilter]);

  useEffect(() => {
    if (authLoading) return;
    if (!session?.user?.id) {
      navigate("/signin");
      return;
    }
    void loadData();
  }, [authLoading, session?.user?.id, navigate, loadData]);

  const handleSaveDrink = async (data: DrinkModalData) => {
    const category = data.category.trim();
    if (!category) {
      alert("Category is required. Please select or create a category.");
      return;
    }
    if (editingItem && "id" in editingItem) {
      await drinkService.updateDrink(
        editingItem.id,
        {
          name: data.name,
          category,
          is_available: data.is_available,
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
          category,
          is_available: data.is_available,
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


  if (authLoading) {
    return <MenuManagerSkeleton loading>{null}</MenuManagerSkeleton>;
  }

  if (loading) {
    return (
      <div className="bg-cream min-h-screen text-dark-brown font-quicksand">
        <div className="fixed top-0 left-0 h-screen w-0 lg:w-64 z-50">
          <Sidebar />
        </div>

        <main className="ml-0 lg:ml-64 h-screen overflow-y-auto no-scrollbar p-4 lg:p-6 pt-20 lg:pt-6">
          <div className="max-w-7xl mx-auto mb-8">
            <div className="mb-8">
              <h1 className="text-4xl font-black font-fredoka">Menu Manager</h1>
              <p className="text-gray-600 mt-1">
                Manage categories, drinks, toppings, and sugar levels
              </p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto">
            <AdminTabs
              loading={true}
              activeTab={activeTab}
              drinks={[]}
              toppings={[]}
              onTabChange={setActiveTab}
              onAddDrink={() => {}}
              onEditDrink={() => {}}
              onDeleteDrink={() => {}}
              onAddTopping={() => {}}
              onEditTopping={() => {}}
              onDeleteTopping={() => {}}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen text-dark-brown font-quicksand">
      <div className="fixed top-0 left-0 h-screen w-0 lg:w-64 z-50">
        <Sidebar />
      </div>

      <main className="ml-0 lg:ml-64 h-screen overflow-y-auto no-scrollbar p-4 lg:p-6 pt-20 lg:pt-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-black font-fredoka">Menu Manager</h1>
            <p className="text-gray-600 mt-1">
              Manage categories, drinks, toppings, and sugar levels
            </p>
          </div>

          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-[2]">
              <TextField
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search size={18} />}
                className="rounded-2xl border-slate-200 bg-white"
              />
            </div>
            <div className="flex flex-1 items-center gap-3">
              {activeTab === "drinks" && (
                <div className="flex-1 min-w-[140px]">
                  <Select
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    options={[
                      { value: "all", label: "All Categories" },
                      ...categoryNames.map((c) => ({ value: c, label: c })),
                    ]}
                  />
                </div>
              )}
              <div className="flex-1 min-w-[140px]">
                <Select
                  value={availabilityFilter}
                  onChange={setAvailabilityFilter}
                  options={[
                    { value: "all", label: "All Status" },
                    { value: "available", label: "Available" },
                    { value: "unavailable", label: "Unavailable" },
                  ]}
                />
              </div>
            </div>
          </div>

          <AdminTabs
            loading={loading}
            activeTab={activeTab}
            drinks={filteredDrinks}
            toppings={filteredToppings}
            onTabChange={setActiveTab}
            onAddDrink={() => {
              setEditingItem(null);
              setShowModal(true);
            }}
            onEditDrink={(drink: DrinkType) => {
              setEditingItem(drink);
              setShowModal(true);
            }}
            onDeleteDrink={handleDeleteDrink}
            onAddTopping={handleAddTopping}
            onEditTopping={handleEditTopping}
            onDeleteTopping={handleDeleteTopping}
          />
        </div>
      </main>

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
          categories={categories}
          onDeleteCategory={handleDeleteCategory}
        />
      )}

      {/* Topping Modal */}
      {showToppingModal && (
        <ToppingModal
          item={editingTopping}
          onSave={handleSaveTopping}
          onClose={() => {
            setShowToppingModal(false);
            setEditingTopping(null);
          }}
        />
      )}
    </div>
  );
};
