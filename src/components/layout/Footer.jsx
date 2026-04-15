import Link from "next/link";

const contactItems = [
  { icon: "✉", text: "info@humanconcernusa.org" },
  { icon: "📞", text: "1-800-583-5841" },
  { icon: "📍", text: "600 E Carmel Drive Suite 147 Carmel, IN 46032" },
  { icon: "🪪", text: "Tax Exempt ID: 92-2388570" },
];

const socials = [
  { label: "WhatsApp", href: "#", icon: "W" },
  { label: "LinkedIn", href: "#", icon: "in" },
  { label: "Instagram", href: "#", icon: "IG" },
  { label: "X", href: "#", icon: "X" },
  { label: "Facebook", href: "#", icon: "f" },
  { label: "YouTube", href: "#", icon: "▶" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1a0a0a] px-4 sm:px-6 pt-6 pb-0">
      {/* Main white card */}
      <div className="max-w-[1350px] mx-auto bg-white rounded-t-[28px] px-8 sm:px-12 lg:px-16 pt-12 pb-10">

        {/* 3-col grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_1.6fr_1.6fr] gap-10 lg:gap-8 pb-10 border-b border-[#E8E8E8]">

          {/* Col 1 — Brand */}
          <div>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 mb-5 no-underline">
              <div className="w-10 h-10 rounded-full bg-[#CC1F1F] flex items-center justify-center shrink-0">
                <span className="text-white text-lg font-bold leading-none">✕</span>
              </div>
              <span className="text-[#1A1A1A] font-extrabold text-[17px] tracking-tight uppercase leading-tight">
                Human Concern USA
              </span>
            </Link>

            <p className="text-[13px] text-[#555555] leading-relaxed m-0">
              Fighting poverty for over 40 years.<br />
              HUMAN CONCERN USA is a<br />
              501(C)3<br />
              Tax Exempt Nonprofit.
            </p>
          </div>

          {/* Col 2 — Contact Us */}
          <div>
            <h3 className="text-[18px] font-bold text-[#1A1A1A] mb-5 tracking-tight">
              Contact Us
            </h3>
            <ul className="flex flex-col gap-3.5 list-none p-0 m-0">
              {contactItems.map(({ icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <span className="text-[#CC1F1F] text-[15px] mt-0.5 shrink-0">{icon}</span>
                  <span className="text-[13px] text-[#444444] leading-snug">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Subscribe + Socials */}
          <div className="flex flex-col">
            {/* Email input */}
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border border-[#E0E0E0] rounded-xl px-4 py-3 text-[13px] text-[#1A1A1A] placeholder:text-[#AAAAAA] outline-none focus:border-[#CC1F1F] transition-colors duration-200 mb-3"
            />

            {/* Subscribe button */}
            <button className="w-full bg-[#2A2A2A] hover:bg-[#1A1A1A] text-white font-semibold text-[14px] rounded-xl py-3.5 transition-colors duration-200">
              Subscribe
            </button>

            {/* Social icons */}
            <div className="flex items-center gap-2.5 mt-6 flex-wrap">
              {socials.map(({ label, href, icon }) => (
                
                <a key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full border-2 border-[#CC1F1F] flex items-center justify-center text-[#CC1F1F] text-[11px] font-bold hover:bg-[#CC1F1F] hover:text-white transition-all duration-200 shrink-0"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="pt-6 pb-2 text-center">
          <p className="text-[13px] text-[#888888] m-0">
            Copyright © {year} HC USA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}