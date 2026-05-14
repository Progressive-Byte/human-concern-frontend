"use client";

import { useDonation } from "@/context/DonationContext";
import { showMessageIcon } from "@/components/common/SvgIcon";

const DonorPreferences = ({ anonymous, setAnonymous, showMessage, setShowMessage }) => {
  const { data, update } = useDonation();

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => {
          const next = !anonymous;
          setAnonymous(next);
          update({ anonymous: next });
        }}
        className="flex items-center gap-3 w-full text-left"
      >
        <span
          className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
            anonymous ? "border-[#EA3335]" : "border-[#CCCCCC]"
          }`}
        >
          {anonymous && <span className="w-2.5 h-2.5 rounded-full bg-[#EA3335]" />}
        </span>
        <span className="text-[14px] text-[#383838]">Make my donation anonymous</span>
      </button>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => {
            const next = !showMessage;
            setShowMessage(next);
            if (!next) update({ donorMessage: "" });
          }}
          className="flex items-center gap-3 w-full text-left"
        >
          <span
            className={`w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-colors ${
              showMessage ? "border-[#EA3335] bg-[#EA3335]" : "border-[#CCCCCC]"
            }`}
          >
            {showMessage && showMessageIcon}
          </span>
          <span className="text-[14px] text-[#383838]">Donating on behalf of someone else</span>
        </button>

        {showMessage && (
          <>
            <textarea
              value={data.donorMessage ?? ""}
              onChange={(e) => update({ donorMessage: e.target.value })}
              placeholder="Enter a name for this dedication…"
              rows={1}
              maxLength={500}
              className="w-full border border-dashed border-[#E5E7EB] rounded-xl px-4 py-3 text-[14px] text-[#383838] bg-white placeholder:text-[#AEAEAE] focus:outline-none focus:border-[#EA3335] resize-none transition-colors"
            />
            <p className="text-[11px] text-[#AEAEAE] text-right">
              {(data.donorMessage ?? "").length} / 500
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default DonorPreferences;
