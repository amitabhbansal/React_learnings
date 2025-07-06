// src/components/Navbar.tsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info("Logged out");
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <Link className="navbar-brand" to="/dashboard">
        AuthApp
      </Link>

      <div className="collapse navbar-collapse">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          {currentUser && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">
                  Dashboard
                </Link>
              </li>
              {(currentUser.role === "admin" ||
                currentUser.role === "superadmin") && (
                <li className="nav-item">
                  <Link className="nav-link" to="/admin">
                    Admin
                  </Link>
                </li>
              )}
            </>
          )}
        </ul>

        <ul className="navbar-nav ms-auto">
          {currentUser ? (
            <>
              <li className="nav-item me-3 text-light mt-2">
                Hello, {currentUser.username}
              </li>
              <li className="nav-item">
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-light"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item me-2">
                <Link className="btn btn-outline-light" to="/">
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link className="btn btn-primary" to="/signup">
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
