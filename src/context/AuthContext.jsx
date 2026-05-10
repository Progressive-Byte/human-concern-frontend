"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  login as apiLogin,
  register as apiRegister,
} from "@/services/authService";
import { setCookie, deleteCookie, getCookie } from "@/utils/cookies";

const AuthContext = createContext(null);

const USER_KEY = "hc_user";

function saveUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {}
}

function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (getCookie("token")) {
      setUser(loadUser());
    } else {
      saveUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      deleteCookie("token");
      saveUser(null);
      setUser(null);
      router.push("/user/login");
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [router]);

  async function login(credentials) {
    const res = await apiLogin(credentials);
    const { user, accessToken } = res.data;

    setCookie("token", accessToken);
    saveUser(user);
    setUser(user);
    router.push("/dashboard");
    return res;
  }

  async function register(payload) {
    const res = await apiRegister(payload);
    const { user } = res.data;
    saveUser(user);
    setUser(user);
    router.push("/user/login");
    return res;
  }

  function logout() {
    deleteCookie("token");
    saveUser(null);
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
