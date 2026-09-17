"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBranding } from "@/context/BrandingContext";
import { useHomepageContent } from "@/context/HomepageContentContext";
import { useLanguage } from "@/context/LanguageContext";
import { siteUrl } from "@/utils/constants";
import { EmailIcon, FacebookIcon, InstagramIcon, LinkedInIcon, LocationIcon, PhoneIcon, TaxIcon, WhatsAppIcon, XIcon, YoutubeIcon } from "../common/SvgIcon";

const SOCIAL_ICONS = {
  whatsapp: WhatsAppIcon,
  linkedin: LinkedInIcon,
  instagram: InstagramIcon,
  x: XIcon,
  twitter: XIcon,
  facebook: FacebookIcon,
  youtube: YoutubeIcon,
};

const Footer = () => {
  const year = new Date().getFullYear();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const content = useHomepageContent();
  const { t } = useLanguage();
  const { logoPath } = useBranding();
  const footer = content?.footer || {};

  const logoSrc = logoPath
    ? (logoPath.startsWith("http") ? logoPath : `${siteUrl}${logoPath}`)
    : "/icons/hcu-icon.png";

  const contact = footer.contact || {};
  const contactItems = [
    { icon: EmailIcon, text: contact.email },
    { icon: PhoneIcon, text: contact.phone },
    { icon: LocationIcon, text: contact.address },
    { icon: TaxIcon, text: contact.taxId ? `Tax Exempt ID: ${contact.taxId}` : "" },
  ].filter((x) => String(x.text || "").trim());

  const socials = Array.isArray(footer.socials) ? footer.socials : [];
  const missionLines = String(footer.mission || "").split("\n");

  return (
    <footer className={`${isHome ? "mt-0 md:-mt-[40px] lg:-mt-[93px]" : ""} relative z-10`}>
      <div className="bg-white rounded-t-[40px] sm:rounded-t-[60px] md:rounded-t-[80px] lg:rounded-t-[100px] px-4 sm:px-6 sm:px-10 lg:px-20 pt-10 sm:pt-14 pb-0">
        <div className="max-w-[1650px] mx-auto">
          <div className="flex flex-col md:flex-row flex-wrap lg:flex-nowrap lg:gap-10 gap-5 lg:gap-12 pb-10 sm:pb-12 border-b border-[#EBEBEB]">
             <div className="w-full mx-auto md:w-1/3 lg:w-[30%]">
              <Link href="/" className="flex items-center mb-5 no-underline">
                <img
                  src={logoSrc}
                  alt="Human Concern Logo"
                  className="w-[160px] h-[42px] sm:w-[212px] sm:h-[54px] object-contain"
                />
              </Link>
              <p className="text-[13px] sm:text-[14px] text-[#383838] font-normal m-0 leading-relaxed">
                {missionLines.map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < missionLines.length - 1 ? <br /> : null}
                  </React.Fragment>
                ))}
              </p>
            </div>

            {/* Col 2 — Contact Us */}
            <div className="w-full md:w-1/2 lg:w-[35%]">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#383838] mb-4 sm:mb-5">
                {t("footer.contactUs", "Contact Us")}
              </h3>
              <ul className="flex flex-col gap-[6px] list-none p-0 m-0">
                {contactItems.map(({ icon, text }, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 shrink-0 mt-0.5">{icon}</span>
                    <span className="text-[14px] sm:text-[16px] text-[#383838] leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Subscribe + Socials */}
            <div className="w-full md:w-full lg:w-[35%]">
              {footer.newsletter?.title ? (
                <div className="text-[15px] font-semibold text-[#383838] mb-1.5">{footer.newsletter.title}</div>
              ) : null}
              {footer.newsletter?.subtitle ? (
                <div className="text-[12px] text-[#6B7280] mb-2">{footer.newsletter.subtitle}</div>
              ) : null}
              <input
                type="email"
                placeholder={t("footer.emailPlaceholder", "Enter your email")}
                className="w-full border border-[#DDDDDD] rounded-full px-4 py-3 text-sm sm:text-[13px] text-[#1A1A1A] placeholder:text-[#BBBBBB] outline-none focus:border-[#CC1F1F] transition-colors duration-200 mb-3"
              />
              <button className="w-full bg-[#383838] hover:bg-[#111111] text-white font-semibold text-sm sm:text-[16px] rounded-full px-4 py-3 sm:py-3.5 transition-colors duration-200 shadow-[0px_6px_18px_0px_#00000047,0px_18px_40px_0px_#00000073] cursor-pointer">
                {footer.newsletter?.buttonLabel || t("footer.subscribe", "Subscribe")}
              </button>
              <div className="flex items-center justify-center sm:justify-start md:justify-center gap-[11px] mt-6 flex-wrap">
                {socials.map(({ label, href }, i) => {
                  const Icon = SOCIAL_ICONS[String(label || "").trim().toLowerCase()];
                  return (
                    <a
                      key={`${label}-${i}`}
                      href={href || "#"}
                      aria-label={label}
                      target={String(href || "").startsWith("http") ? "_blank" : undefined}
                      rel={String(href || "").startsWith("http") ? "noreferrer" : undefined}
                      className="group w-9 h-9 flex items-center justify-center text-[#E32226] hover:text-black"
                    >
                      {Icon || <span className="text-[12px] font-bold">{String(label || "?").slice(0, 1)}</span>}
                    </a>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Copyright */}
          <div className="py-6 text-center">
            <p className="text-[13px] text-[#999999] m-0">
              {t("footer.copyright", "Copyright © {year} {name}. All rights reserved.")
                .replace("{year}", String(year))
                .replace("{name}", footer.copyrightName || "HC USA")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
