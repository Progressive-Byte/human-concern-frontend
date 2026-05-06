"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";

function NavIcon({ children }) {
  return <span className="inline-flex h-5 w-5 items-center justify-center text-[#A3A3A3]">{children}</span>;
}

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/campaigns", label: "Campaigns" },
  { href: null, label: "Causes", disabled: true },
  { href: null, label: "Addons", disabled: true },
  { href: null, label: "Objectives", disabled: true },
  { href: null, label: "Donors", disabled: true },
  { href: null, label: "Transactions", disabled: true },
  { href: "/admin/donations", label: "Donations" },
  { href: null, label: "Schedules", disabled: true },
  { href: null, label: "Abandonments", disabled: true },
  { href: "/admin/adminSettings", label: "Settings" },
];

export default function AdminSidebar({ onNavigate }) {
  const pathname = usePathname();
  const { logout } = useAdminAuth();

  const isActive = (href) => (href ? (href === "/admin" ? pathname === href : pathname?.startsWith(href)) : false);

  return (
    <aside className="flex h-screen w-65 shrink-0 flex-col bg-[#171717] text-white">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
          <Image src="/icons/hcu-icon-light.png" alt="Human Concern USA" width={22} height={22} />
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-semibold">Human Concern USA</div>
          <div className="text-[12px] text-white/60">Admin Panel</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const base =
            "flex items-center gap-3 rounded-2xl px-3 py-3 text-[14px] font-medium transition-colors";

          if (!item.href || item.disabled) {
            return (
              <div
                key={item.label}
                className={`${base} cursor-not-allowed text-white/40`}
              >
                <NavIcon>
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path
                      d="M12 3l8 6v12H4V9l8-6z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </NavIcon>
                <span>{item.label}</span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onNavigate?.()}
              className={`${base} ${
                active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <NavIcon>
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path
                    d="M4 12h16M4 6h16M4 18h16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </NavIcon>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-[14px] font-medium text-white/70 hover:bg-white/5 hover:text-white"
        >
          <NavIcon>
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path
                d="M10 17l-1 0a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3h1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M14 7l5 5-5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 12H10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </NavIcon>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
