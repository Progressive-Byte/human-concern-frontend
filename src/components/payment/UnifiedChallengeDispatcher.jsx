"use client";

import { useEffect, useMemo } from "react";
import CountdownTimer from "@/components/common/CountdownTimer";
import { CHALLENGE_STATUS } from "@/utils/errorMaps";

const CHALLENGE_SESSION_KEYS = {
  challenge: "hc_unified_challenge",
  authId: "hc_auth_challenge_id",
  returnPayloadId: "hc_frontend_return_payload_id",
  returnSession: "hc_return_session",
  donorReturnParams: "hc_donor_return_params",
};

export const DONOR_RETURN_PARAM_KEYS = [
  "email",
  "firstName",
  "lastName",
  "name",
  "donorCountryCode",
  "locale",
  "utm_source",
  "utm_campaign",
  "utm_medium",
  "utm_term",
  "utm_content",
];

export function loadUnifiedChallengeFromSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CHALLENGE_SESSION_KEYS.challenge);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch {}
  const authId = sessionStorage.getItem(CHALLENGE_SESSION_KEYS.authId);
  const returnPayloadId = sessionStorage.getItem(CHALLENGE_SESSION_KEYS.returnPayloadId);
  if (authId || returnPayloadId) {
    return {
      ...(authId && { authChallengeId: authId }),
      ...(returnPayloadId && { frontendReturnPayloadId: returnPayloadId }),
    };
  }
  return null;
}

export function saveUnifiedChallengeToSession(challenge) {
  if (typeof window === "undefined" || !challenge) return;
  try {
    sessionStorage.setItem(CHALLENGE_SESSION_KEYS.challenge, JSON.stringify(challenge));
    if (challenge.authChallengeId) {
      sessionStorage.setItem(CHALLENGE_SESSION_KEYS.authId, String(challenge.authChallengeId));
    }
    if (challenge.frontendReturnPayloadId) {
      sessionStorage.setItem(
        CHALLENGE_SESSION_KEYS.returnPayloadId,
        String(challenge.frontendReturnPayloadId)
      );
    }
  } catch {}
}

export function clearUnifiedChallengeSession() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(CHALLENGE_SESSION_KEYS.challenge);
    sessionStorage.removeItem(CHALLENGE_SESSION_KEYS.authId);
    sessionStorage.removeItem(CHALLENGE_SESSION_KEYS.returnPayloadId);
    sessionStorage.removeItem(CHALLENGE_SESSION_KEYS.returnSession);
    sessionStorage.removeItem(CHALLENGE_SESSION_KEYS.donorReturnParams);
  } catch {}
}

export function saveReturnSession(returnSession) {
  if (typeof window === "undefined" || !returnSession) return;
  try {
    sessionStorage.setItem(CHALLENGE_SESSION_KEYS.returnSession, JSON.stringify(returnSession));
  } catch {}
}

export function loadReturnSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CHALLENGE_SESSION_KEYS.returnSession);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveDonorReturnParams(params) {
  if (typeof window === "undefined" || !params) return;
  try {
    sessionStorage.setItem(CHALLENGE_SESSION_KEYS.donorReturnParams, JSON.stringify(params));
  } catch {}
}

export function loadDonorReturnParams() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CHALLENGE_SESSION_KEYS.donorReturnParams);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function buildDonorReturnParams(formData = {}, context = {}) {
  const firstName =
    formData.firstName ?? context.firstName ?? context.info?.firstName ?? "";
  const lastName =
    formData.lastName ?? context.lastName ?? context.info?.lastName ?? "";
  const fullName =
    formData.name ??
    context.name ??
    (firstName || lastName ? `${firstName} ${lastName}`.trim() : "");

  const getUtm = (key) => {
    const direct = formData[key] ?? context[key];
    if (direct) return direct;
    if (typeof window !== "undefined") {
      try {
        const sp = new URLSearchParams(window.location.search);
        return sp.get(key) ?? "";
      } catch {}
    }
    return "";
  };

  let baseOrigin = "";
  try {
    if (typeof window !== "undefined" && window.location && window.location.origin) {
      baseOrigin = window.location.origin.replace(/\/$/, "");
    }
  } catch {}
  const contextBase = String(context.baseUrl ?? context.origin ?? context.siteUrl ?? "").trim().replace(/\/$/, "");
  const formBase = String(formData.baseUrl ?? formData.origin ?? "").trim().replace(/\/$/, "");
  const effectiveBase = formBase || contextBase || baseOrigin || "";
  const constructedReturn = effectiveBase ? `${effectiveBase}/donate/thank-you/return-from-challenge` : "";
  const constructedCancel = effectiveBase ? `${effectiveBase}/donate/thank-you/return-from-challenge?canceled=1` : "";

  const params = {
    email: formData.email ?? context.email ?? context.info?.email ?? "",
    firstName,
    lastName,
    name: fullName,
    donorCountryCode:
      formData.donorCountryCode ??
      context.donorCountryCode ??
      context.info?.donorCountryCode ??
      context.info?.countryCode ??
      "",
    locale: formData.locale ?? context.locale ?? (typeof navigator !== "undefined" ? navigator.language : ""),
    utm_source: getUtm("utm_source"),
    utm_campaign: getUtm("utm_campaign"),
    utm_medium: getUtm("utm_medium"),
    utm_term: getUtm("utm_term"),
    utm_content: getUtm("utm_content"),
    ...(effectiveBase ? { baseUrl: effectiveBase } : {}),
    ...(constructedReturn ? { returnUrl: formData.returnUrl ?? context.returnUrl ?? constructedReturn } : {}),
    ...(constructedCancel ? { cancelUrl: formData.cancelUrl ?? context.cancelUrl ?? constructedCancel } : {}),
  };

  Object.keys(params).forEach((k) => {
    if (params[k] === undefined || params[k] === null) params[k] = "";
  });

  return params;
}

export function buildDonorReturnQueryString(donorReturnParams) {
  if (!donorReturnParams || typeof donorReturnParams !== "object") return "";
  const SANITIZE_PCT = (s) => String(s ?? '').replace(/%(?![0-9A-Fa-f]{2})/g, '%25');
  const parts = [];
  Object.entries(donorReturnParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      parts.push(
        `donorReturnParams.${encodeURIComponent(key)}=${encodeURIComponent(SANITIZE_PCT(String(value)))}`
      );
    }
  });
  return parts.join("&");
}

export function extractDonorReturnParamsFromQuery(searchParams) {
  const params = {};
  if (!searchParams) return params;
  const entries =
    typeof searchParams.entries === "function"
      ? Array.from(searchParams.entries())
      : Object.entries(searchParams);
  entries.forEach(([key, value]) => {
    if (key.startsWith("donorReturnParams.")) {
      const realKey = key.slice("donorReturnParams.".length);
      params[realKey] = value;
    }
  });
  return params;
}

function ChallengeCountdownBanner({ challenge, onExpire }) {
  if (!challenge) return null;
  const expiresAt = challenge.expiresAt ?? challenge.expires_at ?? challenge.ttlExpiresAt ?? null;
  if (!expiresAt) return null;

  const status = challenge.status ?? "issued";
  const statusMeta = CHALLENGE_STATUS[status] ?? CHALLENGE_STATUS.issued;

  return (
    <div className="w-full border border-[#E5E7EB] bg-white rounded-2xl px-4 py-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex shrink-0 h-7 w-7 items-center justify-center rounded-full bg-[#FFF8E1] text-[#B45309]">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path
                d="M12 2L4 6v6c0 5 3.4 9.6 8 11 4.6-1.4 8-6 8-11V6l-8-4z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="flex flex-col min-w-0">
            <p className="text-[13px] font-semibold text-[#111827] truncate">
              Security verification in progress
            </p>
            <p className="text-[11px] text-[#6B7280] truncate">
              Your bank may request additional confirmation to complete this donation.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusMeta.className}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
            {statusMeta.label}
          </span>
          <CountdownTimer
            expiresAt={expiresAt}
            warningThresholdSeconds={600}
            criticalThresholdSeconds={180}
            onExpire={onExpire}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}

const UnifiedChallengeDispatcher = ({
  challenge,
  provider = "stripe",
  onExpire,
  onDispatch,
  className = "",
  children,
}) => {
  const activeChallenge = useMemo(() => {
    if (challenge && typeof challenge === "object") return challenge;
    return loadUnifiedChallengeFromSession();
  }, [challenge]);

  const interactionType = useMemo(() => {
    if (!activeChallenge) return "none";
    const it = String(activeChallenge.interactionType ?? activeChallenge.interaction_type ?? "").toLowerCase();
    if (it === "modal_client_secret" || it === "modal" || it === "3ds" || it === "3d_secure") {
      return "modal_client_secret";
    }
    if (it === "redirect" || it === "3ds_redirect" || it === "sca_redirect" || it === "contingency_redirect") {
      return "redirect";
    }
    if (it === "frictionless" || it === "auto") return "frictionless";
    if (it === "vault_setup" || it === "vault") return "vault_setup";
    if (it === "capture" || it === "capture_now") return "capture";
    if (it === "none" || it === "no_interaction") return "none";
    return "none";
  }, [activeChallenge]);

  useEffect(() => {
    if (!activeChallenge) return;
    if (interactionType === "none") return;

    if (provider === "paypal" && interactionType === "redirect") {
      const redirectUrl = activeChallenge.redirectUrl ?? activeChallenge.redirect_url ?? "";
      if (!redirectUrl) return;

      const donorReturnParams =
        activeChallenge.donorReturnParams ??
        activeChallenge.donor_return_params ??
        loadDonorReturnParams() ??
        {};

      const returnSession = {
        authChallengeId: activeChallenge.authChallengeId ?? null,
        frontendReturnPayloadId: activeChallenge.frontendReturnPayloadId ?? null,
        provider: "paypal",
        interactionType: "redirect",
        donorReturnParams,
        createdAt: new Date().toISOString(),
      };

      saveReturnSession(returnSession);
      saveDonorReturnParams(donorReturnParams);
      saveUnifiedChallengeToSession(activeChallenge);

      if (typeof window !== "undefined") {
        const SANITIZE_PCT = (s) => String(s ?? '').replace(/%(?![0-9A-Fa-f]{2})/g, '%25');
        let safeRedirect = redirectUrl;
        try {
          safeRedirect = new URL(redirectUrl).toString();
        } catch (_firstErr) {
          try {
            const repaired = SANITIZE_PCT(redirectUrl);
            safeRedirect = new URL(repaired).toString();
          } catch (_secondErr) {
            try {
              sessionStorage.setItem(
                "hc_paypal_redirect_error",
                JSON.stringify({ reason: "URL parse failed", ts: Date.now(), sample: String(redirectUrl).slice(0, 80) })
              );
            } catch {}
            try {
              const current = new URL(window.location.href);
              current.searchParams.set("paypal_redirect_error", "1");
              window.location.href = current.toString();
            } catch {
              window.location.reload();
            }
            return;
          }
        }
        try {
          window.location.assign(safeRedirect);
        } catch {
          window.location.href = safeRedirect;
        }
      }
      return;
    }

    if (typeof onDispatch !== "function") return;

    const dispatchPayload = {
      challenge: activeChallenge,
      interactionType,
      provider,
      authChallengeId: activeChallenge.authChallengeId ?? null,
      frontendReturnPayloadId: activeChallenge.frontendReturnPayloadId ?? null,
    };

    if (provider === "stripe") {
      dispatchPayload.clientSecret = activeChallenge.clientSecret ?? activeChallenge.client_secret ?? null;
    }

    if (provider === "paypal") {
      dispatchPayload.orderId = activeChallenge.orderId ?? activeChallenge.order_id ?? null;
      dispatchPayload.setupTokenId = activeChallenge.setupTokenId ?? activeChallenge.setup_token_id ?? null;
      dispatchPayload.redirectUrl = activeChallenge.redirectUrl ?? activeChallenge.redirect_url ?? null;
      dispatchPayload.donorReturnParams = activeChallenge.donorReturnParams ?? loadDonorReturnParams() ?? null;
    }

    onDispatch(dispatchPayload);
  }, [activeChallenge, interactionType, provider, onDispatch]);

  const showBanner = useMemo(() => {
    if (!activeChallenge) return false;
    if (interactionType === "none") return false;
    if (interactionType === "redirect" && provider === "paypal") return false;
    return provider === "stripe" || provider === "paypal";
  }, [activeChallenge, interactionType, provider]);

  return (
    <div className={`flex flex-col gap-3 ${className}`.trim()}>
      {showBanner && (
        <ChallengeCountdownBanner challenge={activeChallenge} onExpire={onExpire} />
      )}
      {children}
    </div>
  );
};

export default UnifiedChallengeDispatcher;
