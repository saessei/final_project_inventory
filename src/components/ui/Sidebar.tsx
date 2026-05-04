import { useRef, useState } from "react";
import {
  Store,
  List,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  X,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";
import { UserAuth } from "@/components/auth/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "/src/assets/QueueTea.png";
import { useDashboardMode } from "@/components/contexts/DashboardModeContext";
import { useAdminPin } from "@/components/contexts/AdminPinContext";

export const Sidebar = () => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { session, signOut } = UserAuth();
  const { mode, clearMode } = useDashboardMode();
  const { openPinModal } = useAdminPin();
  const navigate = useNavigate();
  const location = useLocation();

  const adminSidebarItems = [
    {
      name: "Menu Manager",
      icon: <ClipboardList size={20} />,
      path: "/admin/menu",
    },
    { name: "Reports", icon: <BarChart2 size={20} />, path: "/reports" },
    { name: "Settings", icon: <Settings size={20} />, path: "/settings" },
  ];

  const staffSidebarItems = [
    { name: "Order Taking", icon: <Store size={20} />, path: "/kiosk" },
    { name: "Order Queue", icon: <List size={20} />, path: "/queued-orders" },
  ];

  const sidebarItems = mode === "staff" ? staffSidebarItems : adminSidebarItems;

  const activeItem =
    sidebarItems.find((item) => item.path === location.pathname)?.name ||
    sidebarItems[0]?.name ||
    "";

  const handleSignOutClick = () => {
    void handleSignOutConfirm();
  };

  const handleSignOutConfirm = async () => {
    clearMode();
    await signOut();
    navigate("/signin");
  };

  const handleReturnToRoleSelect = () => {
    clearMode();
    navigate("/role-select");
  };

  const handleStaffAdminUnlock = () => {
    openPinModal(() => {
      clearMode();
      navigate("/role-select");
    });
  };

  return (
    <>
      {!isMobileOpen && (
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 rounded-full bg-dark-brown px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-black/20"
          aria-label="Open sidebar"
          aria-expanded={isMobileOpen}
        >
          <Menu size={18} />
          <span>Menu</span>
        </button>
      )}

      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[55]"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div
        ref={sidebarRef}
        className={`bg-bg-lightgray fixed top-0 left-0 h-screen min-h-screen w-64 max-w-[86vw] p-5 pt-8 flex flex-col justify-between shadow-lg font-quicksand z-[60] transition-transform duration-300 ease-in-out overflow-y-auto no-scrollbar lg:w-64 lg:max-w-none ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          <div className="mb-8 flex items-start justify-between gap-4 lg:mb-10">
            <div className="flex items-center gap-3">
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

            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden inline-flex items-center justify-center rounded-full bg-white/80 p-2 text-dark-brown shadow-sm ring-1 ring-black/5"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
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

          {mode === "admin" && (
            <>
              <button
                onClick={handleReturnToRoleSelect}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                <span>Return to Role Select</span>
              </button>

              <button
                onClick={handleSignOutClick}
                className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </>
          )}

          {mode === "staff" && (
            <button
              onClick={handleStaffAdminUnlock}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              <ShieldCheck size={16} />
              <span>Admin Unlock</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};
