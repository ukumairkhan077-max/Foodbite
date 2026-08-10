"use client";
// context/AuthContext.js
// Tracks the logged-in user across the app. Checks /api/auth/me on load
// so a page refresh doesn't lose the session (as long as the token is still valid).

import { createContext, useContext, useEffect, useState } from "react";
import { apiClient, setStoredToken } from "@/lib/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  async function loadCurrentUser() {
    try {
      const data = await apiClient.get("/auth/me");
      setUser(data.user);
    } catch {
      setUser(null); // not logged in, or token expired — both are fine, just show as logged out
    } finally {
      setIsLoading(false);
    }
  }

  function login(token, userData) {
    setStoredToken(token);
    setUser(userData);
  }

  async function logout() {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // even if the request fails, still clear the local session
    }
    setStoredToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refresh: loadCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
