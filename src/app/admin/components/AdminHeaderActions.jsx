"use client";

import Link from "next/link";
import AdminAvatarMenu from "./AdminAvatarMenu";
import NotificationBell from "@/components/common/NotificationBell";

/**
 * The top-right cluster shared by every admin page header: notifications, a link to the public
 * site, then the admin's avatar menu.
 *
 * Kept in one place so the order stays consistent — every admin page used to hand-roll this
 * markup, which is how the bell ended up in the sidebar instead of here.
 */
const AdminHeaderActions = ({ admin }) => {
  return (
    <div className="flex items-center gap-2">
      <NotificationBell scope="admin" />

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
  );
};

export default AdminHeaderActions;
