"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { relativeTime } from "@/components/common/NotificationBell";
import {
  getUserNotifications,
  getUserNotificationsUnreadCount,
  markUserNotificationRead,
  markAllUserNotificationsRead,
} from "@/services/notificationService";

const PAGE_SIZE = 20;

const NotificationsPage = () => {
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
        getUserNotifications({ page: nextPage, limit: PAGE_SIZE }),
        getUserNotificationsUnreadCount(),
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
        await markUserNotificationRead(item.id);
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
      await markAllUserNotificationsRead();
    } finally {
      load(page);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <DashboardHeader title="Notifications" subtitle="Updates about your donations and payments" />

      <div className="flex-1 p-4 md:p-6 space-y-5">
        {error ? (
          <div className="rounded-2xl border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <section className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <h2 className="text-[16px] font-bold text-[#111827]">All notifications</h2>
              <p className="mt-0.5 text-[13px] text-[#6B7280]">
                {unread > 0 ? `${unread} unread` : "You're all caught up"}
              </p>
            </div>
            <button
              type="button"
              onClick={onMarkAllRead}
              disabled={unread === 0}
              className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#111827] transition-colors hover:border-red-500/40 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Mark all as read
            </button>
          </div>

          {loading ? (
            <div className="space-y-3 px-5 pb-5">
              <div className="h-12 animate-pulse rounded-2xl bg-[#F3F4F6]" />
              <div className="h-12 animate-pulse rounded-2xl bg-[#F3F4F6]" />
              <div className="h-12 animate-pulse rounded-2xl bg-[#F3F4F6]" />
            </div>
          ) : items.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-[#6B7280]">No notifications yet</div>
          ) : (
            <ul className="px-3 pb-3">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onOpenItem(item)}
                    className={`flex w-full cursor-pointer items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-[#F9FAFB] ${
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
                        <span className="text-sm font-semibold text-[#111827]">{item.title}</span>
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
            <div className="flex items-center justify-between gap-3 border-t border-dashed border-[#E5E7EB] px-5 py-4">
              <div className="text-[13px] text-[#6B7280]">{`Showing page ${page} of ${totalPages}`}</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => load(page - 1)}
                  disabled={page <= 1}
                  className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#111827] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => load(page + 1)}
                  disabled={page >= totalPages}
                  className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#111827] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </>
  );
};

export default NotificationsPage;
