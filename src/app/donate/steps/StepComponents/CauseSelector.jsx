"use client";

const CauseSelector = ({ causes, selectedCauseIds, toggleCause }) => {
  if (!causes.length) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-[#383838]">Select Cause</p>
        <span className="text-[13px] text-[#8C8C8C]">
          <span className="text-[#000000] font-normal">{selectedCauseIds.length} selected</span>
          {" "}of {causes.length}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {causes.map((cause) => {
          const active = selectedCauseIds.includes(cause.id);
          return (
            <button
              key={cause.id}
              type="button"
              onClick={() => toggleCause(cause)}
              className={`flex flex-col items-start gap-2 rounded-xl p-4 border text-left transition-all cursor-pointer ${
                active
                  ? "border-[#EA3335] bg-[#FFF5F5]"
                  : "border-[#E5E5E5] hover:border-[#CCCCCC] hover:bg-[#FAFAFA]"
              }`}
            >
              {cause.emoji && (
                <span className="text-[28px] leading-none">{cause.emoji}</span>
              )}
              <div>
                <p className="text-[14px] font-semibold text-[#383838]">{cause.label}</p>
                {cause.desc && (
                  <p className="text-[12px] text-[#8C8C8C] mt-0.5">{cause.desc}</p>
                )}
                {cause.zakatEligible && (
                  <span className="inline-block mt-2 text-[11px] font-medium text-[#8C8C8C] bg-white rounded-full px-1.5 py-0.5">
                    Zakat Eligible
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CauseSelector;
