import { EditIcon, PauseIcon, PlayIcon, TrashIcon } from "@/components/common/SvgIcon";

const ActionButtons = ({ isActive }) => {
  return (
    <>
      <button
        type="button"
        title={isActive ? "Pause" : "Resume"}
        className="w-8 h-8 rounded-lg border border-[#EBEBEB] flex items-center justify-center text-[#8C8C8C] hover:border-[#055A46]/40 hover:text-[#055A46] hover:bg-[#ECF9F3] transition-colors cursor-pointer"
      >
        {isActive ? PauseIcon : PlayIcon}
      </button>
      <button
        type="button"
        title="Edit"
        className="w-8 h-8 rounded-lg border border-[#EBEBEB] flex items-center justify-center text-[#8C8C8C] hover:border-[#055A46]/40 hover:text-[#055A46] hover:bg-[#ECF9F3] transition-colors cursor-pointer"
      >
        {EditIcon}
      </button>
      <button
        type="button"
        title="Cancel"
        className="w-8 h-8 rounded-lg border border-[#EBEBEB] flex items-center justify-center text-[#8C8C8C] hover:border-[#EA3335]/40 hover:text-[#EA3335] hover:bg-[#FFF5F5] transition-colors cursor-pointer"
      >
        {TrashIcon}
      </button>
    </>
  );
}

export default ActionButtons