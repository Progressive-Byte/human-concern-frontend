"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  login as apiLogin,
  register as apiRegister,
  getCurrentUser,
} from "@/services/authService";
import { setCookie, deleteCookie } from "@/utils/cookies";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // On mount, try to restore session from the server
  useEffect(() => {
    getCurrentUser()
      .then((data) => {
        // Support both { user: {...} } and flat user object shapes
        setUser(data?.user ?? data);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  /**
   * Login with email + password.
   * Expects API to return: { token: string, user: object }
   */
  async function login(credentials) {
    const data = await apiLogin(credentials);
    setCookie("token", data.token);
    setUser(data.user ?? data);
    router.push("/dashboard");
    return data;
  }

  /**
   * Register a new user.
   * Expects API to return: { token: string, user: object }
   */
  async function register(payload) {
    const data = await apiRegister(payload);
    setCookie("token", data.token);
    setUser(data.user ?? data);
    router.push("/dashboard");
    return data;
  }

  /** Clear session and redirect to login. */
  function logout() {
    deleteCookie("token");
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
