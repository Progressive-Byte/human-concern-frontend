"use client";

import {
  ActiveDonerIcon,
  AidDeleveryIcon,
  CountryReachIcon,
  ImpactIcon,
} from "@/components/common/SvgIcon";
import { useHomepageContent } from "@/context/HomepageContentContext";
import React from "react";

const ICONS = {
  aid: AidDeleveryIcon,
  donor: ActiveDonerIcon,
  country: CountryReachIcon,
  impact: ImpactIcon,
};

const Activity = () => {
  const content = useHomepageContent();
  const section = content?.sections?.stats;

  if (section?.enabled === false) return null;
  const stats = Array.isArray(section?.items) ? section.items : [];

  return (
    <section className="w-full bg-[#FFFFFF] pt-10 pb-8 sm:pb-16 lg:pb-[110px] sm:pt-12 lg:pt-20">
      <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2 lg:gap-4">
          {stats.map((item, index) => (
            <div
              key={index}
              className="relative flex flex-col justify-between bg-[#F6F6F6] rounded-3xl py-6 px-4 sm:py-[40px] sm:px-6 lg:px-10 min-h-[120px] lg:min-h-[140px] overflow-hidden"
            >
              <div>
                <h3 className="text-[28px] sm:text-[32px] lg:text-[40px] font-bold text-[#383838]">
                  {item.value}
                </h3>
                <p className="text-xs sm:text-sm text-[#737373] font-normal mt-2 sm:mt-3">
                  {item.label}
                </p>
              </div>
              <div className="absolute bottom-2.5 right-2.5 sm:bottom-5 sm:right-5 lg:bottom-6 lg:right-6 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 flex items-center justify-center opacity-100">
                {ICONS[item.icon] || AidDeleveryIcon}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Activity;
