import React from 'react'

const WaysToGive = () => {

  return (

    <section className="lg:py-[130px] md:py-[100px] py-20 bg-[#F6F6F6]" id="ways-to-give">
        <div className="max-w-[1350px] mx-auto px-6 md:px-3 xl:px-0">
            <div className="text-center mb-12">
                <h2 className="text-2xl lg:text-[28px] font-bold text-[#1A1A1A] m-0 tracking-tight">
                    Ways to Give
                </h2>
                <p className="text-[15px] text-[#737373] mt-3 mb-0 leading-relaxed">
                    Multiple donation types to fulfill your religious <br className="hidden sm:block" />
                    obligations and charitable aspirations.
                </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 md:gap-4">
                <div className="bg-white rounded-[20px] overflow-hidden flex flex-col sm:row-span-1 lg:row-span-2">
                    <div className="p-6 mt-4 ml-1">
                        <h4 className="text-[20px] xl:text-[32px] md:text-[25px] font-semibold text-[#383838]">Zakat</h4>
                        <p className="text-[13px] xl:text-[18px] md:text-[15px] font-semibold text-[#38383899]">
                            Obligatory charity for eligible Muslims. Pay your Zakat to purify your wealth.
                        </p>
                    </div>
                    <div className="py-9 flex-1 flex items-end justify-center min-h-[200px] lg:min-h-[260px]">
                        <img src="/images/zakat.png" alt="Zakat" className="w-full object-contain" />
                    </div>
                </div>
                <div className="bg-white rounded-[20px] overflow-hidden flex flex-col">
                    <div className="p-6 mt-4 ml-1">
                    <h4 className="text-[20px] xl:text-[32px] md:text-[25px] font-semibold text-[#383838]">Sadaqah</h4>
                    <p className="text-[13px] xl:text-[18px] md:text-[15px] font-semibold text-[#38383899]">
                        Voluntary charity that can be given at any time to aid those in need.
                    </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center pb-4">
                        <img src="/images/sadaqah.png" alt="Sadaqah" className="w-3/6 object-contain" />
                    </div>
                </div>
                <div className="bg-white rounded-[20px] overflow-hidden flex flex-col">
                    <div className="p-6 mt-4 ml-1">
                        <h4 className="text-[20px] xl:text-[32px] md:text-[25px] font-semibold text-[#383838]">Emergency Relief</h4>
                        <p className="text-[13px] xl:text-[18px] md:text-[15px] font-semibold text-[#38383899]">
                            Rapid responses and aid to disaster areas to help communities recover.
                        </p>
                        </div>
                    <div className="flex-1 flex items-center justify-center pb-4">
                        <img src="/images/relief.png" alt="Emergency Relief" className="w-3/6 object-contain" />
                    </div>
                </div>
                <div className="bg-white rounded-[20px] overflow-hidden flex flex-col">
                    <div className="p-6 mt-4 ml-1">
                        <h4 className="text-[20px] xl:text-[32px] md:text-[25px] font-semibold text-[#383838]">Water Aid</h4>
                        <p className="text-[13px] xl:text-[18px] md:text-[15px] font-semibold text-[#38383899]">
                            Build sustainable wells and systems to provide clean, safe water for entire villages.
                        </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center mt-[70px]">
                    <img src="/images/water-aid.png" alt="Water Aid" className="w-3/6 object-contain" />
                    </div>
                </div>
                <div className="bg-white rounded-[20px] overflow-hidden flex flex-col lg:row-span-2 lg:col-start-3 lg:row-start-2">
                    <div className="p-6">
                    <h4 className="text-[20px] lg:text-[32px] font-semibold text-[#383838]">Food Aid</h4>
                    <p className="text-[13px] lg:text-[18px] mr-[80px] font-semibold text-[#38383899]">
                        Deliver life-saving meals and nutrition packs to families facing hunger and crisis.
                    </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-[200px] lg:min-h-[260px]">
                    <img src="/images/food-aid.png" alt="Food Aid" className="w-full object-contain" />
                    </div>
                </div>
                <div className="bg-white rounded-[20px] overflow-hidden flex flex-row items-start sm:col-span-2 lg:col-span-2 lg:col-start-1 lg:row-start-3">
                    <div className="p-7 flex-1">
                    <h4 className="text-[20px] lg:text-[32px] font-semibold text-[#383838]">Child Sponsorship</h4>
                    <p className="text-[13px] lg:text-[18px] font-semibold text-[#38383899]">
                        Provide education, healthcare, and daily essentials to transform an orphan's life.
                    </p>
                    </div>
                    <div className="flex-1 flex items-end justify-end pt-4 shrink-0">
                    <img src="/images/child-sponsorship.png" alt="Child Sponsorship" className="w-full object-contain" />
                    </div>
                </div>
            </div>
        </div>
    </section>
  )
}

export default WaysToGive