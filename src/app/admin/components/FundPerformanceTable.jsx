import ProgressBar from "./ProgressBar";
import { formatCurrency } from "@/utils/helpers";

export default function FundPerformanceTable({ items = [], currency = "USD" }) {
  const rows = Array.isArray(items) ? items : [];

  return (
    <div className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <div className="mb-4">
        <h2 className="text-[16px] font-semibold text-[#111827]">Fund Performance</h2>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E5E7EB] p-8 text-center text-sm text-[#6B7280]">
          No fund performance data available
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full border-collapse">
            <thead>
              <tr className="text-left text-[12px] font-medium text-[#6B7280]">
                <th className="py-3 pr-4">Fund</th>
                <th className="py-3 pr-4">Committed</th>
                <th className="py-3 pr-4">Completed</th>
                <th className="py-3 pr-4">Donors</th>
                <th className="py-3">Progress</th>
              </tr>
            </thead>
            <tbody className="text-[13px] text-[#111827]">
              {rows.map((item) => (
                <tr
                  key={item?.fundKey || item?.fundCode || item?.fundCause}
                  className="border-t border-[#F3F4F6] transition-colors duration-200 hover:bg-[#F9FAFB]"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item?.fundCause || "—"}</span>
                      {item?.fundCode ? (
                        <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[11px] text-[#6B7280]">
                          {item.fundCode}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="py-3 pr-4">{formatCurrency(item?.committedAmount || 0, currency)}</td>
                  <td className="py-3 pr-4">{formatCurrency(item?.completedAmount || 0, currency)}</td>
                  <td className="py-3 pr-4">{Number(item?.donorsCount || 0).toLocaleString()}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-[140px]">
                        <ProgressBar value={item?.progressPercent || 0} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
