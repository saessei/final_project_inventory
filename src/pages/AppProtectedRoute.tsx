import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserAuth } from "@/components/auth/AuthContext";
import { useDashboardMode } from "@/components/contexts/DashboardModeContext";
import { AuthRouteSkeleton } from "@/components/ui/LoadingSkeletons";

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

  if (loading) return <AuthRouteSkeleton loading>{children}</AuthRouteSkeleton>;

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
