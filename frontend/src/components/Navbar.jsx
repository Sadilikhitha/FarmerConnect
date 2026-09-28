import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export default function Navbar() {

  const navigate = useNavigate();

  const { user, logout } = useAuth();


  const handleLogout = () => {

    logout();

    navigate("/");

  };


  return (

    <nav className="bg-green-700 text-white shadow-md">

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LOGO */}

        <Link
          to="/"
          className="text-2xl font-bold"
        >
          🌾 FarmerConnect
        </Link>


        {/* NAVIGATION */}

        <div className="flex items-center gap-6">

          <Link
            to="/"
            className="hover:text-green-200"
          >
            Home
          </Link>


          <Link
            to="/equipment"
            className="hover:text-green-200"
          >
            Equipment
          </Link>


          {/* LOGGED IN */}

          {user ? (

            <>

              <Link
                to="/add-equipment"
                className="hover:text-green-200"
              >
                + List Equipment
              </Link>


              <Link
                to="/settings"
                className="hover:text-green-200"
              >
                Profile
              </Link>


              <button
                onClick={handleLogout}
                className="bg-white text-green-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
              >
                Logout
              </button>

            </>

          ) : (

            <>

              <Link
                to="/login"
                className="hover:text-green-200"
              >
                Login
              </Link>


              <Link
                to="/register"
                className="bg-white text-green-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
              >
                Register
              </Link>

            </>

          )}

        </div>

      </div>

    </nav>

  );

}