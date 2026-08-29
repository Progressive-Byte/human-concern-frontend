"use client";

const TestConnectionResult = ({ result, onClose }) => {
  if (!result) return null;

  const { loading, success, data, error } = result;

  return (
    <div className="mt-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#111827]">
            {loading ? (
              <>
                <span className="inline-flex h-4 w-4 animate-spin items-center justify-center rounded-full border-2 border-[#D1D5DB] border-t-[#111827]" />
                Running canary connection test...
              </>
            ) : success ? (
              <>
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none">
                    <path d="M4 10.5l3.5 3.5 8.5-9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Canary test passed
              </>
            ) : (
              <>
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-700">
                  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none">
                    <path d="M6 6l8 8M14 6L6 14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                </span>
                Canary test failed
              </>
            )}
          </div>

          {!loading && success && data ? (
            <div className="mt-2 space-y-1 text-[12px] text-[#6B7280]">
              {data.provider ? (
                <div>Provider: <span className="font-semibold text-[#111827]">{data.provider}</span></div>
              ) : null}
              {data.amountMinor !== undefined && data.currency ? (
                <div>
                  Canary amount: <span className="font-semibold text-[#111827]">
                    {data.currency} {Number(data.amountMinor) / 100}
                  </span> (auth-only, then voided)
                </div>
              ) : null}
              {data.transactionId || data.paymentIntentId || data.id ? (
                <div>
                  Transaction ID: <span className="font-mono text-[11px] text-[#111827]">
                    {data.transactionId || data.paymentIntentId || data.id}
                  </span>
                </div>
              ) : null}
              {data.latencyMs ? (
                <div>
                  Round-trip latency: <span className="font-semibold text-emerald-700">{data.latencyMs}ms</span>
                </div>
              ) : null}
              {data.status ? (
                <div>Status: <span className="font-semibold text-emerald-700">{data.status}</span></div>
              ) : null}
              {data.environment ? (
                <div>Environment: <span className="font-semibold text-[#111827]">{data.environment}</span></div>
              ) : null}
            </div>
          ) : null}

          {!loading && !success ? (
            <div className="mt-2 text-[12px] text-red-700">
              {error?.message || error?.error || String(error || "Unknown error during canary test.")}
              {error?.code ? <span className="ml-2 font-mono text-[11px] text-red-800">[{error.code}]</span> : null}
            </div>
          ) : null}
        </div>

        {!loading && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#6B7280] transition hover:bg-white hover:text-[#111827]"
            aria-label="Dismiss result"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default TestConnectionResult;
