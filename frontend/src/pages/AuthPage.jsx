import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const AuthPage = () => {

  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const endpoint = isLogin
        ? "/auth/login"
        : "/auth/register";

      const payload = isLogin
        ? {
            email: formData.email,
            password: formData.password
          }
        : formData;
      const res = await api.post(endpoint, payload);

      login(res.data.token);

      navigate("/");

    } catch (error) {
      alert(error.response?.data?.message);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "350px",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}
      >
        <h1>
          {isLogin ? "Login" : "Register"}
        </h1>

        {!isLogin && (
          <input
            type="text"
            name="name"
            placeholder="Name"
            onChange={handleChange}
          />
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <button type="submit">
          {isLogin ? "Login" : "Register"}
        </button>

        <p>
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}
        </p>

        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "Switch to Register"
            : "Switch to Login"}
        </button>
      </form>
    </div>
  );
};

export default AuthPage;