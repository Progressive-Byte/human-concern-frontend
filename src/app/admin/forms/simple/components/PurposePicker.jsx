"use client";

import { useEffect, useMemo, useState } from "react";
import { getAdminCauses } from "@/services/admin";

function normalizeItems(res) {
  const items = res?.data?.items || res?.data?.data?.items || res?.items || [];
  return Array.isArray(items) ? items : [];
}

function isSelectableCause(cause) {
  if (!cause) return false;
  if (cause.enabled === false) return false;
  const status = String(cause.status || "").trim().toLowerCase();
  if (status && status !== "active") return false;
  return true;
}

const PurposePicker = ({ selectedIds = [], onChange, onDirty, disabled = false }) => {
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);

    (async () => {
      try {
        const res = await getAdminCauses({ page: "1", limit: "200", order: "asc", status: "active", enabled: "true" });
        if (!alive) return;
        setCauses(normalizeItems(res).filter(isSelectableCause));
      } catch (e) {
        if (!alive) return;
        setCauses([]);
        setError(e?.message || "Failed to load purposes.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const selectedSet = useMemo(
    () => new Set((Array.isArray(selectedIds) ? selectedIds : []).map((id) => String(id).trim()).filter(Boolean)),
    [selectedIds]
  );

  function toggle(id) {
    const key = String(id || "").trim();
    if (!key || disabled) return;

    const current = Array.from(selectedSet);
    const next = current.includes(key) ? current.filter((x) => x !== key) : [...current, key];
    onChange(next);
    onDirty?.();
  }

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-solid border-[#E5E7EB] bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[18px] font-semibold leading-tight text-[#111827]">Donation Purposes</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">These come from your Causes list.</p>
        </div>
        <div className="text-[13px] text-[#6B7280] sm:text-right">
          <span className="font-semibold text-[#111827]">{selectedSet.size}</span> selected
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</div>
      ) : null}

      {loading ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-9 w-32 animate-pulse rounded-full bg-[#F3F4F6]" />
          ))}
        </div>
      ) : causes.length === 0 ? (
        <div className="py-10 text-center text-[13px] text-[#6B7280]">No causes available.</div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">
          {causes.map((cause) => {
            const id = String(cause?._id || cause?.id || "").trim();
            const active = id ? selectedSet.has(id) : false;
            const emoji = String(cause?.iconEmoji || "").trim();

            return (
              <button
                key={id || cause?.name}
                type="button"
                onClick={() => toggle(id)}
                disabled={!id || disabled}
                aria-pressed={active}
                className={`rounded-full border px-3.5 py-2 text-[13px] font-medium transition ${
                  active
                    ? "border-red-600/40 bg-red-600/10 text-[#111827]"
                    : "border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F9FAFB]"
                } ${!id || disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
              >
                {emoji ? <span className="mr-1.5">{emoji}</span> : null}
                {String(cause?.name || "Cause")}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default PurposePicker;
