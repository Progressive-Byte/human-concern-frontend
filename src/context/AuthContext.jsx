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

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        setUser(res?.data?.user ?? res?.user ?? res);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    const res = await apiLogin(credentials);
    const { user, accessToken } = res.data;
    setCookie("token", accessToken);
    setUser(user);
    router.push("/dashboard");
    return res;
  }

  async function register(payload) {
    const res = await apiRegister(payload);
    const { user, accessToken } = res.data;
    setUser(user);
    router.push("/user/login");
    return res;
  }

  /** Clear session and redirect to login. */
  function logout() {
    deleteCookie("token");
    setUser(null);
    router.push("/user/login");
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
