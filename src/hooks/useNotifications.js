"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getAdminNotifications,
  getAdminNotificationsUnreadCount,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
} from "@/services/admin";
import {
  getUserNotifications,
  getUserNotificationsUnreadCount,
  markUserNotificationRead,
  markAllUserNotificationsRead,
} from "@/services/notificationService";

const POLL_MS = 60_000;

function apiFor(scope) {
  if (scope === "admin") {
    return {
      list: getAdminNotifications,
      unread: getAdminNotificationsUnreadCount,
      markRead: markAdminNotificationRead,
      markAll: markAllAdminNotificationsRead,
    };
  }
  return {
    list: getUserNotifications,
    unread: getUserNotificationsUnreadCount,
    markRead: markUserNotificationRead,
    markAll: markAllUserNotificationsRead,
  };
}

/**
 * In-app notifications for one portal (`scope` is "admin" or "donor").
 *
 * Fails quietly on purpose: the bell lives in the app chrome and a failed request
 * must never break the page around it.
 */
export default function useNotifications(scope, { limit = 5 } = {}) {
  const api = useMemo(() => apiFor(scope), [scope]);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        api.list({ page: 1, limit }),
        api.unread(),
      ]);
      if (!mountedRef.current) return;
      setItems(listRes?.data?.items || []);
      setUnreadCount(Number(countRes?.data?.unread) || 0);
    } catch {
      // leave the last known state in place
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [api, limit]);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    const timer = setInterval(async () => {
      try {
        const countRes = await api.unread();
        if (!mountedRef.current) return;
        setUnreadCount(Number(countRes?.data?.unread) || 0);
      } catch {
        // ignore
      }
    }, POLL_MS);
    return () => {
      mountedRef.current = false;
      clearInterval(timer);
    };
  }, [api, refresh]);

  const markRead = useCallback(
    async (notificationId) => {
      setItems((prev) =>
        prev.map((item) => (item.id === notificationId ? { ...item, read: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      try {
        await api.markRead(notificationId);
      } catch {
        await refresh();
      }
    },
    [api, refresh]
  );

  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
    try {
      await api.markAll();
    } finally {
      await refresh();
    }
  }, [api, refresh]);

  return { items, unreadCount, loading, markRead, markAllRead, refresh };
}
