import {
  ThankyouIcon,
  DashboardTabIcon,
  BrowserIcon,
  ShareCampaignIcon,
  CircleCheckIcon,
} from "@/components/common/SvgIcon";

const DonationCard = ({
  sym,
  donationAmount,
  finalizeLoading,
  finalizeError,
  onRetry,
  campaignTitle,
  causes,
  isRecurring,
  frequency,
  numberOfDays,
  copied,
  onShare,
  onDashboard,
  onBrowse,
}) => (
  <div className="relative z-20 w-full md:w-[50%] md:max-w-[500px] h-auto md:h-[600px] bg-white rounded-[24px] px-5 sm:px-8 md:px-10 py-6 sm:py-8 md:py-10 flex flex-col items-center text-center mt-4 md:-ml-[15%] lg:-ml-[18%] md:mt-[20px] shadow-2xl">
    <div className="mt-3">{ThankyouIcon}</div>

    <h1 className="text-[24px] sm:text-[28px] md:text-[34px] font-bold text-[#383838] mt-6">
      Thank You!
    </h1>

    <p className="text-[13px] sm:text-[14px] text-[#737373] mt-2 mb-5">
      Your donation of{" "}
      {donationAmount ? (
        <span className="font-bold text-[#383838]">
          {sym}{Number(donationAmount).toFixed(2)}
        </span>
      ) : "your generous amount"}{" "}
      {finalizeLoading ? "is being finalized." : "has been processed successfully."}
    </p>

    {finalizeError ? (
      <div className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 mb-5 text-left">
        <p className="text-[13px] font-semibold text-red-700">Finalization failed</p>
        <p className="text-[12px] text-red-700/90 mt-1">{finalizeError}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg bg-[#EA3335] px-3 py-2 text-[12px] font-semibold text-white hover:bg-red-700 transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    ) : null}

    {/* Donation details */}
    <div className="w-full bg-[#F6F6F6] rounded-xl px-4 py-4 mb-5 text-left">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#AEAEAE] mb-3">
        Donation Details
      </p>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#737373]">Campaign</span>
          <span className="text-[13px] font-semibold text-[#383838]">{campaignTitle || "—"}</span>
        </div>

        {causes.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#737373]">Cause</span>
            <span className="text-[13px] font-semibold text-[#383838]">{causes.join(", ")}</span>
          </div>
        )}

        {isRecurring && frequency && (
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#737373]">Frequency</span>
            <span className="text-[13px] font-semibold text-[#383838]">{frequency}</span>
          </div>
        )}

        {isRecurring && numberOfDays > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#737373]">Duration</span>
            <span className="text-[13px] font-semibold text-[#383838]">{numberOfDays} days</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-[#E5E5E5] mt-1">
          <span className="text-[12px] text-[#737373]">Total</span>
          <span className="text-[14px] font-bold text-[#055A46]">
            {sym}{donationAmount ? Number(donationAmount).toFixed(2) : "—"}
          </span>
        </div>
      </div>
    </div>

    {/* Action buttons */}
    <div className="flex flex-col gap-2.5 w-full">
      <button
        onClick={onDashboard}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#383838] hover:bg-[#222] text-white text-[14px] font-semibold transition-colors active:scale-95 cursor-pointer"
      >
        {DashboardTabIcon}
        View Dashboard
      </button>

      <button
        onClick={onBrowse}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#EA3335] hover:bg-red-700 text-white text-[14px] font-semibold transition-colors active:scale-95 cursor-pointer"
      >
        {BrowserIcon}
        Browse Campaigns
      </button>

      <button
        onClick={onShare}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-[14px] font-medium transition-all duration-200 active:scale-95 cursor-pointer ${
          copied
            ? "bg-[#055A46] border-[#055A46] text-white"
            : "border-[#E5E5E5] hover:border-gray-400 text-[#383838]"
        }`}
      >
        {copied ? <>{CircleCheckIcon} Link Copied!</> : <>{ShareCampaignIcon} Share Campaign</>}
      </button>
    </div>
  </div>
);

export default DonationCard;
