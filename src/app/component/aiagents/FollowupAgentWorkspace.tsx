"use client"
import { formatDateDMY } from '@/app/utils/formatDateDMY'
import { getCustomer } from '@/store/customer'
import { customerGetDataInterface } from '@/store/customer.interface'
import { addAiFollowup } from '@/store/customerFollowups'
import React, { useEffect, useMemo, useRef, useState } from 'react'

const PAGE_SIZE = 20

/* ─────────────────────────── icons ─────────────────────────── */
const CheckIcon = () => (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
        <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)
const WaIcon = ({ c = 'w-3.5 h-3.5' }: { c?: string }) => (
    <svg className={c} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.6-5.8c-.25-.13-1.5-.74-1.73-.82-.23-.09-.4-.13-.57.12s-.65.82-.8 1-.29.19-.54.06a6.7 6.7 0 0 1-3.35-2.93c-.25-.43.25-.4.72-1.33.08-.16.04-.3-.02-.42l-.8-1.92c-.21-.5-.42-.44-.58-.44h-.5c-.17 0-.44.06-.67.31s-.87.85-.87 2.07.9 2.4 1.02 2.57c.13.16 1.76 2.7 4.28 3.78 1.6.69 2.22.75 3.02.63.49-.07 1.5-.61 1.71-1.21.21-.6.21-1.1.15-1.21-.06-.1-.23-.16-.48-.29z" />
    </svg>
)
const MailIcon = ({ c = 'w-3.5 h-3.5' }: { c?: string }) => (
    <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="2" y="4.5" width="20" height="15" rx="2" strokeWidth={2} />
        <path d="M2.5 6.5l9.5 7 9.5-7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)
const SparkleIcon = () => (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
)
const AlertIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v4m0 4h.01M10.29 3.86L2.1 18a2 2 0 001.72 3h16.36a2 2 0 001.72-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
)
const EyeIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" strokeWidth={2} />
    </svg>
)
const BackIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5m7-7l-7 7 7 7" />
    </svg>
)
const ArrowIcon = ({ dir }: { dir: 'l' | 'r' }) => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d={dir === 'l' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
    </svg>
)

const STATUS_CFG: Record<string, { bg: string; color: string; border: string }> = {
    'Interested': { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
    'Converted': { bg: '#eef2ff', color: '#4338ca', border: '#c7d2fe' },
    'Callback Later': { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
    'No Response': { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
    'Not Interested': { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
    'Wrong Number': { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
}
const statusCfg = (s?: string) => STATUS_CFG[s || ''] || STATUS_CFG['No Response']

const WA_TONE = { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' }
const EMAIL_TONE = { bg: '#eef2ff', color: '#4338ca', border: '#c7d2fe' }

const LANGUAGES = [
    { value: 'hinglish', label: 'Hinglish' },
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'Hindi' },
]

const PROMPT_HINTS = [
    { label: 'Interested', prompt: 'Customer liked the plan and asked us to send the details on email. Wants to decide this week.' },
    { label: 'Callback', prompt: 'Customer is busy right now, asked to call back next week.' },
    { label: 'No answer', prompt: 'Customer is not picking calls, tried twice today.' },
    { label: 'Closed', prompt: 'Customer confirmed the booking and made the payment.' },
]

/* ── draft shape returned by the backend, mutated locally as the user edits ── */
interface Draft {
    customerId: string
    name: string
    email: string | null
    phone: string | null
    data: { StartDate?: string; StatusType?: string; FollowupNextDate?: string | null; Description?: string } | null
    whatsapp: string | null
    emailContent: { subject: string; body: string } | null
    aiMessage: string | null
    error: string | null
    skipWa?: boolean
    skipEmail?: boolean
}

const ProviderCard = ({
    active, onToggle, icon, name, hint, reachable, total, tone,
}: {
    active: boolean; onToggle: () => void
    icon: React.ReactNode; name: string; hint: string
    reachable: number; total: number
    tone: { bg: string; color: string; border: string }
}) => {
    const missing = total - reachable
    return (
        <button onClick={onToggle}
            className="flex-1 flex items-start gap-2.5 px-3 py-2.5 rounded-xl border text-left cursor-pointer transition-all active:scale-[0.98]"
            style={active
                ? { background: tone.bg, borderColor: tone.border, boxShadow: `0 0 0 2px ${tone.border}55` }
                : { background: '#fff', borderColor: '#e7e5e4' }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={active ? { background: '#fff', color: tone.color } : { background: '#f5f5f4', color: '#d6d3d1' }}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <p className="text-[11.5px] font-bold" style={{ color: active ? tone.color : '#a8a29e' }}>{name}</p>
                    <div className="w-[14px] h-[14px] rounded-[4px] flex items-center justify-center border flex-shrink-0 ml-auto transition-all"
                        style={active ? { background: tone.color, borderColor: tone.color } : { background: '#fff', borderColor: '#d6d3d1' }}>
                        {active && <CheckIcon />}
                    </div>
                </div>
                <p className="text-[9.5px] mt-0.5 leading-tight" style={{ color: active ? tone.color : '#d6d3d1' }}>{hint}</p>
                {total > 0 && (
                    <p className="text-[9.5px] font-mono mt-1" style={{ color: active ? tone.color : '#d6d3d1' }}>
                        {reachable}/{total} reachable
                        {active && missing > 0 && <span className="text-orange-500"> · {missing} skipped</span>}
                    </p>
                )}
            </div>
        </button>
    )
}

interface AIAgent { id: string; name: string; description: string; type: string; status: string }
interface Props { onClose?: () => void; data: AIAgent | null; totalData?: number }

/* ─────────────────────────── component ─────────────────────────── */
const FollowupAgentWorkspace = ({ onClose }: Props) => {
    const [customerData, setCustomerData] = useState<customerGetDataInterface[]>([])
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
    const [isFetching, setIsFetching] = useState(false)

    const [prompt, setPrompt] = useState('')
    const [language, setLanguage] = useState('hinglish')
    const [waOn, setWaOn] = useState(true)
    const [emailOn, setEmailOn] = useState(true)

    const [step, setStep] = useState<'compose' | 'review' | 'done'>('compose')
    const [drafts, setDrafts] = useState<Draft[]>([])
    const [activeIdx, setActiveIdx] = useState(0)
    const [personalized, setPersonalized] = useState(true)
    const [emailHtmlMode, setEmailHtmlMode] = useState(false)

    const [isPreviewing, setIsPreviewing] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<any>(null)
    const [showConfirm, setShowConfirm] = useState(false)

    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const mapCustomer = (item: any) => {
        const date = new Date(item.createdAt)
        const formattedDate =
            date.getDate().toString().padStart(2, '0') + '-' +
            (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getFullYear()
        return {
            _id: item._id, Campaign: item.Campaign, Type: item.CustomerType, SubType: item.CustomerSubType,
            Name: item.customerName, Description: item.Description, Email: item.Email, City: item.City,
            Location: item.Location, Adderess: item.Adderess, Area: item.Area, SubLocation: item.SubLocation,
            CustomerId: item.CustomerId, ClientId: item.ClientId, CustomerYear: item.CustomerYear,
            Facillities: item.Facillities, ContactNumber: item.ContactNumber?.slice(0, 10),
            ReferenceId: item.ReferenceId, AssignTo: item.AssignTo ?? [],
            isFavourite: item.isFavourite, isChecked: item.isChecked, Other: item.Other,
            Date: item.CustomerDate === 'N/A' ? 'N/A' : item.CustomerDate ? formatDateDMY(item.CustomerDate) : formattedDate,
            CustomerImage: item.CustomerImage || '', SitePlan: item.SitePlan || '', URL: item.URL || '',
            Video: item.Video || '', GoogleMap: item.GoogleMap || '', Price: item.Price || '',
            CustomerFields: item.CustomerFields || {},
        }
    }

    const fetchCustomer = async () => {
        setIsFetching(true)
        const res = await getCustomer()
        if (res) setCustomerData(res.map(mapCustomer))
        setIsFetching(false)
    }

    useEffect(() => { fetchCustomer() }, [])
    useEffect(() => { setVisibleCount(PAGE_SIZE) }, [searchQuery])
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && showConfirm && !isSending) setShowConfirm(false)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [showConfirm, isSending])

    const filteredCustomers = customerData.filter(c =>
        c.Campaign?.includes(searchQuery) ||
        c.Type?.includes(searchQuery) ||
        c.SubType?.includes(searchQuery) ||
        c.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.Email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.ContactNumber?.includes(searchQuery)
    )

    const visibleCustomers = filteredCustomers.slice(0, visibleCount)
    const hasMore = visibleCount < filteredCustomers.length
    const remaining = filteredCustomers.length - visibleCount

    const selectedCustomers = useMemo(
        () => customerData.filter(c => selectedIds.includes(c._id)),
        [customerData, selectedIds]
    )
    const reachableWa = selectedCustomers.filter(c => c.ContactNumber).length
    const reachableEmail = selectedCustomers.filter(c => c.Email).length

    /* counts across ALL drafts, not just the visible one */
    const waToSend = drafts.filter(d => !d.error && d.whatsapp?.trim() && d.phone && !d.skipWa).length
    const emailToSend = drafts.filter(d => !d.error && d.emailContent?.subject?.trim() && d.emailContent?.body?.trim() && d.email && !d.skipEmail).length
    const failedDrafts = drafts.filter(d => d.error).length

    const waSeconds = waToSend > 1 ? Math.round(waToSend * 5) : 0
    const etaLabel = waSeconds > 90 ? `~${Math.ceil(waSeconds / 60)} min` : waSeconds ? `~${waSeconds}s` : null

    const active = drafts[activeIdx]

    const patchActive = (patch: Partial<Draft>) =>
        setDrafts(prev => prev.map((d, i) => (i === activeIdx ? { ...d, ...patch } : d)))

    const toggleSelect = (id: string) =>
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

    const toggleSelectAll = () =>
        setSelectedIds(selectedIds.length === filteredCustomers.length ? [] : filteredCustomers.map(c => c._id))

    const isAllSelected = filteredCustomers.length > 0 && selectedIds.length === filteredCustomers.length
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < filteredCustomers.length

    const autoResize = () => {
        const el = textareaRef.current
        if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px' }
    }

    const basePayload = () => ({
        customerIds: selectedIds,
        userPrompt: prompt.trim(),
        language,
        sendWhatsapp: waOn,
        sendEmail: emailOn,
    })

    /* ── STEP 1: draft one message per customer ── */
    const handlePreview = async () => {
        if (!prompt.trim() || selectedIds.length === 0 || isPreviewing) return
        setError(null)
        setIsPreviewing(true)
        try {
            const res: any = await addAiFollowup({ ...basePayload(), confirm: false })
            if (!res || res.success === false || !Array.isArray(res.drafts)) {
                setError(res?.message || 'Could not generate the follow-ups. Please try again.')
                return
            }
            setDrafts(res.drafts.map((d: Draft) => ({ ...d, skipWa: false, skipEmail: false })))
            setPersonalized(res.personalized !== false)
            setActiveIdx(0)
            setEmailHtmlMode(false)
            setStep('review')
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setIsPreviewing(false)
        }
    }

    /* ── STEP 2: send the reviewed drafts verbatim — no new AI calls ── */
    const handleSend = async () => {
        setIsSending(true)
        setError(null)
        try {
            const payloadDrafts = drafts
                .filter(d => !d.error)
                .map(d => ({
                    customerId: d.customerId,
                    data: d.data,
                    whatsapp: !d.skipWa && d.whatsapp?.trim() ? d.whatsapp.trim() : null,
                    emailContent: !d.skipEmail && d.emailContent?.subject?.trim() && d.emailContent?.body?.trim()
                        ? { subject: d.emailContent.subject.trim(), body: d.emailContent.body }
                        : null,
                }))

            const res: any = await addAiFollowup({ ...basePayload(), confirm: true, drafts: payloadDrafts })
            if (!res || res.success === false) {
                setError(res?.message || 'Sending failed. Please try again.')
                return
            }
            setResult(res)
            setShowConfirm(false)
            setStep('done')
        } catch {
            setError('Something went wrong while sending.')
        } finally {
            setIsSending(false)
        }
    }

    const reset = () => {
        setStep('compose'); setDrafts([]); setResult(null)
        setActiveIdx(0); setPrompt(''); setError(null)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePreview() }
    }

    const canPreview = !!prompt.trim() && selectedIds.length > 0 && !isPreviewing

    return (
        <div className="flex flex-col h-full overflow-hidden bg-stone-50 relative">

            {/* ══════════ CUSTOMER PICKER ══════════ */}
            {step === 'compose' && (
                <>
                    <div className="flex-shrink-0 bg-white border-b border-stone-200 px-4 pt-2 pb-3">
                        <div className="relative">
                            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none">
                                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                                <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search by name, email or phone..."
                                className="w-full h-9 pl-8 pr-3 text-[12.5px] bg-stone-100 border border-stone-200 rounded-lg outline-none placeholder-stone-400 text-stone-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
                        </div>
                    </div>

                    <div className="flex-shrink-0 flex items-center justify-between bg-white border-b border-stone-200 px-4 py-2">
                        <div className="flex items-center gap-1.5 text-[11.5px] text-stone-500">
                            <span className="bg-indigo-50 text-indigo-600 font-semibold text-[11px] px-2 py-0.5 rounded-full">{filteredCustomers.length}</span>
                            customers
                            {selectedIds.length > 0 && (
                                <>
                                    <span className="text-stone-300">·</span>
                                    <span className="bg-orange-50 text-orange-500 font-semibold text-[11px] px-2 py-0.5 rounded-full">{selectedIds.length} selected</span>
                                </>
                            )}
                        </div>
                        {filteredCustomers.length > 0 && (
                            <button onClick={toggleSelectAll} className="text-[11.5px] font-medium text-indigo-500 hover:text-indigo-700 transition-colors cursor-pointer">
                                {isAllSelected ? 'Deselect all' : 'Select all'}
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0">
                        {isFetching ? (
                            <div className="flex items-center justify-center py-14">
                                <div className="w-5 h-5 rounded-full border-2 border-stone-200 border-t-indigo-500 animate-spin" />
                            </div>
                        ) : filteredCustomers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-14 text-stone-400 text-[13px] gap-2">
                                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className="opacity-30">
                                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                No customers found
                            </div>
                        ) : (
                            <div className="max-h-[250px] overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                <table className="w-full border-collapse">
                                    <thead className="sticky top-0 z-10">
                                        <tr>
                                            <th className="w-10 pl-4 py-2 bg-stone-100 border-b border-stone-200 text-left">
                                                <div onClick={toggleSelectAll}
                                                    className={`w-[15px] h-[15px] rounded cursor-pointer flex items-center justify-center border transition-all
                                                        ${isAllSelected || isIndeterminate ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-stone-300 hover:border-indigo-400'}`}>
                                                    {isAllSelected && <CheckIcon />}
                                                    {isIndeterminate && <div className="w-2 h-0.5 bg-white rounded-sm" />}
                                                </div>
                                            </th>
                                            {['Campaign', 'Customer', 'Contact'].map(h => (
                                                <th key={h} className="py-2 px-2 text-left text-[10.5px] font-semibold uppercase tracking-wider text-stone-400 bg-stone-100 border-b border-stone-200">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visibleCustomers.map(c => {
                                            const isSelected = selectedIds.includes(c._id)
                                            return (
                                                <tr key={c._id} onClick={() => toggleSelect(c._id)}
                                                    className={`border-b border-stone-100 cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50 hover:bg-indigo-100/70' : 'bg-white hover:bg-stone-50'}`}>
                                                    <td className="pl-4 py-2.5 w-10 align-middle">
                                                        <div className={`w-[15px] h-[15px] rounded flex items-center justify-center border flex-shrink-0 transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-stone-300'}`}>
                                                            {isSelected && <CheckIcon />}
                                                        </div>
                                                    </td>
                                                    <td className="py-2.5 px-2 align-middle">
                                                        <p className="text-[12.5px] font-medium text-stone-800 truncate leading-none">{c.Campaign || '—'}</p>
                                                        <p className="text-[11px] text-indigo-400 truncate mt-0.5">{c.Type || '—'}</p>
                                                    </td>
                                                    <td className="py-2.5 px-2 align-middle">
                                                        <div className="flex items-center gap-1.5">
                                                            <p className="text-[12.5px] font-medium text-stone-800 truncate leading-none">{c.Name || '—'}</p>
                                                            {!c.Email && <span className="text-[8.5px] font-bold px-1 py-0.5 rounded bg-red-50 text-red-600 flex-shrink-0">no email</span>}
                                                            {!c.ContactNumber && <span className="text-[8.5px] font-bold px-1 py-0.5 rounded bg-red-50 text-red-600 flex-shrink-0">no phone</span>}
                                                        </div>
                                                        <p className="text-[11px] text-indigo-400 truncate mt-0.5">{c.Email || '—'}</p>
                                                    </td>
                                                    <td className="py-2.5 px-2 pr-4 align-middle">
                                                        <p className="text-[12px] text-stone-600 tabular-nums whitespace-nowrap">{c.ContactNumber || '—'}</p>
                                                        {c.City && <p className="text-[11px] text-stone-400 mt-0.5 truncate">{c.City}</p>}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        {hasMore && (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-3 bg-white">
                                                    <button onClick={e => { e.stopPropagation(); setVisibleCount(v => v + PAGE_SIZE) }}
                                                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-stone-300 text-[12px] font-medium text-stone-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/40 transition-all cursor-pointer">
                                                        Load {Math.min(PAGE_SIZE, remaining)} more
                                                        <span className="text-[11px] text-stone-400 font-normal">({remaining} remaining)</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        )}
                                        <tr><td colSpan={4} className="py-2" /></tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ══════════ REVIEW — one draft per customer ══════════ */}
            {step === 'review' && active && (
                <>
                    {/* customer switcher */}
                    <div className="flex-shrink-0 bg-white border-b border-stone-200 px-3 py-2 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <button onClick={() => { setStep('compose'); setError(null) }}
                                className="flex items-center gap-1 text-[11px] font-semibold text-stone-500 hover:text-indigo-600 cursor-pointer transition-colors">
                                <BackIcon /> Brief
                            </button>
                            <span className="text-[11px] font-bold text-stone-700 ml-1">
                                {drafts.length} draft{drafts.length !== 1 ? 's' : ''}
                            </span>
                            {failedDrafts > 0 && (
                                <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-600">
                                    {failedDrafts} failed
                                </span>
                            )}
                            {!personalized && (
                                <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded bg-stone-100 text-stone-500">
                                    shared copy
                                </span>
                            )}
                            <div className="ml-auto flex items-center gap-1">
                                <button onClick={() => setActiveIdx(i => Math.max(0, i - 1))} disabled={activeIdx === 0}
                                    className="w-6 h-6 rounded-lg border border-stone-200 flex items-center justify-center text-stone-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:border-indigo-300">
                                    <ArrowIcon dir="l" />
                                </button>
                                <span className="text-[10.5px] font-mono text-stone-400 w-10 text-center">{activeIdx + 1}/{drafts.length}</span>
                                <button onClick={() => setActiveIdx(i => Math.min(drafts.length - 1, i + 1))} disabled={activeIdx === drafts.length - 1}
                                    className="w-6 h-6 rounded-lg border border-stone-200 flex items-center justify-center text-stone-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:border-indigo-300">
                                    <ArrowIcon dir="r" />
                                </button>
                            </div>
                        </div>

                        {/* name chips */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {drafts.map((d, i) => (
                                <button key={d.customerId} onClick={() => { setActiveIdx(i); setEmailHtmlMode(false) }}
                                    className="flex items-center gap-1 text-[10.5px] font-semibold px-2 py-1 rounded-lg border cursor-pointer whitespace-nowrap flex-shrink-0 transition-all"
                                    style={i === activeIdx
                                        ? { background: '#4f46e5', color: '#fff', borderColor: '#4f46e5' }
                                        : d.error
                                            ? { background: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca' }
                                            : { background: '#fff', color: '#78716c', borderColor: '#e7e5e4' }}>
                                    {d.name || '—'}
                                    {!d.error && (
                                        <span className="flex items-center gap-0.5 opacity-70">
                                            {d.whatsapp && !d.skipWa && d.phone && <WaIcon c="w-2.5 h-2.5" />}
                                            {d.emailContent?.subject && !d.skipEmail && d.email && <MailIcon c="w-2.5 h-2.5" />}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3 flex flex-col gap-3">

                        {active.error ? (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-3.5">
                                <p className="text-[12px] font-semibold text-red-700">Draft failed for {active.name}</p>
                                <p className="text-[11px] text-red-600 mt-1">{active.error}</p>
                                <p className="text-[10.5px] text-red-400 mt-1.5">This customer will be skipped. The rest still send normally.</p>
                            </div>
                        ) : (
                            <>
                                {/* classification */}
                                <div className="rounded-xl border border-stone-200 bg-white p-3.5">
                                    <p className="text-[9.5px] font-bold uppercase tracking-widest text-stone-300 mb-2">
                                        Follow-up record · {active.name}
                                    </p>
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-lg border"
                                            style={{
                                                background: statusCfg(active.data?.StatusType).bg,
                                                color: statusCfg(active.data?.StatusType).color,
                                                borderColor: statusCfg(active.data?.StatusType).border,
                                            }}>
                                            {active.data?.StatusType}
                                        </span>
                                        {active.data?.FollowupNextDate ? (
                                            <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-lg bg-stone-100 text-stone-600">
                                                Next: {active.data.FollowupNextDate}
                                            </span>
                                        ) : (
                                            <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-lg bg-stone-100 text-stone-400">No next follow-up</span>
                                        )}
                                    </div>
                                    <p className="text-[12px] text-stone-600 leading-relaxed">{active.data?.Description}</p>
                                    {active.aiMessage && (
                                        <p className="text-[11px] text-indigo-500 mt-2 flex items-start gap-1.5">
                                            <span className="mt-0.5 flex-shrink-0"><SparkleIcon /></span>{active.aiMessage}
                                        </p>
                                    )}
                                </div>

                                {/* nothing to send */}
                                {!active.whatsapp && !active.emailContent && (
                                    <div className="rounded-xl border border-stone-200 bg-stone-100 p-3.5 text-center">
                                        <p className="text-[12px] font-semibold text-stone-600">No message for {active.name}</p>
                                        <p className="text-[11px] text-stone-400 mt-1">
                                            {waOn || emailOn
                                                ? `"${active.data?.StatusType}" doesn't warrant outreach. The record still saves.`
                                                : 'No provider selected. The record still saves.'}
                                        </p>
                                    </div>
                                )}

                                {/* whatsapp */}
                                {active.whatsapp !== null && active.whatsapp !== undefined && (
                                    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden transition-opacity"
                                        style={{ opacity: active.skipWa ? 0.55 : 1 }}>
                                        <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-stone-100"
                                            style={{ background: active.skipWa ? '#fafaf9' : 'rgba(240,253,244,0.5)' }}>
                                            <span style={{ color: active.skipWa ? '#d6d3d1' : '#16a34a' }}><WaIcon /></span>
                                            <span className="text-[11px] font-bold" style={{ color: active.skipWa ? '#a8a29e' : '#15803d' }}>WhatsApp</span>
                                            <span className="text-[10px] font-mono text-stone-400">{active.whatsapp.length} chars</span>
                                            {!active.phone && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-600">no phone</span>}
                                            <button onClick={() => patchActive({ skipWa: !active.skipWa })}
                                                className="ml-auto text-[9.5px] font-bold px-2 py-1 rounded-lg border cursor-pointer transition-all"
                                                style={active.skipWa
                                                    ? { background: '#fff', color: '#a8a29e', borderColor: '#e7e5e4' }
                                                    : { background: '#dcfce7', color: '#15803d', borderColor: '#bbf7d0' }}>
                                                {active.skipWa ? 'Skipped' : 'Will send'}
                                            </button>
                                        </div>
                                        <textarea
                                            value={active.whatsapp} onChange={e => patchActive({ whatsapp: e.target.value })}
                                            rows={6} disabled={active.skipWa}
                                            className="w-full resize-y px-3.5 py-3 text-[12.5px] leading-relaxed outline-none text-stone-700 bg-white focus:bg-stone-50 transition-colors disabled:cursor-not-allowed"
                                        />
                                    </div>
                                )}

                                {/* email */}
                                {active.emailContent && (
                                    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden transition-opacity"
                                        style={{ opacity: active.skipEmail ? 0.55 : 1 }}>
                                        <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-stone-100"
                                            style={{ background: active.skipEmail ? '#fafaf9' : 'rgba(238,242,255,0.5)' }}>
                                            <span style={{ color: active.skipEmail ? '#d6d3d1' : '#4f46e5' }}><MailIcon /></span>
                                            <span className="text-[11px] font-bold" style={{ color: active.skipEmail ? '#a8a29e' : '#4338ca' }}>Email</span>
                                            {!active.email && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-600">no email</span>}
                                            <button onClick={() => patchActive({ skipEmail: !active.skipEmail })}
                                                className="ml-auto text-[9.5px] font-bold px-2 py-1 rounded-lg border cursor-pointer transition-all"
                                                style={active.skipEmail
                                                    ? { background: '#fff', color: '#a8a29e', borderColor: '#e7e5e4' }
                                                    : { background: '#e0e7ff', color: '#4338ca', borderColor: '#c7d2fe' }}>
                                                {active.skipEmail ? 'Skipped' : 'Will send'}
                                            </button>
                                            <button onClick={() => setEmailHtmlMode(v => !v)}
                                                className="flex items-center gap-1 text-[9.5px] font-semibold px-2 py-1 rounded-lg cursor-pointer transition-all"
                                                style={emailHtmlMode ? { background: '#f1f5f9', color: '#64748b' } : { background: '#4f46e5', color: '#fff' }}>
                                                <EyeIcon /> {emailHtmlMode ? 'Preview' : 'Edit HTML'}
                                            </button>
                                        </div>
                                        <div className="px-3.5 py-2.5 border-b border-stone-100">
                                            <input
                                                value={active.emailContent.subject} disabled={active.skipEmail}
                                                onChange={e => patchActive({ emailContent: { ...active.emailContent!, subject: e.target.value } })}
                                                placeholder="Subject"
                                                className="w-full text-[12.5px] font-medium text-stone-800 outline-none bg-transparent placeholder-stone-300 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                        {emailHtmlMode ? (
                                            <textarea
                                                value={active.emailContent.body} disabled={active.skipEmail}
                                                onChange={e => patchActive({ emailContent: { ...active.emailContent!, body: e.target.value } })}
                                                rows={10}
                                                className="w-full resize-y px-3.5 py-3 text-[11.5px] font-mono leading-relaxed outline-none text-stone-700 bg-stone-50 disabled:cursor-not-allowed"
                                            />
                                        ) : (
                                            <div className="h-[280px] bg-white">
                                                <iframe srcDoc={active.emailContent.body} title="Email preview" className="w-full h-full border-none" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {error && <div className="px-3 py-2 rounded-lg text-[11px] bg-red-50 text-red-700">{error}</div>}
                    </div>
                </>
            )}

            {/* ══════════ DONE ══════════ */}
            {step === 'done' && result && (
                <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3 flex flex-col gap-3">
                    <div className="rounded-xl border border-stone-200 bg-white p-4">
                        <p className="text-[13px] font-bold text-stone-800 mb-2.5">Follow-ups created</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-lg border bg-stone-50 text-stone-600 border-stone-200">
                                {result.count} record{result.count !== 1 ? 's' : ''}
                            </span>
                            <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-lg border bg-green-50 text-green-700 border-green-200">
                                {result.whatsappSent || 0} WhatsApp
                            </span>
                            <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-lg border bg-indigo-50 text-indigo-700 border-indigo-200">
                                {result.emailSent || 0} email
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        {(result.results || []).map((r: any) => {
                            const failed = r.errors?.length > 0
                            return (
                                <div key={r.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl border bg-white border-stone-200">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-[11.5px] font-semibold text-stone-800 truncate">{r.name || '—'}</p>
                                            {r.statusType && (
                                                <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                                                    style={{ background: statusCfg(r.statusType).bg, color: statusCfg(r.statusType).color }}>
                                                    {r.statusType}
                                                </span>
                                            )}
                                        </div>
                                        {failed && <p className="text-[10px] text-red-600 truncate">{r.errors.join(' · ')}</p>}
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        {r.sent?.includes('whatsapp') && <span className="text-green-600" title="WhatsApp sent"><WaIcon c="w-3 h-3" /></span>}
                                        {r.sent?.includes('email') && <span className="text-indigo-600" title="Email sent"><MailIcon c="w-3 h-3" /></span>}
                                        {!r.sent?.length && <span className="text-[9.5px] font-semibold text-stone-400">nothing sent</span>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <button onClick={reset}
                        className="mt-1 w-full py-2.5 rounded-xl text-[12px] font-bold text-white cursor-pointer transition-all active:scale-95"
                        style={{ background: '#4f46e5' }}>
                        Start a new follow-up
                    </button>
                </div>
            )}

            {/* ══════════ BOTTOM BAR ══════════ */}
            <div className="flex-shrink-0 bg-white border-t border-stone-200 px-3 pt-2.5 pb-3 flex flex-col gap-2">

                {step === 'compose' && (
                    <>
                        <div className="flex flex-col gap-1.5">
                            <p className="text-[9.5px] font-bold uppercase tracking-widest text-stone-300">Send via</p>
                            <div className="flex items-stretch gap-2">
                                <ProviderCard active={waOn} onToggle={() => setWaOn(v => !v)}
                                    icon={<WaIcon />} name="WhatsApp" hint="Instant, high open rate"
                                    reachable={reachableWa} total={selectedIds.length} tone={WA_TONE} />
                                <ProviderCard active={emailOn} onToggle={() => setEmailOn(v => !v)}
                                    icon={<MailIcon />} name="Email" hint="Better for details"
                                    reachable={reachableEmail} total={selectedIds.length} tone={EMAIL_TONE} />
                            </div>
                            {!waOn && !emailOn && (
                                <p className="text-[10.5px] text-orange-500">
                                    No provider selected — records will be saved, but nothing will be sent.
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9.5px] font-bold uppercase tracking-widest text-stone-300 mr-0.5">Tone</span>
                            {LANGUAGES.map(l => (
                                <button key={l.value} onClick={() => setLanguage(l.value)}
                                    className="text-[10px] font-semibold px-2 py-1 rounded-lg border cursor-pointer transition-all"
                                    style={language === l.value
                                        ? { background: '#f5f5f4', color: '#44403c', borderColor: '#d6d3d1' }
                                        : { background: '#fff', color: '#cbd5e1', borderColor: '#e7e5e4' }}>
                                    {l.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                            {PROMPT_HINTS.map(h => (
                                <button key={h.label} onClick={() => { setPrompt(h.prompt); setTimeout(autoResize, 0) }}
                                    className="text-[9.5px] font-medium px-2 py-1 rounded-lg border bg-stone-50 border-stone-200 text-stone-500 hover:border-indigo-300 hover:text-indigo-600 cursor-pointer transition-all">
                                    {h.label}
                                </button>
                            ))}
                        </div>

                        {selectedIds.length > 0 && (
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                <span className="text-[11.5px] font-medium text-indigo-500">
                                    {selectedIds.length} customer{selectedIds.length !== 1 ? 's' : ''} selected
                                </span>
                                <span className="text-[10.5px] text-stone-400">· {selectedIds.length} message{selectedIds.length !== 1 ? 's' : ''} will be written</span>
                            </div>
                        )}

                        {error && <div className="px-3 py-2 rounded-lg text-[11px] bg-red-50 text-red-700">{error}</div>}

                        <div className={`relative rounded-xl border overflow-hidden transition-all
                            ${selectedIds.length === 0
                                ? 'border-stone-200 bg-stone-50 opacity-60 pointer-events-none'
                                : 'border-stone-200 bg-stone-50 focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100'}`}>
                            <textarea
                                ref={textareaRef} rows={1} value={prompt}
                                onChange={e => { setPrompt(e.target.value); autoResize() }}
                                onKeyDown={handleKeyDown}
                                disabled={selectedIds.length === 0 || isPreviewing}
                                placeholder={selectedIds.length === 0
                                    ? 'Select customers above to begin...'
                                    : 'What happened on the call? e.g. "customer liked it, send details on email"'}
                                className="w-full min-h-[44px] max-h-[120px] px-3 pt-2.5 pb-9 bg-transparent border-none outline-none resize-none text-[13px] text-stone-800 placeholder-stone-400 leading-snug"
                            />
                            <div className="absolute bottom-1.5 left-3 right-2 flex items-center justify-between">
                                <span className="text-[10px] text-stone-400 pointer-events-none select-none">
                                    {isPreviewing ? `Writing ${selectedIds.length} message${selectedIds.length !== 1 ? 's' : ''}...` : 'Enter ↵ draft · nothing sends yet'}
                                </span>
                                <button onClick={handlePreview} disabled={!canPreview}
                                    className={`px-2.5 h-7 rounded-lg flex items-center gap-1.5 text-[11px] font-bold transition-all cursor-pointer
                                        ${canPreview
                                            ? 'bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-sm shadow-indigo-200 hover:scale-[1.03] active:scale-95'
                                            : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}>
                                    {isPreviewing
                                        ? <div className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                        : <><SparkleIcon /> Draft</>}
                                </button>
                            </div>
                        </div>

                        {selectedIds.length === 0 && (
                            <p className="text-center text-[11px] text-stone-400">Select at least one customer to use the AI agent</p>
                        )}
                    </>
                )}

                {step === 'review' && (
                    <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium text-stone-700 truncate">
                                {waToSend || emailToSend
                                    ? `${waToSend} WhatsApp · ${emailToSend} email`
                                    : 'Records only — no messages'}
                            </p>
                            {etaLabel && (
                                <p className="text-[10px] text-orange-500 mt-0.5">
                                    Takes {etaLabel} — WhatsApp is paced to protect the number
                                </p>
                            )}
                        </div>
                        <button onClick={() => setShowConfirm(true)}
                            className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11.5px] font-bold text-white cursor-pointer transition-all active:scale-95"
                            style={{ background: '#ea580c', boxShadow: '0 3px 10px rgba(234,88,12,0.35)' }}>
                            Confirm &amp; Send All
                        </button>
                    </div>
                )}
            </div>

            {/* ══════════ CONFIRM MODAL ══════════ */}
            {showConfirm && (
                <div className="absolute inset-0 z-40 flex items-center justify-center px-6"
                    style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)' }}>
                    <div className="w-full max-w-[380px] rounded-2xl overflow-hidden bg-white" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
                        <div className="px-5 pt-5 pb-4">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-orange-50 text-orange-600"><AlertIcon /></div>
                            <p className="text-[14px] font-bold text-stone-900">Send all drafts?</p>
                            <p className="text-[11.5px] mt-1.5 leading-relaxed text-stone-500">
                                Creates <b className="text-stone-800">{drafts.filter(d => !d.error).length}</b> follow-up record{drafts.filter(d => !d.error).length !== 1 ? 's' : ''} and sends{' '}
                                <b className="text-stone-800">{waToSend}</b> WhatsApp and <b className="text-stone-800">{emailToSend}</b> email{emailToSend !== 1 ? 's' : ''}. This can't be undone.
                            </p>
                            {failedDrafts > 0 && (
                                <p className="text-[10.5px] mt-2 px-3 py-2 rounded-lg bg-red-50 text-red-700">
                                    {failedDrafts} draft{failedDrafts !== 1 ? 's' : ''} failed to generate and will be skipped.
                                </p>
                            )}
                            {etaLabel && (
                                <p className="text-[10.5px] mt-2.5 px-3 py-2 rounded-lg bg-orange-50 text-orange-700">
                                    Keep this open for about {etaLabel} — WhatsApp sends are spaced 3–7s apart to avoid a ban.
                                </p>
                            )}
                            {error && <p className="text-[11px] mt-3 px-3 py-2 rounded-lg bg-red-50 text-red-700">{error}</p>}
                        </div>
                        <div className="flex items-center gap-2 px-5 py-3.5 border-t border-stone-100 bg-stone-50">
                            <button onClick={() => !isSending && setShowConfirm(false)} disabled={isSending}
                                className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold bg-white text-stone-500 border border-stone-200 cursor-pointer disabled:opacity-50">
                                Cancel
                            </button>
                            <button onClick={handleSend} disabled={isSending}
                                className="flex-1 py-2.5 rounded-xl text-[12px] font-bold text-white cursor-pointer active:scale-95 disabled:opacity-70 flex items-center justify-center gap-1.5"
                                style={{ background: '#ea580c', boxShadow: '0 3px 10px rgba(234,88,12,0.35)' }}>
                                {isSending && <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                                {isSending ? 'Sending…' : 'Confirm & Send'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FollowupAgentWorkspace