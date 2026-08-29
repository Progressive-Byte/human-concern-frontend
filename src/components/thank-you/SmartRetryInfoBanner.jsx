"use client";

const SmartRetryInfoBanner = ({ className = "", onDismiss }) => {
  return (
    <div
      className={`w-full rounded-2xl border border-amber-400/50 bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-4 shadow-sm ${className}`}
      role="status"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-amber-600">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 8v4M12 16h.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-amber-800">
            Smart Retry is Active
          </p>
          <p className="text-[12px] text-amber-700/90 mt-1">
            Your bank declined this charge temporarily. We are automatically retrying your donation
            using an optimized schedule with multiple payment providers. No action is required.
          </p>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 text-amber-600 hover:text-amber-800 transition-colors p-1"
            aria-label="Dismiss"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default SmartRetryInfoBanner;
