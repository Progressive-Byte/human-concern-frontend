"use client";

const FailoverBanner = ({ className = "", providerFallbackPath = "" }) => {
  return (
    <div
      className={`w-full rounded-2xl border border-sky-400/50 bg-gradient-to-r from-sky-50 to-cyan-50 px-5 py-4 shadow-sm ${className}`}
      role="status"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-sky-600">
            <path
              d="M5 12l4 4L19 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-sky-800">
            We switched to your backup provider to process this donation
          </p>
          <p className="text-[12px] text-sky-700/90 mt-1">
            Your primary payment provider was temporarily unavailable. We automatically routed
            your donation through a secondary provider to ensure it went through successfully.
            {providerFallbackPath ? (
              <span className="block mt-1 text-[11px] text-sky-600/80">
                Route: {providerFallbackPath}
              </span>
            ) : null}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FailoverBanner;
