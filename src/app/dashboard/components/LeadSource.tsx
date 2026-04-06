"use client";

import { getCustomer } from "@/store/customer";
import { AppWindow } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// ─── CSS Variable Tokens ───────────────────────────────────────────────────────
// Expected in your global CSS / tailwind config:
//   --color-primary
//   --color-primary-light      --color-primary-lighter
//   --color-primary-dark       --color-primary-darker
//   --color-secondary
//   --color-secondary-light    --color-secondary-lighter
//   --color-secondary-dark     --color-secondary-darker

// ─── Types ────────────────────────────────────────────────────────────────────

interface LeadSource {
  id: string;
  name: string;
  count: number;
  change: number; // % change vs previous period
  color: string;
  icon: React.ReactNode;
}

interface LeadSourcesData {
  sources: LeadSource[];
  total: number;
  period: string;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="size-3.5">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const NewspaperIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className="size-2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2 8.5L6 4l4 4.5" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className="size-2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2 3.5L6 8l4-4.5" />
  </svg>
);

const RefreshIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 6A6.5 6.5 0 0116 9.5M16.5 14A6.5 6.5 0 014 10.5M3 3.5v3h3M17 16.5v-3h-3" />
  </svg>
);

// ─── Donut Chart ──────────────────────────────────────────────────────────────

interface DonutChartProps {
  sources: LeadSource[];
  total: number;
  activeId: string | null;
  onHover: (id: string | null) => void;
  size?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({
  sources, total, activeId, onHover, size = 160,
}) => {
  const cx  = size / 2;
  const cy  = size / 2;
  const R   = size * 0.43;
  const r   = size * 0.28;
  const GAP = 3.5;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  let angle = -90;

  const slices = sources.map((src) => {
    const pct   = total > 0 ? src.count / total : 0;
    const sweep = Math.max(pct * 360, src.count > 0 ? 2 : 0);
    const a0    = angle;
    const a1    = a0 + sweep - GAP;
    angle      += sweep;

    const rad = (d: number) => (d * Math.PI) / 180;
    const pt  = (radius: number, deg: number): [number, number] => [
      cx + radius * Math.cos(rad(deg)),
      cy + radius * Math.sin(rad(deg)),
    ];

    const [x1, y1] = pt(R, a0);
    const [x2, y2] = pt(R, a1);
    const [x3, y3] = pt(r, a1);
    const [x4, y4] = pt(r, a0);
    const large = sweep - GAP > 180 ? 1 : 0;

    return {
      ...src,
      pct,
      path: `M${x1} ${y1} A${R} ${R} 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A${r} ${r} 0 ${large} 0 ${x4} ${y4}Z`,
    };
  });

  const active = activeId ? sources.find((s) => s.id === activeId) : null;

  // ✅ Scale the WHOLE ring from its center using SVG translate+scale+translate
  const ringTransform = activeId
    ? `translate(${cx},${cy}) scale(1.1) translate(${-cx},${-cy})`
    : `translate(${cx},${cy}) scale(1)   translate(${-cx},${-cy})`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: "visible" }}
      >
        <defs>
          {slices.map((s) => (
            <filter
              key={s.id}
              id={`gf-${s.id}`}
              x="-60%" y="-60%"
              width="220%" height="220%"
            >
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {/*
          ✅ One <g> wraps ALL slices.
          The whole ring scales uniformly from (cx,cy) — never overlaps center text.
          Individual slice highlight is handled by filter (glow) + opacity only.
        */}
        <g
          transform={ringTransform}
          style={{ transition: "transform 0.32s cubic-bezier(.34,1.56,.64,1)" }}
        >
          {slices.map((s) => {
            const isActive = activeId === s.id;
            const isDim    = activeId !== null && !isActive;

            return (
              <path
                key={s.id}
                d={s.path}
                fill={s.color}
                filter={isActive ? `url(#gf-${s.id})` : undefined}
                opacity={isDim ? 0.3 : ready ? 1 : 0}
                style={{
                  cursor: "pointer",
                  transition: "opacity 0.22s ease, filter 0.22s ease",
                }}
                onMouseEnter={() => onHover(s.id)}
                onMouseLeave={() => onHover(null)}
              />
            );
          })}
        </g>
      </svg>

      {/* Center text — lives in HTML, completely outside SVG, never affected by ring scale */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none gap-0.5">
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: "var(--color-secondary)" }}
        >
          {active ? active.name : "total"}
        </span>
        <span
          className="text-xl font-black leading-none"
          style={{
            color: active ? active.color : "var(--color-primary-dark)",
            fontFamily: "'Playfair Display', serif",
            transition: "color 0.25s ease",
          }}
        >
          {(active ? active.count : total).toLocaleString()}
        </span>
        {active && (
          <span className="text-[11px] font-bold" style={{ color: active.color }}>
            {total > 0 ? Math.round((active.count / total) * 100) : 0}%
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Source Row ───────────────────────────────────────────────────────────────

interface SourceRowProps {
  source: LeadSource;
  total: number;
  isActive: boolean;
  onHover: (id: string | null) => void;
  rank: number;
  animDelay?: number;
}

const SourceRow: React.FC<SourceRowProps> = ({
  source, total, isActive, onHover, rank, animDelay = 0,
}) => {
  const pct = total > 0 ? Math.min((source.count / total) * 100, 100) : 0;
  const isUp = source.change >= 0;
  const [show, setShow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setShow(true), animDelay);
    return () => clearTimeout(t);
  }, [animDelay]);

  return (
    <div
      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors duration-150"
      style={{
        background: isActive
          ? `color-mix(in srgb, ${source.color} 9%, transparent)`
          : undefined,
        outline: isActive
          ? `1px solid color-mix(in srgb, ${source.color} 25%, transparent)`
          : "1px solid transparent",
        opacity: show ? 1 : 0,
        transform: show ? "none" : "translateY(6px)",
        transition: `opacity 0.35s ease ${animDelay}ms, transform 0.35s ease ${animDelay}ms, background 0.15s ease, outline 0.15s ease`,
      }}
      onMouseEnter={() => onHover(source.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Rank */}
      <span
        className="w-5  text-center text-[18px] font-bold flex-shrink-0"
        style={{ color: "var(--color-secondary)", fontFamily: "'Courier New', monospace" }}
      >
        {rank}
      </span>

      {/* Icon */}
      <div
        className="size-8 flex-shrink-0 rounded-lg flex items-center justify-center transition-shadow duration-200"
        style={{
          background: `color-mix(in srgb, ${source.color} 13%, transparent)`,
          color: source.color,
          boxShadow: isActive
            ? `0 0 16px color-mix(in srgb, ${source.color} 35%, transparent)`
            : "none",
        }}
      >
        {source.icon}
      </div>

      {/* Label + bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span
            className="text-[13px] font-semibold text-[var(--color-primary-darker)] max-sm:dark:text-[var(--color-primary-lighter)] truncate"
          >
            {source.name}
          </span>
          <span
            className="ml-3 flex-shrink-0 text-[13px] font-bold tabular-nums transition-colors duration-150"
            style={{ color: isActive ? source.color : "var(--color-secondary)" }}
          >
            {source.count.toLocaleString()}
          </span>
        </div>
        {/* Progress track */}
        <div
          className="h-1.5 w-full rounded-full overflow-hidden"
          style={{ background: "color-mix(in srgb, var(--color-secondary) 12%, transparent)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-[900ms] ease-[cubic-bezier(.34,1.2,.64,1)]"
            style={{
              width: show ? `${pct}%` : "0%",
              transitionDelay: `${animDelay + 80}ms`,
              background: `linear-gradient(90deg, ${source.color} 0%, color-mix(in srgb, ${source.color} 55%, transparent) 100%)`,
              boxShadow: isActive ? `0 0 8px ${source.color}` : "none",
            }}
          />
        </div>
      </div>

      {/* View Leads button hover hide/show: opacity-0 group-hover:opacity-100*/}
<button
  onClick={(e) => {
    e.stopPropagation();
   router.push(`/customer?ReferenceId=${source.name}`);
  }}
  className="
    flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg
    text-[11px] font-semibold tracking-wide
    border transition-all duration-200 cursor-pointer
   
  "
  style={{
    background: `color-mix(in srgb, ${source.color} 8%, transparent)`,
    borderColor: `color-mix(in srgb, ${source.color} 25%, transparent)`,
    color: source.color,
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = `color-mix(in srgb, ${source.color} 18%, transparent)`;
    e.currentTarget.style.borderColor = `color-mix(in srgb, ${source.color} 50%, transparent)`;
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = `color-mix(in srgb, ${source.color} 8%, transparent)`;
    e.currentTarget.style.borderColor = `color-mix(in srgb, ${source.color} 25%, transparent)`;
  }}
>
  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M1 6s1.8-4 5-4 5 4 5 4-1.8 4-5 4-5-4-5-4z" />
    <circle cx="6" cy="6" r="1.5" fill="currentColor" stroke="none" />
  </svg>
  View Leads
</button>

      {/* Change pill */}
     {/*  <div
        className="flex-shrink-0 flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md"
        style={{
          background: isUp
            ? "color-mix(in srgb, #22c55e 11%, transparent)"
            : "color-mix(in srgb, #ef4444 11%, transparent)",
          color: isUp ? "#15803d" : "#b91c1c",
        }}
      >
        {isUp ? <ChevronUpIcon /> : <ChevronDownIcon />}
        {Math.abs(source.change)}%
      </div> */}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div
    className={`animate-pulse rounded-xl ${className}`}
    style={{ background: "color-mix(in srgb, var(--color-secondary) 9%, transparent)" }}
  />
);

// ─── Main Component ───────────────────────────────────────────────────────────

const LeadSources: React.FC = () => {
  const [data, setData] = useState<LeadSourcesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [spinning, setSpinning] = useState(false);

  // ── Data fetch ─────────────────────────────────────────────────────────────
const fetchLeadSources = async (p: "7d" | "30d" | "90d") => {
  setLoading(true);

  try {
    const stub: LeadSourcesData = {
      period: p,
      total: 0,
      sources: [
        { id: "facebook",  name: "Facebook",  count: 0, change: 0, color: "#1877F2", icon: <FacebookIcon /> },
        { id: "instagram", name: "Instagram", count: 0, change: 0, color: "#E1306C", icon: <InstagramIcon /> },
        { id: "google",    name: "Google",    count: 0, change: 0, color: "#FBBC05", icon: <GoogleIcon /> },
        { id: "whatsapp",  name: "WhatsApp",  count: 0, change: 0, color: "#25D366", icon: <WhatsAppIcon /> },
        { id: "newspaper", name: "Newspaper", count: 0, change: 0, color: "#8B5CF6", icon: <NewspaperIcon /> },
         { id: "website", name: "Website",    count: 0, change: 0, color: "#8B5CF6", icon: <AppWindow /> },
      ],
    };

    const customers = await getCustomer();
    console.log("customer data", customers);

    const sourceCount: Record<string, number> = {};

    customers.forEach((customer: any) => {
      if (!customer.ReferenceId) return;

      const ref = customer.ReferenceId.toLowerCase().trim();

      sourceCount[ref] = (sourceCount[ref] || 0) + 1;
    });

    const updatedSources = stub.sources.map((src) => ({
      ...src,
      count: sourceCount[src.id] || 0,
    }));

    const total = updatedSources.reduce((acc, s) => acc + s.count, 0);

    setData({
      ...stub,
      sources: updatedSources,
      total,
    });

  } catch (e) {
    console.error("Failed to fetch lead sources:", e);
  } finally {
    setLoading(false);
    setSpinning(false);
  }
};
  useEffect(() => { fetchLeadSources(period); }, [period]);

  const handleRefresh = () => {
    setSpinning(true);
    fetchLeadSources(period);
  };

  const sorted = data ? [...data.sources].sort((a, b) => b.count - a.count) : [];
  const top = sorted[0] ?? null;
const avgChange =
  data && data.total > 0
    ? (() => {
        const activeSources = data.sources.filter(s => s.count > 0);

        if (activeSources.length === 0) return 0;

        const avg =
          activeSources.reduce((sum, src) => {
            return sum + (src.count / data.total) * 100;
          }, 0) / activeSources.length;

        return Math.round(avg);
      })()
    : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        .ls-spin { animation: ls-rotate 0.9s linear infinite; }
        @keyframes ls-rotate { to { transform: rotate(360deg); } }
      `}</style>

      <div
        className="
          w-full rounded-2xl overflow-hidden
          bg-white max-sm:dark:bg-[var(--color-bgdark)]
          border border-[var(--color-primary-lighter)] max-sm:dark:border-[var(--color-bgdark)]
        "
        style={{
          fontFamily: "'DM Sans', sans-serif",
          boxShadow: "0 2px 20px color-mix(in srgb, var(--color-primary) 7%, transparent), 0 1px 0 rgba(255,255,255,0.6)",
        }}
      >

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="
          flex flex-wrap items-center justify-between gap-3 px-5 py-4
          border-b border-[var(--color-primary-lighter)] max-sm:dark:border-[var(--color-primary-dark)]
        ">
          <div className="flex items-center gap-3">
            <div
              className="flex flex-col gap-[3px]"
              aria-hidden="true"
            >
              <div className="w-4 h-0.5 rounded-full" style={{ background: "var(--color-primary)" }} />
              <div className="w-3 h-0.5 rounded-full" style={{ background: "var(--color-secondary)", opacity: 0.5 }} />
              <div className="w-2 h-0.5 rounded-full" style={{ background: "var(--color-primary)", opacity: 0.3 }} />
            </div>
            <div>
              <h2
                className="text-base font-bold leading-tight text-[var(--color-primary-darker)] max-sm:dark:text-[var(--color-primary-lighter)]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Lead Sources
              </h2>
              <p className="text-[11px] font-medium text-[var(--color-secondary)] opacity-50 mt-0.5 tracking-wide">
                Channel attribution
              </p>
            </div>
          </div>

          {/* <div className="flex items-center gap-2">
           
            <div
              className="flex items-center p-0.5 gap-0.5 rounded-xl"
              style={{ background: "color-mix(in srgb, var(--color-secondary) 8%, transparent)" }}
            >
              {(["7d", "30d", "90d"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className="text-[11px] font-semibold px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer border-0 outline-none"
                  style={{
                    background: period === p ? "var(--color-primary)" : "transparent",
                    color: period === p
                      ? "white"
                      : "var(--color-secondary)",
                    opacity: period === p ? 1 : 0.55,
                    letterSpacing: "0.03em",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

           
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="
                size-8 flex items-center justify-center rounded-xl
                text-[var(--color-secondary)] hover:text-[var(--color-primary-dark)]
                max-sm:dark:hover:text-[var(--color-primary-light)]
                border border-[var(--color-primary-lighter)] max-sm:dark:border-[var(--color-primary-dark)]
                hover:border-[var(--color-primary-light)] max-sm:dark:hover:border-[var(--color-primary)]
                transition-all duration-200 disabled:opacity-30 cursor-pointer
              "
              style={{ background: "color-mix(in srgb, var(--color-secondary) 4%, transparent)" }}
            >
              <span className={spinning ? "ls-spin" : ""}><RefreshIcon /></span>
            </button>
          </div> */}
        </div>

        {/* ── BODY ─────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="p-5 flex flex-col lg:flex-row gap-6">
            <div className="flex flex-col items-center gap-4 lg:w-56 lg:flex-shrink-0">
              <Skeleton className="size-40 rounded-full" />
              <div className="w-full flex gap-2">
                <Skeleton className="h-16 flex-1" />
                <Skeleton className="h-16 flex-1" />
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-2 justify-center">
              {[1, 0.85, 0.7, 0.55, 0.4].map((o, i) => (
                <Skeleton key={i} className="h-11 w-full"  />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row">

            {/* ── LEFT: chart + mini-stats ──────────────────────────────── */}
            <div className="
              flex flex-col items-center gap-4
              px-5 py-5
              lg:w-56 lg:flex-shrink-0 lg:border-r
              border-b lg:border-b-0
              border-[var(--color-primary-lighter)] max-sm:dark:border-[var(--color-primary-dark)]
            ">
              <DonutChart
                sources={sorted}
                total={data?.total ?? 0}
                activeId={activeId}
                onHover={setActiveId}
                size={160}
              />

              {/* Legend dots */}
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
                {sorted.map((s) => (
                  <button
                    key={s.id}
                    className="flex items-center gap-1.5 cursor-pointer border-0 bg-transparent p-0"
                    onMouseEnter={() => setActiveId(s.id)}
                    onMouseLeave={() => setActiveId(null)}
                    aria-label={s.name}
                  >
                    <span
                      className="size-2 rounded-full transition-transform duration-200"
                      style={{
                        background: s.color,
                        transform: activeId === s.id ? "scale(1.5)" : "scale(1)",
                        boxShadow: activeId === s.id ? `0 0 6px ${s.color}` : "none",
                      }}
                    />
                    <span
                      className="text-[11px] font-medium transition-colors duration-150"
                      style={{
                        color: activeId === s.id ? s.color : "var(--color-secondary)",
                        opacity: activeId === null || activeId === s.id ? 1 : 0.35,
                      }}
                    >
                      {s.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Stat tiles */}
              <div className="w-full grid grid-cols-2 gap-2">
                {/* Total */}
                <div
                  className="rounded-xl px-3 py-2.5 border border-[var(--color-primary-lighter)] max-sm:dark:border-[var(--color-primary-dark)]"
                  style={{ background: "color-mix(in srgb, var(--color-primary) 4%, transparent)" }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider  text-[var(--color-secondary)]">Total</p>
                  <p
                    className="text-lg font-black leading-tight text-[var(--color-primary-darker)] max-sm:dark:text-[var(--color-primary-lighter)]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {(data?.total ?? 0).toLocaleString()}
                  </p>
                </div>
                {/* Avg change */}
                <div
                  className="rounded-xl px-3 py-2.5 border border-[var(--color-primary-lighter)] max-sm:dark:border-[var(--color-primary-dark)]"
                  style={{ background: "color-mix(in srgb, var(--color-primary) 4%, transparent)" }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider  text-[var(--color-secondary)]">Avg Δ</p>
                  <p
                    className="text-lg font-black leading-tight"
                    style={{
                      color: avgChange >= 0 ? "#16a34a" : "#dc2626",
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    {avgChange >= 0 ? "+" : ""}{avgChange}%
                  </p>
                </div>
              </div>

              {/* Top source pill */}
              {top && data && data.total > 0 && (
                <div
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{
                    background: `color-mix(in srgb, ${top.color} 8%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${top.color} 22%, transparent)`,
                  }}
                >
                  <div
                    className="size-6 flex-shrink-0 rounded-md flex items-center justify-center"
                    style={{ background: `color-mix(in srgb, ${top.color} 18%, transparent)`, color: top.color }}
                  >
                    {top.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: top.color, opacity: 0.6 }}>
                      Top source
                    </p>
                    <p className="text-xs font-bold" style={{ color: top.color }}>
                      {top.name} · {data.total > 0 ? Math.round((top.count / data.total) * 100) : 0}%
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT: ranked rows ────────────────────────────────────── */}
            <div className="flex-1 px-3 py-4">
              {/* Column headers */}
              <div className="flex items-center gap-3 px-3 mb-1">
                <span className="w-5 flex-shrink-0" />
                <span className="w-8 flex-shrink-0" />
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-[10px] font-semibold tracking-widest uppercase opacity-70 text-[var(--color-secondary)]">
                    Channel
                  </span>
                  <span className="text-[10px] font-semibold tracking-widest uppercase opacity-70 text-[var(--color-secondary)]">
                    Leads
                  </span>
                </div>
                {/* <span className="w-12 text-right text-[10px] font-semibold tracking-widest uppercase opacity-70 text-[var(--color-secondary)] flex-shrink-0">
                  vs prev
                </span> */}
              </div>

              <div className="flex flex-col gap-0.5">
                {sorted.map((s, i) => (
                  <SourceRow
                    key={s.id}
                    source={s}
                    total={data?.total ?? 0}
                    isActive={activeId === s.id}
                    onHover={setActiveId}
                    rank={i + 1}
                    animDelay={i * 70}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <div className="
          flex items-center justify-between px-5 py-3
          border-t border-[var(--color-primary-lighter)] max-sm:dark:border-[var(--color-primary-dark)]
        ">
          <span
            className="text-[10px] font-medium tracking-widest uppercase opacity-90 text-slate-400"
          >
            Updated just now
          </span>
          <div className="flex items-center gap-1.5">
            {sorted.map((s) => (
              <span
                key={s.id}
                className="size-1.5 rounded-full transition-all duration-200"
                style={{
                  background: s.color,
                  opacity: activeId === null || activeId === s.id ? 1 : 0.2,
                  transform: activeId === s.id ? "scale(1.6)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default LeadSources;