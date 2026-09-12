"use client";

function formatDay(value) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toISOString().slice(0, 10);
}

const HEAD_CLASS = "px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-[#8C8C8C]";
const CELL_CLASS = "px-4 py-3 text-[13px] text-[#383838]";

const FundBreakdownTable = ({
  items = [],
  loading,
  pagination,
  formatAmount,
  sort,
  order,
  onChangeSort,
  onPrevPage,
  onNextPage,
}) => {
  const currentPage = Number(pagination?.page || 1);
  const totalPages = Number(pagination?.totalPages || 1);
  const total = Number(pagination?.total || 0);

  return (
    <div className="hc-animate-fade-up hc-hover-lift overflow-hidden rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1F1F1] px-4 py-3">
        <p className="text-[13px] font-semibold text-[#171717]">By fund code</p>
        <select
          value={`${sort}:${order}`}
          onChange={(event) => {
            const [nextSort, nextOrder] = event.target.value.split(":");
            onChangeSort(nextSort, nextOrder);
          }}
          className="cursor-pointer rounded-xl border border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] text-[#383838] outline-none focus:border-[#171717]/30"
        >
          <option value="amount:desc">Amount (high → low)</option>
          <option value="amount:asc">Amount (low → high)</option>
          <option value="fundCode:asc">Fund code (A → Z)</option>
          <option value="payments:desc">Payments (high → low)</option>
          <option value="lastPaymentAt:desc">Last payment (newest)</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-[#F1F1F1] bg-[#FAFAFA]">
              <th className={HEAD_CLASS}>Fund code</th>
              <th className={HEAD_CLASS}>Currency</th>
              <th className={`${HEAD_CLASS} text-right`}>Amount</th>
              <th className={`${HEAD_CLASS} text-right`}>Payments</th>
              <th className={`${HEAD_CLASS} text-right`}>Donations</th>
              <th className={`${HEAD_CLASS} text-right`}>Donors</th>
              <th className={`${HEAD_CLASS} text-right`}>Forms</th>
              <th className={`${HEAD_CLASS} text-right`}>Campaigns</th>
              <th className={HEAD_CLASS}>Last payment</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-[13px] text-[#8C8C8C]">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-[13px] text-[#8C8C8C]">
                  No funds match these filters.
                </td>
              </tr>
            ) : (
              items.map((row, index) => (
                <tr
                  key={`${row.fundCode}-${row.currency}-${index}`}
                  className="border-b border-[#F6F6F6] last:border-0 hover:bg-[#FCFCFC]"
                >
                  <td className={CELL_CLASS}>
                    <div className="font-medium text-[#171717]">{row.fundCode || "Unassigned"}</div>
                    {row.causes.length > 0 ? (
                      <div className="mt-0.5 text-[11px] text-[#8C8C8C]">{row.causes.join(", ")}</div>
                    ) : null}
                  </td>
                  <td className={CELL_CLASS}>{row.currency || "—"}</td>
                  <td className={`${CELL_CLASS} text-right font-semibold text-[#171717]`}>
                    {formatAmount(row.amount, row.currency)}
                  </td>
                  <td className={`${CELL_CLASS} text-right`}>{row.payments}</td>
                  <td className={`${CELL_CLASS} text-right`}>{row.donationCount}</td>
                  <td className={`${CELL_CLASS} text-right`}>{row.uniqueDonors}</td>
                  <td className={`${CELL_CLASS} text-right`}>{row.formsCount}</td>
                  <td className={`${CELL_CLASS} text-right`}>{row.campaignsCount}</td>
                  <td className={CELL_CLASS}>{formatDay(row.lastPaymentAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#F1F1F1] px-4 py-3">
        <p className="text-[12px] text-[#8C8C8C]">
          {total} {total === 1 ? "fund" : "funds"}
          {totalPages > 1 ? ` · page ${currentPage} of ${totalPages}` : ""}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={currentPage <= 1}
            className="cursor-pointer rounded-xl border border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] font-medium text-[#383838] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={onNextPage}
            disabled={currentPage >= totalPages}
            className="cursor-pointer rounded-xl border border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] font-medium text-[#383838] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default FundBreakdownTable;
