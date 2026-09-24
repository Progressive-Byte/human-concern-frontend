"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  generatePaymentIdempotencyKey,
  loadIdempotencyKey,
  storeIdempotencyKey,
  clearIdempotencyKey,
} from "@/utils/idempotency";
import { readUtmFromSearch, saveFirstTouch, storeLastTouch, readStoredLastTouch } from "@/utils/utm";

const DonationContext = createContext(null);

const STORAGE_KEY = "hc_donation";
const IDEM_SESSION_KEY = "hc_payment_idem";

const initialState = {
  campaignId: null,
  campaignTitle: "",
  isRamadan: false,
  zakatEligible: false,
  submitted: false,
  pendingSessionId: null,
  setupIntentId: null,
  finalizedDonationId: null,
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
  donorCountryCode: "",
  idempotencyKey: "",
  paymentMethod: null,
  cardName: "",
  cardNumber: "",
  cardExpiry: "",
  cardCvv: "",
  stripeClientSecret: null,
  stripePublishableKey: null,
  paypalClientId: null,
  paypalOrderId: null,
  gatewayConfigurationId: null,
  paymentType: "one-time",
  grandTotal: 0,
  unifiedChallenge: null,
  manualCauseIds: [],
  customNoteValues: {},
  // Attribution captured from the donation form URL (utm_* query params on entry).
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  utm_term: "",
  utm_content: "",
};

function hashIntentFields(state) {
  const parts = [
    String(state.amount ?? ""),
    String(state.paymentMethod ?? ""),
    String(state.email ?? ""),
    String((state.causeIds ?? []).join(",")),
  ];
  return parts.join("|");
}

export function DonationProvider({ children }) {
  const [data, setData] = useState(() => {
    if (typeof window === "undefined") return initialState;
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      const parsed = saved ? { ...initialState, ...JSON.parse(saved) } : initialState;
      const existingKey = loadIdempotencyKey(IDEM_SESSION_KEY);
      if (existingKey && !parsed.idempotencyKey) parsed.idempotencyKey = existingKey;
      if (!parsed.idempotencyKey) {
        parsed.idempotencyKey = generatePaymentIdempotencyKey("pay");
        storeIdempotencyKey(IDEM_SESSION_KEY, parsed.idempotencyKey);
      }
      return parsed;
    } catch {
      const fallback = { ...initialState };
      fallback.idempotencyKey = generatePaymentIdempotencyKey("pay");
      return fallback;
    }
  });

  const prevHashRef = useRef(hashIntentFields(initialState));

  useEffect(() => {
    const currentHash = hashIntentFields(data);
    if (prevHashRef.current && currentHash !== prevHashRef.current) {
      const newKey = generatePaymentIdempotencyKey("pay");
      clearIdempotencyKey(IDEM_SESSION_KEY);
      storeIdempotencyKey(IDEM_SESSION_KEY, newKey);
      setData((prev) => ({ ...prev, idempotencyKey: newKey }));
    }
    prevHashRef.current = currentHash;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.amount, data.paymentMethod, data.email, data.causeIds]);

  // Capture UTM attribution once on entry so it survives every later step. The provider is
  // mounted by both layouts (/donate/[step] and /[campaignSlug]/[step]), so this covers both
  // entry points. First touch wins: a later URL never overwrites an already-captured value.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const fromUrl = readUtmFromSearch(window.location.search);
    const hasUrl = Object.keys(fromUrl).length > 0;
    if (hasUrl) {
      // First touch wins; the URL's values are also this session's last touch.
      saveFirstTouch(fromUrl);
      storeLastTouch(fromUrl);
    }

    // The form's own URL wins; otherwise reuse the last touch a public page recorded earlier —
    // e.g. the visitor clicked through from a link that dropped the query string.
    const source = hasUrl ? fromUrl : (readStoredLastTouch() || {});
    const keys = Object.keys(source);
    if (!keys.length) return;

    setData((prev) => {
      const patch = {};
      for (const key of keys) {
        // The URL the donor arrived with IS this visit's last touch, so it always wins. The stored
        // fallback only fills keys the session doesn't already have.
        if (hasUrl || !prev[key]) patch[key] = source[key];
      }
      if (!Object.keys(patch).length) return prev;
      const next = { ...prev, ...patch };
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const regenerateIdempotencyKey = () => {
    const newKey = generatePaymentIdempotencyKey("pay");
    clearIdempotencyKey(IDEM_SESSION_KEY);
    storeIdempotencyKey(IDEM_SESSION_KEY, newKey);
    setData((prev) => ({ ...prev, idempotencyKey: newKey }));
    return newKey;
  };

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
      clearIdempotencyKey(IDEM_SESSION_KEY);
    } catch {}
    const fresh = { ...initialState, idempotencyKey: generatePaymentIdempotencyKey("pay") };
    storeIdempotencyKey(IDEM_SESSION_KEY, fresh.idempotencyKey);
    setData(fresh);
  };

  return (
    <DonationContext.Provider value={{ data, update, reset, regenerateIdempotencyKey }}>
      {children}
    </DonationContext.Provider>
  );
}

export const useDonation = () => useContext(DonationContext);
