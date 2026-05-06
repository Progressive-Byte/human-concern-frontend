export default function KpiCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] text-[#6B7280]">{label}</p>
          <p className="mt-2 text-[28px] font-semibold leading-none text-[#111827]">{value}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] text-[#6B7280]">
          {icon}
        </div>
      </div>
    </div>
  );
}

