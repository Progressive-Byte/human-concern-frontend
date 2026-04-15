import React from 'react'

const WaysToGive = () => {

    const waysToGive = [
        {
            icon: "💳",
            title: "One-Time Donation",
            description:
            "Make a single contribution to any campaign, big or small — every amount counts.",
        },
        {
            icon: "🔄",
            title: "Monthly Giving",
            description:
            "Become a sustainer. Set up recurring donations and create lasting, consistent change.",
        },
        {
            icon: "🎁",
            title: "Give in Honor",
            description:
            "Celebrate someone special by donating in their name with a beautiful tribute card.",
        },
        {
            icon: "🏢",
            title: "Corporate Matching",
            description:
            "Double your impact. Many employers match employee donations — check if yours does.",
        },
        {
            icon: "📦",
            title: "In-Kind Goods",
            description:
            "Donate goods and supplies directly to campaigns that need physical resources.",
        },
        {
            icon: "🤝",
            title: "Volunteer",
            description:
            "Give your time, skills, and energy. Volunteer with local or remote campaign teams.",
        },
        ];

  return (
    <section className="py-24 bg-[#F6F6F6]" id="ways-to-give">
        <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-yellow-400 mb-2">
            Flexible Giving
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-white m-0">
            Ways to Give
            </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {waysToGive.map(({ icon, title, description }) => (
            <div
                key={title}
                className="p-7 bg-[#161616] border border-white/[0.08] rounded-2xl hover:border-yellow-400/20 hover:-translate-y-1 transition-all duration-200"
            >
                <span className="text-3xl block mb-4">{icon}</span>
                <h4 className="text-[15px] font-bold text-white tracking-tight mb-2">
                {title}
                </h4>
                <p className="text-[13px] text-white/55 leading-relaxed m-0">
                {description}
                </p>
            </div>
            ))}
        </div>
        </div>
    </section>
  )
}

export default WaysToGive
