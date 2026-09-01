import { adminApiRequest } from "./api";

export function listGatewayHealthOverview({ provider, sinceMinutes } = {}) {
  const params = new URLSearchParams();

  if (sinceMinutes !== undefined && sinceMinutes !== null && String(sinceMinutes).trim()) {
    params.set("sinceMinutes", String(sinceMinutes).trim());
  }

  const query = params.toString();
  const base = typeof provider === "string" && provider.trim()
    ? `/admin/gateway-health/${encodeURIComponent(provider.trim())}`
    : "/admin/gateway-health";
  const endpoint = query ? `${base}?${query}` : base;

  return adminApiRequest(endpoint, { method: "GET" });
}

export function getGatewayHealthDetail(provider, confId) {
  const endpoint = `/admin/gateway-health/${encodeURIComponent(provider)}/${encodeURIComponent(confId)}`;
  return adminApiRequest(endpoint, { method: "GET" });
}

export function forceCloseCircuit(payload = {}) {
  const body = {
    adminNotes: payload?.adminNotes || "",
  };
  const endpoint = `/admin/gateway-health/${encodeURIComponent(payload.provider)}/${encodeURIComponent(payload.confId)}/force-close`;
  return adminApiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function forceOpenCircuit(payload = {}) {
  const body = {
    openDurationMs: payload?.openDurationMs,
    adminNotes: payload?.adminNotes || "",
  };
  const endpoint = `/admin/gateway-health/${encodeURIComponent(payload.provider)}/${encodeURIComponent(payload.confId)}/force-open`;
  return adminApiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function runCanaryProbe(payload = {}) {
  const body = {
    amountMinor: payload?.amountMinor ?? 100,
    currency: payload?.currency || "USD",
    testMode: payload?.testMode ?? true,
    adminNotes: payload?.adminNotes || "",
  };
  const endpoint = `/admin/gateway-health/${encodeURIComponent(payload.provider)}/${encodeURIComponent(payload.confId)}/canary`;
  return adminApiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getCanaryProbeResult(probeId) {
  return adminApiRequest(`/admin/gateway-health/canary/${encodeURIComponent(probeId)}`, {
    method: "GET",
  });
}

export function resetGatewayCounters(payload = {}) {
  const body = {
    adminNotes: payload?.adminNotes || "",
  };
  const endpoint = `/admin/gateway-health/${encodeURIComponent(payload.provider)}/${encodeURIComponent(payload.confId)}/reset`;
  return adminApiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function sweepOpenExpiredCircuits(payload = {}) {
  const body = {
    adminNotes: payload?.adminNotes || "",
    upToLimit: payload?.upToLimit,
  };
  return adminApiRequest("/admin/gateway-health/sweep-open-expired", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function bulkPauseProvider(provider, payload = {}) {
  const body = {
    adminNotes: payload?.adminNotes || "",
  };
  return adminApiRequest(`/admin/gateway-health/${encodeURIComponent(provider)}/bulk-pause`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function bulkResumeProvider(provider, payload = {}) {
  const body = {
    adminNotes: payload?.adminNotes || "",
  };
  return adminApiRequest(`/admin/gateway-health/${encodeURIComponent(provider)}/bulk-resume`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
