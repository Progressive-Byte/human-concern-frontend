import { PlusIcon } from "@/components/common/SvgIcon";
import DashboardHeader from "../components/DashboardHeader";
import { SavedCardsList } from "./components/SavedCardsList";
import { OtherMethodsList } from "./components/OtherMethodsList";

const savedCards = [
  { id: 1, brand: "Visa",       last4: "4242", exp: "12/25", isDefault: true  },
  { id: 2, brand: "Mastercard", last4: "5555", exp: "08/26", isDefault: false },
];

const otherMethods = [
  { id: "apple-pay", name: "Apple Pay", desc: "Pay with Face ID or Touch ID",    status: "available", icon: "apple"  },
  { id: "paypal",    name: "PayPal",    desc: "Connect your PayPal account",      status: "connect",   icon: "paypal" },
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
        <SavedCardsList cards={savedCards} />
        <OtherMethodsList methods={otherMethods} />
      </div>
    </>
  );
};

export default PaymentMethodsPage;
