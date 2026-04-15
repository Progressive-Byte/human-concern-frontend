import Link from "next/link";
import Image from "next/image";

const contactItems = [
  { icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 shrink-0 mt-0.5 text-[#CC1F1F]">
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
    </svg>
  ), text: "info@humanconcernusa.org" },
  { icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 shrink-0 mt-0.5 text-[#CC1F1F]">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>
    </svg>
  ), text: "1-800-583-5841" },
  { icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 shrink-0 mt-0.5 text-[#CC1F1F]">
      <circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 0 0-8-8z"/>
    </svg>
  ), text: "600 E Carmel Drive Suite 147 Carmel, IN 46032" },
  { icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 shrink-0 mt-0.5 text-[#CC1F1F]">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
    </svg>
  ), text: "Tax Exempt ID: 92-2388570" },
];

const socials = [
  { label: "WhatsApp", href: "#", svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg> },
  { label: "LinkedIn", href: "#", svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
  { label: "Instagram", href: "#", svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg> },
  { label: "X", href: "#", svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { label: "Facebook", href: "#", svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
  { label: "YouTube", href: "#", svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="-mt-10 relative z-10">
      {/* White card with rounded top corners overlapping CTA */}
      <div className="bg-white rounded-t-[40px] px-6 sm:px-10 lg:px-20 pt-14 pb-0">

        {/* 3-col grid */}
        <div className="max-w-[1350px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.2fr_1.6fr_1.6fr] gap-10 lg:gap-12 pb-12 border-b border-[#EBEBEB]">

            {/* Col 1 — Brand */}
            <div>
              <Link href="/" className="flex items-center gap-3 mb-5 no-underline">
                <div className="w-11 h-11 rounded-full bg-[#CC1F1F] flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <circle cx="12" cy="8" r="3" fill="white"/>
                    <path d="M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M9 11l-3 3m9-3l3 3" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="text-[#1A1A1A] font-extrabold text-[16px] tracking-wide uppercase leading-tight">
                  Human Concern USA
                </span>
              </Link>
              <p className="text-[13px] text-[#666666] leading-[1.8] m-0">
                Fighting poverty for over 40 years.<br />
                HUMAN CONCERN USA is a<br />
                501(C)3<br />
                Tax Exempt Nonprofit.
              </p>
            </div>

            {/* Col 2 — Contact Us */}
            <div>
              <h3 className="text-[20px] font-bold text-[#1A1A1A] mb-5 tracking-tight">
                Contact Us
              </h3>
              <ul className="flex flex-col gap-4 list-none p-0 m-0">
                {contactItems.map(({ icon, text }, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {icon}
                    <span className="text-[13px] text-[#444444] leading-snug">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Subscribe + Socials */}
            <div className="flex flex-col">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full border border-[#E2E2E2] rounded-2xl px-4 py-3.5 text-[13px] text-[#1A1A1A] placeholder:text-[#BBBBBB] outline-none focus:border-[#CC1F1F] transition-colors duration-200 mb-3"
              />
              <button className="w-full bg-[#2A2A2A] hover:bg-[#111111] text-white font-semibold text-[15px] rounded-2xl py-3.5 transition-colors duration-200">
                Subscribe
              </button>
              <div className="flex items-center gap-2 mt-6 flex-wrap">
                {socials.map(({ label, href, svg }) => (
                  
                  <a key={label}
                    href={href}
                    aria-label={label}
                    className="w-9 h-9 rounded-full border-2 border-[#CC1F1F] flex items-center justify-center text-[#CC1F1F] hover:bg-[#CC1F1F] hover:text-white transition-all duration-200 shrink-0"
                  >
                    {svg}
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* Copyright */}
          <div className="py-6 text-center">
            <p className="text-[13px] text-[#999999] m-0">
              Copyright © {year} HC USA. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}