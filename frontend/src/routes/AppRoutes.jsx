import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import AuthPage from "../pages/AuthPage";
import HomePage from "../pages/HomePage";

import ProtectedRoute from "./ProtectedRoute";

import { useAuth } from "../context/AuthContext";

const AppRoutes = () => {

  const { token } = useAuth();

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/auth"
          element={
            token
              ? <Navigate to="/" replace />
              : <AuthPage />
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
};

export default AppRoutes;