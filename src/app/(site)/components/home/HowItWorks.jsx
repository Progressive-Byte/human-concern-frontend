import React from 'react';

const HowItWorks = () => {

const steps = [
  {
    signUpText: "Sign up &",
    title: "Choose Your Cause",
    description:
      "Select from Zakat, Sadaqah, emergency relief, or specific campaigns that align with your giving goals.",
    bg: "/images/cause-card.png",
    responsiveBg: "/images/responsive-card.png",
  },
  {
    signUpText: "Sign up or Login to",
    title: "Donate Securely",
    description:
      "SMake one-time or recurring donations with secure payment processing. Set up automated giving schedules.",
    bg: "/images/security-card.png",
    responsiveBg: "/images/responsive-card.png",
  },
  {
    signUpText: "Login and",
    title: "Track Your Impact",
    description:
      "Monitor your giving history, see where your donations go, and understand the real impact you're making.",
    bg: "/images/impact-card.png",
    responsiveBg: "/images/responsive-card.png",
  },
];

  return (
    <section className="pt-[60px] pb-[80px] 
      sm:pt-[80px] sm:pb-[100px] 
      lg:pt-[140px] lg:pb-[170px] 
      bg-[url('/images/bg/how-it-works.png')] bg-cover bg-center"
      id="how-it-works"
    >
      <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-0">
        
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-white">
            How It Works
          </h2>
          <p className="text-sm sm:text-[18px] text-white mt-2">
            Simple, secure, and transparent donation process
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-[18px]">
          {steps.map(({ signUpText, title, description, bg, responsiveBg }) => (
            <div
              key={signUpText}
              className="group relative bg-cover bg-center bg-no-repeat 
                        rounded-2xl overflow-hidden h-full
                        px-5 py-6 
                        sm:px-6 sm:py-8 
                        lg:px-[57px] lg:py-[42px]"
            >
              {/* Mobile BG */}
              <div
                className="absolute inset-0 bg-cover bg-center sm:hidden"
                style={{ backgroundImage: `url(${responsiveBg})` }}
              />

              {/* Desktop BG */}
              <div
                className="absolute inset-0 bg-cover bg-center hidden sm:block"
                style={{ backgroundImage: `url(${bg})` }}
              />

              {/* Content */}
              <div className="relative z-10">
                <div className="text-xs sm:text-sm text-white mb-1">
                  {signUpText}
                </div>

                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-3">
                  {title}
                </h3>

                <p className="text-sm text-[#A5A5A5] leading-relaxed 
                              pr-0 sm:pr-6 lg:pr-[90px]">
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