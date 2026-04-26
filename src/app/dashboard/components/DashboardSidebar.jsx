"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { calendarIcon, cardIcon, DashboardIcon, DashTabIcon, historyIcon, MakeDonerIcon, pieChartIcon, UserDashboardIcon, UserIcon } from "@/components/common/SvgIcon";

/**
 * Sidebar navigation for the user dashboard.
 * Tabs are declared statically here; later they can be filtered by
 * permissions / feature flags coming from the API.
 */
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/dashboard/donation-history", label: "Donation History", icon: "history" },
  { href: "/dashboard/schedules", label: "Schedules", icon: "calendar" },
  { href: "/dashboard/fund-breakdown", label: "Fund Breakdown", icon: "pie" },
  { href: "/dashboard/payment-methods", label: "Payment Methods", icon: "card" },
  { href: "/dashboard/profile", label: "Profile", icon: "user" },
];

function NavIcon({ name }) {
  // lightweight inline icons – replace with project SvgIcon set later
  const common = "w-4 h-4";
  switch (name) {
    case "grid":
      return (
        DashTabIcon
      );
    case "history":
      return (
        historyIcon
      );
    case "calendar":
      return (
        calendarIcon
      );
    case "pie":
      return (
        pieChartIcon
      );
    case "card":
      return (
        cardIcon
      );
    case "user":
      return (
        UserDashboardIcon
      );
    default:
      return null;
  }
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isActive = (href) =>
    href === "/dashboard" ? pathname === href : pathname?.startsWith(href);

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-dashed border-[#BFBFBF] ml-2 bg-white">
      <div className="flex items-center gap-2 px-1 py-[20px] border-b border-[#CCCCCC]">
        <div className="">
          {DashboardIcon}
        </div>
        <span className="font-bold text-[18px] text-[#1A1A1A]">Human Concern USA</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-3 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-2xl px-3 py-4 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#262626] text-white"
                  : "text-[#737373] hover:bg-gray-100"
              }`}
            >
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="px-4 py-3 border-t border-[#BFBFBF] space-y-2">
        <Link
          href="/donate"
          className="flex items-center justify-start gap-2 w-full rounded-2xl bg-[#4D4D4D] px-3 py-4 text-[16px] font-medium text-white"
        >
          {MakeDonerIcon}
          Make a Donation
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
