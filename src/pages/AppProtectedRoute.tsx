import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserAuth } from "@/components/auth/AuthContext";
import { useDashboardMode } from "@/components/contexts/DashboardModeContext";

export function AppProtectedRoute({
  children,
  requireMode = true,
  staffAllowed = true,
}: {
  children: ReactNode;
  requireMode?: boolean;
  staffAllowed?: boolean;
}) {
  const { session, loading } = UserAuth();
  const { mode } = useDashboardMode();
  const location = useLocation();

  if (loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-brown mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  if (requireMode && !mode) {
    return <Navigate to="/role-select" replace />;
  }

  if (mode === "staff" && !staffAllowed) {
    return <Navigate to="/kiosk" replace />;
  }

  return <>{children}</>;
}
