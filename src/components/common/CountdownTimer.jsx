"use client";

import { useEffect, useMemo, useState } from "react";

function pad(n) {
  return n < 10 ? `0${n}` : String(n);
}

export function formatHumanMs(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return { total: 0, text: "0s", parts: { d: 0, h: 0, m: 0, s: 0 } };
  const totalSec = Math.ceil(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (parts.length === 0 || s > 0) parts.push(`${s}s`);
  return { total: totalSec, text: parts.join(" "), parts: { d, h, m, s } };
}

export function formatCountdownLong(ms) {
  const { parts } = formatHumanMs(ms);
  const segments = [];
  if (parts.d > 0) segments.push(`${parts.d} day${parts.d === 1 ? "" : "s"}`);
  const hm = [];
  if (parts.d > 0 || parts.h > 0) hm.push(pad(parts.h));
  hm.push(pad(parts.m));
  hm.push(pad(parts.s));
  const joined = [...segments, hm.join(":")].join(" ");
  return joined;
}

function getTone(ms, warningThresholdSeconds = 600, criticalThresholdSeconds = 180) {
  const sec = Math.ceil(ms / 1000);
  if (sec <= 0) return "expired";
  if (sec <= criticalThresholdSeconds) return "critical";
  if (sec <= warningThresholdSeconds) return "warning";
  return "healthy";
}

const toneClassMap = {
  healthy: "text-emerald-700 bg-emerald-50",
  warning: "text-amber-800 bg-amber-50",
  critical: "text-red-700 bg-red-50 animate-pulse",
  expired: "text-gray-500 bg-gray-100",
};

const CountdownTimer = ({
  expiresAt,
  warningThresholdSeconds = 600,
  criticalThresholdSeconds = 180,
  onExpire,
  showIcon = true,
  size = "md",
  className = "",
}) => {
  const target = useMemo(() => {
    if (!expiresAt) return 0;
    const d = expiresAt instanceof Date ? expiresAt.getTime() : new Date(String(expiresAt)).getTime();
    return Number.isFinite(d) ? d : 0;
  }, [expiresAt]);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!target) return undefined;
    const id = window.setInterval(() => {
      setNow((prev) => {
        const n = Date.now();
        if (n >= target) {
          window.clearInterval(id);
        }
        return n;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  const remaining = target ? target - now : 0;
  const tone = getTone(remaining, warningThresholdSeconds, criticalThresholdSeconds);
  const expired = remaining <= 0;

  useEffect(() => {
    if (expired && typeof onExpire === "function") {
      onExpire();
    }
  }, [expired, onExpire]);

  const text = expired ? "Expired" : formatCountdownLong(remaining);
  const toneCls = toneClassMap[tone] || toneClassMap.healthy;
  const sizeCls =
    size === "sm" ? "px-2 py-1 text-[11px]" : size === "lg" ? "px-4 py-2 text-[15px]" : "px-3 py-1.5 text-[12px]";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full font-semibold ${toneCls} ${sizeCls} ${className}`.trim()}
      title={expiresAt ? new Date(target).toLocaleString() : ""}
    >
      {showIcon ? (
        <span className="inline-flex h-4 w-4 items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8v4l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
      ) : null}
      <span>{text}</span>
    </span>
  );
};

export default CountdownTimer;
