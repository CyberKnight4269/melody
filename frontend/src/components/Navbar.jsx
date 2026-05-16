import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Navbar = () => {

  const { logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {

    logout();

    navigate("/auth");
  };

  return (

    <div
      style={{
        padding: "16px",
        display: "flex",
        justifyContent: "space-between",
        background: "black",
        color: "white"
      }}
    >

      <h2>Melody</h2>

      <button onClick={handleLogout}>
        Logout
      </button>

    </div>
  );
};

export default Navbar;