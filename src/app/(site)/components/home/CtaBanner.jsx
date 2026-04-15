import Link from 'next/link'
import React from 'react'

const CtaBanner = () => {
  return (
    <section className="pt-[100px] pb-[80px] md:pb-[200px] md:pt-[130px] pb-[80px] bg-[url('/images/bg/cta-bg.png')] bg-center bg-cover bg-no-repeat">
      <div className="max-w-[1350px] mx-auto px-6 md:px-3 xl:px-0">
        <div className="flex flex-col items-center justify-between gap-[50px]">
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Ready to Make a Difference?
            </h2>
            <p className="text-[15px] text-[#FFFFFFCC] leading-relaxed mt-3 max-w-md">
              Join thousands of donors who trust GiveHope to deliver their
              contributions to those in need.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap shrink-0">
            <Link
              href="/donate"
              className="px-7 py-3.5 bg-[#EA3335] text-white font-normal text-[18px] rounded-full hover:bg-red-700 hover:-translate-y-0.5 transition-all no-underline"
            >
              Donate Now
            </Link>
            <Link
              href="/register"
              className="px-7 py-3.5 border border-[#FFFFFF] text-white font-normal text-[18px] rounded-full hover:text-white hover:bg-white/5 hover:border-white/20 transition-all no-underline"
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