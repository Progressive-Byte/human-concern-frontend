"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAdminCampaigns, getAdminForms } from "@/services/admin";
import FormsHeader from "./components/FormsHeader";
import FormsFilters from "./components/FormsFilters";
import FormsTable from "./components/FormsTable";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import CampaignPickerModal from "./components/CampaignPickerModal";

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

function parseItems(res) {
  return res?.data?.items || res?.data?.data?.items || res?.items || [];
}

function parsePagination(res) {
  return res?.meta?.pagination || res?.meta?.data?.pagination || res?.pagination || null;
}

export default function FormsPageClient() {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();

  const initialCampaignId = searchParams.get("campaignId") || "";

  const [filters, setFilters] = useState({
    page: "1",
    limit: "10",
    sort: "createdAt",
    order: "desc",
    q: "",
    status: "",
    campaignId: initialCampaignId,
  });

  const debouncedQ = useDebouncedValue(filters.q, 300);

  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setCampaignsLoading(true);
    (async () => {
      try {
        const res = await getAdminCampaigns({ page: "1", limit: "50", order: "desc" });
        if (!alive) return;
        setCampaigns(res?.data?.items || []);
      } catch {
        if (!alive) return;
        setCampaigns([]);
      } finally {
        if (!alive) return;
        setCampaignsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await getAdminForms({
          page: filters.page,
          limit: filters.limit,
          sort: filters.sort,
          order: filters.order,
          q: debouncedQ,
          status: filters.status,
          campaignId: filters.campaignId,
        });
        if (!alive) return;
        setItems(parseItems(res));
        setPagination(parsePagination(res));
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load forms.");
        setItems([]);
        setPagination(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [filters.page, filters.limit, filters.sort, filters.order, filters.status, filters.campaignId, debouncedQ, refreshKey]);


  const campaignLabel = useMemo(() => {
    if (!filters.campaignId) return "";
    const c = campaigns.find((x) => String(x?.id || x?._id) === String(filters.campaignId));
    return c?.name || c?.slug || "";
  }, [campaigns, filters.campaignId]);

  function setPage(next) {
    setFilters((prev) => ({ ...prev, page: String(next) }));
  }

  function openCreate() {
    setPickerOpen(true);
  }

  return (
    <main className="min-w-0 space-y-6 p-4 md:p-6">
      <FormsHeader onCreate={openCreate} />

      <CampaignPickerModal
        open={pickerOpen}
        campaigns={campaigns}
        loading={campaignsLoading}
        onClose={() => setPickerOpen(false)}
        onSelect={(id) => {
          setPickerOpen(false);
          if (!id) {
            toast.error("Select a campaign");
            return;
          }
          router.push(`/admin/forms/new?step=basics&campaignId=${encodeURIComponent(id)}`);
        }}
      />

      {filters.campaignId && campaignLabel ? (
        <div className="hc-animate-fade-up rounded-2xl border border-dashed border-red-600/20 bg-red-600/10 px-4 py-3 text-[13px] text-[#111827]">
          Filtering by campaign: <span className="font-semibold">{campaignLabel}</span>
        </div>
      ) : null}

      {error ? (
        <div className="hc-animate-fade-up rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</div>
      ) : null}

      <div className="hc-animate-fade-up rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
        <FormsFilters
          q={filters.q}
          status={filters.status}
          campaignId={filters.campaignId}
          sort={filters.sort}
          order={filters.order}
          campaigns={campaignsLoading ? [] : campaigns}
          onChangeQ={(next) => setFilters((prev) => ({ ...prev, page: "1", q: next }))}
          onChangeStatus={(next) =>
            setFilters((prev) => ({
              ...prev,
              page: "1",
              status: next,
              campaignId: String(next || "").trim() ? "" : prev.campaignId,
            }))
          }
          onChangeCampaignId={(next) =>
            setFilters((prev) => ({
              ...prev,
              page: "1",
              campaignId: next,
              status: String(next || "").trim() ? "" : prev.status,
            }))
          }
          onChangeSort={(next) => setFilters((prev) => ({ ...prev, page: "1", sort: next }))}
          onChangeOrder={(next) => setFilters((prev) => ({ ...prev, page: "1", order: next }))}
        />
      </div>

      <FormsTable
        items={items}
        loading={loading}
        pagination={pagination}
        onRefresh={() => setRefreshKey((k) => k + 1)}
        onPrevPage={() => setPage(Math.max(1, Number(pagination?.page || 1) - 1))}
        onNextPage={() => setPage(Number(pagination?.page || 1) + 1)}
      />
    </main>
  );
}
