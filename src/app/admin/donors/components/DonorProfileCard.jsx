import Row from "@/components/ui/Row";
import { formatDate } from "@/utils/helpers";
import DonorStatusPill from "./DonorStatusPill";

function formatLocation(address) {
  const line1 = String(address?.line1 || address?.streetName || "").trim();
  const city = String(address?.city || "").trim();
  const state = String(address?.state || "").trim();
  const postalCode = String(address?.postalCode || "").trim();
  const country = String(address?.country || "").trim();

  const cityLine = [city, state, postalCode].filter(Boolean).join(" ");
  const parts = [line1, cityLine, country].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
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

const DonorProfileCard = ({ donor, stats, loading, onEdit }) => {
  if (loading) return <Skeleton />;

  const name =
    String(donor?.name || "").trim() || String([donor?.firstName, donor?.lastName].filter(Boolean).join(" ")).trim() || "—";
  const email = String(donor?.email || "").trim() || "—";
  const phone = String(donor?.phone || "").trim() || "—";
  const org = String(donor?.organization || "").trim() || "—";
  const location = formatLocation(donor?.address);
  const country = String(donor?.address?.country || "").trim() || "—";
  const donorId = String(donor?.key || donor?.donorKey || donor?.id || "").trim() || "—";
  const shortId = donorId.includes(":") ? donorId.split(":").slice(-1)[0] : donorId;
  const donorType = String(donor?.type || donor?.donorType || "").toLowerCase();
  const typeLabel = donorType ? donorType.charAt(0).toUpperCase() + donorType.slice(1) : "—";
  const registeredAt = donor?.createdAt ? formatDate(donor.createdAt) : "—";
  const firstDonationAt = stats?.firstDonationAt ? formatDate(stats.firstDonationAt) : "—";
  const lastDonationAt = stats?.lastDonationAt ? formatDate(stats.lastDonationAt) : "—";

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
        <Row label="Country" value={country} />
        <Row label="Address" value={location} />
        <Row label="Donor Type" value={typeLabel} />
        <Row label="Donor ID" value={shortId} />
        <Row label="Registered" value={registeredAt} />
        <Row label="First Donation" value={firstDonationAt} />
        <Row label="Last Donation" value={lastDonationAt} />
        <div className="flex items-start justify-between gap-3">
          <div className="text-[13px] font-medium text-[#6B7280]">Account Status</div>
          <div className="shrink-0">
            <DonorStatusPill status={donor?.status} />
          </div>
        </div>
      </div>
    </section>
  );
};
export default DonorProfileCard;