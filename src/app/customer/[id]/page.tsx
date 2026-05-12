"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { getCustomerById } from "@/store/customer";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NamedRef {
  _id: string | null;
  Name: string;
}

interface Customer {
  id: string;
  _id: string;
  Campaign: NamedRef;
  CustomerType: NamedRef;
  CustomerSubType: NamedRef;
  LeadType: string;
  customerName: string;
  ContactNumber: string;
  City: NamedRef;
  Location: NamedRef;
  SubLocation: NamedRef;
  Area: string;
  Adderess: string;
  Email: string;
  Facillities: string;
  ReferenceId: string;
  CustomerId: string;
  ClientId: string | null;
  CustomerDate: string;
  CustomerYear: string;
  Other: string;
  Description: string | null;
  Video: string;
  Verified: string;
  GoogleMap: string;
  URL: string;
  Price: string;
  PriceNumber: number;
  CustomerFields: Record<string, unknown>;
  CustomerImage: string[];
  SitePlan: string[];
  isFavourite: boolean;
  isChecked: boolean;
  LeadTemperature: "hot" | "warm" | "cold" | string;
  CreatedById: string;
  isImported: boolean;
  createdAt: string;
  updatedAt: string;
  AssignTo: string | null;
  CreatedBy: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseDate(iso: string): Date {
  if (!iso) return new Date("invalid");
  // Handle DD-MM-YYYY format (e.g. CustomerDate)
  const ddmmyyyy = iso.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddmmyyyy) {
    return new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`);
  }
  return new Date(iso);
}

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = parseDate(iso);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function formatShortDate(iso: string) {
  if (!iso) return "—";
  const d = parseDate(iso);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function getTemperatureConfig(temp: string) {
  switch (temp?.toLowerCase()) {
    case "hot":
      return {
        label: "Hot Lead",
        color: "text-orange-500 dark:text-orange-400",
        bg: "bg-orange-400/10",
        border: "border-orange-400/30",
        dot: "bg-orange-400",
        glow: "shadow-orange-400/20",
        icon: "🔥",
      };
    case "warm":
      return {
        label: "Warm Lead",
        color: "text-yellow-600 dark:text-yellow-400",
        bg: "bg-yellow-400/10",
        border: "border-yellow-400/30",
        dot: "bg-yellow-400",
        glow: "shadow-yellow-400/20",
        icon: "☀️",
      };
    case "cold":
    default:
      return {
        label: "Cold Lead",
        color: "text-[var(--color-primary)] dark:text-[var(--color-accent)]",
        bg: "bg-[var(--color-primary)]/10",
        border: "border-[var(--color-primary)]/30",
        dot: "bg-[var(--color-accent)]",
        glow: "shadow-[var(--color-primary)]/20",
        icon: "❄️",
      };
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonPulse({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 dark:bg-[var(--color-childbgdark)] ${className}`}
    />
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[var(--color-bgdark)] p-6 space-y-6">
      <div className="h-8 w-48 rounded-md bg-gray-200 dark:bg-[var(--color-childbgdark)] animate-pulse" />
      <div className="rounded-2xl bg-gray-200 dark:bg-[var(--color-childbgdark)] p-8 animate-pulse h-64" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-gray-200 dark:bg-[var(--color-childbgdark)] p-6 animate-pulse h-48"
          />
        ))}
      </div>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({
  title,
  icon,
  children,
  accentColor = "var(--color-primary)",
  className = "",
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accentColor?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-[var(--color-childbgdark)] overflow-hidden group transition-all duration-300 hover:border-gray-300 dark:hover:border-white/10 hover:shadow-xl ${className}`}
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
        }}
      />

      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/5">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg text-sm"
          style={{
            background: `${accentColor}15`,
            border: `1px solid ${accentColor}30`,
          }}
        >
          {icon}
        </div>
        <h3
          className="text-sm font-semibold tracking-widest uppercase"
          style={{ color: accentColor, letterSpacing: "0.12em" }}
        >
          {title}
        </h3>
      </div>

      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Data Field ───────────────────────────────────────────────────────────────
function DataField({
  label,
  value,
  fullWidth = false,
  highlight = false,
}: {
  label: string;
  value: string | number | React.ReactNode;
  fullWidth?: boolean;
  highlight?: boolean;
}) {
  const isEmpty =
    value === "" ||
    value === null ||
    value === undefined ||
    value === "—" ||
    value === 0;

  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? "col-span-2" : ""}`}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-[var(--color-gray)]">
        {label}
      </span>
      <span
        className={`text-sm font-medium leading-relaxed transition-colors ${
          isEmpty
            ? "text-gray-400 dark:text-white/20 italic"
            : highlight
            ? "text-[var(--color-accent)]"
            : "text-gray-700 dark:text-white/80"
        }`}
      >
        {isEmpty ? "Not provided" : value}
      </span>
    </div>
  );
}

// ─── Image Lightbox ───────────────────────────────────────────────────────────
function ImageLightbox({
  images,
  activeIndex,
  onClose,
}: {
  images: string[];
  activeIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(activeIndex);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % images.length);
      if (e.key === "ArrowLeft")
        setCurrent((c) => (c - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [images.length, onClose]);

  return (
    <div
      className="fixed inset-0  flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Counter */}
        <div className="absolute -top-10 left-0 text-white/50 text-sm font-mono">
          {current + 1} / {images.length}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/50 hover:text-white transition-colors text-sm flex items-center gap-1"
        >
          <span>ESC</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Image */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10">
          <img
            src={images[current]}
            alt={`Image ${current + 1}`}
            className="w-full h-full object-contain bg-black"
          />
        </div>

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrent((c) => (c - 1 + images.length) % images.length)
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white hover:bg-[var(--color-primary)]/40 transition-all"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => setCurrent((c) => (c + 1) % images.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white hover:bg-[var(--color-primary)]/40 transition-all"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-4 justify-center flex-wrap">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  i === current
                    ? "border-[var(--color-primary)] opacity-100 scale-105"
                    : "border-white/10 opacity-50 hover:opacity-75"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumb ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Image Gallery ────────────────────────────────────────────────────────────
function ImageGallery({
  images,
  label,
}: {
  images: string[];
  label: string;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-400 dark:text-white/20 border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-xs font-medium">No {label} available</p>
      </div>
    );
  }

  const [main, ...rest] = images;

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div
          className="relative w-full aspect-video rounded-xl overflow-hidden cursor-zoom-in group border border-gray-100 dark:border-white/5"
          onClick={() => setLightboxIndex(0)}
        >
          <img
            src={main}
            alt={`${label} main`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
            <span className="text-white/70 text-xs font-medium flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                />
              </svg>
              Click to expand
            </span>
          </div>
        </div>

        {/* Rest thumbnails */}
        {rest.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {rest.map((img, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group border border-gray-100 dark:border-white/5"
                onClick={() => setLightboxIndex(i + 1)}
              >
                <img
                  src={img}
                  alt={`${label} ${i + 2}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-[var(--color-primary)]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
            {/* Count badge if more */}
            {images.length > 5 && (
              <div className="aspect-square rounded-lg bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/30 flex items-center justify-center cursor-pointer hover:bg-[var(--color-primary)]/30 transition-colors">
                <span className="text-[var(--color-accent)] text-sm font-bold">
                  +{images.length - 4}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          activeIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}) {
  const variants = {
    default:
      "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 border-gray-200 dark:border-white/10",
    success:
      "bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 border-emerald-400/20",
    warning:
      "bg-yellow-400/10 text-yellow-700 dark:text-yellow-400 border-yellow-400/20",
    danger:
      "bg-red-400/10 text-red-600 dark:text-red-400 border-red-400/20",
    info: "bg-[var(--color-primary)]/15 text-[var(--color-primary)] dark:text-[var(--color-accent)] border-[var(--color-primary)]/25",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-wide uppercase ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

// ─── Action Button ────────────────────────────────────────────────────────────
function ActionButton({
  icon,
  label,
  onClick,
  variant = "ghost",
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: "ghost" | "primary" | "danger";
}) {
  const variants = {
    ghost:
      "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20",
    primary:
      "bg-[var(--color-primary)] border-[var(--color-primary-dark)] text-white hover:bg-[var(--color-primary-dark)] shadow-lg shadow-[var(--color-primary)]/20",
    danger:
      "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20 hover:border-red-500/30",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${variants[variant]}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ─── Stat Chip ────────────────────────────────────────────────────────────────
function StatChip({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-accent)] text-sm">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[var(--color-gray)]">
          {label}
        </div>
        <div className="text-sm font-semibold text-gray-700 dark:text-white/80 truncate">
          {value || "—"}
        </div>
      </div>
    </div>
  );
}

// ─── Timeline Item ────────────────────────────────────────────────────────────
function TimelineItem({
  label,
  date,
  isLast = false,
}: {
  label: string;
  date: string;
  isLast?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] border-2 border-[var(--color-primary)]/40 mt-0.5 flex-shrink-0 shadow-sm shadow-[var(--color-primary)]/50" />
        {!isLast && <div className="w-px flex-1 bg-[var(--color-primary)]/20 my-1" />}
      </div>
      <div className="pb-4">
        <div className="text-xs font-medium text-gray-700 dark:text-white/70">{label}</div>
        <div className="text-[11px] text-gray-500 dark:text-[var(--color-gray)] mt-0.5 font-mono">
          {formatDate(date)}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CustomerViewPage() {
  // ✅ useParams() hook — correct way in Next.js App Router "use client"
  const { id } = useParams<{ id: string }>();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFav, setIsFav] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "media" | "details" | "activity"
  >("overview");
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchCustomer() {
      try {
        setLoading(true);
        const data = await getCustomerById(id);
        if (!data) throw new Error("Customer not found");
        setCustomer(data);
        setIsFav(data.isFavourite);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load customer");
      } finally {
        setLoading(false);
      }
    }
    fetchCustomer();
  }, [id]);

  if (loading) return <PageSkeleton />;

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[var(--color-bgdark)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-red-500 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-white font-semibold text-lg">
              Customer Not Found
            </h2>
            <p className="text-gray-500 dark:text-[var(--color-gray)] text-sm mt-1">
              {error}
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="px-5 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const tempConfig = getTemperatureConfig(customer.LeadTemperature);
  const initials = customer.customerName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const hasLocation =
    customer.City.Name ||
    customer.Location.Name ||
    customer.SubLocation.Name ||
    customer.Area;

  const allImages = [
    ...customer.CustomerImage,
    ...customer.SitePlan,
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: "◈" },
    { id: "media", label: "Media", icon: "◫" },
    { id: "details", label: "Details", icon: "◉" },
    { id: "activity", label: "Activity", icon: "◷" },
  ] as const;

  return (
    <div className="min-h-screen bg-white rounded-md dark:bg-[var(--color-bgdark)] text-gray-900 dark:text-white">
      {/* ── Background Effects ─────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden ">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-[0.05] dark:opacity-[0.06] blur-3xl"
          style={{ background: "var(--color-primary)" }}
        />
        <div
          className="absolute top-1/3 -right-48 w-[500px] h-[500px] rounded-full opacity-[0.03] dark:opacity-[0.04] blur-3xl"
          style={{ background: "var(--color-primary)" }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full opacity-[0.02] dark:opacity-[0.03] blur-3xl"
          style={{ background: "var(--color-accent)" }}
        />
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative  max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 dark:text-[var(--color-gray)]">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1 hover:text-[var(--color-accent)] transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Customer
          </button>
          <span className="opacity-30">/</span>
          <span className="text-gray-500 dark:text-white/40">info</span>
          <span className="opacity-30">/</span>
          <span className="text-[var(--color-primary)] dark:text-[var(--color-accent)]/60 font-mono text-[10px]">
            {/* {customer._id.slice(0, 8)}… */}{customer.customerName}
          </span>
        </nav>

        {/* ── Hero Card ──────────────────────────────────────────────────── */}
        <div
          ref={heroRef}
          className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/5 bg-white dark:bg-[var(--color-childbgdark)]"
          style={{
            boxShadow: "0 8px 48px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)",
          }}
        >
          {/* Dark mode gradient overlay */}
          <div
            className="absolute inset-0 opacity-0 dark:opacity-100 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, var(--color-childbgdark) 0%, rgba(4,23,28,0.95) 100%)",
            }}
          />

          {/* Top gradient accent */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px] "
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, var(--color-primary) 30%, var(--color-accent) 70%, transparent 100%)",
            }}
          />

          {/* Background pattern — dark mode only */}
          <div
            className="absolute inset-0 opacity-0 dark:opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 50%, var(--color-primary) 0%, transparent 50%), radial-gradient(circle at 75% 20%, var(--color-accent) 0%, transparent 40%)`,
            }}
          />

          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-white text-2xl sm:text-3xl font-bold select-none relative overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-darker) 100%)",
                    boxShadow:
                      "0 8px 32px var(--color-primary)/40, inset 0 1px 0 rgba(255,255,255,0.15)",
                  }}
                >
                  <span className="relative ">{initials}</span>
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 60%)`,
                    }}
                  />
                </div>
                {/* Verified dot */}
                {customer.Verified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white dark:border-[var(--color-childbgdark)] flex items-center justify-center">
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex flex-wrap items-start gap-3">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight capitalize">
                      {customer.customerName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {customer.ContactNumber && (
                        <a
                          href={`tel:${customer.ContactNumber}`}
                          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-[var(--color-gray)] hover:text-[var(--color-accent)] transition-colors group"
                        >
                          <svg
                            className="w-3.5 h-3.5 group-hover:scale-110 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          {customer.ContactNumber}
                        </a>
                      )}
                      {customer.Email && (
                        <a
                          href={`mailto:${customer.Email}`}
                          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-[var(--color-gray)] hover:text-[var(--color-accent)] transition-colors group"
                        >
                          <svg
                            className="w-3.5 h-3.5 group-hover:scale-110 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          {customer.Email}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 ml-auto">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${tempConfig.bg} ${tempConfig.color} ${tempConfig.border}`}
                    >
                      <span className="text-sm">{tempConfig.icon}</span>
                      {tempConfig.label}
                    </span>
                    {customer.Campaign?.Name && (
                      <Badge variant="info">{customer.Campaign.Name}</Badge>
                    )}
                    {customer.isImported && (
                      <Badge variant="warning">Imported</Badge>
                    )}
                    {customer.Verified && (
                      <Badge variant="success">Verified</Badge>
                    )}
                  </div>
                </div>

                {/* Quick stats row */}
                <div className="flex flex-wrap gap-3">
                  {customer.CustomerDate && (
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-[var(--color-gray)]">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Customer Since {formatShortDate(customer.CustomerDate)}</span>
                    </div>
                  )}
                  {hasLocation && (
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-[var(--color-gray)]">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>
                        {[
                          customer.City.Name,
                          customer.Location.Name,
                          customer.Area,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Location on record"}
                      </span>
                    </div>
                  )}
                  {customer.PriceNumber > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-semibold">
                        ₹{customer.PriceNumber.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action toolbar */}
            <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
              <ActionButton
                variant="primary"
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                }
                label="Edit Customer"
              />
              <ActionButton
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                }
                label="Call"
              />
              <ActionButton
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                }
                label="Message"
              />
              <button
                onClick={() => setIsFav((f) => !f)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  isFav
                    ? "bg-yellow-400/15 border-yellow-400/30 text-yellow-600 dark:text-yellow-400"
                    : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 hover:text-yellow-600 dark:hover:text-yellow-400 hover:border-yellow-400/30 hover:bg-yellow-400/10"
                }`}
              >
                <svg
                  className={`w-4 h-4 transition-all ${isFav ? "fill-yellow-400 scale-110" : "fill-none"}`}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
                {isFav ? "Favourited" : "Favourite"}
              </button>

              <div className="ml-auto flex gap-2">
                <ActionButton
                  variant="danger"
                  icon={
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  }
                  label="Delete"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────────── */}
        <div className="flex gap-1 p-1 rounded-2xl bg-white dark:bg-[var(--color-childbgdark)] border border-gray-200 dark:border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20"
                  : "text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5"
              }`}
            >
              <span className="text-base leading-none">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Overview Tab ───────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: main info */}
            <div className="lg:col-span-2 space-y-6">

              {/* Quick stats chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatChip
                  label="Campaign"
                  value={customer.Campaign?.Name || "—"}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  }
                />
                <StatChip
                  label="Lead Type"
                  value={customer.LeadType || "—"}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  }
                />
                <StatChip
                  label="Images"
                  value={`${customer.CustomerImage.length} photos`}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                />
                <StatChip
                  label="Site Plans"
                  value={`${customer.SitePlan.length} plans`}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  }
                />
              </div>

              {/* Contact Details */}
              <SectionCard
                title="Contact Information"
                icon={
                  <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              >
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  <DataField label="Full Name" value={customer.customerName} />
                  <DataField label="Contact Number" value={customer.ContactNumber} highlight />
                  <DataField label="Email Address" value={customer.Email} />
                  <DataField label="Reference ID" value={customer.ReferenceId} />
                  <DataField label="Customer ID" value={customer.CustomerId} />
                  <DataField label="Client ID" value={customer.ClientId ?? ""} />
                </div>
              </SectionCard>

              {/* Location */}
              <SectionCard
                title="Location Details"
                icon={
                  <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              >
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  <DataField label="City" value={customer.City.Name} />
                  <DataField label="Location" value={customer.Location.Name} />
                  <DataField label="Sub-Location" value={customer.SubLocation.Name} />
                  <DataField label="Area" value={customer.Area} />
                  <DataField label="Full Address" value={customer.Adderess} fullWidth />
                </div>

                {customer.GoogleMap && (
                  <a
                    href={customer.GoogleMap}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 flex items-center gap-2 text-sm text-[var(--color-accent)] hover:text-[var(--color-primary-light)] transition-colors group"
                  >
                    <svg
                      className="w-4 h-4 group-hover:scale-110 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open in Google Maps
                  </a>
                )}
              </SectionCard>

              {/* Classification */}
              <SectionCard
                title="Classification"
                icon={
                  <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                }
              >
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  <DataField label="Campaign" value={customer.Campaign?.Name} />
                  <DataField label="Lead Type" value={customer.LeadType} />
                  <DataField
                    label="Lead Temperature"
                    value={
                      <span className={`flex items-center gap-1.5 ${tempConfig.color}`}>
                        <span>{tempConfig.icon}</span>
                        <span className="capitalize">{customer.LeadTemperature || "—"}</span>
                      </span>
                    }
                  />
                  <DataField label="Customer Type" value={customer.CustomerType?.Name} />
                  <DataField label="Customer Sub-Type" value={customer.CustomerSubType?.Name} />
                  <DataField label="Verified" value={customer.Verified || "No"} />
                </div>
              </SectionCard>

              {/* Description */}
              {customer.Description && (
                <SectionCard
                  title="Description & Notes"
                  icon={
                    <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                >
                  <p className="text-sm text-gray-600 dark:text-white/70 leading-relaxed">
                    {customer.Description}
                  </p>
                  {customer.Other && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-[var(--color-gray)] mb-1">
                        Other Notes
                      </p>
                      <p className="text-sm text-gray-600 dark:text-white/60 leading-relaxed">
                        {customer.Other}
                      </p>
                    </div>
                  )}
                </SectionCard>
              )}
            </div>

            {/* Right column: sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              {(customer.Price || customer.PriceNumber > 0) && (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-50 dark:bg-[var(--color-childbgdark)] overflow-hidden relative">
                  <div
                    className="absolute inset-0 opacity-0 dark:opacity-100 pointer-events-none"
                    style={{
                      background: "linear-gradient(135deg, rgba(52,211,153,0.08) 0%, var(--color-childbgdark) 100%)",
                    }}
                  />
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
                  <div className="relative p-6 text-center">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400/60 mb-2">
                      Listed Price
                    </div>
                    <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                      ₹{customer.PriceNumber > 0
                        ? customer.PriceNumber.toLocaleString("en-IN")
                        : customer.Price}
                    </div>
                    {customer.Price && customer.PriceNumber > 0 && (
                      <div className="text-xs text-gray-500 dark:text-white/30">{customer.Price}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Facilities */}
              {customer.Facillities && (
                <SectionCard
                  title="Facilities"
                  icon={
                    <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                >
                  <div className="flex flex-wrap gap-2">
                    {customer.Facillities.split(",").map((f, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 text-xs rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-accent)] border border-[var(--color-primary)]/20"
                      >
                        {f.trim()}
                      </span>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* URLs */}
              {(customer.URL || customer.Video) && (
                <SectionCard
                  title="Links & Media"
                  icon={
                    <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  }
                >
                  <div className="space-y-3">
                    {customer.URL && (
                      <a
                        href={customer.URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[var(--color-accent)] hover:text-gray-900 dark:hover:text-white transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[var(--color-primary)]/15 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                        <span className="truncate">Website URL</span>
                      </a>
                    )}
                    {customer.Video && (
                      <a
                        href={customer.Video}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[var(--color-accent)] hover:text-gray-900 dark:hover:text-white transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="truncate">Video Tour</span>
                      </a>
                    )}
                  </div>
                </SectionCard>
              )}

              {/* Timeline */}
              <SectionCard
                title="Activity Timeline"
                icon={
                  <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              >
                <div>
                  <TimelineItem label="Customer Record Created" date={customer.createdAt} />
                  <TimelineItem label="Last Updated" date={customer.updatedAt} isLast />
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 space-y-2">
                  <DataField label="Customer Date" value={formatShortDate(customer.CustomerDate)} />
                  {customer.CustomerYear && (
                    <DataField label="Customer Year" value={customer.CustomerYear} />
                  )}
                </div>
              </SectionCard>

              {/* System Info */}
              <SectionCard
                title="System Info"
                icon={
                  <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              >
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-[var(--color-gray)]">
                      Record ID
                    </span>
                    <span className="text-xs font-mono text-gray-500 dark:text-white/40 break-all leading-relaxed">
                      {customer._id}
                    </span>
                  </div>
                  <DataField
                    label="Source"
                    value={customer.isImported ? "Imported" : "Manual Entry"}
                  />
                  <DataField
                    label="Assigned To"
                    value={customer.AssignTo ?? "Unassigned"}
                  />
                  <DataField
                    label="Created By"
                    value={customer.CreatedBy ?? customer.CreatedById?.slice(0, 8) + "…"}
                  />
                </div>
              </SectionCard>
            </div>
          </div>
        )}

        {/* ── Media Tab ──────────────────────────────────────────────────── */}
        {activeTab === "media" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard
              title="Customer Images"
              icon={
                <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            >
              <ImageGallery images={customer.CustomerImage} label="Customer Images" />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-[var(--color-gray)]">
                  {customer.CustomerImage.length} image{customer.CustomerImage.length !== 1 ? "s" : ""}
                </span>
                {customer.CustomerImage.length > 0 && (
                  <button className="text-xs text-[var(--color-accent)] hover:text-gray-900 dark:hover:text-white transition-colors">
                    Download All →
                  </button>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Site Plans"
              icon={
                <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              }
            >
              <ImageGallery images={customer.SitePlan} label="Site Plans" />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-[var(--color-gray)]">
                  {customer.SitePlan.length} plan{customer.SitePlan.length !== 1 ? "s" : ""}
                </span>
                {customer.SitePlan.length > 0 && (
                  <button className="text-xs text-[var(--color-accent)] hover:text-gray-900 dark:hover:text-white transition-colors">
                    Download All →
                  </button>
                )}
              </div>
            </SectionCard>

            {/* All media combined strip */}
            {allImages.length > 0 && (
              <div className="lg:col-span-2">
                <SectionCard
                  title="All Media"
                  icon={
                    <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  }
                >
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
                    {allImages.map((img, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg overflow-hidden border border-gray-100 dark:border-white/5 hover:border-[var(--color-primary)]/40 transition-all cursor-pointer group"
                      >
                        <img
                          src={img}
                          alt={`Media ${i + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>
            )}
          </div>
        )}

        {/* ── Details Tab ────────────────────────────────────────────────── */}
        {activeTab === "details" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Full details */}
            <SectionCard
              title="Full Profile"
              icon={
                <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            >
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <DataField label="Customer Name" value={customer.customerName} />
                <DataField label="Contact Number" value={customer.ContactNumber} highlight />
                <DataField label="Email" value={customer.Email} />
                <DataField label="Campaign" value={customer.Campaign?.Name} />
                <DataField label="Lead Type" value={customer.LeadType} />
                <DataField
                  label="Lead Temperature"
                  value={
                    <span className={`capitalize ${tempConfig.color}`}>
                      {tempConfig.icon} {customer.LeadTemperature}
                    </span>
                  }
                />
                <DataField label="Customer Type" value={customer.CustomerType?.Name} />
                <DataField label="Customer Sub-Type" value={customer.CustomerSubType?.Name} />
                <DataField label="Customer Date" value={formatShortDate(customer.CustomerDate)} />
                <DataField label="Customer Year" value={customer.CustomerYear} />
                <DataField label="Price" value={customer.Price} />
                <DataField
                  label="Price Number"
                  value={customer.PriceNumber > 0 ? `₹${customer.PriceNumber.toLocaleString("en-IN")}` : ""}
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Address & Location"
              icon={
                <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              }
            >
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <DataField label="City" value={customer.City.Name} />
                <DataField label="Location" value={customer.Location.Name} />
                <DataField label="Sub-Location" value={customer.SubLocation.Name} />
                <DataField label="Area" value={customer.Area} />
                <DataField label="Full Address" value={customer.Adderess} fullWidth />
                <DataField
                  label="Google Map"
                  value={
                    customer.GoogleMap ? (
                      <a
                        href={customer.GoogleMap}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--color-accent)] hover:underline text-xs"
                      >
                        Open Map ↗
                      </a>
                    ) : ""
                  }
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Additional Info"
              icon={
                <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            >
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <DataField label="Facilities" value={customer.Facillities} fullWidth />
                <DataField label="Reference ID" value={customer.ReferenceId} />
                <DataField label="Customer ID" value={customer.CustomerId} />
                <DataField label="Client ID" value={customer.ClientId ?? ""} />
                <DataField label="Verified" value={customer.Verified} />
                <DataField
                  label="Video URL"
                  value={
                    customer.Video ? (
                      <a
                        href={customer.Video}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-500 dark:text-red-400 hover:underline text-xs"
                      >
                        Watch Video ↗
                      </a>
                    ) : ""
                  }
                />
                <DataField
                  label="URL"
                  value={
                    customer.URL ? (
                      <a
                        href={customer.URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--color-accent)] hover:underline text-xs"
                      >
                        Open Link ↗
                      </a>
                    ) : ""
                  }
                />
                <DataField label="Other" value={customer.Other} fullWidth />
              </div>
            </SectionCard>

            {/* Custom Fields */}
            {Object.keys(customer.CustomerFields || {}).length > 0 && (
              <SectionCard
                title="Custom Fields"
                icon={
                  <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                }
              >
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  {Object.entries(customer.CustomerFields).map(([key, val]) => (
                    <DataField
                      key={key}
                      label={key}
                      value={String(val ?? "")}
                    />
                  ))}
                </div>
              </SectionCard>
            )}
          </div>
        )}

        {/* ── Activity Tab ───────────────────────────────────────────────── */}
        {activeTab === "activity" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Full Activity Log */}
              <SectionCard
                title="Activity Log"
                icon={
                  <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
              >
                <div className="space-y-0">
                  {[
                    {
                      action: "Customer record created",
                      detail: `By ${customer.CreatedBy ?? "System"}`,
                      date: customer.createdAt,
                      type: "create",
                    },
                    {
                      action: "Record last updated",
                      detail: "Customer data was modified",
                      date: customer.updatedAt,
                      type: "update",
                    },
                    customer.isFavourite
                      ? {
                          action: "Marked as favourite",
                          detail: "Added to favourites list",
                          date: customer.updatedAt,
                          type: "favourite",
                        }
                      : null,
                    customer.isImported
                      ? {
                          action: "Customer imported",
                          detail: "Record was imported from external source",
                          date: customer.createdAt,
                          type: "import",
                        }
                      : null,
                  ]
                    .filter(Boolean)
                    .map((event, i) => {
                      const iconMap: Record<string, React.ReactNode> = {
                        create: (
                          <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        ),
                        update: (
                          <svg className="w-3.5 h-3.5 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        ),
                        favourite: (
                          <svg className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        ),
                        import: (
                          <svg className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        ),
                      };

                      return (
                        <div
                          key={i}
                          className="flex gap-4 py-4 border-b border-gray-100 dark:border-white/5 last:border-0"
                        >
                          <div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {iconMap[event!.type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-700 dark:text-white/80">
                              {event!.action}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-[var(--color-gray)] mt-0.5">
                              {event!.detail}
                            </div>
                          </div>
                          <div className="text-[11px] text-gray-400 dark:text-white/30 font-mono flex-shrink-0 text-right">
                            {formatDate(event!.date)}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </SectionCard>
            </div>

            {/* Right: meta summary */}
            <div className="space-y-6">
              <SectionCard
                title="Record Metadata"
                icon={
                  <svg className="w-4 h-4 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                  </svg>
                }
              >
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 space-y-1">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[var(--color-gray)]">
                      Record ID
                    </div>
                    <div className="text-[11px] font-mono text-gray-500 dark:text-white/40 break-all leading-relaxed">
                      {customer._id}
                    </div>
                  </div>
                  <DataField label="Created" value={formatDate(customer.createdAt)} />
                  <DataField label="Updated" value={formatDate(customer.updatedAt)} />
                  <DataField
                    label="Source"
                    value={customer.isImported ? "Imported" : "Manual Entry"}
                  />
                  <DataField
                    label="Status Flags"
                    value={
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] rounded-full border ${
                            customer.isFavourite
                              ? "bg-yellow-400/10 text-yellow-700 dark:text-yellow-400 border-yellow-400/20"
                              : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/20 border-gray-200 dark:border-white/10"
                          }`}
                        >
                          ★ Favourite
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] rounded-full border ${
                            customer.isChecked
                              ? "bg-emerald-400/10 text-emerald-700 dark:text-emerald-400 border-emerald-400/20"
                              : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/20 border-gray-200 dark:border-white/10"
                          }`}
                        >
                          ✓ Checked
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] rounded-full border ${
                            customer.isImported
                              ? "bg-purple-400/10 text-purple-700 dark:text-purple-400 border-purple-400/20"
                              : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/20 border-gray-200 dark:border-white/10"
                          }`}
                        >
                          ↑ Imported
                        </span>
                      </div>
                    }
                  />
                </div>
              </SectionCard>
            </div>
          </div>
        )}

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <footer className="flex flex-wrap items-center justify-between gap-3 py-4 border-t border-gray-200 dark:border-white/5 text-xs text-gray-400 dark:text-white/20">
          <div className="flex items-center gap-2">
            <span>Record</span>
            <span className="font-mono">{customer._id.slice(0, 12)}…</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Last sync: {formatDate(customer.updatedAt)}</span>
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"
              title="Active"
            />
          </div>
        </footer>
      </div>
    </div>
  );
}