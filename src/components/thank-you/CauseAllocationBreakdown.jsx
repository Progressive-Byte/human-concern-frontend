"use client";

const CURRENCY_SYMBOLS = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" };

const CauseAllocationBreakdown = ({ causes = [], totalAmount = 0, currency = "USD" }) => {
  const sym = CURRENCY_SYMBOLS[currency] || "$";
  const safeTotal = Number(totalAmount) || 0;

  const normalizedCauses = causes.map((c, idx) => {
    const name = c?.name || c?.causeName || c?.title || `Cause ${idx + 1}`;
    const amount = Number(c?.amount ?? c?.allocatedAmount ?? c?.value ?? 0);
    const percent = safeTotal > 0 ? Math.min(100, Math.max(0, (amount / safeTotal) * 100)) : 0;
    return { name, amount, percent };
  });

  const coveredSum = normalizedCauses.reduce((s, c) => s + c.amount, 0);
  const remainder = Math.max(0, safeTotal - coveredSum);
  if (remainder > 0.001) {
    const percent = safeTotal > 0 ? (remainder / safeTotal) * 100 : 0;
    normalizedCauses.push({ name: "Other", amount: remainder, percent });
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-semibold uppercase tracking-widest text-gray-500">
          Cause Allocation
        </h3>
        <div className="text-right">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider">Total</p>
          <p className="text-[15px] font-bold text-[#055A46]">
            {sym}{safeTotal.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {normalizedCauses.map((cause, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span
                className="text-[13px] font-semibold text-gray-800 truncate min-w-0"
                title={cause.name}
              >
                {cause.name}
              </span>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[12px] font-medium text-gray-500">
                  {cause.percent.toFixed(1)}%
                </span>
                <span className="text-[13px] font-bold text-gray-900 whitespace-nowrap">
                  {sym}{cause.amount.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
                style={{ width: `${cause.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-gray-500">Currency</span>
          <span className="text-[12px] font-semibold text-gray-700">{currency}</span>
        </div>
      </div>
    </div>
  );
};

export default CauseAllocationBreakdown;
