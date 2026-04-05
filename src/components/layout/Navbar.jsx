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
        isHome ? "top-[100px]" : "top-0"
      }`}
    >
      <div className="max-w-[1611px] mx-auto">
        {/* Floating pill */}
        <nav className="bg-white/85 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-4 shadow-[0_4px_24px_rgba(0,0,0,0.12)]">

          <Link href="/" className="flex items-center gap-2.5 shrink-0 mr-2 no-underline">
            <img src="/icons/hcu-icon.png" alt="Human Concern Logo" className="w-[212px] h-[54px] object-contain" />
          </Link>

          {/* Desktop nav */}
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

          {/* CTA */}
          <div className="hidden md:flex items-center gap-2 ml-3">
            <Link
              href="/login"
              className="px-6 py-2 text-lg font-normal text-white bg-[#383838] hover:bg-gray-700 rounded-full transition-all duration-200 no-underline"
            >
              Sign In
            </Link>
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