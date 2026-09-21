"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminHeaderActions from "@/app/admin/components/AdminHeaderActions";
import { relativeTime } from "@/components/common/NotificationBell";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { AlertIcon } from "@/components/common/SvgIcon";
import {
  getAdminNotifications,
  getAdminNotificationsUnreadCount,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
} from "@/services/admin";

const PAGE_SIZE = 20;

function NotificationsHeader() {
  const { admin } = useAdminAuth();
  return (
    <div className="hc-animate-fade-up flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-[24px] font-semibold leading-tight text-[#111827]">Notifications</h1>
        <p className="mt-1 text-[14px] text-[#6B7280]">Donation activity and payment events from the platform</p>
      </div>

      <div className="flex items-center gap-3">
        <AdminHeaderActions admin={admin} />
      </div>
    </div>
  );
}

const AdminNotificationsPage = () => {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (nextPage) => {
    setLoading(true);
    setError("");
    try {
      const [listRes, countRes] = await Promise.all([
        getAdminNotifications({ page: nextPage, limit: PAGE_SIZE }),
        getAdminNotificationsUnreadCount(),
      ]);
      setItems(listRes?.data?.items || []);
      setTotal(Number(listRes?.meta?.pagination?.total) || 0);
      setUnread(Number(countRes?.data?.unread) || 0);
      setPage(nextPage);
    } catch (e) {
      setError(e?.message || "Failed to load notifications.");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  const onOpenItem = async (item) => {
    if (!item.read) {
      setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, read: true } : x)));
      setUnread((prev) => Math.max(0, prev - 1));
      try {
        await markAdminNotificationRead(item.id);
      } catch {
        load(page);
      }
    }
    if (item.link) router.push(item.link);
  };

  const onMarkAllRead = async () => {
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
    setUnread(0);
    try {
      await markAllAdminNotificationsRead();
    } finally {
      load(page);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="min-w-0 space-y-6 p-4 md:p-6">
      <NotificationsHeader />

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      ) : null}

      <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div>
            <h2 className="text-[18px] font-semibold text-[#111827]">All notifications</h2>
            <p className="mt-1 text-[13px] text-[#6B7280]">
              {unread > 0 ? `${unread} unread` : "You're all caught up"}
            </p>
          </div>
          <button
            type="button"
            onClick={onMarkAllRead}
            disabled={unread === 0}
            className="cursor-pointer rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Mark all as read
          </button>
        </div>
        <div className="border-t border-[#F3F4F6]" />

        {loading ? (
          <div className="space-y-3 px-5 py-4">
            <div className="h-12 animate-pulse rounded-lg bg-[#F3F4F6]" />
            <div className="h-12 animate-pulse rounded-lg bg-[#F3F4F6]" />
            <div className="h-12 animate-pulse rounded-lg bg-[#F3F4F6]" />
          </div>
        ) : items.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-[#6B7280]">No notifications yet</div>
        ) : (
          <ul>
            {items.map((item) => (
              <li key={item.id} className="border-t border-[#F3F4F6] first:border-t-0">
                <button
                  type="button"
                  onClick={() => onOpenItem(item)}
                  className={`flex w-full cursor-pointer items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-[#F9FAFB] ${
                    item.read ? "" : "bg-[#F9FAFB]"
                  }`}
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      item.read ? "bg-transparent" : "bg-[#EA3335]"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[14px] font-semibold text-[#111827]">{item.title}</span>
                      <span className="text-[12px] text-[#9CA3AF]">{relativeTime(item.createdAt)}</span>
                    </span>
                    {item.body ? (
                      <span className="mt-0.5 block text-[13px] text-[#6B7280]">{item.body}</span>
                    ) : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 ? (
          <div className="flex items-center justify-between gap-3 border-t border-[#F3F4F6] px-5 py-4">
            <div className="text-[13px] text-[#6B7280]">{`Showing page ${page} of ${totalPages}`}</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => load(page - 1)}
                disabled={page <= 1}
                className="cursor-pointer rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#111827] transition-colors duration-200 hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => load(page + 1)}
                disabled={page >= totalPages}
                className="cursor-pointer rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#111827] transition-colors duration-200 hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
};

export default AdminNotificationsPage;
