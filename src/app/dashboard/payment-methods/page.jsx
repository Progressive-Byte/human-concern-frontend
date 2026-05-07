import { CardIcon, CheckIcon, NoCheckIcon, PlusIcon, TrashIcon } from "@/components/common/SvgIcon";
import DashboardHeader from "../components/DashboardHeader";

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

function AppleIcon() {
  return (
    <div className="w-9 h-9 rounded-xl bg-[#F5F5F5] border border-[#EBEBEB] flex items-center justify-center text-base leading-none select-none">
      🍎
    </div>
  );
}

function PayPalIcon() {
  return (
    <div className="w-9 h-9 rounded-xl bg-[#EEF4FF] border border-[#D4E3FF] flex items-center justify-center">
      <span className="text-[#1D4ED8] font-extrabold text-sm leading-none">P</span>
    </div>
  );
}

const PaymentMethodsPage = () => {
  return (
    <>
      <DashboardHeader
        title="Payment Methods"
        subtitle="Manage your saved payment methods"
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-[#383838] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1a1a1a] transition-colors cursor-pointer"
          >
            {PlusIcon}
            Add New Card
          </button>
        }
      />

      <div className="flex-1 p-4 md:p-6 space-y-6">

        {/* Saved Cards */}
        <div className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden">
          {savedCards.map((card, idx) => (
            <div
              key={card.id}
              className={`flex items-center gap-3 md:gap-4 px-4 md:px-5 py-4 md:py-5 hover:bg-[#FAFAFA] transition-colors ${
                idx !== savedCards.length - 1 ? "border-b border-dashed border-[#EBEBEB]" : ""
              }`}
            >
              {/* Card icon */}
              <div className="shrink-0 w-10 h-10 rounded-xl bg-[#F5F5F5] border border-[#EBEBEB] flex items-center justify-center text-[#737373]">
                {CardIcon}
              </div>

              {/* Card info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2">
                  <p className="text-sm font-semibold text-[#383838]">
                    {card.brand} ···· {card.last4}
                  </p>
                  {card.isDefault && (
                    <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ECF9F3] text-[#055A46]">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8C8C8C] mt-0.5">Expires {card.exp}</p>
              </div>

              {/* Actions */}
              <div className="shrink-0 flex items-center gap-2">
                {!card.isDefault && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#EBEBEB] px-3 py-1.5 text-xs font-medium text-[#383838] hover:border-[#055A46]/40 hover:text-[#055A46] hover:bg-[#ECF9F3] transition-colors cursor-pointer"
                  >
                    {NoCheckIcon}
                    Set Default
                  </button>
                )}
                <button
                  type="button"
                  title="Remove"
                  className="w-8 h-8 rounded-lg border border-[#EBEBEB] flex items-center justify-center text-[#8C8C8C] hover:border-[#EA3335]/40 hover:text-[#EA3335] hover:bg-[#FFF5F5] transition-colors cursor-pointer"
                >
                  {TrashIcon}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Other Payment Options */}
        <div>
          <h2 className="text-base font-semibold text-[#383838] mb-3">Other Payment Options</h2>

          <div className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden">
            {otherMethods.map((m, idx) => (
              <div
                key={m.id}
                className={`flex items-center gap-3 md:gap-4 px-4 md:px-5 py-4 md:py-5 hover:bg-[#FAFAFA] transition-colors ${
                  idx !== otherMethods.length - 1 ? "border-b border-dashed border-[#EBEBEB]" : ""
                }`}
              >
                {/* Icon */}
                {m.icon === "apple"  && <AppleIcon />}
                {m.icon === "paypal" && <PayPalIcon />}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#383838]">{m.name}</p>
                  <p className="text-xs text-[#8C8C8C] mt-0.5">{m.desc}</p>
                </div>

                {/* Status / action */}
                <div className="shrink-0">
                  {m.status === "available" && (
                    <span className="inline-flex items-center text-[11px] font-medium px-3 py-1 rounded-full border border-[#EBEBEB] bg-[#F5F5F5] text-[#737373]">
                      Available
                    </span>
                  )}
                  {m.status === "connect" && (
                    <button
                      type="button"
                      className="inline-flex items-center rounded-xl border border-[#EBEBEB] px-4 py-1.5 text-xs font-semibold text-[#383838] hover:border-[#055A46]/40 hover:text-[#055A46] hover:bg-[#ECF9F3] transition-colors cursor-pointer"
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