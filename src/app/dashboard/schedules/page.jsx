"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import { getUserSchedules } from "@/services/donationService";
import { SkeletonStack } from "@/components/ui/Skeleton";
import ScheduleCard from "./components/ScheduleCard";

function formatDate(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

const SchedulesPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getUserSchedules({ page: "1", limit: "50", q: "" });
        if (!alive) return;
        const data = res?.data?.data || res?.data || {};
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
        if (!alive) return;
        setItems([]);
        setError(e?.message || "Failed to load schedules.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const schedules = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    return list.map((s, idx) => {
      const scheduleId = String(s?.scheduleId || "");
      const title = String(s?.title || "").trim() || "Schedule";
      const statusKey = String(s?.status?.key || "").trim().toLowerCase();
      const statusLabel = String(s?.status?.label || "").trim() || "—";
      const frequency = String(s?.frequencyLabel || "").trim() || "—";
      const cause = String(s?.causeTag?.label || "").trim() || "—";
      const started = formatDate(s?.startedAt) || "—";
      const next = formatDate(s?.nextDonation?.date) || "—";
      const amount = Number(s?.installmentAmount ?? 0);
      const currency = String(s?.currency || "USD");
      const totalDonated = Number(s?.totalDonated ?? 0);
      return {
        id: scheduleId || String(idx),
        slug: scheduleId || String(idx),
        title,
        amount,
        currency,
        frequency,
        cause,
        started,
        next,
        totalDonated,
        statusKey,
        status: statusLabel,
      };
    });
  }, [items]);

  return (
    <>
      <DashboardHeader
        title="Recurring Schedules"
        subtitle="Manage your recurring donation schedules"
      />

      <div className="flex-1 p-4 md:p-6 space-y-4">
        {error ? (
          <div className="rounded-2xl border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</div>
        ) : null}

        {loading ? (
          <SkeletonStack count={3} blockClass="h-24 rounded-2xl" />
        ) : schedules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-5 py-12 text-center text-sm text-[#6B7280]">
            No schedules found.
          </div>
        ) : (
          schedules.map((s) => {
            const isActive = String(s.statusKey) === "active";
            const isPaused = String(s.statusKey) === "paused";
            const isCancelled = String(s.statusKey) === "cancelled";
            const isCompleted = String(s.statusKey) === "completed";
            return (
              <ScheduleCard
                key={s.id}
                s={s}
                isActive={isActive}
                isPaused={isPaused}
                isCancelled={isCancelled}
                isCompleted={isCompleted}
                onPauseResume={(newStatus) =>
                  setItems((prev) =>
                    prev.map((item) =>
                      String(item.scheduleId) === s.id
                        ? { ...item, status: { key: newStatus, label: newStatus.charAt(0).toUpperCase() + newStatus.slice(1) } }
                        : item
                    )
                  )
                }
                onCancel={() =>
                  setItems((prev) =>
                    prev.map((item) =>
                      String(item.scheduleId) === s.id
                        ? { ...item, status: { key: "cancelled", label: "Cancelled" } }
                        : item
                    )
                  )
                }
              />
            );
          })
        )}
      </div>
    </>
  );
}
export default SchedulesPage;
