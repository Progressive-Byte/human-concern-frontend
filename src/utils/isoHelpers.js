import { Country, State } from "country-state-city";

const ISO3_TO_ISO2 = {
  USA: "US", GBR: "GB", CAN: "CA", AUS: "AU", ARE: "AE",
  IND: "IN", PAK: "PK", BGD: "BD", NZL: "NZ", DEU: "DE",
  FRA: "FR", SAU: "SA", QAT: "QA", KWT: "KW", TUR: "TR",
};

export function resolveCountryIso(value) {
  if (!value) return null;
  const all = Country.getAllCountries();
  const upper = value.toUpperCase();
  return (
    all.find((c) => c.name === value)?.isoCode ||
    all.find((c) => c.isoCode === upper)?.isoCode ||
    all.find((c) => c.isoCode === ISO3_TO_ISO2[upper])?.isoCode ||
    all.find((c) => c.name.toLowerCase() === value.toLowerCase())?.isoCode ||
    null
  );
}

export function resolveStateIso(stateName, countryIso) {
  if (!stateName || !countryIso) return null;
  const states = State.getStatesOfCountry(countryIso);
  return (
    states.find((s) => s.name === stateName)?.isoCode ||
    states.find((s) => s.isoCode === stateName.toUpperCase())?.isoCode ||
    states.find((s) => s.name.toLowerCase() === stateName.toLowerCase())?.isoCode ||
    null
  );
}
