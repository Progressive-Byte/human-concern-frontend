"use client";

import Link from "next/link";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { adminHasPermission } from "@/utils/adminPermissions";

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M12 3v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 9l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/*
  The same Data Export link on every admin page. `tables` are the export keys that belong to the
  page, so the export screen opens with those tables already selected.
*/
const DataExportLink = ({ tables }) => {
  const { admin } = useAdminAuth();

  if (!tables || !adminHasPermission(admin, "data.export")) return null;

  return (
    <Link
      href={`/admin/data-export?tables=${encodeURIComponent(tables)}`}
      className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111827] transition-colors duration-200 hover:bg-[#F9FAFB]"
    >
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#111827]/5 text-[#111827]">
        <DownloadIcon />
      </span>
      Data Export
    </Link>
  );
};

export default DataExportLink;
