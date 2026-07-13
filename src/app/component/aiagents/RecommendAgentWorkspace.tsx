"use client"
import { formatDateDMY } from '@/app/utils/formatDateDMY'
import { getCustomer, getRecommendedCustomers } from '@/store/customer'
import { addToShortlist } from '@/store/customer'
import React, { useEffect, useRef, useState, useMemo } from 'react'

/* ── Status Types & Config ── */
type StatusValue = 'shortlisted' | 'contacted' | 'site_visit' | 'rejected'

const STATUS_CONFIG: Record<StatusValue, {
    label: string; bg: string; color: string; border: string
    activeBg: string; activeColor: string; dot: string
}> = {
    shortlisted: { label: 'Shortlisted', bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd', activeBg: '#0284c7', activeColor: '#fff', dot: '#38bdf8' },
    contacted: { label: 'Contacted', bg: '#f0fdf4', color: '#166534', border: '#bbf7d0', activeBg: '#059669', activeColor: '#fff', dot: '#34d399' },
    site_visit: { label: 'Site Visit', bg: '#faf5ff', color: '#6d28d9', border: '#ddd6fe', activeBg: '#7c3aed', activeColor: '#fff', dot: '#a78bfa' },
    rejected: { label: 'Rejected', bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', activeBg: '#dc2626', activeColor: '#fff', dot: '#f87171' },
}
const STATUS_ENTRIES = Object.entries(STATUS_CONFIG) as [StatusValue, typeof STATUS_CONFIG[StatusValue]][]

const PAGE_SIZE = 20;

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
const UsersIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
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
const ListChecksIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
)

/* ── Checkbox ── */
const SelectCheckbox = ({
    checked, onChange, indeterminate = false
}: { checked: boolean; onChange: () => void; indeterminate?: boolean }) => (
    <div
        role="button"
        tabIndex={0}
        onClick={(e) => { e.stopPropagation(); onChange() }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange() } }}
        className="flex-shrink-0 w-[18px] h-[18px] rounded-[5px] cursor-pointer flex items-center justify-center transition-all duration-150 cursor-pointer select-none"
        style={{
            background: checked ? '#0284c7' : indeterminate ? '#bae6fd' : 'transparent',
            border: checked ? '2px solid #0284c7' : indeterminate ? '2px solid #0284c7' : '2px solid #cbd5e1',
            boxShadow: checked ? '0 1px 4px rgba(2,132,199,0.3)' : 'none',
        }}
        title={checked ? 'Deselect' : 'Select'}
    >
        {checked && <CheckIcon />}
        {!checked && indeterminate && (
            <div className="w-2 h-0.5 rounded-full" style={{ background: '#0284c7' }} />
        )}
    </div>
)

/* ── avatar initials ── */
const Avatar = ({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) => {
    const initials = (name || '?').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    const colors: [string, string][] = [
        ['#e0f2fe', '#0284c7'], ['#fce7f3', '#db2777'], ['#d1fae5', '#059669'],
        ['#ede9fe', '#7c3aed'], ['#fef3c7', '#d97706'], ['#fee2e2', '#dc2626'],
    ]
    const idx = (name?.charCodeAt(0) ?? 0) % colors.length
    const [bg, fg] = colors[idx]
    const cls = size === 'sm'
        ? 'w-6 h-6 rounded-lg text-[9px]'
        : size === 'lg'
            ? 'w-12 h-12 rounded-2xl text-[15px]'
            : 'w-8 h-8 rounded-xl text-[11px]'
    return (
        <div className={`${cls} flex items-center justify-center font-bold flex-shrink-0`}
            style={{ background: bg, color: fg }}>
            {initials}
        </div>
    )
}

/* ── detail row ── */
const DetailRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) => {
    if (!value || value === '—') return null
    return (
        <div className="flex items-start gap-2.5 py-2 border-b last:border-0" style={{ borderColor: '#f1f5f9' }}>
            <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: '#f1f5f9', color: '#64748b' }}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[9.5px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: '#94a3b8' }}>{label}</p>
                <p className="text-[11.5px] font-medium break-words" style={{ color: '#334155' }}>{value}</p>
            </div>
        </div>
    )
}

/* ── customer detail drawer ── */
const CustomerDetailDrawer = ({ customer, onClose }: { customer: any; onClose: () => void }) => {
    const colors: [string, string][] = [
        ['#e0f2fe', '#0284c7'], ['#fce7f3', '#db2777'], ['#d1fae5', '#059669'],
        ['#ede9fe', '#7c3aed'], ['#fef3c7', '#d97706'], ['#fee2e2', '#dc2626'],
    ]
    const idx = (customer.Name?.charCodeAt(0) ?? 0) % colors.length
    const [heroBg] = colors[idx]

    const tags = [
        { label: customer.Campaign, bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' },
        { label: customer.Type, bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
        { label: customer.SubType, bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff' },
        { label: customer.City, bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
    ].filter(t => t.label)

    const extraFields = customer.CustomerFields
        ? Object.entries(customer.CustomerFields).filter(([, v]) => v && String(v).trim())
        : []

    return (
        <>
            <div className="absolute cursor-pointer inset-0 z-20"
                style={{ background: 'rgba(15,23,42,0.25)', backdropFilter: 'blur(2px)' }}
                onClick={onClose} />
            <div className="absolute right-0 top-0 bottom-0 z-30 flex flex-col overflow-hidden"
                style={{
                    width: '320px', background: '#ffffff',
                    borderLeft: '1px solid #e2e8f0',
                    boxShadow: '-8px 0 32px rgba(0,0,0,0.08)',
                    animation: 'drawer-in 0.22s cubic-bezier(0.4,0,0.2,1)',
                }}>
                <div className="flex-shrink-0 px-5 pt-5 pb-4 relative"
                    style={{ background: `linear-gradient(135deg, ${heroBg} 0%, #ffffff 100%)` }}>
                    <button onClick={onClose}
                        className="absolute cursor-pointer top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                        style={{ background: 'rgba(0,0,0,0.06)', color: '#64748b' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.1)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.06)'}>
                        <CloseIcon />
                    </button>
                    <div className="flex items-center gap-3 mb-3">
                        <Avatar name={customer.Name} size="lg" />
                        <div className="flex-1 min-w-0 pr-8">
                            <p className="text-[14px] font-bold leading-tight truncate" style={{ color: '#0f172a' }}>
                                {customer.Name || '—'}
                            </p>
                            {customer.CustomerId && (
                                <p className="text-[10px] font-mono mt-0.5" style={{ color: '#94a3b8' }}>
                                    ID: {customer.CustomerId}
                                </p>
                            )}
                        </div>
                    </div>
                    {tags.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {tags.map((t, i) => (
                                <span key={i} className="text-[9.5px] font-semibold px-2 py-0.5 rounded-lg border"
                                    style={{ background: t.bg, color: t.color, borderColor: t.border }}>
                                    {t.label}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <div className="h-px flex-shrink-0" style={{ background: '#e2e8f0' }} />
                <div className="flex-1 overflow-y-auto px-5 py-4"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
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
                            <div className="mb-4 px-3 py-2.5 rounded-xl border"
                                style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                                <p className="text-[11.5px] leading-relaxed" style={{ color: '#475569' }}>{customer.Description}</p>
                            </div>
                        </>
                    )}
                    {(customer.URL || customer.GoogleMap || customer.Video) && (
                        <>
                            <p className="text-[9.5px] font-bold uppercase tracking-widest mb-2" style={{ color: '#cbd5e1' }}>Links</p>
                            <div className="flex flex-col gap-1.5 mb-4">
                                {customer.URL && (
                                    <a href={customer.URL} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-medium transition-all"
                                        style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#0284c7' }}>
                                        <LinkIcon /> Website
                                    </a>
                                )}
                                {customer.GoogleMap && (
                                    <a href={customer.GoogleMap} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-medium"
                                        style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#059669' }}>
                                        <MapPinIcon /> Google Maps
                                    </a>
                                )}
                                {customer.Video && (
                                    <a href={customer.Video} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-medium"
                                        style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#dc2626' }}>
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
                                    <span key={i} className="text-[10.5px] font-medium px-2.5 py-1 rounded-lg border"
                                        style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#475569' }}>
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
                                    <div key={i} className="flex items-start gap-2 px-3 py-2 border-b last:border-0"
                                        style={{ borderColor: '#f1f5f9', background: i % 2 === 0 ? '#f8fafc' : '#ffffff' }}>
                                        <p className="text-[10px] font-semibold flex-shrink-0 w-24 truncate capitalize"
                                            style={{ color: '#64748b' }}>
                                            {String(key).replace(/_/g, ' ')}
                                        </p>
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

/* ── recommended customer card (with selection) ── */
const RecommendedCard = ({
    c, onView, isSelected, onToggle, shortlistedStatus,
}: {
    c: any
    onView: (c: any) => void
    isSelected: boolean
    onToggle: (id: string) => void
    shortlistedStatus?: StatusValue | null
}) => {
    const statusCfg = shortlistedStatus ? STATUS_CONFIG[shortlistedStatus] : null
    return (
        <div
            className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl border transition-all duration-150 group cursor-pointer"
            style={{
                background: isSelected ? '#f0f9ff' : '#f8fafc',
                borderColor: isSelected ? '#7dd3fc' : '#e2e8f0',
                boxShadow: isSelected ? '0 0 0 1px #7dd3fc22' : 'none',
            }}
            onMouseEnter={e => {
                if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.borderColor = '#cbd5e1';
                    (e.currentTarget as HTMLElement).style.background = '#f1f5f9';
                }
            }}
            onMouseLeave={e => {
                if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
                    (e.currentTarget as HTMLElement).style.background = '#f8fafc';
                }
            }}
            onClick={() => onToggle(c._id)}
        >
            <div className="mt-0.5">
                <SelectCheckbox checked={isSelected} onChange={() => onToggle(c._id)} />
            </div>
            <Avatar name={c.Name} size="sm" />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-[11.5px] font-semibold truncate" style={{ color: '#1e293b' }}>
                        {c.Name || '—'}
                    </p>
                    {statusCfg && (
                        <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-md border flex items-center gap-1"
                            style={{ background: statusCfg.bg, color: statusCfg.color, borderColor: statusCfg.border }}>
                            <span className="w-1 h-1 rounded-full inline-block flex-shrink-0" style={{ background: statusCfg.dot }} />
                            {statusCfg.label}
                        </span>
                    )}
                </div>
                <p className="text-[10px] truncate mt-0.5" style={{ color: '#94a3b8' }}>
                    {c.ContactNumber || c.Email || '—'}
                </p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {c.Campaign && (
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md"
                            style={{ background: '#f0f9ff', color: '#0369a1' }}>{c.Campaign}</span>
                    )}
                    {c.Type && (
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md"
                            style={{ background: '#f0fdf4', color: '#166634' }}>{c.Type}</span>
                    )}
                    {c.SubType && (
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md"
                            style={{ background: '#f0fdf4', color: '#166634' }}>{c.SubType}</span>
                    )}
                    {(c.City || c.Location) && (
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md"
                            style={{ background: '#faf5ff', color: '#7c3aed' }}>
                            {c.City || c.Location}
                        </span>
                    )}
                    {c.Location && (
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md"
                            style={{ background: '#faf5ff', color: '#7c3aed' }}>
                            {c.Location}
                        </span>
                    )}
                    {c.SubLocation && (
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md"
                            style={{ background: '#faf5ff', color: '#7c3aed' }}>
                            {c.SubLocation}
                        </span>
                    )}

                </div>
            </div>
            <button
                onClick={e => { e.stopPropagation(); onView(c) }}
                className="flex-shrink-0 cursor-pointer flex items-center gap-1 px-2 py-1 rounded-lg border text-[9.5px] font-semibold transition-all duration-150 opacity-0 group-hover:opacity-100"
                style={{ background: '#ffffff', borderColor: '#e2e8f0', color: '#64748b' }}
                onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = '#f0f9ff';
                    (e.currentTarget as HTMLElement).style.borderColor = '#bae6fd';
                    (e.currentTarget as HTMLElement).style.color = '#0284c7';
                }}
                onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = '#ffffff';
                    (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
                    (e.currentTarget as HTMLElement).style.color = '#64748b';
                }}
                title="View all details"
            >
                <EyeIcon /><span>View</span>
            </button>
        </div>
    )
}

/* ── selection action bar ── */
const SelectionBar = ({
    count, status, onStatusChange, onShortlist, onClear, loading, success,
}: {
    count: number; status: StatusValue; onStatusChange: (s: StatusValue) => void
    onShortlist: () => void; onClear: () => void; loading: boolean; success: boolean
}) => {
    const activeCfg = STATUS_CONFIG[status]
    return (
        <div
            className="flex-shrink-0 mx-4 mb-2 rounded-2xl overflow-hidden border"
            style={{
                background: '#ffffff', borderColor: '#e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
                animation: 'bar-in 0.2s cubic-bezier(0.34,1.56,0.64,1)',
            }}
        >
            <div className="flex items-center justify-between px-4 pt-3 pb-2"
                style={{ borderBottom: '1px solid #f1f5f9' }}>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center"
                        style={{ background: '#f0f9ff', color: '#0284c7' }}>
                        <ListChecksIcon />
                    </div>
                    <p className="text-[12px] font-semibold" style={{ color: '#0f172a' }}>
                        {count} customer{count !== 1 ? 's' : ''} selected
                    </p>
                    {success && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                            style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                            <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6l3 3 5-5" stroke="#166534" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Shortlisted!
                        </span>
                    )}
                </div>
                <button
                    onClick={onClear}
                    className="flex items-center cursor-pointer gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg transition-all"
                    style={{ color: '#94a3b8', background: 'transparent' }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = '#fef2f2';
                        (e.currentTarget as HTMLElement).style.color = '#dc2626';
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = '#94a3b8';
                    }}
                >
                    <ClearIcon /> Clear
                </button>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5">
                <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                    {STATUS_ENTRIES.map(([val, cfg]) => (
                        <button
                            key={val}
                            onClick={() => onStatusChange(val)}
                            className="flex items-center cursor-pointer gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all duration-150"
                            style={status === val
                                ? { background: cfg.activeBg, color: cfg.activeColor, borderColor: cfg.activeBg, boxShadow: `0 2px 6px ${cfg.activeBg}55` }
                                : { background: cfg.bg, color: cfg.color, borderColor: cfg.border }
                            }
                        >
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ background: status === val ? 'rgba(255,255,255,0.7)' : cfg.dot }} />
                            {cfg.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={onShortlist}
                    disabled={loading}
                    className="flex-shrink-0 cursor-pointer flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all duration-150 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: activeCfg.activeBg, color: '#ffffff', boxShadow: `0 3px 10px ${activeCfg.activeBg}50` }}
                    onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)' }}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.filter = 'none'}
                >
                    {loading ? (
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent"
                            style={{ animation: 'qa-spin 0.8s linear infinite' }} />
                    ) : (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    )}
                    {loading ? 'Saving…' : 'Shortlist'}
                </button>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────── */
const RecommendAgentWorkspace = ({ isOpen }: { isOpen: boolean }) => {
    const [customers, setCustomers] = useState<any[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [prompt, setPrompt] = useState('')
    const [messages, setMessages] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchField, setSearchField] = useState<'All' | 'Name' | 'Email' | 'Campaign' | 'Type' | 'Phone'>('All')
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [isCustomersLoading, setIsCustomersLoading] = useState(true)
    const [collapsedMap, setCollapsedMap] = useState<Record<number, boolean>>({})
    const [viewingCustomer, setViewingCustomer] = useState<any | null>(null)
    const [selectedRecs, setSelectedRecs] = useState<Set<string>>(new Set())
    const [shortlistStatus, setShortlistStatus] = useState<StatusValue>('shortlisted')
    const [shortlistLoading, setShortlistLoading] = useState(false)
    const [shortlistSuccess, setShortlistSuccess] = useState(false)
    const [shortlistedMap, setShortlistedMap] = useState<Record<string, StatusValue>>({})
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
    const [recVisibleMap, setRecVisibleMap] = useState<Record<number, number>>({})

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
            SubType: item.CustomerSubType,
            Name: item.customerName,
            Description: item.Description,
            Email: item.Email,
            City: item.City,
            Location: item.Location,
            Adderess: item.Adderess,
            Area: item.Area,
            SubLocation: item.SubLocation,
            CustomerId: item.CustomerId,
            ClientId: item.ClientId,
            CustomerYear: item.CustomerYear,
            Facillities: item.Facillities,
            ContactNumber: item.ContactNumber?.slice(0, 10),
            ReferenceId: item.ReferenceId,
            AssignTo: item.AssignTo ?? [],
            isFavourite: item.isFavourite,
            isChecked: item.isChecked,
            Other: item.Other,
            Date: item.CustomerDate === 'N/A' ? 'N/A' : item.CustomerDate ? formatDateDMY(item.CustomerDate) : formattedDate,
            CustomerImage: item.CustomerImage || '',
            SitePlan: item.SitePlan || '',
            URL: item.URL || '',
            Video: item.Video || '',
            GoogleMap: item.GoogleMap || '',
            Price: item.Price || '',
            CustomerFields: item.CustomerFields || {},
        }
    }

    // ── FIX 1: fetch on mount, no isOpen gate ──────────────────────────────
    const fetchCustomers = async () => {
        setIsCustomersLoading(true)
        try {
            const res: any = await getCustomer()
            if (res) {
                const mapped = res.map(mapCustomer)
                setCustomers(mapped)
                if (mapped.length) setSelectedId(mapped[0]._id)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsCustomersLoading(false)
        }
    }

    useEffect(() => { fetchCustomers() }, [])
    // ───────────────────────────────────────────────────────────────────────

    useEffect(() => { setVisibleCount(PAGE_SIZE) }, [searchQuery])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isLoading])

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setViewingCustomer(null) }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [])

    useEffect(() => {
        setSelectedRecs(new Set())
        setShortlistSuccess(false)
        setShortlistedMap({})
    }, [selectedId])

    const toggleRecSelection = (id: string) => {
        setSelectedRecs(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const selectAllInMessage = (ids: string[]) => {
        setSelectedRecs(prev => {
            const next = new Set(prev)
            const allSelected = ids.every(id => next.has(id))
            if (allSelected) ids.forEach(id => next.delete(id))
            else ids.forEach(id => next.add(id))
            return next
        })
    }

    const clearSelection = () => {
        setSelectedRecs(new Set())
        setShortlistSuccess(false)
    }

    const handleShortlist = async () => {
        if (selectedRecs.size === 0 || !selectedId || shortlistLoading) return
        setShortlistLoading(true)
        try {
            const propertyIds = [...selectedRecs]
            const result = await addToShortlist({ customerId: selectedId, propertyIds, status: shortlistStatus })
            if (result) {
                const newMap = { ...shortlistedMap }
                propertyIds.forEach(id => { newMap[id] = shortlistStatus })
                setShortlistedMap(newMap)
                setShortlistSuccess(true)
                setSelectedRecs(new Set())
                setTimeout(() => setShortlistSuccess(false), 3000)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setShortlistLoading(false)
        }
    }

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

    const visibleCustomers = filteredCustomers.slice(0, visibleCount)
    const hasMore = visibleCount < filteredCustomers.length
    const remaining = filteredCustomers.length - visibleCount

    const selectedCustomer = customers.find((c: any) => c._id === selectedId)

    const autoResize = () => {
        const el = textareaRef.current
        if (el) {
            el.style.height = 'auto'
            el.style.height = Math.min(el.scrollHeight, 120) + 'px'
        }
    }

    const handleSubmit = async () => {
        if (!prompt.trim() || !selectedId || isLoading) return
        const userText = prompt
        setMessages(prev => [...prev, { role: 'user', text: userText }])
        setPrompt('')
        if (textareaRef.current) textareaRef.current.style.height = 'auto'
        setIsLoading(true)
        try {
            const res: any = await getRecommendedCustomers({ customerId: selectedId, userPrompt: userText })
            if (res?.success) {
                const mappedRecs = (res.data || []).map(mapCustomer)
                setMessages(prev => [
                    ...prev,
                    {
                        role: 'ai',
                        answer: res.aiAnswer || '',
                        recommendedCustomers: mappedRecs,
                        count: res.count ?? mappedRecs.length,
                    }
                ])
                const newIdx = messages.length + 1
                if (mappedRecs.length > 3) {
                    setCollapsedMap(prev => ({ ...prev, [newIdx]: true }))
                }
            }
        } catch {
            setMessages(prev => [...prev, { role: 'ai', answer: 'Something went wrong. Please try again.', recommendedCustomers: [], count: 0 }])
        }
        setIsLoading(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
    }

    const hints = [
        'Who are similar customers?',
        'Recommend related leads',
        'Find customers like this one',
    ]

    const toggleCollapse = (idx: number) => {
        setCollapsedMap(prev => ({ ...prev, [idx]: !prev[idx] }))
    }

    const anySelected = selectedRecs.size > 0

    return (
        <div className="flex h-full overflow-hidden rounded-xl relative" style={{ background: '#f8fafc' }}>

            {/* ══ LEFT PANEL ══ */}
            <div className="flex flex-col border-r" style={{
                width: '272px', minWidth: '272px', borderColor: '#e2e8f0', background: '#ffffff'
            }}>
                <div className="px-4 pt-4 pb-3 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                            style={{ background: 'rgba(2,132,199,0.1)', color: '#0284c7' }}>
                            <UserIcon />
                        </div>
                        <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: '#64748b' }}>
                            Customers
                        </span>
                        <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                            style={{ background: '#f1f5f9', color: '#94a3b8' }}>
                            {filteredCustomers.length}
                        </span>
                    </div>
                    <div className="relative mb-2">
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }}>
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            placeholder="Search customers…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-7 py-2 rounded-xl text-[11.5px] outline-none border transition-all duration-150 bg-stone-50 border-slate-200 text-slate-700 focus:border-sky-300 focus:ring-2 focus:ring-sky-100 focus:bg-white"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')}
                                className="absolute cursor-pointer right-2.5 top-1/2 -translate-y-1/2 transition-colors"
                                style={{ color: '#cbd5e1' }}>
                                <ClearIcon />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                        {SEARCH_FIELDS.map(f => (
                            <button key={f} onClick={() => setSearchField(f as any)}
                                className="text-[9.5px] cursor-pointer font-semibold px-2 py-0.5 rounded-full transition-all duration-150"
                                style={searchField === f
                                    ? { background: '#0284c7', color: '#ffffff' }
                                    : { background: '#f1f5f9', color: '#94a3b8' }
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
                                style={{ background: '#f1f5f9', color: '#cbd5e1' }}>
                                <SearchIcon />
                            </div>
                            <p className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>No customers found</p>
                        </div>
                    ) : visibleCustomers.map((c: any) => {
                        const isSelected = selectedId === c._id
                        return (
                            <button
                                key={c._id}
                                onClick={() => { setSelectedId(c._id); setMessages([]) }}
                                className="w-full cursor-pointer text-left px-4 py-3 transition-all duration-150 border-b"
                                style={{
                                    borderColor: '#f1f5f9',
                                    background: isSelected ? 'rgba(2,132,199,0.05)' : 'transparent',
                                    borderLeft: isSelected ? '2px solid #0284c7' : '2px solid transparent',
                                }}
                                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#f8fafc' }}
                                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                            >
                                <div className="flex items-start gap-2.5">
                                    <Avatar name={c.Name} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-semibold truncate"
                                            style={{ color: isSelected ? '#0284c7' : '#1e293b' }}>
                                            {c.Name || '—'}
                                        </p>
                                        <p className="text-[10.5px] truncate mt-0.5" style={{ color: '#94a3b8' }}>
                                            {c.ContactNumber || c.Email || '—'}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                            {c.Campaign && (
                                                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md"
                                                    style={{ background: '#f0f9ff', color: '#0369a1' }}>{c.Campaign}</span>
                                            )}
                                            {c.Type && (
                                                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md"
                                                    style={{ background: '#f0fdf4', color: '#166534' }}>{c.Type}</span>
                                            )}
                                            {c.SubType && (
                                                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md"
                                                    style={{ background: '#f0fdf4', color: '#166534' }}>{c.SubType}</span>
                                            )}
                                            {c.City && (
                                                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md"
                                                    style={{ background: '#f0fdf4', color: '#166534' }}>{c.City}</span>
                                            )}
                                            {c.Location && (
                                                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md"
                                                    style={{ background: '#f0fdf4', color: '#166534' }}>{c.Location}</span>
                                            )}
                                            {c.SubLocation && (
                                                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md"
                                                    style={{ background: '#f0fdf4', color: '#166534' }}>{c.SubLocation}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )
                    })}

                    {hasMore && (
                        <button
                            onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                            className="w-full py-3 cursor-pointer text-[11.5px] font-medium border-t transition-colors"
                            style={{ borderColor: '#f1f5f9', color: '#94a3b8', background: 'transparent' }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.color = '#0284c7';
                                (e.currentTarget as HTMLElement).style.background = '#f0f9ff';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.color = '#94a3b8';
                                (e.currentTarget as HTMLElement).style.background = 'transparent';
                            }}
                        >
                            Load {Math.min(PAGE_SIZE, remaining)} more
                            <span style={{ color: '#cbd5e1' }}> ({remaining} remaining)</span>
                        </button>
                    )}
                </div>
            </div>

            {/* ══ RIGHT PANEL ══ */}
            <div className="flex-1 flex flex-col min-w-0">

                {selectedCustomer ? (
                    <div className="flex-shrink-0 px-5 py-3 border-b flex items-center gap-3"
                        style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
                        <Avatar name={selectedCustomer.Name} />
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold" style={{ color: '#1e293b' }}>
                                {selectedCustomer.Name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                {selectedCustomer.Email && (
                                    <span className="text-[10.5px]" style={{ color: '#94a3b8' }}>{selectedCustomer.Email}</span>
                                )}
                                {selectedCustomer.ContactNumber && (
                                    <span className="text-[10.5px]" style={{ color: '#94a3b8' }}>· {selectedCustomer.ContactNumber}</span>
                                )}
                                {selectedCustomer.City && (
                                    <span className="text-[10.5px]" style={{ color: '#94a3b8' }}>· {selectedCustomer.City}</span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                            {selectedCustomer.Campaign && (
                                <span className="text-[9.5px] font-semibold px-2 py-1 rounded-lg"
                                    style={{ background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}>
                                    {selectedCustomer.Campaign}
                                </span>
                            )}
                            {selectedCustomer.Type && (
                                <span className="text-[9.5px] font-semibold px-2 py-1 rounded-lg"
                                    style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                                    {selectedCustomer.Type}
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-shrink-0 border-b" style={{ background: '#ffffff', borderColor: '#e2e8f0', height: '56px' }} />
                )}

                {/* Chat area */}
                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>

                    {!selectedId && (
                        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                                style={{ background: 'rgba(2,132,199,0.08)', color: '#0284c7' }}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1 1 .03 2.798-1.414 2.798H4.213c-1.444 0-2.413-1.798-1.414-2.798L4.2 15.3" />
                                </svg>
                            </div>
                            <p className="text-[13px] font-semibold" style={{ color: '#334155' }}>Select a customer to start</p>
                            <p className="text-[11.5px] mt-1" style={{ color: '#94a3b8' }}>Choose from the list and find similar leads</p>
                        </div>
                    )}

                    {selectedId && messages.length === 0 && !isLoading && (
                        <div className="flex flex-col items-center justify-center flex-1 py-10">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
                                style={{ background: 'rgba(2,132,199,0.08)', color: '#0284c7' }}>
                                <SparkleIcon />
                            </div>
                            <p className="text-[12px] font-semibold mb-1" style={{ color: '#334155' }}>Recommend AI ready</p>
                            <p className="text-[11px] mb-5" style={{ color: '#94a3b8' }}>Ask to find similar or related customers</p>
                            <div className="flex flex-col gap-2 w-full max-w-[320px]">
                                {hints.map(h => (
                                    <button key={h} onClick={() => setPrompt(h)}
                                        className="text-left cursor-pointer px-3.5 py-2.5 rounded-xl text-[11.5px] font-medium transition-all duration-150 border"
                                        style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#475569' }}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLElement).style.background = '#f0f9ff';
                                            (e.currentTarget as HTMLElement).style.borderColor = '#bae6fd';
                                            (e.currentTarget as HTMLElement).style.color = '#0284c7';
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLElement).style.background = '#f8fafc';
                                            (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
                                            (e.currentTarget as HTMLElement).style.color = '#475569';
                                        }}>
                                        {h}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Messages ── */}
                    {messages.map((m: any, i: number) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                            {m.role === 'ai' && (
                                <div className="max-w-[92%] w-full rounded-2xl rounded-tl-md overflow-hidden border"
                                    style={{ borderColor: '#e2e8f0', background: '#ffffff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

                                    {m.answer && (
                                        <div className="px-4 pt-3.5 pb-3 border-b" style={{ borderColor: '#f1f5f9' }}>
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <div className="w-4 h-4 rounded-md flex items-center justify-center"
                                                    style={{ background: 'rgba(2,132,199,0.1)', color: '#0284c7' }}>
                                                    <SparkleIcon />
                                                </div>
                                                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                                                    AI Insight
                                                </p>
                                            </div>
                                            <p className="text-[12.5px] leading-relaxed" style={{ color: '#334155' }}>{m.answer}</p>
                                        </div>
                                    )}

                                    {m.recommendedCustomers?.length > 0 && (() => {
                                        const msgIds: string[] = m.recommendedCustomers.map((rc: any) => rc._id)
                                        const selectedInMsg = msgIds.filter(id => selectedRecs.has(id))
                                        const allInMsgSelected = msgIds.length > 0 && msgIds.every(id => selectedRecs.has(id))
                                        const someInMsgSelected = selectedInMsg.length > 0 && !allInMsgSelected

                                        return (
                                            <div className="px-4 pt-3 pb-3.5">
                                                <div className="flex items-center gap-2 mb-2.5">
                                                    <button onClick={() => toggleCollapse(i)}
                                                        className="flex items-center cursor-pointer gap-1.5 flex-1 min-w-0 cursor-pointer group">
                                                        <div className="w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0"
                                                            style={{ background: '#f0fdf4', color: '#059669' }}>
                                                            <UsersIcon />
                                                        </div>
                                                        <p className="text-[10px] font-semibold uppercase tracking-wider flex-shrink-0"
                                                            style={{ color: '#94a3b8' }}>
                                                            Recommended
                                                        </p>
                                                        <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                                                            style={{ background: '#dcfce7', color: '#166534' }}>
                                                            {m.count}
                                                        </span>
                                                        <svg
                                                            className="w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0"
                                                            style={{ color: '#94a3b8', transform: collapsedMap[i] ? 'rotate(0deg)' : 'rotate(180deg)' }}
                                                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>

                                                    {!collapsedMap[i] && (
                                                        <button
                                                            onClick={() => selectAllInMessage(msgIds)}
                                                            className="flex items-center cursor-pointer gap-1 px-2 py-1 rounded-lg border text-[9.5px] font-semibold transition-all duration-150 flex-shrink-0"
                                                            style={allInMsgSelected
                                                                ? { background: '#f0f9ff', borderColor: '#7dd3fc', color: '#0284c7' }
                                                                : { background: '#f8fafc', borderColor: '#e2e8f0', color: '#94a3b8' }
                                                            }
                                                            onMouseEnter={e => {
                                                                if (!allInMsgSelected) {
                                                                    (e.currentTarget as HTMLElement).style.borderColor = '#bae6fd';
                                                                    (e.currentTarget as HTMLElement).style.color = '#0284c7';
                                                                    (e.currentTarget as HTMLElement).style.background = '#f0f9ff';
                                                                }
                                                            }}
                                                            onMouseLeave={e => {
                                                                if (!allInMsgSelected) {
                                                                    (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
                                                                    (e.currentTarget as HTMLElement).style.color = '#94a3b8';
                                                                    (e.currentTarget as HTMLElement).style.background = '#f8fafc';
                                                                }
                                                            }}
                                                        >
                                                            <SelectCheckbox
                                                                checked={allInMsgSelected}
                                                                indeterminate={someInMsgSelected}
                                                                onChange={() => selectAllInMessage(msgIds)}
                                                            />
                                                            <span>
                                                                {allInMsgSelected
                                                                    ? 'Deselect all'
                                                                    : someInMsgSelected
                                                                        ? `${selectedInMsg.length} selected`
                                                                        : 'Select all'}
                                                            </span>
                                                        </button>
                                                    )}
                                                </div>

                                                {collapsedMap[i] && (
                                                    <>
                                                        {m.recommendedCustomers.slice(0, 10).map((rc: any) => (
                                                            <RecommendedCard
                                                                key={rc._id} c={rc}
                                                                onView={setViewingCustomer}
                                                                isSelected={selectedRecs.has(rc._id)}
                                                                onToggle={toggleRecSelection}
                                                                shortlistedStatus={shortlistedMap[rc._id] ?? null}
                                                            />
                                                        ))}
                                                        {m.recommendedCustomers.length > 1 && (
                                                            <div className="flex items-center gap-1.5 flex-wrap mt-2">
                                                                {m.recommendedCustomers.slice(1, 5).map((rc: any) => (
                                                                    <span key={rc._id}
                                                                        className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                                                                        style={{
                                                                            background: selectedRecs.has(rc._id) ? '#f0f9ff' : '#f8fafc',
                                                                            borderColor: selectedRecs.has(rc._id) ? '#7dd3fc' : '#e2e8f0',
                                                                            color: selectedRecs.has(rc._id) ? '#0284c7' : '#64748b',
                                                                        }}>
                                                                        {rc.Name || '—'}
                                                                    </span>
                                                                ))}
                                                                <span className="text-[10px] cursor-pointer hover:text-gray-900 font-semibold"
                                                                    style={{ color: '#94a3b8' }}
                                                                    onClick={() => toggleCollapse(i)}>
                                                                    +{m.recommendedCustomers.length - 1} more
                                                                </span>
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                {!collapsedMap[i] && (() => {
                                                    const visibleRec = recVisibleMap[i] ?? PAGE_SIZE;
                                                    const recSlice = m.recommendedCustomers.slice(0, visibleRec);
                                                    const recHasMore = visibleRec < m.recommendedCustomers.length;
                                                    const recRemaining = m.recommendedCustomers.length - visibleRec;
                                                    return (
                                                        <div className="flex flex-col gap-2">
                                                            {recSlice.map((rc: any) => (
                                                                <RecommendedCard
                                                                    key={rc._id} c={rc}
                                                                    onView={setViewingCustomer}
                                                                    isSelected={selectedRecs.has(rc._id)}
                                                                    onToggle={toggleRecSelection}
                                                                    shortlistedStatus={shortlistedMap[rc._id] ?? null}
                                                                />
                                                            ))}
                                                            {recHasMore && (
                                                                <button
                                                                    onClick={() => setRecVisibleMap(prev => ({ ...prev, [i]: visibleRec + PAGE_SIZE }))}
                                                                    className="w-full py-2 cursor-pointer text-[11px] font-medium rounded-xl border border-dashed transition-colors"
                                                                    style={{ borderColor: '#e2e8f0', color: '#94a3b8', background: 'transparent' }}
                                                                    onMouseEnter={e => {
                                                                        (e.currentTarget as HTMLElement).style.borderColor = '#bae6fd';
                                                                        (e.currentTarget as HTMLElement).style.color = '#0284c7';
                                                                        (e.currentTarget as HTMLElement).style.background = '#f0f9ff';
                                                                    }}
                                                                    onMouseLeave={e => {
                                                                        (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
                                                                        (e.currentTarget as HTMLElement).style.color = '#94a3b8';
                                                                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                                                                    }}
                                                                >
                                                                    Load {Math.min(PAGE_SIZE, recRemaining)} more
                                                                    <span style={{ color: '#cbd5e1' }}> ({recRemaining} remaining)</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        )
                                    })()}

                                    {m.recommendedCustomers?.length === 0 && (
                                        <div className="px-4 py-3 flex items-center gap-2">
                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
                                                <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
                                                <path strokeLinecap="round" strokeWidth={1.5} d="M12 8v4M12 16h.01" />
                                            </svg>
                                            <p className="text-[11.5px]" style={{ color: '#94a3b8' }}>No matching customers found.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {m.role === 'user' && (
                                <div className="max-w-[72%] px-3.5 py-2.5 rounded-2xl rounded-tr-md text-[12px] leading-relaxed"
                                    style={{ background: '#0284c7', color: '#ffffff', boxShadow: '0 2px 8px rgba(2,132,199,0.25)' }}>
                                    {m.text}
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: 'rgba(2,132,199,0.1)', color: '#0284c7' }}>
                                <SparkleIcon />
                            </div>
                            <div className="px-4 py-3 rounded-2xl rounded-tl-md border"
                                style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
                                <div className="flex items-center gap-1.5">
                                    {[0, 1, 2].map(i => (
                                        <span key={i} className="w-1.5 h-1.5 rounded-full"
                                            style={{ background: '#0284c7', opacity: 0.6, animation: `qa-bounce 1.2s ${i * 0.2}s infinite` }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {anySelected && selectedId && (
                    <SelectionBar
                        count={selectedRecs.size}
                        status={shortlistStatus}
                        onStatusChange={setShortlistStatus}
                        onShortlist={handleShortlist}
                        onClear={clearSelection}
                        loading={shortlistLoading}
                        success={shortlistSuccess}
                    />
                )}

                {/* ── FIX 2: Input area — pure CSS focus-within, no onFocusCapture/onBlurCapture ── */}
                {selectedId && (
                    <div className="flex-shrink-0 border-t px-4 pt-3 pb-4"
                        style={{ borderColor: '#e2e8f0', background: '#ffffff' }}>
                        <div className="flex items-end gap-2 rounded-2xl px-3.5 pt-2.5 pb-2 bg-white border-[1.5px] border-slate-200 transition-all duration-200 focus-within:border-sky-300 focus-within:ring-2 focus-within:ring-sky-100">
                            <div className="flex-1">
                                <textarea
                                    ref={textareaRef}
                                    rows={1}
                                    value={prompt}
                                    onChange={e => { setPrompt(e.target.value); autoResize() }}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask to find similar or related customers…"
                                    disabled={isLoading}
                                    className="w-full resize-none bg-transparent outline-none leading-relaxed disabled:opacity-40 text-slate-900"
                                    style={{ fontSize: '12.5px', minHeight: '24px' }}
                                />
                                <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-slate-100">
                                    <div className="flex items-center gap-2">
                                        {hints.slice(0, 2).map(h => (
                                            <button key={h} onClick={() => setPrompt(h)}
                                                className="text-[9.5px] font-medium cursor-pointer px-2 py-0.5 rounded-lg transition-all border border-slate-200 bg-stone-50 text-slate-400 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600">
                                                {h}
                                            </button>
                                        ))}
                                    </div>
                                    <span className="text-[9px] font-mono text-slate-300">↵ send</span>
                                </div>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || !prompt.trim()}
                                className="w-8 h-8 mb-1 rounded-xl flex items-center justify-center transition-all duration-150 flex-shrink-0 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110"
                                style={{ background: '#0284c7', boxShadow: '0 2px 8px rgba(2,132,199,0.3)' }}
                            >
                                {isLoading
                                    ? <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent"
                                        style={{ animation: 'qa-spin 0.8s linear infinite' }} />
                                    : <SendIcon />
                                }
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ══ CUSTOMER DETAIL DRAWER ══ */}
            {viewingCustomer && (
                <CustomerDetailDrawer
                    customer={viewingCustomer}
                    onClose={() => setViewingCustomer(null)}
                />
            )}

            <style>{`
        @keyframes qa-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
        @keyframes qa-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes drawer-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes bar-in {
          from { transform: translateY(8px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
      `}</style>
        </div>
    )
}

export default RecommendAgentWorkspace