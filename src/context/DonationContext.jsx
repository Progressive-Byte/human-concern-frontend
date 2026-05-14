"use client";

import { createContext, useContext, useState } from "react";

const DonationContext = createContext(null);

const STORAGE_KEY = "hc_donation";

const initialState = {
  campaignId: null,
  campaignTitle: "",
  isRamadan: false,
  zakatEligible: false,
  submitted: false,
  donorMessage: "",
  customTipAmount: "",
  maxStep: 1,
  amount: "",
  currency: "USD",
  frequency: "one-time",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "",
  paymentMethod: "card",
  cardName: "",
  cardNumber: "",
  cardExpiry: "",
  cardCvv: "",
};

export function DonationProvider({ children }) {
  const [data, setData] = useState(() => {
    if (typeof window === "undefined") return initialState;
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? { ...initialState, ...JSON.parse(saved) } : initialState;
    } catch {
      return initialState;
    }
  });

  const update = (fields) =>
    setData((prev) => {
      const next = { ...prev, ...fields };
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });

  const reset = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem("hc_donation_done");
    } catch {}
    setData(initialState);
  };

  return (
    <DonationContext.Provider value={{ data, update, reset }}>
      {children}
    </DonationContext.Provider>
  );
}

export const useDonation = () => useContext(DonationContext);
