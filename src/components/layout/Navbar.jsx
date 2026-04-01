"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Campaigns", href: "/campaigns" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header
      className={`fixed left-0 right-0 z-50 px-5 pt-4 transition-all duration-300 ${
        isHome ? "top-[52px]" : "top-0"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Floating pill */}
        <nav className="bg-white/85 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-4 shadow-[0_4px_24px_rgba(0,0,0,0.12)]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 mr-2 no-underline">
            <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="white"
                />
              </svg>
            </div>
            <div className="flex flex-col leading-none gap-[1px]">
              <span className="text-[11px] font-black text-gray-900 tracking-widest uppercase">
                Human Concern
              </span>
              <span className="text-[9px] font-semibold text-gray-400 tracking-[0.2em] uppercase">
                USA
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 ml-auto">
            {navLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`px-4 py-1.5 text-sm font-medium rounded-full no-underline transition-all duration-200 ${
                  pathname === href
                    ? "text-gray-900 bg-gray-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-2 ml-3">
            <Link
              href="/login"
              className="px-5 py-2 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-700 rounded-full transition-all duration-200 no-underline"
            >
              Sign In
            </Link>
          </div>

          {/* Avatar */}
          <div className="hidden md:flex w-8 h-8 rounded-full bg-yellow-400 items-center justify-center text-xs font-bold text-black shrink-0">
            F
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
            menuOpen ? "max-h-72" : "max-h-0"
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
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-all no-underline"
              >
                Sign In
              </Link>
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