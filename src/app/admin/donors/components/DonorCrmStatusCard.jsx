import { useEffect, useState } from "react";
import Select from "@/components/ui/Select";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import { getAdminDonorCrmStatus, updateAdminDonorCrmStatus } from "@/services/admin";

const STATUS_OPTIONS = [
  { value: "not_entered", label: "Not entered" },
  { value: "entered", label: "Entered in CRM" },
  { value: "needs_review", label: "Needs review" },
];

const STATUS_STYLES = {
  not_entered: "bg-[#F3F4F6] text-[#6B7280]",
  entered: "bg-emerald-50 text-emerald-700",
  needs_review: "bg-amber-50 text-amber-700",
};

function statusLabel(value) {
  const found = STATUS_OPTIONS.find((o) => o.value === value);
  return found ? found.label : "Not entered";
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "—";
  }
}

function Skeleton() {
  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="px-5 py-4">
        <div className="h-5 w-44 animate-pulse rounded bg-[#F3F4F6]" />
      </div>
      <div className="border-t border-[#F3F4F6]" />
      <div className="space-y-3 px-5 py-4">
        <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
        <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
      </div>
    </section>
  );
}

const DonorCrmStatusCard = ({ donorKey, loading: parentLoading }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("not_entered");
  const [note, setNote] = useState("");
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    let alive = true;
    if (!donorKey) return undefined;

    async function load() {
      setLoading(true);
      try {
        const res = await getAdminDonorCrmStatus(donorKey);
        if (!alive) return;
        const doc = res?.data?.crmStatus || res?.crmStatus || null;
        setStatus(doc?.status || "not_entered");
        setNote(doc?.note || "");
        setMeta(doc || null);
      } catch (e) {
        if (alive) toast.error(e?.message || "Failed to load CRM status");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [donorKey]);

  async function handleSave() {
    if (!donorKey || saving) return;
    setSaving(true);
    try {
      const res = await updateAdminDonorCrmStatus(donorKey, { status, note });
      const doc = res?.data?.crmStatus || res?.crmStatus || null;
      setMeta(doc || null);
      setStatus(doc?.status || status);
      setNote(doc?.note || "");
      toast.success("CRM status saved");
    } catch (e) {
      toast.error(e?.message || "Failed to save CRM status");
    } finally {
      setSaving(false);
    }
  }

  if (parentLoading || loading) return <Skeleton />;

  const enteredByEmail = meta?.enteredBy?.email || "";
  const changed = String(meta?.status || "not_entered") !== String(status) || String(meta?.note || "") !== String(note || "");

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="text-[18px] font-semibold text-[#111827]">CRM Entry Status</div>
        <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${STATUS_STYLES[status] || STATUS_STYLES.not_entered}`}>
          {statusLabel(status)}
        </span>
      </div>
      <div className="border-t border-[#F3F4F6]" />

      <div className="space-y-4 px-5 py-4">
        <div>
          <div className="mb-2 text-[13px] font-medium text-[#6B7280]">Status</div>
          <Select value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        </div>

        <div>
          <div className="mb-2 text-[13px] font-medium text-[#6B7280]">Note</div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Optional note, e.g. amount mismatch vs CRM"
            className="w-full rounded-xl border border-[#E5E5E5] bg-white px-4 py-3 text-[14px] text-[#383838] outline-none transition-colors focus:border-[#EA3335]"
          />
        </div>

        <div className="rounded-xl bg-[#F9FAFB] px-4 py-3 text-[12px] text-[#6B7280]">
          <div className="flex items-center justify-between gap-3">
            <span>Entered by</span>
            <span className="truncate font-semibold text-[#111827]">{enteredByEmail || "—"}</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span>Entered at</span>
            <span className="font-semibold text-[#111827]">{formatDate(meta?.enteredAt)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !changed}
          className="w-full rounded-xl bg-[#111827] px-4 py-3 text-[13px] font-semibold text-white transition hover:bg-[#374151] disabled:opacity-60 disabled:hover:bg-[#111827]"
        >
          {saving ? "Saving..." : "Save CRM status"}
        </button>

        <p className="text-[12px] text-[#9CA3AF]">
          This is a manual record — nothing is synced to the CRM automatically.
        </p>
      </div>
    </section>
  );
};

export default DonorCrmStatusCard;
