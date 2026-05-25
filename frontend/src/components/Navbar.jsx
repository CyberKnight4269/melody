import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ onUploadClick, onCreateAlbumClick }) => {
  const { logout, isAdmin } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => { logout(); navigate("/auth"); };

  const navLinks = [
    { label: "Home",      to: "/" },
    { label: "Playlists", to: "/playlists" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          <div className="navbar-brand-dot" />
          <span className="navbar-brand-name">Melody</span>
        </Link>
        <div className="navbar-links">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`navbar-link${location.pathname === l.to ? " navbar-link--active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="navbar-right">
        {isAdmin && (
          <>
            <button className="btn-ghost-sm" onClick={onCreateAlbumClick}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New album
            </button>
            <button className="btn-upload" onClick={onUploadClick}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload song
            </button>
          </>
        )}
        <button className="btn-logout" onClick={handleLogout}>Sign out</button>
      </div>
    </nav>
  );
};

export default Navbar;