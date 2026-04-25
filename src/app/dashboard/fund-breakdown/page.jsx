import DashboardHeader from "../components/DashboardHeader";

// Static placeholder — wire to API later.
const funds = [
  { label: "Zakat",            amount: 2500, percent: 58, color: "bg-gray-900" },
  { label: "Sadaqah",          amount: 1200, percent: 28, color: "bg-blue-600" },
  { label: "Emergency Relief", amount: 350,  percent: 8,  color: "bg-rose-500" },
  { label: "Fitrana",          amount: 200,  percent: 6,  color: "bg-amber-500" },
];

const total = funds.reduce((sum, f) => sum + f.amount, 0);

export default function FundBreakdownPage() {
  return (
    <>
      <DashboardHeader
        title="Fund Breakdown"
        subtitle="See where your contributions go"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Total summary */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total contributed</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">
            ${total.toLocaleString()}
          </p>
          <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
            {funds.map((f) => (
              <div
                key={f.label}
                className={`${f.color} h-full`}
                style={{ width: `${f.percent}%` }}
                title={`${f.label} ${f.percent}%`}
              />
            ))}
          </div>
        </div>

        {/* Per-cause breakdown */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">By cause</h2>
          <ul className="space-y-4">
            {funds.map((f) => (
              <li key={f.label}>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${f.color}`} />
                    <span className="text-gray-700">{f.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{f.percent}%</span>
                    <span className="font-medium text-gray-900">
                      ${f.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full ${f.color} rounded-full`}
                    style={{ width: `${f.percent}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
