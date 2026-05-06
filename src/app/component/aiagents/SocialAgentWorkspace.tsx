"use client"

import { runAutoSocialAgent } from "@/store/social-media/socialMedia"
import React, { useEffect, useRef, useState } from "react"


/* ─── tiny icon set ───────────────────────────────────────────── */
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
const ClockIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth={2} />
        <polyline points="12 6 12 12 16 14" strokeWidth={2} strokeLinecap="round" />
    </svg>
)
const ImageIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth={2} />
        <circle cx="8.5" cy="8.5" r="1.5" strokeWidth={2} />
        <polyline points="21 15 16 10 5 21" strokeWidth={2} strokeLinecap="round" />
    </svg>
)
const CheckCircleIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
)
const AlertIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth={2} />
        <path strokeLinecap="round" strokeWidth={2} d="M12 8v4M12 16h.01" />
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
const ExternalLinkIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
    </svg>
)
const TypeIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <polyline points="4 7 4 4 20 4 20 7" strokeWidth={2} strokeLinecap="round" />
        <line x1="9" y1="20" x2="15" y2="20" strokeWidth={2} strokeLinecap="round" />
        <line x1="12" y1="4" x2="12" y2="20" strokeWidth={2} strokeLinecap="round" />
    </svg>
)
const ClearIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
)

/* ─── platform definitions ────────────────────────────────────── */
const PLATFORMS = [
    {
        id: "INSTAGRAM",
        label: "Instagram",
        color: "#e1306c",
        bg: "#fff0f5",
        border: "#fbb6ce",
        icon: (
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
            </svg>
        ),
    },
    {
        id: "FACEBOOK",
        label: "Facebook",
        color: "#1877f2",
        bg: "#f0f5ff",
        border: "#bfdbfe",
        icon: (
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
        ),
    },
    {
        id: "TWITTER",
        label: "X / Twitter",
        color: "#0f1419",
        bg: "#f8fafc",
        border: "#cbd5e1",
        icon: (
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
    },
    {
        id: "LINKEDIN",
        label: "LinkedIn",
        color: "#0a66c2",
        bg: "#eff6ff",
        border: "#93c5fd",
        icon: (
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        ),
    },
]

/* ─── status badge ────────────────────────────────────────────── */
const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { bg: string; color: string; border: string; label: string }> = {
        SCHEDULED: { bg: "#f0f9ff", color: "#0369a1", border: "#bae6fd", label: "Scheduled" },
        PUBLISHED: { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0", label: "Published" },
        FAILED: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", label: "Failed" },
    }
    const s = map[status] ?? map["SCHEDULED"]
    return (
        <span
            className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border"
            style={{ background: s.bg, color: s.color, borderColor: s.border }}
        >
            {s.label}
        </span>
    )
}

/* ─── post result card ────────────────────────────────────────── */
const PostResultCard = ({ post, agentSummary, scheduledTime }: {
    post: any
    agentSummary: string
    scheduledTime: string
}) => {
    const platform = PLATFORMS.find(p => p.id === post.platform) ?? PLATFORMS[0]
    const [imgError, setImgError] = useState(false)

    const formattedTime = (() => {
        try {
            return new Date(scheduledTime).toLocaleString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
            })
        } catch {
            return scheduledTime
        }
    })()

    return (
        <div
            className="w-full max-w-[500px] rounded-2xl rounded-tl-md overflow-hidden border"
            style={{ borderColor: "#e2e8f0", background: "#ffffff", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
        >
            {/* AI insight strip */}
            {agentSummary && (
                <div className="px-4 pt-3.5 pb-3 border-b" style={{ borderColor: "#f1f5f9" }}>
                    <div className="flex items-center gap-1.5 mb-2">
                        <div className="w-4 h-4 rounded-md flex items-center justify-center"
                            style={{ background: "rgba(2,132,199,0.10)", color: "#0284c7" }}>
                            <SparkleIcon />
                        </div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                            AI Insight
                        </p>
                    </div>
                    <p className="text-[12.5px] leading-relaxed" style={{ color: "#334155" }}>
                        {agentSummary}
                    </p>
                </div>
            )}

            {/* Generated image */}
            {post.imageUrl && !imgError ? (
                <div className="relative border-b" style={{ borderColor: "#f1f5f9" }}>
                    <img
                        src={post.imageUrl}
                        alt="Generated post"
                        className="w-full object-cover"
                        style={{ maxHeight: "260px" }}
                        onError={() => setImgError(true)}
                    />
                    <div className="absolute top-2 right-2">
                        <a
                            href={post.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9.5px] font-medium border"
                            style={{ background: "rgba(255,255,255,0.92)", borderColor: "#e2e8f0", color: "#64748b", backdropFilter: "blur(4px)" }}
                        >
                            <ExternalLinkIcon /> Open
                        </a>
                    </div>
                    {/* platform badge overlay */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-semibold"
                        style={{ background: "rgba(255,255,255,0.92)", borderColor: platform.border, color: platform.color, backdropFilter: "blur(4px)" }}>
                        <span style={{ color: platform.color }}>{platform.icon}</span>
                        {platform.label}
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center border-b py-6"
                    style={{ borderColor: "#f1f5f9", background: "#f8fafc" }}>
                    <div className="flex flex-col items-center gap-1.5" style={{ color: "#cbd5e1" }}>
                        <ImageIcon />
                        <p className="text-[10px]">Image unavailable</p>
                    </div>
                </div>
            )}

            {/* Caption */}
            {post.caption && (
                <div className="px-4 py-3 border-b" style={{ borderColor: "#f1f5f9" }}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-4 h-4 rounded-md flex items-center justify-center"
                            style={{ background: "#f1f5f9", color: "#64748b" }}>
                            <TypeIcon />
                        </div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                            Caption
                        </p>
                    </div>
                    <p className="text-[12px] leading-relaxed whitespace-pre-wrap" style={{ color: "#334155" }}>
                        {post.caption}
                    </p>
                </div>
            )}

            {/* Meta row */}
            <div className="px-4 py-3 flex items-center flex-wrap gap-3">
                {/* Platform */}
                <div className="flex items-center gap-1.5 text-[10.5px] font-medium"
                    style={{ color: platform.color }}>
                    <span style={{ color: platform.color }}>{platform.icon}</span>
                    {platform.label}
                </div>

                <div className="w-px h-3" style={{ background: "#e2e8f0" }} />

                {/* Scheduled time */}
                <div className="flex items-center gap-1 text-[10.5px]" style={{ color: "#64748b" }}>
                    <CalendarIcon />
                    {formattedTime}
                </div>

                <div className="ml-auto">
                    <StatusBadge status={post.status} />
                </div>
            </div>
        </div>
    )
}

/* ─── content hint chips ──────────────────────────────────────── */
const HINTS = [
    "Announce a new product launch",
    "Share a customer success story",
    "Promote a weekend sale offer",
    "Share a motivational quote",
]

/* ─── main component ──────────────────────────────────────────── */
const SocialAgentWorkspace = ({ isOpen }: { isOpen: boolean }) => {
    const [platform, setPlatform] = useState("INSTAGRAM")
    const [content, setContent] = useState("")
    const [scheduledTime, setScheduledTime] = useState("")
    const [messages, setMessages] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState("")

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string>("")

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const clearImage = () => {
        setImageFile(null)
        setImagePreview("")
    }

    // default scheduled time = 1 hour from now
    useEffect(() => {
        if (!isOpen) return
        const now = new Date(Date.now() + 60 * 60 * 1000)
        const iso = now.toISOString().slice(0, 16)
        setScheduledTime(iso)
    }, [isOpen])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, isLoading])

    const autoResize = () => {
        const el = textareaRef.current
        if (el) {
            el.style.height = "auto"
            el.style.height = Math.min(el.scrollHeight, 140) + "px"
        }
    }

    const selectedPlatform = PLATFORMS.find(p => p.id === platform) ?? PLATFORMS[0]

    const STEPS = [
        "🧠 Analyzing content…",
        "🎨 Generating image…",
        "✍️  Crafting caption…",
        "📅 Scheduling post…",
    ]

    const handleSubmit = async () => {
        if (!content.trim() || !scheduledTime || isLoading) return

        const userMsg = content
        setMessages(prev => [...prev, {
            role: "user",
            text: userMsg,
            platform,
            scheduledTime,
        }])
        setContent("")
        if (textareaRef.current) textareaRef.current.style.height = "auto"
        setIsLoading(true)

        // animate through steps
        let stepIdx = 0
        setCurrentStep(STEPS[0])
        const stepTimer = setInterval(() => {
            stepIdx = (stepIdx + 1) % STEPS.length
            setCurrentStep(STEPS[stepIdx])
        }, 1800)

        try {
            const formData = new FormData()
            formData.append("platform", platform)
            formData.append("content", userMsg)
            formData.append("scheduledTime", new Date(scheduledTime).toISOString());

            if (imageFile) {
                formData.append("PostImage", imageFile)
            }

            const res: any = await runAutoSocialAgent(formData);
            /* const res: any = await runAutoSocialAgent({
                platform,
                content: userMsg,
                scheduledTime: new Date(scheduledTime).toISOString(),
            }) */

            clearInterval(stepTimer)
            setCurrentStep("")

            if (res?.success) {
                setMessages(prev => [...prev, {
                    role: "ai",
                    post: res.post,
                    agentSummary: res.agentSummary,
                    scheduledTime: res.scheduledTime,
                }])
                // clear image state after successful send
                setImageFile(null)
                setImagePreview("")
            } else {
                setMessages(prev => [...prev, {
                    role: "ai",
                    error: "The agent couldn't complete the request. Please try again.",
                }])
            }
        } catch {
            clearInterval(stepTimer)
            setCurrentStep("")
            setMessages(prev => [...prev, {
                role: "ai",
                error: "Something went wrong. Please try again.",
            }])
        }

        setIsLoading(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit() }
    }

    return (
        <div className="flex h-full overflow-hidden rounded-xl" style={{ background: "#f8fafc" }}>

            {/* ══ LEFT CONFIG PANEL ══ */}
            <div
                className="flex flex-col border-r flex-shrink-0"
                style={{ width: "240px", borderColor: "#e2e8f0", background: "#ffffff" }}
            >
                {/* Header */}
                <div className="px-4 pt-4 pb-3 border-b flex-shrink-0" style={{ borderColor: "#f1f5f9" }}>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                            style={{ background: "rgba(2,132,199,0.10)", color: "#0284c7" }}>
                            <SparkleIcon />
                        </div>
                        <span className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: "#64748b" }}>
                            Post Config
                        </span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5"
                    style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}>

                    {/* Platform selector */}
                    <div>
                        <p className="text-[9.5px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "#cbd5e1" }}>
                            Platform
                        </p>
                        <div className="flex flex-col gap-1.5">
                            {PLATFORMS.map(p => {
                                const active = platform === p.id
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => setPlatform(p.id)}
                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all duration-150"
                                        style={{
                                            background: active ? p.bg : "transparent",
                                            borderColor: active ? p.border : "#f1f5f9",
                                            color: active ? p.color : "#94a3b8",
                                        }}
                                        onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "#f8fafc" }}
                                        onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent" }}
                                    >
                                        <span style={{ color: active ? p.color : "#94a3b8" }}>{p.icon}</span>
                                        <span className="text-[11.5px] font-semibold">{p.label}</span>
                                        {active && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Scheduled time */}
                    <div>
                        <p className="text-[9.5px] font-bold uppercase tracking-widest mb-2" style={{ color: "#cbd5e1" }}>
                            Schedule Time
                        </p>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#94a3b8" }}>
                                <ClockIcon />
                            </div>
                            <input
                                type="datetime-local"
                                value={scheduledTime}
                                onChange={e => setScheduledTime(e.target.value)}
                                className="w-full pl-8 pr-3 py-2.5 rounded-xl text-[11px] outline-none border transition-all duration-150"
                                style={{ background: "#f8fafc", borderColor: "#e2e8f0", color: "#334155" }}
                                onFocus={e => {
                                    e.currentTarget.style.borderColor = "#7dd3fc"
                                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(125,211,252,0.12)"
                                }}
                                onBlur={e => {
                                    e.currentTarget.style.borderColor = "#e2e8f0"
                                    e.currentTarget.style.boxShadow = "none"
                                }}
                            />
                        </div>
                    </div>

                    {/* Hint prompts */}
                    <div>
                        <p className="text-[9.5px] font-bold uppercase tracking-widest mb-2" style={{ color: "#cbd5e1" }}>
                            Quick Ideas
                        </p>
                        <div className="flex flex-col gap-1.5">
                            {HINTS.map(h => (
                                <button
                                    key={h}
                                    onClick={() => {
                                        setContent(h)
                                        setTimeout(autoResize, 10)
                                    }}
                                    className="w-full text-left text-[11px] px-3 py-2 rounded-xl border transition-all duration-150"
                                    style={{ background: "#f8fafc", borderColor: "#e2e8f0", color: "#64748b" }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLElement).style.background = "#f0f9ff"
                                            ; (e.currentTarget as HTMLElement).style.borderColor = "#bae6fd"
                                            ; (e.currentTarget as HTMLElement).style.color = "#0284c7"
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLElement).style.background = "#f8fafc"
                                            ; (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0"
                                            ; (e.currentTarget as HTMLElement).style.color = "#64748b"
                                    }}
                                >
                                    {h}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ══ RIGHT WORKSPACE ══ */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Top bar */}
                <div
                    className="flex-shrink-0 px-5 py-3 border-b flex items-center gap-3"
                    style={{ background: "#ffffff", borderColor: "#e2e8f0" }}
                >
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10.5px] font-semibold"
                            style={{ background: selectedPlatform.bg, borderColor: selectedPlatform.border, color: selectedPlatform.color }}>
                            <span style={{ color: selectedPlatform.color }}>{selectedPlatform.icon}</span>
                            {selectedPlatform.label}
                        </div>
                    </div>
                    {scheduledTime && (
                        <div className="flex items-center gap-1.5 text-[10.5px]" style={{ color: "#94a3b8" }}>
                            <CalendarIcon />
                            {(() => {
                                try {
                                    return new Date(scheduledTime).toLocaleString("en-IN", {
                                        day: "2-digit", month: "short",
                                        hour: "2-digit", minute: "2-digit",
                                    })
                                } catch { return "" }
                            })()}
                        </div>
                    )}
                    {isLoading && currentStep && (
                        <div
                            className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono font-medium"
                            style={{ background: "rgba(56,189,248,0.08)", borderColor: "rgba(56,189,248,0.2)", color: "#0ea5e9" }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" style={{ animation: "sa-pulse 1s infinite" }} />
                            {currentStep}
                        </div>
                    )}
                </div>

                {/* Chat area */}
                <div
                    className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3"
                    style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}
                >
                    {/* Empty state */}
                    {messages.length === 0 && !isLoading && (
                        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                            <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                                style={{ background: "rgba(2,132,199,0.08)", color: "#0284c7" }}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                            </div>
                            <p className="text-[13px] font-semibold" style={{ color: "#334155" }}>
                                Social AI Agent ready
                            </p>
                            <p className="text-[11.5px] mt-1" style={{ color: "#94a3b8" }}>
                                Describe your post — the agent will generate an image, caption &amp; schedule it
                            </p>
                        </div>
                    )}

                    {/* Messages */}
                    {messages.map((m: any, i: number) => (
                        <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>

                            {/* USER bubble */}
                            {m.role === "user" && (
                                <div className="max-w-[68%] flex flex-col items-end gap-1.5">
                                    <div
                                        className="px-3.5 py-2.5 rounded-2xl rounded-tr-md text-[12px] leading-relaxed"
                                        style={{ background: "#0284c7", color: "#ffffff", boxShadow: "0 2px 8px rgba(2,132,199,0.25)" }}
                                    >
                                        {m.text}
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap justify-end">
                                        {(() => {
                                            const p = PLATFORMS.find(pl => pl.id === m.platform)
                                            return p ? (
                                                <span className="text-[9.5px] font-medium px-2 py-0.5 rounded-lg border"
                                                    style={{ background: p.bg, color: p.color, borderColor: p.border }}>
                                                    {p.label}
                                                </span>
                                            ) : null
                                        })()}
                                        {m.scheduledTime && (
                                            <span className="flex items-center gap-1 text-[9.5px]" style={{ color: "#94a3b8" }}>
                                                <ClockIcon />
                                                {(() => {
                                                    try {
                                                        return new Date(m.scheduledTime).toLocaleString("en-IN", {
                                                            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                                                        })
                                                    } catch { return m.scheduledTime }
                                                })()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* AI response */}
                            {m.role === "ai" && (
                                <div className="max-w-[92%] w-full">
                                    {m.error ? (
                                        <div
                                            className="flex items-center gap-2.5 px-4 py-3 rounded-2xl rounded-tl-md border"
                                            style={{ background: "#fef2f2", borderColor: "#fecaca" }}
                                        >
                                            <AlertIcon />
                                            <p className="text-[12px]" style={{ color: "#dc2626" }}>{m.error}</p>
                                        </div>
                                    ) : m.post ? (
                                        <PostResultCard
                                            post={m.post}
                                            agentSummary={m.agentSummary}
                                            scheduledTime={m.scheduledTime}
                                        />
                                    ) : null}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Typing / loading indicator */}
                    {isLoading && (
                        <div className="flex items-start gap-2">
                            <div
                                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: "rgba(2,132,199,0.10)", color: "#0284c7" }}
                            >
                                <SparkleIcon />
                            </div>
                            <div
                                className="px-4 py-3 rounded-2xl rounded-tl-md border"
                                style={{ background: "#ffffff", borderColor: "#e2e8f0" }}
                            >
                                <p className="text-[11.5px] mb-2" style={{ color: "#64748b" }}>
                                    {currentStep || "Processing…"}
                                </p>
                                <div className="flex items-center gap-1.5">
                                    {[0, 1, 2].map(j => (
                                        <span key={j} className="w-1.5 h-1.5 rounded-full"
                                            style={{
                                                background: "#0284c7", opacity: 0.6,
                                                animation: `sa-bounce 1.2s ${j * 0.2}s infinite`,
                                            }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div
                    className="flex-shrink-0 border-t px-4 pt-3 pb-4"
                    style={{ borderColor: "#e2e8f0", background: "#ffffff" }}
                >
                    <div
                        className="flex items-end gap-2 rounded-2xl px-3.5 pt-2.5 pb-2 border-[1.5px] transition-all duration-200"
                        style={{ background: "#ffffff", borderColor: "#e2e8f0" }}
                        onFocusCapture={e => {
                            const w = e.currentTarget as HTMLElement
                            w.style.borderColor = "#7dd3fc"
                            w.style.boxShadow = "0 0 0 3px rgba(125,211,252,0.12)"
                        }}
                        onBlurCapture={e => {
                            const w = e.currentTarget as HTMLElement
                            w.style.borderColor = "#e2e8f0"
                            w.style.boxShadow = "none"
                        }}
                    >
                        <div className="flex-1">
                            <textarea
                                ref={textareaRef}
                                rows={1}
                                value={content}
                                onChange={e => { setContent(e.target.value); autoResize() }}
                                onKeyDown={handleKeyDown}
                                placeholder="Describe what you want to post…"
                                disabled={isLoading}
                                className="w-full resize-none bg-transparent outline-none leading-relaxed disabled:opacity-40"
                                style={{ fontSize: "12.5px", color: "#0f172a", minHeight: "24px" }}
                            />
                            <div
                                className="flex items-center justify-between pt-1.5 mt-1 border-t"
                                style={{ borderColor: "#f1f5f9" }}
                            >
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {/* platform chip */}
                                    <button
                                        type="button"
                                        className="flex items-center gap-1 text-[9.5px] font-semibold px-2 py-0.5 rounded-lg border transition-all"
                                        style={{
                                            background: selectedPlatform.bg,
                                            borderColor: selectedPlatform.border,
                                            color: selectedPlatform.color,
                                        }}
                                    >
                                        <span style={{ color: selectedPlatform.color }}>{selectedPlatform.icon}</span>
                                        {selectedPlatform.label}
                                    </button>
                                    {/* clear */}
                                    {content && (
                                        <button
                                            type="button"
                                            onClick={() => { setContent(""); if (textareaRef.current) textareaRef.current.style.height = "auto" }}
                                            className="flex items-center gap-0.5 text-[9.5px] transition-colors"
                                            style={{ color: "#cbd5e1" }}
                                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#f87171"}
                                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#cbd5e1"}
                                        >
                                            <ClearIcon /> Clear
                                        </button>
                                    )}
                                    {/* ── image upload ── */}
                                    <>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageSelect}
                                        />
                                        {imagePreview ? (
                                            <div className="flex items-center gap-1">
                                                <img
                                                    src={imagePreview}
                                                    alt="upload preview"
                                                    className="rounded-lg object-cover border flex-shrink-0"
                                                    style={{ width: 32, height: 32, borderColor: "#e2e8f0" }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={clearImage}
                                                    className="flex items-center"
                                                    style={{ color: "#cbd5e1" }}
                                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#f87171"}
                                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#cbd5e1"}
                                                    title="Remove image"
                                                >
                                                    <ClearIcon />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex items-center gap-0.5 text-[9.5px] transition-colors"
                                                style={{ color: "#cbd5e1" }}
                                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#0284c7"}
                                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#cbd5e1"}
                                                title="Attach image (optional)"
                                            >
                                                <ImageIcon /> Image
                                            </button>
                                        )}
                                    </>
                                </div>
                                <span className="text-[9px] font-mono" style={{ color: "#cbd5e1" }}>↵ send</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || !content.trim() || !scheduledTime}
                            className="w-8 h-8 mb-1 rounded-xl flex items-center justify-center transition-all duration-150 flex-shrink-0 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{ background: "#0284c7", boxShadow: "0 2px 8px rgba(2,132,199,0.3)" }}
                            onMouseEnter={e => { if (!isLoading && content.trim()) (e.currentTarget as HTMLElement).style.background = "#0369a1" }}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#0284c7"}
                        >
                            {isLoading
                                ? <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent"
                                    style={{ animation: "sa-spin 0.8s linear infinite" }} />
                                : <SendIcon />
                            }
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes sa-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%            { transform: translateY(-4px); }
        }
        @keyframes sa-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes sa-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
        </div>
    )
}

export default SocialAgentWorkspace