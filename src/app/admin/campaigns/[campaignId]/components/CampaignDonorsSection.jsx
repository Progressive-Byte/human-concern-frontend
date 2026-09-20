"use client";

import { formatCurrency } from "@/utils/helpers";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/**
 * Campaign donors. The API only includes this list for admins who can read donors, so an
 * empty list can mean either "no donations" or "no permission".
 */
const CampaignDonorsSection = ({ data, loading }) => {
  const currency = data?.currency || "USD";
  const donors = Array.isArray(data?.donors) ? data.donors : [];

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-[18px] font-semibold text-[#111827]">Donors</h2>
        <p className="mt-1 text-[13px] text-[#6B7280]">
          Top donors for this campaign. Requires the <code>donors.read</code> permission.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
        {loading ? (
          <div className="space-y-3 px-5 py-4">
            <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
            <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
          </div>
        ) : donors.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-[#6B7280]">
            No donor list available (no donations yet, or you lack the donors permission).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse">
              <thead>
                <tr className="text-left text-[12px] font-medium text-[#6B7280]">
                  <th className="px-5 py-3">Donor</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Donations</th>
                  <th className="py-3 pr-4">Committed</th>
                  <th className="py-3 pr-5">Last donation</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#111827]">
                {donors.map((d) => (
                  <tr key={d.donorKey} className="border-t border-[#F3F4F6] hover:bg-[#F9FAFB]">
                    <td className="px-5 py-3 font-semibold">{d.name || "—"}</td>
                    <td className="py-3 pr-4 text-[#6B7280]">{d.email || "—"}</td>
                    <td className="py-3 pr-4">{Number(d.donations || 0).toLocaleString()}</td>
                    <td className="py-3 pr-4 font-semibold">{formatCurrency(d.committed, currency)}</td>
                    <td className="py-3 pr-5 text-[#6B7280]">{formatDate(d.lastDonationAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default CampaignDonorsSection;
