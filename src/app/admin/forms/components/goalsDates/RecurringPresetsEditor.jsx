"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Toggle from "@/components/ui/Toggle";
import FieldError from "../FieldError";
import MiniCalendar from "./MiniCalendar";
import { WEEKDAYS, recurringFrequencyHint } from "@/utils/recurringFrequency";

const FREQ_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Annually" },
  { value: "custom", label: "Custom" },
];

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

function utcTodayDate() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function parseDateInput(value) {
  const s = String(value || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function firstWeekdayOnOrAfter(base, weekday) {
  const d = new Date(base);
  const diff = (Number(weekday) - d.getUTCDay() + 7) % 7;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

// The first payment date for a quick-added preset.
function quickStartDate(frequency, { weekday, month, campaignStartDate } = {}) {
  const today = utcTodayDate();
  const campaignStart = parseDateInput(campaignStartDate);
  const base = campaignStart && campaignStart >= today ? campaignStart : today;

  if (frequency === "weekly") return firstWeekdayOnOrAfter(base, weekday);

  if (frequency === "monthly") {
    const year = campaignStart ? campaignStart.getUTCFullYear() : today.getUTCFullYear();
    let candidate = new Date(Date.UTC(year, Number(month) - 1, 1));
    while (candidate < today) {
      candidate = new Date(Date.UTC(candidate.getUTCFullYear() + 1, candidate.getUTCMonth(), 1));
    }
    return candidate;
  }

  if (frequency === "yearly") {
    const seed = campaignStart || today;
    let candidate = new Date(Date.UTC(seed.getUTCFullYear(), seed.getUTCMonth(), seed.getUTCDate()));
    while (candidate < today) {
      candidate = new Date(Date.UTC(candidate.getUTCFullYear() + 1, candidate.getUTCMonth(), candidate.getUTCDate()));
    }
    return candidate;
  }

  return base;
}

function quickEndDate(start, campaignEndDate) {
  const formEnd = parseDateInput(campaignEndDate);
  if (formEnd && formEnd > start) return formEnd;
  // No form end date: the preset is open-ended and runs until cancelled.
  return null;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatPresetDate(date) {
  if (!date || Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function PresetIcon({ name }) {
  const common = {
    className: "h-4 w-4",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  if (name === "daily") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    );
  }
  if (name === "weekly") {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M8 2v4M16 2v4M3 10h18" />
        <path d="M7 14h.01M12 14h.01M17 14h.01M7 18h.01M12 18h.01" />
      </svg>
    );
  }
  if (name === "monthly") {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M8 2v4M16 2v4M3 10h18" />
      </svg>
    );
  }
  if (name === "annually") {
    return (
      <svg {...common}>
        <path d="M21 12a9 9 0 1 1-3-6.7" />
        <path d="M21 3v6h-6" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M4 6h16M4 12h16M4 18h16" />
      <circle cx="8" cy="6" r="2" />
      <circle cx="16" cy="12" r="2" />
      <circle cx="10" cy="18" r="2" />
    </svg>
  );
}

function PresetTile({ label, hint, icon, onClick, disabled, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-start gap-1 rounded-xl border px-3 py-2.5 text-left transition ${
        active ? "border-[#111827] bg-white shadow-sm" : "border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#111827]">
        <span className="text-[#6B7280]"><PresetIcon name={icon} /></span>
        {label}
      </span>
      <span className="text-[11px] leading-4 text-[#6B7280]">{hint}</span>
    </button>
  );
}

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

function DateField({ label, value, placeholder = "Select date", onClick, disabled, error, buttonRef, onClear }) {
  const canClear = Boolean(value) && typeof onClear === "function" && !disabled;
  return (
    <div className="relative">
      <div className="mb-2 text-[13px] font-semibold text-[#111827]">{label}</div>
      <div className="flex items-center gap-2">
        <button
          ref={buttonRef}
          type="button"
          onClick={onClick}
          disabled={disabled}
          className="flex w-full items-center justify-between rounded-xl border border-solid border-[#E5E7EB] bg-white px-3 py-2.5 text-left text-[13px] text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
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
        {canClear ? (
          <button
            type="button"
            onClick={onClear}
            aria-label={`Clear ${label}`}
            title="Clear date"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-solid border-[#E5E7EB] bg-white text-[#6B7280] transition hover:bg-[#F9FAFB] hover:text-[#111827]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
      </div>
      <FieldError message={error} />
    </div>
  );
}

function campaignWindowLabel(campaignStartDate, campaignEndDate) {
  if (!campaignStartDate && !campaignEndDate) return "";
  return `Dates must fall within the campaign window: ${campaignStartDate || "—"} → ${campaignEndDate || "ongoing"}.`;
}

function dayOfWeekFromInput(value) {
  const s = String(value || "").trim();
  if (!s) return null;
  const d = new Date(`${s}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d.getUTCDay();
}

function DateRangeEditor({ value, onChange, disabled, errors, campaignStartDate, campaignEndDate }) {
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
  const days = Array.isArray(v.daysOfWeek) ? v.daysOfWeek : [];
  const showWeekDays = String(frequency) === "weekly";

  function toggleDay(day) {
    // A preset runs on exactly one weekday; clicking a day replaces the previous one.
    setField({ daysOfWeek: [day] });
  }

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
            onClear={startDate ? () => { setField({ startDate: "" }); setOpenPicker(null); } : undefined}
          />
          <CalendarPopover
            open={openPicker === "start"}
            anchorRef={startBtnRef}
            onRequestClose={() => setOpenPicker(null)}
          >
            <MiniCalendar
              selectedDates={startDate ? [startDate] : []}
              onToggleDate={setStart}
              minDate={campaignStartDate}
              maxDate={campaignEndDate}
              defaultMonth={startDate || campaignStartDate}
            />
          </CalendarPopover>
        </div>

        <div className="relative">
          <DateField
            label="End Date (Optional — empty = runs until cancelled)"
            value={endDate}
            onClick={() => setOpenPicker((p) => (p === "end" ? null : "end"))}
            disabled={disabled}
            error={errors?.endDate}
            buttonRef={endBtnRef}
            onClear={endDate ? () => { setField({ endDate: "" }); setOpenPicker(null); } : undefined}
          />
          <CalendarPopover
            open={openPicker === "end"}
            anchorRef={endBtnRef}
            onRequestClose={() => setOpenPicker(null)}
          >
            <MiniCalendar
              selectedDates={endDate ? [endDate] : []}
              onToggleDate={setEnd}
              minDate={campaignStartDate}
              maxDate={campaignEndDate}
              defaultMonth={endDate || campaignStartDate}
            />
          </CalendarPopover>
        </div>
      </div>

      {campaignWindowLabel(campaignStartDate, campaignEndDate) ? (
        <div className="text-[11px] text-[#6B7280]">{campaignWindowLabel(campaignStartDate, campaignEndDate)}</div>
      ) : null}

      <div className={showInterval ? "" : "md:col-span-2"}>
        <div className="mb-2 text-[13px] font-semibold text-[#111827]">Frequency</div>
        <div className="rounded-xl border border-solid border-[#E5E7EB] bg-white px-3 py-2.5">
          <select
            value={frequency}
            onChange={(e) => {
              const next = e.target.value;
              if (next === "custom") {
                setField({ frequency: "custom" });
              } else if (next === "weekly") {
                const wd = dayOfWeekFromInput(startDate);
                setField({
                  frequency: "weekly",
                  intervalValue: "",
                  ...(days.length || wd === null ? {} : { daysOfWeek: [wd] }),
                });
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
            className="w-full rounded-xl border border-solid border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:opacity-60"
          />
          <FieldError message={errors?.intervalValue} />
        </div>
      ) : null}

      {showWeekDays ? (
        <div>
          <div className="mb-2 text-[13px] font-semibold text-[#111827]">
            Day of the week <span className="text-red-600">*</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((w) => {
              const active = days.includes(w.value);
              return (
                <button
                  key={w.value}
                  type="button"
                  onClick={() => toggleDay(w.value)}
                  disabled={disabled}
                  className={`rounded-xl border px-3 py-1.5 text-[12px] font-semibold transition ${
                    active
                      ? "border-[#111827] bg-[#111827] text-white"
                      : "border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
                  } disabled:opacity-60`}
                >
                  {w.label}
                </button>
              );
            })}
          </div>
          <FieldError message={errors?.daysOfWeek} />
        </div>
      ) : null}

      {recurringFrequencyHint({ frequency, interval: intervalValue, daysOfWeek: days }) ? (
        <div className="text-[11px] text-[#6B7280]">
          {recurringFrequencyHint({ frequency, interval: intervalValue, daysOfWeek: days })}
        </div>
      ) : null}
    </div>
  );
}

function SpecificDatesEditor({ value, onChange, disabled, errors, campaignStartDate, campaignEndDate }) {
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
          onClear={dates.length ? () => { onChange?.({ ...v, dates: [] }); setOpen(false); } : undefined}
        />
        <CalendarPopover open={open} anchorRef={datesBtnRef} onRequestClose={() => setOpen(false)}>
          <div className="space-y-3">
            <MiniCalendar
              selectedDates={dates}
              onToggleDate={toggleDate}
              minDate={campaignStartDate}
              maxDate={campaignEndDate}
              defaultMonth={dates[0] || campaignStartDate}
            />
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

      {campaignWindowLabel(campaignStartDate, campaignEndDate) ? (
        <div className="mt-2 text-[11px] text-[#6B7280]">{campaignWindowLabel(campaignStartDate, campaignEndDate)}</div>
      ) : null}

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
        <div className="mt-3 rounded-2xl border border-solid border-[#E5E7EB] bg-white p-4 text-[13px] text-[#6B7280]">
          No dates selected.
        </div>
      )}
    </div>
  );
}

function PresetCard({ value, onChange, onRemove, onSetDefault, disabled, errors, campaignStartDate, campaignEndDate, open, onToggle, innerRef }) {
  const v = value && typeof value === "object" ? value : {};
  const scheduleType = String(v.scheduleType || "date_range");
  const config = v.scheduleConfig && typeof v.scheduleConfig === "object" ? v.scheduleConfig : {};
  const cardErrors = errors && typeof errors === "object" ? errors : {};
  const endDateKey = String(config.endDate || "").slice(0, 10);
  const isExpired = Boolean(endDateKey && endDateKey < todayKey());
  const frequencyLabel = FREQ_OPTIONS.find((item) => item.value === String(config.frequency || ""))?.label || "Custom";
  const summary = scheduleType === "specific_dates"
    ? `Specific dates · ${Array.isArray(config.dates) ? config.dates.length : 0} date(s)`
    : `Date range · ${frequencyLabel}`;

  function setField(patch) {
    onChange?.({ ...(v || {}), ...(patch || {}) });
  }

  function setConfig(nextConfig) {
    setField({ scheduleConfig: nextConfig });
  }

  return (
    <div
      ref={innerRef}
      className={`rounded-2xl border bg-white transition ${
        open ? "border-[#E5E7EB]" : "border-[#F3F4F6] hover:bg-[#F9FAFB]"
      }`}
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={Boolean(open)}
          className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 text-left"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-[13px] font-semibold text-[#111827]">
                {String(v.name || "").trim() || "Untitled preset"}
              </span>
              {v.isDefault ? (
                <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-semibold text-[#374151]">Default</span>
              ) : null}
              {!v.enabled ? (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Disabled</span>
              ) : null}
              {isExpired ? (
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">Expired</span>
              ) : null}
              {Object.keys(cardErrors).length ? (
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">Needs attention</span>
              ) : null}
            </div>
            <div className="mt-0.5 truncate text-[11px] text-[#6B7280]">{summary}</div>
          </div>
          <span className="shrink-0 text-[12px] font-semibold text-[#6B7280]">
            {open ? "Close" : "Edit"}
          </span>
        </button>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label="Remove preset"
          className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#6B7280] transition hover:bg-[#F9FAFB] hover:text-[#111827] disabled:opacity-60"
        >
          <TrashIcon />
        </button>
      </div>

      {open ? (
        <div className="border-t border-[#F3F4F6] p-4">
        <div className="w-full">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Name</div>
              <input
                value={String(v.name ?? "")}
                onChange={(e) => setField({ name: e.target.value })}
                placeholder="Every week"
                disabled={disabled}
                className="w-full rounded-xl border border-solid border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:opacity-60"
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
                className="w-full rounded-xl border border-solid border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:opacity-60"
              />
              <FieldError message={cardErrors.sortOrder} />
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-solid border-[#E5E7EB] bg-white p-4 md:flex-1">
              <div>
                <div className="text-[13px] font-semibold text-[#111827]">Enabled</div>
                <div className="mt-1 text-[12px] text-[#6B7280]">Show this preset to donors</div>
              </div>
              <Toggle enabled={Boolean(v.enabled)} onChange={disabled ? () => {} : (next) => setField({ enabled: Boolean(next) })} />
            </div>
            <div className="md:flex-1">
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Default</div>
              <label className="flex h-10 items-center gap-2 rounded-lg border border-solid border-[#E5E7EB] bg-white px-3 text-[13px] text-[#111827]">
                <input
                  type="radio"
                  name="recurringPresetDefault"
                  checked={Boolean(v.isDefault)}
                  onChange={() => onSetDefault?.()}
                  disabled={disabled}
                  className="h-4 w-4"
                  style={{ accentColor: "var(--admin-accent-600, #111827)" }}
                />
                <span className={Boolean(v.isDefault) ? "font-semibold" : "text-[#6B7280]"}>Use as default</span>
              </label>
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

          <div className="mt-3 flex items-center justify-between gap-4 rounded-2xl border border-solid border-[#E5E7EB] bg-white p-4">
            <div>
              <div className="text-[13px] font-semibold text-[#111827]">Allow make-up for missed dates</div>
              <div className="mt-1 text-[12px] text-[#6B7280]">
                Let donors who start mid-period also pay the preset dates that already passed
              </div>
            </div>
            <Toggle
              enabled={Boolean(v.allowMissedMakeUp)}
              onChange={disabled ? () => {} : (next) => setField({ allowMissedMakeUp: Boolean(next) })}
            />
          </div>

          {isExpired ? (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
              All dates in this preset are in the past.{" "}
              {v.allowMissedMakeUp
                ? "Donors can only use it by paying the missed dates."
                : "It is hidden from donors until make-up is enabled."}
            </div>
          ) : null}

          {scheduleType === "date_range" ? (
            <DateRangeEditor
              value={config}
              onChange={setConfig}
              disabled={disabled}
              errors={cardErrors.scheduleConfig}
              campaignStartDate={campaignStartDate}
              campaignEndDate={campaignEndDate}
            />
          ) : (
            <SpecificDatesEditor
              value={config}
              onChange={setConfig}
              disabled={disabled}
              errors={cardErrors.scheduleConfig}
              campaignStartDate={campaignStartDate}
              campaignEndDate={campaignEndDate}
            />
          )}
        </div>
        </div>
      ) : null}
    </div>
  );
}

const RecurringPresetsEditor = ({
  allowRecurringDonations,
  onChangeAllowRecurringDonations,
  allowFlexibleRecurringSchedule = true,
  onChangeAllowFlexibleRecurringSchedule,
  value = [],
  onChange,
  disabled,
  errors,
  allowError,
  sectionError = "",
  campaignStartDate,
  campaignEndDate,
}) => {
  const presets = Array.isArray(value) ? value : [];
  const [openIndex, setOpenIndex] = useState(null);
  const cardRefs = useRef({});

  function setPreset(idx, patch) {
    onChange?.(presets.map((p, i) => (i === idx ? { ...(p || {}), ...(patch || {}) } : p)));
  }

  function setDefault(idx) {
    onChange?.(presets.map((p, i) => ({ ...(p || {}), isDefault: i === idx })));
  }

  function removePreset(idx) {
    const next = presets.filter((_, i) => i !== idx);
    // Keep exactly one default when presets remain — move it to the first row if the
    // defaulted row was the one removed.
    if (next.length && !next.some((p) => Boolean(p?.isDefault))) {
      next[0] = { ...(next[0] || {}), isDefault: true };
    }
    setOpenIndex((cur) => (cur === idx ? null : cur > idx ? cur - 1 : cur));
    onChange?.(next);
  }

  const [pendingAdd, setPendingAdd] = useState(null); // "weekly" | "monthly" | null
  const [quickNotice, setQuickNotice] = useState(null); // { kind: "success"|"error", text }
  const maxPresetsReached = presets.length >= 12;
  const formEnd = parseDateInput(campaignEndDate);
  const afterFormEnd = (date) => Boolean(formEnd && date > formEnd);

  useEffect(() => {
    if (!quickNotice) return undefined;
    const t = setTimeout(() => setQuickNotice(null), 4000);
    return () => clearTimeout(t);
  }, [quickNotice]);

  function addPreset(nextPreset) {
    if (maxPresetsReached) {
      setQuickNotice({ kind: "error", text: "You can add up to 12 presets." });
      return false;
    }
    const nextIndex = presets.length;
    onChange?.([...(presets || []), nextPreset]);
    setOpenIndex(nextIndex);
    setQuickNotice({
      kind: "success",
      text: nextPreset.name
        ? `${nextPreset.name} added and opened below.`
        : "Preset added and opened below — give it a name.",
    });
    setPendingAdd(null);

    // The new card sits at the end of the list, so bring it into view.
    setTimeout(() => {
      cardRefs.current[nextIndex]?.scrollIntoView?.({ behavior: "smooth", block: "center" });
    }, 80);
    return true;
  }

  function addQuick(frequency, extra = {}) {
    const start = quickStartDate(frequency, { ...extra, campaignStartDate });
    if (afterFormEnd(start)) {
      setQuickNotice({ kind: "error", text: "That start date is after the form end date." });
      return;
    }

    let name = "Daily";
    if (frequency === "weekly") {
      const day = WEEKDAYS.find((w) => w.value === Number(extra.weekday));
      name = `Weekly – ${day?.label || "Day"}`;
    } else if (frequency === "monthly") {
      const month = MONTHS.find((m) => m.value === Number(extra.month));
      name = `Monthly – ${month?.label || "Month"}`;
    } else if (frequency === "yearly") {
      name = "Annually";
    }

    const end = quickEndDate(start, campaignEndDate);
    addPreset({
      name,
      enabled: true,
      allowMissedMakeUp: false,
      sortOrder: String((presets.length + 1) * 10),
      scheduleType: "date_range",
      scheduleConfig: {
        startDate: start.toISOString(),
        ...(end ? { endDate: end.toISOString() } : {}),
        frequency,
        ...(frequency === "weekly" ? { daysOfWeek: [Number(extra.weekday)] } : {}),
      },
    });
  }

  function addCustomPreset() {
    addPreset({
      name: "",
      enabled: true,
      allowMissedMakeUp: false,
      sortOrder: String((presets.length + 1) * 10),
      scheduleType: "date_range",
      scheduleConfig: {},
    });
  }

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-solid border-[#E5E7EB] bg-white p-4 md:p-5">
      <div className="mb-4">
        <h3 className="text-[14px] font-semibold text-[#111827]">Recurring Donations</h3>
        <p className="mt-1 text-[13px] text-[#6B7280]">Configure preset recurring schedules shown to donors</p>
      </div>

      {allowRecurringDonations && sectionError ? (
        <div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2">
          <FieldError message={sectionError} />
        </div>
      ) : null}

      <div className="rounded-2xl border border-solid border-[#E5E7EB] bg-white p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[13px] font-semibold text-[#111827]">Allow Recurring Donations</div>
            <div className="mt-1 text-[12px] text-[#6B7280]">Let donors set up weekly, monthly, or custom schedules</div>
          </div>
          <Toggle enabled={Boolean(allowRecurringDonations)} onChange={disabled ? () => {} : onChangeAllowRecurringDonations} />
        </div>
        <FieldError message={allowError} />
      </div>

      {allowRecurringDonations ? (
        <div className="mt-4 rounded-2xl border border-solid border-[#E5E7EB] bg-white p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[13px] font-semibold text-[#111827]">Enable Flexible Recurring Schedule</div>
              <div className="mt-1 text-[12px] text-[#6B7280]">
                Let donors change, skip, or edit payments after the schedule is created.
              </div>
            </div>
            <Toggle
              enabled={Boolean(allowFlexibleRecurringSchedule)}
              onChange={disabled ? () => {} : onChangeAllowFlexibleRecurringSchedule}
            />
          </div>
        </div>
      ) : null}

      {allowRecurringDonations ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB]/60 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="text-[13px] font-semibold text-[#111827]">Add a preset</div>
                <div className="mt-0.5 text-[12px] text-[#6B7280]">One-click schedule options shown to donors.</div>
              </div>
              <div className="text-[11px] text-[#6B7280]">
                {formEnd ? (
                  <>
                    Presets must start before the form ends{" "}
                    <span className="font-semibold text-[#374151]">({formatPresetDate(formEnd)})</span>.
                  </>
                ) : (
                  <span className="text-[#B45309]">No form end date — presets run until cancelled.</span>
                )}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              <PresetTile
                label="Daily"
                hint="Every day"
                icon="daily"
                onClick={() => { setQuickNotice(null); addQuick("daily"); }}
                disabled={disabled || maxPresetsReached || afterFormEnd(quickStartDate("daily", { campaignStartDate }))}
              />
              <PresetTile
                label="Weekly"
                hint="Pick a weekday"
                icon="weekly"
                active={pendingAdd === "weekly"}
                onClick={() => { setQuickNotice(null); setPendingAdd((p) => (p === "weekly" ? null : "weekly")); }}
                disabled={disabled || maxPresetsReached}
              />
              <PresetTile
                label="Monthly"
                hint="Pick a month"
                icon="monthly"
                active={pendingAdd === "monthly"}
                onClick={() => { setQuickNotice(null); setPendingAdd((p) => (p === "monthly" ? null : "monthly")); }}
                disabled={disabled || maxPresetsReached}
              />
              <PresetTile
                label="Annually"
                hint="Once a year"
                icon="annually"
                onClick={() => { setQuickNotice(null); addQuick("yearly"); }}
                disabled={disabled || maxPresetsReached || afterFormEnd(quickStartDate("yearly", { campaignStartDate }))}
              />
              <PresetTile
                label="Custom"
                hint="Full control"
                icon="custom"
                onClick={addCustomPreset}
                disabled={disabled || maxPresetsReached}
              />
            </div>

            {quickNotice ? (
              <div
                className={`mt-2 text-[12px] ${
                  quickNotice.kind === "success" ? "text-emerald-700" : "text-[#B45309]"
                }`}
              >
                {quickNotice.text}
              </div>
            ) : null}

            {pendingAdd === "weekly" ? (
              <div className="mt-3 rounded-xl border border-[#E5E7EB] bg-white p-3">
                <div className="mb-2 text-[12px] font-semibold text-[#111827]">Which day should the weekly preset start?</div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                  {WEEKDAYS.map((day) => {
                    const start = quickStartDate("weekly", { weekday: day.value, campaignStartDate });
                    const blocked = disabled || maxPresetsReached || afterFormEnd(start);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => addQuick("weekly", { weekday: day.value })}
                        disabled={blocked}
                        className="flex flex-col items-start gap-0.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-left text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="text-[12px] font-semibold">{day.label}</span>
                        <span className="text-[10px] text-[#6B7280]">
                          {blocked ? "After form end" : formatPresetDate(start)}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setPendingAdd(null)}
                  className="mt-2 text-[12px] font-semibold text-[#6B7280] transition hover:text-[#111827]"
                >
                  Cancel
                </button>
              </div>
            ) : null}

            {pendingAdd === "monthly" ? (
              <div className="mt-3 rounded-xl border border-[#E5E7EB] bg-white p-3">
                <div className="mb-2 text-[12px] font-semibold text-[#111827]">Which month should the monthly preset start?</div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {MONTHS.map((month) => {
                    const start = quickStartDate("monthly", { month: month.value, campaignStartDate });
                    const blocked = disabled || maxPresetsReached || afterFormEnd(start);
                    return (
                      <button
                        key={month.value}
                        type="button"
                        onClick={() => addQuick("monthly", { month: month.value })}
                        disabled={blocked}
                        className="flex flex-col items-start gap-0.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-left text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="text-[12px] font-semibold">{month.label}</span>
                        <span className="text-[10px] text-[#6B7280]">
                          {blocked ? "After form end" : formatPresetDate(start)}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 text-[11px] text-[#6B7280]">
                  Starts on the 1st of that month and moves to next year if that date has already passed.
                </div>
                <button
                  type="button"
                  onClick={() => setPendingAdd(null)}
                  className="mt-2 text-[12px] font-semibold text-[#6B7280] transition hover:text-[#111827]"
                >
                  Cancel
                </button>
              </div>
            ) : null}
          </div>

          {presets.length ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[13px] font-semibold text-[#111827]">Presets ({presets.length})</div>
                <div className="text-[11px] text-[#6B7280]">
                  {presets.filter((p) => p?.enabled !== false).length} enabled
                </div>
              </div>
              {presets.map((p, idx) => (
                <PresetCard
                  key={p?.id || idx}
                  innerRef={(el) => {
                    cardRefs.current[idx] = el;
                  }}
                  open={openIndex === idx}
                  onToggle={() => setOpenIndex((cur) => (cur === idx ? null : idx))}
                  value={p}
                  onChange={(next) => setPreset(idx, next)}
                  onRemove={() => removePreset(idx)}
                  onSetDefault={() => setDefault(idx)}
                  disabled={disabled}
                  errors={errors?.[idx]}
                  campaignStartDate={campaignStartDate}
                  campaignEndDate={campaignEndDate}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-5 py-8 text-center">
              <div className="text-[13px] font-semibold text-[#111827]">No presets yet</div>
              <div className="mt-1 text-[12px] text-[#6B7280]">
                Pick an option above to add your first preset.
              </div>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

export default RecurringPresetsEditor;
