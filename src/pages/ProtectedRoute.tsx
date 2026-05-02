import { Navigate } from "react-router-dom";
import { UserAuth } from "@/components/auth/AuthContext";
import { AuthRouteSkeleton } from "@/components/ui/LoadingSkeletons";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = UserAuth();

  if (loading) return <AuthRouteSkeleton loading>{children}</AuthRouteSkeleton>;

  if (!session) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};
