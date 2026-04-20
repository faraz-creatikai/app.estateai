"use client"
import { getRedditPosts, getFacebookPosts, scrapNewPosts, scrapNewInstaPosts, getInstagramPosts, saveLeadsToDB } from '@/store/social-content/socialContent'
import React, { useEffect, useRef, useState, useCallback, KeyboardEvent } from 'react'
import { GrLike } from 'react-icons/gr'

/* ═══════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════ */
export type SourceType = 'reddit' | 'facebook' | 'instagram'

interface RedditPost {
  title: string
  text: string
  subreddit: string
  author: string
  upvotes: number
  comments: number
  url: string
  source?: 'reddit'
}

interface FacebookPost {
  title: string
  text: string
  source: 'facebook'
  author: string
  authorId: string | null
  likes: number
  comments: number
  shares: number
  engagementScore: number
  media: string[]
  hasMedia: boolean
  isVideo: boolean
  groupId?: string
  url: string
  externalLink: string | null
  createdAt: string
}

type SocialPost = RedditPost | FacebookPost

interface Trend { keyword: string; insight: string; confidence: 'high' | 'medium' | 'low' }
interface DemandSignal { type: string; location: string; description: string }
interface Opportunity { title: string; action: string }
interface SocialInsights {
  summary: string
  trends: Trend[]
  demandSignals: DemandSignal[]
  sentiment: { positive: number; neutral: number; negative: number }
  opportunities: Opportunity[]
}

interface SocialPagination {
  datasetId: string
  count: number
  after?: string | null
  hasMore?: boolean
}

interface SocialData {
  success: boolean
  posts: SocialPost[]
  pagination: SocialPagination
  insights: SocialInsights
}

type MsgStatus = 'fetching' | 'done' | 'error'
interface ChatMessage {
  id: string
  query: string
  status: MsgStatus
  step: number
  posts: SocialPost[]
  insights: SocialInsights | null
  pagination: SocialPagination
  loadingMore: boolean
  fetchedAt: Date | null
}

type TabKey = 'posts' | 'insights' | 'signals' | 'opps'

/* ═══════════════════════════════════════════════
   SCRAPER PARAMS (new)
═══════════════════════════════════════════════ */
export interface FacebookScraperParams {
  groupUrls: string[]
  limit?: number
  days?: number
}

export interface InstagramScraperParams {
  hashtags: string[]
  limit?: number
  days?: number
}

export type ScraperParams = FacebookScraperParams | InstagramScraperParams | {}

/* ═══════════════════════════════════════════════
   SOURCE REGISTRY
═══════════════════════════════════════════════ */
export interface SourceConfig {
  id: SourceType
  label: string
  color: string
  colorSoft: string
  fetchSteps: readonly string[]
  scanChips: readonly string[]
  suggestedQueries: readonly string[]
  scrapFn?: (data: any) => Promise<any>
}

const SOURCE_REGISTRY: SourceConfig[] = [
  {
    id: 'facebook',
    label: 'Facebook',
    color: '#1877F2',
    colorSoft: 'rgba(24,119,242,0.09)',
    fetchSteps: [
      'Connecting to Facebook API…',
      'Loading posts from database…',
      'Detecting engagement patterns…',
      'Scoring opportunities…',
      'Packaging insights…',
    ],
    scanChips: [
      'Page posts', 'Engagement score', 'Reactions',
      'Share patterns', 'Comment threads', 'Pages',
      'Intent mining', 'Opportunity score',
    ],
    suggestedQueries: [],
    scrapFn: scrapNewPosts,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    color: '#EE2A7B',
    colorSoft: 'rgba(238,42,123,0.08)',
    fetchSteps: [
      'Connecting to Instagram API…',
      'Loading posts from database…',
      'Analysing visual content…',
      'Scoring opportunities…',
      'Packaging insights…',
    ],
    scanChips: [
      'Reels', 'Engagement score', 'Likes',
      'Hashtags', 'Comment threads', 'Accounts',
      'Intent mining', 'Opportunity score',
    ],
    suggestedQueries: [],
    scrapFn: scrapNewInstaPosts,
  },
  {
    id: 'reddit',
    label: 'Reddit',
    color: '#FF4500',
    colorSoft: 'rgba(255,69,0,0.09)',
    fetchSteps: [
      'Connecting to Reddit API…',
      'Scanning post signals…',
      'Detecting demand patterns…',
      'Scoring opportunities…',
      'Packaging insights…',
    ],
    scanChips: [
      'Reddit posts', 'Demand signals', 'Property',
      'Upvote patterns', 'Comment threads', 'Subreddits',
      'Intent mining', 'Opportunity score',
    ],
    suggestedQueries: [
      'Property investment Jaipur 2026',
      'Best areas to live in Bangalore',
      'Startup jobs remote India',
      'EV cars buying advice India',
    ],
  },
]

const getSourceConfig = (id: SourceType): SourceConfig =>
  SOURCE_REGISTRY.find(s => s.id === id)!

/* ═══════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════ */
const TABS = [
  { key: 'posts' as TabKey, label: 'Posts', color: '#0369a1', bg: 'rgba(3,105,161,0.08)' },
  { key: 'insights' as TabKey, label: 'Insights', color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  { key: 'signals' as TabKey, label: 'Signals', color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
  { key: 'opps' as TabKey, label: 'Opps', color: '#059669', bg: 'rgba(5,150,105,0.08)' },
] as const

const CONF_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  high: { bg: 'rgba(5,150,105,0.08)', color: '#065f46', dot: '#10b981' },
  medium: { bg: 'rgba(217,119,6,0.09)', color: '#92400e', dot: '#f59e0b' },
  low: { bg: 'rgba(100,116,139,0.08)', color: '#475569', dot: '#94a3b8' },
}

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
const fmtTime = (d: Date | null) =>
  d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
const fmtNum = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
const fmtDate = (iso: string) => {
  try { return new Date(iso).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return '' }
}
const uid = () => Math.random().toString(36).slice(2, 9)

/* ═══════════════════════════════════════════════
   ICONS
═══════════════════════════════════════════════ */
const SendIcon = ({ color = 'white' }: { color?: string }) => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)
const RefreshIcon = ({ color = '#64748b', size = 12 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 4v6h6M23 20v-6h-6" />
    <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
  </svg>
)
const ArrowUpIcon = () => (<svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>)
const ChatBubbleIcon = () => (<svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>)
const ShareIcon = () => (<svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>)
const ExternalIcon = () => (<svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>)
const TrendIcon = ({ color }: { color: string }) => (<svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>)
const SignalIcon = ({ color }: { color: string }) => (<svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 4v16" /></svg>)
const ZapIcon = ({ color }: { color: string }) => (<svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>)
const ChevronDownIcon = ({ color = '#94a3b8', size = 11 }: { color?: string; size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>)
const SpinnerIcon = ({ size = 13, color = '#0369a1' }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'sm-spin .7s linear infinite', flexShrink: 0 }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>)
const ImageIcon = () => (<svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>)
const DownloadCloudIcon = ({ color = 'white', size = 12 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="8 17 12 21 16 17" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.88 18.09A5 5 0 0018 9h-1.26A8 8 0 103 16.29" />
  </svg>
)
const CheckIcon = ({ color = 'white', size = 11 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const DatabaseIcon = ({ color = 'white', size = 14 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
)
const CsvIcon = ({ color = '#059669', size = 11 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="16" y2="17" />
  </svg>
)
const PdfIcon = ({ color = '#dc2626', size = 11 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M9 15v-4h2a2 2 0 010 4H9zM15 11v4M12 11v4" />
  </svg>
)
const SettingsIcon = ({ color = '#64748b', size = 12 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
)
const XIcon = ({ color = '#94a3b8', size = 8 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

/* ── Platform Brand Icons ── */
const RedditBrandIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="10" fill="#FF4500" />
    <path d="M16.67 10a1.46 1.46 0 00-2.47-1 7.12 7.12 0 00-3.85-1.23l.65-3.08 2.13.45a1 1 0 101.07-1 1 1 0 00-.96.68l-2.38-.5a.27.27 0 00-.32.2l-.73 3.44a7.14 7.14 0 00-3.89 1.23 1.46 1.46 0 10-1.61 2.39 2.87 2.87 0 000 .44c0 2.24 2.61 4.06 5.83 4.06s5.83-1.82 5.83-4.06a2.87 2.87 0 000-.44 1.46 1.46 0 00.6-1.58zM7.27 11a1 1 0 111 1 1 1 0 01-1-1zm5.58 2.71a3.58 3.58 0 01-2.85.77 3.58 3.58 0 01-2.85-.77.27.27 0 01.38-.38 3.27 3.27 0 002.47.6 3.27 3.27 0 002.47-.6.27.27 0 01.38.38zm-.22-1.71a1 1 0 111-1 1 1 0 01-1 1z" fill="white" />
  </svg>
)
const FacebookBrandIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="10" fill="#1877F2" />
    <path d="M13.5 10H11.5V16H9V10H7.5V7.5H9V6C9 4.34 9.84 3 12 3H14V5.5H12.5C11.95 5.5 11.5 5.95 11.5 6.5V7.5H14L13.5 10Z" fill="white" />
  </svg>
)
const InstagramBrandIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <rect width="20" height="20" rx="5" fill="url(#ig-grad)" />
    <rect x="5" y="5" width="10" height="10" rx="3" stroke="white" strokeWidth="1.5" fill="none" />
    <circle cx="10" cy="10" r="2.5" stroke="white" strokeWidth="1.5" fill="none" />
    <circle cx="14" cy="6" r="0.9" fill="white" />
    <defs>
      <linearGradient id="ig-grad" x1="0" y1="20" x2="20" y2="0">
        <stop offset="0%" stopColor="#F9CE34" />
        <stop offset="33%" stopColor="#EE2A7B" />
        <stop offset="100%" stopColor="#6228D7" />
      </linearGradient>
    </defs>
  </svg>
)

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const SaveIcon = ({ color = 'white', size = 11 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
)

const SourceBrandIcon = ({ source, size = 18 }: { source: SourceType; size?: number }) => {
  if (source === 'reddit') return <RedditBrandIcon size={size} />
  if (source === 'instagram') return <InstagramBrandIcon size={size} />
  return <FacebookBrandIcon size={size} />
}

/* ═══════════════════════════════════════════════
   BADGE
═══════════════════════════════════════════════ */
const Badge = ({ label, style }: { label: string; style: { bg: string; color: string; dot?: string } }) => (
  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-semibold flex-shrink-0"
    style={{ background: style.bg, color: style.color }}>
    {style.dot && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: style.dot }} />}
    {label}
  </span>
)

/* ═══════════════════════════════════════════════
   CHIP INPUT  (new — used for groupUrls & hashtags)
   Allows typing a value then pressing Enter/comma to add a chip.
═══════════════════════════════════════════════ */
interface ChipInputProps {
  chips: string[]
  onChange: (chips: string[]) => void
  placeholder: string
  color: string
  colorSoft: string
  /** optional transform applied to each chip before adding (e.g. strip leading #) */
  normalize?: (val: string) => string
  /** prefix shown inside each chip badge */
  prefix?: string
}

const ChipInput = ({ chips, onChange, placeholder, color, colorSoft, normalize, prefix = '' }: ChipInputProps) => {
  const [draft, setDraft] = useState('')

  const commit = (raw: string) => {
    const val = (normalize ? normalize(raw) : raw).trim()
    if (!val || chips.includes(val)) { setDraft(''); return }
    onChange([...chips, val])
    setDraft('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit(draft)
    } else if (e.key === 'Backspace' && !draft && chips.length) {
      onChange(chips.slice(0, -1))
    }
  }

  const remove = (idx: number) => onChange(chips.filter((_, i) => i !== idx))

  return (
    <div
      className="flex flex-wrap gap-1 px-2 py-1.5 rounded-lg min-h-[32px] items-center"
      style={{ background: '#f8fafc', border: `1px solid ${color}22`, transition: 'border-color 150ms' }}
      onClick={() => {}}
    >
      {chips.map((chip, i) => (
        <span
          key={i}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold"
          style={{ background: colorSoft, color: color, border: `1px solid ${color}22` }}
        >
          {prefix}{chip}
          <button
            onClick={() => remove(i)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
          >
            <XIcon color={color} size={8} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => draft.trim() && commit(draft)}
        placeholder={chips.length === 0 ? placeholder : ''}
        className="flex-1 text-[11px] bg-transparent outline-none text-slate-600 placeholder-slate-300"
        style={{ minWidth: 80 }}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════
   SCRAPER PARAMS PANEL  (new — Facebook & Instagram)
   Collapsible panel shown in the toolbar for button-mode sources.
═══════════════════════════════════════════════ */
interface FacebookParamsPanelProps {
  params: FacebookScraperParams
  onChange: (p: FacebookScraperParams) => void
  color: string
  colorSoft: string
}

const FacebookParamsPanel = ({ params, onChange, color, colorSoft }: FacebookParamsPanelProps) => (
  <div
    className="flex flex-col gap-2.5 px-4 py-3"
    style={{ background: '#fafbfc', borderBottom: '1px solid #f1f5f9' }}
  >
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400 mb-1">
          Group URLs <span className="font-normal normal-case tracking-normal text-slate-300">(optional — Enter to add)</span>
        </p>
        <ChipInput
          chips={params.groupUrls}
          onChange={groupUrls => onChange({ ...params, groupUrls })}
          placeholder="https://facebook.com/groups/…"
          color={color}
          colorSoft={colorSoft}
        />
      </div>
      <div style={{ minWidth: 72 }}>
        <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400 mb-1">Limit</p>
        <input
          type="number"
          min={1}
          max={500}
          value={params.limit ?? ''}
          onChange={e => onChange({ ...params, limit: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="—"
          className="w-full px-2 py-1.5 rounded-lg text-[11px] text-slate-700 outline-none"
          style={{
            background: '#f8fafc',
            border: `1px solid ${color}22`,
            height: 32,
          }}
        />
      </div>
      <div style={{ minWidth: 72 }}>
        <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400 mb-1">Days</p>
        <input
          type="number"
          min={1}
          max={365}
          value={params.days ?? ''}
          onChange={e => onChange({ ...params, days: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="—"
          className="w-full px-2 py-1.5 rounded-lg text-[11px] text-slate-700 outline-none"
          style={{
            background: '#f8fafc',
            border: `1px solid ${color}22`,
            height: 32,
          }}
        />
      </div>
    </div>
  </div>
)

interface InstagramParamsPanelProps {
  params: InstagramScraperParams
  onChange: (p: InstagramScraperParams) => void
  color: string
  colorSoft: string
}

const InstagramParamsPanel = ({ params, onChange, color, colorSoft }: InstagramParamsPanelProps) => (
  <div
    className="flex flex-col gap-2.5 px-4 py-3"
    style={{ background: '#fafbfc', borderBottom: '1px solid #f1f5f9' }}
  >
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400 mb-1">
          Hashtags <span className="font-normal normal-case tracking-normal text-slate-300">(optional — Enter to add)</span>
        </p>
        <ChipInput
          chips={params.hashtags}
          onChange={hashtags => onChange({ ...params, hashtags })}
          placeholder="#realestate, #jaipur…"
          color={color}
          colorSoft={colorSoft}
          normalize={v => v.replace(/^#+/, '')}
          prefix="#"
        />
      </div>
      <div style={{ minWidth: 72 }}>
        <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400 mb-1">Limit</p>
        <input
          type="number"
          min={1}
          max={500}
          value={params.limit ?? ''}
          onChange={e => onChange({ ...params, limit: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="—"
          className="w-full px-2 py-1.5 rounded-lg text-[11px] text-slate-700 outline-none"
          style={{
            background: '#f8fafc',
            border: `1px solid ${color}22`,
            height: 32,
          }}
        />
      </div>
      <div style={{ minWidth: 72 }}>
        <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400 mb-1">Days</p>
        <input
          type="number"
          min={1}
          max={365}
          value={params.days ?? ''}
          onChange={e => onChange({ ...params, days: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="—"
          className="w-full px-2 py-1.5 rounded-lg text-[11px] text-slate-700 outline-none"
          style={{
            background: '#f8fafc',
            border: `1px solid ${color}22`,
            height: 32,
          }}
        />
      </div>
    </div>
  </div>
)

/* ═══════════════════════════════════════════════
   SCRAPE NEW DATA BUTTON
═══════════════════════════════════════════════ */
type ScrapeStatus = 'idle' | 'scraping' | 'done' | 'error'

const ScrapeNewDataButton = ({
  onScraped,
  disabled,
  scrapFn = scrapNewPosts,
  scrapParams = {},
  label = 'Scrape New Data',
}: {
  onScraped: () => void
  disabled: boolean
  scrapFn?: (data: any) => Promise<any>
  /** Extra params forwarded to scrapFn (groupUrls, limit, hashtags, etc.) */
  scrapParams?: Record<string, any>
  label?: string
}) => {
  const [status, setStatus] = useState<ScrapeStatus>('idle')

  const handleClick = async () => {
    if (status === 'scraping' || disabled) return
    setStatus('scraping')
    try {
      const result = await scrapFn(scrapParams)
      if (result !== null) {
        setStatus('done')
        setTimeout(() => { setStatus('idle'); onScraped() }, 1400)
      } else {
        setStatus('error')
        setTimeout(() => setStatus('idle'), 2500)
      }
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 2500)
    }
  }

  const isScraping = status === 'scraping'
  const isDone = status === 'done'
  const isError = status === 'error'

  const bg = isDone
    ? 'linear-gradient(135deg,#059669,#10b981)'
    : isError
      ? 'linear-gradient(135deg,#dc2626,#ef4444)'
      : isScraping
        ? 'linear-gradient(135deg,#1d4ed8,#7c3aed)'
        : 'linear-gradient(135deg,#1877F2,#7c3aed)'

  const displayLabel = isDone ? 'Synced!'
    : isError ? 'Failed — Retry?'
      : isScraping ? 'Scraping…'
        : label

  return (
    <button
      onClick={handleClick}
      disabled={isScraping || disabled}
      title="Pull fresh posts into the database, then refresh"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10.5px] font-semibold text-white transition-all active:scale-95"
      style={{
        background: bg,
        border: 'none',
        cursor: isScraping || disabled ? 'not-allowed' : 'pointer',
        boxShadow: isScraping || disabled ? 'none' : '0 2px 8px rgba(24,119,242,0.28)',
        opacity: disabled && !isScraping ? 0.55 : 1,
        transition: 'background 300ms, box-shadow 200ms, opacity 200ms',
        whiteSpace: 'nowrap',
      }}
    >
      {isScraping
        ? <SpinnerIcon size={11} color="rgba(255,255,255,0.85)" />
        : isDone
          ? <CheckIcon color="white" size={11} />
          : isError
            ? <span style={{ fontSize: 11, lineHeight: 1 }}>✕</span>
            : <DownloadCloudIcon color="white" size={12} />
      }
      {displayLabel}
    </button>
  )
}

/* ═══════════════════════════════════════════════
   MEDIA GALLERY
═══════════════════════════════════════════════ */
const MediaGallery = ({ media }: { media: string[] }) => {
  const imageUrls = media.filter(url =>
    /\.(jpg|jpeg|png|gif|webp)/i.test(url) || url.includes('fbcdn.net')
  )
  if (imageUrls.length === 0) return null

  const [lightbox, setLightbox] = useState<string | null>(null)
  const shown = imageUrls.slice(0, 4)
  const overflow = imageUrls.length - 4

  return (
    <>
      <div className="grid gap-1 mb-2"
        style={{ gridTemplateColumns: shown.length === 1 ? '1fr' : shown.length === 2 ? '1fr 1fr' : 'repeat(3, 1fr)' }}>
        {shown.map((url, i) => (
          <div key={i} className="relative overflow-hidden max-w-[500px] max-h-[300px] rounded-lg cursor-pointer group"
            style={{ aspectRatio: '1', background: '#f1f5f9' }}
            onClick={() => setLightbox(url)}>
            <img src={url} alt={`media-${i}`}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            {i === 3 && overflow > 0 && (
              <div className="absolute inset-0 flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.45)' }}>
                <span className="text-white font-bold text-[13px]">+{overflow}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="preview" className="max-w-[90vw] max-h-[80vh] rounded-xl object-contain" />
        </div>
      )}
    </>
  )
}

/* ═══════════════════════════════════════════════
   SCANNING ANIMATION
═══════════════════════════════════════════════ */
const ScanningAnimation = ({ step, query, cfg }: { step: number; query: string; cfg: SourceConfig }) => {
  const [tick, setTick] = useState(0)
  useEffect(() => { const t = setInterval(() => setTick(n => n + 1), 1400); return () => clearInterval(t) }, [])
  const pct = Math.round((step / cfg.fetchSteps.length) * 100)
  const label = cfg.fetchSteps[Math.max(0, step - 1)] ?? 'Processing…'
  const chip1 = cfg.scanChips[tick % cfg.scanChips.length]
  const chip2 = cfg.scanChips[(tick + 3) % cfg.scanChips.length]
  const dots = [
    { cx: 148, cy: 42, delay: '0s' }, { cx: 44, cy: 58, delay: '.47s' },
    { cx: 158, cy: 108, delay: '.93s' }, { cx: 28, cy: 130, delay: '1.4s' },
    { cx: 110, cy: 158, delay: '1.86s' }, { cx: 68, cy: 22, delay: '2.33s' },
  ]
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: cfg.colorSoft }}>
        <SourceBrandIcon source={cfg.id} />
      </div>
      <div className="flex-1 rounded-2xl rounded-tl-sm p-4"
        style={{ background: '#fff', border: '1px solid #f1f5f9', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div className="relative mx-auto mb-4" style={{ width: 120, height: 120 }}>
          {[34, 48, 60].map((r, i) => (
            <div key={r} className="absolute rounded-full"
              style={{ width: r * 2, height: r * 2, top: 60 - r, left: 60 - r, border: `1px solid ${cfg.color}22`, animation: 'sm-ring-pulse 3.4s ease-in-out infinite', animationDelay: `${i * 0.9}s` }} />
          ))}
          <svg className="absolute inset-0" width="120" height="120" viewBox="0 0 120 120">
            <line x1="60" y1="0" x2="60" y2="120" stroke={`${cfg.color}11`} strokeWidth="1" />
            <line x1="0" y1="60" x2="120" y2="60" stroke={`${cfg.color}11`} strokeWidth="1" />
          </svg>
          <div className="absolute inset-0" style={{ animation: 'sm-radar-spin 2.8s linear infinite' }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <defs>
                <radialGradient id={`sweep-${cfg.id}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={cfg.color} stopOpacity="0.22" />
                  <stop offset="100%" stopColor={cfg.color} stopOpacity="0" />
                </radialGradient>
              </defs>
              <path d="M60,60 L60,0 A60,60 0 0,1 111.96,30 Z" fill={`url(#sweep-${cfg.id})`} />
              <line x1="60" y1="60" x2="60" y2="0" stroke={cfg.color} strokeWidth="1.2" strokeOpacity="0.4" />
            </svg>
          </div>
          {dots.map((d, i) => (
            <div key={i} className="absolute rounded-full"
              style={{ width: 5, height: 5, left: d.cx / 180 * 120 - 2.5, top: d.cy / 180 * 120 - 2.5, background: cfg.color, animation: 'sm-dot-blink 2.8s ease-in-out infinite', animationDelay: d.delay }} />
          ))}
          <div className="absolute flex items-center justify-center rounded-full"
            style={{ width: 30, height: 30, top: 45, left: 45, background: cfg.colorSoft, border: `1px solid ${cfg.color}33`, animation: 'sm-core-pulse 2.2s ease-in-out infinite' }}>
            <div className="rounded-full" style={{ width: 9, height: 9, background: cfg.color, opacity: 0.65 }} />
          </div>
        </div>
        <p className="text-[12px] font-semibold text-slate-700 text-center mb-1">{label}</p>
        <div className="flex justify-center gap-2 mb-3.5" style={{ minHeight: 22 }}>
          {[chip1, chip2].map((chip, i) => (
            <span key={`${chip}-${tick}-${i}`}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ background: cfg.colorSoft, border: `1px solid ${cfg.color}22`, color: cfg.id === 'reddit' ? '#c2410c' : '#1d4ed8', animation: 'sm-chip-in 0.35s ease both', animationDelay: `${i * 80}ms` }}>
              {chip}
            </span>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
          <span>Step {step} / {cfg.fetchSteps.length}</span>
          <span style={{ color: cfg.id === 'reddit' ? '#c2410c' : '#2563eb', fontWeight: 600 }}>{pct}%</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
          <div className="h-full rounded-full"
            style={{ width: `${pct}%`, background: cfg.id === 'reddit' ? 'linear-gradient(90deg,#ff4500,#7c3aed)' : 'linear-gradient(90deg,#1877F2,#7c3aed)', transition: 'width 700ms cubic-bezier(0.4,0,0.2,1)' }} />
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   POST CARDS
═══════════════════════════════════════════════ */
interface PostCardProps {
  post: SocialPost
  source: SourceType
  index: number
  selected: boolean
  onToggle: () => void
  alreadySaved: boolean
}

const SelectionRing = ({
  selected, onToggle, color, alreadySaved,
}: {
  selected: boolean; onToggle: () => void; color: string; alreadySaved: boolean
}) => (
  <button
    onClick={e => { e.stopPropagation(); if (!alreadySaved) onToggle() }}
    title={alreadySaved ? 'Already in database' : selected ? 'Deselect' : 'Select to save'}
    className="flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all mt-0.5"
    style={{
      borderColor: alreadySaved ? '#10b981' : selected ? color : '#cbd5e1',
      background: alreadySaved ? '#ecfdf5' : selected ? color : 'transparent',
      cursor: alreadySaved ? 'default' : 'pointer',
    }}
  >
    {(selected || alreadySaved) && (
      <CheckIcon
        color={alreadySaved ? '#10b981' : 'white'}
        size={8}
      />
    )}
  </button>
)

const RedditPostCard = ({
  post, index, selected, onToggle, alreadySaved,
}: { post: RedditPost; index: number; selected: boolean; onToggle: () => void; alreadySaved: boolean }) => {
  const [expanded, setExpanded] = useState(false)
  const hasText = post.text?.trim().length > 0
  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      onClick={() => { if (!alreadySaved) onToggle() }}
      style={{
        background: selected ? 'rgba(255,69,0,0.03)' : '#fafbfc',
        border: `1px solid ${selected ? 'rgba(255,69,0,0.25)' : alreadySaved ? 'rgba(16,185,129,0.2)' : '#f1f5f9'}`,
        animation: 'sm-cardstream .32s ease both',
        animationDelay: `${index * 50}ms`,
        cursor: alreadySaved ? 'default' : 'pointer',
      }}
    >
      <div className="px-3.5 pt-3 pb-2.5">
        <div className="flex items-start gap-2 mb-2">
          <SelectionRing selected={selected} onToggle={onToggle} color="#FF4500" alreadySaved={alreadySaved} />
          <p className="text-[11.5px] font-semibold text-slate-800 leading-snug flex-1">{post.title}</p>
          <a href={post.url} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex-shrink-0 mt-0.5 opacity-50 hover:opacity-90 transition-opacity">
            <ExternalIcon />
          </a>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide"
            style={{ background: 'rgba(255,69,0,0.07)', color: '#c2410c' }}>
            r/{post.subreddit}
          </span>
          <span className="text-[9.5px] text-slate-400">u/{post.author}</span>
          <div className="ml-auto flex items-center gap-2.5">
            <span className="flex items-center gap-0.5 text-[10px] font-semibold" style={{ color: '#059669' }}>
              <ArrowUpIcon />{fmtNum(post.upvotes)}
            </span>
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
              <ChatBubbleIcon />{post.comments}
            </span>
          </div>
        </div>
      </div>
      {hasText && (
        <>
          <div style={{ maxHeight: expanded ? 200 : 0, overflow: 'hidden', transition: 'max-height 260ms ease' }}>
            <p className="px-3.5 pb-3 pt-2.5 text-[11px] leading-relaxed text-slate-500"
              style={{ borderTop: '0.5px solid #f1f5f9' }}>
              {post.text}
            </p>
          </div>
          <button
            onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}
            className="w-full px-3.5 py-1.5 flex items-center gap-1 text-[9.5px] text-slate-400 hover:text-slate-600 transition-colors"
            style={{ background: 'none', border: 'none', borderTop: '0.5px solid #f1f5f9', cursor: 'pointer' }}>
            {expanded ? 'Collapse' : 'Read more'}
            <span style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 200ms', display: 'inline-flex' }}>
              <ChevronDownIcon size={9} />
            </span>
          </button>
        </>
      )}
    </div>
  )
}

const FacebookPostCard = ({
  post, index, selected, onToggle, alreadySaved,
}: { post: FacebookPost; index: number; selected: boolean; onToggle: () => void; alreadySaved: boolean }) => {
  const [expanded, setExpanded] = useState(false)
  const hasText = post.text?.trim().length > 0
  const isLong = post.text?.length > 160
  const truncText = isLong ? post.text.slice(0, 160) + '…' : post.text
  const avatarLetter = post.author && post.author !== 'unknown' ? post.author.charAt(0).toUpperCase() : 'F'
  const displayName = post.author && post.author !== 'unknown' ? post.author : post.authorId ?? 'Facebook User'

  return (
    <div
      className="rounded-xl overflow-hidden w-full max-w-[800px] mx-auto transition-all"
      onClick={() => { if (!alreadySaved) onToggle() }}
      style={{
        background: selected ? 'rgba(24,119,242,0.03)' : '#fafbfc',
        border: `1px solid ${selected ? 'rgba(24,119,242,0.25)' : alreadySaved ? 'rgba(16,185,129,0.2)' : '#f1f5f9'}`,
        animation: 'sm-cardstream .32s ease both',
        animationDelay: `${index * 50}ms`,
        cursor: alreadySaved ? 'default' : 'pointer',
      }}
    >
      <div className="px-3.5 pt-3 pb-2">
        <div className="flex items-start gap-2 mb-2">
          <SelectionRing selected={selected} onToggle={onToggle} color="#1877F2" alreadySaved={alreadySaved} />
          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#1877F2,#42a5f5)' }}>
            {avatarLetter}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-slate-700 leading-none truncate">{displayName}</p>
            <p className="text-[9px] text-slate-400 mt-0.5">{fmtDate(post.createdAt)}</p>
          </div>
          <a href={post.externalLink ?? post.url} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex-shrink-0 opacity-50 hover:opacity-90 transition-opacity">
            <ExternalIcon />
          </a>
        </div>
        {post.title && post.title.trim() !== post.text?.trim() && (
          <p className="text-[11.5px] font-semibold text-slate-800 leading-snug mb-1.5 line-clamp-2">{post.title}</p>
        )}
        {hasText && (
          <p className="text-[11px] leading-relaxed text-slate-500 mb-2 whitespace-pre-line">
            {expanded ? post.text : truncText}
            {isLong && (
              <button
                onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}
                className="ml-1 text-[10px] font-semibold"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1877F2' }}>
                {expanded ? ' less' : ' more'}
              </button>
            )}
          </p>
        )}
        {post.hasMedia && post.media.length > 0 && <MediaGallery media={post.media} />}
      </div>
      <div className="flex items-center gap-3 px-3.5 py-2"
        style={{ borderTop: '0.5px solid #f1f5f9', background: '#fff' }}>
        <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: '#1877F2' }}>
          <GrLike />{fmtNum(post.likes)}
        </span>
        <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
          <ChatBubbleIcon />{fmtNum(post.comments)}
        </span>
        <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
          <ShareIcon />{fmtNum(post.shares)}
        </span>
        <a href={post.url} target="_blank" rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="ml-auto text-[9px] font-semibold transition-colors"
          style={{ color: '#1877F2', textDecoration: 'none' }}>
          View post ↗
        </a>
      </div>
    </div>
  )
}

const InstagramPostCard = ({
  post, index, selected, onToggle, alreadySaved,
}: { post: FacebookPost; index: number; selected: boolean; onToggle: () => void; alreadySaved: boolean }) => {
  const [expanded, setExpanded] = useState(false)
  const hasText = post.text?.trim().length > 0
  const isLong = post.text?.length > 160
  const truncText = isLong ? post.text.slice(0, 160) + '…' : post.text
  const avatarLetter = post.author ? post.author.charAt(0).toUpperCase() : 'I'

  return (
    <div
      className="rounded-xl overflow-hidden w-full max-w-[800px] mx-auto transition-all"
      onClick={() => { if (!alreadySaved) onToggle() }}
      style={{
        background: selected ? 'rgba(238,42,123,0.03)' : '#fafbfc',
        border: `1px solid ${selected ? 'rgba(238,42,123,0.25)' : alreadySaved ? 'rgba(16,185,129,0.2)' : '#f1f5f9'}`,
        animation: 'sm-cardstream .32s ease both',
        animationDelay: `${index * 50}ms`,
        cursor: alreadySaved ? 'default' : 'pointer',
      }}
    >
      <div className="px-3.5 pt-3 pb-2">
        <div className="flex items-start gap-2 mb-2">
          <SelectionRing selected={selected} onToggle={onToggle} color="#EE2A7B" alreadySaved={alreadySaved} />
          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#F9CE34,#EE2A7B,#6228D7)' }}>
            {avatarLetter}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-slate-700 leading-none truncate">@{post.author}</p>
            <p className="text-[9px] text-slate-400 mt-0.5">{fmtDate(post.createdAt)}</p>
          </div>
          <a href={post.url} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex-shrink-0 opacity-50 hover:opacity-90 transition-opacity">
            <ExternalIcon />
          </a>
        </div>
        {hasText && (
          <p className="text-[11px] leading-relaxed text-slate-500 mb-2 whitespace-pre-line">
            {expanded ? post.text : truncText}
            {isLong && (
              <button
                onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}
                className="ml-1 text-[10px] font-semibold"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EE2A7B' }}>
                {expanded ? ' less' : ' more'}
              </button>
            )}
          </p>
        )}
        {post.hasMedia && post.media.length > 0 && <MediaGallery media={post.media} />}
      </div>
      <div className="flex items-center gap-3 px-3.5 py-2"
        style={{ borderTop: '0.5px solid #f1f5f9', background: '#fff' }}>
        <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: '#EE2A7B' }}>
          ♥ {fmtNum(post.likes)}
        </span>
        <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
          <ChatBubbleIcon />{fmtNum(post.comments)}
        </span>
        <a href={post.url} target="_blank" rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="ml-auto text-[9px] font-semibold transition-colors"
          style={{ color: '#EE2A7B', textDecoration: 'none' }}>
          View post ↗
        </a>
      </div>
    </div>
  )
}

const PostCard = ({ post, source, index, selected, onToggle, alreadySaved }: PostCardProps) => {
  if (source === 'facebook')
    return <FacebookPostCard post={post as FacebookPost} index={index} selected={selected} onToggle={onToggle} alreadySaved={alreadySaved} />
  if (source === 'instagram')
    return <InstagramPostCard post={post as FacebookPost} index={index} selected={selected} onToggle={onToggle} alreadySaved={alreadySaved} />
  return <RedditPostCard post={post as RedditPost} index={index} selected={selected} onToggle={onToggle} alreadySaved={alreadySaved} />
}

/* ═══════════════════════════════════════════════
   EXPORT UTILITIES
═══════════════════════════════════════════════ */
const escapeCsvCell = (val: string | number | null | undefined): string => {
  const s = String(val ?? '')
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

const exportToCSV = (posts: SocialPost[], source: SourceType, query: string) => {
  const headers = ['#', 'Source', 'Author', 'Title', 'Caption', 'Likes', 'Comments', 'Shares', 'Engagement Score', 'URL', 'Date']
  const rows = posts.map((p, i) => {
    if (source === 'reddit') {
      const r = p as RedditPost
      return [i + 1, 'Reddit', `u/${r.author}`, r.title, r.text ?? '', r.upvotes, r.comments, 0, 0, r.url, '']
    }
    const f = p as FacebookPost
    return [i + 1, source === 'instagram' ? 'Instagram' : 'Facebook', f.author, f.title ?? '', f.text ?? '', f.likes, f.comments, f.shares, f.engagementScore, f.url, f.createdAt ? fmtDate(f.createdAt) : '']
  })
  const csv = [headers, ...rows].map(row => row.map(escapeCsvCell).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${source}-posts-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const exportToPDF = (posts: SocialPost[], insights: SocialInsights, source: SourceType, query: string) => {
  const sourceLabel = source.charAt(0).toUpperCase() + source.slice(1)
  const dateStr = new Date().toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })
  const brandColor = source === 'reddit' ? '#FF4500' : source === 'instagram' ? '#EE2A7B' : '#1877F2'

  const postRows = posts.map((p, i) => {
    if (source === 'reddit') {
      const r = p as RedditPost
      return `<tr><td>${i + 1}</td><td>u/${r.author}</td><td>${(r.title ?? '').slice(0, 80)}${(r.title ?? '').length > 80 ? '…' : ''}</td><td style="text-align:center">${r.upvotes}</td><td style="text-align:center">${r.comments}</td><td><a href="${r.url}" style="color:${brandColor}">View ↗</a></td></tr>`
    }
    const f = p as FacebookPost
    const caption = (f.text ?? '').slice(0, 80) + ((f.text ?? '').length > 80 ? '…' : '')
    return `<tr><td>${i + 1}</td><td>${f.author ?? '—'}</td><td>${caption}</td><td style="text-align:center">${f.likes}</td><td style="text-align:center">${f.comments}</td><td><a href="${f.url}" style="color:${brandColor}">View ↗</a></td></tr>`
  }).join('')

  const trendRows = insights.trends.map(t => `<tr><td><strong>${t.keyword}</strong></td><td>${t.insight}</td><td style="text-align:center;text-transform:capitalize">${t.confidence}</td></tr>`).join('')
  const signalRows = insights.demandSignals.map(s => `<tr><td style="text-transform:capitalize">${s.type}</td><td>${s.location}</td><td>${s.description}</td></tr>`).join('')
  const oppRows = insights.opportunities.map((o, i) => `<tr><td>${i + 1}</td><td><strong>${o.title}</strong></td><td>${o.action}</td></tr>`).join('')

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${sourceLabel} Social Mining Report</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1e293b;background:#fff;padding:40px;font-size:12px;line-height:1.6}.header{border-bottom:3px solid ${brandColor};padding-bottom:18px;margin-bottom:28px;display:flex;justify-content:space-between;align-items:flex-end}.header h1{font-size:22px;font-weight:700;color:${brandColor}}.header .meta{font-size:11px;color:#94a3b8;text-align:right}.summary-box{background:#f8fafc;border-left:4px solid ${brandColor};padding:14px 16px;border-radius:4px;margin-bottom:24px;font-size:12px;color:#475569;line-height:1.7}.stats-row{display:flex;gap:12px;margin-bottom:28px}.stat{flex:1;background:#f8fafc;border-radius:6px;padding:12px;text-align:center}.stat .val{font-size:20px;font-weight:700;color:${brandColor}}.stat .lbl{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin-top:2px}h2{font-size:14px;font-weight:700;color:#1e293b;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #e2e8f0}section{margin-bottom:28px}table{width:100%;border-collapse:collapse;font-size:11px}th{background:${brandColor};color:#fff;font-weight:600;padding:8px 10px;text-align:left}td{padding:7px 10px;border-bottom:1px solid #f1f5f9;vertical-align:top}tr:nth-child(even) td{background:#fafbfc}a{color:${brandColor};text-decoration:none}.footer{margin-top:32px;padding-top:14px;border-top:1px solid #e2e8f0;font-size:10px;color:#cbd5e1;text-align:center}@media print{body{padding:24px}}</style></head><body><div class="header"><div><div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Social Mining Report</div><h1>${sourceLabel} — ${query}</h1></div><div class="meta">Generated ${dateStr}<br/>${posts.length} posts analysed</div></div><div class="summary-box">${insights.summary}</div><div class="stats-row"><div class="stat"><div class="val">${posts.length}</div><div class="lbl">Posts</div></div><div class="stat"><div class="val">${insights.trends.length}</div><div class="lbl">Trends</div></div><div class="stat"><div class="val">${insights.demandSignals.length}</div><div class="lbl">Signals</div></div><div class="stat"><div class="val">${insights.opportunities.length}</div><div class="lbl">Opportunities</div></div><div class="stat"><div class="val">${Math.round(insights.sentiment.positive * 100)}%</div><div class="lbl">Positive</div></div></div><section><h2>Posts</h2><table><thead><tr><th>#</th><th>Author</th><th>Caption</th><th>Likes</th><th>Comments</th><th>Link</th></tr></thead><tbody>${postRows}</tbody></table></section><section><h2>Trends</h2><table><thead><tr><th>Keyword</th><th>Insight</th><th>Confidence</th></tr></thead><tbody>${trendRows}</tbody></table></section><section><h2>Demand Signals</h2><table><thead><tr><th>Type</th><th>Location</th><th>Description</th></tr></thead><tbody>${signalRows}</tbody></table></section><section><h2>Opportunities</h2><table><thead><tr><th>#</th><th>Title</th><th>Recommended Action</th></tr></thead><tbody>${oppRows}</tbody></table></section><div class="footer">Social Miner · ${sourceLabel} · ${dateStr}</div><script>window.onload=()=>window.print()</script></body></html>`

  const w = window.open('', '_blank')
  if (w) { w.document.write(html); w.document.close() }
}

/* ═══════════════════════════════════════════════
   RESULTS BUBBLE
═══════════════════════════════════════════════ */
const ResultsBubble = ({
  msg, cfg, onRerun, mode, onLoadMore, onPostsDeleted,
}: {
  msg: ChatMessage
  cfg: SourceConfig
  onRerun: (query: string) => void
  mode: 'query' | 'button'
  onLoadMore: (id: string) => void
  /** Called after a successful save — parent removes these posts from the message */
  onPostsDeleted: (msgId: string, deletedUrls: string[]) => void
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('posts')
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set())
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveResult, setSaveResult] = useState<{ saved: number; duplicates: number } | null>(null)

  const { insights, posts, pagination, fetchedAt } = msg
  if (!insights) return null

  const allUrls = posts.map(p => (p as any).url as string)
  const allSelected = allUrls.length > 0 && allUrls.every(u => selectedUrls.has(u))

  const togglePost = (url: string) => {
    setSelectedUrls(prev => {
      const next = new Set(prev)
      next.has(url) ? next.delete(url) : next.add(url)
      return next
    })
  }

  const toggleAll = () => {
    if (allSelected) {
      setSelectedUrls(new Set())
    } else {
      setSelectedUrls(new Set(allUrls))
    }
  }

  /* ──────────────────────────────────────────────
     handleSave
     After a successful save the backend removes
     those records from the scrape collection, so
     we mirror that by removing them from the UI.
  ────────────────────────────────────────────── */
  const handleSave = async () => {
    if (saveStatus === 'saving' || selectedUrls.size === 0) return
    setSaveStatus('saving')
    const toSave = posts.filter(p => selectedUrls.has((p as any).url))
    const result = await saveLeadsToDB(toSave, cfg.id)
    if (result !== null) {
      setSaveStatus('saved')
      setSaveResult(result)
      const deletedUrls = Array.from(selectedUrls)
      // Clear selection first
      setSelectedUrls(new Set())
      // Remove deleted posts from parent message state
      onPostsDeleted(msg.id, deletedUrls)
      setTimeout(() => { setSaveStatus('idle'); setSaveResult(null) }, 3000)
    } else {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 2500)
    }
  }

  const { positive, neutral, negative } = insights.sentiment
  const sentTotal = positive + neutral + negative || 1

  const tabCount = (key: TabKey) => {
    if (key === 'posts') return posts.length
    if (key === 'insights') return insights.trends.length
    if (key === 'signals') return insights.demandSignals.length
    return insights.opportunities.length
  }

  const isSaving = saveStatus === 'saving'
  const isSaved = saveStatus === 'saved'
  const isError = saveStatus === 'error'

  const saveBg = isSaved
    ? 'linear-gradient(135deg,#059669,#10b981)'
    : isError
      ? 'linear-gradient(135deg,#dc2626,#ef4444)'
      : isSaving
        ? 'linear-gradient(135deg,#1d4ed8,#7c3aed)'
        : 'linear-gradient(135deg,#0f766e,#0369a1)'

  const saveLabel = isSaved
    ? saveResult ? `Saved ${saveResult.saved}${saveResult.duplicates > 0 ? ` · ${saveResult.duplicates} dupes skipped` : ''}` : 'Saved!'
    : isError ? 'Save failed'
    : isSaving ? 'Saving…'
    : `Save ${selectedUrls.size} lead${selectedUrls.size !== 1 ? 's' : ''}`

  return (
    <div className="flex gap-3" style={{ animation: 'sm-fadein .4s ease both' }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: cfg.colorSoft }}>
        <SourceBrandIcon source={cfg.id} />
      </div>
      <div className="flex-1 min-w-0 rounded-2xl rounded-tl-sm overflow-hidden"
        style={{ background: '#fff', border: '1px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

        {/* ── Header ── */}
        <div className="px-4 py-3 border-b" style={{ borderColor: '#f8fafc' }}>
          <p className="text-[11.5px] leading-relaxed text-slate-600 mb-2.5 max-w-[1000px]">{insights.summary}</p>
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { v: `${posts.length} posts`, c: '#0369a1' },
              { v: `${insights.trends.length} trends`, c: '#7c3aed' },
              { v: `${insights.demandSignals.length} signals`, c: '#d97706' },
              { v: `${insights.opportunities.length} opps`, c: '#059669' },
            ].map(s => <span key={s.v} className="text-[10.5px] font-semibold" style={{ color: s.c }}>{s.v}</span>)}

            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-[9.5px] text-slate-300">{fmtTime(fetchedAt)}</span>
              <button onClick={() => exportToCSV(posts, cfg.id, msg.query)}
                title="Export CSV"
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[9.5px] font-semibold transition-all hover:bg-emerald-50 active:scale-95"
                style={{ background: 'none', border: '1px solid rgba(5,150,105,0.2)', cursor: 'pointer', color: '#059669' }}>
                <CsvIcon color="#059669" size={10} /> CSV
              </button>
              <button onClick={() => exportToPDF(posts, insights, cfg.id, msg.query)}
                title="Export PDF"
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[9.5px] font-semibold transition-all hover:bg-red-50 active:scale-95"
                style={{ background: 'none', border: '1px solid rgba(220,38,38,0.2)', cursor: 'pointer', color: '#dc2626' }}>
                <PdfIcon color="#dc2626" size={10} /> PDF
              </button>
              <button onClick={() => onRerun(msg.query)}
                className="p-1 rounded-md transition-all hover:bg-slate-50 active:scale-90"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }} title="Re-run">
                <RefreshIcon />
              </button>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex" style={{ borderBottom: '1px solid #f8fafc' }}>
          {TABS.map(t => {
            const active = t.key === activeTab
            return (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[11px] font-medium"
                style={{
                  background: active ? t.bg : 'transparent',
                  color: active ? t.color : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                  borderBottom: active ? `2px solid ${t.color}` : '2px solid transparent',
                  transition: 'all 150ms',
                }}>
                {t.label}
                <span className="text-[9.5px] font-bold px-1 py-0.5 rounded"
                  style={{ background: active ? `${t.color}18` : '#f8fafc', color: active ? t.color : '#cbd5e1' }}>
                  {tabCount(t.key)}
                </span>
              </button>
            )
          })}
        </div>

        {/* ── Content ── */}
        <div className="overflow-y-auto" style={{ maxHeight: 450, scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
          {activeTab === 'posts' && (
            <div className="flex flex-col">
              {/* ── Selection toolbar ── */}
              <div className="sticky top-0 z-10 flex items-center gap-2 px-3.5 py-2"
                style={{ background: 'rgba(248,250,252,0.95)', backdropFilter: 'blur(6px)', borderBottom: '1px solid #f1f5f9' }}>
                <button
                  onClick={toggleAll}
                  className="flex items-center gap-1.5 text-[10px] font-semibold transition-all px-2 py-1 rounded-lg"
                  style={{
                    background: allSelected ? 'rgba(3,105,161,0.06)' : 'transparent',
                    border: '1px solid rgba(3,105,161,0.15)',
                    color: '#0369a1',
                    cursor: 'pointer',
                  }}>
                  <div className="w-3 h-3 rounded border flex items-center justify-center"
                    style={{ borderColor: allSelected ? '#0369a1' : '#cbd5e1', background: allSelected ? '#0369a1' : 'transparent' }}>
                    {allSelected && <CheckIcon color="white" size={7} />}
                  </div>
                  {allSelected ? 'Deselect all' : 'Select all'}
                </button>

                <span className="text-[9.5px] text-slate-400">
                  {selectedUrls.size > 0
                    ? `${selectedUrls.size} selected`
                    : `Click posts to select`}
                </span>

                <div className="ml-auto">
                  <button
                    onClick={handleSave}
                    disabled={selectedUrls.size === 0 || isSaving}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white transition-all active:scale-95"
                    style={{
                      background: selectedUrls.size === 0 ? '#e2e8f0' : saveBg,
                      border: 'none',
                      cursor: selectedUrls.size === 0 || isSaving ? 'not-allowed' : 'pointer',
                      color: selectedUrls.size === 0 ? '#94a3b8' : 'white',
                      boxShadow: selectedUrls.size > 0 && !isSaving ? '0 2px 8px rgba(15,118,110,0.28)' : 'none',
                      transition: 'all 200ms',
                      whiteSpace: 'nowrap',
                    }}>
                    {isSaving
                      ? <SpinnerIcon size={10} color="rgba(255,255,255,0.85)" />
                      : isSaved
                        ? <CheckIcon color="white" size={10} />
                        : <SaveIcon color={selectedUrls.size === 0 ? '#94a3b8' : 'white'} size={10} />
                    }
                    {saveLabel}
                  </button>
                </div>
              </div>

              {/* ── Post list ── */}
              <div className="p-3 flex flex-col gap-2">
                {posts.length === 0 ? (
                  <p className="text-center text-[11px] text-slate-400 py-6">
                    All posts have been saved as leads.
                  </p>
                ) : (
                  posts.map((p, i) => {
                    const url = (p as any).url as string
                    return (
                      <PostCard
                        key={`${url}-${i}`}
                        post={p}
                        source={cfg.id}
                        index={i}
                        selected={selectedUrls.has(url)}
                        onToggle={() => togglePost(url)}
                        alreadySaved={false}
                      />
                    )
                  })
                )}

                {mode === 'query' && pagination.hasMore && posts.length > 0 && (
                  <button
                    onClick={() => onLoadMore(msg.id)}
                    disabled={msg.loadingMore}
                    className="w-full py-2.5 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all"
                    style={{
                      background: msg.loadingMore ? '#f8fafc' : 'rgba(3,105,161,0.04)',
                      border: '1px dashed rgba(3,105,161,0.2)',
                      color: msg.loadingMore ? '#94a3b8' : '#0369a1',
                      cursor: msg.loadingMore ? 'not-allowed' : 'pointer',
                    }}>
                    {msg.loadingMore
                      ? <><SpinnerIcon size={11} color="#94a3b8" />Loading more…</>
                      : <><ChevronDownIcon color="#0369a1" />Load more posts</>
                    }
                  </button>
                )}

                {!pagination.hasMore && posts.length > 0 && (
                  <p className="text-center text-[9.5px] text-slate-300 py-1.5">
                    {posts.length} of {pagination.count || posts.length} posts loaded
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'insights' && ( /* ... your existing insights tab JSX ... */ <></> )}
          {activeTab === 'signals'  && ( /* ... your existing signals tab JSX ...  */ <></> )}
          {activeTab === 'opps'     && ( /* ... your existing opps tab JSX ...     */ <></> )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   WELCOME SCREEN — REDDIT (query mode)
═══════════════════════════════════════════════ */
const WelcomeScreenQuery = ({ cfg, onSelect }: { cfg: SourceConfig; onSelect: (q: string) => void }) => (
  <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
      style={{ background: `linear-gradient(135deg,${cfg.colorSoft},rgba(124,58,237,0.08))`, border: `1px solid ${cfg.color}22` }}>
      <SourceBrandIcon source={cfg.id} size={26} />
    </div>
    <p className="text-[13px] font-semibold text-slate-700 mb-1">{cfg.label} Miner</p>
    <p className="text-[11.5px] text-slate-400 mb-6 text-center max-w-[220px] leading-relaxed">
      Surface demand signals, trends &amp; opportunities from {cfg.label} posts.
    </p>
    <div className="w-full">
      <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-300 mb-2.5 text-center">Try a query</p>
      <div className="flex flex-col gap-2">
        {cfg.suggestedQueries.map((q, i) => (
          <button key={q} onClick={() => onSelect(q)}
            className="w-full text-left px-4 py-2.5 rounded-xl text-[12px] text-slate-600 font-medium transition-all active:scale-[0.98]"
            style={{ background: '#fff', border: '1px solid #f1f5f9', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', animation: 'sm-cardstream .35s ease both', animationDelay: `${i * 60}ms` }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${cfg.color}44`; e.currentTarget.style.background = cfg.colorSoft }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.background = '#fff' }}>
            <span className="mr-2" style={{ color: cfg.color, fontSize: 11 }}>↗</span>{q}
          </button>
        ))}
      </div>
    </div>
  </div>
)

/* ═══════════════════════════════════════════════
   WELCOME SCREEN — FACEBOOK/INSTAGRAM (button mode)
═══════════════════════════════════════════════ */
const WelcomeScreenButton = ({
  cfg,
  onFetch,
  isFetching,
}: {
  cfg: SourceConfig
  onFetch: () => void
  isFetching: boolean
}) => (
  <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
      style={{
        background: `linear-gradient(135deg,${cfg.colorSoft},rgba(124,58,237,0.08))`,
        border: `1px solid ${cfg.color}22`,
      }}
    >
      <SourceBrandIcon source={cfg.id} size={30} />
    </div>

    <p className="text-[13px] font-semibold text-slate-700 mb-1">{cfg.label} Feed</p>
    <p className="text-[11.5px] text-slate-400 mb-7 text-center max-w-[210px] leading-relaxed">
      Load all saved {cfg.label} posts from the database and surface insights in one click.
    </p>

    <div className="flex flex-wrap justify-center gap-1.5 mb-7">
      {['Trends', 'Demand Signals', 'Sentiment', 'Opportunities'].map((label, i) => (
        <span
          key={label}
          className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
          style={{
            background: cfg.colorSoft,
            color: '#1d4ed8',
            border: `1px solid ${cfg.color}20`,
            animation: 'sm-cardstream .35s ease both',
            animationDelay: `${i * 55}ms`,
          }}
        >
          {label}
        </span>
      ))}
    </div>

    <button
      onClick={onFetch}
      disabled={isFetching}
      className="flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[13px] font-bold text-white transition-all active:scale-95"
      style={{
        background: isFetching
          ? 'linear-gradient(135deg,#1d4ed8,#7c3aed)'
          : 'linear-gradient(135deg,#1877F2,#7c3aed)',
        border: 'none',
        cursor: isFetching ? 'not-allowed' : 'pointer',
        boxShadow: isFetching ? 'none' : '0 4px 18px rgba(24,119,242,0.35)',
        opacity: isFetching ? 0.75 : 1,
        transition: 'all 200ms',
        minWidth: 190,
        justifyContent: 'center',
      }}
    >
      {isFetching
        ? <><SpinnerIcon size={14} color="rgba(255,255,255,0.85)" /> Fetching Posts…</>
        : <><DatabaseIcon color="white" size={15} /> Fetch All Posts</>
      }
    </button>

    <p className="text-[9.5px] text-slate-300 mt-3 text-center">
      Loads all posts from your database
    </p>
  </div>
)

/* ═══════════════════════════════════════════════
   PROMPT BAR  (Reddit / query mode only)
═══════════════════════════════════════════════ */
const PromptBar = ({
  value, onChange, onSubmit, disabled, placeholder,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  disabled: boolean
  placeholder: string
}) => {
  const taRef = useRef<HTMLTextAreaElement>(null)
  const canSend = !disabled && value.trim().length > 0
  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (canSend) onSubmit() }
  }
  useEffect(() => {
    const ta = taRef.current; if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 110)}px`
  }, [value])
  return (
    <div className="flex-shrink-0 px-4 py-3 border-t" style={{ borderColor: '#f1f5f9', background: '#fff' }}>
      <div className="flex items-end gap-2.5 rounded-2xl px-4 py-3"
        style={{ background: '#f8fafc', border: `1.5px solid ${canSend ? '#bfdbfe' : '#e2e8f0'}`, boxShadow: canSend ? '0 0 0 3px rgba(3,105,161,0.06)' : 'none', transition: 'border-color 150ms,box-shadow 150ms' }}>
        <textarea ref={taRef} rows={1} value={value} onChange={e => onChange(e.target.value)}
          onKeyDown={handleKey} disabled={disabled} placeholder={placeholder}
          className="flex-1 resize-none bg-transparent text-[12.5px] text-slate-700 placeholder-slate-400 outline-none leading-relaxed"
          style={{ minHeight: 22, maxHeight: 110 }} />
        <button onClick={onSubmit} disabled={!canSend}
          className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
          style={{ background: canSend ? 'linear-gradient(135deg,#0369a1,#7c3aed)' : '#e2e8f0', border: 'none', cursor: canSend ? 'pointer' : 'not-allowed', boxShadow: canSend ? '0 2px 8px rgba(3,105,161,0.28)' : 'none', transition: 'all 150ms' }}>
          {disabled ? <SpinnerIcon size={13} color="#94a3b8" /> : <SendIcon color={canSend ? 'white' : '#94a3b8'} />}
        </button>
      </div>
      <p className="text-[9px] text-slate-300 mt-1.5 text-center tracking-wide">Enter ↵ to mine · Shift+Enter for new line</p>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   FETCH BAR  (Facebook/Instagram / button mode)
═══════════════════════════════════════════════ */
const FetchBar = ({
  onFetch,
  disabled,
  lastFetchedAt,
}: {
  onFetch: () => void
  disabled: boolean
  lastFetchedAt: Date | null
}) => (
  <div
    className="flex-shrink-0 px-4 py-3 border-t flex items-center gap-3"
    style={{ borderColor: '#f1f5f9', background: '#fff' }}
  >
    <div className="flex-1 min-w-0">
      {lastFetchedAt ? (
        <p className="text-[10px] text-slate-400">
          Last fetched at <span className="font-semibold text-slate-500">{fmtTime(lastFetchedAt)}</span>
        </p>
      ) : (
        <p className="text-[10px] text-slate-400">Fetch all posts from the database</p>
      )}
    </div>
    <button
      onClick={onFetch}
      disabled={disabled}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11.5px] font-bold text-white transition-all active:scale-95 flex-shrink-0"
      style={{
        background: disabled
          ? 'linear-gradient(135deg,#1d4ed8,#7c3aed)'
          : 'linear-gradient(135deg,#1877F2,#7c3aed)',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '0 2px 10px rgba(24,119,242,0.3)',
        opacity: disabled ? 0.7 : 1,
        whiteSpace: 'nowrap',
        transition: 'all 150ms',
      }}
    >
      {disabled
        ? <><SpinnerIcon size={12} color="rgba(255,255,255,0.85)" /> Fetching…</>
        : <><RefreshIcon color="white" size={12} /> Fetch Posts</>
      }
    </button>
  </div>
)

/* ═══════════════════════════════════════════════
   SCRAPER WORKSPACE
═══════════════════════════════════════════════ */
interface ScraperWorkspaceProps {
  cfg: SourceConfig
  fetchFn: (query?: string, params?: ScraperParams) => Promise<SocialData | null>
  defaultQuery?: string
  mode?: 'query' | 'button'
}

const BUTTON_MODE_LABEL = 'All Posts'

const ScraperWorkspace = ({ cfg, fetchFn, defaultQuery, mode = 'query' }: ScraperWorkspaceProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputQuery, setInputQuery] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>[]>>(new Map())
  const isFetching = messages.some(m => m.status === 'fetching')
  const lastQueryRef = useRef<string>('')
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null)

  /* ── Per-source scraper params ── */
  const [fbParams, setFbParams] = useState<FacebookScraperParams>({ groupUrls: [] })
  const [igParams, setIgParams] = useState<InstagramScraperParams>({ hashtags: [] })
  const [showParams, setShowParams] = useState(false)

  const activeScraperParams: ScraperParams =
    cfg.id === 'facebook' ? fbParams :
    cfg.id === 'instagram' ? igParams :
    {}

  const clearTimersFor = (id: string) => {
    timersRef.current.get(id)?.forEach(clearTimeout)
    timersRef.current.delete(id)
  }

  const updateMsg = useCallback((id: string, patch: Partial<ChatMessage>) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m))
  }, [])

  const messagesRef = useRef<ChatMessage[]>([])
  useEffect(() => { messagesRef.current = messages }, [messages])

  /* ── Remove posts deleted via save ── */
  const handlePostsDeleted = useCallback((msgId: string, deletedUrls: string[]) => {
    const urlSet = new Set(deletedUrls)
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m
      return { ...m, posts: m.posts.filter(p => !urlSet.has((p as any).url as string)) }
    }))
  }, [])

  const handleLoadMore = useCallback(async (msgId: string) => {
    const msg = messagesRef.current.find(m => m.id === msgId)
    if (!msg || !msg.pagination.after || msg.loadingMore) return
    updateMsg(msgId, { loadingMore: true })
    try {
      const result = await fetchFn(`${msg.query}&after=${msg.pagination.after}`)
      if (result?.success) {
        setMessages(prev => prev.map(m => {
          if (m.id !== msgId) return m
          const old = m.insights
          const next = result.insights
          const merged = old && next ? {
            summary:       old.summary,
            trends:        [...old.trends,        ...next.trends],
            demandSignals: [...old.demandSignals, ...next.demandSignals],
            opportunities: [...old.opportunities, ...next.opportunities],
            sentiment: {
              positive: old.sentiment.positive + next.sentiment.positive,
              neutral:  old.sentiment.neutral  + next.sentiment.neutral,
              negative: old.sentiment.negative + next.sentiment.negative,
            },
          } : old ?? next
          return {
            ...m,
            posts:       [...m.posts, ...(result.posts ?? [])],
            pagination:  result.pagination ?? m.pagination,
            insights:    merged,
            loadingMore: false,
          }
        }))
      } else {
        updateMsg(msgId, { loadingMore: false })
      }
    } catch (e) { console.error(e); updateMsg(msgId, { loadingMore: false }) }
  }, [fetchFn, updateMsg])

  const runFetch = useCallback(async (query: string) => {
    lastQueryRef.current = query
    const id: string = uid()
    const newMsg: ChatMessage = {
      id,
      query,
      status: 'fetching',
      step: 0,
      posts: [],
      insights: null,
      pagination: { datasetId: '', count: 0 },
      loadingMore: false,
      fetchedAt: null,
    }
    setMessages(prev => [...prev, newMsg])

    const timers: ReturnType<typeof setTimeout>[] = []
    cfg.fetchSteps.forEach((_, i) => {
      const t = setTimeout(() => updateMsg(id, { step: i + 1 }), i * 800 + 500)
      timers.push(t)
    })
    timersRef.current.set(id, timers)

    let result: SocialData | null = null
    try {
      result = mode === 'button'
        ? await fetchFn(undefined, activeScraperParams)
        : await fetchFn(query)
    } catch (e) {
      console.error(e)
    }

    const delay = cfg.fetchSteps.length * 800 + 700
    const finish = setTimeout(() => {
      const now = new Date()
      if (result?.success) {
        updateMsg(id, {
          status: 'done',
          posts: result.posts ?? [],
          insights: result.insights ?? null,
          pagination: result.pagination ?? { datasetId: '', count: 0 },
          fetchedAt: now,
        })
        setLastFetchedAt(now)
      } else {
        updateMsg(id, { status: 'error', fetchedAt: now })
      }
      clearTimersFor(id)
    }, delay)
    timers.push(finish)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg, fetchFn, mode, updateMsg, fbParams, igParams])

  const handleRerun = useCallback((query: string) => { runFetch(query) }, [runFetch])

  const handleFetch = useCallback(() => {
    if (isFetching) return
    if (mode === 'button') {
      runFetch(BUTTON_MODE_LABEL)
    } else {
      const q = inputQuery.trim()
      if (!q) return
      setInputQuery('')
      runFetch(q)
    }
  }, [isFetching, mode, inputQuery, runFetch])

  const handlePostScrape = useCallback(() => {
    const q = lastQueryRef.current || (mode === 'button' ? BUTTON_MODE_LABEL : cfg.suggestedQueries[0])
    if (q) runFetch(q)
  }, [runFetch, mode, cfg.suggestedQueries])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    setTimeout(() => el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }), 80)
  }, [messages.length])

  useEffect(() => {
    if (mode === 'query' && defaultQuery) {
      runFetch(defaultQuery)
    }
    return () => { timersRef.current.forEach(ts => ts.forEach(clearTimeout)) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isButtonMode = mode === 'button'
  const hasMessages = messages.length > 0

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#f8fafc' }}>

      {/* ════════════════════════════════════
          Facebook / Instagram toolbar
      ════════════════════════════════════ */}
      {isButtonMode && (
        <div>
          {/* ── Main toolbar row ── */}
          <div
            className="flex-shrink-0 flex items-center justify-between px-4"
            style={{
              height: 46,
              background: '#fff',
              borderBottom: showParams ? 'none' : '1px solid #f1f5f9',
              boxShadow: showParams ? 'none' : '0 1px 0 #f1f5f9',
            }}
          >
            <div className="flex items-center gap-2">
              <SourceBrandIcon source={cfg.id} size={14} />
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: '#94a3b8', letterSpacing: '0.1em' }}
              >
                {cfg.label} Feed
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Params toggle */}
              <button
                onClick={() => setShowParams(v => !v)}
                title="Configure scrape parameters"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                style={{
                  background: showParams ? (cfg.id === 'instagram' ? 'rgba(238,42,123,0.07)' : 'rgba(24,119,242,0.07)') : 'transparent',
                  border: `1px solid ${showParams ? cfg.color + '33' : '#e2e8f0'}`,
                  color: showParams ? cfg.color : '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 150ms',
                }}
              >
                <SettingsIcon color={showParams ? cfg.color : '#94a3b8'} size={11} />
                {cfg.id === 'facebook'
                  ? (fbParams.groupUrls.length > 0 || fbParams.limit || fbParams.days ? <span style={{ color: cfg.color }}>configured</span> : 'configure')
                  : (igParams.hashtags.length > 0 || igParams.limit || igParams.days ? <span style={{ color: cfg.color }}>configured</span> : 'configure')
                }
              </button>
              <ScrapeNewDataButton
                onScraped={handlePostScrape}
                disabled={isFetching}
                scrapFn={cfg.scrapFn}
                scrapParams={activeScraperParams as Record<string, any>}
                label="Scrape New Data"
              />
            </div>
          </div>

          {/* ── Collapsible params panel ── */}
          <div style={{
            maxHeight: showParams ? 140 : 0,
            overflow: 'hidden',
            transition: 'max-height 280ms cubic-bezier(0.4,0,0.2,1)',
          }}>
            {cfg.id === 'facebook' && (
              <FacebookParamsPanel
                params={fbParams}
                onChange={setFbParams}
                color={cfg.color}
                colorSoft={cfg.colorSoft}
              />
            )}
            {cfg.id === 'instagram' && (
              <InstagramParamsPanel
                params={igParams}
                onChange={setIgParams}
                color={cfg.color}
                colorSoft={cfg.colorSoft}
              />
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
          Scroll area
      ════════════════════════════════════ */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}
      >
        {!hasMessages ? (
          mode === 'button' ? (
            <WelcomeScreenButton cfg={cfg} onFetch={handleFetch} isFetching={isFetching} />
          ) : (
            <WelcomeScreenQuery cfg={cfg} onSelect={q => { setInputQuery(''); runFetch(q) }} />
          )
        ) : (
          <div className="p-4 flex flex-col gap-5">
            {messages.map(msg => (
              <div key={msg.id} className="flex flex-col gap-3">

                {/* ── User bubble ── */}
                <div className="flex justify-end">
                  <div
                    className="max-w-[78%] px-4 py-2.5 rounded-2xl rounded-br-sm text-[12px] text-white leading-relaxed flex items-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg,#0369a1,#7c3aed)',
                      boxShadow: '0 2px 8px rgba(3,105,161,0.22)',
                    }}
                  >
                    {mode === 'button' && <DatabaseIcon color="rgba(255,255,255,0.7)" size={12} />}
                    {mode === 'button' ? 'Fetch All Posts' : msg.query}
                  </div>
                </div>

                {msg.status === 'fetching' && (
                  <ScanningAnimation step={msg.step} query={msg.query} cfg={cfg} />
                )}
                {msg.status === 'error' && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: cfg.colorSoft }}>
                      <SourceBrandIcon source={cfg.id} />
                    </div>
                    <div className="flex-1 rounded-2xl rounded-tl-sm p-4"
                      style={{ background: '#fff', border: '1px solid #fecaca' }}>
                      <p className="text-[12px] font-semibold text-red-500 mb-1">Could not fetch posts</p>
                      <p className="text-[11px] text-slate-400 mb-2">
                        {mode === 'button'
                          ? 'Unable to load posts from the database. Please try again.'
                          : 'Try a different query or check your connection.'}
                      </p>
                      <button
                        onClick={() => handleRerun(msg.query)}
                        className="flex items-center gap-1.5 text-[10.5px] font-semibold px-3 py-1.5 rounded-lg transition-all active:scale-95"
                        style={{ background: 'rgba(3,105,161,0.06)', color: '#0369a1', border: 'none', cursor: 'pointer' }}
                      >
                        <RefreshIcon color="#0369a1" /> Retry
                      </button>
                    </div>
                  </div>
                )}
                {msg.status === 'done' && (
                  <ResultsBubble
                    msg={msg}
                    cfg={cfg}
                    onRerun={handleRerun}
                    mode={mode}
                    onLoadMore={handleLoadMore}
                    onPostsDeleted={handlePostsDeleted}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════
          Bottom bar
      ════════════════════════════════════ */}
      {mode === 'query' ? (
        <PromptBar
          value={inputQuery}
          onChange={setInputQuery}
          onSubmit={handleFetch}
          disabled={isFetching}
          placeholder={isFetching ? 'Mining in progress…' : `Mine ${cfg.label} for any topic…`}
        />
      ) : hasMessages ? (
        <FetchBar
          onFetch={handleFetch}
          disabled={isFetching}
          lastFetchedAt={lastFetchedAt}
        />
      ) : null}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   PUBLIC SCRAPER COMPONENTS
═══════════════════════════════════════════════ */
export interface ScraperProps {
  defaultQuery?: string
}

export const RedditScrapper = ({ defaultQuery }: ScraperProps) => (
  <ScraperWorkspace
    cfg={getSourceConfig('reddit')}
    fetchFn={getRedditPosts as (q?: string) => Promise<SocialData | null>}
    defaultQuery={defaultQuery}
    mode="query"
  />
)

export const FacebookScrapper = ({ defaultQuery }: ScraperProps) => (
  <ScraperWorkspace
    cfg={getSourceConfig('facebook')}
    fetchFn={getFacebookPosts as (q?: string, p?: ScraperParams) => Promise<SocialData | null>}
    mode="button"
  />
)

export const InstagramScrapper = ({ defaultQuery }: ScraperProps) => (
  <ScraperWorkspace
    cfg={getSourceConfig('instagram')}
    fetchFn={getInstagramPosts as (q?: string, p?: ScraperParams) => Promise<SocialData | null>}
    mode="button"
  />
)

/* ═══════════════════════════════════════════════
   SOURCE NAV ITEM
═══════════════════════════════════════════════ */
const SourceNavItem = ({
  cfg, active, onClick, msgCount,
}: {
  cfg: SourceConfig
  active: boolean
  onClick: () => void
  msgCount: number
}) => (
  <button onClick={onClick}
    className="relative w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all group"
    style={{ background: active ? '#fff' : 'transparent', border: active ? `1px solid ${cfg.color}22` : '1px solid transparent', boxShadow: active ? '0 1px 6px rgba(0,0,0,0.06)' : 'none', cursor: 'pointer' }}>
    {active && (
      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
        style={{ background: cfg.color, marginLeft: -1 }} />
    )}
    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: active ? cfg.colorSoft : '#f1f5f9' }}>
      <SourceBrandIcon source={cfg.id} size={16} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11.5px] font-semibold leading-none truncate"
        style={{ color: active ? cfg.color : '#475569' }}>
        {cfg.label}
      </p>
      <p className="text-[9.5px] text-slate-400 mt-0.5">
        {cfg.id === 'facebook'  && 'Group posts & listings'}
        {cfg.id === 'instagram' && 'Reels, posts & hashtags'}
        {cfg.id === 'reddit'    && 'Community discussions'}
      </p>
    </div>
    {msgCount > 0 && (
      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
        style={{ background: active ? `${cfg.color}15` : '#f1f5f9', color: active ? cfg.color : '#94a3b8' }}>
        {msgCount}
      </span>
    )}
  </button>
)

/* ═══════════════════════════════════════════════
   SOCIAL MINING AGENT WORKSPACE
═══════════════════════════════════════════════ */
export interface SocialMiningAgentWorkspaceProps {
  isOpen?: boolean
  defaultQuery?: string
  defaultSource?: SourceType
}

const SocialMiningAgentWorkspace = ({
  isOpen = true,
  defaultQuery = '',
  defaultSource = 'facebook',
}: SocialMiningAgentWorkspaceProps) => {
  const [activeSource, setActiveSource] = useState<SourceType>(defaultSource)

  const scrapers: { source: SourceType; Component: React.FC<ScraperProps> }[] = [
    { source: 'facebook',  Component: FacebookScrapper  },
    { source: 'instagram', Component: InstagramScrapper },
    { source: 'reddit',    Component: RedditScrapper    },
  ]

  return (
    <div className="flex h-full overflow-hidden rounded-xl" style={{ background: '#f8fafc' }}>
      <div className="flex flex-col flex-shrink-0 py-3 px-2 gap-1"
        style={{ background: '#f1f5f9', borderRight: '1px solid #e2e8f0' }}>
        <div className="px-2 pb-3 mb-1" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest leading-none">Social</p>
          <p className="text-[16px] font-bold text-[var(--color-primary)] leading-snug">Miner</p>
        </div>
        <p className="text-[8.5px] font-bold uppercase tracking-widest text-slate-400 px-2 pt-1 pb-0.5">Sources</p>
        {SOURCE_REGISTRY.map(cfg => (
          <SourceNavItem key={cfg.id} cfg={cfg} active={activeSource === cfg.id}
            onClick={() => setActiveSource(cfg.id)} msgCount={0} />
        ))}
        <div className="mt-auto px-2 pt-2" style={{ borderTop: '1px solid #e2e8f0' }}>
          <p className="text-[9px] text-slate-300 leading-relaxed">More sources<br />coming soon</p>
        </div>
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        {scrapers.map(({ source, Component }) => (
          <div key={source} style={{ display: source === activeSource ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
            <Component defaultQuery={source === defaultSource ? defaultQuery : undefined} />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes sm-spin        { to { transform: rotate(360deg); } }
        @keyframes sm-radar-spin  { to { transform: rotate(360deg); } }
        @keyframes sm-ring-pulse  { 0%,100%{ opacity:.3 } 50%{ opacity:.85 } }
        @keyframes sm-dot-blink   { 0%,100%{ opacity:0; transform:scale(.35) } 30%,70%{ opacity:1; transform:scale(1) } }
        @keyframes sm-core-pulse  { 0%,100%{ transform:scale(1); opacity:.75 } 50%{ transform:scale(1.14); opacity:1 } }
        @keyframes sm-chip-in     { from{ opacity:0; transform:translateY(4px) } to{ opacity:1; transform:translateY(0) } }
        @keyframes sm-cardstream  { from{ opacity:0; transform:translateX(-7px) } to{ opacity:1; transform:translateX(0) } }
        @keyframes sm-fadein      { from{ opacity:0; transform:translateY(6px) } to{ opacity:1; transform:translateY(0) } }
        .sm-line-clamp { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      `}</style>
    </div>
  )
}

export default SocialMiningAgentWorkspace