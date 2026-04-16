import Link from "next/link";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10">

      {/* ── Full-screen background image ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/bg/registration-bg.png')" }}
      />
      {/* Dark overlay so card is readable */}
      <div className="absolute inset-0 bg-black/40" />

      {/* ── Centered auth card ── */}
      <div className="relative z-10 w-full max-w-[480px] rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "rgba(40, 38, 38, 0.97)" }}
      >
        {/* Logo strip */}
        <div className="flex items-center gap-3 px-8 pt-8 pb-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/icons/hcu-icon.png"
              alt="Human Concern USA"
              className="h-9 w-9 object-contain"
            />
            <span className="text-white font-bold text-[15px] tracking-widest uppercase">
              Human Concern USA
            </span>
          </Link>
        </div>

        {/* Form content */}
        <div className="px-8 py-7">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-white/25 pb-5">
          &copy; {new Date().getFullYear()} Human Concern USA. All rights reserved.
        </p>
      </div>
    </div>
  );
}