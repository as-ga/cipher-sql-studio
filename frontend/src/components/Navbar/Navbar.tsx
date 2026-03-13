import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import "./Navbar.scss";

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__brand">
        <span className="navbar__brand-icon">&#9671;</span>
        CipherSQLStudio
      </Link>
      <div className="navbar__links">
        <Link to="/" className={pathname === "/" ? "active" : ""}>
          Assignments
        </Link>
        {user && (
          <button className="navbar__logout" onClick={logout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
