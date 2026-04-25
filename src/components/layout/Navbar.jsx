"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Campaigns", href: "/campaigns" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { user, loading, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const showAuth = mounted && !loading;
  const displayName = user?.name || user?.firstName || "User";

  return (
    <header
      className={`fixed left-0 right-0 z-50 px-5 pt-4 transition-all duration-300 ${
        isHome ? "top-[100px]" : "top-0"
      }`}
    >
      <div className="max-w-[1611px] mx-auto">
        {/* Floating pill */}
        <nav className="bg-white/85 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-4 shadow-[0_4px_24px_rgba(0,0,0,0.12)]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 mr-2 no-underline">
            <img
              src="/icons/hcu-icon.png"
              alt="Human Concern Logo"
              className="w-[212px] h-[54px] object-contain"
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1 ml-auto">
            {navLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`px-4 py-1.5 text-lg font-normal rounded-full no-underline transition-all duration-200 ${
                  pathname === href
                    ? "text-[#383838] bg-gray-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2 ml-3">
            {/* Skeleton while loading */}
            {!showAuth ? (
              <div className="w-24 h-9 rounded-full bg-gray-200 animate-pulse" />
            ) : isAuthenticated ? (
              /* Logged-in state */
              <div className="relative group">
                <button className="flex items-center gap-2 pl-2 pr-4 py-1.5 text-sm font-semibold text-white bg-[#383838] hover:bg-gray-700 rounded-full transition-all duration-200 cursor-pointer">
                  {/* Avatar circle */}
                  <span className="w-7 h-7 rounded-full bg-[#EA3335] flex items-center justify-center text-[12px] font-bold text-white shrink-0 uppercase">
                    {displayName.charAt(0)}
                  </span>
                  Hello, {displayName.split(" ")[0]}
                </button>

                {/* Hover dropdown */}
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[160px]">
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-1">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 no-underline transition-colors"
                    >
                      Dashboard
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#EA3335] hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Guest state */
              <Link
                href="/user/login"
                className="px-6 py-2 text-lg font-normal text-white bg-[#383838] hover:bg-gray-700 rounded-full transition-all duration-200 no-underline"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden ml-auto flex flex-col justify-center gap-[5px] w-8 h-8 bg-transparent border-none cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block h-0.5 w-full bg-gray-800 rounded transition-all duration-300 origin-center ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`block h-0.5 w-full bg-gray-800 rounded transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-full bg-gray-800 rounded transition-all duration-300 origin-center ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </button>
        </nav>

        {/* Mobile dropdown */}
        <div
          className={`md:hidden mt-2 overflow-hidden transition-all duration-300 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl ${
            menuOpen ? "max-h-80" : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-1 p-4">
            {navLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`px-4 py-3 text-sm font-medium rounded-xl no-underline transition-all ${
                  pathname === href ? "text-red-600 bg-red-50" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {label}
              </Link>
            ))}

            <div className="flex gap-2 mt-2 pt-3 border-t border-gray-100">
              {!showAuth ? (
                <div className="flex-1 h-10 rounded-full bg-gray-200 animate-pulse" />
              ) : isAuthenticated ? (
                <>
                  {/* User info */}
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-full overflow-hidden">
                    <span className="w-6 h-6 rounded-full bg-[#EA3335] flex items-center justify-center text-[10px] font-bold text-white shrink-0 uppercase">
                      {displayName.charAt(0)}
                    </span>
                    <span className="text-sm font-semibold text-gray-800 truncate">
                      {displayName.split(" ")[0]}
                    </span>
                  </div>
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="flex-1 text-center py-2.5 text-sm font-semibold text-white bg-[#EA3335] rounded-full hover:bg-red-700 transition-all cursor-pointer"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <Link
                  href="/user/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-all no-underline"
                >
                  Sign In
                </Link>
              )}

              <Link
                href="/donate"
                onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-2.5 text-sm font-semibold text-white bg-red-600 rounded-full hover:bg-red-700 transition-all no-underline"
              >
                Donate
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}