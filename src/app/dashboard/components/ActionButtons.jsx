import Link from "next/link";
import { EditIcon, EyeIcon, PauseIcon, PlayIcon } from "@/components/common/SvgIcon";

const ActionButtons = ({ isActive, slug }) => {
  return (
    <>
      <button
        type="button"
        title="Edit"
        className="w-8 h-8 rounded-lg border border-dashed border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:border-blue-500/40 hover:text-blue-600 hover:bg-blue-500/10 transition-colors cursor-pointer"
      >
        {EditIcon}
      </button>

      <button
        type="button"
        title={isActive ? "Pause" : "Resume"}
        className={`w-8 h-8 rounded-lg border border-dashed flex items-center justify-center transition-colors cursor-pointer ${
          isActive
            ? "border-[#E5E7EB] text-[#6B7280] hover:border-amber-500/40 hover:text-amber-600 hover:bg-amber-500/10"
            : "border-[#E5E7EB] text-[#6B7280] hover:border-emerald-500/40 hover:text-emerald-600 hover:bg-emerald-500/10"
        }`}
      >
        {isActive ? PauseIcon : PlayIcon}
      </button>

      <Link
        href={`/dashboard/schedules/${slug}`}
        title="View"
        className="w-8 h-8 rounded-lg border border-dashed border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:border-red-500/40 hover:text-red-600 hover:bg-red-500/10 transition-colors"
      >
        {EyeIcon}
      </Link>
    </>
  );
};

export default ActionButtons;
