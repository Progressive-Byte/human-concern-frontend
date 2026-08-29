let keyCounter = 0;

export function generateUUID() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateRequestId() {
  keyCounter += 1;
  return `req_${Date.now().toString(36)}_${keyCounter.toString(36)}_${generateUUID().slice(0, 8)}`;
}

export function generatePaymentIdempotencyKey(prefix = "pay") {
  const ts = Date.now();
  const rand = generateUUID().replace(/-/g, "").slice(0, 16);
  return `${prefix}_${ts.toString(36)}_${rand}`;
}

export function generateFormSessionId(formScope = "donation") {
  return `form_${formScope}_${generateUUID()}`;
}

const STORAGE_KEY_PREFIX = "idemkey_";

export function storeIdempotencyKey(sessionKey, idemKey, ttlMs = 1000 * 60 * 60) {
  if (typeof window === "undefined" || typeof sessionStorage === "undefined") return;
  try {
    const payload = { idemKey, expiresAt: Date.now() + ttlMs };
    sessionStorage.setItem(`${STORAGE_KEY_PREFIX}${sessionKey}`, JSON.stringify(payload));
  } catch {}
}

export function loadIdempotencyKey(sessionKey) {
  if (typeof window === "undefined" || typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${sessionKey}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
      sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}${sessionKey}`);
      return null;
    }
    return parsed.idemKey || null;
  } catch {
    return null;
  }
}

export function clearIdempotencyKey(sessionKey) {
  if (typeof window === "undefined" || typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}${sessionKey}`);
  } catch {}
}

export function isPaymentMutatingMethod(method) {
  const m = String(method || "GET").toUpperCase();
  return m === "POST" || m === "PUT" || m === "PATCH" || m === "DELETE";
}

export function resetIdempotencyKeyForChangedIntent(sessionKey, prefix) {
  clearIdempotencyKey(sessionKey);
  const newKey = generatePaymentIdempotencyKey(prefix);
  storeIdempotencyKey(sessionKey, newKey);
  return newKey;
}
