"use client";

import { formatCurrency } from "@/utils/helpers";

function Empty({ children }) {
  return <div className="px-5 py-8 text-center text-sm text-[#6B7280]">{children}</div>;
}

function Panel({ title, subtitle, children, loading }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-[18px] font-semibold text-[#111827]">{title}</h2>
        {subtitle ? <p className="mt-1 text-[13px] text-[#6B7280]">{subtitle}</p> : null}
      </div>
      <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
        {loading ? (
          <div className="space-y-3 px-5 py-4">
            <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
            <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

/** Add-ons and forms — both are simple per-row tables. */
const CampaignBreakdownsSection = ({ data, loading }) => {
  const currency = data?.currency || "USD";
  const addons = Array.isArray(data?.addons) ? data.addons : [];
  const forms = Array.isArray(data?.forms) ? data.forms : [];

  return (
    <div className="space-y-6">
      <Panel
        title="Add-ons"
        subtitle="Add-ons selected through this campaign's forms (e.g. Qurbani regions are their own add-ons)."
        loading={loading}
      >
        {addons.length === 0 ? (
          <Empty>No add-ons were selected.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="text-left text-[12px] font-medium text-[#6B7280]">
                  <th className="px-5 py-3">Add-on</th>
                  <th className="py-3 pr-4">Selections</th>
                  <th className="py-3 pr-4">Amount collected</th>
                  <th className="py-3 pr-5">% of campaign</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#111827]">
                {addons.map((a, i) => (
                  <tr key={a.addOnId || i} className="border-t border-[#F3F4F6] hover:bg-[#F9FAFB]">
                    <td className="px-5 py-3 font-semibold">{a.name}</td>
                    <td className="py-3 pr-4">{Number(a.selections || 0).toLocaleString()}</td>
                    <td className="py-3 pr-4">{formatCurrency(a.amount, currency)}</td>
                    <td className="py-3 pr-5 text-[#6B7280]">{a.percentOfCampaign}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title="Forms" subtitle="Every form of this campaign." loading={loading}>
        {forms.length === 0 ? (
          <Empty>No donations through this campaign yet.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="text-left text-[12px] font-medium text-[#6B7280]">
                  <th className="px-5 py-3">Form</th>
                  <th className="py-3 pr-4">Donations</th>
                  <th className="py-3 pr-4">Donors</th>
                  <th className="py-3 pr-4">Total</th>
                  <th className="py-3 pr-4">One-time</th>
                  <th className="py-3 pr-5">Recurring</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#111827]">
                {forms.map((f) => (
                  <tr key={f.formId} className="border-t border-[#F3F4F6] hover:bg-[#F9FAFB]">
                    <td className="px-5 py-3 font-semibold">{f.formName}</td>
                    <td className="py-3 pr-4">{Number(f.donations || 0).toLocaleString()}</td>
                    <td className="py-3 pr-4">{Number(f.donors || 0).toLocaleString()}</td>
                    <td className="py-3 pr-4 font-semibold">{formatCurrency(f.committed, currency)}</td>
                    <td className="py-3 pr-4 text-[#6B7280]">{formatCurrency(f.oneTimeAmount, currency)}</td>
                    <td className="py-3 pr-5 text-[#6B7280]">{formatCurrency(f.recurringAmount, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
};

export default CampaignBreakdownsSection;
