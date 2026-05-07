"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { navItems } from "./DashboardSidebar";
import { MakeDonerIcon, SignOutIcon } from "@/components/common/SvgIcon";

const DashboardHeader = ({ title, subtitle, actions }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = user?.name || user?.firstName || "there";
  const heading = title ?? `Welcome back, ${displayName}`;
  const sub = subtitle ?? "Here's an overview of your giving journey";

  const isActive = (href) =>
    href === "/dashboard" ? pathname === href : pathname?.startsWith(href);

  return (
    <>
      <header className="flex items-center justify-between gap-4 px-4 md:px-6 py-4 md:py-5 border-b border-[#EBEBEB] bg-white">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-[#1A1A1A] truncate">{heading}</h1>
          {sub && <p className="mt-0.5 text-[14px] md:text-[16px] text-[#737373]">{sub}</p>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {actions && <div className="hidden md:flex items-center gap-2">{actions}</div>}

          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden flex flex-col justify-center items-center w-9 h-9 rounded-xl border border-[#EBEBEB] bg-white gap-[5px] cursor-pointer"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-[#383838] transition-all ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`block w-5 h-0.5 bg-[#383838] transition-all ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-[#383838] transition-all ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </button>
        </div>
      </header>

      {/* Mobile slide-down nav */}
      {menuOpen && (
        <nav className="lg:hidden bg-white border-b border-[#EBEBEB] px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#262626] text-white"
                    : "text-[#737373] hover:bg-[#F5F5F5] hover:text-[#383838]"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-2 border-t border-[#EBEBEB] space-y-1 mt-1">
            <Link
              href="/donate"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 w-full rounded-2xl bg-[#4D4D4D] px-3 py-3 text-sm font-medium text-white"
            >
              {MakeDonerIcon}
              Make a Donation
            </Link>
            <button
              type="button"
              onClick={() => { setMenuOpen(false); logout(); }}
              className="flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm text-[#737373] hover:text-[#EA3335] transition-colors cursor-pointer"
            >
              {SignOutIcon}
              Sign Out
            </button>
          </div>
        </nav>
      )}
    </>
  );
};

export default DashboardHeader;
