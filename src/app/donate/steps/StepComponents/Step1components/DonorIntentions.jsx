"use client";

import { useDonation } from "@/context/DonationContext";
import { showMessageIcon } from "@/components/common/SvgIcon";

const ROUND_BOX = "w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors";
const SQUARE_BOX = "w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-colors";

const DEDICATIONS = [
  { key: "honor", label: "In honor of someone" },
  { key: "memory", label: "In memory of someone" },
];

// Optional donor intentions. Anonymous can stand alone; honor and memory are
// mutually exclusive. Extra inputs appear only when the donor picks one.
const DonorIntentions = () => {
  const { data, update } = useDonation();
  const anonymous = Boolean(data.anonymous);
  const dedicationType = data.dedicationType ?? null;
  const dedicationName = data.dedicationName ?? "";

  const toggleDedication = (type) => {
    const next = dedicationType === type ? null : type;
    update({ dedicationType: next, ...(next ? {} : { dedicationName: "" }) });
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] font-semibold text-[#383838]">Donor intentions</p>

      <button
        type="button"
        onClick={() => update({ anonymous: !anonymous })}
        className="flex items-center gap-3 w-full text-left cursor-pointer"
      >
        <span className={`${ROUND_BOX} ${anonymous ? "border-[#EA3335]" : "border-[#CCCCCC]"}`}>
          {anonymous && <span className="w-2.5 h-2.5 rounded-full bg-[#EA3335]" />}
        </span>
        <span className="text-[14px] text-[#383838]">Give anonymously</span>
      </button>

      {DEDICATIONS.map((item) => {
        const active = dedicationType === item.key;
        return (
          <div key={item.key} className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => toggleDedication(item.key)}
              className="flex items-center gap-3 w-full text-left cursor-pointer"
            >
              <span className={`${SQUARE_BOX} ${active ? "border-[#EA3335] bg-[#EA3335]" : "border-[#CCCCCC]"}`}>
                {active && showMessageIcon}
              </span>
              <span className="text-[14px] text-[#383838]">{item.label}</span>
            </button>

            {active && (
              <input
                value={dedicationName}
                onChange={(e) => update({ dedicationName: e.target.value })}
                placeholder="Enter a name"
                maxLength={100}
                className="w-full border border-solid border-[#E5E7EB] rounded-xl px-4 py-3 text-[14px] text-[#383838] bg-white placeholder:text-[#AEAEAE] focus:outline-none focus:border-[#EA3335] transition-colors"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DonorIntentions;
