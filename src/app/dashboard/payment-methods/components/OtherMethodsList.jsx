import Image from "next/image";

const METHOD_ICONS = {
  apple:  "/images/apple.png",
  paypal: "/images/paypal-icon.png",
};

function MethodItem({ method, isLast }) {
  return (
    <div
      className={`flex items-center gap-3 md:gap-4 px-4 md:px-5 py-4 md:py-5 hover:bg-[#F9FAFB] transition-colors ${
        !isLast ? "border-b border-dashed border-[#E5E7EB]" : ""
      }`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F3F4F6] border border-dashed border-[#E5E7EB]">
        <Image
          src={METHOD_ICONS[method.icon] || METHOD_ICONS.paypal}
          alt={method.name}
          width={22}
          height={22}
          className="object-contain"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#111827]">{method.name}</p>
        <p className="mt-0.5 text-xs text-[#6B7280]">{method.desc}</p>
      </div>

      <div className="shrink-0">
        {method.status === "available" && (
          <span className="inline-flex items-center rounded-full border border-dashed border-[#E5E7EB] bg-[#F3F4F6] px-3 py-1 text-[11px] font-medium text-[#6B7280]">
            Available
          </span>
        )}
        {method.status === "connect" && (
          <button
            type="button"
            className="inline-flex items-center rounded-xl border border-dashed border-[#E5E7EB] px-4 py-1.5 text-xs font-semibold text-[#111827] transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-600 cursor-pointer"
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
}

export function OtherMethodsList({ methods }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-[#111827] mb-3">Other Payment Options</h2>
      <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] overflow-hidden">
        {methods.map((method, idx) => (
          <MethodItem key={method.id} method={method} isLast={idx === methods.length - 1} />
        ))}
      </div>
    </div>
  );
}
