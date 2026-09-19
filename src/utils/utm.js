/**
 * Marketing attribution helpers for the donation flow.
 *
 * Admins share donation form URLs with UTM parameters (e.g.
 * `/my-campaign/1?utm_source=facebook&utm_medium=social`). These helpers read those
 * params off the URL and convert the donation-context keys into the API payload shape.
 */

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
];

const UTM_TO_FIELD = {
  utm_source: "source",
  utm_medium: "medium",
  utm_campaign: "campaign",
  utm_term: "term",
  utm_content: "content",
};

/** Reads the UTM params present on a query string. Returns only the ones that are set. */
export function readUtmFromSearch(search) {
  const out = {};
  if (typeof search !== "string" || !search) return out;
  let params;
  try {
    params = new URLSearchParams(search);
  } catch {
    return out;
  }
  for (const key of UTM_KEYS) {
    const value = String(params.get(key) ?? "").trim();
    if (value) out[key] = value;
  }
  return out;
}

/**
 * Builds the `utm` object the API expects from donation-context data
 * (`data.utm_source` -> `{ source }`). Returns null when nothing was captured.
 */
export function buildUtmPayload(data) {
  if (!data || typeof data !== "object") return null;
  const out = {};
  for (const [key, field] of Object.entries(UTM_TO_FIELD)) {
    const value = String(data[key] ?? "").trim();
    if (value) out[field] = value;
  }
  return Object.keys(out).length ? out : null;
}
