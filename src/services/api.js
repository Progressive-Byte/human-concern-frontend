import { apiBase } from "@/utils/constants";
import { generateRequestId, isPaymentMutatingMethod } from "@/utils/idempotency";
import { getUserFacingErrorMessage } from "@/utils/errorMaps";

function getCookieValue(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function extractErrorCode(body, status) {
  if (body && typeof body === "object") {
    if (body.code) return String(body.code);
    if (body.error && typeof body.error === "object" && body.error.code) return String(body.error.code);
    if (body.error && typeof body.error === "string") return body.error;
  }
  if (status === 409) return "REQUEST_IN_PROGRESS";
  if (status === 503) return "gateway_fully_down_all_circuits_open";
  return "";
}

function extractRetryAfterMs(body) {
  if (!body || typeof body !== "object") return 0;
  const retryAfter = body.retryAfterMs || body.retry_after_ms || body.retryAfter || body.meta?.retryAfterMs;
  return Number(retryAfter) || 0;
}

function extractMessage(body, status, fallback) {
  if (!body) return fallback;
  if (typeof body === "string") return body || fallback;
  const raw = body.message || body.error;
  if (typeof raw === "string" && raw.trim()) return raw;
  if (raw && typeof raw === "object") {
    const nested = raw.message || raw.msg || Object.values(raw).find((v) => typeof v === "string");
    if (nested) return nested;
  }
  return fallback || `Request failed with status ${status}`;
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, Math.max(0, ms));
  });
}

async function makeRequest(endpoint, options = {}, cookieName = "token", attempt = 1) {
  const token = getCookieValue(cookieName);
  const isFormDataBody = typeof FormData !== "undefined" && options?.body instanceof FormData;
  const method = String(options.method || "GET").toUpperCase();
  const mutating = isPaymentMutatingMethod(method);

  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {}),
  };

  if (!("X-Request-Id" in headers)) {
    headers["X-Request-Id"] = generateRequestId();
  }

  if (mutating && options?.idempotencyKey && !("X-Idempotency-Key" in headers)) {
    headers["X-Idempotency-Key"] = String(options.idempotencyKey);
  }

  if (!isFormDataBody && !("Content-Type" in headers)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${apiBase}${endpoint}`, {
    method,
    credentials: "include",
    headers,
    body: options.body,
    ...(options.cache ? { cache: options.cache } : {}),
  });

  if (response.status === 409 && mutating && attempt <= (options?.maxIdempotencyRetries || 5)) {
    let body = null;
    try {
      const ct = response.headers.get("content-type") || "";
      if (ct.includes("application/json")) body = await response.json();
    } catch {}
    const retryAfterMs = extractRetryAfterMs(body) || [500, 1000, 2000, 4000, 8000][attempt - 1] || 2000;
    const code = extractErrorCode(body, 409);
    const userMsg = getUserFacingErrorMessage(code, "Your payment is still being processed…");
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("orchestration:request-in-progress", {
          detail: { endpoint, attempt, retryAfterMs, message: userMsg, code },
        })
      );
    }
    await delay(retryAfterMs);
    return makeRequest(endpoint, options, cookieName, attempt + 1);
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      const eventName = cookieName === "adminToken" ? "admin:unauthorized" : "auth:unauthorized";
      window.dispatchEvent(new CustomEvent(eventName));
    }

    const ct = response.headers.get("content-type") || "";
    let body = null;
    try {
      if (ct.includes("application/json")) body = await response.json();
      else body = await response.text();
    } catch {
      body = null;
    }

    const code = extractErrorCode(body, response.status);
    const technicalMsg = extractMessage(body, response.status);
    const userFacing = getUserFacingErrorMessage(code, technicalMsg);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("orchestration:api-error", {
          detail: { endpoint, status: response.status, code, technical: technicalMsg, userFacing, attempt },
        })
      );
    }

    const err = new Error(userFacing || technicalMsg || `Request failed with status ${response.status}`);
    err.statusCode = response.status;
    err.code = code;
    err.technical = technicalMsg;
    err.attempt = attempt;
    if (body && typeof body === "object") err.body = body;
    throw err;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const parsed = await response.json();
    if (parsed && typeof parsed === "object" && parsed.meta && typeof window !== "undefined") {
      if (parsed.meta.isIdempotencyHit) {
        window.dispatchEvent(new CustomEvent("orchestration:idempotency-dedup", { detail: { endpoint } }));
      }
      if (parsed.meta.failoverOccurred) {
        window.dispatchEvent(
          new CustomEvent("orchestration:failover-occurred", {
            detail: { endpoint, path: parsed.meta.providerFallbackPath },
          })
        );
      }
    }
    return parsed;
  }
  return response.text();
}

export function apiRequest(endpoint, options = {}) {
  return makeRequest(endpoint, options, "token");
}

export function adminApiRequest(endpoint, options = {}) {
  return makeRequest(endpoint, options, "adminToken");
}
