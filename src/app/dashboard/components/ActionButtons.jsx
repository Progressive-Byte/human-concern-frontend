import Link from "next/link";
import { EyeIcon, PauseIcon, PlayIcon, TrashIcon } from "@/components/common/SvgIcon";

const ActionButtons = ({ isActive, slug }) => {
  return (
    <>
      <button
        type="button"
        title={isActive ? "Pause" : "Resume"}
        className="w-8 h-8 rounded-lg border border-dashed border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:border-red-500/40 hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
      >
        {isActive ? PauseIcon : PlayIcon}
      </button>
      <Link
        href={`/dashboard/schedules/${id}`}
        title="View"
        className="w-8 h-8 rounded-lg border border-dashed border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:border-red-500/40 hover:text-red-600 hover:bg-red-500/10 transition-colors"
      >
        {EyeIcon}
      </Link>
      <button
        type="button"
        title="Cancel"
        className="w-8 h-8 rounded-lg border border-dashed border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:border-[#EA3335]/40 hover:text-[#EA3335] hover:bg-[#FFF5F5] transition-colors cursor-pointer"
      >
        {TrashIcon}
      </button>
    </>
  );
}

export default ActionButtons
