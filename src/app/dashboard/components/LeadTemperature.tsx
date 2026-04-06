"use client";

import { getCustomer } from "@/store/customer";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type TempId = "hot" | "warm" | "cold";

interface TempBucket {
  id: TempId;
  label: string;
  count: number;
  pct: number;
}

interface LeadTempData {
  buckets: TempBucket[];
  total: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const CONFIG: Record<TempId, {
  label: string;
  color: string;
  trackColor: string;
  glowColor: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
}> = {
  hot: {
    label: "Hot",
    color: "#EF4444",
    trackColor: "#FCA5A5",
    glowColor: "rgba(239,68,68,0.18)",
    bgColor:   "rgba(239,68,68,0.07)",
    borderColor: "rgba(239,68,68,0.22)",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
        <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"/>
      </svg>
    ),
  },
  warm: {
    label: "Warm",
    color: "#F59E0B",
    trackColor: "#FCD34D",
    glowColor: "rgba(245,158,11,0.18)",
    bgColor:   "rgba(245,158,11,0.07)",
    borderColor: "rgba(245,158,11,0.22)",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
      </svg>
    ),
  },
  cold: {
    label: "Cold",
    color: "#3B82F6",
    trackColor: "#93C5FD",
    glowColor: "rgba(59,130,246,0.18)",
    bgColor:   "rgba(59,130,246,0.07)",
    borderColor: "rgba(59,130,246,0.22)",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
        <path fillRule="evenodd" d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4zm-1 5a1 1 0 012 0v2.586l1.707 1.707a1 1 0 01-1.414 1.414L9.586 13H7a1 1 0 110-2h1V9z" clipRule="evenodd"/>
      </svg>
    ),
  },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div
    className={`animate-pulse rounded-xl ${className}`}
    style={{ background: "color-mix(in srgb, var(--color-secondary) 9%, transparent)" }}
  />
);

// ─── Heat Bar ─────────────────────────────────────────────────────────────────

interface HeatBarProps {
  buckets: TempBucket[];
  activeId: TempId | null;
  onHover: (id: TempId | null) => void;
}

const HeatBar: React.FC<HeatBarProps> = ({ buckets, activeId, onHover }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative">
      {/* Track */}
      <div className="flex h-9 w-full rounded-2xl overflow-hidden gap-0.5">
        {buckets.map((b) => {
          const cfg = CONFIG[b.id];
          const dim = activeId !== null && activeId !== b.id;
          return (
            <div
              key={b.id}
              className="relative flex items-center justify-center cursor-pointer transition-all duration-500"
              style={{
                width: mounted ? `${Math.max(b.pct, b.count > 0 ? 4 : 0)}%` : "0%",
                background: cfg.color,
                opacity: dim ? 0.3 : 1,
                transition: "width 0.9s cubic-bezier(.34,1.2,.64,1), opacity 0.22s ease",
                minWidth: b.count > 0 ? "2.5rem" : 0,
              }}
              onMouseEnter={() => onHover(b.id)}
              onMouseLeave={() => onHover(null)}
            >
              {b.pct >= 10 && (
                <span className="text-[11px] font-bold text-white/90 select-none">
                  {Math.round(b.pct)}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Tick labels */}
      <div className="flex justify-between mt-2 px-0.5">
        {buckets.map((b) => {
          const cfg = CONFIG[b.id];
          return (
            <div
              key={b.id}
              className="flex items-center gap-1.5 cursor-pointer"
              onMouseEnter={() => onHover(b.id)}
              onMouseLeave={() => onHover(null)}
            >
              <span
                className="size-2 rounded-full flex-shrink-0 transition-transform duration-200"
                style={{
                  background: cfg.color,
                  transform: activeId === b.id ? "scale(1.6)" : "scale(1)",
                  boxShadow: activeId === b.id ? `0 0 5px ${cfg.color}` : "none",
                }}
              />
              <span
                className="text-[11px] font-semibold tracking-wide"
                style={{
                  color: activeId === b.id ? cfg.color : "var(--color-secondary)",
                  opacity: activeId === null || activeId === b.id ? 1 : 0.35,
                }}
              >
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Temperature Card ─────────────────────────────────────────────────────────

interface TempCardProps {
  bucket: TempBucket;
  total: number;
  isActive: boolean;
  onHover: (id: TempId | null) => void;
  animDelay?: number;
}

const TempCard: React.FC<TempCardProps> = ({
  bucket, total, isActive, onHover, animDelay = 0,
}) => {
  const cfg = CONFIG[bucket.id];
  const [show, setShow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setShow(true), animDelay);
    return () => clearTimeout(t);
  }, [animDelay]);

  return (
    <div
      className="relative flex flex-col gap-3 p-4 rounded-2xl cursor-pointer overflow-hidden transition-all duration-200"
      style={{
        background: isActive ? cfg.bgColor : "color-mix(in srgb, var(--color-secondary) 4%, transparent)",
        border: `1px solid ${isActive ? cfg.borderColor : "var(--color-primary-lighter)"}`,
        boxShadow: isActive ? `0 0 24px ${cfg.glowColor}` : "none",
        opacity: show ? 1 : 0,
        transform: show ? "none" : "translateY(10px)",
        transition: `opacity 0.4s ease ${animDelay}ms, transform 0.4s ease ${animDelay}ms, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease`,
      }}
      onMouseEnter={() => onHover(bucket.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Icon + label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="size-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
            style={{
              background: isActive ? cfg.bgColor : `color-mix(in srgb, ${cfg.color} 10%, transparent)`,
              color: cfg.color,
              border: `1px solid ${cfg.borderColor}`,
            }}
          >
            {cfg.icon}
          </div>
          <span
            className="text-sm font-bold"
            style={{ color: isActive ? cfg.color : "var(--color-primary-darker)" }}
          >
            {cfg.label}
          </span>
        </div>

        {/* Badge */}
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{
            background: `color-mix(in srgb, ${cfg.color} 14%, transparent)`,
            color: cfg.color,
          }}
        >
          {total > 0 ? `${Math.round(bucket.pct)}%` : "—"}
        </span>
      </div>

      {/* Count */}
      <div>
        <p
          className="text-3xl font-black leading-none tracking-tight"
          style={{
            color: isActive ? cfg.color : "var(--color-primary-darker)",
            fontFamily: "'Playfair Display', serif",
            transition: "color 0.2s ease",
          }}
        >
          {bucket.count.toLocaleString()}
        </p>
        <p
          className="text-[11px] font-medium mt-1"
          style={{ color: "var(--color-secondary)", opacity: 0.6 }}
        >
          leads
        </p>
      </div>

      {/* Mini progress bar */}
      <div
        className="h-1 w-full rounded-full overflow-hidden"
        style={{ background: `color-mix(in srgb, ${cfg.color} 12%, transparent)` }}
      >
        <div
          className="h-full rounded-full transition-all duration-[1000ms] ease-[cubic-bezier(.34,1.2,.64,1)]"
          style={{
            width: show ? `${bucket.pct}%` : "0%",
            transitionDelay: `${animDelay + 100}ms`,
            background: cfg.color,
            boxShadow: isActive ? `0 0 6px ${cfg.color}` : "none",
          }}
        />
      </div>

      {/* View button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/customer?LeadTemperature=${bucket.id}`);
        }}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-semibold tracking-wide border transition-all duration-200 cursor-pointer"
        style={{
          background: `color-mix(in srgb, ${cfg.color} 8%, transparent)`,
          borderColor: cfg.borderColor,
          color: cfg.color,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `color-mix(in srgb, ${cfg.color} 18%, transparent)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = `color-mix(in srgb, ${cfg.color} 8%, transparent)`;
        }}
      >
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M1 6s1.8-4 5-4 5 4 5 4-1.8 4-5 4-5-4-5-4z"/>
          <circle cx="6" cy="6" r="1.5" fill="currentColor" stroke="none"/>
        </svg>
        View leads
      </button>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const LeadTemperature: React.FC = () => {
  const [data, setData]       = useState<LeadTempData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<TempId | null>(null);

  const ORDER: TempId[] = ["hot", "warm", "cold"];

  const fetchData = async () => {
    setLoading(true);
    try {
      const customers = await getCustomer();

      const counts: Record<TempId, number> = { hot: 0, warm: 0, cold: 0 };

      customers.forEach((c: any) => {
        const t = (c.LeadTemperature ?? "").toLowerCase().trim() as TempId;
        if (t in counts) counts[t]++;
      });

      const total = counts.hot + counts.warm + counts.cold;

      const buckets: TempBucket[] = ORDER.map((id) => ({
        id,
        label: CONFIG[id].label,
        count: counts[id],
        pct:   total > 0 ? (counts[id] / total) * 100 : 0,
      }));

      setData({ buckets, total });
    } catch (e) {
      console.error("LeadTemperature fetch failed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Dominant temp
  const dominant = data
    ? data.buckets.reduce((a, b) => (b.count > a.count ? b : a), data.buckets[0])
    : null;

  const activeBucket = activeId ? data?.buckets.find((b) => b.id === activeId) : null;
  const displayCount = activeBucket ? activeBucket.count : data?.total ?? 0;
  const displayLabel = activeBucket ? CONFIG[activeBucket.id].label : "Total leads";
  const displayColor = activeBucket ? CONFIG[activeBucket.id].color : "var(--color-primary-darker)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      <div
        className="w-full rounded-2xl overflow-hidden bg-white max-sm:dark:bg-[var(--color-bgdark)] border border-[var(--color-primary-lighter)] max-sm:dark:border-[var(--color-bgdark)]"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          boxShadow: "0 2px 20px color-mix(in srgb, var(--color-primary) 7%, transparent), 0 1px 0 rgba(255,255,255,0.6)",
        }}
      >

        {/* ── HEADER ───────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[var(--color-primary-lighter)] max-sm:dark:border-[var(--color-primary-dark)]">
          <div className="flex items-center gap-3">
            {/* Thermometer icon */}
            <div className="relative w-4 flex flex-col items-center gap-0.5" aria-hidden="true">
              <div className="w-1.5 h-5 rounded-t-full rounded-b-none border border-[var(--color-primary-lighter)] overflow-hidden flex flex-col justify-end" style={{ background: "color-mix(in srgb, var(--color-secondary) 8%, transparent)" }}>
                <div className="w-full rounded-t-full" style={{ height: "60%", background: "linear-gradient(to top, #EF4444, #F59E0B)" }} />
              </div>
              <div className="size-3 rounded-full border border-[var(--color-primary-lighter)]" style={{ background: "#EF4444" }} />
            </div>
            <div>
              <h2
                className="text-base font-bold leading-tight text-[var(--color-primary-darker)] max-sm:dark:text-[var(--color-primary-lighter)]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Lead Temperature
              </h2>
              <p className="text-[11px] font-medium text-[var(--color-secondary)] opacity-50 mt-0.5 tracking-wide">
                Engagement heat index
              </p>
            </div>
          </div>

          {/* Live total pill */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border"
            style={{
              background: dominant ? `color-mix(in srgb, ${CONFIG[dominant.id].color} 7%, transparent)` : "transparent",
              borderColor: dominant ? CONFIG[dominant.id].borderColor : "var(--color-primary-lighter)",
            }}
          >
            {dominant && (
              <span
                className="size-1.5 rounded-full"
                style={{ background: CONFIG[dominant.id].color }}
              />
            )}
            <span
              className="text-[11px] font-bold"
              style={{ color: dominant ? CONFIG[dominant.id].color : "var(--color-secondary)" }}
            >
              {dominant ? `${CONFIG[dominant.id].label} dominant` : "No data"}
            </span>
          </div>
        </div>

        {/* ── BODY ─────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="p-5 flex flex-col gap-5">
            <Skeleton className="h-9 w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[0,1,2].map((i) => <Skeleton key={i} className="h-44" />)}
            </div>
          </div>
        ) : (
          <div className="p-5 flex flex-col gap-5">

            {/* Central stat */}
            <div className="flex items-baseline gap-3">
              <span
                className="text-4xl font-black leading-none transition-all duration-300"
                style={{
                  color: displayColor,
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                {displayCount.toLocaleString()}
              </span>
              <span
                className="text-sm font-semibold transition-colors duration-300"
                style={{ color: "var(--color-secondary)", opacity: 0.7 }}
              >
                {displayLabel}
              </span>
            </div>

            {/* Heat bar */}
            {data && (
              <HeatBar
                buckets={data.buckets}
                activeId={activeId}
                onHover={setActiveId}
              />
            )}

            {/* Temperature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(data?.buckets ?? []).map((b, i) => (
                <TempCard
                  key={b.id}
                  bucket={b}
                  total={data?.total ?? 0}
                  isActive={activeId === b.id}
                  onHover={setActiveId}
                  animDelay={i * 80}
                />
              ))}
            </div>

          </div>
        )}

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-primary-lighter)] max-sm:dark:border-[var(--color-primary-dark)]">
          <span className="text-[10px] font-medium tracking-widest uppercase opacity-90 text-slate-400">
            Updated just now
          </span>
          <div className="flex items-center gap-2">
            {ORDER.map((id) => {
              const cfg = CONFIG[id];
              return (
                <div key={id} className="flex items-center gap-1">
                  <span
                    className="size-1.5 rounded-full transition-all duration-200"
                    style={{
                      background: cfg.color,
                      opacity: activeId === null || activeId === id ? 1 : 0.2,
                      transform: activeId === id ? "scale(1.6)" : "scale(1)",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </>
  );
};

export default LeadTemperature;