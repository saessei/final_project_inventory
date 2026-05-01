// src/components/common/Sidebar.tsx
import { useRef, useState } from "react";
import { Store, List, BarChart2, Settings, LogOut, Menu, X, ClipboardList } from "lucide-react";
import { UserAuth } from "../../auth/AuthContext";
import { AdminPinModal } from "./AdminPinModal";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "/src/assets/QueueTea.png";

export const Sidebar = () => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { session, signOut } = UserAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarItems = [
    { name: "Kiosk Mode", icon: <Store size={20} />, path: "/kiosk" },
    { name: "Queued Orders", icon: <List size={20} />, path: "/queued-orders" },
    { name: "Menu Manager", icon: <ClipboardList size={20} />, path: "/admin/menu" },
    { name: "Reports", icon: <BarChart2 size={20} />, path: "/reports" },
    { name: "Settings", icon: <Settings size={20} />, path: "/settings" },
  ];

  const activeItem =
    sidebarItems.find((item) => item.path === location.pathname)?.name ||
    sidebarItems[0]?.name ||
    "";

  const handleSignOutClick = () => {
    setShowLogoutModal(true);
  };

  const handleSignOutConfirm = async () => {
    await signOut();
    navigate("/signin");
  };

  const handleSignOutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div
        ref={sidebarRef}
        className={`bg-bg-lightgray fixed top-0 left-0 h-screen min-h-screen p-5 pt-8 flex flex-col justify-between shadow-lg font-quicksand z-50 transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-64`}
      >
        <div>
          <div className="flex items-center gap-3 mb-10">
            <img src={Logo} className="w-10 h-10" alt="Logo" />
            <div>
              <h1 className="text-dark-brown font-bold font-quicksand text-2xl">
                QueueTea
              </h1>
              <p className="text-brown font-regular font-quicksand text-xs">
                © 2026 QueueTea
              </p>
            </div>
          </div>

          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const selected = activeItem === item.name;
              return (
                <li
                  key={item.name}
                  onClick={() => {
                    if (item.path) navigate(item.path);
                  }}
                  className={`flex items-center gap-x-4 rounded-2xl px-3 py-2 cursor-pointer transition-all ${
                    selected
                      ? "bg-brown/20 text-brown"
                      : "text-gray-700 hover:bg-brown/20"
                  }`}
                >
                  {item.icon}
                  <span className="font-medium text-sm">{item.name}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-white shadow-sm">
            <div className="w-10 h-10 rounded-full bg-brown-two/20 flex items-center justify-center text-brown-two text-sm font-bold">
              {session?.user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-xs text-gray-500">Signed in as</p>
              <p
                className="text-sm font-semibold text-dark-brown truncate"
                title={session?.user?.email ?? "Unknown"}
              >
                {session?.user?.email ?? "Guest"}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOutClick}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* Reuse AdminPinModal for logout */}
      {showLogoutModal && (
        <AdminPinModal 
          onSuccess={handleSignOutConfirm} 
          onClose={handleSignOutCancel} 
        />
      )}
    </>
  );
};