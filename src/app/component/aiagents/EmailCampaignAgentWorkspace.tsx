"use client"
import { formatDateDMY } from '@/app/utils/formatDateDMY'
import { getCustomer } from '@/store/customer'
import { emailCustomerViaAi } from '@/store/masters/mail/mail'
import { emailTemplates, getEmailTemplateById, EmailTemplate } from '@/app/data/emailTemplate' // <-- Adjust this path
import React, { useEffect, useRef, useState, useMemo } from 'react'

/* ─────────────────────────────────────────────────────────────
   Email Campaign Agent Workspace
   ───────────────────────────────────────────────────────────── */

const PAGE_SIZE = 20
const RESULT_PAGE_SIZE = 8

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
const EyeIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" strokeWidth={2} />
    </svg>
)
const CloseIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
)
const PhoneIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z" />
    </svg>
)
const MailIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" strokeWidth={2} />
    </svg>
)
const MapPinIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" strokeWidth={2} />
    </svg>
)
const CalendarIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth={2} />
        <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2} strokeLinecap="round" />
        <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2} strokeLinecap="round" />
        <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2} />
    </svg>
)
const TagIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth={2} strokeLinecap="round" />
    </svg>
)
const LinkIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
)
const CheckIcon = () => (
    <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none">
        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)
const UsersIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
)
const EnvelopeIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="2" y="4.5" width="20" height="15" rx="2" strokeWidth={2} />
        <path d="M2.5 6.5l9.5 7 9.5-7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)
const EditIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
)
const GlobeIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" strokeWidth={2} />
        <path strokeWidth={2} d="M3 12h18M12 3c2.4 2.6 3.6 5.6 3.6 9s-1.2 6.4-3.6 9c-2.4-2.6-3.6-5.6-3.6-9S9.6 5.6 12 3z" />
    </svg>
)
const AlertIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v4m0 4h.01M10.29 3.86L2.1 18a2 2 0 001.72 3h16.36a2 2 0 001.72-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
)
const ChevronIcon = ({ open }: { open: boolean }) => (
    <svg className="w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0"
        style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
)
const StampMark = ({ className = '', color = '#c7d2fe' }: { className?: string; color?: string }) => (
    <svg className={className} viewBox="0 0 64 64" fill="none" style={{ color }}>
        <rect x="2" y="2" width="60" height="60" rx="9" stroke="currentColor" strokeWidth="1.6" strokeDasharray="3 3.4" />
        <rect x="17" y="20" width="30" height="22" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M17 22l15 11 15-11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

/* ─────────────────────────────────────────────────────────────
   Template picker — full-screen gallery with real, live thumbnails.
   Each card renders the actual template HTML inside a scaled-down
   iframe, so what you pick is exactly what gets sent — no fake
   screenshots to keep in sync.
   ───────────────────────────────────────────────────────────── */

const TEMPLATE_SRC_W = 640
const TEMPLATE_SRC_H = 780

const TemplateThumbnail = ({ html, size = 'card', label }: { html: string; size?: 'card' | 'chip'; label?: string }) => {
    const box = size === 'chip' ? { w: 44, h: 36, scale: 0.075, radius: 7 } : { w: '100%' as const, h: 168, scale: 0.235, radius: 0 }
    return (
        <div
            className="relative overflow-hidden flex-shrink-0"
            style={{ width: box.w, height: box.h, background: '#ffffff', borderRadius: box.radius }}
        >
            <div
                style={{
                    width: TEMPLATE_SRC_W, height: TEMPLATE_SRC_H,
                    transform: `scale(${box.scale})`, transformOrigin: 'top left',
                    position: 'absolute', top: 0, left: 0, pointerEvents: 'none',
                }}
            >
                <iframe srcDoc={html} title={label || 'template preview'} scrolling="no" style={{ width: TEMPLATE_SRC_W, height: TEMPLATE_SRC_H, border: 'none' }} />
            </div>
        </div>
    )
}

const SelectedTemplateChip = ({ template, onChange, onClear }: { template: EmailTemplate; onChange: () => void; onClear?: () => void }) => (
    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl border" style={{ borderColor: '#e7e2da', background: '#fbfaf8' }}>
        <TemplateThumbnail html={template.html} size="chip" label={template.name} />
        <div className="flex-1 min-w-0">
            <p className="text-[10.5px] font-semibold truncate" style={{ color: '#1c1917' }}>{template.name}</p>
            <p className="text-[9px]" style={{ color: '#94a3b8' }}>{template.category || 'Template'}</p>
        </div>
        <button onClick={onChange} className="text-[10px] cursor-pointer font-semibold px-2 py-1 rounded-lg flex-shrink-0" style={{ color: '#0d9488' }}>Change</button>
        {onClear && (
            <button onClick={onClear} className="text-[10px] cursor-pointer font-semibold px-2 py-1 rounded-lg flex-shrink-0" style={{ color: '#94a3b8' }}>Clear</button>
        )}
    </div>
)

const ChooseTemplateButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button onClick={onClick} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed cursor-pointer transition-all hover:border-teal-300 hover:bg-teal-50/40" style={{ borderColor: '#e7e2da', color: '#94a3b8' }}>
        <SparkleIcon /> <span className="text-[11px] font-semibold">{label}</span>
    </button>
)

const BlankTemplateCard = ({ selected, onClick }: { selected: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className="flex flex-col rounded-2xl border-2 border-dashed overflow-hidden text-left transition-all"
        style={{ borderColor: selected ? '#0d9488' : '#e7e2da', background: selected ? 'rgba(13,148,136,0.05)' : '#fbfaf8' }}
    >
        <div className="flex items-center justify-center" style={{ height: 168 }}>
            <div className="flex flex-col items-center gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#f1f5f9', color: '#94a3b8' }}><EditIcon /></div>
                <span className="text-[10px] font-semibold" style={{ color: '#94a3b8' }}>Start blank</span>
            </div>
        </div>
        <div className="px-3 py-2.5 border-t" style={{ borderColor: selected ? '#99f6e4' : '#e7e2da' }}>
            <p className="text-[11px] font-bold" style={{ color: '#1c1917' }}>No template</p>
            <p className="text-[9.5px] mt-0.5 leading-relaxed" style={{ color: '#94a3b8' }}>Write the HTML yourself, or let AI compose freely</p>
        </div>
    </button>
)

const TemplateCard = ({ t, selected, onClick }: { t: EmailTemplate; selected: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className="flex flex-col rounded-2xl border overflow-hidden text-left transition-all"
        style={{ borderColor: selected ? '#0d9488' : '#e7e2da', boxShadow: selected ? '0 0 0 3px rgba(13,148,136,0.12)' : '0 1px 3px rgba(0,0,0,0.03)', background: '#ffffff' }}
    >
        <div className="relative border-b" style={{ borderColor: '#e7e2da' }}>
            <TemplateThumbnail html={t.html} size="card" label={t.name} />
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.04) 100%)' }} />
            {selected && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#0d9488', boxShadow: '0 2px 6px rgba(13,148,136,0.4)' }}>
                    <CheckIcon />
                </div>
            )}
        </div>
        <div className="px-3 py-2.5">
            <div className="flex items-center gap-1.5">
                <p className="text-[11px] font-bold truncate" style={{ color: '#1c1917' }}>{t.name}</p>
                {t.category && (
                    <span className="text-[8.5px] font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0" style={{ background: '#f0fdfa', color: '#0f766e' }}>{t.category}</span>
                )}
            </div>
            <p className="text-[9.5px] mt-0.5 line-clamp-2 leading-relaxed" style={{ color: '#94a3b8' }}>{t.description || 'Standard email template'}</p>
        </div>
    </button>
)

const TemplatePickerModal = ({
    open, templates, selectedId, onSelect, onClose,
}: {
    open: boolean
    templates: EmailTemplate[]
    selectedId: string | null
    onSelect: (id: string | null) => void
    onClose: () => void
}) => {
    const [query, setQuery] = useState('')
    const [category, setCategory] = useState('All')

    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open, onClose])

    useEffect(() => { if (open) { setQuery(''); setCategory('All') } }, [open])

    if (!open) return null

    const categories = ['All', ...Array.from(new Set(templates.map(t => t.category).filter(Boolean))) as string[]]
    const filtered = templates.filter(t => {
        const matchesCategory = category === 'All' || t.category === category
        const q = query.trim().toLowerCase()
        const matchesQuery = !q || t.name.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)
        return matchesCategory && matchesQuery
    })

    return (
        <div className="absolute inset-0 z-50 flex flex-col" style={{ background: '#fbfaf8', animation: 'ec-modal-in 0.16s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <div className="flex-shrink-0 px-6 py-4 border-b flex items-center gap-4" style={{ borderColor: '#e7e2da', background: '#ffffff' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(13,148,136,0.1)' }}>
                    <StampMark className="w-5 h-5" color="#0d9488" />
                </div>
                <div className="min-w-0">
                    <p className="text-[14px] font-bold" style={{ color: '#1c1917' }}>Choose your stationery</p>
                    <p className="text-[10.5px]" style={{ color: '#94a3b8' }}>Pick a layout to start from — you can still edit it, or hand it to AI as a base</p>
                </div>
                <button onClick={onClose} className="ml-auto cursor-pointer w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0" style={{ background: '#f1f5f9', color: '#64748b' }}>
                    <CloseIcon />
                </button>
            </div>

            <div className="flex-shrink-0 px-6 py-3 border-b flex items-center gap-3 flex-wrap" style={{ borderColor: '#e7e2da', background: '#ffffff' }}>
                <div className="relative" style={{ width: 240 }}>
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }}><SearchIcon /></div>
                    <input
                        type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search templates…"
                        className="w-full pl-8 pr-3 py-2 rounded-xl text-[11.5px] outline-none border bg-stone-50 border-slate-200 text-slate-700 focus:border-teal-300 focus:ring-2 focus:ring-teal-100 focus:bg-white"
                    />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                    {categories.map(c => (
                        <button key={c} onClick={() => setCategory(c)}
                            className="text-[10px] cursor-pointer font-semibold px-2.5 py-1 rounded-full transition-all"
                            style={category === c ? { background: '#0d9488', color: '#ffffff' } : { background: '#f1f5f9', color: '#94a3b8' }}>
                            {c}
                        </button>
                    ))}
                </div>
                <span className="ml-auto text-[10.5px] font-medium" style={{ color: '#94a3b8' }}>{filtered.length} template{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e7e2da transparent' }}>
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5" style={{ background: '#f1f5f9', color: '#cbd5e1' }}><SearchIcon /></div>
                        <p className="text-[12px] font-semibold" style={{ color: '#334155' }}>No templates match "{query}"</p>
                        <p className="text-[11px] mt-1" style={{ color: '#94a3b8' }}>Try a different search term or category</p>
                    </div>
                ) : (
                    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                        <BlankTemplateCard selected={!selectedId} onClick={() => { onSelect(null); onClose() }} />
                        {filtered.map(t => (
                            <TemplateCard key={t.id} t={t} selected={selectedId === t.id} onClick={() => { onSelect(t.id); onClose() }} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

const RESULT_STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; border: string; dot: string }> = {
    sent: { label: 'Sent', bg: '#f0fdf4', color: '#166534', border: '#bbf7d0', dot: '#34d399' },
    failed: { label: 'Failed', bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', dot: '#f87171' },
    skipped_no_email: { label: 'No email', bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', dot: '#94a3b8' },
}
const getResultStatusCfg = (status: string) =>
    RESULT_STATUS_CONFIG[status] || { label: status?.replace(/_/g, ' ') || 'Unknown', bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', dot: '#94a3b8' }

const LANGUAGE_OPTIONS = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'hinglish', label: 'Hinglish' },
]

const AI_PROMPT_HINTS = [
    { label: 'Audit pitch', prompt: 'Reach out with a friendly audit of their property/listing — point out one specific thing we noticed and offer a quick call to walk through improvements.' },
    { label: 'Price drop', prompt: "Let them know there's a price drop on something they showed interest in, and invite them to lock it in before it's gone." },
    { label: 'Re-engagement', prompt: "It's been a while since we last spoke — check in warmly, remind them why they were interested, and invite them to pick up where we left off." },
]

const TOKEN_HINTS = ['{{Name}}', '{{City}}', '{{Campaign}}', '{{ContactNumber}}', '{{Email}}']

const Avatar = ({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) => {
    const initials = (name || '?').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    const colors: [string, string][] = [
        ['#e0e7ff', '#4338ca'], ['#fce7f3', '#db2777'], ['#d1fae5', '#059669'],
        ['#fff7ed', '#c2410c'], ['#fef3c7', '#d97706'], ['#ede9fe', '#7c3aed'],
    ]
    const idx = (name?.charCodeAt(0) ?? 0) % colors.length
    const [bg, fg] = colors[idx]
    const cls = size === 'sm' ? 'w-6 h-6 rounded-lg text-[9px]' : size === 'lg' ? 'w-12 h-12 rounded-2xl text-[15px]' : 'w-8 h-8 rounded-xl text-[11px]'
    return (
        <div className={`${cls} flex items-center justify-center font-bold flex-shrink-0`} style={{ background: bg, color: fg }}>
            {initials}
        </div>
    )
}

const SelectCheckbox = ({ checked, onChange, indeterminate = false, disabled = false }: { checked: boolean; onChange: () => void; indeterminate?: boolean; disabled?: boolean }) => (
    <div
        role="button" tabIndex={disabled ? -1 : 0}
        onClick={(e) => { e.stopPropagation(); if (!disabled) onChange() }}
        onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onChange() } }}
        className="flex-shrink-0 w-[18px] h-[18px] rounded-[5px] flex items-center justify-center transition-all duration-150 select-none"
        style={{
            background: checked ? '#4f46e5' : indeterminate ? '#c7d2fe' : 'transparent',
            border: checked ? '2px solid #4f46e5' : indeterminate ? '2px solid #4f46e5' : '2px solid #cbd5e1',
            boxShadow: checked ? '0 1px 4px rgba(79,70,229,0.3)' : 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
        }}
    >
        {checked && <CheckIcon />}
        {!checked && indeterminate && <div className="w-2 h-0.5 rounded-full" style={{ background: '#4f46e5' }} />}
    </div>
)

const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
        type="button" role="switch" aria-checked={checked} onClick={onChange}
        className="relative cursor-pointer inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors duration-200"
        style={{ background: checked ? '#ea580c' : '#cbd5e1' }}
    >
        <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200"
            style={{ transform: checked ? 'translateX(18px)' : 'translateX(3px)' }} />
    </button>
)

const DetailRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) => {
    if (!value || value === '—') return null
    return (
        <div className="flex items-start gap-2.5 py-2 border-b last:border-0" style={{ borderColor: '#f1f5f9' }}>
            <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#f1f5f9', color: '#64748b' }}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[9.5px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: '#94a3b8' }}>{label}</p>
                <p className="text-[11.5px] font-medium break-words" style={{ color: '#334155' }}>{value}</p>
            </div>
        </div>
    )
}

const CustomerDetailDrawer = ({ customer, onClose }: { customer: any; onClose: () => void }) => {
    const colors: [string, string][] = [
        ['#e0e7ff', '#4338ca'], ['#fce7f3', '#db2777'], ['#d1fae5', '#059669'],
        ['#fff7ed', '#c2410c'], ['#fef3c7', '#d97706'], ['#ede9fe', '#7c3aed'],
    ]
    const idx = (customer.Name?.charCodeAt(0) ?? 0) % colors.length
    const [heroBg] = colors[idx]

    const tags = [
        { label: customer.Campaign, bg: '#eef2ff', color: '#4338ca', border: '#c7d2fe' },
        { label: customer.Type, bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
        { label: customer.SubType, bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff' },
        { label: customer.City, bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
    ].filter(t => t.label)

    const extraFields = customer.CustomerFields ? Object.entries(customer.CustomerFields).filter(([, v]) => v && String(v).trim()) : []

    return (
        <>
            <div className="absolute cursor-pointer inset-0 z-20" style={{ background: 'rgba(15,23,42,0.25)', backdropFilter: 'blur(2px)' }} onClick={onClose} />
            <div className="absolute right-0 top-0 bottom-0 z-30 flex flex-col overflow-hidden"
                style={{ width: '320px', background: '#ffffff', borderLeft: '1px solid #e2e8f0', boxShadow: '-8px 0 32px rgba(0,0,0,0.08)', animation: 'ec-drawer-in 0.22s cubic-bezier(0.4,0,0.2,1)' }}>
                <div className="flex-shrink-0 px-5 pt-5 pb-4 relative" style={{ background: `linear-gradient(135deg, ${heroBg} 0%, #ffffff 100%)` }}>
                    <button onClick={onClose} className="absolute cursor-pointer top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center transition-all" style={{ background: 'rgba(0,0,0,0.06)', color: '#64748b' }}>
                        <CloseIcon />
                    </button>
                    <div className="flex items-center gap-3 mb-3">
                        <Avatar name={customer.Name} size="lg" />
                        <div className="flex-1 min-w-0 pr-8">
                            <p className="text-[14px] font-bold leading-tight truncate" style={{ color: '#0f172a' }}>{customer.Name || '—'}</p>
                            {customer.CustomerId && <p className="text-[10px] font-mono mt-0.5" style={{ color: '#94a3b8' }}>ID: {customer.CustomerId}</p>}
                        </div>
                    </div>
                    {tags.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {tags.map((t, i) => (
                                <span key={i} className="text-[9.5px] font-semibold px-2 py-0.5 rounded-lg border" style={{ background: t.bg, color: t.color, borderColor: t.border }}>
                                    {t.label}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <div className="h-px flex-shrink-0" style={{ background: '#e2e8f0' }} />
                <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
                    <p className="text-[9.5px] font-bold uppercase tracking-widest mb-2" style={{ color: '#cbd5e1' }}>Contact</p>
                    <div className="mb-4">
                        <DetailRow icon={<PhoneIcon />} label="Phone" value={customer.ContactNumber} />
                        <DetailRow icon={<MailIcon />} label="Email" value={customer.Email} />
                        <DetailRow icon={<MapPinIcon />} label="City" value={customer.City} />
                        <DetailRow icon={<MapPinIcon />} label="Location" value={customer.Location} />
                        <DetailRow icon={<MapPinIcon />} label="Address" value={customer.Adderess} />
                        <DetailRow icon={<MapPinIcon />} label="Area" value={customer.Area} />
                        <DetailRow icon={<MapPinIcon />} label="Sub-Location" value={customer.SubLocation} />
                    </div>
                    <p className="text-[9.5px] font-bold uppercase tracking-widest mb-2" style={{ color: '#cbd5e1' }}>Details</p>
                    <div className="mb-4">
                        <DetailRow icon={<TagIcon />} label="Campaign" value={customer.Campaign} />
                        <DetailRow icon={<TagIcon />} label="Type" value={customer.Type} />
                        <DetailRow icon={<TagIcon />} label="Sub-Type" value={customer.SubType} />
                        <DetailRow icon={<CalendarIcon />} label="Date" value={customer.Date} />
                        <DetailRow icon={<CalendarIcon />} label="Year" value={customer.CustomerYear} />
                        <DetailRow icon={<TagIcon />} label="Price" value={customer.Price} />
                        <DetailRow icon={<TagIcon />} label="Facilities" value={customer.Facillities} />
                        <DetailRow icon={<TagIcon />} label="Reference ID" value={customer.ReferenceId} />
                    </div>
                    {customer.Description && (
                        <>
                            <p className="text-[9.5px] font-bold uppercase tracking-widest mb-2" style={{ color: '#cbd5e1' }}>Description</p>
                            <div className="mb-4 px-3 py-2.5 rounded-xl border" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                                <p className="text-[11.5px] leading-relaxed" style={{ color: '#475569' }}>{customer.Description}</p>
                            </div>
                        </>
                    )}
                    {(customer.URL || customer.GoogleMap || customer.Video) && (
                        <>
                            <p className="text-[9.5px] font-bold uppercase tracking-widest mb-2" style={{ color: '#cbd5e1' }}>Links</p>
                            <div className="flex flex-col gap-1.5 mb-4">
                                {customer.URL && (
                                    <a href={customer.URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-medium" style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#4f46e5' }}>
                                        <LinkIcon /> Website
                                    </a>
                                )}
                                {customer.GoogleMap && (
                                    <a href={customer.GoogleMap} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-medium" style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#059669' }}>
                                        <MapPinIcon /> Google Maps
                                    </a>
                                )}
                                {customer.Video && (
                                    <a href={customer.Video} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-medium" style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#dc2626' }}>
                                        <LinkIcon /> Video
                                    </a>
                                )}
                            </div>
                        </>
                    )}
                    {customer.AssignTo?.length > 0 && (
                        <>
                            <p className="text-[9.5px] font-bold uppercase tracking-widest mb-2" style={{ color: '#cbd5e1' }}>Assigned To</p>
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {customer.AssignTo.map((a: any, i: number) => (
                                    <span key={i} className="text-[10.5px] font-medium px-2.5 py-1 rounded-lg border" style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#475569' }}>
                                        {typeof a === 'string' ? a : (a.name || a.Name || JSON.stringify(a))}
                                    </span>
                                ))}
                            </div>
                        </>
                    )}
                    {extraFields.length > 0 && (
                        <>
                            <p className="text-[9.5px] font-bold uppercase tracking-widest mb-2" style={{ color: '#cbd5e1' }}>Additional Fields</p>
                            <div className="rounded-xl border overflow-hidden mb-4" style={{ borderColor: '#e2e8f0' }}>
                                {extraFields.map(([key, val], i) => (
                                    <div key={i} className="flex items-start gap-2 px-3 py-2 border-b last:border-0" style={{ borderColor: '#f1f5f9', background: i % 2 === 0 ? '#f8fafc' : '#ffffff' }}>
                                        <p className="text-[10px] font-semibold flex-shrink-0 w-24 truncate capitalize" style={{ color: '#64748b' }}>{String(key).replace(/_/g, ' ')}</p>
                                        <p className="text-[10.5px] flex-1 break-words" style={{ color: '#334155' }}>{String(val)}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

const CustomerRow = ({ c, isSelected, onToggle, onView, disabled }: { c: any; isSelected: boolean; onToggle: (id: string) => void; onView: (c: any) => void; disabled: boolean }) => (
    <div
        onClick={() => !disabled && onToggle(c._id)}
        className="w-full text-left px-4 py-3 transition-all duration-150 border-b group"
        style={{ borderColor: '#f1f5f9', background: isSelected ? 'rgba(79,70,229,0.05)' : 'transparent', borderLeft: isSelected ? '2px solid #4f46e5' : '2px solid transparent', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.55 : 1 }}
    >
        <div className="flex items-start gap-2.5">
            <div className="mt-1">
                <SelectCheckbox checked={isSelected} onChange={() => onToggle(c._id)} disabled={disabled} />
            </div>
            <Avatar name={c.Name} />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <p className="text-[12px] font-semibold truncate" style={{ color: isSelected ? '#4338ca' : '#1e293b' }}>{c.Name || '—'}</p>
                    {!c.Email && (
                        <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0" style={{ background: '#fef2f2', color: '#b91c1c' }}>no email</span>
                    )}
                </div>
                <p className="text-[10.5px] truncate mt-0.5" style={{ color: '#94a3b8' }}>{c.Email || c.ContactNumber || '—'}</p>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {c.Campaign && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md" style={{ background: '#eef2ff', color: '#4338ca' }}>{c.Campaign}</span>}
                    {c.Type && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md" style={{ background: '#fff7ed', color: '#c2410c' }}>{c.Type}</span>}
                    {c.City && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md" style={{ background: '#f0fdf4', color: '#166534' }}>{c.City}</span>}
                </div>
            </div>
            <button
                onClick={e => { e.stopPropagation(); onView(c) }}
                className="flex-shrink-0 cursor-pointer flex items-center justify-center w-6 h-6 rounded-lg border opacity-0 group-hover:opacity-100 transition-all duration-150"
                style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#94a3b8' }}
                title="View details"
            >
                <EyeIcon />
            </button>
        </div>
    </div>
)

const ResultRow = ({ r, customerLookup, onView }: { r: any; customerLookup: (id: string) => any; onView: (c: any) => void }) => {
    const [showSummary, setShowSummary] = useState(false)
    const cfg = getResultStatusCfg(r.status)
    const full = customerLookup(r.id)
    const displayName = full?.Name || r.name || r.email || 'Unknown'
    const hasSummary = !!r.workSummary && r.workSummary.trim().length > 0
    useEffect(() => { if (hasSummary) setShowSummary(true) }, [r])
    return (
        <div className="rounded-xl border overflow-hidden" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
            <div className="flex items-center gap-2.5 px-3 py-2">
                <Avatar name={displayName} size="sm" />
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold truncate" style={{ color: '#1e293b' }}>{displayName}</p>
                    <p className="text-[9.5px] truncate" style={{ color: '#94a3b8' }}>
                        {r.email || full?.Email || '—'}
                        {r.status === 'failed' && r.error ? <span style={{ color: '#dc2626' }}> · {r.error}</span> : null}
                    </p>
                </div>
                <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-md border flex items-center gap-1 flex-shrink-0" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
                    <span className="w-1 h-1 rounded-full inline-block" style={{ background: cfg.dot }} />
                    {cfg.label}
                </span>
                {hasSummary && (
                    <button
                        onClick={() => setShowSummary(v => !v)}
                        className="flex-shrink-0 cursor-pointer flex items-center gap-1 px-2 py-1 rounded-lg border text-[9.5px] font-semibold transition-all"
                        style={showSummary ? { background: '#eef2ff', borderColor: '#c7d2fe', color: '#4338ca' } : { background: '#ffffff', borderColor: '#e2e8f0', color: '#94a3b8' }}
                    >
                        <SparkleIcon /> Why this email
                    </button>
                )}
                <button
                    onClick={() => onView(full || { Name: displayName, Email: r.email, CustomerId: r.id })}
                    className="flex-shrink-0 cursor-pointer flex items-center justify-center w-6 h-6 rounded-lg border"
                    style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#94a3b8' }}
                >
                    <EyeIcon />
                </button>
            </div>
            {hasSummary && showSummary && (
                <div className="px-3 pb-3 pt-0.5">
                    <div className="rounded-lg border px-3 py-2.5" style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
                        <p className="text-[9px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1" style={{ color: '#94a3b8' }}>
                            <SparkleIcon /> AI strategy for this customer
                        </p>
                        <p className="text-[10.5px] leading-relaxed whitespace-pre-line" style={{ color: '#475569' }}>{r.workSummary}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

const RunCard = ({ run, expanded, onToggleExpand, visibleCount, onLoadMore, customerLookup, onView }: { run: any; expanded: boolean; onToggleExpand: () => void; visibleCount: number; onLoadMore: () => void; customerLookup: (id: string) => any; onView: (c: any) => void }) => {
    const headerTone = run.sentCount > 0 ? { bg: '#f0fdf4', color: '#166534' } : { bg: '#fef2f2', color: '#b91c1c' }
    const results = run.results || []
    const slice = results.slice(0, visibleCount)
    const hasMore = visibleCount < results.length

    return (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#e2e8f0', background: '#ffffff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', animation: 'ec-run-in 0.2s ease' }}>
            <div className="px-4 pt-3.5 pb-3">
                <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: headerTone.bg, color: headerTone.color }}>
                        <EnvelopeIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[11.5px] font-semibold" style={{ color: '#0f172a' }}>{run.mode === 'ai' ? 'AI-generated campaign' : 'Manual template campaign'}</p>
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md" style={{ background: '#f1f5f9', color: '#64748b' }}>{run.language}</span>
                            {run.templateName && (
                                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md" style={{ background: '#f0fdfa', color: '#0f766e' }}>{run.templateName}</span>
                            )}
                            <span className="text-[9.5px]" style={{ color: '#cbd5e1' }}>{run.timestamp?.toLocaleString?.(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {run.promptEcho && <p className="text-[11px] italic mt-1 line-clamp-2" style={{ color: '#64748b' }}>"{run.promptEcho}"</p>}
                    </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap mt-3">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border" style={{ background: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0' }}>{run.sentCount} sent</span>
                    {run.failedCount > 0 && <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border" style={{ background: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca' }}>{run.failedCount} failed</span>}
                    {run.skippedCount > 0 && <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border" style={{ background: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' }}>{run.skippedCount} skipped</span>}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg" style={{ color: '#cbd5e1' }}>/ {run.targetCount} targeted</span>
                    {results.length > 0 && (
                        <button onClick={onToggleExpand} className="ml-auto cursor-pointer flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg" style={{ color: '#4f46e5' }}>
                            {expanded ? 'Hide details' : 'View details'} <ChevronIcon open={expanded} />
                        </button>
                    )}
                </div>
            </div>
            {expanded && results.length > 0 && (
                <div className="px-4 pb-4 flex flex-col gap-1.5 border-t pt-3" style={{ borderColor: '#f1f5f9' }}>
                    {slice.map((r: any, i: number) => <ResultRow key={r.id || r.email || i} r={r} customerLookup={customerLookup} onView={onView} />)}
                    {hasMore && (
                        <button onClick={onLoadMore} className="w-full py-2 cursor-pointer text-[11px] font-medium rounded-xl border border-dashed transition-colors" style={{ borderColor: '#e2e8f0', color: '#94a3b8', background: 'transparent' }}>
                            Load {Math.min(RESULT_PAGE_SIZE, results.length - visibleCount)} more <span style={{ color: '#cbd5e1' }}> ({results.length - visibleCount} remaining)</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

const ConfirmSendModal = ({ open, targetCount, mode, language, promptEcho, subject, templateName, isSending, error, onCancel, onConfirm }: { open: boolean; targetCount: number; mode: 'ai' | 'manual'; language: string; promptEcho: string; subject: string; templateName?: string | null; isSending: boolean; error: string | null; onCancel: () => void; onConfirm: () => void }) => {
    if (!open) return null
    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center px-6" style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)' }}>
            <div className="w-full max-w-[400px] rounded-2xl overflow-hidden relative" style={{ background: '#ffffff', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', animation: 'ec-modal-in 0.18s cubic-bezier(0.34,1.56,0.64,1)' }}>
                <StampMark className="absolute -top-3 -right-3 w-20 h-20 opacity-[0.35] pointer-events-none" color="#fed7aa" />
                <div className="px-5 pt-5 pb-4 relative">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: '#fff7ed', color: '#ea580c' }}><AlertIcon /></div>
                    <p className="text-[14px] font-bold" style={{ color: '#0f172a' }}>Send this campaign?</p>
                    <p className="text-[11.5px] mt-1.5 leading-relaxed" style={{ color: '#64748b' }}>
                        This sends <b style={{ color: '#0f172a' }}>{targetCount}</b> email{targetCount !== 1 ? 's' : ''} right now — one to each targeted customer. This can't be undone.
                    </p>

                    <div className="mt-3 px-3 py-2.5 rounded-xl border" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                        <p className="text-[9.5px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{mode === 'ai' ? `AI draft · ${language}` : 'Manual template'}</p>
                        <p className="text-[11px] mt-1 leading-relaxed line-clamp-3" style={{ color: '#334155' }}>{mode === 'ai' ? `"${promptEcho}"` : subject}</p>
                        {mode === 'ai' && <p className="text-[10px] mt-1.5" style={{ color: '#94a3b8' }}>Each customer gets a uniquely written email based on this brief and their own data.</p>}
                        {templateName && <p className="text-[10px] mt-1.5 flex items-center gap-1" style={{ color: '#0f766e' }}><SparkleIcon /> Using "{templateName}" as the base layout</p>}
                    </div>

                    {error && <p className="text-[11px] mt-3 px-3 py-2 rounded-lg" style={{ background: '#fef2f2', color: '#b91c1c' }}>{error}</p>}
                </div>
                <div className="flex items-center gap-2 px-5 py-3.5 border-t" style={{ borderColor: '#f1f5f9', background: '#f8fafc' }}>
                    <button onClick={onCancel} disabled={isSending} className="flex-1 cursor-pointer py-2.5 rounded-xl text-[12px] font-semibold transition-all disabled:opacity-50" style={{ background: '#ffffff', color: '#64748b', border: '1px solid #e2e8f0' }}>Cancel</button>
                    <button onClick={onConfirm} disabled={isSending} className="flex-1 cursor-pointer py-2.5 rounded-xl text-[12px] font-bold transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-1.5" style={{ background: '#ea580c', color: '#ffffff', boxShadow: '0 3px 10px rgba(234,88,12,0.35)' }}>
                        {isSending ? <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent" style={{ animation: 'ec-spin 0.8s linear infinite' }} /> : <EnvelopeIcon className="w-3.5 h-3.5" />}
                        {isSending ? 'Sending…' : 'Confirm & Send'}
                    </button>
                </div>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────── */
const EmailCampaignAgentWorkspace = ({ isOpen }: { isOpen: boolean }) => {
    const [customers, setCustomers] = useState<any[]>([])
    const [isCustomersLoading, setIsCustomersLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchField, setSearchField] = useState<'All' | 'Name' | 'Email' | 'Campaign' | 'Type' | 'Phone'>('All')
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [sendToAll, setSendToAll] = useState(false)

    const [composerTab, setComposerTab] = useState<'ai' | 'manual'>('ai')
    const [userPrompt, setUserPrompt] = useState('')
    const [language, setLanguage] = useState('english')
    const [subject, setSubject] = useState('')
    const [body, setBody] = useState('')

    // Template selection — shared across both AI and Manual composer modes.
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
    const [isPreviewMode, setIsPreviewMode] = useState(false)
    const [isPickerOpen, setIsPickerOpen] = useState(false)

    const [isSending, setIsSending] = useState(false)
    const [sendError, setSendError] = useState<string | null>(null)
    const [showConfirm, setShowConfirm] = useState(false)

    const [runs, setRuns] = useState<any[]>([])
    const [runExpandedMap, setRunExpandedMap] = useState<Record<string, boolean>>({})
    const [runVisibleMap, setRunVisibleMap] = useState<Record<string, number>>({})

    const [viewingCustomer, setViewingCustomer] = useState<any | null>(null)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const selectedTemplate = useMemo(() => getEmailTemplateById(selectedTemplateId), [selectedTemplateId])

    const mapCustomer = (item: any) => {
        const date = new Date(item.createdAt)
        const formattedDate = date.getDate().toString().padStart(2, '0') + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getFullYear()
        return {
            _id: item._id, Campaign: item.Campaign, Type: item.CustomerType, SubType: item.CustomerSubType,
            Name: item.customerName, Description: item.Description, Email: item.Email, City: item.City,
            Location: item.Location, Adderess: item.Adderess, Area: item.Area, SubLocation: item.SubLocation,
            CustomerId: item.CustomerId, ClientId: item.ClientId, CustomerYear: item.CustomerYear,
            Facillities: item.Facillities, ContactNumber: item.ContactNumber?.slice(0, 10), ReferenceId: item.ReferenceId,
            AssignTo: item.AssignTo ?? [], Date: item.CustomerDate === 'N/A' ? 'N/A' : item.CustomerDate ? formatDateDMY(item.CustomerDate) : formattedDate,
            URL: item.URL || '', Video: item.Video || '', GoogleMap: item.GoogleMap || '', Price: item.Price || '', CustomerFields: item.CustomerFields || {},
        }
    }

    const fetchCustomers = async () => {
        setIsCustomersLoading(true)
        try {
            const res: any = await getCustomer()
            if (res) setCustomers(res.map(mapCustomer))
        } catch (err) { console.error(err) } finally { setIsCustomersLoading(false) }
    }

    useEffect(() => { fetchCustomers() }, [])
    useEffect(() => { setVisibleCount(PAGE_SIZE) }, [searchQuery])
    useEffect(() => {
        if (!toast) return
        const t = setTimeout(() => setToast(null), 3500)
        return () => clearTimeout(t)
    }, [toast])
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return
            if (isPickerOpen) setIsPickerOpen(false)
            else if (viewingCustomer) setViewingCustomer(null)
            else if (showConfirm && !isSending) setShowConfirm(false)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [viewingCustomer, showConfirm, isSending, isPickerOpen])

    const SEARCH_FIELDS = ['All', 'Name', 'Email', 'Campaign', 'Type', 'Phone'] as const

    const filteredCustomers = useMemo(() => {
        if (!searchQuery.trim()) return customers
        const q = searchQuery.toLowerCase()
        return customers.filter((c: any) => {
            if (searchField === 'All') {
                return (c.Name?.toLowerCase().includes(q) || c.Email?.toLowerCase().includes(q) || c.Campaign?.toLowerCase().includes(q) || c.Type?.toLowerCase().includes(q) || c.ContactNumber?.includes(q))
            }
            const fieldMap: Record<string, string> = { Name: c.Name, Email: c.Email, Campaign: c.Campaign, Type: c.Type, Phone: c.ContactNumber }
            return fieldMap[searchField]?.toLowerCase().includes(q)
        })
    }, [customers, searchQuery, searchField])

    const visibleCustomers = filteredCustomers.slice(0, visibleCount)
    const hasMore = visibleCount < filteredCustomers.length
    const remaining = filteredCustomers.length - visibleCount

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const allFilteredSelected = filteredCustomers.length > 0 && filteredCustomers.every((c: any) => selectedIds.has(c._id))
    const someFilteredSelected = filteredCustomers.some((c: any) => selectedIds.has(c._id)) && !allFilteredSelected

    const toggleSelectAllFiltered = () => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (allFilteredSelected) filteredCustomers.forEach((c: any) => next.delete(c._id))
            else filteredCustomers.forEach((c: any) => next.add(c._id))
            return next
        })
    }

    const customerLookup = (id: string) => customers.find((c: any) => c._id === id)

    const hasTargets = sendToAll || selectedIds.size > 0
    const hasContent = composerTab === 'ai' ? userPrompt.trim().length > 0 : (subject.trim().length > 0 && body.trim().length > 0)
    const canSend = hasTargets && hasContent && !isSending
    const targetCount = sendToAll ? customers.length : selectedIds.size

    const insertToken = (field: 'subject' | 'body', token: string) => {
        if (field === 'subject') setSubject(s => (s ? s + ' ' : '') + token)
        else setBody(b => (b ? b + ' ' : '') + token)
    }

    // Selecting a template from the picker: always records the selection so
    // both composer tabs can reference it. Only the Manual tab's body/preview
    // gets auto-filled, since the AI tab keeps writing its own copy — it just
    // uses the template as a visual base.
    const handleSelectTemplate = (id: string | null) => {
        setSelectedTemplateId(id)
        if (id && composerTab === 'manual') {
            const t = getEmailTemplateById(id)
            if (t) { setBody(t.html); setIsPreviewMode(true) }
        }
    }

    const handleSend = async () => {
        if (isSending) return
        setSendError(null)
        setIsSending(true)
        try {
            const payload: any = { customerIds: sendToAll ? [] : Array.from(selectedIds), sendToAll, mode: language }
            if (composerTab === 'ai') {
                payload.userPrompt = userPrompt.trim()
                if (selectedTemplate) payload.templateHtml = selectedTemplate.html
            } else {
                payload.Subject = subject.trim()
                payload.Body = body.trim()
            }

            const res: any = await emailCustomerViaAi(payload)
            if (!res || res.success === false) {
                setSendError('Something went wrong while sending the campaign. Please try again.')
                setIsSending(false)
                return
            }

            const results = res.results || []
            const sentCount = typeof res.sent === 'number' ? res.sent : results.filter((r: any) => r.status === 'sent').length
            const failedCount = results.filter((r: any) => r.status === 'failed').length
            const skippedCount = results.length - sentCount - failedCount

            const runId = `run_${Date.now()}`
            const run = {
                id: runId, mode: composerTab, language,
                promptEcho: composerTab === 'ai' ? userPrompt.trim() : subject.trim(),
                templateName: selectedTemplate?.name || null,
                targetCount, sentCount, failedCount, skippedCount: Math.max(0, skippedCount),
                results, timestamp: new Date(),
            }
            setRuns(prev => [run, ...prev])
            setRunExpandedMap(prev => ({ ...prev, [runId]: results.length > 0 && results.length <= 5 }))
            setRunVisibleMap(prev => ({ ...prev, [runId]: RESULT_PAGE_SIZE }))
            setToast({ type: 'success', text: `Campaign sent — ${sentCount} delivered${failedCount ? `, ${failedCount} failed` : ''}.` })

            setUserPrompt('')
            setSubject('')
            setBody('')
            setSelectedTemplateId(null)
            setShowConfirm(false)
        } catch (err: any) {
            console.error(err)
            setSendError('Something went wrong while sending the campaign. Please try again.')
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="flex h-full overflow-hidden rounded-xl relative" style={{ background: '#f8fafc' }}>

            {/* ══ LEFT PANEL — customer targeting ══ */}
            <div className="flex flex-col border-r" style={{ width: '288px', minWidth: '288px', borderColor: '#e2e8f0', background: '#ffffff' }}>
                <div className="px-4 pt-4 pb-3 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(79,70,229,0.1)', color: '#4f46e5' }}>
                            <UserIcon />
                        </div>
                        <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: '#64748b' }}>Customers</span>
                        <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-md" style={{ background: '#f1f5f9', color: '#94a3b8' }}>
                            {filteredCustomers.length}
                        </span>
                    </div>
                    <div className="relative mb-2">
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }}><SearchIcon /></div>
                        <input
                            type="text" placeholder="Search customers…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-7 py-2 rounded-xl text-[11.5px] outline-none border transition-all duration-150 bg-stone-50 border-slate-200 text-slate-700 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 focus:bg-white"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute cursor-pointer right-2.5 top-1/2 -translate-y-1/2" style={{ color: '#cbd5e1' }}>
                                <ClearIcon />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-1 flex-wrap mb-3">
                        {SEARCH_FIELDS.map(f => (
                            <button key={f} onClick={() => setSearchField(f as any)}
                                className="text-[9.5px] cursor-pointer font-semibold px-2 py-0.5 rounded-full transition-all duration-150"
                                style={searchField === f ? { background: '#4f46e5', color: '#ffffff' } : { background: '#f1f5f9', color: '#94a3b8' }}>
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 py-1.5">
                        <SelectCheckbox checked={allFilteredSelected} indeterminate={someFilteredSelected} onChange={toggleSelectAllFiltered} disabled={sendToAll || filteredCustomers.length === 0} />
                        <button onClick={toggleSelectAllFiltered} disabled={sendToAll || filteredCustomers.length === 0} className="text-[10.5px] cursor-pointer font-semibold" style={{ color: sendToAll ? '#cbd5e1' : '#475569' }}>
                            {allFilteredSelected ? 'Deselect all' : 'Select all'}
                        </button>
                        {selectedIds.size > 0 && !sendToAll && (
                            <span className="ml-auto text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md" style={{ background: '#eef2ff', color: '#4338ca' }}>
                                {selectedIds.size} selected
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2.5 mt-1.5 px-3 py-2.5 rounded-xl border" style={{ background: sendToAll ? '#fff7ed' : '#f8fafc', borderColor: sendToAll ? '#fed7aa' : '#e2e8f0' }}>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold" style={{ color: sendToAll ? '#c2410c' : '#334155' }}>Send to everyone</p>
                            <p className="text-[9.5px] mt-0.5" style={{ color: '#94a3b8' }}>Ignores selection, targets all {customers.length} customers</p>
                        </div>
                        <ToggleSwitch checked={sendToAll} onChange={() => setSendToAll(v => !v)} />
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
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background: '#f1f5f9', color: '#cbd5e1' }}><SearchIcon /></div>
                            <p className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>No customers found</p>
                        </div>
                    ) : visibleCustomers.map((c: any) => (
                        <CustomerRow key={c._id} c={c} isSelected={selectedIds.has(c._id)} onToggle={toggleSelect} onView={setViewingCustomer} disabled={sendToAll} />
                    ))}

                    {hasMore && (
                        <button onClick={() => setVisibleCount(v => v + PAGE_SIZE)} className="w-full py-3 cursor-pointer text-[11.5px] font-medium border-t transition-colors" style={{ borderColor: '#f1f5f9', color: '#94a3b8', background: 'transparent' }}>
                            Load {Math.min(PAGE_SIZE, remaining)} more <span style={{ color: '#cbd5e1' }}> ({remaining} remaining)</span>
                        </button>
                    )}
                </div>
            </div>

            {/* ══ RIGHT PANEL — compose + activity log ══ */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                <div className="flex-shrink-0 px-5 py-3 border-b flex items-center gap-3" style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(79,70,229,0.1)', color: '#4f46e5' }}><EnvelopeIcon className="w-4 h-4" /></div>
                    <div className="min-w-0">
                        <p className="text-[13px] font-semibold" style={{ color: '#1e293b' }}>Email Campaign Agent</p>
                        <p className="text-[10.5px]" style={{ color: '#94a3b8' }}>Drafts and sends a personalized email to every targeted customer</p>
                    </div>
                    {runs.length > 0 && (
                        <span className="ml-auto text-[10px] font-mono font-semibold px-2 py-1 rounded-lg flex-shrink-0" style={{ background: '#f1f5f9', color: '#64748b' }}>
                            {runs.length} campaign{runs.length !== 1 ? 's' : ''} sent
                        </span>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>

                    {/* composer */}
                    <div className="flex-shrink-0 rounded-2xl border overflow-hidden relative" style={{ borderColor: '#e2e8f0', background: '#ffffff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                        <StampMark className="absolute -top-4 -right-4 w-24 h-24 opacity-[0.5] pointer-events-none" color="#e0e7ff" />

                        <div className="px-4 pt-3.5 pb-1 relative">
                            <div className="flex items-center gap-1 p-0.5 rounded-xl w-fit" style={{ background: '#f1f5f9' }}>
                                <button onClick={() => setComposerTab('ai')}
                                    className="flex items-center cursor-pointer gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all"
                                    style={composerTab === 'ai' ? { background: '#4f46e5', color: '#ffffff', boxShadow: '0 2px 6px rgba(79,70,229,0.35)' } : { color: '#64748b' }}>
                                    <SparkleIcon /> AI Generate
                                </button>
                                <button onClick={() => setComposerTab('manual')}
                                    className="flex items-center cursor-pointer gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all"
                                    style={composerTab === 'manual' ? { background: '#4f46e5', color: '#ffffff', boxShadow: '0 2px 6px rgba(79,70,229,0.35)' } : { color: '#64748b' }}>
                                    <EditIcon /> Manual
                                </button>
                            </div>
                        </div>

                        {composerTab === 'ai' ? (
                            <div className="px-4 pt-3 pb-4 relative">
                                <p className="text-[10.5px] font-semibold mb-1.5" style={{ color: '#334155' }}>What's this campaign about?</p>
                                <textarea
                                    value={userPrompt} onChange={e => setUserPrompt(e.target.value)} disabled={isSending} rows={4}
                                    placeholder="e.g. Reach out about a limited-time price drop on properties they showed interest in…"
                                    className="w-full resize-none rounded-xl px-3 py-2.5 text-[12px] leading-relaxed outline-none border transition-all duration-150 bg-stone-50 border-slate-200 text-slate-700 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 focus:bg-white disabled:opacity-50"
                                />
                                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                                    {AI_PROMPT_HINTS.map(h => (
                                        <button key={h.label} onClick={() => setUserPrompt(h.prompt)} className="text-[9.5px] cursor-pointer font-medium px-2 py-1 rounded-lg border transition-all" style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b' }}>
                                            {h.label}
                                        </button>
                                    ))}
                                </div>

                                <p className="text-[10.5px] font-semibold mb-1.5 mt-3.5 flex items-center gap-1.5" style={{ color: '#334155' }}><GlobeIcon /> Tone &amp; language</p>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {LANGUAGE_OPTIONS.map(l => (
                                        <button key={l.value} onClick={() => setLanguage(l.value)} className="text-[10.5px] cursor-pointer font-semibold px-2.5 py-1 rounded-lg border transition-all" style={language === l.value ? { background: '#eef2ff', color: '#4338ca', borderColor: '#c7d2fe' } : { background: '#ffffff', color: '#94a3b8', borderColor: '#e2e8f0' }}>
                                            {l.label}
                                        </button>
                                    ))}
                                </div>

                                <p className="text-[10.5px] font-semibold mb-1.5 mt-3.5 flex items-center gap-1.5" style={{ color: '#334155' }}>
                                    <EnvelopeIcon className="w-3 h-3" /> Starting template
                                    <span className="text-[9px] font-normal" style={{ color: '#cbd5e1' }}>(optional — AI adapts the layout per customer)</span>
                                </p>
                                {selectedTemplate ? (
                                    <SelectedTemplateChip template={selectedTemplate} onChange={() => setIsPickerOpen(true)} onClear={() => setSelectedTemplateId(null)} />
                                ) : (
                                    <ChooseTemplateButton label="Choose a template as a base" onClick={() => setIsPickerOpen(true)} />
                                )}
                            </div>
                        ) : (
                            <div className="px-4 pt-3 pb-4 relative">

                                <p className="text-[10.5px] font-semibold mb-1.5" style={{ color: '#334155' }}>Template</p>
                                <div className="mb-3">
                                    {selectedTemplate ? (
                                        <SelectedTemplateChip template={selectedTemplate} onChange={() => setIsPickerOpen(true)} />
                                    ) : (
                                        <ChooseTemplateButton label="Choose a template" onClick={() => setIsPickerOpen(true)} />
                                    )}
                                </div>

                                <p className="text-[10.5px] font-semibold mb-1.5" style={{ color: '#334155' }}>Subject</p>
                                <input
                                    value={subject} onChange={e => setSubject(e.target.value)} disabled={isSending}
                                    placeholder="Quick update on your shortlisted property"
                                    className="w-full rounded-xl px-3 py-2 text-[12px] outline-none border transition-all duration-150 bg-stone-50 border-slate-200 text-slate-700 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 focus:bg-white disabled:opacity-50"
                                />
                                <div className="flex items-center gap-1.5 flex-wrap mt-1.5 mb-3">
                                    {TOKEN_HINTS.map(t => (
                                        <button key={t} onClick={() => insertToken('subject', t)} className="text-[9px] cursor-pointer font-mono font-medium px-1.5 py-0.5 rounded-md border" style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#94a3b8' }}>
                                            {t}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between mb-1.5">
                                    <p className="text-[10.5px] font-semibold" style={{ color: '#334155' }}>Body</p>
                                    <button
                                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                                        className="flex items-center cursor-pointer gap-1.5 text-[9.5px] font-semibold px-2 py-1 rounded-lg transition-all"
                                        style={{
                                            background: isPreviewMode ? '#4f46e5' : '#f1f5f9',
                                            color: isPreviewMode ? '#ffffff' : '#64748b'
                                        }}
                                    >
                                        <EyeIcon /> {isPreviewMode ? 'Edit HTML' : 'Live Preview'}
                                    </button>
                                </div>

                                {isPreviewMode ? (
                                    <div className="w-full h-[340px] rounded-xl border overflow-hidden bg-white mb-2 shadow-inner" style={{ borderColor: '#e2e8f0' }}>
                                        <iframe
                                            srcDoc={body || '<div style="font-family:sans-serif;padding:20px;color:#94a3b8;text-align:center;">Select a template or edit HTML to see preview</div>'}
                                            className="w-full h-full border-none"
                                            title="Email Preview"
                                        />
                                    </div>
                                ) : (
                                    <textarea
                                        value={body}
                                        onChange={e => {
                                            setBody(e.target.value);
                                            setSelectedTemplateId(null); // manual edits detach from the picked template
                                        }}
                                        disabled={isSending} rows={10}
                                        placeholder="<p>Hi {{Name}},</p><p>Wanted to flag…</p>"
                                        className="w-full resize-y rounded-xl px-3 py-2.5 text-[11.5px] font-mono leading-relaxed outline-none border transition-all duration-150 bg-stone-50 border-slate-200 text-slate-700 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 focus:bg-white disabled:opacity-50"
                                    />
                                )}

                                {!isPreviewMode && (
                                    <>
                                        <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                                            {TOKEN_HINTS.map(t => (
                                                <button key={t} onClick={() => insertToken('body', t)} className="text-[9px] cursor-pointer font-mono font-medium px-1.5 py-0.5 rounded-md border" style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#94a3b8' }}>
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[9.5px] mt-2" style={{ color: '#cbd5e1' }}>
                                            Supports full HTML (&lt;table&gt;, &lt;b&gt;, &lt;a&gt;…). Tokens are swapped for each customer's real details before sending.
                                        </p>
                                    </>
                                )}
                            </div>
                        )}

                        {sendError && (
                            <div className="mx-4 mb-3 px-3 py-2 rounded-lg text-[11px]" style={{ background: '#fef2f2', color: '#b91c1c' }}>{sendError}</div>
                        )}

                        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t" style={{ borderColor: '#f1f5f9', background: '#f8fafc' }}>
                            <p className="text-[11px] font-medium truncate" style={{ color: hasTargets ? '#334155' : '#94a3b8' }}>
                                {sendToAll ? `Targeting all ${customers.length} customers` : selectedIds.size > 0 ? `${selectedIds.size} customer${selectedIds.size !== 1 ? 's' : ''} selected` : 'Select customers from the list, or send to everyone'}
                            </p>
                            <button onClick={() => canSend && setShowConfirm(true)} disabled={!canSend} className="flex-shrink-0 cursor-pointer flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: '#ea580c', color: '#ffffff', boxShadow: canSend ? '0 3px 10px rgba(234,88,12,0.35)' : 'none' }}>
                                <EnvelopeIcon className="w-3.5 h-3.5" /> Review &amp; Send
                            </button>
                        </div>
                    </div>

                    {/* activity log */}
                    {runs.length > 0 && <p className="text-[9.5px] font-bold uppercase tracking-widest flex-shrink-0" style={{ color: '#cbd5e1' }}>Campaign Activity</p>}

                    {runs.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'rgba(79,70,229,0.08)', color: '#4f46e5' }}><UsersIcon /></div>
                            <p className="text-[12px] font-semibold mb-1" style={{ color: '#334155' }}>No campaigns sent yet</p>
                            <p className="text-[11px] max-w-[260px]" style={{ color: '#94a3b8' }}>Pick your customers, write the brief above, and hit send — every campaign shows up here.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {runs.map(run => (
                                <RunCard key={run.id} run={run} expanded={!!runExpandedMap[run.id]} onToggleExpand={() => setRunExpandedMap(prev => ({ ...prev, [run.id]: !prev[run.id] }))} visibleCount={runVisibleMap[run.id] ?? RESULT_PAGE_SIZE} onLoadMore={() => setRunVisibleMap(prev => ({ ...prev, [run.id]: (prev[run.id] ?? RESULT_PAGE_SIZE) + RESULT_PAGE_SIZE }))} customerLookup={customerLookup} onView={setViewingCustomer} />
                            ))}
                        </div>
                    )}
                </div>

                {toast && (
                    <div className="absolute top-16 right-5 z-30 flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-[11.5px] font-medium" style={{ background: toast.type === 'success' ? '#f0fdf4' : '#fef2f2', color: toast.type === 'success' ? '#166534' : '#b91c1c', borderColor: toast.type === 'success' ? '#bbf7d0' : '#fecaca', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', animation: 'ec-toast-in 0.2s ease' }}>
                        <EnvelopeIcon className="w-3.5 h-3.5" /> {toast.text}
                    </div>
                )}

                <ConfirmSendModal
                    open={showConfirm} targetCount={targetCount} mode={composerTab} language={language} promptEcho={userPrompt.trim()} subject={subject.trim()} templateName={selectedTemplate?.name || null} isSending={isSending} error={sendError} onCancel={() => !isSending && setShowConfirm(false)} onConfirm={handleSend}
                />
            </div>

            {viewingCustomer && <CustomerDetailDrawer customer={viewingCustomer} onClose={() => setViewingCustomer(null)} />}

            <TemplatePickerModal
                open={isPickerOpen}
                templates={emailTemplates}
                selectedId={selectedTemplateId}
                onSelect={handleSelectTemplate}
                onClose={() => setIsPickerOpen(false)}
            />

            <style>{`
        @keyframes ec-spin { to { transform: rotate(360deg); } }
        @keyframes ec-drawer-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes ec-modal-in { from { transform: scale(0.94); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes ec-toast-in { from { transform: translateY(-8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes ec-run-in { from { transform: translateY(6px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
        </div>
    )
}

export default EmailCampaignAgentWorkspace