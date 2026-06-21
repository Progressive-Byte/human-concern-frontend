import { SkeletonBlock, SkeletonRows } from "@/components/ui/Skeleton";

const HEADERS = ["Date", "Campaign", "Cause", "Amount", "Status", "Actions"];

export function DonationHistoryFallback() {
  return (
    <div className="flex-1 p-4 md:p-6 space-y-5">
      <SkeletonBlock className="h-10 rounded-xl" />
      <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[#6B7280] border-b border-dashed border-[#E5E7EB]">
                {HEADERS.map((h) => (
                  <th key={h} className="px-4 py-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <SkeletonRows rows={5} cols={6} />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
