// src/components/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css"; // Import the styles.css file
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        navigate("/gender");
      } else {
        setError("Invalid credentials");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError("An error occurred. Please try again.");
    }
  };

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("Google Login Successful:", tokenResponse);
      await GetUserProfile(tokenResponse); // Fetch and save user profile
    },
    onError: (error) => {
      console.error("Google Login Error:", error);
    },
  });

  const GetUserProfile = async (tokenInfo) => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`,
        {
          headers: {
            Authorization: `Bearer ${tokenInfo?.access_token}`,
            Accept: "application/json",
          },
        }
      );
      console.log("Google User Profile:", response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      navigate("/gender");
    } catch (error) {
      console.error("Error fetching Google user profile:", error);
    }
  };

  return (
    <div className="login">
      <img src="/assets/img/login-bg.png" alt="login" className="login__img" />
      <form className="login__form" onSubmit={handleLogin}>
        <h1 className="login__title">Login</h1>
        {error && <p className="error">{error}</p>}
        <div className="login__content">
          <div className="login__box">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login__input"
              required
            />
          </div>
          <div className="login__box login__box-input">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="login-pass"
              className="login__input"
              required
            />
            <span
              id="login-eye"
              className={showPassword ? "ri-eye-line" : "ri-eye-off-line"}
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: "pointer" }}
            />
          </div>
          <div>
            <hr />
            <br />
            {/* Google Login Button */}
            <button
              type="button"
              className="google-login-button"
              onClick={() => login()}
            >
              Sign In With Google
            </button>
            <br />
            <br />
          </div>
        </div>
        <button type="submit" className="login__button">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
