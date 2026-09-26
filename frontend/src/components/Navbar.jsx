import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const dashboardPath =
    user?.role === "owner" ? "/owner-dashboard" : "/farmer-dashboard";

  return (
    <nav className="bg-farmgreen-700 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <Link to="/" className="text-xl font-bold">
          🌾 Farmer Connect
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium flex-wrap">
          <Link to="/" className="hover:text-farmgreen-100">
            Home
          </Link>
          <Link to="/equipment" className="hover:text-farmgreen-100">
            Equipment
          </Link>

          {user && (
            <Link to={dashboardPath} className="hover:text-farmgreen-100">
              Dashboard
            </Link>
          )}

          {user?.role === "owner" && (
            <Link to="/add-equipment" className="hover:text-farmgreen-100">
              Add Equipment
            </Link>
          )}

          {!user ? (
            <>
              <Link
                to="/login"
                className="bg-white text-farmgreen-700 px-3 py-1 rounded-full"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-farmgreen-500 px-3 py-1 rounded-full"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-farmgreen-500 px-3 py-1 rounded-full"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
