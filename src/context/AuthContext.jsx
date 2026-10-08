import React, { createContext, useContext, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const login = async (email, password) => {
    try {
      const data = await api.login(email, password);
      if (data && data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, message: data?.message || "Login failed" };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || "Invalid email or password"
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await api.register(name, email, password);
      if (data && data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, message: data?.message || "Registration failed" };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || "Registration failed"
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
