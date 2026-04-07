import Image from "next/image";
import React from "react";

const SharedLove = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-[116px] bg-white" id="shared-love">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-1 ">

        {/* Heading */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-[18px] sm:text-[20px] font-semibold text-[#616161] mb-2">
            Our Global Impact
          </p>
          <h2 className="text-3xl lg:text-[40px] font-bold text-[#383838] m-0">
            #Sharedlove
          </h2>
        </div>
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-3 sm:gap-4">
            {/* Image 1 - Short landscape */}
            <div className="mb-3 sm:mb-4 break-inside-avoid">
                <div className="relative rounded-3xl overflow-hidden aspect-[4/3]">
                    <Image
                    src="/images/love-1.png"
                    alt="Shared love 1"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                </div>
            </div>

            {/* Image 2 - Tall portrait */}
            <div className="mb-3 sm:mb-4 break-inside-avoid">
                <div className="relative rounded-3xl overflow-hidden aspect-[3/4]">
                    <Image
                    src="/images/love-2.png"
                    alt="Shared love 2"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                </div>
            </div>

            {/* Image 3 - Landscape */}
            <div className="mb-3 sm:mb-4 break-inside-avoid">
                <div className="relative rounded-3xl overflow-hidden aspect-video">
                    <Image
                    src="/images/love-3.png"
                    alt="Shared love 3"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                </div>
            </div>

            {/* Image 4 - Very tall portrait (right side in screenshot) */}
            <div className="mb-3 sm:mb-4 break-inside-avoid">
                <div className="relative rounded-3xl overflow-hidden aspect-[2/3]">
                    <Image
                    src="/images/love-4.png"
                    alt="Shared love 4"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                </div>
            </div>

            {/* Image 5 - Short */}
            <div className="mb-3 sm:mb-4 break-inside-avoid">
                <div className="relative rounded-3xl overflow-hidden aspect-square">
                    <Image
                    src="/images/love-5.png"
                    alt="Shared love 5"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                </div>
            </div>

            {/* Image 6 */}
            <div className="mb-3 sm:mb-4 break-inside-avoid">
                <div className="relative rounded-3xl overflow-hidden aspect-[5/4]">
                    <Image
                    src="/images/love-6.png"
                    alt="Shared love 6"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                </div>
            </div>

            {/* Image 7 - Center featured style (you can add overlay if needed) */}
            <div className="mb-3 sm:mb-4 break-inside-avoid">
                <div className="relative rounded-3xl overflow-hidden aspect-[4/5]">
                    <Image
                    src="/images/love-7.png"
                    alt="Shared love 7"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                </div>
            </div>

            {/* Image 8 - Small square */}
            <div className="mb-3 sm:mb-4 break-inside-avoid">
                <div className="relative rounded-3xl overflow-hidden aspect-square">
                    <Image
                    src="/images/love-8.png"
                    alt="Shared love 8"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                </div>
            </div>

            {/* Image 9 */}
            <div className="mb-3 sm:mb-4 break-inside-avoid">
                <div className="relative rounded-3xl overflow-hidden aspect-[3/2]">
                    <Image
                    src="/images/love-9.png"
                    alt="Shared love 9"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default SharedLove;