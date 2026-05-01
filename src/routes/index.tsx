import { createBrowserRouter, Navigate } from "react-router-dom";
import { Signup } from "@/pages/Signup";
import { Signin } from "@/pages/Signin";
import { Kiosk } from "@/pages/Kiosk";
import { QueuedOrders } from "@/pages/QueuedOrders";
import { Settings } from "@/pages/Settings";
import { Reports } from "@/pages/Reports";
import { MenuManager } from "@/components/admin/MenuManager"; // Keep this
import { RoleSelect } from "@/pages/RoleSelect";
import { AppProtectedRoute } from "@/pages/AppProtectedRoute";

// Remove these lines:
// import { DrinkManager } from "../components/Admin/DrinkManager";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/signin" replace /> },
  { path: "/signup", element: <Signup /> },
  { path: "/signin", element: <Signin /> },
  {
    path: "/role-select",
    element: (
      <AppProtectedRoute requireMode={false} staffAllowed>
        <RoleSelect />
      </AppProtectedRoute>
    ),
  },
  {
    path: "/kiosk",
    element: (
      <AppProtectedRoute staffAllowed>
        <Kiosk />
      </AppProtectedRoute>
    ),
  },
  {
    path: "/queued-orders",
    element: (
      <AppProtectedRoute staffAllowed>
        <QueuedOrders />
      </AppProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <AppProtectedRoute staffAllowed={false}>
        <Settings />
      </AppProtectedRoute>
    ),
  },
  {
    path: "/reports",
    element: (
      <AppProtectedRoute staffAllowed>
        <Reports />
      </AppProtectedRoute>
    ),
  },
  {
    path: "/admin/menu",
    element: (
      <AppProtectedRoute staffAllowed={false}>
        <MenuManager />
      </AppProtectedRoute>
    ),
  },
]);
