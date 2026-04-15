import Link from "next/link";
import Image from "next/image";
import { EmailIcon, FacebookIcon, InstagramIcon, LinkedInIcon, LocationIcon, PhoneIcon, TaxIcon, WhatsAppIcon, XIcon, YoutubeIcon } from "../common/SvgIcon";

const contactItems = [
  { icon: EmailIcon, text: "info@humanconcernusa.org" },
  { icon: PhoneIcon, text: "1-800-583-5841" },
  { icon: LocationIcon, text: "600 E Carmel Drive Suite 147 Carmel, IN 46032" },
  { icon: TaxIcon, text: "Tax Exempt ID: 92-2388570" },
];

const socials = [
  { label: "WhatsApp", href: "#", svg: WhatsAppIcon },
  { label: "LinkedIn", href: "#", svg: LinkedInIcon },
  { label: "Instagram", href: "#", svg: InstagramIcon },
  { label: "X", href: "#", svg: XIcon },
  { label: "Facebook", href: "#", svg: FacebookIcon },
  { label: "YouTube", href: "#", svg: YoutubeIcon },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="-mt-[93px] relative z-10">
      <div className="bg-white rounded-t-[100px] px-6 sm:px-10 lg:px-20 pt-14 pb-0">
        <div className="max-w-[1350px] mx-auto">
          <div className="flex flex-col md:flex-row flex-wrap lg:flex-nowrap gap-10 lg:gap-12 pb-12 border-b border-[#EBEBEB]">
             <div className="w-full md:w-1/2 lg:w-[30%]">
              <Link href="/" className="flex items-center mb-5 no-underline">
                <img
                  src="/icons/hcu-icon.png"
                  alt="Human Concern Logo"
                  className="w-[212px] h-[54px] object-contain"
                />
              </Link>
              <p className="text-[14px] text-[#383838] font-normal m-0">
                Fighting poverty for over 40 years.<br />
                HUMAN CONCERN USA is a<br />
                501(C)3<br />
                Tax Exempt Nonprofit.
              </p>
            </div>

            {/* Col 2 — Contact Us */}
            <div className="w-full md:w-1/2 lg:w-[35%]">
              <h3 className="text-xl md:text-2xl font-bold text-[#383838] mb-5">
                Contact Us
              </h3>
              <ul className="flex flex-col gap-[6px] list-none p-0 m-0">
                {contactItems.map(({ icon, text }, i) => (
                  <li key={i} className="flex items-start gap-2">
                    {icon}
                    <span className="text-[16px] text-[#383838]">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Subscribe + Socials */}
            <div className="w-full content-center md:w-full lg:w-[35%]">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full border border-[#E2E2E2] rounded-2xl px-4 py-3.5 text-[13px] text-[#1A1A1A] placeholder:text-[#BBBBBB] outline-none focus:border-[#CC1F1F] transition-colors duration-200 mb-3"
              />
              <button className="w-full bg-[#2A2A2A] hover:bg-[#111111] text-white font-semibold text-[15px] rounded-2xl py-3.5 transition-colors duration-200">
                Subscribe
              </button>
              <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
                {socials.map(({ label, href, svg }) => (
                  
                  <a key={label}
                    href={href}
                    aria-label={label}
                    className="w-9 h-9 flex items-center justify-center text-[#CC1F1F] hover:bg-[#CC1F1F] hover:text-white transition-all duration-200 shrink-0"
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