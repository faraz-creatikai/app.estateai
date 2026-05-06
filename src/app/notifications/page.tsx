"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getFilteredNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/store/notifications/notifications";
import { Notification } from "@/store/notifications/notifications.interface";
import { getTypeConfig, getTypeLink } from "@/store/notifications/notifications.utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Pagination {
  total: number;
  page: number;
  limit: number;
}

type FilterMode = "all" | "unread";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LIMIT = 15;

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return "This Week";
  if (diffDays < 30) return "This Month";
  return "Earlier";
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3.5 px-5 py-4 animate-pulse">
      <div className="shrink-0 w-9 h-9 rounded-xl bg-[var(--color-primary-lighter)]" />
      <div className="flex-1 space-y-2 pt-0.5">
        <div className="flex justify-between gap-4">
          <div className="h-3 w-2/5 rounded-full bg-[var(--color-primary-lighter)]" />
          <div className="h-3 w-12 rounded-full bg-[var(--color-muted)]" />
        </div>
        <div className="h-2.5 w-4/5 rounded-full bg-[var(--color-muted)]" />
        <div className="h-2.5 w-1/3 rounded-full bg-[var(--color-muted)]/60" />
      </div>
    </div>
  );
}

// ─── Date Group Label ─────────────────────────────────────────────────────────

function DateGroupLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-2.5">
      <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--color-gray)] select-none">
        {label}
      </span>
      <div className="flex-1 h-px bg-[var(--color-muted)]" />
    </div>
  );
}

// ─── Notification Card ────────────────────────────────────────────────────────

function NotificationCard({
  notification,
  onMarkRead,
  onNavigate,
  isLast,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onNavigate: (n: Notification) => void;
  isLast: boolean;
}) {
  const cfg  = getTypeConfig(notification.type);
  const link = getTypeLink(notification.type, notification.entityId);
  const isUnread = !notification.isRead;

  return (
    <div
      onClick={() => onNavigate(notification)}
      className={`
        group relative flex items-start gap-3.5 px-5 py-4
        transition-all duration-150
        ${isUnread
          ? "bg-[var(--color-primary-lighter)]/40 hover:bg-[var(--color-primary-lighter)]/70"
          : "bg-transparent hover:bg-gray-50/70"
        }
        ${!isLast ? "border-b border-[var(--color-muted)]/50" : ""}
        ${link ? "cursor-pointer" : "cursor-default"}
      `}
    >
      {/* Left unread accent bar */}
      {isUnread && (
        <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-[var(--color-primary)]" />
      )}

      {/* Icon container */}
      <div
        className={`
          shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm
          ${isUnread ? cfg.bg : "bg-gray-100"}
          ${isUnread ? "text-[var(--color-primary)]" : "text-gray-400"}
          transition-colors duration-150
        `}
      >
        {typeof cfg.icon === "string" ? cfg.icon : <cfg.icon />}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-snug truncate max-w-[80%] ${isUnread ? "font-semibold text-gray-900" : "font-medium text-gray-600"}`}>
            {notification.title}
          </p>
          <span className="shrink-0 text-[10px] text-[var(--color-gray)] font-medium mt-0.5 tabular-nums">
            {timeAgo(notification.createdAt)}
          </span>
        </div>

        <p className={`text-xs mt-0.5 leading-relaxed line-clamp-2 ${isUnread ? "text-gray-600" : "text-gray-400"}`}>
          {notification.message}
        </p>

        <div className="flex items-center justify-between mt-2 gap-2">
          {/* Entity + metadata badges */}
          <div className="flex items-center flex-wrap gap-1.5">
            <span className={`
              inline-flex items-center px-1.5 py-0.5 rounded-md
              text-[10px] font-semibold uppercase tracking-wide
              ${isUnread
                ? "bg-[var(--color-primary-lighter)] text-[var(--color-primary-dark)] border border-[var(--color-primary-light)]"
                : "bg-gray-100 text-gray-400 border border-gray-200"
              }
            `}>
              {notification.entityType}
            </span>

            {Object.entries(notification.metadata).slice(0, 2).map(([k, v]) => (
              <span
                key={k}
                className="inline-flex items-center px-1.5 py-0.5 rounded-md
                  text-[10px] font-medium bg-gray-100 text-gray-500 border border-gray-200"
              >
                {k}: {v}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {link && (
              <span className="text-[10px] text-[var(--color-primary)] font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                View →
              </span>
            )}
            {isUnread && (
              <button
                onClick={(e) => { e.stopPropagation(); onMarkRead(notification.id); }}
                className="
                  opacity-0 group-hover:opacity-100 transition-all duration-150
                  inline-flex items-center gap-1 px-2 py-0.5 rounded-md
                  text-[10px] font-semibold
                  text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]
                  bg-white hover:bg-[var(--color-primary-lighter)]
                  border border-[var(--color-primary-light)]
                "
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Read
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination]       = useState<Pagination>({ total: 0, page: 1, limit: LIMIT });
  const [filter, setFilter]               = useState<FilterMode>("all");
  const [loading, setLoading]             = useState(true);
  const [markingAll, setMarkingAll]       = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const totalPages  = Math.ceil(pagination.total / LIMIT);

  // Group notifications by date
  const groupedNotifications = notifications.reduce<Record<string, Notification[]>>((acc, n) => {
    const group = getDateGroup(n.createdAt);
    if (!acc[group]) acc[group] = [];
    acc[group].push(n);
    return acc;
  }, {});

  const GROUP_ORDER = ["Today", "Yesterday", "This Week", "This Month", "Earlier"];

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchNotifications = useCallback(async (page: number, mode: FilterMode) => {
    setLoading(true);
    const params = new URLSearchParams({
      page:  String(page),
      limit: String(LIMIT),
      ...(mode === "unread" && { unreadOnly: "true" }),
    }).toString();

    const res = await getFilteredNotifications(params);
    if (res?.success) {
      setNotifications(res.data);
      setPagination(res.pagination);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications(1, filter);
  }, [filter, fetchNotifications]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleMarkRead = async (id: string) => {
    const res = await markNotificationRead(id);
    if (res?.success)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    const res = await markAllNotificationsRead();
    if (res?.success)
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setMarkingAll(false);
  };

  const handlePageChange = (newPage: number) => {
    fetchNotifications(newPage, filter);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) {
      markNotificationRead(n.id);
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
      );
    }
    const link = getTypeLink(n.type, n.entityId);
    if (link) router.push(link);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen ">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">

        {/* ── Page Header ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer border border-[var(--color-muted)]
              hover:border-[var(--color-primary-light)] hover:bg-[var(--color-primary)]/50
              text-[var(--color-primary-light)] hover:text-[var(--color-primary-lighter)] bg-[var(--color-primary)]
              transition-all duration-150"
            aria-label="Go back"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>

          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Notifications</h1>
            <p className="text-xs text-[var(--color-gray)] mt-0.5">
              {filter === "unread"
                ? `${pagination.total} unread`
                : `${pagination.total} total`}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="flex items-center cursor-pointer gap-1.5 px-3 py-1.5 rounded-lg
                text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-lighter)]
                bg-white border border-[var(--color-primary-light)]
                hover:bg-[var(--color-primary)]
                transition-all duration-150 disabled:opacity-50"
            >
              {markingAll ? (
                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
              ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
              Mark all read
            </button>
          )}
        </div>

        {/* ── Filter Tabs ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 mb-4 p-1 bg-white rounded-xl border border-[var(--color-muted)] w-fit">
          {(["all", "unread"] as FilterMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`
                relative px-4 py-1.5 rounded-lg text-xs font-semibold capitalize
                transition-all duration-150
                ${filter === mode
                  ? "bg-[var(--color-primary)] text-white shadow-sm"
                  : "text-[var(--color-gray)] hover:text-gray-700 hover:bg-gray-50"
                }
              `}
            >
              {mode === "all" ? "All" : "Unread"}
              {mode === "unread" && unreadCount > 0 && filter !== "unread" && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-bold bg-[var(--color-primary)] text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Notification Feed ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[var(--color-muted)] overflow-hidden shadow-sm">
          {loading ? (
            <div className="divide-y divide-[var(--color-muted)]/50">
              {Array.from({ length: 5 }).map((_, i) => <NotificationSkeleton key={i} />)}
            </div>

          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-lighter)] flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary)]">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0M9 8h.01" />
                </svg>
              </div>
              <p className="font-semibold text-gray-800 text-sm">
                {filter === "unread" ? "You're all caught up!" : "No notifications yet"}
              </p>
              <p className="text-xs text-[var(--color-gray)] mt-1 max-w-[220px] leading-relaxed">
                {filter === "unread"
                  ? "All notifications have been read."
                  : "When something happens, you'll see it here."}
              </p>
              {filter === "unread" && (
                <button
                  onClick={() => setFilter("all")}
                  className="mt-4 text-xs font-semibold text-[var(--color-primary)] hover:underline"
                >
                  View all notifications
                </button>
              )}
            </div>

          ) : (
            <div>
              {GROUP_ORDER.filter((g) => groupedNotifications[g]?.length > 0).map((group, groupIdx) => {
                const items = groupedNotifications[group];
                return (
                  <div key={group}>
                    {/* Only show separator line above groups after the first */}
                    {groupIdx > 0 && <div className="h-px bg-[var(--color-muted)]/60 mx-5" />}
                    <DateGroupLabel label={group} />
                    {items.map((n, i) => (
                      <NotificationCard
                        key={n.id}
                        notification={n}
                        onMarkRead={handleMarkRead}
                        onNavigate={handleNotificationClick}
                        isLast={i === items.length - 1}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Pagination ────────────────────────────────────────────────── */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between gap-2 mt-5">
            <button
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold
                bg-white border border-[var(--color-muted)]
                text-[var(--color-gray)] hover:text-[var(--color-primary)]
                hover:border-[var(--color-primary-light)] hover:bg-[var(--color-primary-lighter)]
                disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - pagination.page) <= 1)
                .reduce<(number | "…")[]>((acc, p, i, arr) => {
                  if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-xs text-[var(--color-gray)]">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p as number)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-150
                        ${pagination.page === p
                          ? "bg-[var(--color-primary)] text-white shadow-sm"
                          : "text-[var(--color-gray)] hover:bg-[var(--color-primary-lighter)] hover:text-[var(--color-primary)] bg-white border border-[var(--color-muted)]"
                        }`}
                    >
                      {p}
                    </button>
                  )
                )}
            </div>

            <button
              disabled={pagination.page === totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold
                bg-white border border-[var(--color-muted)]
                text-[var(--color-gray)] hover:text-[var(--color-primary)]
                hover:border-[var(--color-primary-light)] hover:bg-[var(--color-primary-lighter)]
                disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
            >
              Next
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        )}

        {/* ── Footer count ──────────────────────────────────────────────── */}
        {!loading && notifications.length > 0 && (
          <p className="text-center text-[11px] text-[var(--color-gray)] mt-4 pb-2">
            Showing {notifications.length} of {pagination.total} notifications
          </p>
        )}

      </div>
    </div>
  );
}