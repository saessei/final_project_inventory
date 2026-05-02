// src/components/Admin/MenuManager.tsx
import { useState, useEffect, useCallback } from "react";
import { drinkService } from "@/services/DrinkService";
import { Sidebar } from "@/components/ui/Sidebar";
import { UserAuth } from "@/components/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { MenuManagerSkeleton } from "@/components/ui/LoadingSkeletons";
import { DrinkModal, ToppingModal } from "./AdminModals";
import type {
  DrinkModalData,
  DrinkType,
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

  const [drinks, setDrinks] = useState<DrinkType[]>([]);
  const [toppings, setToppings] = useState<ToppingType[]>([]);
  const categories = Array.from(
    new Set(
      drinks
        .map((drink) => drink.category?.trim())
        .filter((category): category is string => Boolean(category))
        .filter((category) => category.toLowerCase() !== "beverages"),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const { session, loading: authLoading } = UserAuth();
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    setLoading(true);
    const [drinksData, toppingsData] = await Promise.all([
      drinkService.getAllDrinks(),
      drinkService.getAllToppings(),
    ]);

    setDrinks(drinksData);
    setToppings(toppingsData);
    setLoading(false);
  }, []);

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
          description: data.description,
          image_url: data.image_url,
          category,
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
          category,
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
        <div className="fixed top-0 left-0 h-screen w-64 z-10">
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

          <MenuManagerSkeleton loading>
            <div className="max-w-7xl mx-auto" />
          </MenuManagerSkeleton>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen text-dark-brown font-quicksand">
      <div className="fixed top-0 left-0 h-screen w-64 z-10">
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

          <MenuManagerSkeleton loading={loading}>
            <AdminTabs
              activeTab={activeTab}
              drinks={drinks}
              toppings={toppings}
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
          </MenuManagerSkeleton>
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
