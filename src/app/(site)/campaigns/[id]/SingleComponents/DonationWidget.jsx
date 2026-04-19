import React from 'react'

const DonationWidget = ({ campaign }) => {
    const pct = Math.min(100, Math.round((campaign.raised / campaign.goal) * 100));
    const isZakat = campaign.tag.toLowerCase().includes("zakat");

    return (
        <>
            <div className='flex flex-col gap-[25px]'>
                <div className="rounded-2xl border border-dashed border-[#BFBFBF]">
                    <div className="px-5 pt-5">
                        <p className="text-[36px] font-bold text-[#383838] leading-none">
                        ${campaign.raised.toLocaleString()}
                        </p>
                        <p className="text-[16px] text-[#383838] mt-4">
                        raised of ${campaign.goal.toLocaleString()}
                        </p>

                        {/* Progress bar */}
                        <div className="relative h-[15px] bg-[#DDFFB4] rounded-full overflow-hidden mt-4">
                        <div
                            className="h-full bg-[#055A46] rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                        />
                        </div>
                        <div className="flex justify-end">
                        <span className="text-[12px] font-semibold text-[#AEAEAE]">{pct}%</span>
                        </div>

                        {/* Stat pills */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-[#F6F6F6] rounded-xl px-4 py-3 text-center">
                            <p className="text-[20px] font-bold text-[#383838]">{campaign.donors}</p>
                            <p className="text-[11px] text-[#AEAEAE] mt-0.5">Donors</p>
                        </div>
                        <div className="bg-[#F6F6F6] rounded-xl px-4 py-3 text-center">
                            <p className="text-[20px] font-bold text-[#383838]">{campaign.daysLeft}</p>
                            <p className="text-[11px] text-[#AEAEAE] mt-0.5">Days Left</p>
                        </div>
                        </div>
                    </div>
                    <div className="px-5 py-4 flex flex-col gap-2.5">
                        <button className="w-full bg-[#EA3335] hover:bg-red-700 text-white font-semibold py-3 rounded-xl text-[15px] transition-colors active:scale-95">
                        Donate Now
                        </button>
                        <button className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-400 text-[#383838] font-medium py-3 rounded-xl text-[14px] transition-colors">
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                        </svg>
                        Share Campaign
                        </button>

                        {/* Zakat badge */}
                        {isZakat && (
                        <div className="flex items-start gap-2.5 bg-[#F0FDF4] border border-[#bbf7d0] rounded-xl px-4 py-3 mt-1">
                            <svg className="text-[#10B981] shrink-0 mt-0.5" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                            <p className="text-[13px] font-semibold text-[#065F46]">{campaign.tag}</p>
                            <p className="text-[11px] text-[#6B7280] leading-snug mt-0.5">
                                This campaign is verified for Zakat contributions
                            </p>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-dashed border-[#BFBFBF]">
                    <div className="px-5 pb-5">
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                        <div className="bg-[#F6F6F6] px-4 py-3 flex items-center justify-between">
                            <p className="text-[13px] font-semibold text-[#383838]">How Your Donation Helps</p>
                            <div className="flex items-center gap-1.5 text-[12px] text-[#737373] border border-gray-200 rounded-full px-2.5 py-1 bg-white">
                            <span>$</span>
                            <span className="font-medium">USD</span>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                            </div>
                        </div>

                        {campaign.donationTiers.map((tier, i) => (
                            <button
                            key={tier.amount}
                            className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors border-t border-gray-100 ${
                                i === 1
                                ? "bg-[#F0FDF4] hover:bg-green-50"
                                : "bg-white hover:bg-gray-50"
                            }`}
                            >
                            <span className={`text-[15px] font-bold ${i === 1 ? "text-[#065F46]" : "text-[#383838]"}`}>
                                ${tier.amount}
                            </span>
                            <span className={`text-[12px] ${i === 1 ? "text-[#065F46]" : "text-[#737373]"}`}>
                                {tier.label}
                            </span>
                            </button>
                        ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default DonationWidget
