import { postcodeValidator, postcodeValidatorExistsForCountry } from "postcode-validator";

function normalizeCountryCode(value) {
  const code = String(value ?? "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : "";
}

export function countryUsesPostalCode(value) {
  const code = normalizeCountryCode(value);
  if (!code) return false;
  try {
    return postcodeValidatorExistsForCountry(code);
  } catch {
    return false;
  }
}

/*
  Format check only. It cannot tell whether the address is real.
  A country with no postal code, or an unknown code, is left alone so we do not block donors.
*/
export function isValidPostalCode(value, countryCode) {
  const code = normalizeCountryCode(countryCode);
  if (!code || !countryUsesPostalCode(code)) return true;

  const postalCode = String(value ?? "").trim().toUpperCase();
  if (!postalCode) return false;

  try {
    return postcodeValidator(postalCode, code);
  } catch {
    return false;
  }
}
