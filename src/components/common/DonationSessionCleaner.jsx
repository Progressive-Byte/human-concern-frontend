"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Routes that are part of the active donation flow.
// /donate/* covers the generic flow and thank-you page.
// /[campaignSlug]/1-4 covers campaign-specific steps.
const inDonateFlow = (path) =>
  /^\/donate(\/|$)/.test(path) || /^\/[^/]+\/[1-4]$/.test(path);

const DonationSessionCleaner = () => {
  const pathname = usePathname();
  // Initialise the ref from the current path so a hard-load on a donate
  // page doesn't immediately trigger a false "just left" clear.
  const wasInFlowRef = useRef(inDonateFlow(pathname));

  // #region debug-point H1:atob-wrapper
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.__trae_debug_atob_installed) return;
    window.__trae_debug_atob_installed = true;

    const DEBUG_URL = "http://127.0.0.1:7777/event";
    const SESSION = "paypal-onetime-atob-pending-record";

    const send = (payload) => {
      try {
        fetch(DEBUG_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: SESSION,
            runId: "pre",
            ts: Date.now(),
            ...payload,
          }),
        }).catch(() => {});
      } catch {}
    };

    const origAtob = window.atob.bind(window);
    const origDecodeURIComponent = window.decodeURIComponent.bind(window);
    const origDecodeURI = window.decodeURI.bind(window);
    const stackTop = () => {
      try { throw new Error("_s"); } catch (e) {
        const lines = String(e.stack || "").split("\n").slice(1, 6);
        return lines.map((l) => l.trim()).filter(Boolean);
      }
    };
    const describeStr = (s) => {
      if (typeof s !== "string") return { typeof: typeof s, nullish: s == null };
      const first = s.slice(0, 80);
      const last = s.length > 80 ? s.slice(-32) : "";
      const charCodes = [];
      for (let i = 0; i < Math.min(s.length, 24); i++) {
        charCodes.push(s.charCodeAt(i));
      }
      const specials = [];
      if (/[^\x20-\x7E]/.test(s)) specials.push("non_ascii");
      if (/-/.test(s)) specials.push("dash");
      if (/_/.test(s)) specials.push("underscore");
      if (/%/.test(s)) specials.push("percent");
      if (s.length % 4 !== 0) specials.push(`len%4=${s.length % 4}`);
      if (/=+$/.test(s)) specials.push("padded");
      return { len: s.length, first, last, charCodes, specials };
    };

    window.atob = function (input) {
      let toDecode = input;
      let coercedInfo = null;
      if (typeof toDecode !== "string") {
        coercedInfo = { fromType: typeof toDecode, nullish: toDecode == null };
        try { toDecode = String(toDecode); } catch (e) { coercedInfo.coerceErr = String(e && e.message || e); throw e; }
      }
      try {
        return origAtob(toDecode);
      } catch (err1) {
        const originalInfo = describeStr(toDecode);
        const originalMsg = String(err1 && err1.message || err1);
        const looksLikeBase64UrlToken =
          typeof toDecode === "string" &&
          toDecode.length >= 24 &&
          (/[-_]/.test(toDecode)) &&
          /^[A-Za-z0-9\-_=]+$/.test(toDecode);
        if (looksLikeBase64UrlToken) {
          try {
            let alt = toDecode.replace(/-/g, "+").replace(/_/g, "/");
            const pad = (4 - (alt.length % 4)) % 4;
            if (pad) alt += "=".repeat(pad);
            const altInfo = describeStr(alt);
            const res = origAtob(alt);
            send({
              hypothesisId: "H1",
              location: "window.atob.recovered",
              msg: "[DEBUG] atob recovered RFC4648 base64url token (length>=24)",
              data: { original: originalInfo, coercedInfo, padded: altInfo, recoveredLen: res.length, originalMsg, stack: stackTop() },
            });
            return res;
          } catch (_) {
            send({
              hypothesisId: "H1",
              location: "window.atob.failed",
              msg: "[DEBUG] atob threw on plausible base64url token (no recovery possible — rethrowing)",
              data: { original: originalInfo, coercedInfo, originalMsg, stack: stackTop() },
            });
            throw err1;
          }
        }
        send({
          hypothesisId: "H1",
          location: "window.atob.failed",
          msg: "[DEBUG] atob threw on non-token input (short/random probe — rethrowing for SDK internal catch)",
          data: { original: originalInfo, coercedInfo, originalMsg, stack: stackTop() },
        });
        throw err1;
      }
    };

    window.decodeURIComponent = function (input) {
      try {
        return origDecodeURIComponent(input);
      } catch (err) {
        const info = describeStr(typeof input === "string" ? input : String(input || ""));
        send({
          hypothesisId: "H6",
          location: "window.decodeURIComponent.failed",
          msg: "[DEBUG] decodeURIComponent threw (rethrowing — SDK should catch internally)",
          data: { input: info, originalMsg: String(err && err.message || err), stack: stackTop() },
        });
        throw err;
      }
    };

    window.decodeURI = function (input) {
      try {
        return origDecodeURI(input);
      } catch (err) {
        const info = describeStr(typeof input === "string" ? input : String(input || ""));
        send({
          hypothesisId: "H6",
          location: "window.decodeURI.failed",
          msg: "[DEBUG] decodeURI threw (rethrowing — SDK should catch internally)",
          data: { input: info, originalMsg: String(err && err.message || err), stack: stackTop() },
        });
        throw err;
      }
    };

    const origOnError = window.onerror;
    window.onerror = function (msg, url, lineNo, colNo, err) {
      send({
        hypothesisId: "H4",
        location: `window.onerror@${url || ""}:${lineNo}:${colNo}`,
        msg: "[DEBUG] window.onerror fired",
        data: { msg: String(msg), stack: err && err.stack ? String(err.stack).slice(0, 1200) : null, errName: err && err.name || null },
      });
      if (typeof origOnError === "function") return origOnError.apply(this, arguments);
      return false;
    };

    window.addEventListener("unhandledrejection", (ev) => {
      const r = ev && ev.reason;
      send({
        hypothesisId: "H4",
        location: "window.unhandledrejection",
        msg: "[DEBUG] unhandled promise rejection",
        data: { msg: r && r.message ? String(r.message) : String(r || ""), stack: r && r.stack ? String(r.stack).slice(0, 1200) : null, errName: r && r.name || null },
      });
    });
  }, []);
  // #endregion

  useEffect(() => {
    const nowInFlow = inDonateFlow(pathname);
    if (nowInFlow) {
      wasInFlowRef.current = true;
    } else if (wasInFlowRef.current) {
      // Donor just navigated away from the flow without completing payment.
      wasInFlowRef.current = false;
      try { sessionStorage.removeItem("hc_donation"); } catch {}
    }
  }, [pathname]);

  return null;
}
export default DonationSessionCleaner;