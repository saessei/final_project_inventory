import { createBrowserRouter, Navigate } from "react-router-dom";
import { Signup } from "@/pages/Signup";
import { Signin } from "@/pages/Signin";
import { Kiosk } from "@/pages/Kiosk";
import { QueuedOrders } from "@/pages/QueuedOrders";
import { Settings } from "@/pages/Settings";
import { Reports } from "@/pages/Reports";
import { MenuManager } from "@/features/Admin/MenuManager"; // Keep this
import { ProtectedRoute } from "@/pages/ProtectedRoute";

// Remove these lines:
// import { DrinkManager } from "../components/Admin/DrinkManager";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/signin" replace /> },
  { path: "/signup", element: <Signup /> },
  { path: "/signin", element: <Signin /> },
  {
    path: "/kiosk",
    element: (
      <ProtectedRoute>
        <Kiosk />
      </ProtectedRoute>
    ),
  },
  {
    path: "/queued-orders",
    element: (
      <ProtectedRoute>
        <QueuedOrders />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/reports",
    element: (
      <ProtectedRoute>
        <Reports />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/menu",
    element: (
      <ProtectedRoute>
        <MenuManager />
      </ProtectedRoute>
    ),
  },
]);
