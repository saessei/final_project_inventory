import { createBrowserRouter, Navigate } from "react-router-dom";
import { Signup } from "../components/Signup";
import { Signin } from "../components/Signin";
import { Kiosk } from "../components/Kiosk";
import { QueuedOrders } from "../components/QueuedOrders";
import { Settings } from "../components/Settings";
import { Dashboard } from "../components/Dashboard";
import { MenuManager } from "../components/Admin/MenuManager";
import { ProtectedRoute } from "../components/ProtectedRoute";

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
    path: "/dashboard", 
    element: (
      <ProtectedRoute>
        <Dashboard />
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