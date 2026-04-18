"use client"
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { dataMining } from '@/store/customer'

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface MiningData {
  summary:            { overview: string; conversionHealth: string }
  kpis: {
    totalLeads7d:     number
    totalLeads30d:    number
    totalLeads:       number
    conversionRate:   number
    topCampaign:      string
    topCity:          string
  }
  topPerformers: {
    campaign: { name: string; leads: number; conversions: number | null; conversionRate: number | null }
    city:     { name: string; leads: number }
  }
  funnelAnalysis:     { hot: number; warm: number; cold: number; dominantStage: string }
  engagementAnalysis: { avgFollowupsPerLead: number; avgCallsPerLead: number; engagementQuality: string }
  budgetAnalysis:     { topSegment: string; distribution: Record<string, number> }
  problems:           { id: string; title: string; impact: string }[]
  actions:            { id: string; priority: string; title: string; description: string }[]
}

type TabKey = 'overview' | 'funnel' | 'problems' | 'actions'
type Phase  = 'idle' | 'analyzing' | 'done'

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const TABS = [
  { key: 'overview' as TabKey, label: 'Overview',  color: '#0369a1', bg: 'rgba(3,105,161,0.07)'   },
  { key: 'funnel'   as TabKey, label: 'Funnel',    color: '#7c3aed', bg: 'rgba(124,58,237,0.07)'  },
  { key: 'problems' as TabKey, label: 'Problems',  color: '#dc2626', bg: 'rgba(220,38,38,0.07)'   },
  { key: 'actions'  as TabKey, label: 'Actions',   color: '#059669', bg: 'rgba(5,150,105,0.07)'   },
] as const

const STEPS = [
  { label: 'Connecting to lead database',   sub: 'Fetching all lead records…'           },
  { label: 'Scanning behavioural patterns', sub: 'Analysing source, geo, budget data…'  },
  { label: 'Evaluating conversion funnel',  sub: 'Mapping cold → warm → hot flow…'      },
  { label: 'Assessing risk exposure',       sub: 'Checking single points of failure…'   },
  { label: 'Generating recommendations',    sub: 'Prioritising findings by impact…'     },
]

const SCAN_CHIPS = [
  '2,608 leads', 'Jaipur', 'Agent campaign',
  '0-20L segment', '4.5× avg calls', 'Cold stage',
  'Funnel gaps', 'Budget spread',
]

const PRIORITY_STYLE: Record<string, { bg: string; color: string }> = {
  High:   { bg: 'rgba(220,38,38,0.08)',  color: '#b91c1c' },
  Medium: { bg: 'rgba(217,119,6,0.09)',  color: '#92400e' },
  Low:    { bg: 'rgba(5,150,105,0.08)',  color: '#065f46' },
}

const HEALTH_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  Poor:  { bg: 'rgba(220,38,38,0.08)',  color: '#b91c1c', dot: '#ef4444' },
  Fair:  { bg: 'rgba(217,119,6,0.09)',  color: '#92400e', dot: '#f59e0b' },
  Good:  { bg: 'rgba(5,150,105,0.08)',  color: '#065f46', dot: '#10b981' },
  Great: { bg: 'rgba(5,150,105,0.08)',  color: '#065f46', dot: '#10b981' },
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const fmtTime  = (d: Date | null) =>
  d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

const nullFmt = (v: number | null | undefined, suffix = '') =>
  v == null ? '—' : `${v}${suffix}`

/* ─────────────────────────────────────────────
   ICONS
───────────────────────────────────────────── */
const StarIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
)

const RefreshIcon = () => (
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="white"
    strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 4v6h6M23 20v-6h-6" />
    <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
  </svg>
)

const AlertIcon = ({ color }: { color: string }) => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const CheckIcon = ({ color }: { color: string }) => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const SpinnerIcon = ({ size = 14, color = '#0369a1' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    style={{ animation: 'dm-spin .7s linear infinite', flexShrink: 0 }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
)

/* ─────────────────────────────────────────────
   BADGE
───────────────────────────────────────────── */
const Badge = ({ label, style }: { label: string; style: { bg: string; color: string; dot?: string } }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0"
    style={{ background: style.bg, color: style.color }}>
    {style.dot && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: style.dot }} />}
    {label}
  </span>
)

/* ─────────────────────────────────────────────
   IDLE STATE
───────────────────────────────────────────── */
const IdleState = ({ onStart }: { onStart: () => void }) => (
  <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
      style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
      <svg width="26" height="26" fill="none" stroke="#94a3b8" viewBox="0 0 24 24"
        strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
      </svg>
    </div>
    <p className="text-[13.5px] font-semibold text-slate-700 mb-1.5">No analysis yet</p>
    <p className="text-[11.5px] text-slate-400 mb-6 max-w-[240px] leading-relaxed">
      Run the AI analyser to surface funnel issues, risks and action items from your CRM.
    </p>
    <button onClick={onStart}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[12px] font-semibold active:scale-95"
      style={{ background: '#0369a1', border: 'none', cursor: 'pointer', transition: 'background 150ms' }}
      onMouseEnter={e => (e.currentTarget.style.background = '#075985')}
      onMouseLeave={e => (e.currentTarget.style.background = '#0369a1')}>
      <StarIcon size={12} color="white" />
      Run analysis
    </button>
  </div>
)

/* ─────────────────────────────────────────────
   RADAR LOADER — creative AI scanning state
───────────────────────────────────────────── */
const AnalyzingState = ({ currentStep }: { currentStep: number }) => {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1600)
    return () => clearInterval(t)
  }, [])

  const pct        = Math.round((currentStep / STEPS.length) * 100)
  const activeStep = STEPS[Math.max(0, currentStep - 1)]
  const chip1      = SCAN_CHIPS[tick % SCAN_CHIPS.length]
  const chip2      = SCAN_CHIPS[(tick + 3) % SCAN_CHIPS.length]

  /* scattered data dot positions on the radar */
  const dots = [
    { cx: 148, cy: 42,  delay: '0s'    },
    { cx: 44,  cy: 58,  delay: '0.47s' },
    { cx: 158, cy: 108, delay: '0.93s' },
    { cx: 28,  cy: 130, delay: '1.4s'  },
    { cx: 110, cy: 158, delay: '1.86s' },
    { cx: 68,  cy: 22,  delay: '2.33s' },
  ]

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 select-none">

      {/* ── Radar visualisation ── */}
      <div className="relative mb-7" style={{ width: 180, height: 180 }}>

        {/* concentric grid rings */}
        {[52, 74, 90].map((r, i) => (
          <div key={r} className="absolute rounded-full"
            style={{
              width: r * 2, height: r * 2, top: 90 - r, left: 90 - r,
              border: '1px solid rgba(3,105,161,0.11)',
              animation: 'dm-ring-pulse 3.4s ease-in-out infinite',
              animationDelay: `${i * 0.9}s`,
            }} />
        ))}

        {/* cross-hair lines (static) */}
        <svg className="absolute inset-0" width="180" height="180" viewBox="0 0 180 180">
          <line x1="90" y1="0" x2="90" y2="180" stroke="rgba(3,105,161,0.07)" strokeWidth="1" />
          <line x1="0" y1="90" x2="180" y2="90" stroke="rgba(3,105,161,0.07)" strokeWidth="1" />
        </svg>

        {/* rotating radar sweep */}
        <div className="absolute inset-0" style={{ animation: 'dm-radar-spin 2.8s linear infinite' }}>
          <svg width="180" height="180" viewBox="0 0 180 180">
            <defs>
              <radialGradient id="sweepG" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#0369a1" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0"    />
              </radialGradient>
            </defs>
            {/* 65° sweep sector */}
            <path d="M90,90 L90,0 A90,90 0 0,1 173.2,45 Z" fill="url(#sweepG)" />
            <line x1="90" y1="90" x2="90" y2="0"
              stroke="#0369a1" strokeWidth="1.2" strokeOpacity="0.4" />
          </svg>
        </div>

        {/* blinking discovered data dots */}
        {dots.map((d, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              width: 6, height: 6, left: d.cx - 3, top: d.cy - 3,
              background: '#0369a1',
              animation: 'dm-dot-blink 2.8s ease-in-out infinite',
              animationDelay: d.delay,
            }} />
        ))}

        {/* pulsing center core */}
        <div className="absolute flex items-center justify-center rounded-full"
          style={{
            width: 44, height: 44, top: 68, left: 68,
            background: 'rgba(3,105,161,0.07)',
            border: '1px solid rgba(3,105,161,0.18)',
            animation: 'dm-core-pulse 2.2s ease-in-out infinite',
          }}>
          <div className="rounded-full" style={{ width: 12, height: 12, background: '#0369a1', opacity: 0.65 }} />
        </div>
      </div>

      {/* status text */}
      <p className="text-[13.5px] font-semibold text-slate-800 mb-1 text-center">
        Scanning your CRM
      </p>
      <p className="text-[11.5px] text-slate-400 mb-5 text-center" style={{ minHeight: 18 }}>
        {activeStep?.label ?? 'Processing…'}
      </p>

      {/* cycling data chips */}
      <div className="flex gap-2 mb-6" style={{ height: 28 }}>
        {[chip1, chip2].map((chip, i) => (
          <span key={`${chip}-${tick}-${i}`}
            className="px-2.5 py-1 rounded-full text-[10.5px] font-medium"
            style={{
              background: 'rgba(3,105,161,0.06)',
              border: '1px solid rgba(3,105,161,0.14)',
              color: '#0369a1',
              animation: 'dm-chip-in 0.35s ease both',
              animationDelay: `${i * 90}ms`,
            }}>
            {chip}
          </span>
        ))}
      </div>

      {/* progress */}
      <div className="w-full" style={{ maxWidth: 256 }}>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] text-slate-400">Step {currentStep} of {STEPS.length}</span>
          <span className="text-[10px] font-semibold" style={{ color: '#0369a1' }}>{pct}%</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
          <div className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #0369a1, #7c3aed)',
              transition: 'width 700ms cubic-bezier(0.4,0,0.2,1)',
            }} />
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   TAB: OVERVIEW
───────────────────────────────────────────── */
const OverviewTab = ({ data }: { data: MiningData }) => {
  const health = data.summary.conversionHealth
  const hs     = HEALTH_STYLE[health] ?? HEALTH_STYLE.Poor
  const total  = data.funnelAnalysis.hot + data.funnelAnalysis.warm + data.funnelAnalysis.cold

  const kpis = [
    { label: 'Leads (7d)',  value: String(data.kpis.totalLeads7d),              color: '#0369a1' },
    { label: 'Leads (30d)', value: data.kpis.totalLeads30d.toLocaleString(),    color: '#7c3aed' },
    { label: 'Total leads', value: data.kpis.totalLeads.toLocaleString(),       color: '#0369a1' },
    { label: 'Conv. rate',  value: `${data.kpis.conversionRate}%`,
      color: data.kpis.conversionRate === 0 ? '#dc2626' : '#059669' },
  ]

  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4"
      style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>

      {/* Health banner */}
      <div className="rounded-xl border p-4"
        style={{ background: hs.bg, borderColor: `${hs.dot}28` }}>
        <div className="flex items-center gap-2 mb-2">
          <AlertIcon color={hs.color} />
          <span className="text-[11.5px] font-semibold" style={{ color: hs.color }}>
            Conversion health · {health}
          </span>
          <Badge label={health} style={hs} />
        </div>
        <p className="text-[11.5px] leading-relaxed" style={{ color: '#475569' }}>
          {data.summary.overview}
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {kpis.map(k => (
          <div key={k.label} className="bg-white border border-slate-100 rounded-xl p-3.5"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <p className="text-[10px] text-slate-400 mb-1.5">{k.label}</p>
            <p className="text-[20px] font-bold leading-none" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Top performers */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Top performers</p>
        <div className="flex flex-col gap-2">

          {/* Campaign */}
          <div className="bg-white border border-slate-100 rounded-xl p-3.5"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10.5px] text-slate-400">Best campaign</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(3,105,161,0.07)', color: '#0369a1' }}>
                {data.topPerformers.campaign.name}
              </span>
            </div>
            <div className="flex gap-4">
              {([
                ['Leads',       String(data.topPerformers.campaign.leads)],
                ['Conversions', nullFmt(data.topPerformers.campaign.conversions)],
                ['Conv. rate',  nullFmt(data.topPerformers.campaign.conversionRate, '%')],
              ] as [string, string][]).map(([l, v]) => (
                <div key={l}>
                  <p className="text-[9.5px] text-slate-400 mb-0.5">{l}</p>
                  <p className="text-[13.5px] font-semibold"
                    style={{ color: v === '—' ? '#cbd5e1' : '#334155' }}>{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* City */}
          <div className="bg-white border border-slate-100 rounded-xl p-3.5"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10.5px] text-slate-400">Top city</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(5,150,105,0.07)', color: '#059669' }}>
                {data.topPerformers.city.name}
              </span>
            </div>
            <p className="text-[9.5px] text-slate-400">
              {data.topPerformers.city.leads.toLocaleString()} leads ·{' '}
              {Math.round((data.topPerformers.city.leads / total) * 100)}% of total
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   TAB: FUNNEL
───────────────────────────────────────────── */
const FunnelTab = ({ data }: { data: MiningData }) => {
  const { hot, warm, cold } = data.funnelAnalysis
  const total = hot + warm + cold

  const stages = [
    { label: 'Hot',  count: hot,  color: '#dc2626', bar: '#f87171' },
    { label: 'Warm', count: warm, color: '#d97706', bar: '#fbbf24' },
    { label: 'Cold', count: cold, color: '#0369a1', bar: '#7dd3fc' },
  ]

  const budgetEntries = Object.entries(data.budgetAnalysis.distribution)
  const maxBudget     = Math.max(...budgetEntries.map(([, v]) => v))

  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4"
      style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>

      {/* Funnel stages */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Lead stages</p>
        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          {stages.map((s, i) => {
            const pct = Math.round((s.count / total) * 100)
            return (
              <div key={s.label} className="px-4 py-3 flex items-center gap-3"
                style={{ borderBottom: i < stages.length - 1 ? '0.5px solid #f8fafc' : 'none' }}>
                <span className="text-[11px] font-semibold flex-shrink-0"
                  style={{ width: 30, color: s.color }}>{s.label}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
                  <div className="h-full rounded-full"
                    style={{
                      width: `${pct}%`, background: s.bar,
                      transition: 'width 800ms cubic-bezier(0.4,0,0.2,1)',
                    }} />
                </div>
                <span className="text-[11px] font-semibold text-slate-700 text-right" style={{ width: 44 }}>
                  {s.count.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 text-right" style={{ width: 30 }}>{pct}%</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Engagement */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Engagement</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Avg follow-ups', value: `${data.engagementAnalysis.avgFollowupsPerLead}×` },
            { label: 'Avg calls',      value: `${data.engagementAnalysis.avgCallsPerLead}×`      },
            { label: 'Quality',        value: data.engagementAnalysis.engagementQuality           },
          ].map(e => (
            <div key={e.label} className="bg-white border border-slate-100 rounded-xl p-3 text-center"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <p className="text-[9.5px] text-slate-400 mb-1.5">{e.label}</p>
              <p className="text-[14px] font-bold text-slate-700">{e.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Budget distribution</p>
        <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col gap-3"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          {budgetEntries.map(([seg, count]) => {
            const pct   = Math.round((count / maxBudget) * 100)
            const isTop = seg === data.budgetAnalysis.topSegment
            return (
              <div key={seg} className="flex items-center gap-3">
                <span className="text-[10.5px] text-slate-500 flex-shrink-0" style={{ width: 56 }}>{seg}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
                  <div className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: isTop ? '#0369a1' : '#cbd5e1' }} />
                </div>
                <span className="text-[10.5px] font-semibold text-slate-600 text-right" style={{ width: 20 }}>
                  {count}
                </span>
                {isTop && <Badge label="Top" style={{ bg: 'rgba(3,105,161,0.08)', color: '#075985' }} />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   TAB: PROBLEMS
───────────────────────────────────────────── */
const ProblemsTab = ({ data }: { data: MiningData }) => (
  <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3"
    style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
    {data.problems.map((p, i) => (
      <div key={p.id}
        className="bg-white border border-slate-100 rounded-xl p-4"
        style={{
          borderLeft: '2.5px solid #f87171',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          animation: 'dm-cardstream .38s ease both',
          animationDelay: `${i * 75}ms`,
        }}>
        <div className="flex items-start gap-2 mb-2">
          <AlertIcon color="#dc2626" />
          <p className="text-[12.5px] font-semibold text-slate-800 leading-snug">{p.title}</p>
        </div>
        <p className="text-[11.5px] leading-relaxed pl-5" style={{ color: '#64748b' }}>{p.impact}</p>
        <p className="text-[9.5px] font-bold uppercase tracking-widest mt-3 pl-5" style={{ color: '#fca5a5' }}>
          Problem {p.id}
        </p>
      </div>
    ))}
  </div>
)

/* ─────────────────────────────────────────────
   TAB: ACTIONS
───────────────────────────────────────────── */
const ActionsTab = ({ data }: { data: MiningData }) => (
  <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3"
    style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
    {data.actions.map((a, i) => {
      const ps = PRIORITY_STYLE[a.priority] ?? PRIORITY_STYLE.Low
      return (
        <div key={a.id}
          className="bg-white border border-slate-100 rounded-xl p-4"
          style={{
            borderLeft: '2.5px solid #6ee7b7',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            animation: 'dm-cardstream .38s ease both',
            animationDelay: `${i * 75}ms`,
          }}>
          <div className="flex items-start gap-2 mb-2">
            <CheckIcon color="#059669" />
            <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
              <p className="text-[12.5px] font-semibold text-slate-800 leading-snug">{a.title}</p>
              <Badge label={a.priority} style={ps} />
            </div>
          </div>
          <p className="text-[11.5px] leading-relaxed pl-5" style={{ color: '#64748b' }}>{a.description}</p>
          <p className="text-[9.5px] font-bold uppercase tracking-widest mt-3 pl-5" style={{ color: '#6ee7b7' }}>
            Action {a.id}
          </p>
        </div>
      )
    })}
  </div>
)

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const AnalyticsAgentWorkspace = ({ isOpen }: { isOpen: boolean }) => {
  const [phase,        setPhase]        = useState<Phase>('idle')
  const [data,         setData]         = useState<MiningData | null>(null)
  const [activeTab,    setActiveTab]    = useState<TabKey>('overview')
  const [currentStep,  setCurrentStep]  = useState(0)
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }

  const runAnalysis = useCallback(async () => {
    clearTimers()
    setPhase('analyzing')
    setCurrentStep(0)

    STEPS.forEach((_, i) => {
      const t = setTimeout(() => setCurrentStep(i + 1), i * 850 + 600)
      timersRef.current.push(t)
    })

    let result: any = null
    try { result = await dataMining() } catch (e) { console.error(e) }

    const totalAnim = STEPS.length * 850 + 800
    const t = setTimeout(() => {
      if (result?.data) setData(result.data as MiningData)
      setLastAnalyzed(new Date())
      setPhase('done')
    }, totalAnim)
    timersRef.current.push(t)
  }, [])

  useEffect(() => {
    if (isOpen && phase === 'idle') runAnalysis()
    return () => clearTimers()
  }, [isOpen])

  const sidebarStats: [string, string][] = data ? [
    ['Leads (7d)',  String(data.kpis.totalLeads7d)],
    ['Leads (30d)', data.kpis.totalLeads30d.toLocaleString()],
    ['Conv. rate',  `${data.kpis.conversionRate}%`],
    ['Top city',    data.kpis.topCity],
  ] : [
    ['Leads (7d)', '—'], ['Leads (30d)', '—'], ['Conv. rate', '—'], ['Top city', '—'],
  ]

  const tabCount = (key: TabKey): number => {
    if (!data) return 0
    if (key === 'overview')  return 4
    if (key === 'funnel')    return 3
    if (key === 'problems')  return data.problems.length
    if (key === 'actions')   return data.actions.length
    return 0
  }

  const tab = TABS.find(t => t.key === activeTab)!

  return (
    <div className="flex h-full overflow-hidden rounded-xl" style={{ background: '#f8fafc' }}>

      {/* ══ SIDEBAR ══ */}
      <div className="flex flex-col border-r"
        style={{ width: 204, minWidth: 204, borderColor: '#eaecf0', background: '#fff' }}>

        {/* Branding */}
        <div className="px-4 pt-4 pb-3 flex-shrink-0" style={{ borderBottom: '0.5px solid #f1f5f9' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(3,105,161,0.1)' }}>
              <svg width="13" height="13" fill="none" stroke="#0369a1" viewBox="0 0 24 24"
                strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Data Mining</span>
          </div>

          {/* Status pill */}
          <div className="flex items-center gap-2 rounded-lg px-2.5 py-2"
            style={
              phase === 'analyzing' ? { background: '#f0f9ff', border: '1px solid #bae6fd' } :
              phase === 'done'      ? { background: '#f0fdf4', border: '1px solid #bbf7d0' } :
                                      { background: '#f8fafc', border: '1px solid #e2e8f0' }
            }>
            {phase === 'analyzing'
              ? <SpinnerIcon size={7} color="#0369a1" />
              : phase === 'done'
              ? <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"
                  style={{ boxShadow: '0 0 0 2.5px rgba(34,197,94,0.2)' }} />
              : <span className="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0" />
            }
            <span className="text-[10.5px] font-medium"
              style={{ color: phase === 'analyzing' ? '#0369a1' : phase === 'done' ? '#166534' : '#94a3b8' }}>
              {phase === 'analyzing' ? 'Scanning…' : phase === 'done' ? `Done · ${fmtTime(lastAnalyzed)}` : 'Ready'}
            </span>
          </div>
        </div>

        {/* Nav */}
        <div className="px-2 pt-2 flex-1">
          {TABS.map(t => {
            const active = t.key === activeTab
            return (
              <button key={t.key}
                onClick={() => phase === 'done' && setActiveTab(t.key)}
                className="w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2 mb-0.5"
                style={{
                  background: active ? t.bg : 'transparent',
                  color:      active ? t.color : '#64748b',
                  cursor:     phase === 'done' ? 'pointer' : 'default',
                  border:     'none',
                  opacity:    phase === 'analyzing' ? 0.45 : 1,
                  transition: 'background 120ms, color 120ms',
                }}>
                <span className="text-[12px] font-medium flex-1">{t.label}</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: active ? 'rgba(255,255,255,0.65)' : '#f1f5f9',
                    color:      active ? t.color : '#94a3b8',
                  }}>
                  {phase === 'done' ? tabCount(t.key) : '—'}
                </span>
              </button>
            )
          })}
        </div>

        {/* Quick stats */}
        <div className="p-3 flex-shrink-0" style={{ borderTop: '0.5px solid #f1f5f9' }}>
          <div className="rounded-lg p-3" style={{ background: '#f8fafc' }}>
            <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400 mb-2">Quick stats</p>
            {sidebarStats.map(([k, v]) => (
              <div key={k} className="flex justify-between items-center mb-1.5 last:mb-0">
                <span className="text-[10px] text-slate-400">{k}</span>
                <span className="text-[10.5px] font-semibold"
                  style={{ color: phase === 'done' ? '#334155' : '#cbd5e1' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ MAIN PANEL ══ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {phase === 'idle'      && <IdleState onStart={runAnalysis} />}
        {phase === 'analyzing' && <AnalyzingState currentStep={currentStep} />}
        {phase === 'done' && data && (
          <>
            {/* Top bar */}
            <div className="flex-shrink-0 px-5 py-3 border-b flex items-center gap-3"
              style={{ background: '#fff', borderColor: '#eaecf0' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: tab.bg }}>
                <StarIcon size={13} color={tab.color} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800">{tab.label}</p>
                <p className="text-[10.5px] text-slate-400">{tabCount(activeTab)} items · {fmtTime(lastAnalyzed)}</p>
              </div>
              <button onClick={runAnalysis}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-[11px] font-semibold active:scale-95"
                style={{ background: '#0369a1', border: 'none', cursor: 'pointer', transition: 'background 150ms' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#075985')}
                onMouseLeave={e => (e.currentTarget.style.background = '#0369a1')}>
                <RefreshIcon />
                Re-analyse
              </button>
            </div>

            {/* Content */}
            {activeTab === 'overview'  && <OverviewTab  data={data} />}
            {activeTab === 'funnel'    && <FunnelTab    data={data} />}
            {activeTab === 'problems'  && <ProblemsTab  data={data} />}
            {activeTab === 'actions'   && <ActionsTab   data={data} />}
          </>
        )}
      </div>

      <style>{`
        @keyframes dm-spin        { to { transform: rotate(360deg); } }
        @keyframes dm-radar-spin  { to { transform: rotate(360deg); } }
        @keyframes dm-ring-pulse  { 0%,100%{ opacity:.3 }  50%{ opacity:.85 } }
        @keyframes dm-dot-blink   { 0%,100%{ opacity:0; transform:scale(.35) } 30%,70%{ opacity:1; transform:scale(1) } }
        @keyframes dm-core-pulse  { 0%,100%{ transform:scale(1);   opacity:.75 } 50%{ transform:scale(1.14); opacity:1 } }
        @keyframes dm-chip-in     { from{ opacity:0; transform:translateY(5px) } to{ opacity:1; transform:translateY(0) } }
        @keyframes dm-cardstream  { from{ opacity:0; transform:translateX(-7px) } to{ opacity:1; transform:translateX(0) } }
      `}</style>
    </div>
  )
}

export default AnalyticsAgentWorkspace