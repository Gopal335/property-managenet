import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo-link">
          <img
            src="/house-real-estate-logo_7169-106.avif"
            alt="Logo"
            className="navbar-logo"
          />
          <span className="navbar-title">property listing manager</span>
        </Link>
      </div>

      <div className="navbar-right">
        <button onClick={toggleTheme} className="theme-toggle-btn">
          {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>

        {user ? (
          <>
            <Link to="/admin/add-property" className="nav-btn primary-btn">
              Add New Property
            </Link>
            <button onClick={handleLogout} className="nav-btn logout-btn">
              Logout
            </button>
          </>
        ) : (
          <Link to="/admin/login" className="nav-btn outline-btn">
            Admin Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
