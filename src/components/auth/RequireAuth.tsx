import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserAuth } from "./AuthContext";
import { AuthRouteSkeleton } from "@/components/ui/LoadingSkeletons";

export function RequireAuth({
  children,
}: {
  children: ReactNode;
}) {
  const { session, loading } = UserAuth();
  const location = useLocation();

  if (loading) return <AuthRouteSkeleton loading>{children}</AuthRouteSkeleton>;

  if (!session) {
    return (
      <Navigate
        to="/signin"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
}
