import React from 'react';

const HowItWorks = () => {

const steps = [
  {
    signUpText: "Sign up &",
    title: "Choose Your Cause",
    description:
      "Select from Zakat, Sadaqah, emergency relief, or specific campaigns that align with your giving goals.",
    bg: "/images/cause-card.png",
  },
  {
    signUpText: "Sign up or Login to",
    title: "Donate Securely",
    description:
      "SMake one-time or recurring donations with secure payment processing. Set up automated giving schedules.",
    bg: "/images/security-card.png",
  },
  {
    signUpText: "Login and",
    title: "Track Your Impact",
    description:
      "Monitor your giving history, see where your donations go, and understand the real impact you're making.",
    bg: "/images/impact-card.png",
  },
];

  return (
    <section className="pt-[60px] pb-[80px] sm:pt-[80px] sm:pb-[100px] lg:py-[140px] lg:pb-[170px] bg-[url('/images/bg/how-it-works.png')] bg-cover bg-center" id="how-it-works">
      <div className="max-w-[1350px] mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl lg:text-[40px] font-bold text-[#FFFFFF] m-0">
            How It Works
          </h2>
            <p className="text-[15px] sm:text-[18px] font-normal text-[#FFFFFF] mb-2">
              Simple, secure, and transparent donation process
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px]">
          {steps.map(({ signUpText, title, description, bg }) => (
            <div
              key={signUpText}
              style={{ backgroundImage: `url(${bg})` }}
              className="group px-[57px] py-[42px] bg-cover bg-center bg-no-repeat h-full rounded-2xl overflow-hidden"
            >
              <div className="">
                <div className="text-[14px] font-normal text-[#FFFFFF] mb-1">
                  {signUpText}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {title}
                </h3>
                <p className="text-[14px] text-[#A5A5A5] leading-relaxed pr-[90px]">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;