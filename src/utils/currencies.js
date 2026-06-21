export const SUPPORTED_FORM_CURRENCY_OPTIONS = [
  { code: "USD", label: "USD ($)" },
  { code: "GBP", label: "GBP (£)" },
  { code: "EUR", label: "EUR (€)" },
  { code: "CAD", label: "CAD (CA$)" },
  { code: "AED", label: "AED" },
];

export const SUPPORTED_FORM_CURRENCY_CODES = SUPPORTED_FORM_CURRENCY_OPTIONS.map((item) => item.code);

export function getSupportedCurrencyOptionsForCodes(codes = []) {
  const wanted = new Set((Array.isArray(codes) ? codes : []).map((item) => String(item || "").trim()).filter(Boolean));
  return SUPPORTED_FORM_CURRENCY_OPTIONS.filter((item) => wanted.has(item.code));
}

export function normalizeSupportedCurrencyCodes(codes = []) {
  const seen = new Set();
  return (Array.isArray(codes) ? codes : [])
    .map((item) => String(item || "").trim())
    .filter((code) => code && SUPPORTED_FORM_CURRENCY_CODES.includes(code) && !seen.has(code) && seen.add(code));
}

export function getCurrencyLabel(code) {
  return SUPPORTED_FORM_CURRENCY_OPTIONS.find((item) => item.code === String(code || "").trim())?.label || String(code || "").trim();
}
