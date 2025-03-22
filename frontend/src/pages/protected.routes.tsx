import { useAuthStore } from "@/store/auth.store";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin } = useAuthStore();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If admin route but user is not admin, redirect to user dashboard
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render the protected content
  return <Outlet />;
};
