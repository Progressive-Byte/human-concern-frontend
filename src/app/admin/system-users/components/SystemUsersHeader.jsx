"use client";

import Link from "next/link";
import AdminAvatarMenu from "@/app/admin/components/AdminAvatarMenu";
import { useAdminAuth } from "@/context/AdminAuthContext";

const TABS = [
  { key: "users", label: "Users" },
  { key: "roles", label: "Roles & Permissions" },
];

const SystemUsersHeader = ({ tab, onTabChange, showRolesTab = true }) => {
  const { admin } = useAdminAuth();
  const tabs = TABS.filter((t) => (t.key === "roles" ? showRolesTab : true));

  return (
    <div className="hc-animate-fade-up space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-[24px] font-semibold leading-tight text-[#111827]">System Users.</h1>
          <p className="mt-1 text-[14px] text-[#6B7280]">
            Manage platform/admin accounts, their roles and permissions. These users are separate from donors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Go to main site"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path d="M3 11l9-8 9 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 10v10h14V10" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </Link>

          <AdminAvatarMenu admin={admin} />
        </div>
      </div>

      <div className="inline-flex w-full max-w-full overflow-x-auto rounded-xl border border-dashed border-[#E5E7EB] bg-white p-1 sm:w-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => onTabChange?.(t.key)}
            className={`cursor-pointer whitespace-nowrap rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors ${
              tab === t.key ? "bg-red-600 text-white" : "text-[#6B7280] hover:bg-[#F9FAFB]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SystemUsersHeader;
