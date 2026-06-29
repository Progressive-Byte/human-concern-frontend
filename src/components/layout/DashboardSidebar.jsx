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

export const navItems = [
  { href: "/dashboard",                  label: "Dashboard",        icon: DashTabIcon },
  { href: "/dashboard/donation-history", label: "Donation History", icon: historyIcon },
  { href: "/dashboard/schedules",        label: "Schedules",        icon: calendarIcon },
  { href: "/dashboard/fund-breakdown",   label: "Fund Breakdown",   icon: pieChartIcon },
  { href: "/dashboard/payment-methods",  label: "Payment Methods",  icon: cardIcon },
  { href: "/dashboard/profile",          label: "Profile",          icon: UserDashboardIcon },
];

const DashboardSidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isActive = (href) =>
    href === "/dashboard" ? pathname === href : pathname?.startsWith(href);

  return (
    <aside className="hidden lg:flex h-screen w-[260px] shrink-0 flex-col border-r border-dashed border-[#E5E7EB] ml-2 bg-white sticky top-0">
      {/* Header */}
      <div className="flex items-center gap-2 px-1 py-[20px] border-b border-dashed border-[#E5E7EB]">
        <div>{DashboardIcon}</div>
        <span className="font-bold text-[18px] text-[#111827]">Human Concern USA</span>
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
                  ? "bg-[#1A1A1A] text-white"
                  : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-dashed border-[#E5E7EB] space-y-2">
        <Link
          href="/donate"
          className="flex items-center justify-start gap-2 w-full rounded-2xl bg-[#1A1A1A] px-3 py-4 text-[16px] font-medium text-white hover:bg-[#333333] transition-colors"
        >
          {MakeDonerIcon}
          Make a Donation
        </Link>

        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm text-[#6B7280] hover:text-[#EA3335] transition-colors cursor-pointer"
        >
          {SignOutIcon}
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
