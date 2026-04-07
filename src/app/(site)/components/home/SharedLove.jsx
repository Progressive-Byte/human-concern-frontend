import Image from "next/image";
import React from "react";

const SharedLove = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-[116px] bg-white" id="shared-love">
      <div className="w-full mx-auto px-2 lg:px-0 ">

        {/* Heading */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-[18px] sm:text-[20px] font-semibold text-[#616161] mb-2">
            Our Global Impact
          </p>
          <h2 className="text-3xl lg:text-[40px] font-bold text-[#383838] m-0">
            #Sharedlove
          </h2>
        </div>
        <div className="grid grid-cols-[1fr_2fr_1.5fr_1.6fr_0.9fr] grid-rows-[repeat(20,_26px)] gap-4">
        {/* <div className="grid gap-4"> */}
          <div className="relative w-[274px] h-[382px] rounded-2xl overflow-hidden col-[1] row-[1/10] ml-[-15px]">
            <Image
              src="/images/love-1.png"
              alt="Shared love 1"
              fill
              sizes="10vw"
              className="object-cover"
            />
          </div>

          <div
            className="w-[381px] h-[323px] relative rounded-2xl overflow-hidden col-[1] row-[10/21] mt-[15px] ml-[-15px]"
          >
            <Image
              src="/images/love-6.png"
              alt="Shared love 6"
              fill
              sizes="10vw"
              className="object-cover"
            />
          </div>
          <div
            className="relative h-[312px] w-[452px] rounded-2xl overflow-hidden col-[2] row-[3/15] ml-[-110px] mt-[-15px]"
          >
            <Image
              src="/images/love-2.png"
              alt="Shared love 2"
              fill
              sizes="18vw"
              className="object-cover"
            />
          </div>
          <div
            className="w-[344px] h-[242px] relative rounded-2xl overflow-hidden col-[2] row-[16/21] mt-[-15px]"
          >
            <Image
              src="/images/love-7.png"
              alt="Shared love 7"
              fill
              sizes="18vw"
              className="object-cover"
            />
          </div>
          <div
            className="relative w-[295px] h-[392px] rounded-2xl overflow-hidden col-[3] row-[5/19] ml-[-75px]"
          >
            <Image
              src="/images/love-3.png"
              alt="Shared love 3"
              fill
              sizes="14vw"
              className="object-cover"
            />
          </div>
          <div
            className="relative w-[290px] h-[348px] rounded-2xl overflow-hidden col-[4] row-[3/9] ml-[-96px]"
          >
            <Image
              src="/images/love-4.png"
              alt="Shared love 4"
              fill
              sizes="15vw"
              className="object-cover"
            />
          </div>

          {/* love-8 — middle fourth column, small square */}
          <div
            className="w-[178px] h-[242px] relative rounded-2xl overflow-hidden col-[4] row-[10/15]"
          >
            <Image
              src="/images/love-8.png"
              alt="Shared love 8"
              fill
              sizes="15vw"
              className="object-cover"
            />
          </div>
          <div
            className="relative rounded-2xl overflow-hidden col-[4] row-[16/21]"
          >
            <Image
              src="/images/love-9.png"
              alt="Shared love 9"
              fill
              sizes="15vw"
              className="object-cover"
            />
          </div>
          <div
            className="relative w-[425px] h-[433px] rounded-2xl overflow-hidden col-[5] row-[1/19]"
          >
            <Image
              src="/images/love-5.png"
              alt="Shared love 5"
              fill
              sizes="17vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SharedLove;