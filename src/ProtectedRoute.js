import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
const ProtectedRoute = ({ children, adminRequired = false }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    sessionStorage.setItem("redirectAfterLogin", location.pathname);
    return <Navigate to="/" replace />;
  }
  if (adminRequired && (!user || !user.isAdmin)) {
    alert("You don't have permission to access this page!");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;