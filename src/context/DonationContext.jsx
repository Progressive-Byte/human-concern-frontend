"use client";

import { createContext, useContext, useState } from "react";

const DonationContext = createContext(null);

export function DonationProvider({ children }) {
  const [data, setData] = useState({
    campaignId: null,
    campaignTitle: "",
    isRamadan: false,
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
  });

  const update = (fields) => setData((prev) => ({ ...prev, ...fields }));

  return (
    <DonationContext.Provider value={{ data, update }}>
      {children}
    </DonationContext.Provider>
  );
}

export const useDonation = () => useContext(DonationContext);
