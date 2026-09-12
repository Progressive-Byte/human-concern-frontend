"use client";

import FundBreakdownPagination from "./FundBreakdownPagination";

function formatDay(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

function Skeleton() {
  return (
    <div className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="h-6 w-52 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="h-9 w-40 animate-pulse rounded bg-[#F3F4F6]" />
      </div>
      <div className="border-t border-[#F3F4F6]" />
      <div className="p-5">
        <div className="h-12 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="mt-3 h-12 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="mt-3 h-12 animate-pulse rounded bg-[#F3F4F6]" />
      </div>
    </div>
  );
}

const FundBreakdownTable = ({
  items = [],
  loading = false,
  pagination = null,
  formatAmount,
  sort,
  order,
  onChangeSort,
  onPrevPage,
  onNextPage,
}) => {
  if (loading && (!Array.isArray(items) || items.length === 0)) return <Skeleton />;

  const rows = Array.isArray(items) ? items : [];
  const total = Number(pagination?.total || rows.length || 0);
  const amt = typeof formatAmount === "function" ? formatAmount : (v) => String(v ?? "");

  return (
    <section className="hc-animate-fade-up hc-hover-lift overflow-hidden rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="text-[18px] font-semibold text-[#111827]">All Funds ({total})</div>

        <select
          value={`${sort}:${order}`}
          onChange={(event) => {
            const [nextSort, nextOrder] = event.target.value.split(":");
            onChangeSort?.(nextSort, nextOrder);
          }}
          className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
        >
          <option value="amount:desc">Amount (high → low)</option>
          <option value="amount:asc">Amount (low → high)</option>
          <option value="fundCode:asc">Fund code (A → Z)</option>
          <option value="payments:desc">Payments (high → low)</option>
          <option value="lastPaymentAt:desc">Last payment (newest)</option>
        </select>
      </div>

      <div className="border-t border-[#F3F4F6]" />

      <div className="overflow-x-auto">
        <table className="w-full min-w-250 border-collapse text-[13px] text-[#111827]">
          <thead>
            <tr className="text-left text-[12px] font-medium text-[#6B7280]">
              <th className="px-5 py-3">Fund Code</th>
              <th className="py-3 pr-4">Currency</th>
              <th className="py-3 pr-4 text-right">Amount</th>
              <th className="py-3 pr-4 text-right">Payments</th>
              <th className="py-3 pr-4 text-right">Donations</th>
              <th className="py-3 pr-4 text-right">Donors</th>
              <th className="py-3 pr-4 text-right">Forms</th>
              <th className="py-3 pr-4 text-right">Campaigns</th>
              <th className="py-3 pr-5">Last Payment</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-10 text-center text-sm text-[#6B7280]">
                  No funds found.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={`${row?.fundCode || "unassigned"}-${row?.currency || ""}-${idx}`}
                  className="border-t border-[#F3F4F6] transition-colors duration-200 hover:bg-[#F9FAFB]"
                >
                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex w-fit rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[12px] font-semibold text-[#111827]">
                        {row?.fundCode || "Unassigned"}
                      </span>
                      {row?.causes?.length ? (
                        <span className="text-[12px] text-[#6B7280]">{row.causes.join(", ")}</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="py-4 pr-4 align-top">{row?.currency || "—"}</td>
                  <td className="py-4 pr-4 align-top text-right font-semibold">{amt(row?.amount, row?.currency)}</td>
                  <td className="py-4 pr-4 align-top text-right">{Number(row?.payments || 0)}</td>
                  <td className="py-4 pr-4 align-top text-right">{Number(row?.donationCount || 0)}</td>
                  <td className="py-4 pr-4 align-top text-right">{Number(row?.uniqueDonors || 0)}</td>
                  <td className="py-4 pr-4 align-top text-right">{Number(row?.formsCount || 0)}</td>
                  <td className="py-4 pr-4 align-top text-right">{Number(row?.campaignsCount || 0)}</td>
                  <td className="py-4 pr-5 align-top text-[#6B7280]">{formatDay(row?.lastPaymentAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <FundBreakdownPagination pagination={pagination} onPrev={onPrevPage} onNext={onNextPage} />
    </section>
  );
};

export default FundBreakdownTable;
