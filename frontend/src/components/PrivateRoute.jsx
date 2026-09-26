import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wrap a page with this to require login, and optionally a specific role.
// Usage: <PrivateRoute role="owner"><AddEquipment /></PrivateRoute>
export default function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
