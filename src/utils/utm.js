/**
 * Marketing attribution helpers for the donation flow.
 *
 * Admins share donation form URLs with UTM parameters (e.g.
 * `/my-campaign/1?utm_source=facebook&utm_medium=social`). These helpers read those
 * params off the URL and convert the donation-context keys into the API payload shape.
 *
 * Attribution has two halves:
 * - **last touch** = the UTM on the URL of the donation itself (stored in the donation context).
 * - **first touch** = the first UTM this browser ever saw, kept in a long-lived cookie so a
 *   donor who arrives from Facebook and later donates via Google still credits Facebook.
 */

import { getCookie, setCookie } from "@/utils/cookies";

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
];

const FIRST_TOUCH_COOKIE = "hc_first_touch";
const FIRST_TOUCH_DAYS = 365;

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

/** Reads the stored first-touch attribution (null when this browser has none yet). */
export function readFirstTouch() {
  const raw = getCookie(FIRST_TOUCH_COOKIE);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const out = {};
    for (const field of Object.values(UTM_TO_FIELD)) {
      const value = String(parsed[field] ?? "").trim();
      if (value) out[field] = value;
    }
    return Object.keys(out).length ? out : null;
  } catch {
    return null;
  }
}

const LAST_TOUCH_KEY = "hc_utm_last";

/**
 * Remembers this session's last touch. Kept in its own sessionStorage key (NOT inside
 * `hc_donation`) so resetting the donation session does not erase the attribution.
 */
export function storeLastTouch(utmFromUrl) {
  const payload = buildUtmPayload(utmFromUrl);
  if (!payload) return null;
  try {
    sessionStorage.setItem(LAST_TOUCH_KEY, JSON.stringify(payload));
  } catch {
    // private mode / storage full — attribution is best-effort
  }
  return payload;
}

/**
 * The last touch recorded earlier in this session, in the donation-context shape
 * (`{ utm_source: "facebook", ... }`), ready to patch straight into the context.
 * Null when nothing was recorded.
 */
export function readStoredLastTouch() {
  try {
    const raw = sessionStorage.getItem(LAST_TOUCH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const out = {};
    for (const [utmKey, field] of Object.entries(UTM_TO_FIELD)) {
      const value = String(parsed[field] ?? "").trim();
      if (value) out[utmKey] = value;
    }
    return Object.keys(out).length ? out : null;
  } catch {
    return null;
  }
}

/**
 * One call for every public page: when the URL carries UTM params, record the first touch and the
 * last touch straight away — so attribution is kept even if the visitor never reaches the form, or
 * arrives at the form through a link that dropped the query.
 */
export function captureAttribution(search) {
  const utm = readUtmFromSearch(search);
  if (!Object.keys(utm).length) return null;
  saveFirstTouch(utm);
  storeLastTouch(utm);
  return utm;
}

/**
 * Saves the first UTM this browser has seen. First touch wins — an existing cookie is
 * never overwritten, so the original source keeps the credit.
 * Returns the stored first-touch payload (or null when there is nothing to store).
 */
export function saveFirstTouch(utmFromUrl) {
  const existing = readFirstTouch();
  if (existing) return existing;

  const payload = buildUtmPayload(utmFromUrl);
  if (!payload) return null;

  setCookie(FIRST_TOUCH_COOKIE, JSON.stringify(payload), FIRST_TOUCH_DAYS);
  return payload;
}
