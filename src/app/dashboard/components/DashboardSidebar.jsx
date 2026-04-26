"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  calendarIcon,
  cardIcon,
  DashboardIcon,
  DashTabIcon,
  historyIcon,
  MakeDonerIcon,
  pieChartIcon,
  SignOutIcon,
  UserDashboardIcon,
} from "@/components/common/SvgIcon";

/**
 * Sidebar navigation for the user dashboard.
 */
const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: DashTabIcon,
  },
  {
    href: "/dashboard/donation-history",
    label: "Donation History",
    icon: historyIcon,
  },
  {
    href: "/dashboard/schedules",
    label: "Schedules",
    icon: calendarIcon,
  },
  {
    href: "/dashboard/fund-breakdown",
    label: "Fund Breakdown",
    icon: pieChartIcon,
  },
  {
    href: "/dashboard/payment-methods",
    label: "Payment Methods",
    icon: cardIcon,
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    icon: UserDashboardIcon,
  },
];

const DashboardSidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isActive = (href) =>
    href === "/dashboard"
      ? pathname === href
      : pathname?.startsWith(href);

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-dashed border-[#BFBFBF] ml-2 bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-1 py-[20px] border-b border-[#CCCCCC]">
        <div>{DashboardIcon}</div>
        <span className="font-bold text-[18px] text-[#1A1A1A]">
          Human Concern USA
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-3 overflow-y-auto space-y-1">
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
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
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
          className="flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm text-[#737373] cursor-pointer"
        >
          {SignOutIcon}
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default DashboardSidebar;