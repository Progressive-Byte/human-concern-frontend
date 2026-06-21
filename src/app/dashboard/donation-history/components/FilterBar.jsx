import { SearchIconFront } from "@/components/common/SvgIcon";
import CustomDropdown from "@/components/common/CustomDropdown";

export function FilterBar({ search, onSearchChange, cause, onCauseChange, causeOptions }) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div className="relative flex-1">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2">{SearchIconFront}</span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search campaigns..."
          className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white pl-10 pr-4 py-2.5 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#EA3335]/40 focus:ring-2 focus:ring-[#EA3335]/10 transition"
        />
      </div>
      <div className="min-w-[170px]">
        <CustomDropdown
          options={causeOptions}
          value={cause}
          onChange={onCauseChange}
          variant="form"
          placeholder="All Causes"
          showFilterIcon
          triggerHeight="h-10"
        />
      </div>
    </div>
  );
}
