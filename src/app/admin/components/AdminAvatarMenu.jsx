"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";

function initialsFromAdmin(admin) {
  if (!admin) return "A";
  const raw = admin.name || admin.fullName || admin.email || "Admin";
  const parts = String(raw).trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "A";
  const second = (parts.length > 1 ? parts[parts.length - 1]?.[0] : undefined) || "";
  return `${first}${second}`.toUpperCase();
}

export default function AdminAvatarMenu({ admin }) {
  const { logout } = useAdminAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const initials = useMemo(() => initialsFromAdmin(admin), [admin]);

  useEffect(() => {
    function onPointerDown(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }

    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open user menu"
        className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#F3F4F6] text-[13px] font-semibold text-[#111827] transition-all duration-200 hover:bg-[#EEF2FF] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/15"
      >
        {initials}
      </button>

      {open && (
        <div className="hc-animate-dropdown absolute right-0 mt-2 w-[200px] overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-md">
          <button
            type="button"
            onClick={logout}
            className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-sm text-[#111827] transition-colors duration-200 hover:bg-[#F3F4F6]"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
