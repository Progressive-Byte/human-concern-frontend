import Link from "next/link";

const CampaignCard = ({ campaign }) => {
  const pct = Math.min(
    100,
    Math.round((campaign.raised / campaign.goal) * 100)
  );

  const isCompleted = campaign.tag === "Completed";
  const isUrgent = campaign.tag === "Urgent";

  const tagClass = isCompleted
    ? "bg-white/10 text-white/50 border border-white/10"
    : isUrgent
    ? "bg-red-500/15 text-red-400 border border-red-500/25"
    : "bg-yellow-400/15 text-yellow-400 border border-yellow-400/25";

  return (
    <article
      className={`bg-[#161616] border border-white/[0.08] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] flex flex-col ${
        isCompleted ? "opacity-75" : ""
      }`}
    >
      {/* Image */}
      <div className="relative h-44 bg-[#1e1e1e] flex items-center justify-center">
        <span className="text-4xl opacity-20">📷</span>

        <span
          className={`absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded ${tagClass}`}
        >
          {campaign.tag}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-yellow-400 mb-1">
          {campaign.category}
        </p>

        <h3 className="text-base font-bold text-white tracking-tight leading-snug mb-2">
          {campaign.title}
        </h3>

        <p className="text-[13px] text-white/55 leading-relaxed mb-4 flex-1">
          {campaign.description}
        </p>

        {/* Progress */}
        <div className="mb-4">
          <div className="h-1 bg-white/[0.08] rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-yellow-400 rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[12px] text-white/55 font-medium">
              ${campaign.raised.toLocaleString()} raised
            </span>
            <span className="text-[12px] text-yellow-400 font-semibold">
              {pct}%
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-white/35 flex-1">
            👥 {campaign.donors} donors
          </span>

          {!isCompleted && (
            <span className="text-[11px] text-white/35">
              ⏳ {campaign.daysLeft} days left
            </span>
          )}

          <Link
            href={`/campaigns/${campaign.id}`}
            className="text-[12px] font-semibold text-yellow-400 px-3 py-1.5 border border-yellow-400/25 rounded-md hover:bg-yellow-400/10 transition-colors no-underline"
          >
            {isCompleted ? "View Report" : "Donate →"}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default CampaignCard;