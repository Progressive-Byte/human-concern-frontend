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
      <div className="max-w-[1510px] mx-auto px-4 sm:px-6 lg:px-2">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-2">
          
          {stats.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-[#F6F6F6] rounded-3xl py-[44px] px-6 sm:px-8 lg:px-10"
            >
              <div>
                <h3 className="text-lg sm:text-xl lg:text-[40px] font-bold text-[#383838]">
                  {item.value}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                  {item.label}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">
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