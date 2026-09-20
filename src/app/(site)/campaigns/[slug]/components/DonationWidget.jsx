"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CustomDropdown from "@/components/common/CustomDropdown";
import { CircleCheckIcon, ShareCampaignIcon } from "@/components/common/SvgIcon";
import { apiRequest } from "@/services/api";
import { buildCampaignData } from "@/utils/campaignData";

const CURRENCY_SYMBOLS = {
  USD: "$", EUR: "€", GBP: "£", CAD: "CA$", AUD: "A$", NZD: "NZ$",
  SGD: "S$", HKD: "HK$", CHF: "CHF", JPY: "¥", NOK: "kr", SEK: "kr", DKK: "kr",
};

function getCurrencySymbol(code) {
  return CURRENCY_SYMBOLS[code] ?? code;
}

const DonationWidget = ({ campaign }) => {
  const router = useRouter();

  const [globalNote, setGlobalNote] = useState([]);
  const [publicSettingsLoading, setPublicSettingsLoading] = useState(false);

  useEffect(() => {
    async function fetchPublicSettings() {
      try {
        setPublicSettingsLoading(true);
        const res = await apiRequest("payment/settings", { method: "GET" });
        const data = res?.data || {};
        setGlobalNote(data?.globalNote || []);
      } catch (e) {
        console.error("Failed to fetch public settings", e);
        setGlobalNote([]);
      } finally {
        setPublicSettingsLoading(false);
      }
    }
    fetchPublicSettings();
  }, []);

  // page.jsx normalizes these before serialization:
  // campaign.suggestedAmounts     → [25, 100]  (plain numbers)
  // campaign.suggestedAmountsData → [{value, description, isDefault}]
  const suggestedAmounts     = campaign.suggestedAmounts     ?? [];
  const suggestedAmountsData = campaign.suggestedAmountsData ?? [];
  const limits               = campaign.goalsDates ?? {};

  // Build currency options and rate map from API data
  const currenciesWithRates = campaign.currenciesWithRates ?? [];
  const currencyOptions = currenciesWithRates.map(({ currency }) => ({
    value: currency,
    label: `${getCurrencySymbol(currency)} ${currency}`,
  }));
  const rateMap = Object.fromEntries(
    currenciesWithRates.map(({ currency, rate }) => [currency, parseFloat(rate) || 1])
  );

  // Public display switches. The API already withholds `raised`/`goal` when the matching
  // switch is off; these checks keep the rule explicit (and safe against an older payload).
  const display     = campaign.display || {};
  const raised      = typeof campaign.raised === "number" ? campaign.raised : null;
  const goal        = typeof campaign.goal === "number" ? campaign.goal : null;
  const hasGoal     = goal != null && goal > 0;
  const pct         = hasGoal && raised != null ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  // CRITICAL: a percentage bar would reveal roughly how much was raised, so it needs BOTH
  // switches on — hiding only the number is not enough.
  const barVisible  = display.showProgressBar !== false && display.showAmountRaised !== false && raised != null && hasGoal;
  const raisedTextVisible = display.showAmountRaised !== false && raised != null;
  const goalTextVisible   = display.showTargetAmount !== false && hasGoal;
  // Ended campaigns keep their page (history + SEO) but stop taking NEW donations.
  const ended = Boolean(campaign.ended);
  const donationsOpen = campaign.donationsOpen !== false;

  // donors may be a number (old) or an object with pagination (new)
  const donorCount = typeof campaign.donors === "object"
    ? (campaign.donors?.meta?.pagination?.total ?? 0)
    : (campaign.donors ?? 0);

  const defaultBaseAmount =
    suggestedAmountsData.find((a) => a.isDefault)?.value ??
    suggestedAmounts[0] ??
    50;

  const [selectedBaseAmount, setSelectedBaseAmount] = useState(defaultBaseAmount);
  const [customAmount,       setCustomAmount]       = useState("");
  const [showCustom,         setShowCustom]         = useState(false);
  const [currency,           setCurrency]           = useState(
    currenciesWithRates[0]?.currency ?? campaign.currency ?? "USD"
  );
  const [copied, setCopied] = useState(false);

  const rate = rateMap[currency] ?? 1;
  const sym  = getCurrencySymbol(currency);

  function toDisplay(baseAmt) {
    const converted = baseAmt * rate;
    const rounded   = Math.round(converted * 100) / 100;
    return Number.isInteger(rounded) ? rounded : rounded;
  }

  function formatDisplay(val) {
    return Number.isInteger(val) ? val.toLocaleString() : val.toFixed(2);
  }

  const finalAmount = showCustom && customAmount
    ? Number(customAmount)
    : toDisplay(selectedBaseAmount);

  const handleDonate = () => {
    if (!donationsOpen) return;
    sessionStorage.removeItem("hc_donation");
    sessionStorage.removeItem("hc_donation_done");
    sessionStorage.removeItem("hc_schedule_edit");
    sessionStorage.setItem("campaignData", JSON.stringify(buildCampaignData(campaign, globalNote)));

    const params = new URLSearchParams({ amount: String(finalAmount), currency });
    router.push(`/${campaign.slug}/1?${params}`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: campaign.name, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-[25px]">
      <div className="rounded-2xl border border-dashed border-[#BFBFBF]">
        <div className="px-5 pt-5">

          {/* Ended — the page stays live for history; new donations are closed. */}
          {ended ? (
            <div className="mb-4 rounded-xl border border-[#E5E7EB] bg-[#F5F5F5] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex rounded-full bg-[#111827] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                  Ended
                </span>
                <span className="text-[13px] font-semibold text-[#383838]">Campaign completed</span>
              </div>
              <p className="mt-1.5 text-[12px] text-[#737373]">
                This campaign has ended and is no longer accepting new donations. Thank you to everyone who gave.
              </p>
            </div>
          ) : null}

          {/* Raised / Goal — every part respects its own public display switch */}
          {barVisible ? (
            <>
              <p className="text-[28px] sm:text-[32px] md:text-[36px] font-bold text-[#383838] leading-none whitespace-nowrap overflow-hidden text-ellipsis">
                ${raised.toLocaleString()}
              </p>
              <p className="text-sm sm:text-[16px] text-[#383838] mt-3 sm:mt-4">
                raised of ${goal.toLocaleString()}
              </p>
              <div className="flex justify-end mt-1">
                <span className="text-[12px] font-semibold text-[#AEAEAE]">{pct}%</span>
              </div>
              <div className="relative h-[12px] sm:h-[15px] bg-[#DDFFB4] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#055A46] rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </>
          ) : (
            <>
              {raisedTextVisible ? (
                <p className="text-lg sm:text-[22px] font-bold text-[#383838]">
                  ${raised.toLocaleString()}{" "}
                  <span className="text-sm sm:text-[16px] font-normal">raised</span>
                </p>
              ) : null}
              {goalTextVisible ? (
                <>
                  <p className={`text-lg sm:text-[22px] font-bold text-[#383838] ${raisedTextVisible ? "mt-1" : ""}`}>
                    Goal: ${goal.toLocaleString()}
                  </p>
                  <p className="text-[13px] text-[#737373] mt-1">Fundraising in progress</p>
                </>
              ) : null}
            </>
          )}

          {/* Donors */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-[#F6F6F6] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-center">
              <p className="text-xl sm:text-2xl font-bold text-[#383838]">
                {donorCount}
              </p>
              <p className="text-[12px] sm:text-[14px] font-normal text-[#383838] mt-0.5">Donors</p>
            </div>
            <div className="bg-[#F6F6F6] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-center">
              <p className="text-xl sm:text-2xl font-bold text-[#383838]">
                {campaign.daysLeft ?? 0}
              </p>
              <p className="text-[12px] sm:text-[14px] font-normal text-[#383838] mt-0.5">Days Left</p>
            </div>
          </div>

          {/* How Your Donation Helps */}
          {suggestedAmounts.length > 0 && (
            <div className="mt-5">
              <p className="text-[16px] font-bold text-[#383838]">How Your Donation Helps</p>
              {currencyOptions.length > 1 && (
                <div className="mt-3">
                  <CustomDropdown
                    options={currencyOptions}
                    value={currency}
                    onChange={setCurrency}
                    width="w-full"
                    className="w-full rounded-2xl border border-[#CCCCCC] bg-white px-3 py-2.5 justify-between"
                  />
                </div>
              )}
              <div className="flex flex-col gap-2 mt-3">
                {suggestedAmounts.map((amt) => {
                  const displayAmt = toDisplay(amt);
                  const isSelected = selectedBaseAmount === amt && !showCustom;
                  const desc = suggestedAmountsData.find((a) => a.value === amt)?.description ?? "";
                  return (
                    <button
                      key={amt}
                      onClick={() => { setSelectedBaseAmount(amt); setCustomAmount(""); setShowCustom(false); }}
                      className={`w-full flex items-center rounded-2xl border transition-all duration-200 cursor-pointer text-left ${
                        isSelected
                          ? "bg-[#F0FDF4] border-[#055A46] shadow-[0px_0px_8px_0px_#B3FF57]"
                          : "bg-[#F5F5F5] border-transparent hover:border-[#055A4666]"
                      }`}
                    >
                      <div className="shrink-0 bg-white rounded-xl m-2 px-2 sm:px-3 py-2 min-w-[3.5rem] sm:min-w-[4.5rem] text-center">
                        <span className={`text-sm sm:text-[17px] font-bold whitespace-nowrap ${isSelected ? "text-[#055A46]" : "text-[#383838]"}`}>
                          {sym}{formatDisplay(displayAmt)}
                        </span>
                      </div>
                      <div className={`w-px h-7 shrink-0 rounded-full ${isSelected ? "bg-[#055A46]/30" : "bg-[#E5E7EB]"}`} />
                      {desc && (
                        <span className={`flex-1 text-[13px] leading-snug px-3 ${isSelected ? "text-[#055A46]" : "text-[#737373]"}`}>
                          {desc}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Other Amount */}
                <button
                  onClick={() => { setShowCustom(true); setCustomAmount(""); }}
                  className={`w-full flex items-center rounded-2xl border transition-all duration-200 cursor-pointer ${
                    showCustom
                      ? "bg-[#F0FDF4] border-[#055A46] shadow-[0px_0px_8px_0px_#B3FF57]"
                      : "bg-[#F5F5F5] border-transparent hover:border-[#055A4666]"
                  }`}
                >
                  <div className="shrink-0 bg-white rounded-xl m-2 px-3 py-2.5 min-w-[4.5rem] text-center">
                    <span className={`text-[14px] font-bold ${showCustom ? "text-[#055A46]" : "text-[#383838]"}`}>
                      Other
                    </span>
                  </div>
                  <div className={`w-px h-7 shrink-0 rounded-full ${showCustom ? "bg-[#055A46]/30" : "bg-[#E5E7EB]"}`} />
                  <span className={`flex-1 text-[13px] font-medium px-3 ${showCustom ? "text-[#055A46]" : "text-[#737373]"}`}>
                    Enter a custom amount
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Custom amount */}
        {showCustom && (
          <div className="relative mt-3 px-4">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#383838] font-semibold">{sym}</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder={`Enter amount${limits.minimumDonation ? ` (min ${sym}${formatDisplay(toDisplay(limits.minimumDonation))})` : ""}`}
              min={limits.minimumDonation ? toDisplay(limits.minimumDonation) : 1}
              max={limits.maximumDonation ? toDisplay(limits.maximumDonation) : undefined}
              autoFocus
              className={`w-full pl-8 pr-4 py-3.5 rounded-2xl border text-sm outline-none transition-colors ${
                customAmount
                  ? "border-[#055A46] bg-[#F0FDF4] text-[#055A46]"
                  : "border-[#CCCCCC] bg-white text-[#383838]"
              } focus:border-[#055A46]`}
            />
          </div>
        )}

        {limits.allowRecurringDonations && (
          <p className="text-[12px] text-[#737373] mt-3 text-center">
            Recurring donations available at checkout
          </p>
        )}

        {/* Buttons */}
        <div className="px-5 pt-5 pb-5 flex flex-col gap-2.5">
          <button
            onClick={handleDonate}
            disabled={!donationsOpen}
            aria-disabled={!donationsOpen}
            className={`w-full font-semibold py-3 rounded-xl text-[15px] transition-colors ${
              donationsOpen
                ? "cursor-pointer bg-[#EA3335] hover:bg-red-700 text-white active:scale-95"
                : "cursor-not-allowed bg-[#E5E5E5] text-[#9CA3AF]"
            }`}
          >
            {donationsOpen ? "Donate Now" : "Donations closed"}
          </button>
          <button
            onClick={handleShare}
            className={`w-full flex items-center justify-center gap-2 border font-medium py-3 rounded-xl text-[14px] transition-all duration-200 cursor-pointer ${
              copied
                ? "bg-[#055A46] border-[#055A46] text-white"
                : "border-gray-200 hover:border-gray-400 text-[#383838]"
            }`}
          >
            {copied ? (
              <>
                {CircleCheckIcon}
                Link Copied!
              </>
            ) : (
              <>
                {ShareCampaignIcon}
                Share Campaign
              </>
            )}
          </button>
        </div>

        {/* Zakat badge */}
        {campaign.zakatEligible && (
          <div className="mx-5 mb-5 flex items-start gap-2.5 bg-[#F7FFED] border border-[#38383833] rounded-2xl px-4 py-4">
            {CircleCheckIcon}
            <div>
              <p className="text-[14px] font-medium text-[#383838]">Zakat Eligible</p>
              <p className="text-[12px] text-[#383838] mt-0.5">
                This campaign is verified for Zakat contributions
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DonationWidget;
