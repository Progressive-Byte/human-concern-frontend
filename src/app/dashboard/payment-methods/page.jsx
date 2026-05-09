import { CardIcon, NoCheckIcon, PlusIcon, TrashIcon } from "@/components/common/SvgIcon";
import DashboardHeader from "../components/DashboardHeader";
import Image from "next/image";

const savedCards = [
  { id: 1, brand: "Visa",       last4: "4242", exp: "12/25", isDefault: true  },
  { id: 2, brand: "Mastercard", last4: "5555", exp: "08/26", isDefault: false },
];

const otherMethods = [
  {
    id: "apple-pay",
    name: "Apple Pay",
    desc: "Pay with Face ID or Touch ID",
    status: "available",
    icon: "apple",
  },
  {
    id: "paypal",
    name: "PayPal",
    desc: "Connect your PayPal account",
    status: "connect",
    icon: "paypal",
  },
];

const PaymentMethodsPage = () => {
  return (
    <>
      <DashboardHeader
        title="Payment Methods"
        subtitle="Manage your saved payment methods"
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1A1A1A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#333333] transition-colors cursor-pointer"
          >
            {PlusIcon}
            Add New Card
          </button>
        }
      />

      <div className="flex-1 p-4 md:p-6 space-y-6">
        <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] overflow-hidden">
          {savedCards.map((card, idx) => (
            <div
              key={card.id}
              className={`flex items-center gap-3 md:gap-4 px-4 md:px-5 py-4 md:py-5 hover:bg-[#F9FAFB] transition-colors ${
                idx !== savedCards.length - 1 ? "border-b border-dashed border-[#E5E7EB]" : ""
              }`}
            >
              <div className="shrink-0 w-10 h-10 rounded-xl bg-[#F3F4F6] border border-dashed border-[#E5E7EB] flex items-center justify-center text-[#6B7280]">
                {CardIcon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2">
                  <p className="text-sm font-semibold text-[#111827]">
                    {card.brand} ···· {card.last4}
                  </p>
                  {card.isDefault && (
                    <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#047857]">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5">Expires {card.exp}</p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {!card.isDefault && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#111827] hover:border-red-500/40 hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    {NoCheckIcon}
                    Set Default
                  </button>
                )}
                <button
                  type="button"
                  title="Remove"
                  className="w-8 h-8 rounded-lg border border-dashed border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:border-[#EA3335]/40 hover:text-[#EA3335] hover:bg-[#FFF5F5] transition-colors cursor-pointer"
                >
                  {TrashIcon}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-base font-semibold text-[#111827] mb-3">Other Payment Options</h2>

          <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] overflow-hidden">
            {otherMethods.map((m, idx) => (
              <div
                key={m.id}
                className={`flex items-center gap-3 md:gap-4 px-4 md:px-5 py-4 md:py-5 hover:bg-[#F9FAFB] transition-colors ${
                  idx !== otherMethods.length - 1
                    ? "border-b border-dashed border-[#E5E7EB]"
                    : ""
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F3F4F6] border border-dashed border-[#E5E7EB]">
                  <Image
                    src={
                      m.icon === "apple"
                        ? "/images/apple.png"
                        : "/images/paypal-icon.png"
                    }
                    alt={m.name}
                    width={22}
                    height={22}
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#111827]">{m.name}</p>
                  <p className="mt-0.5 text-xs text-[#6B7280]">{m.desc}</p>
                </div>
                <div className="shrink-0">
                  {m.status === "available" && (
                    <span className="inline-flex items-center rounded-full border border-dashed border-[#E5E7EB] bg-[#F3F4F6] px-3 py-1 text-[11px] font-medium text-[#6B7280]">
                      Available
                    </span>
                  )}
                  {m.status === "connect" && (
                    <button
                      type="button"
                      className="inline-flex items-center rounded-xl border border-dashed border-[#E5E7EB] px-4 py-1.5 text-xs font-semibold text-[#111827] transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-600 cursor-pointer"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
export default PaymentMethodsPage;
