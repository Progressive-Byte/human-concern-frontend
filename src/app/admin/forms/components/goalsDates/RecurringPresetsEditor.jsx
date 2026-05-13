"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Toggle from "@/components/ui/Toggle";
import FieldError from "../FieldError";
import MiniCalendar from "./MiniCalendar";

const FREQ_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "custom", label: "Custom" },
];

function toDateInputValue(value) {
  const s = String(value || "").trim();
  if (!s) return "";
  const t = Date.parse(s);
  if (Number.isNaN(t)) return "";
  const d = new Date(t);
  const yyyy = String(d.getUTCFullYear());
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 7l1 14h10l1-14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 7V4h6v3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function ScheduleTypeSwitch({ value, onChange, disabled }) {
  const v = String(value || "date_range");
  return (
    <div className="flex gap-2">
      {[
        { key: "date_range", label: "Date range" },
        { key: "specific_dates", label: "Specific dates" },
      ].map((opt) => {
        const active = v === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange?.(opt.key)}
            disabled={disabled}
            className={`flex-1 rounded-xl border px-3 py-2 text-[13px] font-semibold transition ${
              active ? "border-[#111827] bg-[#F9FAFB] text-[#111827]" : "border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
            } disabled:opacity-60`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function CalendarPopover({ open, anchorRef, children, onRequestClose }) {
  const [portalNode, setPortalNode] = useState(null);
  const popRef = useRef(null);
  const [pos, setPos] = useState({ bottom: 0, left: 0, width: 360 });

  useEffect(() => {
    if (typeof document === "undefined") return;
    setPortalNode(document.body);
  }, []);

  useEffect(() => {
    if (!open) return;
    function recalc() {
      const rect = anchorRef?.current?.getBoundingClientRect?.();
      if (!rect) return;
      const width = Math.max(280, Math.min(420, rect.width));
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
      const bottom = Math.max(8, window.innerHeight - rect.top + 8);
      setPos({ bottom, left, width });
    }
    recalc();
    window.addEventListener("resize", recalc);
    window.addEventListener("scroll", recalc, true);
    return () => {
      window.removeEventListener("resize", recalc);
      window.removeEventListener("scroll", recalc, true);
    };
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    function onDown(e) {
      const anchorEl = anchorRef?.current;
      if (anchorEl && anchorEl.contains(e.target)) return;
      const pop = popRef.current;
      if (pop && pop.contains(e.target)) return;
      onRequestClose?.();
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, anchorRef, onRequestClose]);

  if (!open || !portalNode) return null;
  return createPortal(
    <div
      ref={popRef}
      className="hc-animate-dropdown fixed z-[300] rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-md"
      style={{ bottom: pos.bottom, left: pos.left, width: pos.width }}
    >
      {children}
    </div>,
    portalNode
  );
}

function DateField({ label, value, placeholder = "Select date", onClick, disabled, error, buttonRef }) {
  return (
    <div className="relative">
      <div className="mb-2 text-[13px] font-semibold text-[#111827]">{label}</div>
      <button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="flex w-full items-center justify-between rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-left text-[13px] text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
      >
        <span className={value ? "text-[#111827]" : "text-[#6B7280]"}>{value || placeholder}</span>
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#9CA3AF]" fill="none">
          <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path
            d="M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <FieldError message={error} />
    </div>
  );
}

function DateRangeEditor({ value, onChange, disabled, errors }) {
  const v = value && typeof value === "object" ? value : {};
  const startDate = toDateInputValue(v.startDate);
  const endDate = toDateInputValue(v.endDate);
  const frequencyRaw = String(v.frequency || "daily");
  const intervalValue = v.intervalValue === null || v.intervalValue === undefined ? "" : String(v.intervalValue);
  const frequency = useMemo(() => {
    const hasInterval = intervalValue !== "" && Number(intervalValue) > 1;
    if (frequencyRaw === "daily" && hasInterval) return "custom";
    return frequencyRaw;
  }, [frequencyRaw, intervalValue]);

  function setField(patch) {
    onChange?.({ ...(v || {}), ...(patch || {}) });
  }

  const showInterval = String(frequency) === "custom";

  const startBtnRef = useRef(null);
  const endBtnRef = useRef(null);
  const [openPicker, setOpenPicker] = useState(null); // "start" | "end" | null

  function setStart(next) {
    setField({ startDate: next });
    setOpenPicker(null);
  }

  function setEnd(next) {
    setField({ endDate: next });
    setOpenPicker(null);
  }

  return (
    <div className="mt-3 space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="relative">
          <DateField
            label="Start Date"
            value={startDate}
            onClick={() => setOpenPicker((p) => (p === "start" ? null : "start"))}
            disabled={disabled}
            error={errors?.startDate}
            buttonRef={startBtnRef}
          />
          <CalendarPopover
            open={openPicker === "start"}
            anchorRef={startBtnRef}
            onRequestClose={() => setOpenPicker(null)}
          >
            <MiniCalendar selectedDates={startDate ? [startDate] : []} onToggleDate={setStart} disablePast={false} />
          </CalendarPopover>
        </div>

        <div className="relative">
          <DateField
            label="End Date"
            value={endDate}
            onClick={() => setOpenPicker((p) => (p === "end" ? null : "end"))}
            disabled={disabled}
            error={errors?.endDate}
            buttonRef={endBtnRef}
          />
          <CalendarPopover
            open={openPicker === "end"}
            anchorRef={endBtnRef}
            onRequestClose={() => setOpenPicker(null)}
          >
            <MiniCalendar selectedDates={endDate ? [endDate] : []} onToggleDate={setEnd} disablePast={false} />
          </CalendarPopover>
        </div>
      </div>

      <div className={showInterval ? "" : "md:col-span-2"}>
        <div className="mb-2 text-[13px] font-semibold text-[#111827]">Frequency</div>
        <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5">
          <select
            value={frequency}
            onChange={(e) => {
              const next = e.target.value;
              if (next === "custom") {
                setField({ frequency: "custom" });
              } else {
                setField({ frequency: next, intervalValue: "" });
              }
            }}
            disabled={disabled}
            className="w-full bg-transparent text-[13px] text-[#111827] outline-none disabled:opacity-60"
          >
            {FREQ_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <FieldError message={errors?.frequency} />
      </div>

      {showInterval ? (
        <div>
          <div className="mb-2 text-[13px] font-semibold text-[#111827]">Interval (days)</div>
          <input
            value={intervalValue}
            onChange={(e) => setField({ intervalValue: e.target.value })}
            inputMode="numeric"
            placeholder="5"
            disabled={disabled}
            className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:opacity-60"
          />
          <FieldError message={errors?.intervalValue} />
        </div>
      ) : null}
    </div>
  );
}

function SpecificDatesEditor({ value, onChange, disabled, errors }) {
  const v = value && typeof value === "object" ? value : {};
  const dates = Array.isArray(v.dates) ? v.dates.map(toDateInputValue).filter(Boolean) : [];
  const datesBtnRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  function toggleDate(dateStr) {
    const d = String(dateStr || "").trim();
    if (!d) return;
    const isSelected = dates.includes(d);
    const next = isSelected ? dates.filter((x) => x !== d) : [...dates, d];
    onChange?.({ ...(v || {}), dates: next.sort() });
  }

  function removeDate(dateStr) {
    const next = dates.filter((d) => d !== dateStr);
    onChange?.({ ...(v || {}), dates: next });
  }

  const visibleDates = showAll ? dates : dates.slice(0, 6);
  const hiddenCount = Math.max(0, dates.length - visibleDates.length);

  return (
    <div className="mt-3">
      <div className="relative">
        <DateField
          label="Dates"
          value={dates.length ? `${dates.length} selected` : ""}
          placeholder="Select dates"
          onClick={() => setOpen((v) => !v)}
          disabled={disabled}
          error={errors?.dates}
          buttonRef={datesBtnRef}
        />
        <CalendarPopover open={open} anchorRef={datesBtnRef} onRequestClose={() => setOpen(false)}>
          <div className="space-y-3">
            <MiniCalendar selectedDates={dates} onToggleDate={toggleDate} disablePast={false} />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
              >
                Done
              </button>
            </div>
          </div>
        </CalendarPopover>
      </div>

      {dates.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {visibleDates.map((d) => (
            <span key={d} className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#111827]">
              {d}
              <button
                type="button"
                onClick={() => removeDate(d)}
                disabled={disabled}
                className="text-[#6B7280] transition hover:text-[#111827] disabled:opacity-60"
                aria-label="Remove date"
              >
                ×
              </button>
            </span>
          ))}
          {hiddenCount > 0 ? (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
            >
              +{hiddenCount} more
            </button>
          ) : null}
          {showAll && dates.length > 6 ? (
            <button
              type="button"
              onClick={() => setShowAll(false)}
              className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
            >
              Show less
            </button>
          ) : null}
        </div>
      ) : (
        <div className="mt-3 rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4 text-[13px] text-[#6B7280]">
          No dates selected.
        </div>
      )}
    </div>
  );
}

function PresetCard({ value, onChange, onRemove, disabled, errors }) {
  const v = value && typeof value === "object" ? value : {};
  const scheduleType = String(v.scheduleType || "date_range");
  const config = v.scheduleConfig && typeof v.scheduleConfig === "object" ? v.scheduleConfig : {};
  const cardErrors = errors && typeof errors === "object" ? errors : {};

  function setField(patch) {
    onChange?.({ ...(v || {}), ...(patch || {}) });
  }

  function setConfig(nextConfig) {
    setField({ scheduleConfig: nextConfig });
  }

  return (
    <div className="rounded-2xl border border-[#F3F4F6] bg-white p-4 transition hover:bg-[#F9FAFB]">
      <div className="flex items-start justify-between gap-3">
        <div className="w-full">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Name</div>
              <input
                value={String(v.name ?? "")}
                onChange={(e) => setField({ name: e.target.value })}
                placeholder="Every week"
                disabled={disabled}
                className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:opacity-60"
              />
              <FieldError message={cardErrors.name} />
            </div>

            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Sort Order</div>
              <input
                value={v.sortOrder === null || v.sortOrder === undefined ? "" : String(v.sortOrder)}
                onChange={(e) => setField({ sortOrder: e.target.value })}
                inputMode="numeric"
                placeholder="10"
                disabled={disabled}
                className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:opacity-60"
              />
              <FieldError message={cardErrors.sortOrder} />
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4 md:flex-1">
              <div>
                <div className="text-[13px] font-semibold text-[#111827]">Enabled</div>
                <div className="mt-1 text-[12px] text-[#6B7280]">Show this preset to donors</div>
              </div>
              <Toggle enabled={Boolean(v.enabled)} onChange={disabled ? () => {} : (next) => setField({ enabled: Boolean(next) })} />
            </div>
            <div className="md:flex-1">
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Schedule Type</div>
              <ScheduleTypeSwitch
                value={scheduleType}
                onChange={(nextType) => {
                  const next = String(nextType || "date_range");
                  if (next === scheduleType) return;
                  setField({ scheduleType: next, scheduleConfig: {} });
                }}
                disabled={disabled}
              />
              <FieldError message={cardErrors.scheduleType} />
            </div>
          </div>

          {scheduleType === "date_range" ? (
            <DateRangeEditor value={config} onChange={setConfig} disabled={disabled} errors={cardErrors.scheduleConfig} />
          ) : (
            <SpecificDatesEditor value={config} onChange={setConfig} disabled={disabled} errors={cardErrors.scheduleConfig} />
          )}
        </div>

        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label="Remove preset"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#6B7280] transition hover:bg-[#F9FAFB] hover:text-[#111827] disabled:opacity-60"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

export default function RecurringPresetsEditor({
  allowRecurringDonations,
  onChangeAllowRecurringDonations,
  value = [],
  onChange,
  disabled,
  errors,
}) {
  const presets = Array.isArray(value) ? value : [];

  function setPreset(idx, patch) {
    onChange?.(presets.map((p, i) => (i === idx ? { ...(p || {}), ...(patch || {}) } : p)));
  }

  function removePreset(idx) {
    onChange?.(presets.filter((_, i) => i !== idx));
  }

  function addPreset() {
    onChange?.([
      ...(presets || []),
      { name: "", enabled: true, sortOrder: String((presets.length + 1) * 10), scheduleType: "date_range", scheduleConfig: {} },
    ]);
  }

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
      <div className="mb-4">
        <h3 className="text-[14px] font-semibold text-[#111827]">Recurring Donations</h3>
        <p className="mt-1 text-[13px] text-[#6B7280]">Configure preset recurring schedules shown to donors</p>
      </div>

      <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[13px] font-semibold text-[#111827]">Allow Recurring Donations</div>
            <div className="mt-1 text-[12px] text-[#6B7280]">Let donors set up weekly, monthly, or custom schedules</div>
          </div>
          <Toggle enabled={Boolean(allowRecurringDonations)} onChange={disabled ? () => {} : onChangeAllowRecurringDonations} />
        </div>
      </div>

      {allowRecurringDonations ? (
        <div className="mt-4 space-y-3">
          {presets.length ? (
            presets.map((p, idx) => (
              <PresetCard
                key={p?.id || idx}
                value={p}
                onChange={(next) => setPreset(idx, next)}
                onRemove={() => removePreset(idx)}
                disabled={disabled}
                errors={errors?.[idx]}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4 text-[13px] text-[#6B7280]">
              No recurring presets added.
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={addPreset}
              disabled={disabled}
              className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
            >
              Add Preset
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
