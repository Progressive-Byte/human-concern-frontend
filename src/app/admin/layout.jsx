"use client";

import { AdminAuthProvider } from "@/context/AdminAuthContext";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { useState } from "react";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminAuthProvider>
      <div className="h-screen overflow-hidden bg-white">
        <div className="flex h-screen">
          <div className="hidden lg:block">
            <AdminSidebar />
          </div>

          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button
                type="button"
                aria-label="Close menu overlay"
                className="absolute inset-0 bg-black/40"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="absolute inset-y-0 left-0">
                <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
              </div>
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:hidden shrink-0">
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setSidebarOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-700"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <div className="text-sm font-semibold text-gray-900">Admin Panel</div>
            </div>

            <div className="flex-1 min-w-0 overflow-y-auto">{children}</div>
          </div>
        </div>
      </div>
    </AdminAuthProvider>
  );
}
