import { createBrowserRouter, Navigate } from "react-router-dom";
import { UserAuth } from "../auth/AuthContext";
import { Signup } from "../components/Signup";
import { Signin } from "../components/Signin";
import { Kiosk } from "../components/Kiosk";
import { QueuedOrders } from "../components/QueuedOrders";
import { Settings } from "../components/settings";
import { Dashboard } from "../components/Dashboard";
import { MenuManager } from "../components/Admin/MenuManager";

// Simple wrapper component to protect routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = UserAuth();
  
  if (loading) {
    return <div className="bg-cream min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!session) {
    return <Navigate to="/signin" replace />;
  }
  
  return <>{children}</>;
};

export const router = createBrowserRouter([
  // Public routes
  { path: "/", element: <Navigate to="/signin" replace /> },
  { path: "/signup", element: <Signup /> },
  { path: "/signin", element: <Signin /> },
  
  // Protected routes (require login)
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