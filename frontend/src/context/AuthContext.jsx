import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

// Decode JWT payload without a library
const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  );

  const decoded = token ? decodeToken(token) : null;
  const isAdmin = decoded?.role === "admin" || decoded?.isAdmin === true;

  const login = (jwtToken) => {
    localStorage.setItem("token", jwtToken);
    setToken(jwtToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);