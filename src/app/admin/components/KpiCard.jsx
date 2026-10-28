const KpiCard = ({ label, value, icon, iconPosition = "right" }) => {
  const iconWrapClass =
    "hc-admin-brand-soft hc-admin-brand-text hc-admin-brand-soft-hover flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-200";

  if (iconPosition === "left") {
    return (
      <div className="group hc-admin-brand-border-hover hc-animate-fade-up hc-hover-lift min-w-0 overflow-hidden rounded-2xl border border-solid border-[#E5E7EB] bg-[#FAFAFA] p-4 hover:bg-white">
        <div className="flex items-center gap-3">
          <div className={iconWrapClass}>{icon}</div>
          <div className="min-w-0">
            <p className="text-[12px] text-[#6B7280]">{label}</p>
            <p className="hc-kpi-value mt-2 font-semibold text-[#111827]" title={String(value)}>
              {value}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group hc-admin-brand-border-hover hc-animate-fade-up hc-hover-lift min-w-0 overflow-hidden rounded-2xl border border-solid border-[#E5E7EB] bg-[#FAFAFA] p-4 hover:bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] text-[#6B7280]">{label}</p>
          <p className="hc-kpi-value mt-2 font-semibold text-[#111827]" title={String(value)}>
            {value}
          </p>
        </div>

        <div className={iconWrapClass}>{icon}</div>
      </div>
    </div>
  );
}

export default KpiCard
