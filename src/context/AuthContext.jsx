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

function getTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

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

  function doLogout() {
    deleteCookie("token");
    saveUser(null);
    setUser(null);
    router.push("/user/login");
  }

  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      const expiry = getTokenExpiry(token);
      if (expiry && Date.now() >= expiry) {
        doLogout();
      } else {
        setUser(loadUser());
      }
    } else {
      saveUser(null);
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const token = getCookie("token");
    if (!token) return;
    const expiry = getTokenExpiry(token);
    if (!expiry) return;
    const delay = expiry - Date.now();
    if (delay <= 0) return;
    const timer = setTimeout(() => doLogout(), delay);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const handleUnauthorized = () => doLogout();
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  function updateUser(fields) {
    const updated = { ...user, ...fields };
    saveUser(updated);
    setUser(updated);
  }

  function logout() {
    doLogout();
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
        updateUser,
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
