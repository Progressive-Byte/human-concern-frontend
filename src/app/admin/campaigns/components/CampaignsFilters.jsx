"use client";

export default function CampaignsFilters({ q, status, onChangeQ, onChangeStatus }) {
  return (
    <div className="hc-animate-fade-up flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#9CA3AF]" fill="none">
            <path
              d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            value={q}
            onChange={(e) => onChangeQ(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
          />
        </div>
      </div>

      <div className="w-full md:w-[180px]">
        <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5">
          <select
            value={status}
            onChange={(e) => onChangeStatus(e.target.value)}
            className="w-full bg-transparent text-[13px] text-[#111827] outline-none"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>
    </div>
  );
}

