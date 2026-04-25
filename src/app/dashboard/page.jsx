import DashboardHeader from "./components/DashboardHeader";
import StatCard from "./components/StatCard";

// ---------------------------------------------------------------------------
// Static placeholder data — will be replaced by API responses later.
// Keep the shape; child components below already consume these objects.
// ---------------------------------------------------------------------------
const stats = [
  { label: "Total Donated", value: "$4,250", hint: "Lifetime contributions" },
  { label: "Active Schedules", value: "3", hint: "Recurring donations" },
  { label: "Next Scheduled Donation Payment", value: "$50", hint: "Feb 15" },
];

const recentDonations = [
  { id: 1, title: "Ramadan Food Distribution", date: "Feb 1, 2024", amount: 100, cause: "Zakat" },
  { id: 2, title: "Emergency Relief: Earthquake Response", date: "Jan 25, 2024", amount: 250, cause: "Sadaqah" },
  { id: 3, title: "Orphan Sponsorship Program", date: "Jan 15, 2024", amount: 50, cause: "Zakat" },
];

const fundBreakdown = [
  { label: "Zakat", amount: 2500, percent: 75 },
  { label: "Sadaqah", amount: 1200, percent: 35 },
  { label: "Emergency Relief", amount: 350, percent: 12 },
  { label: "Fitrana", amount: 200, percent: 8 },
];

const activeSchedules = [
  { id: 1, title: "Ramadan Food Distribution", amount: 50, frequency: "Weekly", next: "Feb 15" },
  { id: 2, title: "Orphan Sponsorship Program", amount: 100, frequency: "Monthly", next: "Mar 1" },
];

// ---------------------------------------------------------------------------

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader />

      <div className="flex-1 p-6 space-y-6">
        {/* Stat cards */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </section>

        {/* Recent donations + fund breakdown */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Recent Donations</h2>
              <a href="/dashboard/donation-history" className="text-sm text-gray-600 hover:underline">
                View All →
              </a>
            </div>
            <ul className="divide-y divide-gray-100">
              {recentDonations.map((d) => (
                <li key={d.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-500">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{d.title}</p>
                      <p className="text-xs text-gray-500">{d.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">${d.amount}</p>
                    <span className="inline-block mt-0.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {d.cause}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Fund Breakdown</h2>
              <a href="/dashboard/fund-breakdown" className="text-sm text-gray-600 hover:underline">
                Details
              </a>
            </div>
            <ul className="space-y-3">
              {fundBreakdown.map((f) => (
                <li key={f.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{f.label}</span>
                    <span className="text-gray-900 font-medium">${f.amount.toLocaleString()}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-gray-900 rounded-full"
                      style={{ width: `${f.percent}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Active schedules */}
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Active Schedules</h2>
            <a href="/dashboard/schedules" className="text-sm text-gray-600 hover:underline">
              Manage All →
            </a>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {activeSchedules.map((s) => (
              <div key={s.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Active
                  </span>
                  <span className="text-xs text-gray-500">{s.frequency}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{s.title}</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">${s.amount}</p>
                <p className="mt-1 text-xs text-gray-500">Next: {s.next}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
