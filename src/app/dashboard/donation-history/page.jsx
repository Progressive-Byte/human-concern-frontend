"use client";

import { useState } from "react";
import DashboardHeader from "../components/DashboardHeader";

// Static placeholder rows — replace with API fetch later.
const rows = [
  { id: 1, date: "Feb 1, 2024",  campaign: "Ramadan Food Distribution",       cause: "Zakat",   amount: 100, status: "Completed", payment: "Visa •••• 4242" },
  { id: 2, date: "Jan 25, 2024", campaign: "Emergency Relief: Earthquake Response", cause: "Sadaqah", amount: 250, status: "Completed", payment: "Mastercard •••• 5555" },
  { id: 3, date: "Jan 15, 2024", campaign: "Orphan Sponsorship Program",      cause: "Zakat",   amount: 50,  status: "Completed", payment: "Visa •••• 4242" },
  { id: 4, date: "Jan 1, 2024",  campaign: "Clean Water Wells Project",       cause: "Sadaqah", amount: 75,  status: "Completed", payment: "PayPal" },
];

const causes = ["All Causes", "Zakat", "Sadaqah", "Emergency"];

export default function DonationHistoryPage() {
  const [search, setSearch] = useState("");
  const [cause, setCause] = useState("All Causes");

  // Local filtering until the API is wired in.
  const filtered = rows.filter((r) => {
    const matchesSearch = r.campaign.toLowerCase().includes(search.toLowerCase());
    const matchesCause = cause === "All Causes" || r.cause === cause;
    return matchesSearch && matchesCause;
  });

  return (
    <>
      <DashboardHeader
        title="Donation History"
        subtitle="View all your past donations"
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
        }
      />

      <div className="flex-1 p-6 space-y-4">
        {/* Filter row */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
          <select
            value={cause}
            onChange={(e) => setCause(e.target.value)}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            {causes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="px-4 py-3 font-medium">Cause</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">{r.date}</td>
                  <td className="px-4 py-3 text-gray-700">{r.campaign}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                      {r.cause}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-900 font-medium">${r.amount}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-green-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.payment}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" className="text-gray-400 hover:text-gray-700" title="View">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                    No donations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
