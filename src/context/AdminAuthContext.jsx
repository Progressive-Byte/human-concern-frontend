"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin as apiAdminLogin } from "@/services/adminAuthService";
import { setCookie, deleteCookie } from "@/utils/cookies";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function login(credentials) {
    setLoading(true);
    try {
      const res = await apiAdminLogin(credentials);
      const { admin, accessToken } = res.data;
      setCookie("adminToken", accessToken);
      setAdmin(admin);
      router.push("/admin");
      return res;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    deleteCookie("adminToken");
    setAdmin(null);
    router.push("/admin/login");
  }

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener("admin:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("admin:unauthorized", handleUnauthorized);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, loading, isAuthenticated: Boolean(admin), login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside <AdminAuthProvider>");
  return ctx;
}
