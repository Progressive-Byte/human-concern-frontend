import Link from "next/link";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      {/* ── Left panel (desktop only) ────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-2/5 relative flex-col items-center justify-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/bg/registration-bg.png')" }}
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(103.99deg, rgba(64,61,206,0.90) 5.42%, rgba(32,31,104,0.97) 83.13%)",
          }}
        />

        {/* Decorative blurred circles */}
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] right-[-60px] w-56 h-56 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-10 xl:px-14 max-w-lg">
          {/* Logo */}
          <Link href="/" className="mb-10 inline-block">
            <img
              src="/icons/hcu-icon.png"
              alt="Human Concern USA"
              className="h-12 w-auto object-contain brightness-0 invert"
            />
          </Link>

          {/* Headline */}
          <h1 className="font-playfair text-4xl xl:text-[2.75rem] font-bold text-white leading-tight mb-5">
            Making a difference,
            <br />
            one act at a time.
          </h1>

          <p className="text-white/70 text-base xl:text-lg leading-relaxed">
            Join thousands of donors and volunteers working together to build
            a better world through compassion and action.
          </p>

          {/* Decorative pill dots */}
          <div className="flex items-center gap-2 mt-10">
            <div className="w-8 h-2 rounded-full bg-white" />
            <div className="w-2 h-2 rounded-full bg-white/40" />
            <div className="w-2 h-2 rounded-full bg-white/40" />
          </div>
        </div>
      </div>

      {/* ── Right panel (form area) ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12 sm:px-10 lg:px-14 xl:px-20 overflow-y-auto">
        {/* Mobile-only logo */}
        <div className="lg:hidden mb-8 self-start">
          <Link href="/">
            <img
              src="/icons/hcu-icon.png"
              alt="Human Concern USA"
              className="h-9 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Form slot */}
        <div className="w-full max-w-[440px]">{children}</div>

        {/* Footer note */}
        <p className="mt-10 text-xs text-gray-400 text-center">
          &copy; {new Date().getFullYear()} Human Concern USA. All rights reserved.
        </p>
      </div>
    </div>
  );
}
