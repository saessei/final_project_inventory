import React, { useState, useRef, useEffect } from "react";
import { Store, List, BarChart2, Settings, LogOut } from "lucide-react";
import { UserAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Logo from '/src/assets/QueueTea.png'


export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeItem, setActiveItem] = useState("Kiosk Mode");
  const sidebarRef = useRef<HTMLDivElement>(null);

  const { session, signOut } = UserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const sidebarItems = [
    { name: "Kiosk Mode", icon: <Store size={20} />, path: "/dashboard" },
    { name: "Queued Orders", icon: <List size={20} />, path: "/dashboard" },
    { name: "Reports", icon: <BarChart2 size={20} />, path: "/dashboard" },
    { name: "Settings", icon: <Settings size={20} />, path: "/dashboard" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/signin");
  };

  return (
    <div
      ref={sidebarRef}
      onClick={() => setIsOpen(true)}
      className="bg-bg-lightgray h-screen min-h-screen p-5 pt-8 relative duration-300 flex flex-col justify-between shadow-lg font-quicksand"
      style={{ width: isOpen ? "16rem" : "5rem" }}
    >
      <div>
        <div className="flex">
        <img src={Logo} className="w-10 h-10"></img>
        <div className="flex flex-col gap-x-3 items-center mb-10">
          
          
          <h1 className={`pl-3 text-dark-brown font-bold font-quicksand text-2xl transition-all ${!isOpen && "scale-0"}`}>
            QueueTea
          </h1>
          <p className={`text-brown font-regular font-quicksand text-sm transition-all ${!isOpen && "scale-0"}`}>© 2026 QueueTea</p>
        </div>
        </div>

        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const selected = activeItem === item.name;
            return (
              <li
                key={item.name}
                onClick={() => {
                  setActiveItem(item.name);
                  if (item.path) navigate(item.path);
                }}
                className={`flex items-center gap-x-4 rounded-2xl px-3 py-2 cursor-pointer transition-all ${
                  selected
                    ? "bg-brown/20 text-brown"
                    : "text-gray-700 hover:bg-brown/20"
                }`}
              >
                {item.icon}
                <span className={`${!isOpen ? "hidden" : "block"} font-medium text-sm`}>
                  {item.name}
                </span>
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
          <div className={`${!isOpen ? "hidden" : "block"}`}>
            <p className="text-xs text-gray-500">Signed in as</p>
            <p className="text-sm font-semibold text-dark-brown truncate" title={session?.user?.email ?? "Unknown"}>
              {session?.user?.email ?? "Guest"}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          <LogOut size={16} />
          <span className={`${!isOpen ? "hidden" : "block"}`}>Sign out</span>
        </button>
      </div>
    </div>
  );
};
