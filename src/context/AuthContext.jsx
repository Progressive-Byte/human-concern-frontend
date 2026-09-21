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

function _fromBase64Url(segment) {
  if (typeof segment !== "string" || segment.length === 0) return null;
  try {
    let base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const pad = (4 - (base64.length % 4)) % 4;
    if (pad) base64 += "=".repeat(pad);
    const decoded =
      typeof atob === "function"
        ? atob(base64)
        : Buffer.from(base64, "base64").toString("binary");
    const len = decoded.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = decoded.charCodeAt(i);
    return typeof TextDecoder !== "undefined"
      ? new TextDecoder("utf-8").decode(bytes)
      : decodeURIComponent(escape(decoded));
  } catch {
    return null;
  }
}

function decodeJwtPayload(token) {
  if (typeof token !== "string" || token.length === 0) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[1].length === 0) return null;
  const json = _fromBase64Url(parts[1]);
  if (typeof json !== "string" || json.length === 0) return null;
  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function getTokenExpiry(token) {
  const payload = decodeJwtPayload(token);
  return payload && typeof payload.exp === "number" ? payload.exp * 1000 : null;
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

  async function login(credentials, { redirectTo } = {}) {
    const res = await apiLogin(credentials);
    const { user, accessToken } = res.data;

    setCookie("token", accessToken);
    saveUser(user);
    setUser(user);
    let target = typeof redirectTo === "string" ? redirectTo : null;
    if (!target && typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("hc_redirect_after_login");
        if (stored) {
          sessionStorage.removeItem("hc_redirect_after_login");
          target = stored;
        }
      } catch {}
    }
    router.push(target || "/dashboard");
    return res;
  }

  async function register(payload) {
    const res = await apiRegister(payload);
    const { user } = res.data;
    saveUser(user);
    setUser(user);
    router.push("/user/login?registered=1");
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
