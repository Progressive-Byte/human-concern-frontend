"use client";

export default function FormsFilters({
  q,
  status,
  campaignId,
  sort,
  order,
  campaigns = [],
  onChangeQ,
  onChangeStatus,
  onChangeCampaignId,
  onChangeSort,
  onChangeOrder,
}) {
  const campaignRows = Array.isArray(campaigns) ? campaigns : [];

  return (
    <div className="hc-animate-fade-up flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
            placeholder="Search forms..."
            className="w-full bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:flex lg:items-center">
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

        <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5">
          <select
            value={campaignId}
            onChange={(e) => onChangeCampaignId(e.target.value)}
            className="w-full bg-transparent text-[13px] text-[#111827] outline-none"
          >
            <option value="">All Campaigns</option>
            {campaignRows.map((c) => (
              <option key={c?.id || c?._id || c?.slug || c?.name} value={c?.id || c?._id || ""}>
                {c?.name || c?.slug || "—"}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5">
          <select
            value={sort}
            onChange={(e) => onChangeSort(e.target.value)}
            className="w-full bg-transparent text-[13px] text-[#111827] outline-none"
          >
            <option value="createdAt">Sort: Created</option>
            <option value="name">Sort: Name</option>
            <option value="status">Sort: Status</option>
          </select>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5">
          <select
            value={order}
            onChange={(e) => onChangeOrder(e.target.value)}
            className="w-full bg-transparent text-[13px] text-[#111827] outline-none"
          >
            <option value="desc">Order: Desc</option>
            <option value="asc">Order: Asc</option>
          </select>
        </div>
      </div>
    </div>
  );
}

