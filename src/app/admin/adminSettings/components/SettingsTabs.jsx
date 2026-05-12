"use client";

const items = [
  { key: "general", label: "General" },
  { key: "payment", label: "Payment" },
  { key: "notifications", label: "Notifications" },
  { key: "security", label: "Security" },
  { key: "branding", label: "Branding" },
];

export default function SettingsTabs({ value, onChange }) {
  const active = String(value || "general").toLowerCase();

  return (
    <div className="hc-animate-fade-up overflow-x-auto rounded-2xl bg-[#F3F4F6] p-1">
      <div className="flex min-w-max items-center gap-1">
        {items.map((t) => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange?.(t.key)}
              className={`px-6 py-2.5 text-[13px] font-semibold transition ${
                isActive ? "rounded-2xl bg-white text-[#111827] shadow-sm" : "rounded-2xl text-[#6B7280] hover:bg-white/60 hover:text-[#111827]"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

