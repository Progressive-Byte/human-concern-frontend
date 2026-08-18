import Link from 'next/link'
import React from 'react'

const CtaBanner = () => {
  return (
    <section className="pt-[60px] pb-[60px] sm:pt-[80px] sm:pb-[100px] md:pt-[130px] md:pb-[200px] bg-[url('/images/bg/cta-bg.png')] bg-center bg-cover bg-no-repeat">
      <div className="max-w-[1350px] mx-auto px-4 sm:px-6 md:px-3 xl:px-0">
        <div className="flex flex-col items-center justify-between gap-8 sm:gap-10 md:gap-[50px]">
          <div className="text-center px-2 sm:px-0">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              Ready to Make a Difference?
            </h2>
            <p className="text-sm sm:text-[15px] text-[#FFFFFFCC] leading-relaxed mt-3 max-w-md">
              Join thousands of donors who trust GiveHope to deliver their
              contributions to those in need.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap shrink-0 justify-center">
            <Link
              href="/campaigns"
              className="px-5 sm:px-7 py-3 sm:py-3.5 bg-[#EA3335] text-white font-normal text-[15px] sm:text-[18px] rounded-full hover:bg-red-700 hover:-translate-y-0.5 transition-all no-underline whitespace-nowrap"
            >
              Donate Now
            </Link>
            <Link
              href="/user/register"
              className="px-5 sm:px-7 py-3 sm:py-3.5 border border-[#FFFFFF] text-white font-normal text-[15px] sm:text-[18px] rounded-full hover:text-white hover:bg-white/5 hover:border-white/20 transition-all no-underline whitespace-nowrap"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
export default CtaBanner