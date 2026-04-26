import { createBrowserRouter, Navigate } from "react-router-dom";
import { Signup } from "../components/Signup";
import { Signin } from "../components/Signin";
import { Kiosk } from "../components/Kiosk";
import { QueuedOrders } from "../components/QueuedOrders";
import { Settings } from "../components/Settings";
import { Reports } from "../components/Reports";
import { MenuManager } from "../components/Admin/MenuManager"; // Keep this
import { ProtectedRoute } from "../components/ProtectedRoute";

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