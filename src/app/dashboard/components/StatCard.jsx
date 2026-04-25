/**
 * Generic metric card used on the main dashboard.
 * Props:
 *  - label: string         e.g. "Total Donated"
 *  - value: string|number  e.g. "$4,250"
 *  - hint?: string         e.g. "Lifetime contributions"
 *  - icon?: ReactNode
 */
export default function StatCard({ label, value, hint, icon }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-500">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
