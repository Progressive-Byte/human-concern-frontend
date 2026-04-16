import Link from "next/link";

export default function AuthLayout({ children }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center py-[140px] bg-[url('/images/bg/registration-bg.png')] bg-cover bg-center bg-no-repeat"
    >
      <div className="w-full max-w-[480px] backdrop-blur-[80px] bg-[#383838CC] rounded-2xl overflow-hidden">
        <div className="px-8 pt-8">
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
      </div>
    </div>
  );
}