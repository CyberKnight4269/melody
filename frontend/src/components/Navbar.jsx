import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ onUploadClick }) => {
  const { logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-brand-dot" />
        <span className="navbar-brand-name">Melody</span>
      </div>

      <div className="navbar-right">
        {isAdmin && (
          <button className="btn-upload" onClick={onUploadClick}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Upload song
          </button>
        )}
        <button className="btn-logout" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;