import Link from "next/link";
import AdminAvatarMenu from "./AdminAvatarMenu";

export default function AdminDashboardHeader({ admin }) {
  return (
    <div className="hc-animate-fade-up flex items-start justify-between gap-4">
      <div>
        <h1 className="text-[24px] font-semibold leading-tight text-[#111827]">
          Dashboard Overview <span className="text-red-600">•</span>
        </h1>
        <p className="mt-1 text-[14px] text-[#6B7280]">Monitor platform performance and key metrics</p>
      </div>

      <div className="flex items-center gap-2">
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
