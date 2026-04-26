/* eslint-disable @typescript-eslint/no-explicit-any */
 
import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { dynamicMenu, DynamicCategory, DynamicDrink, Topping, SugarLevel } from "../../services/DynamicMenuService";
import { Sidebar } from "../common/Sidebar";
import { UserAuth } from "../../auth/AuthContext";
import { AdminPinModal } from "../AdminPinModal";
import { useNavigate } from "react-router-dom";
import supabase from "../../lib/supabaseClient";

type TabType = 'categories' | 'drinks' | 'toppings' | 'sugar-levels';

export const MenuManager = () => {
  const [activeTab, setActiveTab] = useState<TabType>('categories');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  
  const [categories, setCategories] = useState<DynamicCategory[]>([]);
  const [drinks, setDrinks] = useState<DynamicDrink[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [sugarLevels, setSugarLevels] = useState<SugarLevel[]>([]);
  
  const { session, loading: authLoading, refreshSession } = UserAuth();
  const navigate = useNavigate();
  
  const pinVerifiedRef = useRef(false);
  const modalShownRef = useRef(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [cats, drinksData, tops, sugars] = await Promise.all([
      dynamicMenu.getCategories(),
      dynamicMenu.getAllDrinks(),
      dynamicMenu.getToppings(),
      dynamicMenu.getSugarLevels()
    ]);
    setCategories(cats);
    setDrinks(drinksData);
    setToppings(tops);
    setSugarLevels(sugars);
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

    await supabase
      .from("profiles")
      .select("admin_pin")
      .eq("id", session.user.id)
      .single();

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
  
  const handleSave = async (data: any) => {
    if (activeTab === 'categories') {
      if (editingItem?.id) {
        await dynamicMenu.updateCategory(editingItem.id, data);
      } else {
        await dynamicMenu.addCategory(data);
      }
    } else if (activeTab === 'drinks') {
      if (editingItem?.id) {
        await dynamicMenu.updateDrink(editingItem.id, data);
      } else {
        await dynamicMenu.addDrink(data);
      }
    } else if (activeTab === 'toppings') {
      if (editingItem?.id) {
        await dynamicMenu.updateTopping(editingItem.id, data);
      } else {
        await dynamicMenu.addTopping(data);
      }
    } else if (activeTab === 'sugar-levels') {
      if (editingItem?.id) {
        await dynamicMenu.updateSugarLevel(editingItem.id, data);
      } else {
        await dynamicMenu.addSugarLevel(data);
      }
    }
    setShowModal(false);
    setEditingItem(null);
    await loadData();
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
  
  if (showPinModal && session) {
    return <AdminPinModal onSuccess={handlePinSuccess} onClose={handlePinCancel} />;
  }

  if (!isAuthorized) {
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
  
  if (loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="text-center">Loading menu manager...</div>
      </div>
    );
  }
  
  return (
    <div className="bg-cream min-h-screen text-dark-brown font-quicksand">
      <div className="fixed top-0 left-0 h-screen w-64 z-10">
        <Sidebar />
      </div>
      
      <main className="ml-0 lg:ml-64 h-screen overflow-y-auto p-4 lg:p-6 pt-20 lg:pt-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-black font-fredoka">Menu Manager</h1>
            <p className="text-gray-600 mt-1">Manage categories, drinks, toppings, and sugar levels</p>
          </div>
          
          <div className="flex gap-2 mb-6 border-b flex-wrap">
            {[
              { id: 'categories', label: 'Categories', icon: '📁', count: categories.length },
              { id: 'drinks', label: 'Drinks', icon: '🥤', count: drinks.length },
              { id: 'toppings', label: 'Toppings', icon: '➕', count: toppings.length },
              { id: 'sugar-levels', label: 'Sugar Levels', icon: '🍬', count: sugarLevels.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-6 py-3 font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'text-dark-brown border-b-2 border-dark-brown'
                    : 'text-gray-500 hover:text-dark-brown'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                <span className="ml-2 text-sm bg-gray-100 px-2 py-0.5 rounded-full">{tab.count}</span>
              </button>
            ))}
          </div>
          
          {/* Rest of your JSX remains the same */}
          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setShowModal(true);
                }}
                className="mb-4 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus size={18} /> Add Category
              </button>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map(cat => (
                  <div key={cat.id} className="bg-white p-4 rounded-lg shadow border">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{cat.label}</h3>
                        <p className="text-sm text-gray-600 mt-1">{cat.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{cat.drinkIds.length} drinks</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingItem(cat); setShowModal(true); }} className="p-2 hover:bg-gray-100 rounded">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => { if(confirm(`Delete category "${cat.label}"?`)) dynamicMenu.deleteCategory(cat.id); loadData(); }} className="p-2 hover:bg-red-100 text-red-600 rounded">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Drinks Tab */}
          {activeTab === 'drinks' && (
            <div>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setShowModal(true);
                }}
                className="mb-4 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus size={18} /> Add Drink
              </button>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {drinks.map(drink => {
                  const category = categories.find(c => c.id === drink.categoryId);
                  return (
                    <div key={drink.id} className="bg-white p-4 rounded-lg shadow border">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg">{drink.name}</h3>
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded">{category?.label}</span>
                          </div>
                          <p className="text-sm text-gray-600">{drink.description}</p>
                          <p className="text-xl font-bold text-dark-brown mt-2">₱{drink.price}</p>
                          <div className="mt-2 text-xs text-gray-500">
                            <p>Toppings: {drink.availableToppings.join(', ') || 'None'}</p>
                            <p>Sugar: {drink.availableSugarLevels.join(', ')}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button onClick={() => { setEditingItem(drink); setShowModal(true); }} className="p-2 hover:bg-gray-100 rounded">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => { if(confirm('Delete this drink?')) dynamicMenu.deleteDrink(drink.id); loadData(); }} className="p-2 hover:bg-red-100 text-red-600 rounded">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Toppings Tab */}
          {activeTab === 'toppings' && (
            <div>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setShowModal(true);
                }}
                className="mb-4 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus size={18} /> Add Topping
              </button>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {toppings.map(topping => (
                  <div key={topping.id} className="bg-white p-4 rounded-lg shadow border">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{topping.name}</h3>
                        <p className="text-2xl font-bold text-dark-brown mt-2">₱{topping.price}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingItem(topping); setShowModal(true); }} className="p-2 hover:bg-gray-100 rounded">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => { if(confirm('Delete this topping?')) dynamicMenu.deleteTopping(topping.id); loadData(); }} className="p-2 hover:bg-red-100 text-red-600 rounded">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Sugar Levels Tab */}
          {activeTab === 'sugar-levels' && (
            <div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Default sugar levels are: 20%, 40%, 60%, 80%, 100%. These are available for all drinks by default.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                {[20, 40, 60, 80, 100].map(percentage => {
                  const existingLevel = sugarLevels.find(s => s.percentage === percentage);
                  return (
                    <div key={percentage} className="bg-white p-4 rounded-lg shadow border text-center">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-2xl">{percentage}%</h3>
                          <p className="text-sm text-gray-500">{percentage}% sweetness</p>
                        </div>
                        {existingLevel && (
                          <button 
                            onClick={() => { 
                              if(confirm('Delete this sugar level?')) 
                                dynamicMenu.deleteSugarLevel(existingLevel.id); 
                                loadData();
                            }} 
                            className="p-1 hover:bg-red-100 text-red-600 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      {!existingLevel && (
                        <button
                          onClick={async () => {
                            await dynamicMenu.addSugarLevel({
                              label: `${percentage}%`,
                              percentage: percentage,
                              isAvailable: true
                            });
                            await loadData();
                          }}
                          className="mt-2 text-xs text-green-600 hover:text-green-700"
                        >
                          + Add to menu
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Modal for Adding/Editing */}
      {showModal && (
        <EditModal
          item={editingItem}
          type={activeTab}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
          categories={categories}
          toppings={toppings}
          sugarLevels={sugarLevels}
        />
      )}
    </div>
  );
};

// Edit Modal Component (keep your existing EditModal code)
const EditModal = ({ item, type, onSave, onClose, categories, toppings, sugarLevels }: any) => {
  const [formData, setFormData] = useState(item || {});
  
  if (type === 'categories') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{item?.id ? 'Edit' : 'Add'} Category</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X size={24} />
            </button>
          </div>
          <div className="space-y-4">
            <input 
              placeholder="Category Name (e.g., Smoothies, Rice Meals, Snacks)" 
              value={formData.label || ''} 
              onChange={(e) => setFormData({...formData, label: e.target.value})} 
              className="w-full p-2 border rounded-lg"
            />
            <textarea 
              placeholder="Description" 
              value={formData.description || ''} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              className="w-full p-2 border rounded-lg" 
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button onClick={() => onSave(formData)} className="px-4 py-2 bg-dark-brown text-white rounded-lg">Save</button>
          </div>
        </div>
      </div>
    );
  }
  
  if (type === 'drinks') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{item?.id ? 'Edit' : 'Add'} Drink</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X size={24} />
            </button>
          </div>
          <div className="space-y-4">
            <input 
              placeholder="Drink Name" 
              value={formData.name || ''} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              className="w-full p-2 border rounded-lg"
            />
            <textarea 
              placeholder="Description" 
              value={formData.description || ''} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              className="w-full p-2 border rounded-lg" 
              rows={3}
            />
            <input 
              type="number" 
              placeholder="Price" 
              value={formData.price || ''} 
              onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})} 
              className="w-full p-2 border rounded-lg"
            />
            <select 
              value={formData.categoryId || ''} 
              onChange={(e) => setFormData({...formData, categoryId: e.target.value})} 
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Select Category</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
            <div className="space-y-2">
              <label className="font-semibold text-sm">Available Toppings:</label>
              <div className="flex flex-wrap gap-3 max-h-32 overflow-y-auto border rounded-lg p-2">
                {toppings.map((top: any) => (
                  <label key={top.id} className="flex items-center gap-2 text-sm">
                    <input 
                      type="checkbox" 
                      checked={formData.availableToppings?.includes(top.name)} 
                      onChange={(e) => {
                        const newToppings = e.target.checked 
                          ? [...(formData.availableToppings || []), top.name]
                          : (formData.availableToppings || []).filter((t: string) => t !== top.name);
                        setFormData({...formData, availableToppings: newToppings});
                      }} 
                    />
                    {top.name} (+₱{top.price})
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-semibold text-sm">Available Sugar Levels:</label>
              <div className="flex flex-wrap gap-3 max-h-32 overflow-y-auto border rounded-lg p-2">
                {sugarLevels.map((level: any) => (
                  <label key={level.id} className="flex items-center gap-2 text-sm">
                    <input 
                      type="checkbox" 
                      checked={formData.availableSugarLevels?.includes(level.label)} 
                      onChange={(e) => {
                        const newLevels = e.target.checked 
                          ? [...(formData.availableSugarLevels || []), level.label]
                          : (formData.availableSugarLevels || []).filter((l: string) => l !== level.label);
                        setFormData({...formData, availableSugarLevels: newLevels});
                      }} 
                    />
                    {level.label} ({level.percentage}%)
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button onClick={() => onSave(formData)} className="px-4 py-2 bg-dark-brown text-white rounded-lg">Save</button>
          </div>
        </div>
      </div>
    );
  }
  
  if (type === 'toppings') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{item?.id ? 'Edit' : 'Add'} Topping</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X size={24} />
            </button>
          </div>
          <div className="space-y-4">
            <input 
              placeholder="Topping Name (e.g., Boba, Pudding, Grass Jelly)" 
              value={formData.name || ''} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              className="w-full p-2 border rounded-lg"
            />
            <input 
              type="number" 
              placeholder="Price" 
              value={formData.price || ''} 
              onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})} 
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button onClick={() => onSave(formData)} className="px-4 py-2 bg-dark-brown text-white rounded-lg">Save</button>
          </div>
        </div>
      </div>
    );
  }
  
  if (type === 'sugar-levels') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{item?.id ? 'Edit' : 'Add'} Sugar Level</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X size={24} />
            </button>
          </div>
          <div className="space-y-4">
            <input 
              placeholder="Sugar Level (e.g., 25%)" 
              value={formData.label || ''} 
              onChange={(e) => setFormData({...formData, label: e.target.value})} 
              className="w-full p-2 border rounded-lg"
            />
            <input 
              type="number" 
              placeholder="Percentage (0-100)" 
              value={formData.percentage || ''} 
              onChange={(e) => setFormData({...formData, percentage: parseInt(e.target.value)})} 
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button onClick={() => onSave(formData)} className="px-4 py-2 bg-dark-brown text-white rounded-lg">Save</button>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
};