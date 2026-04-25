import DashboardHeader from "../components/DashboardHeader";

// Static placeholder — wire to API later.
const schedules = [
  { id: 1, title: "Ramadan Food Distribution", amount: 50,  frequency: "Weekly",  next: "Feb 15", status: "Active" },
  { id: 2, title: "Orphan Sponsorship Program", amount: 100, frequency: "Monthly", next: "Mar 1",  status: "Active" },
  { id: 3, title: "Clean Water Wells Project",  amount: 25,  frequency: "Monthly", next: "Mar 5",  status: "Paused" },
];

export default function SchedulesPage() {
  return (
    <>
      <DashboardHeader
        title="Schedules"
        subtitle="Manage your recurring donations"
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Schedule
          </button>
        }
      />

      <div className="flex-1 p-6">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Frequency</th>
                <th className="px-4 py-3 font-medium">Next Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {schedules.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">{s.title}</td>
                  <td className="px-4 py-3 text-gray-700">${s.amount}</td>
                  <td className="px-4 py-3 text-gray-700">{s.frequency}</td>
                  <td className="px-4 py-3 text-gray-700">{s.next}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs ${
                        s.status === "Active" ? "text-green-700" : "text-amber-700"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          s.status === "Active" ? "bg-green-500" : "bg-amber-500"
                        }`}
                      />
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button type="button" className="text-sm text-gray-600 hover:underline">
                      Edit
                    </button>
                    <button type="button" className="text-sm text-red-600 hover:underline">
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
