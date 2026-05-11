import Row from "@/components/ui/Row";
import DonorStatusPill from "./DonorStatusPill";

function formatLocation(address) {
  const city = String(address?.city || "").trim();
  const country = String(address?.country || "").trim();
  if (city && country) return `${city}, ${country}`;
  return city || country || "—";
}

function Skeleton() {
  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="px-5 py-4">
        <div className="h-5 w-44 animate-pulse rounded bg-[#F3F4F6]" />
      </div>
      <div className="border-t border-[#F3F4F6]" />
      <div className="space-y-3 px-5 py-4">
        <div className="h-4 w-full animate-pulse rounded bg-[#F3F4F6]" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="h-4 w-3/5 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-[#F3F4F6]" />
      </div>
    </section>
  );
}

export default function DonorProfileCard({ donor, loading, onEdit }) {
  if (loading) return <Skeleton />;

  const name =
    String(donor?.name || "").trim() || String([donor?.firstName, donor?.lastName].filter(Boolean).join(" ")).trim() || "—";
  const email = String(donor?.email || "").trim() || "—";
  const phone = String(donor?.phone || "").trim() || "—";
  const org = String(donor?.organization || "").trim() || "—";
  const location = formatLocation(donor?.address);
  const donorId = String(donor?.key || donor?.donorKey || donor?.id || "").trim() || "—";
  const shortId = donorId.includes(":") ? donorId.split(":").slice(-1)[0] : donorId;

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="text-[18px] font-semibold text-[#111827]">Personal Information</div>
        <button
          type="button"
          onClick={onEdit}
          disabled={!onEdit}
          className="rounded-lg bg-[#F3F4F6] px-3 py-2 text-[12px] font-semibold text-[#111827] transition hover:bg-[#E5E7EB] disabled:opacity-60 disabled:hover:bg-[#F3F4F6]"
        >
          Edit
        </button>
      </div>
      <div className="border-t border-[#F3F4F6]" />
      <div className="space-y-3 px-5 py-4">
        <Row label="Full Name" value={name} bold />
        <Row label="Email Address" value={email} />
        <Row label="Phone Number" value={phone} />
        <Row label="Organization" value={org} />
        <Row label="Location" value={location} />
        <Row label="Donor ID" value={shortId} />
        <div className="flex items-start justify-between gap-3">
          <div className="text-[13px] font-medium text-[#6B7280]">Account Status</div>
          <div className="shrink-0">
            <DonorStatusPill status={donor?.status} />
          </div>
        </div>
      </div>
    </section>
  );
}
