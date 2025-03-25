import { useAuthStore } from "@/store/auth.store";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Render the protected content
  return <Outlet />;
};

export const UserAccountProtected = () => {
  const { isAuthenticated, user } = useAuthStore();
  // If user role is not USER, redirect to login
  if (user?.role !== "USER") {
    return <Navigate to="/voter/login" replace />;
  }
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/voter/login" replace />;
  }

  // Render the protected content
  return <Outlet />;
};
