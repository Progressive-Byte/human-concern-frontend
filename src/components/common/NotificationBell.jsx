"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BellIcon } from "@/components/common/SvgIcon";
import useNotifications from "@/hooks/useNotifications";

const TONES = {
  dark: "text-white/75 hover:bg-white/10 hover:text-white",
  light: "border border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB]",
};

const VIEW_ALL = {
  admin: "/admin/notifications",
  donor: "/dashboard/notifications",
};

export function relativeTime(value) {
  if (!value) return "";
  const then = new Date(value).getTime();
  if (!Number.isFinite(then)) return "";
  const diff = Date.now() - then;
  if (diff < 60_000) return "just now";
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(then).toISOString().slice(0, 10);
}

/**
 * The notification bell: unread badge + a dropdown of the latest items.
 *
 * `scope` is a plain string ("admin" | "donor") so a server component can render this too.
 * The panel is portaled to the body because both sidebars live in scroll containers.
 */
const NotificationBell = ({ scope = "donor", tone = "light" }) => {
  const router = useRouter();
  const { items, unreadCount, markRead, markAllRead, refresh } = useNotifications(scope);
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const portalNode = typeof document === "undefined" ? null : document.body;

  useEffect(() => {
    if (!open) return;
    function recalcPos() {
      const rect = btnRef.current?.getBoundingClientRect?.();
      if (!rect) return;
      setMenuPos({
        top: rect.bottom + 8,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    }
    recalcPos();
    refresh();
    window.addEventListener("resize", recalcPos);
    window.addEventListener("scroll", recalcPos, true);
    return () => {
      window.removeEventListener("resize", recalcPos);
      window.removeEventListener("scroll", recalcPos, true);
    };
  }, [open, refresh]);

  useEffect(() => {
    function onPointerDown(e) {
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const viewAllHref = VIEW_ALL[scope] || VIEW_ALL.donor;

  const onOpenItem = async (item) => {
    setOpen(false);
    if (!item.read) await markRead(item.id);
    router.push(item.link || viewAllHref);
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
        className={`relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ${TONES[tone] || TONES.light}`}
      >
        <span className="[&>svg]:h-[18px] [&>svg]:w-[18px]">{BellIcon}</span>
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#EA3335] px-1 text-[11px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open && portalNode
        ? createPortal(
            <div
              ref={menuRef}
              className="hc-animate-dropdown fixed z-[200] w-[320px] overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-md"
              style={{ top: menuPos.top, right: menuPos.right }}
            >
              <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
                <span className="text-sm font-semibold text-[#111827]">Notifications</span>
                {unreadCount > 0 ? (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="cursor-pointer text-[12px] font-medium text-[#6B7280] transition-colors hover:text-[#111827]"
                  >
                    Mark all as read
                  </button>
                ) : null}
              </div>

              {items.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-[#6B7280]">Nothing yet</div>
              ) : (
                <ul className="max-h-[320px] overflow-y-auto">
                  {items.map((item) => (
                    <li key={item.id} className="border-b border-[#F3F4F6] last:border-b-0">
                      <button
                        type="button"
                        onClick={() => onOpenItem(item)}
                        className={`flex w-full cursor-pointer items-start gap-2 px-4 py-3 text-left transition-colors hover:bg-[#F9FAFB] ${
                          item.read ? "" : "bg-[#F9FAFB]"
                        }`}
                      >
                        <span
                          className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                            item.read ? "bg-transparent" : "bg-[#EA3335]"
                          }`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="truncate text-[13px] font-semibold text-[#111827]">
                              {item.title}
                            </span>
                            <span className="shrink-0 text-[11px] text-[#9CA3AF]">
                              {relativeTime(item.createdAt)}
                            </span>
                          </span>
                          {item.body ? (
                            <span className="mt-0.5 line-clamp-2 block text-[12px] text-[#6B7280]">
                              {item.body}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <Link
                href={viewAllHref}
                onClick={() => setOpen(false)}
                className="block border-t border-[#E5E7EB] px-4 py-3 text-center text-[13px] font-medium text-[#111827] transition-colors hover:bg-[#F3F4F6]"
              >
                View all
              </Link>
            </div>,
            portalNode
          )
        : null}
    </>
  );
};

export default NotificationBell;
