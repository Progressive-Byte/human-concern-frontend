"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { apiRequest } from "@/services/api";

const PaymentGatewaySelector = ({ isRecurring, initialGateway, onChange }) => {
  const [gateways,        setGateways]        = useState([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(true);
  const [selectedGateway, setSelectedGateway] = useState(initialGateway ?? null);

  useEffect(() => {
    apiRequest("payment/settings")
      .then((res) => {
        const raw       = res?.data?.gateways ?? {};
        const available = Object.values(raw).filter((g) => g.enabled && g.configured);
        setGateways(available);

        const stripe = available.find((g) => g.provider === "stripe");
        const initial = initialGateway ?? (available.length > 0 ? available[0].provider : null);
        setSelectedGateway(initial);
        onChange({ gateway: initial, publishableKey: stripe?.publishableKey ?? null });
      })
      .catch(() => {})
      .finally(() => setGatewaysLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (provider) => {
    setSelectedGateway(provider);
    const stripe = gateways.find((g) => g.provider === "stripe");
    onChange({ gateway: provider, publishableKey: stripe?.publishableKey ?? null });
  };

  if (gatewaysLoading) return null;

  return (
    <div className="pt-1">
      <p className="text-[14px] font-semibold text-[#383838] mb-3">Payment Method</p>
      <div className="grid grid-cols-3 gap-3">
        {gateways
          .filter((g) => g.provider === "stripe" || g.provider === "paypal")
          .map((gateway) => {
            const isSelected = selectedGateway === gateway.provider;
            return (
              <button
                key={gateway.provider}
                type="button"
                onClick={() => handleSelect(gateway.provider)}
                className={`flex items-center justify-between px-5 py-5 rounded-2xl border transition-all duration-200 text-left cursor-pointer ${
                  isSelected
                    ? "border-[#383838] bg-white shadow-sm"
                    : "border-[#E5E5E5] bg-white hover:border-[#AEAEAE]"
                }`}
              >
                <span className="text-[14px] font-medium text-[#383838]">
                  {gateway.provider === "stripe" ? "Stripe" : "PayPal"}
                </span>
                <div className="relative w-[60px] h-[24px] shrink-0">
                  <Image
                    src={gateway.provider === "stripe" ? "/images/stripe.jpg" : "/images/paypal.png"}
                    alt={gateway.provider}
                    fill
                    className="object-contain"
                  />
                </div>
              </button>
            );
          })}
      </div>

      {isRecurring && (
        <div className="flex items-start gap-2.5 px-1 mt-4">
          <span className="text-[15px] shrink-0 mt-px">🚨</span>
          <p className="text-[13px] text-[#383838] leading-relaxed">
            For subscriptions or recurring donations, a temporary{" "}
            <span className="font-semibold">$1 authorization charge</span> will be placed on your
            card to verify it. This charge will be reversed within{" "}
            <span className="font-semibold">3-5 business days</span>.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentGatewaySelector;
