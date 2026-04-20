import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserAuth } from "./AuthContext";

type Role = "cashier" | "barista";

export function RequireRole({
  allow,
  children,
}: {
  allow: Role[];
  children: ReactNode;
}) {
  const { session } = UserAuth();
  const location = useLocation();

  // Not logged in -> go sign in
  if (!session) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  const role = session.user.user_metadata?.role as Role | undefined;

  // Logged in but no role or wrong role -> send them to their default page
  if (!role || !allow.includes(role)) {
    const fallback = role === "barista" ? "/queued-orders" : "/kiosk";
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}