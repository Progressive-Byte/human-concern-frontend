"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertIcon, ProgressCheckIcon, Spinner } from "@/components/common/SvgIcon";
import { serverApiBase } from "@/utils/constants";

function getErrorMessage(err) {
  if (!err) return "Something went wrong. Please try again.";
  if (typeof err === "string") return err;
  if (err instanceof Error && err.message) return err.message;
  return "Something went wrong. Please try again.";
}

async function verifyEmailToken({ token }) {
  const base = String(serverApiBase || "").trim();
  if (!base) throw new Error("Missing serverApiBase.");
  const url = `${base}auth/verify-email?token=${encodeURIComponent(token)}`;
  const res = await fetch(url, { method: "GET" });

  if (!res.ok) {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const body = await res.json().catch(() => ({}));
      const msg = body?.message || body?.error || body?.data?.message;
      throw new Error(typeof msg === "string" && msg.trim() ? msg : `Verification failed (${res.status}).`);
    }
    const text = await res.text().catch(() => "");
    throw new Error(text?.trim() ? text : `Verification failed (${res.status}).`);
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return res.json().catch(() => ({}));
  }
  return res.text().catch(() => "");
}

const VerifyEmailClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = useMemo(() => String(searchParams.get("token") || "").trim(), [searchParams]);
  const [status, setStatus] = useState(token ? "loading" : "error");
  const [message, setMessage] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  const inFlightRef = useRef(false);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  const cleanupTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startRedirectCountdown = () => {
    cleanupTimers();
    setSecondsLeft(3);

    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);

    timerRef.current = setTimeout(() => {
      router.replace("/user/login");
    }, 7000);
  };

  const runVerify = async () => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. Missing token.");
      return;
    }
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    cleanupTimers();
    setStatus("loading");
    setMessage("");

    try {
      await verifyEmailToken({ token });
      setStatus("success");
      setMessage("Your email has been verified successfully.");
      startRedirectCountdown();
    } catch (err) {
      setStatus("error");
      setMessage(getErrorMessage(err));
    } finally {
      inFlightRef.current = false;
    }
  };

  useEffect(() => {
    setStatus(token ? "loading" : "error");
    setMessage(token ? "" : "Invalid verification link. Missing token.");
    runVerify();
    return () => cleanupTimers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div>
      <h2 className="text-[22px] font-semibold text-white mb-2">Verify your email</h2>
      <p className="text-[13px] text-white/60 mb-6">
        {status === "loading"
          ? "Confirming your email address…"
          : status === "success"
            ? "You can now sign in to your account."
            : "We couldn’t verify your email address."}
      </p>

      {status === "loading" ? (
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/80">
          <span className="text-white/80">{Spinner}</span>
          <span>Verifying…</span>
        </div>
      ) : null}

      {status === "success" ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-3">
          <div className="flex items-start gap-2">
            <span className="mt-1 text-emerald-200">{ProgressCheckIcon}</span>
            <div className="min-w-0">
              <p className="text-sm text-emerald-200 leading-snug">{message}</p>
              <p className="text-[13px] text-white/60 mt-2">
                Redirecting to sign in{secondsLeft > 0 ? ` in ${secondsLeft}s` : ""}…
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.replace("/user/login")}
              className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white bg-[#EA3335] hover:bg-red-700 transition-colors cursor-pointer"
            >
              Continue to Sign In
            </button>
            <Link
              href="/"
              className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white/80 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-3">
          <div className="flex items-start gap-2">
            <AlertIcon size={14} />
            <div className="min-w-0">
              <p className="text-sm text-red-200 leading-snug">{message || "Verification failed."}</p>
              <p className="text-[13px] text-white/60 mt-2">
                If this link has expired, request a new one or sign in and try again.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={runVerify}
              className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white bg-[#EA3335] hover:bg-red-700 transition-colors cursor-pointer"
            >
              Try Again
            </button>
            <Link
              href="/user/login"
              className="rounded-lg px-4 py-2 text-[13px] font-semibold text-white/80 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
export default VerifyEmailClient;
