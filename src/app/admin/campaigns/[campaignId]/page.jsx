"use client";

import { useEffect, useMemo, useState, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import {
  archiveAdminCampaign,
  getAdminCampaignById,
  getAdminCampaignReport,
  publishAdminCampaign,
  restoreAdminCampaign,
  unpublishAdminCampaign,
} from "@/services/admin";
import StatusPill from "../components/StatusPill";
import CampaignUpsertModal from "../components/CampaignUpsertModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../components/ToastProvider";
import CampaignSummaryCards from "./components/CampaignSummaryCards";
import CampaignBreakdownsSection from "./components/CampaignBreakdownsSection";
import CampaignPublicDisplaySection from "./components/CampaignPublicDisplaySection";
import CampaignDonorsSection from "./components/CampaignDonorsSection";
import TrendChart from "@/app/admin/components/reports/TrendChart";
import FundPerformanceSection from "@/app/admin/components/reports/FundPerformanceSection";

function actionForStatus(status) {
  const s = String(status || "").toLowerCase();
  if (s === "draft") return "publish";
  if (s === "published") return "unpublish";
  if (s === "archived") return "restore";
  return "";
}

const AdminCampaignDetailsPage = ({ params }) => {
  const router = useRouter();
  const toast = useToast();
  const resolvedParams = typeof params?.then === "function" ? usePromise(params) : params;
  const campaignId = String(resolvedParams?.campaignId || "");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [editOpen, setEditOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const status = data?.status;
  const primaryAction = useMemo(() => actionForStatus(status), [status]);

  function refresh() {
    setRefreshKey((v) => v + 1);
  }

  useEffect(() => {
    if (!campaignId) return;
    let alive = true;
    setLoading(true);
    setError("");
    (async () => {
      try {
        const res = await getAdminCampaignById(campaignId);
        
        if (!alive) return;
        const campaign = res?.data?.data || res?.data?.item || res?.data?.campaign || res?.data || null;
        setData(campaign);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load campaign.");
        setData(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [campaignId, refreshKey]);

  // Report/aggregates load separately so the header renders as soon as the campaign does.
  useEffect(() => {
    if (!campaignId) return;
    let alive = true;
    setReportLoading(true);
    (async () => {
      try {
        const res = await getAdminCampaignReport(campaignId);
        if (!alive) return;
        setReport(res?.data || null);
      } catch {
        if (!alive) return;
        setReport(null);
      } finally {
        if (alive) setReportLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [campaignId, refreshKey]);

  async function runAction(action) {
    if (!campaignId) return;
    setActionLoading(true);
    try {
      if (action === "publish") await publishAdminCampaign(campaignId);
      if (action === "unpublish") await unpublishAdminCampaign(campaignId);
      if (action === "archive") await archiveAdminCampaign(campaignId);
      if (action === "restore") await restoreAdminCampaign(campaignId);

      toast.success(
        action === "publish"
          ? "Published"
          : action === "unpublish"
            ? "Unpublished"
            : action === "archive"
              ? "Archived"
              : action === "restore"
                ? "Restored"
                : "Done"
      );
      refresh();
    } catch (e) {
      toast.error(e?.message || "Action failed.");
    } finally {
      setActionLoading(false);
      setConfirmAction("");
    }
  }

  const title = data?.name || "Campaign";
  const subtitle = data?.slug ? `/${data.slug}` : "Campaign details";
  
  const forms = Array.isArray(data?.forms)
    ? data.forms
    : Array.isArray(data?.campaignForms)
      ? data.campaignForms
      : Array.isArray(data?.formsPreview)
        ? data.formsPreview
        : [];

  return (
    <main className="min-w-0 p-4 md:p-6 space-y-6">
      <div className="hc-animate-fade-up flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => router.push("/admin/campaigns")}
            className="mb-3 inline-flex items-center gap-2 rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="truncate text-[24px] font-semibold leading-tight text-[#111827]">{title}</h1>
            <StatusPill status={status} />
          </div>
          <p className="mt-1 text-[14px] text-[#6B7280]">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            Edit
          </button>

          {primaryAction ? (
            <button
              type="button"
              onClick={() => setConfirmAction(primaryAction)}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-red-700"
            >
              {primaryAction === "publish" ? "Publish" : primaryAction === "unpublish" ? "Unpublish" : "Restore"}
            </button>
          ) : null}

          {String(status || "").toLowerCase() !== "archived" ? (
            <button
              type="button"
              onClick={() => setConfirmAction("archive")}
              className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
            >
              Archive
            </button>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</div>
      ) : null}

      <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
        {loading ? (
          <div className="space-y-3">
            <div className="h-6 w-1/3 animate-pulse rounded-lg bg-[#F3F4F6]" />
            <div className="h-6 w-1/2 animate-pulse rounded-lg bg-[#F3F4F6]" />
            <div className="h-28 animate-pulse rounded-lg bg-[#F3F4F6]" />
          </div>
        ) : data ? (
          <div className="space-y-4 text-[13px] text-[#111827]">
            <div>
              <div className="text-[12px] font-medium text-[#6B7280]">Campaign ID</div>
              <div className="mt-1 break-all font-medium">{data?.id || campaignId}</div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="text-[12px] font-medium text-[#6B7280]">Name</div>
                <div className="mt-1 font-medium">{data?.name || "—"}</div>
              </div>
              <div>
                <div className="text-[12px] font-medium text-[#6B7280]">Slug</div>
                <div className="mt-1 font-medium">{data?.slug || "—"}</div>
              </div>
            </div>
            <div>
              <div className="text-[12px] font-medium text-[#6B7280]">Description</div>
              <div className="mt-1 whitespace-pre-wrap text-[#111827]">{data?.description || "—"}</div>
            </div>
            <div>
              <div className="text-[12px] font-medium text-[#6B7280]">Forms</div>
              {forms.length === 0 ? (
                <div className="mt-1 text-[#6B7280]">—</div>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {forms.map((f) => {
                    const key = f?.formId || f?.id || f?._id || f?.name || Math.random().toString(16);
                    const label = f?.name || f?.formName || "—";
                    
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center rounded-full border border-dashed border-[#E5E7EB] bg-[#F3F4F6] px-3 py-1 text-[11px] font-medium text-[#111827]"
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-[#6B7280]">Campaign not found</div>
        )}
      </section>

      {/* Report — aggregated across every form of this campaign */}
      <CampaignSummaryCards data={report} loading={reportLoading} />

      {report ? (
        <>
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TrendChart series={report.trend || []} bucket="month" />

            <div className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
              <h2 className="mb-4 text-[16px] font-semibold text-[#111827]">Campaign overview</h2>
              <dl className="grid grid-cols-1 gap-4 text-[13px] sm:grid-cols-2">
                <div>
                  <dt className="text-[12px] font-medium text-[#6B7280]">Type</dt>
                  <dd className="mt-1 font-medium">
                    {(report.campaign?.types || []).length ? report.campaign.types.join(", ") : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[12px] font-medium text-[#6B7280]">Status</dt>
                  <dd className="mt-1 font-medium">{report.campaign?.status || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[12px] font-medium text-[#6B7280]">Start</dt>
                  <dd className="mt-1 font-medium">
                    {report.campaign?.startAt ? new Date(report.campaign.startAt).toLocaleDateString() : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[12px] font-medium text-[#6B7280]">End</dt>
                  <dd className="mt-1 font-medium">
                    {report.campaign?.endAt ? new Date(report.campaign.endAt).toLocaleDateString() : "Ongoing"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[12px] font-medium text-[#6B7280]">Forms</dt>
                  <dd className="mt-1 font-medium">{Number(report.campaign?.formCount || 0)}</dd>
                </div>
                <div>
                  <dt className="text-[12px] font-medium text-[#6B7280]">Active subscriptions</dt>
                  <dd className="mt-1 font-medium">{Number(report.summary?.activeSubscriptions || 0)}</dd>
                </div>
              </dl>
            </div>
          </section>

          <FundPerformanceSection
            data={{
              currency: report.currency,
              total: report.summary?.committed || 0,
              items: report.funds || [],
            }}
            loading={reportLoading}
          />

          <CampaignBreakdownsSection data={report} loading={reportLoading} />
          <CampaignPublicDisplaySection data={report} loading={reportLoading} />
          <CampaignDonorsSection data={report} loading={reportLoading} />
        </>
      ) : null}

      <CampaignUpsertModal
        open={editOpen}
        mode="edit"
        campaignId={campaignId}
        onClose={() => setEditOpen(false)}
        onSuccess={() => refresh()}
      />

      <ConfirmDialog
        open={Boolean(confirmAction)}
        title={
          confirmAction === "publish"
            ? "Publish campaign?"
            : confirmAction === "unpublish"
              ? "Unpublish campaign?"
              : confirmAction === "archive"
                ? "Archive campaign?"
                : "Restore campaign?"
        }
        description={
          confirmAction === "publish"
            ? "This will make the campaign available as published."
            : confirmAction === "unpublish"
              ? "This will move the campaign back from published state."
              : confirmAction === "archive"
                ? "Archived campaigns are removed from active use."
                : "This will restore the campaign from archived state."
        }
        confirmText="Confirm"
        loading={actionLoading}
        onClose={() => setConfirmAction("")}
        onConfirm={() => runAction(confirmAction)}
      />
    </main>
  );
}
export default AdminCampaignDetailsPage;