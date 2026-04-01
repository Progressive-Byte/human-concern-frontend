"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Campaigns", href: "/campaigns" },
  { label: "Donate", href: "/donate" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 px-6 transition-all duration-300 ${
        scrolled
          ? "bg-black/95 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.06)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto h-[72px] flex items-center gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-yellow-400 text-xl">❤</span>
          <span className="text-white font-bold text-lg tracking-tight">
            Human<span className="text-yellow-400">Concern</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 ml-auto">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                pathname === href
                  ? "text-yellow-400 bg-white/5"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-white/75 hover:text-white hover:bg-white/5 rounded-md transition-all duration-200"
          >
            Sign In
          </Link>
          <Link
            href="/donate"
            className="px-5 py-2 text-sm font-semibold text-black bg-yellow-400 hover:bg-yellow-300 rounded-md transition-all duration-200 hover:-translate-y-0.5"
          >
            Donate Now
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden ml-auto flex flex-col justify-center gap-[5px] w-9 h-9 p-1 bg-transparent border-none cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span
            className={`block h-0.5 w-full bg-white rounded transition-all duration-300 origin-center ${
              menuOpen ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-full bg-white rounded transition-all duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-full bg-white rounded transition-all duration-300 origin-center ${
              menuOpen ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 bg-black/98 backdrop-blur-xl ${
          menuOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-6 pb-6 pt-2">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                pathname === href
                  ? "text-yellow-400 bg-yellow-400/10"
                  : "text-white/75 hover:text-yellow-400 hover:bg-yellow-400/10"
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-white/75 border border-white/10 rounded-lg hover:text-white hover:bg-white/5 transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/donate"
              onClick={() => setMenuOpen(false)}
              className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-black bg-yellow-400 hover:bg-yellow-300 rounded-lg transition-all"
            >
              Donate Now
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}