const RETURN_SESSION_PREFIX = "donation-return-session-";
const SESSION_TTL_MS = 1000 * 60 * 60;

function getStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function saveReturnSession(authChallengeId, contract) {
  const storage = getStorage();
  if (!storage || !authChallengeId) return null;
  const key = `${RETURN_SESSION_PREFIX}${authChallengeId}`;
  const payload = {
    ...(contract || {}),
    authChallengeId,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
  try {
    storage.setItem(key, JSON.stringify(payload));
    return key;
  } catch {
    return null;
  }
}

export function loadReturnSession(authChallengeId) {
  const storage = getStorage();
  if (!storage || !authChallengeId) return null;
  const key = `${RETURN_SESSION_PREFIX}${authChallengeId}`;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
      storage.removeItem(key);
      return null;
    }
    return parsed || null;
  } catch {
    return null;
  }
}

export function clearReturnSession(authChallengeId) {
  const storage = getStorage();
  if (!storage || !authChallengeId) return;
  const key = `${RETURN_SESSION_PREFIX}${authChallengeId}`;
  try {
    storage.removeItem(key);
  } catch {}
}

export function cleanupExpiredReturnSessions() {
  const storage = getStorage();
  if (!storage) return 0;
  let removed = 0;
  try {
    const keys = [];
    for (let i = 0; i < storage.length; i += 1) {
      const k = storage.key(i);
      if (k && k.startsWith(RETURN_SESSION_PREFIX)) keys.push(k);
    }
    keys.forEach((k) => {
      try {
        const raw = storage.getItem(k);
        const parsed = raw ? JSON.parse(raw) : null;
        if (parsed?.expiresAt && parsed.expiresAt < Date.now()) {
          storage.removeItem(k);
          removed += 1;
        }
      } catch {}
    });
  } catch {}
  return removed;
}

export function saveFormDraft(formId, data, ttlMs = SESSION_TTL_MS) {
  const storage = getStorage();
  if (!storage || !formId) return null;
  const key = `form-draft_${formId}`;
  try {
    storage.setItem(
      key,
      JSON.stringify({ ...(data || {}), expiresAt: Date.now() + ttlMs })
    );
    return key;
  } catch {
    return null;
  }
}

export function loadFormDraft(formId) {
  const storage = getStorage();
  if (!storage || !formId) return null;
  const key = `form-draft_${formId}`;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
      storage.removeItem(key);
      return null;
    }
    return parsed || null;
  } catch {
    return null;
  }
}

export function clearFormDraft(formId) {
  const storage = getStorage();
  if (!storage || !formId) return;
  const key = `form-draft_${formId}`;
  try {
    storage.removeItem(key);
  } catch {}
}

export function getQueryParams() {
  if (typeof window === "undefined" || !window.URLSearchParams) return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const out = {};
    params.forEach((v, k) => {
      out[k] = v;
    });
    return out;
  } catch {
    return {};
  }
}

export function buildQueryString(params) {
  if (!params) return "";
  const entries = Object.entries(params).filter(
    ([k, v]) => k && v !== undefined && v !== null && String(v).trim() !== ""
  );
  if (!entries.length) return "";
  const usp = new URLSearchParams();
  entries.forEach(([k, v]) => usp.set(k, String(v)));
  return usp.toString();
}
