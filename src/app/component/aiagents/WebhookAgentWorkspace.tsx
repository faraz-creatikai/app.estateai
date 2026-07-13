"use client"
import { formatDateDMY } from '@/app/utils/formatDateDMY'
import { getCustomer } from '@/store/customer'
import { runWebhookAgent } from '@/store/aiagent/aiagent' // your provided fetch function
import React, { useEffect, useRef, useState, useMemo } from 'react'

const PAGE_SIZE = 20

/* ── palette ──────────────────────────────────────────────────────────────
   Two accent families do two different jobs in this UI:
   · sky (#0284c7)   → things the human controls (customers, input, nav)
   · violet (#7c3aed) → the agent's own activity (run header, step rail,
                          structured output) — this is what makes an AI
                          response *read* as a process rather than a text
                          bubble.
   ────────────────────────────────────────────────────────────────────── */
const C = {
    ink: '#0f172a',
    body: '#334155',
    mute: '#94a3b8',
    faint: '#cbd5e1',
    line: '#e2e8f0',
    hair: '#f1f5f9',
    canvas: '#f8fafc',
    card: '#ffffff',
    sky: '#0284c7',
    skySoft: 'rgba(2,132,199,0.1)',
    violet: '#7c3aed',
    violetSoft: 'rgba(124,58,237,0.12)',
    good: '#059669',
    goodBg: '#f0fdf4',
    goodFg: '#166534',
    bad: '#dc2626',
    badBg: '#fef2f2',
    badFg: '#b91c1c',
    warn: '#d97706',
    warnBg: '#fffbeb',
    warnFg: '#b45309',
}

/* ── tiny icon components ── */
const SearchIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" strokeWidth={2} />
        <path d="m21 21-4.35-4.35" strokeWidth={2} strokeLinecap="round" />
    </svg>
)
const UserIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
    </svg>
)
const SendIcon = () => (
    <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
)
const SparkleIcon = () => (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
)
const ClearIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
)
const BoltIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
)
const AlertIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth={1.7} />
        <path strokeLinecap="round" strokeWidth={1.7} d="M12 8v4M12 16h.01" />
    </svg>
)
const CheckCircleIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth={1.7} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M8 12.5l2.5 2.5 5.5-6" />
    </svg>
)
const StepCheckIcon = () => (
    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
)
const StepXIcon = () => (
    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 6l12 12M18 6L6 18" />
    </svg>
)
const StepDashIcon = () => (
    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeWidth={3} d="M12 9v4M12 16h.01" />
    </svg>
)
const LayersIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m12 2 9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 17l9 5 9-5" />
    </svg>
)
const ListRowsIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeWidth={1.8} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
)

/* ── avatar initials ── */
const Avatar = ({ name }: { name: string }) => {
    const initials = (name || '?').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    const colors: [string, string][] = [
        ['#e0f2fe', '#0284c7'], ['#fce7f3', '#db2777'], ['#d1fae5', '#059669'],
        ['#ede9fe', '#7c3aed'], ['#fef3c7', '#d97706'], ['#fee2e2', '#dc2626'],
    ]
    const idx = (name?.charCodeAt(0) ?? 0) % colors.length
    const [bg, fg] = colors[idx]
    return (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0"
            style={{ background: bg, color: fg }}>
            {initials}
        </div>
    )
}

/* ── small status pill used on run headers and webhook rows ── */
type Tone = 'success' | 'error' | 'warn' | 'info'
const TONE_STYLES: Record<Tone, { bg: string; fg: string }> = {
    success: { bg: C.goodBg, fg: C.goodFg },
    error: { bg: C.badBg, fg: C.badFg },
    warn: { bg: C.warnBg, fg: C.warnFg },
    info: { bg: C.violetSoft, fg: C.violet },
}
const StatusPill = ({ tone, label }: { tone: Tone; label: string }) => (
    <span
        className="text-[9px] font-bold px-2 py-[3px] rounded-full uppercase tracking-wider inline-block flex-shrink-0"
        style={{ background: TONE_STYLES[tone].bg, color: TONE_STYLES[tone].fg }}
    >
        {label}
    </span>
)

/* ── formatting helpers ── */
const formatDuration = (ms: number) => {
    if (!Number.isFinite(ms) || ms < 0) return null
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(1)}s`
}
const formatClock = (ts?: number) => {
    if (!ts) return ''
    try {
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch { return '' }
}

/* ── customer-context toggle ── */
const ContextToggle = ({
    useCustomer, onToggle,
}: { useCustomer: boolean; onToggle: () => void }) => (
    <div className="px-4 pt-4 pb-1 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold" style={{ color: C.body }}>
                Use customer context
            </span>
            <button
                role="switch"
                aria-checked={useCustomer}
                onClick={onToggle}
                className="relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors"
                style={{ background: useCustomer ? C.sky : '#cbd5e1' }}
            >
                <span
                    className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform"
                    style={{ transform: useCustomer ? 'translateX(18px)' : 'translateX(3px)' }}
                />
            </button>
        </div>
        <p className="text-[10px] leading-snug" style={{ color: C.mute }}>
            {useCustomer
                ? "This request will include the selected customer's data."
                : "This is a general request — no customer will be attached."}
        </p>
    </div>
)

/* ────────────────────────────────────────────────────────────────────────
   Dynamic AI-data renderer
   `aiData` coming back from the webhook agent is schema-less — the AI can
   return literally any key/value shape (flat strings, nested objects,
   arrays of strings, arrays of objects, booleans, etc). These helpers
   render whatever shows up without assuming any fixed fields, but they
   present it as a labelled "agent output" panel rather than plain text so
   it reads as structured data produced by a process, not a chat reply.
   ──────────────────────────────────────────────────────────────────────── */
const humanizeKey = (key: string) =>
    key
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, (c) => c.toUpperCase())

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
    success: { bg: C.goodBg, color: C.goodFg },
    completed: { bg: C.goodBg, color: C.goodFg },
    ok: { bg: C.goodBg, color: C.goodFg },
    approved: { bg: C.goodBg, color: C.goodFg },
    failed: { bg: C.badBg, color: C.badFg },
    error: { bg: C.badBg, color: C.badFg },
    rejected: { bg: C.badBg, color: C.badFg },
    pending: { bg: C.warnBg, color: C.warnFg },
    processing: { bg: C.warnBg, color: C.warnFg },
    'in progress': { bg: C.warnBg, color: C.warnFg },
}

const isPlainObject = (v: any) => v !== null && typeof v === 'object' && !Array.isArray(v)

const DynamicValue = ({ value }: { value: any }) => {
    if (value === null || value === undefined || value === '') {
        return <span className="text-[12px]" style={{ color: C.faint }}>—</span>
    }

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return <span className="text-[12px]" style={{ color: C.faint }}>—</span>
        }
        // array of primitives -> bullet list
        if (value.every((v) => !isPlainObject(v) && !Array.isArray(v))) {
            return (
                <ul className="flex flex-col gap-1">
                    {value.map((item, i) => (
                        <li key={i} className="text-[12px] leading-relaxed flex items-start gap-1.5" style={{ color: C.body }}>
                            <span className="mt-[7px] w-1 h-1 rounded-full flex-shrink-0" style={{ background: C.mute }} />
                            {String(item)}
                        </li>
                    ))}
                </ul>
            )
        }
        // array of objects -> stacked cards, numbered so order is legible
        return (
            <div className="flex flex-col gap-2">
                {value.map((item, i) => (
                    <div key={i} className="rounded-lg border overflow-hidden" style={{ borderColor: C.line }}>
                        <div className="px-2.5 py-1 flex items-center gap-1.5 border-b" style={{ borderColor: C.hair, background: C.canvas }}>
                            <span className="text-[9px] font-mono font-bold" style={{ color: C.mute }}>#{i + 1}</span>
                        </div>
                        <div className="px-2.5 py-2">
                            <DynamicValue value={item} />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (isPlainObject(value)) {
        const entries = Object.entries(value).filter(([, v]) => v !== undefined)
        if (entries.length === 0) return <span className="text-[12px]" style={{ color: C.faint }}>—</span>
        return (
            <div className="flex flex-col gap-2.5">
                {entries.map(([k, v]) => (
                    <DynamicField key={k} label={k} value={v} />
                ))}
            </div>
        )
    }

    if (typeof value === 'boolean') {
        return (
            <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide"
                style={{ background: value ? C.goodBg : C.badBg, color: value ? C.goodFg : C.badFg }}
            >
                {value ? 'Yes' : 'No'}
            </span>
        )
    }

    return <span className="text-[12.5px] leading-relaxed" style={{ color: C.body }}>{String(value)}</span>
}

const DynamicField = ({ label, value }: { label: string; value: any }) => {
    const keyLower = label.toLowerCase()
    const statusStyle =
        keyLower.includes('status') && typeof value === 'string'
            ? STATUS_STYLES[value.toLowerCase()]
            : null
    const isArray = Array.isArray(value)
    const nested = isPlainObject(value) || isArray
    const TypeIcon = isArray ? ListRowsIcon : isPlainObject(value) ? LayersIcon : null

    return (
        <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1" style={{ color: C.mute }}>
                {TypeIcon && <TypeIcon />}
                {humanizeKey(label)}
            </p>
            {statusStyle ? (
                <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block"
                    style={{ background: statusStyle.bg, color: statusStyle.color }}
                >
                    {String(value)}
                </span>
            ) : nested ? (
                <div className="pl-2.5 border-l-2" style={{ borderColor: C.hair }}>
                    <DynamicValue value={value} />
                </div>
            ) : (
                <DynamicValue value={value} />
            )}
        </div>
    )
}

/* Renders the full `aiData` payload (any shape) as a titled "agent output"
   panel — each top-level key becomes its own labelled block so the reply
   reads like a structured result set, not a wall of text. */
const AgentOutputPanel = ({ data }: { data: Record<string, any> }) => {
    const entries = Object.entries(data || {}).filter(([, v]) => v !== undefined)
    if (entries.length === 0) return null
    return (
        <div>
            <div className="flex items-center gap-1.5 mb-2">
                <LayersIcon />
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.violet }}>
                    Agent output
                </p>
                <span className="text-[9px] font-mono px-1.5 py-[1px] rounded" style={{ background: C.hair, color: C.mute }}>
                    {entries.length} field{entries.length === 1 ? '' : 's'}
                </span>
            </div>
            <div className="flex flex-col gap-2.5">
                {entries.map(([key, value]) => (
                    <div key={key} className="rounded-xl border overflow-hidden" style={{ borderColor: C.line }}>
                        <div className="px-3 py-2 border-b" style={{ borderColor: C.hair, background: C.canvas }}>
                            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.mute }}>
                                {humanizeKey(key)}
                            </p>
                        </div>
                        <div className="px-3 py-2.5">
                            <DynamicValue value={value} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ────────────────────────────────────────────────────────────────────────
   Run step rail — the signature element of this workspace. Every agent
   reply is framed as a short pipeline (request → context → processing →
   delivery) instead of a bare answer, so the person can see *what the
   agent did* on the way to the result, not just the result itself.
   ──────────────────────────────────────────────────────────────────────── */
type StepStatus = 'done' | 'error' | 'warn'
type RunStep = { label: string; status: StepStatus; detail?: string }

const buildSteps = ({
    useCustomerContext, contextCustomerName, webhookOk, webhookStatus, webhookError, hasError,
}: {
    useCustomerContext: boolean
    contextCustomerName?: string | null
    webhookOk: boolean | null
    webhookStatus: number | null
    webhookError?: string | null
    hasError: boolean
}): RunStep[] => {
    const steps: RunStep[] = [{ label: 'Request dispatched', status: 'done' }]
    steps.push(
        useCustomerContext
            ? { label: 'Customer context attached', status: 'done', detail: contextCustomerName || undefined }
            : { label: 'General request — no customer attached', status: 'done' }
    )
    if (hasError) {
        steps.push({ label: 'Agent processing', status: 'error', detail: 'No response returned' })
        return steps
    }
    steps.push({ label: 'Agent processing complete', status: 'done' })
    if (webhookError) {
        steps.push({ label: 'Webhook delivery', status: 'error', detail: webhookError })
    } else if (webhookOk === true) {
        steps.push({ label: 'Webhook delivery', status: 'done', detail: webhookStatus ? `HTTP ${webhookStatus}` : undefined })
    } else if (webhookOk === false) {
        steps.push({ label: 'Webhook delivery', status: 'warn', detail: webhookStatus ? `HTTP ${webhookStatus}` : 'No webhook configured' })
    }
    return steps
}

const StepMarker = ({ status }: { status: StepStatus }) => {
    const map = {
        done: { bg: C.goodBg, fg: C.good, Icon: StepCheckIcon },
        error: { bg: C.badBg, fg: C.bad, Icon: StepXIcon },
        warn: { bg: C.warnBg, fg: C.warn, Icon: StepDashIcon },
    }
    const { bg, fg, Icon } = map[status]
    return (
        <span className="flex items-center justify-center w-4 h-4 rounded-full flex-shrink-0" style={{ background: bg, color: fg }}>
            <Icon />
        </span>
    )
}

const StepRail = ({ steps, runningLabel }: { steps: RunStep[]; runningLabel?: string }) => (
    <div className="flex flex-col">
        {steps.map((s, i) => (
            <div key={i} className="flex gap-2.5">
                <div className="flex flex-col items-center">
                    <StepMarker status={s.status} />
                    {(i < steps.length - 1 || runningLabel) && (
                        <span className="w-px flex-1 my-0.5" style={{ background: C.line, minHeight: '10px' }} />
                    )}
                </div>
                <div className="pb-2.5 flex-1 min-w-0">
                    <p className="text-[11px] font-medium leading-tight" style={{ color: C.body }}>{s.label}</p>
                    {s.detail && (
                        <p className="text-[10px] mt-0.5 font-mono truncate" style={{ color: C.mute }}>{s.detail}</p>
                    )}
                </div>
            </div>
        ))}
        {runningLabel && (
            <div className="flex gap-2.5">
                <div className="flex flex-col items-center">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full flex-shrink-0" style={{ background: C.violetSoft }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.violet, animation: 'qa-pulse 1.1s ease-in-out infinite' }} />
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold" style={{ color: C.violet }}>{runningLabel}</p>
                </div>
            </div>
        )}
    </div>
)

/* Header strip shown at the top of every agent-run card */
const RunHeader = ({
    tone, statusLabel, startedAt, finishedAt,
}: { tone: Tone; statusLabel: string; startedAt?: number; finishedAt?: number }) => {
    const duration = startedAt && finishedAt ? formatDuration(finishedAt - startedAt) : null
    return (
        <div className="px-4 py-2.5 flex items-center gap-2 border-b" style={{ borderColor: C.hair, background: 'linear-gradient(180deg, #faf5ff 0%, #ffffff 100%)' }}>
            <span className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: C.violetSoft, color: C.violet }}>
                <BoltIcon />
            </span>
            <span className="text-[11px] font-bold" style={{ color: '#4c1d95' }}>Agent run</span>
            <span className="ml-auto flex items-center gap-2 flex-shrink-0">
                {duration && <span className="text-[9.5px] font-mono" style={{ color: C.faint }}>{duration}</span>}
                {startedAt && <span className="text-[9.5px] font-mono" style={{ color: C.faint }}>{formatClock(startedAt)}</span>}
                <StatusPill tone={tone} label={statusLabel} />
            </span>
        </div>
    )
}

/* ─────────────────────────────────────────────── */
const WebhookAgentWorkspace = ({
    isOpen,
    agent,
}: {
    isOpen: boolean
    agent?: {
        id: string
        name?: string
        webhookUrl?: string | null
        webhookMethod?: string | null
        promptRole?: string | null
    }
}) => {
    const [customers, setCustomers] = useState<any[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [useCustomerContext, setUseCustomerContext] = useState(true)
    const [prompt, setPrompt] = useState('')
    const [messages, setMessages] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchField, setSearchField] = useState<'All' | 'Name' | 'Email' | 'Campaign' | 'Type' | 'Phone'>('All')
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [isCustomersLoading, setIsCustomersLoading] = useState(true)
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

    // Cycles through short status labels while a request is in flight, so
    // the loading state reads as "the agent is doing something specific"
    // rather than an anonymous spinner.
    const LOADING_LABELS = ['Contacting webhook', 'Waiting on agent', 'Parsing response']
    const [loadingLabelIdx, setLoadingLabelIdx] = useState(0)
    useEffect(() => {
        if (!isLoading) { setLoadingLabelIdx(0); return }
        const id = setInterval(() => setLoadingLabelIdx(i => (i + 1) % LOADING_LABELS.length), 1100)
        return () => clearInterval(id)
    }, [isLoading])

    const mapCustomer = (item: any) => {
        const date = new Date(item.createdAt)
        const formattedDate =
            date.getDate().toString().padStart(2, '0') + '-' +
            (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
            date.getFullYear()
        return {
            _id: item._id,
            Campaign: item.Campaign,
            Type: item.CustomerType,
            Name: item.customerName,
            Email: item.Email,
            City: item.City,
            ContactNumber: item.ContactNumber?.slice(0, 10),
            Date: item.CustomerDate === 'N/A' ? 'N/A' : item.CustomerDate ? formatDateDMY(item.CustomerDate) : formattedDate,
        }
    }

    useEffect(() => {
        if (!isOpen) return
        const fetchCustomers = async () => {
            setIsCustomersLoading(true)
            try {
                const res: any = await getCustomer()
                if (res) setCustomers(res.map(mapCustomer))
            } catch (err) {
                console.error(err)
            } finally {
                setIsCustomersLoading(false)
            }
        }
        fetchCustomers()
    }, [isOpen])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isLoading])

    // Reset pagination whenever the search narrows/widens the result set
    useEffect(() => { setVisibleCount(PAGE_SIZE) }, [searchQuery, searchField])

    const SEARCH_FIELDS = ['All', 'Name', 'Email', 'Campaign', 'Type', 'Phone'] as const

    const filteredCustomers = useMemo(() => {
        if (!searchQuery.trim()) return customers
        const q = searchQuery.toLowerCase()
        return customers.filter((c: any) => {
            if (searchField === 'All') {
                return (
                    c.Name?.toLowerCase().includes(q) ||
                    c.Email?.toLowerCase().includes(q) ||
                    c.Campaign?.toLowerCase().includes(q) ||
                    c.Type?.toLowerCase().includes(q) ||
                    c.ContactNumber?.includes(q)
                )
            }
            const fieldMap: Record<string, string> = {
                Name: c.Name, Email: c.Email, Campaign: c.Campaign,
                Type: c.Type, Phone: c.ContactNumber,
            }
            return fieldMap[searchField]?.toLowerCase().includes(q)
        })
    }, [customers, searchQuery, searchField])

    // Only ever mount `visibleCount` rows — this is what keeps the list
    // smooth. Rendering the full array (avatars + badges + hover handlers
    // per row) for large customer lists is what was causing the jank.
    const visibleCustomers = useMemo(
        () => filteredCustomers.slice(0, visibleCount),
        [filteredCustomers, visibleCount]
    )
    const hasMoreCustomers = visibleCount < filteredCustomers.length
    const remainingCustomers = filteredCustomers.length - visibleCount

    const selectedCustomer = customers.find((c: any) => c._id === selectedId)

    const autoResize = () => {
        const el = textareaRef.current
        if (el) {
            el.style.height = 'auto'
            el.style.height = Math.min(el.scrollHeight, 120) + 'px'
        }
    }

    // Submit is gated on: a prompt, not already loading, and — only if
    // customer context is turned on — a customer actually being selected.
    const canSubmit = prompt.trim() && !isLoading && (!useCustomerContext || Boolean(selectedId))

    const handleSubmit = async () => {
        if (!canSubmit) return
        const userText = prompt
        const contextCustomerName = useCustomerContext ? (selectedCustomer?.Name ?? null) : null
        const startedAt = Date.now()

        setMessages(prev => [...prev, { role: 'user', text: userText, sentAt: startedAt }])
        setPrompt('')
        if (textareaRef.current) textareaRef.current.style.height = 'auto'
        setIsLoading(true)

        try {
            const res: any = await runWebhookAgent({
                agentId: agent?.id,
                customerId: useCustomerContext ? selectedId : undefined,
                userPrompt: userText,
            })
            const finishedAt = Date.now()

            if (res?.success) {
                const d = res.data ?? {}
                const aiData = d.aiData ?? {}
                // leadTemperature / aiReason / answer are just convenience
                // shortcuts the backend lifts out of aiData when present.
                // Everything else in aiData is schema-less and rendered
                // dynamically via AgentOutputPanel below.
                const KNOWN_KEYS = ['leadTemperature', 'aiReason', 'answer']
                const extraData = Object.fromEntries(
                    Object.entries(aiData).filter(([k, v]) => !KNOWN_KEYS.includes(k) && v !== undefined)
                )
                const webhookOk = d.webhookResponse?.ok ?? null
                const webhookStatus = d.webhookResponse?.status ?? null
                const webhookError = d.webhookError ?? null

                setMessages(prev => [
                    ...prev,
                    {
                        role: 'ai',
                        ok: true,
                        leadTemperature: d.leadTemperature,
                        aiReason: d.aiReason,
                        answer: d.answer,
                        extraData,
                        webhookOk,
                        webhookStatus,
                        webhookError,
                        startedAt,
                        finishedAt,
                        steps: buildSteps({ useCustomerContext, contextCustomerName, webhookOk, webhookStatus, webhookError, hasError: false }),
                    }
                ])
            } else {
                setMessages(prev => [...prev, {
                    role: 'ai', ok: false, answer: 'Something went wrong. Please try again.',
                    startedAt, finishedAt,
                    steps: buildSteps({ useCustomerContext, contextCustomerName, webhookOk: null, webhookStatus: null, webhookError: null, hasError: true }),
                }])
            }
        } catch {
            const finishedAt = Date.now()
            setMessages(prev => [...prev, {
                role: 'ai', ok: false, answer: 'Something went wrong. Please try again.',
                startedAt, finishedAt,
                steps: buildSteps({ useCustomerContext, contextCustomerName, webhookOk: null, webhookStatus: null, webhookError: null, hasError: true }),
            }])
        }
        setIsLoading(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
    }

    const hints = [
        'Trigger the workflow',
        'Run this for the current data',
        'Process this request',
    ]

    return (
        <div className="flex h-full overflow-hidden rounded-xl" style={{ background: C.canvas }}>

            {/* ══ LEFT PANEL ══ */}
            <div className="flex flex-col border-r" style={{
                width: '272px', minWidth: '272px', borderColor: C.line, background: C.card
            }}>
                <ContextToggle
                    useCustomer={useCustomerContext}
                    onToggle={() => setUseCustomerContext(v => !v)}
                />

                {useCustomerContext ? (
                    <>
                        <div className="px-4 pt-2 pb-3 flex-shrink-0">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                                    style={{ background: C.skySoft, color: C.sky }}>
                                    <UserIcon />
                                </div>
                                <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: '#64748b' }}>
                                    Customers
                                </span>
                                <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                                    style={{ background: C.hair, color: C.mute }}>
                                    {filteredCustomers.length}
                                </span>
                            </div>

                            <div className="relative mb-2">
                                <div className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: C.mute }}>
                                    <SearchIcon />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search customers…"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-7 py-2 rounded-xl text-[11.5px] outline-none border transition-all duration-150"
                                    style={{ background: C.canvas, borderColor: C.line, color: C.body }}
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2"
                                        style={{ color: C.faint }}>
                                        <ClearIcon />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-1 flex-wrap">
                                {SEARCH_FIELDS.map(f => (
                                    <button key={f} onClick={() => setSearchField(f as any)}
                                        className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full transition-all duration-150"
                                        style={searchField === f
                                            ? { background: C.sky, color: '#ffffff' }
                                            : { background: C.hair, color: C.mute }
                                        }>
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
                            {isCustomersLoading ? (
                                <div className="flex flex-col gap-3 px-4 py-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="animate-pulse flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-gray-200" />
                                            <div className="flex-1">
                                                <div className="h-2.5 bg-gray-200 rounded w-2/3 mb-1.5" />
                                                <div className="h-2 bg-gray-100 rounded w-1/2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredCustomers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                                        style={{ background: C.hair, color: C.faint }}>
                                        <SearchIcon />
                                    </div>
                                    <p className="text-[11px] font-medium" style={{ color: C.mute }}>No customers found</p>
                                </div>
                            ) : (
                                <>
                                    {visibleCustomers.map((c: any) => {
                                        const isSelected = selectedId === c._id
                                        return (
                                            <button
                                                key={c._id}
                                                onClick={() => { setSelectedId(c._id); setMessages([]) }}
                                                className="w-full text-left px-4 py-3 transition-all duration-150 border-b"
                                                style={{
                                                    borderColor: C.hair,
                                                    background: isSelected ? 'rgba(2,132,199,0.05)' : 'transparent',
                                                    borderLeft: isSelected ? '2px solid #0284c7' : '2px solid transparent',
                                                }}
                                            >
                                                <div className="flex items-start gap-2.5">
                                                    <Avatar name={c.Name} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[12px] font-semibold truncate" style={{ color: isSelected ? C.sky : '#1e293b' }}>
                                                            {c.Name || '—'}
                                                        </p>
                                                        <p className="text-[10.5px] truncate mt-0.5" style={{ color: C.mute }}>
                                                            {c.ContactNumber || c.Email || '—'}
                                                        </p>
                                                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                                            {c.Campaign && (
                                                                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md"
                                                                    style={{ background: '#f0f9ff', color: '#0369a1' }}>{c.Campaign}</span>
                                                            )}
                                                            {c.Type && (
                                                                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md"
                                                                    style={{ background: C.goodBg, color: C.goodFg }}>{c.Type}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        )
                                    })}

                                    {hasMoreCustomers && (
                                        <button
                                            onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                                            className="w-full py-3 text-[11.5px] font-medium border-t transition-colors"
                                            style={{ borderColor: C.hair, color: C.mute, background: 'transparent' }}
                                        >
                                            Load {Math.min(PAGE_SIZE, remainingCustomers)} more
                                            <span style={{ color: C.faint }}> ({remainingCustomers} remaining)</span>
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    /* ── General-request mode: no customer list needed ── */
                    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
                            style={{ background: C.skySoft, color: C.sky }}>
                            <BoltIcon />
                        </div>
                        <p className="text-[12px] font-semibold mb-1" style={{ color: C.body }}>General mode</p>
                        <p className="text-[11px] leading-relaxed" style={{ color: C.mute }}>
                            No customer needed for this action. Flip the toggle above if you want to attach one.
                        </p>
                    </div>
                )}
            </div>

            {/* ══ RIGHT PANEL ══ */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Header bar */}
                <div className="flex-shrink-0 px-5 py-3 border-b flex items-center gap-3"
                    style={{ background: C.card, borderColor: C.line, minHeight: '56px' }}>
                    {useCustomerContext && selectedCustomer ? (
                        <>
                            <Avatar name={selectedCustomer.Name} />
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold" style={{ color: '#1e293b' }}>
                                    {selectedCustomer.Name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    {selectedCustomer.Email && (
                                        <span className="text-[10.5px]" style={{ color: C.mute }}>{selectedCustomer.Email}</span>
                                    )}
                                    {selectedCustomer.ContactNumber && (
                                        <span className="text-[10.5px]" style={{ color: C.mute }}>· {selectedCustomer.ContactNumber}</span>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                                style={{ background: C.skySoft, color: C.sky }}>
                                <BoltIcon />
                            </div>
                            <p className="text-[13px] font-semibold" style={{ color: '#1e293b' }}>
                                {agent?.name || 'Webhook Agent'}
                            </p>
                            <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: '#fdf4ff', color: '#a21caf', border: '1px solid #f0abfc' }}>
                                General request
                            </span>
                        </div>
                    )}
                    <span className="ml-auto flex items-center gap-1.5 text-[10px] font-medium flex-shrink-0" style={{ color: C.mute }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: isLoading ? C.violet : C.good }} />
                        {isLoading ? 'Agent running' : 'Agent ready'}
                    </span>
                </div>

                {/* Chat area */}
                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>

                    {/* Empty state — customer context required but none picked */}
                    {useCustomerContext && !selectedId && (
                        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                                style={{ background: C.skySoft, color: C.sky }}>
                                <UserIcon />
                            </div>
                            <p className="text-[13px] font-semibold" style={{ color: C.body }}>Select a customer to continue</p>
                            <p className="text-[11.5px] mt-1" style={{ color: C.mute }}>
                                Or turn off "Use customer context" to send a general request.
                            </p>
                        </div>
                    )}

                    {/* Empty state — ready, no messages yet */}
                    {(!useCustomerContext || selectedId) && messages.length === 0 && !isLoading && (
                        <div className="flex flex-col items-center justify-center flex-1 py-10">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
                                style={{ background: C.skySoft, color: C.sky }}>
                                <SparkleIcon />
                            </div>
                            <p className="text-[12px] font-semibold mb-1" style={{ color: C.body }}>Webhook agent ready</p>
                            <p className="text-[11px] mb-5" style={{ color: C.mute }}>
                                {useCustomerContext ? 'Ask anything about this customer' : 'Send a general request'}
                            </p>
                            <div className="flex flex-col gap-2 w-full max-w-[320px]">
                                {hints.map(h => (
                                    <button key={h} onClick={() => setPrompt(h)}
                                        className="text-left px-3.5 py-2.5 rounded-xl text-[11.5px] font-medium transition-all duration-150 border"
                                        style={{ background: C.canvas, borderColor: C.line, color: '#475569' }}>
                                        {h}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Message bubbles */}
                    {messages.map((m: any, i: number) => {
                        const hasExtraData = m.extraData && Object.keys(m.extraData).length > 0
                        const hasAnyContent = m.leadTemperature || m.aiReason || m.answer || hasExtraData
                        const tone: Tone = m.ok === false ? 'error' : (m.webhookError ? 'warn' : 'success')
                        const statusLabel = m.ok === false ? 'Failed' : (m.webhookError ? 'Partial' : 'Completed')

                        return (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                                {m.role === 'ai' && (
                                    <div className="max-w-[86%] w-full sm:w-auto rounded-2xl rounded-tl-md overflow-hidden border"
                                        style={{ borderColor: C.line, background: C.card, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

                                        <RunHeader tone={tone} statusLabel={statusLabel} startedAt={m.startedAt} finishedAt={m.finishedAt} />

                                        {m.steps && (
                                            <div className="px-4 pt-3 pb-1 border-b" style={{ borderColor: C.hair }}>
                                                <StepRail steps={m.steps} />
                                            </div>
                                        )}

                                        {m.leadTemperature && (
                                            <div className="px-4 py-3 border-b flex items-center justify-between"
                                                style={{ borderColor: C.hair, background: C.canvas }}>
                                                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.mute }}>
                                                    Result
                                                </span>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                    style={{ background: '#f0f9ff', color: '#0369a1' }}>
                                                    {m.leadTemperature}
                                                </span>
                                            </div>
                                        )}

                                        {m.aiReason && (
                                            <div className="px-4 pt-3 pb-3">
                                                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: C.mute }}>
                                                    Reason
                                                </p>
                                                <p className="text-[12.5px] leading-relaxed" style={{ color: C.body }}>{m.aiReason}</p>
                                            </div>
                                        )}

                                        {m.answer && (
                                            <div className="px-4 pt-3 pb-3">
                                                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: C.mute }}>
                                                    Answer
                                                </p>
                                                <p className="text-[12.5px] leading-relaxed" style={{ color: C.body }}>{m.answer}</p>
                                            </div>
                                        )}

                                        {/* Dynamic / schema-less portion of aiData */}
                                        {hasExtraData && (
                                            <div className="px-4 pt-3 pb-3 border-t" style={{ borderColor: C.hair }}>
                                                <AgentOutputPanel data={m.extraData} />
                                            </div>
                                        )}

                                        {!hasAnyContent && (
                                            <div className="px-4 py-3">
                                                <p className="text-[11.5px]" style={{ color: C.mute }}>No response content returned.</p>
                                            </div>
                                        )}

                                        {/* Webhook delivery status */}
                                        {(m.webhookOk !== null && m.webhookOk !== undefined) || m.webhookError ? (
                                            <div className="px-4 pb-3 pt-2 border-t flex items-center gap-1.5" style={{ borderColor: C.hair }}>
                                                {m.webhookError ? (
                                                    <>
                                                        <span style={{ color: C.bad }}><AlertIcon /></span>
                                                        <span className="text-[10.5px] font-medium" style={{ color: C.badFg }}>
                                                            Webhook delivery failed — result shown above wasn't sent externally
                                                        </span>
                                                    </>
                                                ) : m.webhookOk ? (
                                                    <>
                                                        <span style={{ color: C.good }}><CheckCircleIcon /></span>
                                                        <span className="text-[10.5px] font-medium" style={{ color: C.goodFg }}>
                                                            Delivered to webhook ({m.webhookStatus})
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span style={{ color: C.bad }}><AlertIcon /></span>
                                                        <span className="text-[10.5px] font-medium" style={{ color: C.badFg }}>
                                                            Webhook responded with status {m.webhookStatus}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                )}

                                {m.role === 'user' && (
                                    <div className="flex flex-col items-end gap-1 max-w-[72%]">
                                        <div
                                            className="px-3.5 py-2.5 rounded-2xl rounded-tr-md text-[12px] leading-relaxed"
                                            style={{ background: C.sky, color: '#ffffff', boxShadow: '0 2px 8px rgba(2,132,199,0.25)' }}
                                        >
                                            {m.text}
                                        </div>
                                        {m.sentAt && (
                                            <span className="text-[9.5px] font-mono pr-1" style={{ color: C.faint }}>{formatClock(m.sentAt)}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-[86%] rounded-2xl rounded-tl-md overflow-hidden border"
                                style={{ borderColor: C.line, background: C.card, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                                <RunHeader tone="info" statusLabel="Running" startedAt={Date.now()} />
                                <div className="px-4 pt-3 pb-3">
                                    <StepRail
                                        steps={[
                                            { label: 'Request dispatched', status: 'done' },
                                            useCustomerContext
                                                ? { label: 'Customer context attached', status: 'done', detail: selectedCustomer?.Name }
                                                : { label: 'General request — no customer attached', status: 'done' },
                                        ]}
                                        runningLabel={LOADING_LABELS[loadingLabelIdx]}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input area — always visible; gated only by canSubmit */}
                <div className="flex-shrink-0 border-t px-4 pt-3 pb-4"
                    style={{ borderColor: C.line, background: C.card }}>
                    <div
                        className="flex items-end gap-2 rounded-2xl px-3.5 pt-2.5 pb-2 border-[1.5px] transition-all duration-200"
                        style={{ background: '#ffffff', borderColor: C.line }}
                        onFocusCapture={e => {
                            const w = e.currentTarget as HTMLElement
                            w.style.borderColor = '#7dd3fc'
                            w.style.boxShadow = '0 0 0 3px rgba(125,211,252,0.12)'
                        }}
                        onBlurCapture={e => {
                            const w = e.currentTarget as HTMLElement
                            w.style.borderColor = C.line
                            w.style.boxShadow = 'none'
                        }}
                    >
                        <div className="flex-1">
                            <textarea
                                ref={textareaRef}
                                rows={1}
                                value={prompt}
                                onChange={e => { setPrompt(e.target.value); autoResize() }}
                                onKeyDown={handleKeyDown}
                                placeholder={
                                    useCustomerContext && !selectedId
                                        ? "Select a customer first…"
                                        : "Ask this webhook agent…"
                                }
                                disabled={isLoading || (useCustomerContext && !selectedId)}
                                className="w-full resize-none bg-transparent outline-none leading-relaxed disabled:opacity-40"
                                style={{ fontSize: '12.5px', color: C.ink, minHeight: '24px' }}
                            />
                            <div className="flex items-center justify-between pt-1.5 mt-1 border-t" style={{ borderColor: C.hair }}>
                                <div className="flex items-center gap-2">
                                    {hints.slice(0, 2).map(h => (
                                        <button key={h} onClick={() => setPrompt(h)}
                                            className="text-[9.5px] font-medium px-2 py-0.5 rounded-lg transition-all border"
                                            style={{ borderColor: C.line, background: C.canvas, color: C.mute }}>
                                            {h}
                                        </button>
                                    ))}
                                </div>
                                <span className="text-[9px] font-mono" style={{ color: C.faint }}>↵ send</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            className="w-8 h-8 mb-1 rounded-xl flex items-center justify-center transition-all duration-150 flex-shrink-0 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{ background: C.sky, boxShadow: '0 2px 8px rgba(2,132,199,0.3)' }}
                        >
                            {isLoading
                                ? <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent"
                                    style={{ animation: 'qa-spin 0.8s linear infinite' }} />
                                : <SendIcon />
                            }
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes qa-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
        @keyframes qa-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes qa-pulse {
          0%, 100% { opacity: 0.35; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>
        </div>
    )
}

export default WebhookAgentWorkspace