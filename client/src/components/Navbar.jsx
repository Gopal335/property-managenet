import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { fetchInterests } from "../api";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchInterests().then(data => {
        if (!data || data.length === 0) return;
        const lastViewed = localStorage.getItem("lastViewedInterests");
        if (!lastViewed) {
          setUnreadCount(data.length);
        } else {
          const newInterests = data.filter(i => new Date(i.createdAt) > new Date(lastViewed));
          setUnreadCount(newInterests.length);
        }
      }).catch(console.error);
    }
  }, [user, location.pathname]); // re-check when path changes

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
            <Link to="/admin/interests" className="nav-btn outline-btn" style={{ position: "relative" }}>
              View Interests
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </Link>
            <Link to="/admin/add-property" className="nav-btn primary-btn">
              Add New Property
            </Link>
            <button onClick={handleLogout} className="nav-btn logout-btn">
              Logout
            </button>
          </>
        ) : (
          location.pathname !== "/admin/login" && (
            <Link to="/admin/login" className="nav-btn outline-btn">
              Admin Sign In
            </Link>
          )
        )}
      </div>
    </nav>
  );
}
