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
  const { session, loading } = UserAuth();
  const location = useLocation();

  if (loading) return null; 

  if (!session) {
    return (
      <Navigate
        to="/signin"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  const role = session.user.user_metadata?.role as Role | undefined;

  if (!role || !allow.includes(role)) {
    return <Navigate to="/queued-orders" replace />;
  }

  return <>{children}</>;
}