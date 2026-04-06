"use client"
import { formatDateDMY } from '@/app/utils/formatDateDMY'
import { getCustomer, getQualification, startCallByAIAgent, updateCustomer } from '@/store/customer'
import React, { useEffect, useRef, useState, useMemo } from 'react'

/* ── tiny icon components (no extra deps) ── */
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

/* ── temperature badge ── */
const TempBadge = ({ label }: { label: string }) => {
    const map: Record<string, { bg: string; color: string; dot: string }> = {
        Hot: { bg: 'rgba(239,68,68,0.08)', color: '#dc2626', dot: '#ef4444' },
        Warm: { bg: 'rgba(249,115,22,0.08)', color: '#ea580c', dot: '#f97316' },
        Cold: { bg: 'rgba(59,130,246,0.08)', color: '#2563eb', dot: '#3b82f6' },
        Mild: { bg: 'rgba(16,185,129,0.08)', color: '#059669', dot: '#10b981' },
    }
    const s = map[label] ?? { bg: 'rgba(100,116,139,0.08)', color: '#475569', dot: '#94a3b8' }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ background: s.bg, color: s.color }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
            {label}
        </span>
    )
}

const extractTemp = (text: string) => {
    const m = text.match(/Lead:\s*(\w+)/i)
    return m ? m[1] : null
}

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

/* ─────────────────────────────────────────────── */
const CallingAgentWorkspace = ({ isOpen }: { isOpen: boolean }) => {
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

   useEffect(() => {
    if (!isOpen) return;

    const fetchCustomers = async () => {
        setIsCustomersLoading(true);

        try {
            const res: any = await getCustomer();
            if (res) setCustomers(res.map(mapCustomer));
        } catch (err) {
            console.error(err);
        } finally {
            setIsCustomersLoading(false);
        }
    };

    fetchCustomers();
}, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isLoading])

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
        setMessages((prev: any[]) => [...prev, { role: 'user', text: userText }])

        setPrompt('')
        if (textareaRef.current) textareaRef.current.style.height = 'auto'
        setIsLoading(true)
        try {
            const res = await startCallByAIAgent({ customerId: selectedId, userPrompt: userText })
            const aiText = `\nLead: ${res?.data?.leadTemperature}\n\nReason: ${res?.data?.aiReason}`

            setMessages(prev => [
                ...prev,
                {
                    role: 'ai',
                    answer: res?.data?.aiAnswer,
                    confirmed: false
                }
            ])
            // setMessages((prev: any[]) => [...prev, { role: 'ai', text: aiText }])
            /* setMessages(prev => [
                ...prev,
                {
                    role: 'ai',
                    text: aiText,
                    leadTemperature: res?.data?.leadTemperature,
                    aiReason: res?.data?.aiReason,
                    answer: res?.data?.answer,
                    confirmed: false
                }
            ]) */
        
            } catch {
            setMessages((prev: any[]) => [...prev, { role: 'ai', text: 'Something went wrong. Please try again.' }])
        }
        setIsLoading(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
    }

    const hints = [
  'Call this lead now',
  'Initiate site visit discussion call',
  'Connect with this lead for property details',
  'Begin conversation to schedule site visit',
  'Talk to this customer about property visit',
]

    const handleUpdateTemperature = async (id: string, value: string) => {

        console.log(" id is ", id, "payload is ", value)

        const formData = new FormData();
        formData.append("LeadTemperature", value.toString());

        const res = await updateCustomer(id, formData);

        if (res) {

            return;
        }



    };

    const handleConfirm = async (index: number, isYes: boolean) => {
        const msg = messages[index];

        if (!msg?.leadTemperature || !selectedId) return;

        let updated = false;

        if (isYes) {
            await handleUpdateTemperature(selectedId, msg.leadTemperature);
            updated = true;
        }

        // update message state
        setMessages(prev =>
            prev.map((m, i) =>
                i === index
                    ? { ...m, confirmed: true, updated }
                    : m
            )
        );
    };

    return (
        <div className="flex h-full overflow-hidden rounded-xl" style={{ background: '#f8fafc' }}>

            {/* ══ LEFT PANEL ══ */}
            <div className="flex flex-col border-r" style={{
                width: '272px', minWidth: '272px', borderColor: '#e2e8f0', background: '#ffffff'
            }}>

                {/* Header */}
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

                    {/* Search bar */}
                    <div className="relative mb-2">
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }}>
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            placeholder="Search customers…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-7 py-2 rounded-xl text-[11.5px] outline-none border transition-all duration-150"
                            style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#334155' }}
                            onFocus={e => {
                                e.currentTarget.style.borderColor = '#7dd3fc'
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(125,211,252,0.12)'
                            }}
                            onBlur={e => {
                                e.currentTarget.style.borderColor = '#e2e8f0'
                                e.currentTarget.style.boxShadow = 'none'
                            }}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors"
                                style={{ color: '#cbd5e1' }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#94a3b8'}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#cbd5e1'}
                            >
                                <ClearIcon />
                            </button>
                        )}
                    </div>

                    {/* Filter chips */}
                    <div className="flex items-center gap-1 flex-wrap">
                        {SEARCH_FIELDS.map(f => (
                            <button key={f} onClick={() => setSearchField(f as any)}
                                className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full transition-all duration-150"
                                style={searchField === f
                                    ? { background: '#0284c7', color: '#ffffff' }
                                    : { background: '#f1f5f9', color: '#94a3b8' }
                                }>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Customer list */}
                <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
                    {isCustomersLoading ? (
    <div className="flex flex-col gap-3 px-4 py-4">
        {[1,2,3,4,5].map(i => (
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
                    ) : filteredCustomers.map((c: any) => {
                        const isSelected = selectedId === c._id
                        return (
                            <button
                                key={c._id}
                                onClick={() => { setSelectedId(c._id); setMessages([]) }}
                                className="w-full text-left px-4 py-3 transition-all duration-150 border-b"
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
                                        <p className="text-[12px] font-semibold truncate" style={{ color: isSelected ? '#0284c7' : '#1e293b' }}>
                                            {c.Name || '—'}
                                        </p>
                                        <p className="text-[10.5px] truncate mt-0.5" style={{ color: '#94a3b8' }}>
                                            {c.ContactNumber || c.Email || '—'}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                            {c.Campaign && (
                                                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md"
                                                    style={{ background: '#f0f9ff', color: '#0369a1' }}>
                                                    {c.Campaign}
                                                </span>
                                            )}
                                            {c.Type && (
                                                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md"
                                                    style={{ background: '#f0fdf4', color: '#166534' }}>
                                                    {c.Type}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* ══ RIGHT PANEL ══ */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Customer header bar */}
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

                    {/* Empty state — no customer selected */}
                    {!selectedId && (
                        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                                style={{ background: 'rgba(2,132,199,0.08)', color: '#0284c7' }}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1 1 .03 2.798-1.414 2.798H4.213c-1.444 0-2.413-1.798-1.414-2.798L4.2 15.3" />
                                </svg>
                            </div>
                            <p className="text-[13px] font-semibold" style={{ color: '#334155' }}>Select a customer to qualify</p>
                            <p className="text-[11.5px] mt-1" style={{ color: '#94a3b8' }}>
                                Choose from the list and ask about lead quality
                            </p>
                        </div>
                    )}

                    {/* Empty state — customer selected, no messages */}
                    {selectedId && messages.length === 0 && !isLoading && (
                        <div className="flex flex-col items-center justify-center flex-1 py-10">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
                                style={{ background: 'rgba(2,132,199,0.08)', color: '#0284c7' }}>
                                <SparkleIcon />
                            </div>
                            <p className="text-[12px] font-semibold mb-1" style={{ color: '#334155' }}>Qualification AI ready</p>
                            <p className="text-[11px] mb-5" style={{ color: '#94a3b8' }}>Ask anything about this lead</p>
                            <div className="flex flex-col gap-2 w-full max-w-[320px]">
                                {hints.map(h => (
                                    <button key={h} onClick={() => setPrompt(h)}
                                        className="text-left px-3.5 py-2.5 rounded-xl text-[11.5px] font-medium transition-all duration-150 border"
                                        style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#475569' }}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLElement).style.background = '#f0f9ff'
                                                ; (e.currentTarget as HTMLElement).style.borderColor = '#bae6fd'
                                                ; (e.currentTarget as HTMLElement).style.color = '#0284c7'
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLElement).style.background = '#f8fafc'
                                                ; (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'
                                                ; (e.currentTarget as HTMLElement).style.color = '#475569'
                                        }}>
                                        {h}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Message bubbles */}
                    {messages.map((m: any, i: number) => {
                      //  const temp = m.role === 'ai' ? extractTemp(m.text) : null
                       // const reason = m.role === 'ai' ? m.text.replace(/^[\s\S]*?Reason:\s*/i, '').trim() : null

                        return (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                                {/* AI MESSAGE */}
                                {m.role === 'ai' && (
  <div className="max-w-[80%] rounded-2xl rounded-tl-md overflow-hidden border"
    style={{ borderColor: '#e2e8f0', background: '#ffffff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

    {/* Header: qualification label + badge */}
    {m.leadTemperature && (
      <div className="px-4 py-3 border-b flex items-center justify-between"
        style={{ borderColor: '#f1f5f9', background: '#f8fafc' }}>
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
          Potential qualification
        </span>
        <TempBadge label={m.leadTemperature} />
      </div>
    )}

    {/* Reason */}
    {m.aiReason && (
      <div className="px-4 pt-3 pb-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94a3b8' }}>
          Reason
        </p>
        <p className="text-[12.5px] leading-relaxed" style={{ color: '#334155' }}>
          {m.aiReason}
        </p>
      </div>
    )}

    {m.answer && (
      <div className="px-4 pt-3 pb-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94a3b8' }}>
          Answer
        </p>
        <p className="text-[12.5px] leading-relaxed" style={{ color: '#334155' }}>
          {m.answer}
        </p>
      </div>
    )}

    {/* Confirmation */}
    {m.leadTemperature && (
      <div className="px-4 pb-3 border-t pt-3 flex flex-col gap-2" style={{ borderColor: '#f1f5f9' }}>
        {!m.confirmed ? (
          <>
            <p className="text-[11.5px]" style={{ color: '#64748b' }}>
              Save this qualification status to the customer profile?
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => handleConfirm(i, true)}
                className="text-[11.5px] cursor-pointer font-medium px-3 py-1.5 rounded-lg transition-opacity"
                style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>
                Yes, update
              </button>
              <button onClick={() => handleConfirm(i, false)}
                className="text-[11.5px] cursor-pointer font-medium px-3 py-1.5 rounded-lg transition-opacity border"
                style={{ borderColor: '#e2e8f0', color: '#64748b', background: 'transparent' }}>
                No
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1.5">
            {m.updated
              ? <><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span className="text-[11.5px] font-medium" style={{ color: '#166534' }}>Qualification status updated</span></>
              : <><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  <span className="text-[11.5px]" style={{ color: '#94a3b8' }}>Not saved</span></>
            }
          </div>
        )}
      </div>
    )}
  </div>
)}

                                {/* USER MESSAGE */}
                                {m.role === 'user' && (
                                    <div
                                        className="max-w-[72%] px-3.5 py-2.5 rounded-2xl rounded-tr-md text-[12px] leading-relaxed"
                                        style={{
                                            background: '#0284c7',
                                            color: '#ffffff',
                                            boxShadow: '0 2px 8px rgba(2,132,199,0.25)'
                                        }}
                                    >
                                        {m.text}
                                    </div>
                                )}

                            </div>
                        )
                    })}

                    {/* Typing indicator */}
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
                                            style={{
                                                background: '#0284c7', opacity: 0.6,
                                                animation: `qa-bounce 1.2s ${i * 0.2}s infinite`,
                                            }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                {selectedId && (
                    <div className="flex-shrink-0 border-t px-4 pt-3 pb-4"
                        style={{ borderColor: '#e2e8f0', background: '#ffffff' }}>
                        <div
                            className="flex items-end gap-2 rounded-2xl px-3.5 pt-2.5 pb-2 border-[1.5px] transition-all duration-200"
                            style={{ background: '#ffffff', borderColor: '#e2e8f0' }}
                            onFocusCapture={e => {
                                const w = e.currentTarget as HTMLElement
                                w.style.borderColor = '#7dd3fc'
                                w.style.boxShadow = '0 0 0 3px rgba(125,211,252,0.12)'
                            }}
                            onBlurCapture={e => {
                                const w = e.currentTarget as HTMLElement
                                w.style.borderColor = '#e2e8f0'
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
                                    placeholder="Ask about this customer's lead quality…"
                                    disabled={isLoading}
                                    className="w-full resize-none bg-transparent outline-none leading-relaxed disabled:opacity-40"
                                    style={{ fontSize: '12.5px', color: '#0f172a', minHeight: '24px' }}
                                />
                                <div className="flex items-center justify-between pt-1.5 mt-1 border-t" style={{ borderColor: '#f1f5f9' }}>
                                    <div className="flex items-center gap-2">
                                        {hints.slice(0, 2).map(h => (
                                            <button key={h} onClick={() => setPrompt(h)}
                                                className="text-[9.5px] font-medium px-2 py-0.5 rounded-lg transition-all border"
                                                style={{ borderColor: '#e2e8f0', background: '#f8fafc', color: '#94a3b8' }}
                                                onMouseEnter={e => {
                                                    (e.currentTarget as HTMLElement).style.borderColor = '#bae6fd'
                                                        ; (e.currentTarget as HTMLElement).style.background = '#f0f9ff'
                                                        ; (e.currentTarget as HTMLElement).style.color = '#0284c7'
                                                }}
                                                onMouseLeave={e => {
                                                    (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'
                                                        ; (e.currentTarget as HTMLElement).style.background = '#f8fafc'
                                                        ; (e.currentTarget as HTMLElement).style.color = '#94a3b8'
                                                }}>
                                                {h}
                                            </button>
                                        ))}
                                    </div>
                                    <span className="text-[9px] font-mono" style={{ color: '#cbd5e1' }}>↵ send</span>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || !prompt.trim()}
                                className="w-8 h-8 mb-1 rounded-xl flex items-center justify-center transition-all duration-150 flex-shrink-0 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                                style={{ background: '#0284c7', boxShadow: '0 2px 8px rgba(2,132,199,0.3)' }}
                                onMouseEnter={e => { if (!isLoading && prompt.trim()) (e.currentTarget as HTMLElement).style.background = '#0369a1' }}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#0284c7'}
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

            <style>{`
        @keyframes qa-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
        @keyframes qa-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    )
}

export default CallingAgentWorkspace