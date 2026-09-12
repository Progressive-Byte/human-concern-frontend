"use client";

const FundBreakdownSummaryCards = ({ summary, loading, formatAmount }) => {
  const totals = Array.isArray(summary?.totalsByCurrency) ? summary.totalsByCurrency : [];

  const totalValue =
    totals.length === 1
      ? formatAmount(totals[0].amount, totals[0].currency)
      : totals.length === 0
        ? formatAmount(0, "USD")
        : `${totals.length} currencies`;

  const totalSub =
    totals.length > 1
      ? totals.map((item) => formatAmount(item.amount, item.currency)).join("  ·  ")
      : totals.length === 1
        ? "Across all funds shown"
        : "No payments yet";

  const cards = [
    { label: "Funds", value: summary?.funds ?? 0, sub: "" },
    { label: "Payments", value: summary?.payments ?? 0, sub: "Succeeded only" },
    { label: "Unique donors", value: summary?.uniqueDonors ?? 0, sub: "" },
    { label: "Total received", value: totalValue, sub: totalSub },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4"
        >
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#8C8C8C]">{card.label}</p>
          <p className="mt-1 text-[22px] font-semibold text-[#171717]">{loading ? "—" : card.value}</p>
          {card.sub ? <p className="mt-0.5 text-[12px] text-[#8C8C8C]">{loading ? "" : card.sub}</p> : null}
        </div>
      ))}
    </div>
  );
};

export default FundBreakdownSummaryCards;
