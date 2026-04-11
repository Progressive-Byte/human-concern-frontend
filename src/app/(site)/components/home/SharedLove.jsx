import Image from "next/image";
import React from "react";

const SharedLove = () => {
  return (
    <section className="pt-16 pb-16 sm:pt-20 sm:pb-20 lg:pt-[116px] lg:pb-[70px] bg-white" id="shared-love">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1fr_2fr_1.5fr_1.6fr_0.9fr] lg:grid-rows-[repeat(20,_26px)] gap-4" >
            <div className="relative w-full lg:w-[290px] h-[250px] lg:h-[382px] rounded-2xl lg:rounded-none lg:rounded-r-2xl overflow-hidden lg:col-[1] lg:row-[1/10] group">
                <Image src="/images/love-1.png" alt="" fill className="object-cover transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:opacity-80" />
            </div>
            <div className="relative w-full lg:w-[391px] h-[250px] lg:h-[323px] rounded-2xl lg:rounded-none lg:rounded-r-2xl overflow-hidden lg:col-[1] lg:row-[10/21] lg:mt-[25px] group">
                <Image src="/images/love-6.png" alt="" fill className="object-cover transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:opacity-80" />
            </div>
            <div className="relative w-full lg:w-[472px] h-[250px] lg:h-[312px] lg:rounded-l-2xl rounded-2xl overflow-hidden lg:col-[2] lg:row-[3/15] lg:ml-[-90px] lg:mt-[-15px] group">
                <Image src="/images/love-2.png" alt="" fill className="object-cover transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:opacity-80" />
            </div>
            <div className="relative w-full lg:w-[385px] h-[250px] lg:h-[242px] lg:rounded-l-2xl rounded-2xl overflow-hidden lg:col-[2] lg:row-[16/21] lg:mt-[-225px] group">
                <Image src="/images/love-7.png" alt="" fill className="object-cover transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:opacity-80" />
            </div>
            <div className="relative w-full lg:w-[315px] h-[250px] lg:h-[392px] rounded-2xl overflow-hidden lg:col-[3] lg:row-[5/19] lg:ml-[7px] group">
                <Image src="/images/love-3.png" alt="" fill className="object-cover transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:opacity-80" />
            </div>
            <div className="relative w-full lg:w-[300px] h-[250px] lg:h-[348px] rounded-2xl overflow-hidden lg:col-[4] lg:row-[3/9] lg:ml-[8px] group">
                <Image src="/images/love-4.png" alt="" fill className="object-cover transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:opacity-80" />
            </div>
            <div className="relative w-full lg:w-[198px] h-[250px] lg:h-[242px] rounded-2xl overflow-hidden lg:col-[4] lg:row-[11/15] lg:mt-[30px] lg:ml-[8px] group">
                <Image src="/images/love-8.png" alt="" fill className="object-cover transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:opacity-80" />
            </div>
            <div className="relative w-full lg:w-[268px] h-[250px] lg:h-[196px] rounded-2xl overflow-hidden lg:col-[6] lg:row-[10/21] lg:ml-[-118px] lg:mt-[72px] group">
                <Image src="/images/love-9.png" alt="" fill className="object-cover transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:opacity-80" />
            </div>
            <div className="relative w-full lg:w-[435px] h-[250px] lg:h-[433px] rounded-2xl lg:rounded-none lg:rounded-l-2xl overflow-hidden lg:col-[6] lg:row-[1/19] lg:ml-[-15px] group">
                <Image src="/images/love-5.png" alt="" fill className="object-cover transition-all duration-500 ease-in-out group-hover:scale-110 group-hover:opacity-80" />
            </div>
        </div>
      </div>
    </section>
  );
};

export default SharedLove;