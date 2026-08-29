import { adminApiRequest } from "./api";

export function listGatewayHealthOverview({ provider, sinceMinutes } = {}) {
  const params = new URLSearchParams();

  if (typeof provider === "string" && provider.trim()) {
    params.set("provider", provider.trim());
  }

  if (sinceMinutes !== undefined && sinceMinutes !== null && String(sinceMinutes).trim()) {
    params.set("sinceMinutes", String(sinceMinutes).trim());
  }

  const query = params.toString();
  const endpoint = query ? `/admin/gateway-health/overview?${query}` : "/admin/gateway-health/overview";

  return adminApiRequest(endpoint, { method: "GET" });
}

export function getGatewayHealthDetail(provider, confId) {
  const params = new URLSearchParams();
  if (typeof confId === "string" && confId.trim()) {
    params.set("confId", confId.trim());
  }
  const query = params.toString();
  const endpoint = query
    ? `/admin/gateway-health/${encodeURIComponent(provider)}?${query}`
    : `/admin/gateway-health/${encodeURIComponent(provider)}`;

  return adminApiRequest(endpoint, { method: "GET" });
}

export function forceCloseCircuit(payload = {}) {
  const body = {
    provider: payload?.provider,
    confId: payload?.confId,
    adminNotes: payload?.adminNotes || "",
  };
  return adminApiRequest("/admin/gateway-health/force-close", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function forceOpenCircuit(payload = {}) {
  const body = {
    provider: payload?.provider,
    confId: payload?.confId,
    openDurationMs: payload?.openDurationMs,
    adminNotes: payload?.adminNotes || "",
  };
  return adminApiRequest("/admin/gateway-health/force-open", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function runCanaryProbe(payload = {}) {
  const body = {
    provider: payload?.provider,
    confId: payload?.confId,
    amountMinor: payload?.amountMinor ?? 100,
    currency: payload?.currency || "USD",
    testMode: payload?.testMode ?? true,
    adminNotes: payload?.adminNotes || "",
  };
  return adminApiRequest("/admin/gateway-health/canary", {
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
    provider: payload?.provider,
    confId: payload?.confId,
    adminNotes: payload?.adminNotes || "",
  };
  return adminApiRequest("/admin/gateway-health/reset", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function sweepOpenExpiredCircuits(payload = {}) {
  const body = {
    adminNotes: payload?.adminNotes || "",
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
