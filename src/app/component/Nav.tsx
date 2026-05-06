"use client";
import { IoMdNotificationsOutline } from "react-icons/io";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { CiLogout } from "react-icons/ci";
import { FaPlus } from "react-icons/fa";
import { LuKey } from "react-icons/lu";
import { IoPersonOutline } from "react-icons/io5";
import { useEffect, useRef, useState, useCallback } from "react";
import PopUps from "./PopUps";
import { useRouter } from "next/navigation";
import ProtectedRoute from "./ProtectedRoutes";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useThemeCustom } from "@/context/ThemeContext";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/store/notifications/notifications";
import { getTypeIcon, getTypeLink } from "@/store/notifications/notifications.utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  entityId: string;
  entityType: string;
  receiverId: string;
  senderId: string;
  isRead: boolean;
  metadata: Record<string, string>;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Notification Row ─────────────────────────────────────────────────────────

function NotificationRow({
  n,
  onMarkRead,
  onClick,
  RenderIcon,
}: {
  n: Notification;
  onMarkRead: (id: string, e: React.MouseEvent) => void;
  onClick: (n: Notification) => void;
  RenderIcon: React.FC<{ type: string }>;
}) {
  const link = getTypeLink(n.type, n.entityId);
  const isUnread = !n.isRead;

  return (
    <div
      onClick={() => onClick(n)}
      className={`
        group relative flex items-start gap-2.5 px-4 py-3 pl-5
        border-b border-gray-50
        transition-colors duration-100
        ${link ? "cursor-pointer" : "cursor-default"}
        ${isUnread ? "bg-[var(--color-primary-lighter)]/20 hover:bg-[var(--color-primary-lighter)]/40" : "bg-white hover:bg-gray-50/80"}
      `}
    >
      {/* Left accent bar for unread */}
      {isUnread && (
        <span className="absolute left-0 top-2.5 bottom-2.5 w-0.5 rounded-r bg-[var(--color-primary)]" />
      )}

      {/* Icon */}
      <div className={`
        shrink-0 w-8 h-8 rounded-[9px] flex items-center justify-center text-[13px]
        transition-colors duration-100
        ${isUnread
          ? "bg-[var(--color-primary-lighter)] text-[var(--color-primary)]"
          : "bg-gray-100 text-gray-300"
        }
      `}>
        <RenderIcon type={n.type} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-xs leading-snug truncate flex-1 min-w-0
            ${isUnread ? "font-semibold text-gray-900" : "font-medium text-gray-400"}`}>
            {n.title}
          </p>
          <span className={`text-[10px] shrink-0 font-medium tabular-nums
            ${isUnread ? "text-[var(--color-gray)]" : "text-gray-300"}`}>
            {timeAgo(n.createdAt)}
          </span>
        </div>

        <p className={`text-[11px] mt-0.5 leading-relaxed line-clamp-2
          ${isUnread ? "text-gray-500" : "text-gray-300"}`}>
          {n.message}
        </p>

        <div className="flex items-center justify-between mt-1.5">
          {/* Entity tag */}
          <span className={`
            inline-flex items-center px-1.5 py-0.5 rounded-[4px]
            text-[9px] font-bold uppercase tracking-wider
            ${isUnread
              ? "bg-[var(--color-primary-lighter)] text-[var(--color-primary-dark)] border border-[var(--color-primary-light)]"
              : "bg-gray-100 text-gray-300 border border-gray-200"
            }
          `}>
            {n.entityType}
          </span>

          {/* Hover hint + mark-read */}
          <div className="flex items-center gap-2">
            {link && (
              <span className="text-[10px] text-[var(--color-primary)] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                View →
              </span>
            )}
            {isUnread && (
              <button
                onClick={(e) => onMarkRead(n.id, e)}
                title="Mark as read"
                className="opacity-0 group-hover:opacity-100 transition-all duration-100
                  w-5 h-5 flex items-center justify-center rounded-full
                  border border-[var(--color-primary-light)] bg-white
                  text-[var(--color-primary)] hover:bg-[var(--color-primary-lighter)]"
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-start gap-2.5 px-4 py-3 pl-5 animate-pulse border-b border-gray-50">
      <div className="w-8 h-8 rounded-[9px] bg-[var(--color-primary-lighter)] shrink-0" />
      <div className="flex-1 space-y-1.5 pt-0.5">
        <div className="flex justify-between gap-4">
          <div className="h-2.5 w-2/5 rounded-full bg-[var(--color-primary-lighter)]" />
          <div className="h-2.5 w-10 rounded-full bg-gray-100" />
        </div>
        <div className="h-2 w-4/5 rounded-full bg-gray-100" />
        <div className="h-2 w-1/4 rounded-full bg-gray-100" />
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState<
    "notifications" | "quickAdd" | "adminMail" | null
  >(null);
  const router = useRouter();
  const { admin, logout } = useAuth();

  const notificationsRef = useRef<HTMLLIElement>(null);
  const quickAddRef      = useRef<HTMLLIElement>(null);
  const adminMailRef     = useRef<HTMLLIElement>(null);
  const { dark, toggleTheme } = useThemeCustom();

  // ── Notification state ──────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notiLoading, setNotiLoading]     = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const topFive     = notifications.filter((n) => !n.isRead).slice(0, 5);

  const fetchNotifications = useCallback(async () => {
    setNotiLoading(true);
    const res = await getMyNotifications();
    if (res?.success) setNotifications(res.data);
    setNotiLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      const res = await getMyNotifications();
      if (res?.success) setNotifications(res.data);
    })();
  }, []);

  useEffect(() => {
    if (openMenu === "notifications") fetchNotifications();
  }, [openMenu, fetchNotifications]);

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await markNotificationRead(id);
    if (res?.success)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
  };

  const handleMarkAllRead = async () => {
    const res = await markAllNotificationsRead();
    if (res?.success)
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) {
      markNotificationRead(n.id);
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
      );
    }
    const link = getTypeLink(n.type, n.entityId);
    setOpenMenu(null);
    if (link) router.push(link);
  };

  // ── Quick adds ──────────────────────────────────────────────────────────────
  const quickadds = [
    { name: "Add References",        link: "/masters/references/add" },
    { name: "Add City",              link: "/masters/city/add" },
    { name: "Add Location",          link: "/masters/locations/add" },
    { name: "Add Functional Area",   link: "/masters/functional-areas/add" },
    { name: "Add Industry",          link: "/masters/industries/add" },
    { name: "Add Campaign",          link: "/masters/campaign/add" },
    { name: "Add Income",            link: "/masters/incomes/add" },
    { name: "Add Expenses",          link: "/masters/expenses/add" },
    { name: "Add Status Type",       link: "/masters/status-type/add" },
    { name: "Add Mail Template",     link: "/masters/mail-templates/add" },
    { name: "Add Whatsapp Template", link: "/masters/whatsapp-templates/add" },
    { name: "Add Payment Method",    link: "/masters/payment-methods/add" },
  ];

  // ── Outside click ───────────────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        notificationsRef.current && !notificationsRef.current.contains(e.target as Node) &&
        quickAddRef.current      && !quickAddRef.current.contains(e.target as Node) &&
        adminMailRef.current     && !adminMailRef.current.contains(e.target as Node)
      ) setOpenMenu(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logoutDashboard = async () => {
    await logout();
    router.push("/admin");
  };

  const transitionClasses = "transition-all duration-200 transform origin-top-right";

  const RenderIcon = ({ type }: { type: string }) => {
    const Icon = getTypeIcon(type);
    return typeof Icon === "string" ? <>{Icon}</> : <Icon />;
  };

  return (
    <ProtectedRoute>
      <div className="flex justify-end items-center bg-white max-sm:bg-[var(--color-primary)] max-sm:text-white text-gray-800">
        <button onClick={toggleTheme} className="p-2 rounded-md hover:bg-gray-100 transition-colors">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <nav className="px-2" style={{ zIndex: 1000 }}>
          <ul className="flex">

            {/* ── Notifications ───────────────────────────────────────────── */}
            <li ref={notificationsRef} className="grid place-items-center relative max-md:hidden">
              {/* Bell trigger */}
              <div
                className={`
                  relative grid place-items-center w-full h-full cursor-pointer
                  p-3 rounded-lg mx-1 transition-colors duration-150
                  ${openMenu === "notifications" ? "bg-[var(--color-primary-lighter)] text-[var(--color-primary)]" : "text-gray-600 hover:bg-gray-100"}
                `}
                onClick={() => setOpenMenu(openMenu === "notifications" ? null : "notifications")}
                onMouseEnter={() => setOpenMenu("notifications")}
              >
                <IoMdNotificationsOutline className="text-xl" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[15px] h-[15px] px-[3px] flex items-center justify-center rounded-full text-[8px] font-bold bg-[var(--color-primary)] text-white ring-[1.5px] ring-white pointer-events-none">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>

              {/* Dropdown */}
              <div
                className={`absolute top-[52px] right-0 z-50 ${transitionClasses} ${
                  openMenu === "notifications"
                    ? "opacity-100 scale-100 pointer-events-auto"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
              >
                {/* Panel */}
                <div className="w-[340px] max-md:w-[300px] bg-white rounded-2xl border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">

                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[13px] font-bold text-gray-900 tracking-tight">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[var(--color-primary)] text-white">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-[var(--color-primary)]
                          px-2 py-1 rounded-md
                          hover:bg-[var(--color-primary-lighter)]
                          transition-colors duration-150"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* List */}
                  <div className="max-h-[320px] overflow-y-auto [&::-webkit-scrollbar]:hidden">
                    {notiLoading ? (
                      Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                    ) : topFive.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-6 text-center min-h-[200px]">
                        <div className="w-11 h-11 rounded-2xl bg-[var(--color-primary-lighter)] flex items-center justify-center mb-3">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary)]">
                            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0M9 8h.01" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-gray-800">All caught up!</p>
                        <p className="text-xs text-gray-400 mt-1">No new notifications</p>
                      </div>
                    ) : (
                      topFive.map((n) => (
                        <NotificationRow
                          key={n.id}
                          n={n}
                          onMarkRead={handleMarkRead}
                          onClick={handleNotificationClick}
                          RenderIcon={RenderIcon}
                        />
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-2 border-t border-gray-100">
                    <button
                      onClick={() => { setOpenMenu(null); router.push("/notifications"); }}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl
                        text-xs font-semibold text-[var(--color-primary)]
                        hover:bg-[var(--color-primary-lighter)]
                        transition-colors duration-150"
                    >
                      View all notifications
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </div>

                </div>
              </div>
            </li>

            {/* ── Quick Add ────────────────────────────────────────────────── */}
            <li ref={quickAddRef} className="flex items-center relative max-md:hidden z-50 gap-1">
              <div
                className="flex items-center gap-2 w-full h-full text-gray-800 cursor-pointer p-4 max-md:p-2 hover:bg-gray-100"
                onClick={() => setOpenMenu(openMenu === "quickAdd" ? null : "quickAdd")}
                onMouseEnter={() => setOpenMenu("quickAdd")}
              >
                <FaPlus />
                <span className="max-md:hidden">Quick Add</span>
                {openMenu === "quickAdd" ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
              </div>
              <div
                className={`absolute top-[56px] right-0 z-50 max-md:right-[-70px] ${transitionClasses} ${
                  openMenu === "quickAdd" ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
                }`}
                style={{ zIndex: 1000 }}
              >
                <PopUps>
                  <div className="flex flex-col border-t-[3px] border-t-[var(--color-primary)] text-gray-600 max-h-[calc(100vh-70px)] [&::-webkit-scrollbar]:hidden overflow-auto">
                    {quickadds.map((item, i) => (
                      <Link key={item.name + i} href={item.link} onClick={() => setOpenMenu(null)} className="flex items-center gap-2 hover:bg-gray-100 py-3 px-4">
                        <FaPlus className="text-gray-600" />
                        <p className="whitespace-nowrap">{item.name}</p>
                      </Link>
                    ))}
                  </div>
                </PopUps>
              </div>
            </li>

            {/* ── Admin Mail ───────────────────────────────────────────────── */}
            <li ref={adminMailRef} className="flex items-center relative cursor-pointer gap-2">
              <div
                className="flex items-center gap-2 w-full h-full text-gray-800 max-sm:text-white p-4 max-md:p-2 hover:bg-gray-100"
                onClick={() => setOpenMenu(openMenu === "adminMail" ? null : "adminMail")}
                onMouseEnter={() => setOpenMenu("adminMail")}
              >
                <span className="max-md:hidden">Admin mail</span>
                {openMenu === "adminMail" ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
              </div>
              <div
                className={`absolute top-[56px] z-50 right-0 max-md:right-[-40px] ${transitionClasses} ${
                  openMenu === "adminMail" ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
                }`}
                style={{ zIndex: 1000 }}
              >
                <PopUps>
                  <div className="flex flex-col border-t-[3px] border-t-[var(--color-primary)]">
                    <div className="flex items-center gap-2 hover:bg-gray-100 py-3 px-3 cursor-pointer" onClick={() => { setOpenMenu(null); router.push(`/users/edit/${admin?._id}`); }}>
                      <IoPersonOutline /><p>Edit Profile</p>
                    </div>
                    <div className="flex items-center gap-2 hover:bg-gray-100 py-3 px-3 cursor-pointer" onClick={() => { setOpenMenu(null); router.push("/users/change_password"); }}>
                      <LuKey /><p>Change Password</p>
                    </div>
                    <div className="flex items-center gap-2 hover:bg-gray-100 py-3 px-3 cursor-pointer" onClick={() => { setOpenMenu(null); logoutDashboard(); }}>
                      <CiLogout /><p>Logout</p>
                    </div>
                  </div>
                </PopUps>
              </div>
            </li>

            {/* ── Logout ───────────────────────────────────────────────────── */}
            <li className="grid place-items-center relative cursor-pointer text-xl p-4 max-md:px-2 hover:bg-gray-100" onClick={logoutDashboard}>
              <CiLogout />
            </li>

          </ul>
        </nav>
      </div>
    </ProtectedRoute>
  );
}