"use client";

import Link from "next/link";
import AdminAvatarMenu from "@/app/admin/components/AdminAvatarMenu";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function CausesHeader({ onCreate }) {
  const { admin } = useAdminAuth();

  return (
    <div className="hc-animate-fade-up flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-[24px] font-semibold leading-tight text-[#111827]">Donation Causes</h1>
        <p className="mt-1 text-[14px] text-[#6B7280]">Create and manage donation causes</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-red-700"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/10">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          Create Cause
        </button>

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
  );
}

