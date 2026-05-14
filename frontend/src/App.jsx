import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";

const isAuthenticated = () => {
  return localStorage.getItem("user") !== null;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated() ? <Home /> : <Navigate to="/auth" />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </Router>
  );
}