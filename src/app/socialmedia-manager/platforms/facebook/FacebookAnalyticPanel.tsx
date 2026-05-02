"use client";

import { useEffect, useState, useRef } from "react";
import { getFacebookAnalytics } from "@/store/social-media/socialMedia";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES  — matches the actual API: { impressions, reach, accounts_engaged, follower_count }
// ─────────────────────────────────────────────────────────────────────────────

interface AnalyticsData {
  impressions: number;       // ← Facebook returns impressions, not profile_views
  reach: number;
  accounts_engaged: number;
  follower_count: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `${(n / 1_000).toFixed(1)}K`
  : String(n);

const engagementRate = (data: AnalyticsData) =>
  data.follower_count > 0
    ? ((data.accounts_engaged / data.follower_count) * 100).toFixed(1)
    : "0.0";

// Impression-to-reach ratio: how many impressions per unique person reached
const impressionsPerReach = (data: AnalyticsData) =>
  data.reach > 0 ? (data.impressions / data.reach).toFixed(2) : "—";

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED NUMBER
// ─────────────────────────────────────────────────────────────────────────────

function AnimatedNumber({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const duration = 900;
    const to = value;

    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayed(Math.round(to * eased));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);

  return <span>{fmt(displayed)}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// RADIAL RING (pure SVG)
// ─────────────────────────────────────────────────────────────────────────────

function RadialRing({
  percent, size = 80, stroke = 6, gradient, children,
}: {
  percent: number; size?: number; stroke?: number;
  gradient: [string, string]; children?: React.ReactNode;
}) {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  const id   = `fg-${gradient[0].replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={gradient[0]} />
          <stop offset="100%" stopColor={gradient[1]} />
        </linearGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f0f0f8" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke={`url(#${id})`} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${dash} ${circ - dash}`}
        style={{ transition: "stroke-dasharray 1s cubic-bezier(0.34,1.56,0.64,1)" }}
      />
      {children}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BAR CHART (SVG, animated)
// ─────────────────────────────────────────────────────────────────────────────

interface BarItem { label: string; value: number; gradient: [string, string] }

function BarChart({ items }: { items: BarItem[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);

  const max    = Math.max(...items.map((i) => i.value), 1);
  const h      = 120;
  const w      = 48;
  const gap    = 24;
  const totalW = items.length * (w + gap) - gap + 40;

  return (
    <svg viewBox={`0 0 ${totalW} ${h + 32}`} className="w-full" style={{ maxHeight: 160 }}>
      {items.map((item, i) => {
        const barH = mounted ? Math.max(8, (item.value / max) * h) : 4;
        const x    = i * (w + gap) + 20;
        const y    = h - barH;
        const gId  = `bfb-${i}`;
        return (
          <g key={item.label}>
            <defs>
              <linearGradient id={gId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor={item.gradient[0]} stopOpacity={0.9} />
                <stop offset="100%" stopColor={item.gradient[1]} stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <rect x={x} y={0} width={w} height={h} rx={8} fill="#f5f5fb" />
            <rect
              x={x} y={y} width={w} height={barH} rx={8}
              fill={`url(#${gId})`}
              style={{ transition: "y 1s cubic-bezier(0.34,1.56,0.64,1), height 1s cubic-bezier(0.34,1.56,0.64,1)" }}
            />
            <text x={x + w/2} y={y - 6}  textAnchor="middle" fontSize={11} fontWeight={700} fill="#4b4b6b">{fmt(item.value)}</text>
            <text x={x + w/2} y={h + 18} textAnchor="middle" fontSize={10} fontWeight={600} fill="#9898b8">{item.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// METRIC CARD
// ─────────────────────────────────────────────────────────────────────────────

function MetricCard({
  label, value, sub, icon, gradient, percent, delay = 0,
}: {
  label: string; value: number; sub: string; icon: React.ReactNode;
  gradient: [string, string]; percent: number; delay?: number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);

  return (
    <div
      className="relative bg-white rounded-2xl border border-[var(--color-primary-light)] p-5 overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? undefined : "translateY(12px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.07] pointer-events-none"
        style={{ background: gradient[0], transform: "translate(30%,-30%)" }} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gray)]">{label}</span>
          <span
            className="text-3xl font-black leading-none"
            style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            {visible ? <AnimatedNumber value={value} /> : "0"}
          </span>
          <span className="text-[11px] text-[var(--color-gray)] font-medium">{sub}</span>
        </div>

        <div className="relative flex-shrink-0">
          <RadialRing percent={visible ? percent : 0} size={72} stroke={5} gradient={gradient}>
            <foreignObject x={12} y={12} width={48} height={48}>
              <div className="w-12 h-12 flex items-center justify-center">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md"
                  style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}>
                  {icon}
                </div>
              </div>
            </foreignObject>
          </RadialRing>
        </div>
      </div>

      <div className="mt-4 h-1 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: visible ? `${Math.min(percent, 100)}%` : "0%",
            background: `linear-gradient(90deg, ${gradient[0]}, ${gradient[1]})`,
            transition: `width 1.2s cubic-bezier(0.34,1.56,0.64,1) ${delay + 200}ms`,
          }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGAGEMENT SCORE CARD
// ─────────────────────────────────────────────────────────────────────────────

function EngagementScoreCard({ data }: { data: AnalyticsData }) {
  const rate  = parseFloat(engagementRate(data));
  const score = Math.min(rate, 10);
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 400); return () => clearTimeout(t); }, []);

  const quality =
    rate >= 6 ? { label: "Excellent", color: "#22c55e" }
    : rate >= 3 ? { label: "Good",    color: "#3b82f6" }
    : rate >= 1 ? { label: "Average", color: "#f59e0b" }
    : { label: "Low", color: "#ef4444" };

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-primary-light)] p-6 shadow-sm flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-gray)]">Engagement Rate</h3>
          <p className="text-[11px] text-[var(--color-gray)] mt-0.5">accounts engaged / page followers</p>
        </div>
        <span
          className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border"
          style={{ color: quality.color, background: `${quality.color}15`, borderColor: `${quality.color}30` }}
        >
          {quality.label}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative flex-shrink-0">
          <RadialRing percent={visible ? (score / 10) * 100 : 0} size={100} stroke={8} gradient={["#1877f2", "#0a66c2"]}>
            <foreignObject x={20} y={20} width={60} height={60}>
              <div className="w-[60px] h-[60px] flex flex-col items-center justify-center">
                <span
                  className="text-xl font-black leading-none"
                  style={{ background: "linear-gradient(135deg,#1877f2,#0a66c2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                >
                  {rate}%
                </span>
              </div>
            </foreignObject>
          </RadialRing>
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--color-gray)]">Engaged</span>
            <span className="font-bold text-gray-700">{fmt(data.accounts_engaged)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--color-gray)]">Followers</span>
            <span className="font-bold text-gray-700">{fmt(data.follower_count)}</span>
          </div>
          <div className="h-px bg-gray-100 my-0.5" />
          <p className="text-[11px] text-[var(--color-gray)] leading-relaxed">
            {rate >= 3
              ? "Your audience is actively engaging with your page."
              : "Post consistently to improve engagement with your followers."}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPRESSIONS vs REACH CARD  (Facebook-specific — replaces generic funnel)
// ─────────────────────────────────────────────────────────────────────────────

function ImpressionsReachCard({ data }: { data: AnalyticsData }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 150); return () => clearTimeout(t); }, []);

  const stages = [
    { label: "Impressions",  value: data.impressions,      gradient: ["#1877f2", "#42a5f5"] as [string, string], hint: "Total times content was shown" },
    { label: "Reach",        value: data.reach,            gradient: ["#42a5f5", "#0d47a1"] as [string, string], hint: "Unique accounts who saw content" },
    { label: "Engaged",      value: data.accounts_engaged, gradient: ["#f59e0b", "#f97316"] as [string, string], hint: "Accounts that interacted" },
    { label: "Followers",    value: data.follower_count,   gradient: ["#22c55e", "#16a34a"] as [string, string], hint: "Total page followers" },
  ];
  const max = Math.max(...stages.map((s) => s.value), 1);

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-primary-light)] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-gray)]">Audience Funnel</h3>
        {data.reach > 0 && (
          <span className="text-[10px] text-blue-500 font-semibold bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
            {impressionsPerReach(data)}× avg. impressions/person
          </span>
        )}
      </div>
      <p className="text-[10px] text-[var(--color-gray)] mb-4">How your audience moves through each stage</p>

      <div className="flex flex-col gap-3">
        {stages.map((stage, i) => {
          const pct = (stage.value / max) * 100;
          return (
            <div key={stage.label}>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-[var(--color-gray)] w-24 flex-shrink-0 text-right leading-tight">{stage.label}</span>
                <div className="flex-1 h-7 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center justify-end pr-3"
                    style={{
                      width: mounted ? `${Math.max(pct, 4)}%` : "4%",
                      background: `linear-gradient(90deg, ${stage.gradient[0]}, ${stage.gradient[1]})`,
                      transition: `width 1s cubic-bezier(0.34,1.56,0.64,1) ${i * 100}ms`,
                    }}
                  >
                    <span className="text-[10px] font-black text-white drop-shadow">{fmt(stage.value)}</span>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-[var(--color-gray)] pl-[6.5rem] mt-0.5">{stage.hint}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FACEBOOK ANALYTICS PANEL  (main export)
// ─────────────────────────────────────────────────────────────────────────────

export default function FacebookAnalyticsPanel() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const res = await getFacebookAnalytics();
    if (res?.success && res.analytics) {
      setData(res.analytics);
    } else {
      setError("Could not load analytics. Make sure your Facebook page is connected.");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-[var(--color-primary-lighter)]" />)}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="h-48 rounded-2xl bg-[var(--color-primary-lighter)]" />
          <div className="h-48 rounded-2xl bg-[var(--color-primary-lighter)]" />
        </div>
        <div className="h-52 rounded-2xl bg-[var(--color-primary-lighter)]" />
      </div>
    );
  }

  // ── Error state ──
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
          <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-700 text-center">{error}</p>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[var(--color-primary)] border border-[var(--color-primary-light)] bg-white hover:bg-[var(--color-primary-lighter)] transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retry
        </button>
      </div>
    );
  }

  // ── Metric cards — uses impressions instead of profile_views ──
  const maxVal = Math.max(data.impressions, data.reach, data.accounts_engaged, data.follower_count, 1);

  const metrics = [
    {
      label: "Impressions",
      value: data.impressions,
      sub: "Total content views",
      gradient: ["#1877f2", "#42a5f5"] as [string, string],
      percent: (data.impressions / maxVal) * 100,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      label: "Reach",
      value: data.reach,
      sub: "Unique accounts reached",
      gradient: ["#0d47a1", "#1877f2"] as [string, string],
      percent: (data.reach / maxVal) * 100,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Engaged",
      value: data.accounts_engaged,
      sub: "Accounts that interacted",
      gradient: ["#f59e0b", "#f97316"] as [string, string],
      percent: (data.accounts_engaged / maxVal) * 100,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      label: "Followers",
      value: data.follower_count,
      sub: "Total page followers",
      gradient: ["#22c55e", "#16a34a"] as [string, string],
      percent: (data.follower_count / maxVal) * 100,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const barItems = [
    { label: "Impressions", value: data.impressions,      gradient: ["#1877f2", "#42a5f5"] as [string, string] },
    { label: "Reach",       value: data.reach,            gradient: ["#0d47a1", "#1877f2"] as [string, string] },
    { label: "Engaged",     value: data.accounts_engaged, gradient: ["#f59e0b", "#f97316"] as [string, string] },
    { label: "Followers",   value: data.follower_count,   gradient: ["#22c55e", "#16a34a"] as [string, string] },
  ];

  // ── Dynamic insight copy ──
  const insightText =
    data.impressions > data.reach
      ? `Your content was seen ${impressionsPerReach(data)}× per person on average — strong content visibility!`
      : data.accounts_engaged > 0
      ? `${engagementRate(data)}% of your followers engaged with your page this period.`
      : "Start posting to grow your Facebook page reach and engagement.";

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#1877f2,#0a66c2)" }}
          >
            {/* Facebook "f" icon */}
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-black text-[var(--color-primary-darker)]">Facebook Analytics</h3>
            <p className="text-[10px] text-[var(--color-gray)]">Last 30 days · via Facebook Graph API</p>
          </div>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--color-primary)] border border-[var(--color-primary-light)] bg-white hover:bg-[var(--color-primary-lighter)] transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* 4 metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((m, i) => (
          <MetricCard key={m.label} {...m} delay={i * 80} />
        ))}
      </div>

      {/* Engagement ring + Funnel */}
      <div className="grid sm:grid-cols-2 gap-4">
        <EngagementScoreCard data={data} />
        <ImpressionsReachCard data={data} />
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-2xl border border-[var(--color-primary-light)] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-gray)]">Metrics Comparison</h3>
          <span className="text-[10px] text-[var(--color-gray)] bg-gray-50 border border-gray-100 px-2 py-1 rounded-full">
            All metrics · current period
          </span>
        </div>
        <BarChart items={barItems} />
      </div>

      {/* Facebook-branded insight strip */}
      <div
        className="rounded-2xl p-5 text-white"
        style={{ background: "linear-gradient(135deg,#0d47a1 0%,#1877f2 55%,#42a5f5 100%)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-white/70">Quick Insight</p>
            <p className="text-sm font-semibold mt-1 leading-relaxed">{insightText}</p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-center">
              <p className="text-xl font-black">{engagementRate(data)}%</p>
              <p className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">Eng. Rate</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-xl font-black">{fmt(data.impressions)}</p>
              <p className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">Impressions</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-xl font-black">{fmt(data.reach)}</p>
              <p className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">Reach</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}