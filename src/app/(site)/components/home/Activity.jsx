import { ActiveDonerIcon, AidDeleveryIcon, CountryReachIcon, ImpactIcon } from "@/components/common/SvgIcon";
import React from "react";

const stats = [
  {
    value: "$2.4M+",
    label: "In Aids Delivered",
    icon: AidDeleveryIcon,
  },
  {
    value: "15K+",
    label: "Active Donors",
    icon: ActiveDonerIcon,
  },
  {
    value: "48+",
    label: "Countries Reached",
    icon: CountryReachIcon,
  },
  {
    value: "250K+",
    label: "Lives Impacted",
    icon: ImpactIcon,
  },
];

const Activity = () => {
  return (
    <section className="w-full bg-[#FFFFFF] py-10 sm:py-12 lg:py-16">
      <div className="max-w-[1410px] mx-auto px-4 sm:px-6 lg:px-2">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-2">
          {stats.map((item, index) => (
            <div
                key={index}
                className="relative flex flex-col justify-between bg-[#F6F6F6] rounded-3xl py-[40px] px-6 sm:px-8 lg:px-10 min-h-[120px] lg:min-h-[140px] overflow-hidden"
                >
                <div>
                    <h3 className="text-lg sm:text-xl lg:text-[40px] font-bold text-[#383838]">
                    {item.value}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#737373] font-normal mt-3">
                    {item.label}
                    </p>
                </div>

                {/* Icon — pinned to bottom-right */}
                <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 lg:bottom-6 lg:right-6 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 flex items-center justify-center opacity-100">
                    {item.icon}
                </div>
                </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Activity;