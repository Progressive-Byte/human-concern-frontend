import Link from "next/link";
import { EyeIcon } from "@/components/common/SvgIcon";

const ActionButtons = ({ isActive, slug }) => {
  return (
    <>
      <Link
        href={`/dashboard/schedules/${slug}`}
        title="View"
        className="w-8 h-8 rounded-lg border border-dashed border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:border-red-500/40 hover:text-red-600 hover:bg-red-500/10 transition-colors"
      >
        {EyeIcon}
      </Link>
    </>
  );
}

export default ActionButtons
