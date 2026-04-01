import Link from "next/link";

const footerLinks = {
  Explore: [
    { label: "Campaigns", href: "/campaigns" },
    { label: "Donate", href: "/donate" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Ways to Give", href: "/#ways-to-give" },
  ],
  Account: [
    { label: "Sign In", href: "/login" },
    { label: "Register", href: "/register" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "My Donations", href: "/dashboard/donations" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

const socials = ["T", "F", "I", "L"];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/[0.07] pt-20 text-sm text-white/60">
      <div className="max-w-6xl mx-auto px-6 pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12">
        {/* Brand */}
        <div>
          <Link href="/" className="flex items-center gap-2 mb-4 no-underline">
            <span className="text-yellow-400 text-lg">❤</span>
            <span className="text-white font-bold text-base tracking-tight">
              Human<span className="text-yellow-400">Concern</span>
            </span>
          </Link>
          <p className="text-white/45 leading-relaxed mb-6 max-w-[280px]">
            Connecting compassionate donors with causes that change lives around the world.
          </p>
          <div className="flex gap-2">
            {["Twitter", "Facebook", "Instagram", "LinkedIn"].map((s, i) => (
              <a
                key={s}
                href="#"
                aria-label={s}
                className="w-[34px] h-[34px] flex items-center justify-center bg-white/5 border border-white/10 rounded-lg text-white/60 text-xs font-semibold hover:bg-yellow-400/10 hover:border-yellow-400/30 hover:text-yellow-400 transition-all duration-200"
              >
                {socials[i]}
              </a>
            ))}
          </div>
        </div>

        {/* Link groups */}
        {Object.entries(footerLinks).map(([group, links]) => (
          <div key={group}>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/35 mb-5">
              {group}
            </h3>
            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              {links.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-white/55 no-underline hover:text-yellow-400 transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[13px] text-white/30 m-0">
            © {year} HumanConcern. All rights reserved.
          </p>
          <p className="text-[13px] text-white/30 m-0">
            Making the world better, one donation at a time.
          </p>
        </div>
      </div>
    </footer>
  );
}