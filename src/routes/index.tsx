import { createBrowserRouter, Navigate } from "react-router-dom";
import { Signup } from "../features/Signup";
import { Signin } from "../features/pages/Signin";
import { Kiosk } from "../features/Kiosk";
import { QueuedOrders } from "../features/pages/QueuedOrders";
import { Settings } from "../features/Settings";
import { Reports } from "../features/pages/Reports";
import { MenuManager } from "../features/Admin/MenuManager"; // Keep this
import { ProtectedRoute } from "../features/ProtectedRoute";

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
    ) 
  },
  { 
    path: "/queued-orders", 
    element: (
      <ProtectedRoute>
        <QueuedOrders />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/settings", 
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/reports", 
    element: (
      <ProtectedRoute>
        <Reports />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/admin/menu", 
    element: (
      <ProtectedRoute>
        <MenuManager />
      </ProtectedRoute>
    ) 
  },
]);