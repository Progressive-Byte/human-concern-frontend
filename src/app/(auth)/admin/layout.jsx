"use client";

import { AdminAuthProvider } from "@/context/AdminAuthContext";

export default function AdminAuthLayout({ children }) {
  return (
    <AdminAuthProvider>
      <div className="mb-5 rounded-lg bg-[#EA3335]/10 border border-[#EA3335]/20 px-3 py-1.5 text-center">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#EA3335]/70">
          Admin Portal
        </span>
      </div>
      {children}
    </AdminAuthProvider>
  );
}
