"use client";

const ObjectiveSelector = ({ objectives, objective, onSelect }) => {
  if (!objectives.length) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] font-semibold text-[#383838]">
        Select Objective
        <span className="ml-1.5 text-[#8C8C8C] font-normal">(optional)</span>
      </p>
      {objectives.map((obj) => {
        const active = objective === obj.id;
        return (
          <button
            key={obj.id}
            type="button"
            onClick={() => onSelect(obj)}
            className={`w-full flex flex-col items-start rounded-2xl px-5 py-4 border text-left transition-all cursor-pointer ${
              active
                ? "border-[#EA3335] bg-white"
                : "border-[#E5E5E5] hover:border-[#CCCCCC] bg-white"
            }`}
          >
            <p className="text-[14px] font-semibold text-[#383838]">{obj.label}</p>
            {obj.desc && (
              <p className="text-[12px] text-[#8C8C8C] mt-0.5">{obj.desc}</p>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ObjectiveSelector;
