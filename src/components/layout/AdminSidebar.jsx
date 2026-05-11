"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";

function Icon({ name }) {
  if (name === "overview") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "campaigns") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  if (name === "causes") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "addons") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 4h16v16H4V4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" opacity="0.35" />
      </svg>
    );
  }

  if (name === "objectives") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M7 7h10M7 12h10M7 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M5 6h.01M5 12h.01M5 18h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "donors") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22 21v-2a4 4 0 0 0-3-3.87"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16 3.13a4 4 0 0 1 0 7.75"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (name === "transactions") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M4 7h16v10H4V7z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M4 10h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "donations") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M12 1v22"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "schedules") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M8 7V3m8 4V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 8h16v12H4V8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "abandonments") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M4 7h16v13H4V7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 3h6l1 4H8l1-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 12l6 6M15 12l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "settings") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M19.4 15a7.9 7.9 0 0 0 .1-2l2-1.2-2-3.5-2.3.6a7.7 7.7 0 0 0-1.7-1l-.3-2.4H11l-.3 2.4a7.7 7.7 0 0 0-1.7 1l-2.3-.6-2 3.5 2 1.2a7.9 7.9 0 0 0 .1 2l-2 1.2 2 3.5 2.3-.6c.5.4 1.1.8 1.7 1l.3 2.4h4l.3-2.4c.6-.2 1.2-.6 1.7-1l2.3.6 2-3.5-2-1.2z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "forms") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M7 4h10a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M9 8h8M9 12h8M9 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "categories") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M20 13l-7 7-11-11V2h7L20 13z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M7.5 7.5h.01" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M12 20a8 8 0 1 0-8-8 8 8 0 0 0 8 8z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 8v4l2 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NavIcon({ name, className = "" }) {
  return (
    <span className={`inline-flex h-5 w-5 items-center justify-center ${className}`.trim()}>
      <Icon name={name} />
    </span>
  );
}

const navItems = [
  { href: "/admin", label: "Overview", icon: "overview" },
  { href: "/admin/campaigns", label: "Campaigns", icon: "campaigns" },
  { href: "/admin/forms", label: "Forms", icon: "forms" },
  { href: "/admin/categories", label: "Categories", icon: "categories" },
  { href: "/admin/causes", label: "Causes", icon: "causes" },
  { href: "/admin/objectives", label: "Objectives", icon: "objectives" },
  { href: "/admin/add-ons", label: "Addons", icon: "addons" },
  { href: "/admin/donors", label: "Donors", icon: "donors" },
  { href: null, label: "Transactions", icon: "transactions", disabled: true },
  { href: "/admin/donations", label: "Donations", icon: "donations" },
  { href: null, label: "Schedules", icon: "schedules", disabled: true },
  { href: null, label: "Abandonments", icon: "abandonments", disabled: true },
  { href: "/admin/adminSettings", label: "Settings", icon: "settings" },
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
            "flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-[14px] font-medium transition-colors";

          if (!item.href || item.disabled) {
            return (
              <div
                key={item.label}
                className={`${base} cursor-not-allowed text-white/40`}
              >
                <NavIcon name={item.icon} className="text-white/35" />
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
                active ? "bg-red-600/15 text-white ring-1 ring-inset ring-red-500/25" : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <NavIcon name={item.icon} className={active ? "text-red-200" : "text-white/60"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <button
          type="button"
          onClick={logout}
          className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-[14px] font-medium text-white/70 hover:bg-white/5 hover:text-white"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center text-white/60">
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
          </span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
