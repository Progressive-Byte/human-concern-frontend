import React from 'react';

const HowItWorks = ({ steps }) => {
  return (
    <section className="pt-[60px] pb-[80px] sm:pt-[80px] sm:pb-[100px] lg:py-[140px] lg:pb-[170px] bg-[url('/images/bg/how-it-works.png')] bg-cover bg-center" id="how-it-works">
      <div className="max-w-[1291px] mx-auto px-6">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl lg:text-[40px] font-bold text-[#FFFFFF] m-0">
            How It Works
          </h2>
            <p className="text-[15px] sm:text-[18px] font-normal text-[#FFFFFF] mb-2">
              Simple, secure, and transparent donation process
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map(({ number, title, description }) => (
            <div
              key={number}
              className="p-8 bg-[#0e0e0e] border border-white/[0.08] rounded-2xl transition-hover duration-300 hover:border-yellow-400/30"
            >
              <div className="text-5xl font-extrabold text-yellow-400/15 tracking-tighter leading-none mb-5">
                {number}
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight mb-3">
                {title}
              </h3>
              <p className="text-[14px] text-white/55 leading-relaxed m-0">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;