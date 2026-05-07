export default function KpiCard({ label, value, icon }) {
  return (
    <div className="group hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] p-4 hover:bg-white hover:border-red-500/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] text-[#6B7280]">{label}</p>
          <p className="mt-2 text-[28px] font-semibold leading-none text-[#111827]">{value}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-700 transition-colors duration-200 group-hover:bg-red-500/15">
          {icon}
        </div>
      </div>
    </div>
  );
}
