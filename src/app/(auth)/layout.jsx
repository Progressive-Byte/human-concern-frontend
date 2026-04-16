import Link from "next/link";

export default function AuthLayout({ children }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 bg-[url('/images/bg/registration-bg.png')] bg-cover bg-center bg-no-repeat"
    >
      <div
        className="w-full max-w-[480px] rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "rgba(40, 38, 38, 0.97)" }}
      >
        {/* Logo strip */}
        <div className="px-8 pt-8 pb-6">
          <Link href="/">
            <img
              src="/icons/hcu-icon-light.png"
              alt="Human Concern USA"
              className="h-[60px] w-auto object-contain"
            />
          </Link>
        </div>

        {/* Form content */}
        <div className="px-8 py-7">{children}</div>

        {/* Footer */}
        <p className="text-center text-[11px] text-white/25 pb-5">
          &copy; {new Date().getFullYear()} Human Concern USA. All rights reserved.
        </p>
      </div>
    </div>
  );
}