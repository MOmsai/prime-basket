// src/context/AuthContext.jsx
import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function clearAuthStorage() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  // Note: pb_cart and pb_wishlist are intentionally NOT cleared here
  // so they survive logout and page refreshes
}

// Reads + validates session synchronously at call time.
// Called as a useState initializer so it runs exactly once before the first render.
function readSession() {
  try {
    const token     = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser || savedUser === "undefined" || savedUser === "null") {
      clearAuthStorage();
      return { isAuthenticated: false, user: null };
    }

    const parsed = JSON.parse(savedUser);
    if (parsed && typeof parsed === "object") {
      return { isAuthenticated: true, user: parsed };
    }

    clearAuthStorage();
    return { isAuthenticated: false, user: null };
  } catch {
    clearAuthStorage();
    return { isAuthenticated: false, user: null };
  }
}

export function AuthProvider({ children }) {
  // Initialize synchronously — no useEffect, no flash on mount
  const [isAuthenticated, setIsAuthenticated] = useState(() => readSession().isAuthenticated);
  const [user, setUser]                       = useState(() => readSession().user);

  const login = (userData, tokens) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    if (tokens?.accessToken)  localStorage.setItem("accessToken",  tokens.accessToken);
    if (tokens?.refreshToken) localStorage.setItem("refreshToken", tokens.refreshToken);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    clearAuthStorage();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}