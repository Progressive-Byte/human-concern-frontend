"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin as apiAdminLogin } from "@/services/adminAuthService";
import { getAdminMe } from "@/services/admin";
import { setCookie, deleteCookie, getCookie } from "@/utils/cookies";
import { firstAllowedAdminHref } from "@/utils/adminNav";

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
      // Land on the first page this role may actually open (Overview needs `dashboard.read`).
      router.push(firstAllowedAdminHref(admin) || "/admin");
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

  // Restore the admin identity (roles + permissions) after a page reload. Without
  // this, `admin` is null on refresh and permission-gated menus would be unreliable.
  useEffect(() => {
    let alive = true;
    const token = getCookie("adminToken");
    if (!token) return () => { alive = false; };

    setLoading(true);
    (async () => {
      try {
        const res = await getAdminMe();
        if (!alive) return;
        const me = res?.data?.admin || res?.admin;
        if (me) setAdmin(me);
      } catch {
        // A 401 fires the global `admin:unauthorized` listener, which logs out.
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
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
