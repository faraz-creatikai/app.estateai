"use client"
import React, { useEffect, useRef, useState } from 'react'
import {
    addVideoProjectPhoto,
    generateVideoProjectScript,
    renderVideoProject,
} from '@/store/aiagent/aiagent' // TODO: adjust to wherever you place videoproject.ts

/* ── media base url — backend and frontend are different origins, so
   relative paths like "/uploads/xyz.jpg" returned by the API need a prefix.
   Set NEXT_PUBLIC_API_BASE_URL to your backend origin (e.g. http://localhost:5000). ── */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ''

const resolveMediaUrl = (url?: string) => {
    if (!url) return ''

    let finalUrl = url;

    // If it's a relative path, prepend the API_BASE
    if (!/^https?:\/\//.test(finalUrl) && !finalUrl.startsWith('blob:')) {
        finalUrl = `${API_BASE}${finalUrl}`;
    }

    // 🔥 THE FIX: If the frontend is secure (HTTPS), force the media URL to be HTTPS too
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && finalUrl.startsWith('http://')) {
        finalUrl = finalUrl.replace(/^http:\/\//i, 'https://');
    }

    return finalUrl;
}

/* ── tiny icon components (same visual language as ScriptAgentWorkspace) ── */
const SparkleIcon = () => (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
)
const CheckIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <polyline points="20 6 9 17 4 12" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)
const CloseIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
)
const UploadCloudIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M7 16a4 4 0 01-1-7.87A5.5 5.5 0 0116.9 6.1 4.5 4.5 0 0118 15" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 12v9M9 15l3-3 3 3" />
    </svg>
)
const ArrowUpIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19V5M5 12l7-7 7 7" />
    </svg>
)
const ArrowDownIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12l7 7 7-7" />
    </svg>
)
const TrashIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 7l-.87 12.14A2 2 0 0116.14 21H7.86a2 2 0 01-2-1.86L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
    </svg>
)
const HomeIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h4a1 1 0 001-1V10" />
    </svg>
)
const MicIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 15a3 3 0 003-3V6a3 3 0 00-6 0v6a3 3 0 003 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0M12 18v3" />
    </svg>
)
const WandIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8L19 13M17.8 6.2L19 5M3 21l9-9M12.2 6.2L11 5" />
    </svg>
)
const PlayIcon = () => (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
    </svg>
)
const DownloadIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
    </svg>
)
const RefreshIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 4v5h.58M20 20v-5h-.58M4.58 9a8 8 0 0113.9-3.36L20 9M19.42 15a8 8 0 01-13.9 3.36L4 15" />
    </svg>
)
const GripIcon = () => (
    <svg className="w-3.5 h-4" viewBox="0 0 16 24" fill="currentColor">
        <circle cx="5" cy="5" r="1.6" /><circle cx="5" cy="12" r="1.6" /><circle cx="5" cy="19" r="1.6" />
        <circle cx="11" cy="5" r="1.6" /><circle cx="11" cy="12" r="1.6" /><circle cx="11" cy="19" r="1.6" />
    </svg>
)
const ChevronDownIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
    </svg>
)
const TagIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M20.59 13.41L11 3.83A2 2 0 009.59 3.24L4 3a1 1 0 00-1 1l.24 5.59a2 2 0 00.58 1.41l9.58 9.58a2 2 0 002.83 0l4.36-4.36a2 2 0 000-2.81z" />
        <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
)

/* ── local types ── */
type DraftPhoto = { id: string; file: File; previewUrl: string; label: string }
type UploadedPhoto = { fileName: string; originalName: string; url: string; label: string }
type Mode = 'hinglish' | 'hindi' | 'english'
type VoiceoverMethod = 'ai_voice' | 'uploaded_voice'
type Step = 1 | 2 | 3 | 4 | 5
type AIVoice = 'female_1' | 'male_1' | 'female_2' | 'male_2'
type ScriptMeta = { attempts?: number; mode?: string }
type AspectRatio = 'portrait' | 'square' | 'landscape'


const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: 1, label: 'Photos', icon: <UploadCloudIcon /> },
    { id: 2, label: 'Property', icon: <HomeIcon /> },
    { id: 3, label: 'Script', icon: <SparkleIcon /> },
    { id: 4, label: 'Voice', icon: <MicIcon /> },
    { id: 5, label: 'Preview', icon: <PlayIcon /> },
]

const VOICE_OPTIONS: { id: AIVoice; name: string; tag: string; avatar: string }[] = [
    { id: 'female_1', name: 'Priya', tag: 'Clear & professional', avatar: '👩' },
    { id: 'male_1', name: 'Rahul', tag: 'Friendly & energetic', avatar: '👨' },
    { id: 'female_2', name: 'Aarti', tag: 'Warm & inviting', avatar: '👩‍🦱' },
    { id: 'male_2', name: 'Vikram', tag: 'Deep & authoritative', avatar: '🧔' },
]

/* ── small reusable bits ── */
const Badge = ({ children, tone = 'blue' }: { children: React.ReactNode; tone?: 'blue' | 'slate' | 'green' }) => {
    const styles = {
        blue: { background: 'rgba(0,102,204,0.1)', color: '#0066cc' },
        slate: { background: '#f1f5f9', color: '#64748b' },
        green: { background: 'rgba(5,150,105,0.1)', color: '#059669' },
    }[tone]
    return (
        <span className="px-2 py-[3px] rounded-full text-[9.5px] font-bold whitespace-nowrap" style={styles}>
            {children}
        </span>
    )
}

/* ── step indicator (clickable on completed steps, animated fill) ── */
const StepIndicator = ({ current, onJump }: { current: Step; onJump: (s: Step) => void }) => (
    <div className="flex items-center gap-1 sm:gap-1.5 px-4 sm:px-5 py-3 border-b flex-shrink-0 overflow-x-auto"
        style={{ borderColor: '#e2e8f0', background: '#ffffff' }}>
        {STEPS.map((s, i) => {
            const isDone = s.id < current
            const isActive = s.id === current
            const clickable = isDone
            return (
                <React.Fragment key={s.id}>
                    <button
                        type="button"
                        disabled={!clickable}
                        onClick={() => clickable && onJump(s.id)}
                        className="flex items-center cursor-pointer gap-1.5 flex-shrink-0 rounded-lg px-1 py-0.5 -mx-1 transition-all"
                        style={{ cursor: clickable ? 'pointer' : 'default' }}
                        onMouseEnter={e => { if (clickable) (e.currentTarget as HTMLElement).style.background = '#f0f7ff' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                        <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[9.5px] font-bold flex-shrink-0 transition-all duration-300"
                            style={isDone
                                ? { background: '#0066cc', color: '#ffffff' }
                                : isActive
                                    ? { background: 'rgba(0,102,204,0.12)', color: '#0066cc', border: '1.5px solid #0066cc', boxShadow: '0 0 0 3px rgba(0,102,204,0.08)' }
                                    : { background: '#f1f5f9', color: '#94a3b8' }
                            }>
                            {isDone ? <CheckIcon /> : s.icon}
                        </div>
                        <span className="text-[10.5px] font-semibold hidden sm:inline" style={{ color: isActive ? '#0066cc' : isDone ? '#334155' : '#94a3b8' }}>
                            {s.label}
                        </span>
                    </button>
                    {i < STEPS.length - 1 && (
                        <div className="w-4 sm:w-6 h-px mx-0.5 sm:mx-1 flex-shrink-0 transition-all duration-500" style={{ background: s.id < current ? '#0066cc' : '#e2e8f0' }} />
                    )}
                </React.Fragment>
            )
        })}
    </div>
)

/* ── error banner ── */
const ErrorBanner = ({ message, onDismiss }: { message: string; onDismiss: () => void }) => (
    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border mb-4"
        style={{ background: '#fff1f2', borderColor: '#fecdd3', color: '#e11d48', animation: 'vp-slide-down 0.2s ease-out' }}>
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
            <path strokeLinecap="round" strokeWidth={1.5} d="M12 8v4M12 16h.01" />
        </svg>
        <p className="text-[11.5px] flex-1">{message}</p>
        <button onClick={onDismiss} style={{ color: '#e11d48', cursor: "pointer" }} aria-label="Dismiss error"><CloseIcon /></button>
    </div>
)

const PrimaryButton = ({ children, onClick, disabled, loading }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; loading?: boolean }) => (
    <button
        onClick={onClick}
        disabled={disabled || loading}
        className="flex items-center cursor-pointer justify-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: '#0066cc', color: '#ffffff', boxShadow: '0 2px 8px rgba(0,102,204,0.25)' }}
        onMouseEnter={e => { if (!disabled && !loading) (e.currentTarget as HTMLElement).style.background = '#005bb8' }}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#0066cc'}>
        {loading && <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent" style={{ animation: 'vp-spin 0.8s linear infinite' }} />}
        {children}
    </button>
)

const SecondaryButton = ({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="flex items-center cursor-pointer justify-center gap-2 px-4 py-2.5 rounded-xl text-[11.5px] font-semibold border transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#475569' }}
        onMouseEnter={e => { if (!disabled) { (e.currentTarget as HTMLElement).style.background = '#f1f5f9' } }}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}>
        {children}
    </button>
)

/* ── custom dropdown for AI voice selection ── */
const VoiceDropdown = ({ value, onChange }: { value: AIVoice; onChange: (v: AIVoice) => void }) => {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
        document.addEventListener('mousedown', onClickOutside)
        document.addEventListener('keydown', onEsc)
        return () => {
            document.removeEventListener('mousedown', onClickOutside)
            document.removeEventListener('keydown', onEsc)
        }
    }, [])

    const selected = VOICE_OPTIONS.find(v => v.id === value) ?? VOICE_OPTIONS[0]

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className="w-full flex cursor-pointer items-center gap-3 px-3.5 py-2.5 rounded-xl border-2 text-left transition-all"
                style={{ borderColor: open ? '#0066cc' : '#e2e8f0', background: '#ffffff', boxShadow: open ? '0 0 0 3px rgba(0,102,204,0.08)' : 'none' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[16px] flex-shrink-0" style={{ background: 'rgba(0,102,204,0.1)' }}>
                    {selected.avatar}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold" style={{ color: '#1e293b' }}>{selected.name}</p>
                    <p className="text-[10px] truncate" style={{ color: '#94a3b8' }}>{selected.tag}</p>
                </div>
                <div style={{ color: '#94a3b8', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <ChevronDownIcon />
                </div>
            </button>

            {open && (
                <div role="listbox" className="absolute left-0 right-0 mt-1.5 rounded-xl border overflow-hidden z-30"
                    style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 16px 36px rgba(15,23,42,0.14)', animation: 'vp-dropdown 0.15s ease-out', transformOrigin: 'top' }}>
                    {VOICE_OPTIONS.map(v => {
                        const isSelected = v.id === value
                        return (
                            <button
                                key={v.id}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => { onChange(v.id); setOpen(false) }}
                                className="w-full cursor-pointer flex items-center gap-3 px-3.5 py-2.5 transition-all text-left"
                                style={{ background: isSelected ? '#f0f7ff' : '#ffffff' }}
                                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#f8fafc' }}
                                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#ffffff' }}>
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[16px] flex-shrink-0" style={{ background: 'rgba(0,102,204,0.1)' }}>
                                    {v.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-bold" style={{ color: '#1e293b' }}>{v.name}</p>
                                    <p className="text-[10px] truncate" style={{ color: '#94a3b8' }}>{v.tag}</p>
                                </div>
                                {isSelected && <div style={{ color: '#0066cc' }}><CheckIcon /></div>}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

/* ─────────────────────────────────────────────── */
const VideoProjectWorkspace = ({ isOpen }: { isOpen: boolean }) => {
    const [step, setStep] = useState<Step>(1)
    const [error, setError] = useState<string | null>(null)

    // Step 1 — photos, arranged before upload; uploadedPhotos after upload
    const [draftPhotos, setDraftPhotos] = useState<DraftPhoto[]>([])
    const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [dragDepth, setDragDepth] = useState(0) // file-drop-zone drag counter
    const [draggedId, setDraggedId] = useState<string | null>(null) // photo being reordered
    const [dragOverId, setDragOverId] = useState<string | null>(null)

    // Step 2 — property details + mode
    const [propertyDetails, setPropertyDetails] = useState('')
    const [mode, setMode] = useState<Mode>('hinglish')

    // Step 3 — generated / edited script, one line per photo
    const [scriptLines, setScriptLines] = useState<string[]>([])
    const [scriptMeta, setScriptMeta] = useState<ScriptMeta | null>(null)
    const [isGeneratingScript, setIsGeneratingScript] = useState(false)

    // Step 4 — voiceover method + render
    const [voiceoverMethod, setVoiceoverMethod] = useState<VoiceoverMethod>('ai_voice')
    const [voiceFile, setVoiceFile] = useState<File | null>(null)
    const [isRendering, setIsRendering] = useState(false)
    const voiceInputRef = useRef<HTMLInputElement>(null)
    const [aiVoice, setAiVoice] = useState<AIVoice>('female_1')
    const [voiceFileDragDepth, setVoiceFileDragDepth] = useState(0)
    const [isDownloading, setIsDownloading] = useState(false)
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
    const [isRecordingConfirmed, setIsRecordingConfirmed] = useState(false)
const [videoAspectRatio, setVideoAspectRatio] = useState<AspectRatio>('portrait')

const CSS_RATIO: Record<AspectRatio, string> = {
    portrait: '9 / 16',
    square: '1 / 1',
    landscape: '16 / 9',
}
    // ── new state, near your other Step 4 state ──
    const [recordMethod, setRecordMethod] = useState<'file' | 'live'>('file')
    const [isRecording, setIsRecording] = useState(false)
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
    const [recordedPreviewUrl, setRecordedPreviewUrl] = useState<string | null>(null)
    const [recordingSeconds, setRecordingSeconds] = useState(0)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const streamRef = useRef<MediaStream | null>(null)
    const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // cleanup on unmount, alongside your existing draftPhotos revoke effect
    useEffect(() => {
        return () => {
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
            streamRef.current?.getTracks().forEach(t => t.stop())
            if (recordedPreviewUrl) URL.revokeObjectURL(recordedPreviewUrl)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const startRecording = async () => {
        setError(null)
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            streamRef.current = stream
            audioChunksRef.current = []

            const mimeType = MediaRecorder.isTypeSupported('audio/webm')
                ? 'audio/webm'
                : MediaRecorder.isTypeSupported('audio/mp4')
                    ? 'audio/mp4'
                    : ''
            const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data)
            }
            recorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' })
                setRecordedBlob(blob)
                setRecordedPreviewUrl(URL.createObjectURL(blob))
                stream.getTracks().forEach(t => t.stop())
                streamRef.current = null
            }

            recorder.start()
            mediaRecorderRef.current = recorder
            setIsRecording(true)
            setRecordingSeconds(0)
            recordingTimerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000)
        } catch {
            setError('Microphone access was denied or unavailable. Please allow mic access, or upload a file instead.')
        }
    }

    const stopRecording = () => {
        mediaRecorderRef.current?.stop()
        setIsRecording(false)
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    }

      const discardRecording = () => {
        if (recordedPreviewUrl) URL.revokeObjectURL(recordedPreviewUrl)
        setRecordedBlob(null)
        setRecordedPreviewUrl(null)
        setRecordingSeconds(0)
        setIsRecordingConfirmed(false)
    }

    const confirmRecordedVoice = () => {
        if (!recordedBlob) return
        const type = recordedBlob.type || ''
        const ext = type.includes('mp4') ? 'm4a'
            : type.includes('ogg') ? 'ogg'
            : type.includes('wav') ? 'wav'
            : 'webm'
        const file = new File([recordedBlob], `voice-recording-${Date.now()}.${ext}`, { type: recordedBlob.type })
        setVoiceFile(file)
        setIsRecordingConfirmed(true) // ← keep recordedBlob/previewUrl alive, just mark as confirmed
    }

    // Used by the "Re-record" button in BOTH the preview state and the
    // confirmed state. If a recording was already confirmed (i.e. is
    // currently set as voiceFile), clear that too — otherwise re-recording
    // would silently leave the old attached voice in place.
    const handleReRecordLive = () => {
        if (isRecordingConfirmed) setVoiceFile(null)
        discardRecording()
    }

    const formatSeconds = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

    // Step 5 — final result
    const [videoUrl, setVideoUrl] = useState<string | null>(null)

    useEffect(() => {
        return () => {
            draftPhotos.forEach(p => URL.revokeObjectURL(p.previewUrl))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (!isOpen) return null

    /* ── step 1: photo selection + ordering ── */
    const handleFilesSelected = (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return
        const files = Array.from(fileList).filter(f => f.type.startsWith('image/'))
        const newDrafts: DraftPhoto[] = files.map((file, i) => ({
            id: `${Date.now()}-${i}-${file.name}`,
            file,
            previewUrl: URL.createObjectURL(file),
            label: '',
        }))
        setDraftPhotos(prev => [...prev, ...newDrafts])
        setError(null)
    }

    const removeDraftPhoto = (id: string) => {
        setDraftPhotos(prev => {
            const target = prev.find(p => p.id === id)
            if (target) URL.revokeObjectURL(target.previewUrl)
            return prev.filter(p => p.id !== id)
        })
    }

    const clearAllDraftPhotos = () => {
        draftPhotos.forEach(p => URL.revokeObjectURL(p.previewUrl))
        setDraftPhotos([])
    }

    const moveDraftPhoto = (index: number, direction: -1 | 1) => {
        setDraftPhotos(prev => {
            const next = [...prev]
            const target = index + direction
            if (target < 0 || target >= next.length) return prev
                ;[next[index], next[target]] = [next[target], next[index]]
            return next
        })
    }

    const updateDraftLabel = (id: string, label: string) => {
        setDraftPhotos(prev => prev.map(p => (p.id === id ? { ...p, label } : p)))
    }

    /* drag-to-reorder handlers (mouse-driven, native HTML5 DnD) */
    const handlePhotoDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        setDraggedId(id)
        e.dataTransfer.effectAllowed = 'move'
        try { e.dataTransfer.setData('text/plain', id) } catch { /* noop */ }
    }
    const handlePhotoDragOver = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        e.preventDefault()
        if (id !== dragOverId) setDragOverId(id)
    }
    const handlePhotoDragEnd = () => {
        setDraggedId(null)
        setDragOverId(null)
    }
    const handlePhotoDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
        e.preventDefault()
        if (!draggedId || draggedId === targetId) { handlePhotoDragEnd(); return }
        setDraftPhotos(prev => {
            const next = [...prev]
            const fromIndex = next.findIndex(p => p.id === draggedId)
            const toIndex = next.findIndex(p => p.id === targetId)
            if (fromIndex === -1 || toIndex === -1) return prev
            const [moved] = next.splice(fromIndex, 1)
            next.splice(toIndex, 0, moved)
            return next
        })
        handlePhotoDragEnd()
    }

    /* drag-drop file upload onto the dropzone */
    const handleDropzoneDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragDepth(d => d + 1) }
    const handleDropzoneDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault() }
    const handleDropzoneDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragDepth(d => Math.max(0, d - 1)) }
    const handleDropzoneDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setDragDepth(0)
        handleFilesSelected(e.dataTransfer.files)
    }

    const handleUploadPhotos = async () => {
        if (draftPhotos.length === 0) { setError('Upload at least one photo to continue'); return }
        if (draftPhotos.some(p => !p.label.trim())) { setError('Give every photo a short area label (e.g. "hall", "kitchen") before continuing'); return }

        setIsUploading(true)
        setError(null)
        try {
            const formData = new FormData()
            draftPhotos.forEach(p => formData.append('photos', p.file))

            const res: any = await addVideoProjectPhoto(formData)
            if (!res?.photos || !Array.isArray(res.photos) || res.photos.length !== draftPhotos.length) {
                throw new Error('Upload failed')
            }

            // Server preserves upload order, so index-match back to our labels.
            const combined: UploadedPhoto[] = res.photos.map((serverPhoto: any, i: number) => ({
                fileName: serverPhoto.fileName,
                originalName: serverPhoto.originalName,
                url: serverPhoto.url,
                label: draftPhotos[i].label.trim(),
            }))

            setUploadedPhotos(combined)
            setStep(2)
        } catch {
            setError('Could not upload the photos. Please try again.')
        } finally {
            setIsUploading(false)
        }
    }

    /* ── step 2 → 3: generate script ── */
    const handleGenerateScript = async () => {
        if (!propertyDetails.trim()) { setError('Add a short property description first'); return }

        setIsGeneratingScript(true)
        setError(null)
        try {
            const sequenceText = uploadedPhotos.map(p => p.label).join('\n')
            const res: any = await generateVideoProjectScript({
                propertyDetails,
                sequenceText,
                totalPhotos: uploadedPhotos.length,
                mode,
            })

            if (!res?.voiceovers || !Array.isArray(res.voiceovers)) {
                throw new Error('Script generation failed')
            }

            setScriptLines(res.voiceovers)
            setScriptMeta(res.metadata ?? null)
            setStep(3)
        } catch {
            setError('Could not generate the voice script. Please try again.')
        } finally {
            setIsGeneratingScript(false)
        }
    }

    const handleRegenerateScript = async () => {
        setIsGeneratingScript(true)
        setError(null)
        try {
            const sequenceText = uploadedPhotos.map(p => p.label).join('\n')
            const res: any = await generateVideoProjectScript({
                propertyDetails,
                sequenceText,
                totalPhotos: uploadedPhotos.length,
                mode,
            })
            if (!res?.voiceovers) throw new Error('Script generation failed')
            setScriptLines(res.voiceovers)
            setScriptMeta(res.metadata ?? null)
        } catch {
            setError('Could not regenerate the script. Please try again.')
        } finally {
            setIsGeneratingScript(false)
        }
    }

    const updateScriptLine = (index: number, value: string) => {
        setScriptLines(prev => prev.map((line, i) => (i === index ? value : line)))
    }

    const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length

    /* ── step 4: voice + render ── */
    const handleVoiceFileDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setVoiceFileDragDepth(d => d + 1) }
    const handleVoiceFileDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault() }
    const handleVoiceFileDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setVoiceFileDragDepth(d => Math.max(0, d - 1)) }
    const handleVoiceFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setVoiceFileDragDepth(0)
        const file = e.dataTransfer.files?.[0]
        if (file) setVoiceFile(file)
    }

    const handleRender = async () => {
        if (scriptLines.length !== uploadedPhotos.length || scriptLines.some(l => !l.trim())) {
            setError('Every photo needs a non-empty script line before rendering')
            return
        }
        if (voiceoverMethod === 'uploaded_voice' && !voiceFile) {
            setError('Upload your recorded voiceover, or switch to AI voice')
            return
        }

        setIsRendering(true)
        setError(null)
        try {
            const formData = new FormData()
            formData.append('mode', mode)
            formData.append('voiceoverMethod', voiceoverMethod)
            formData.append('aiVoice', aiVoice)
            formData.append('photoFileNames', JSON.stringify(uploadedPhotos.map(p => p.fileName)))
            formData.append('scriptContent', JSON.stringify(scriptLines))
            if (voiceoverMethod === 'uploaded_voice' && voiceFile) {
                formData.append('uploadedVoiceover', voiceFile)
            }

            const res: any = await renderVideoProject(formData)
            if (!res?.videoUrl) throw new Error('Render failed')

            setVideoUrl(res.videoUrl)
            setThumbnailUrl(res.thumbnailUrl ?? null)
            setVideoAspectRatio(res.aspectRatio ?? 'portrait') 
            setStep(5)
        } catch {
            setError('Could not render the video. Please try again.')
        } finally {
            setIsRendering(false)
        }
    }

    const handleStartOver = () => {
        draftPhotos.forEach(p => URL.revokeObjectURL(p.previewUrl))
        setDraftPhotos([])
        setUploadedPhotos([])
        setPropertyDetails('')
        setMode('hinglish')
        setScriptLines([])
        setScriptMeta(null)
        setVoiceoverMethod('ai_voice')
        setVoiceFile(null)
        setVideoUrl(null)
        setError(null)
        setRecordMethod('file')
        discardRecording()
        setStep(1)
    }

    const totalPhotos = uploadedPhotos.length || draftPhotos.length
    const isFileDragOver = dragDepth > 0
    const isVoiceFileDragOver = voiceFileDragDepth > 0

    const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault(); // Stop the browser from opening the URL
        if (isDownloading || !videoUrl) return;

        setIsDownloading(true);
        try {
            const url = resolveMediaUrl(videoUrl);
            const response = await fetch(url);

            if (!response.ok) throw new Error("Failed to fetch video");

            // Convert the video to a local blob
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            // Create a temporary hidden link and click it
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = url.split('/').pop() || "project-video.mp4"; // Extracts filename from URL
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error("Download error:", err);
            setError("Failed to download the video. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden rounded-xl relative" style={{ background: '#f8fafc' }}>
            <StepIndicator current={step} onJump={setStep} />

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
                <div className="max-w-[720px] mx-auto" key={step} style={{ animation: 'vp-fade-in 0.25s ease-out' }}>
                    {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

                    {/* ═══ STEP 1 — Upload & arrange photos ═══ */}
                    {step === 1 && (
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,102,204,0.1)', color: '#0066cc' }}>
                                        <UploadCloudIcon />
                                    </div>
                                    <p className="text-[13.5px] font-bold" style={{ color: '#1e293b' }}>Upload property photos</p>
                                </div>
                                {draftPhotos.length > 0 && <Badge>{draftPhotos.length} photo{draftPhotos.length === 1 ? '' : 's'}</Badge>}
                            </div>
                            <p className="text-[11.5px] mb-4" style={{ color: '#94a3b8' }}>
                                Add every photo for the video, label the area it shows, then drag each row by its handle to set the order they appear in.
                            </p>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                className="hidden"
                                onChange={e => handleFilesSelected(e.target.files)}
                            />
                            <div
                                onDragEnter={handleDropzoneDragEnter}
                                onDragOver={handleDropzoneDragOver}
                                onDragLeave={handleDropzoneDragLeave}
                                onDrop={handleDropzoneDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-2xl border-2 border-dashed transition-all mb-4 cursor-pointer"
                                style={isFileDragOver
                                    ? { borderColor: '#0066cc', background: '#eaf3ff', color: '#0066cc', boxShadow: '0 0 0 4px rgba(0,102,204,0.08)' }
                                    : { borderColor: '#cbd5e1', background: '#ffffff', color: '#94a3b8' }}
                                onMouseEnter={e => { if (!isFileDragOver) { (e.currentTarget as HTMLElement).style.borderColor = '#99c2ff'; (e.currentTarget as HTMLElement).style.background = '#f0f7ff' } }}
                                onMouseLeave={e => { if (!isFileDragOver) { (e.currentTarget as HTMLElement).style.borderColor = '#cbd5e1'; (e.currentTarget as HTMLElement).style.background = '#ffffff' } }}>
                                <div style={{ transform: isFileDragOver ? 'translateY(-2px) scale(1.08)' : 'none', transition: 'transform 0.15s' }}>
                                    <UploadCloudIcon />
                                </div>
                                <span className="text-[11.5px] font-semibold" style={{ color: isFileDragOver ? '#0066cc' : '#475569' }}>
                                    {isFileDragOver ? 'Drop to add photos' : 'Click or drag photos here'}
                                </span>
                                <span className="text-[10px]" style={{ color: isFileDragOver ? '#0066cc' : '#cbd5e1' }}>JPG, PNG or WEBP · multiple files supported</span>
                            </div>

                            {draftPhotos.length > 0 && (
                                <div className="mb-2 flex items-center justify-between">
                                    <p className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Drag rows to reorder</p>
                                    <button onClick={clearAllDraftPhotos} className="text-[10px] font-semibold cursor-pointer" style={{ color: '#e11d48' }}>
                                        Clear all
                                    </button>
                                </div>
                            )}

                            {draftPhotos.length > 0 && (
                                <div className="flex flex-col gap-2 mb-5">
                                    {draftPhotos.map((photo, index) => {
                                        const isDragging = draggedId === photo.id
                                        const isOver = dragOverId === photo.id && draggedId !== photo.id
                                        return (
                                            <div
                                                key={photo.id}
                                                draggable
                                                onDragStart={e => handlePhotoDragStart(e, photo.id)}
                                                onDragOver={e => handlePhotoDragOver(e, photo.id)}
                                                onDrop={e => handlePhotoDrop(e, photo.id)}
                                                onDragEnd={handlePhotoDragEnd}
                                                className="group flex items-center gap-2 p-2.5 rounded-xl border transition-all"
                                                style={{
                                                    background: '#ffffff',
                                                    borderColor: isOver ? '#0066cc' : '#e2e8f0',
                                                    borderTopWidth: isOver ? '2px' : '1px',
                                                    opacity: isDragging ? 0.4 : 1,
                                                    transform: isDragging ? 'scale(1.01)' : 'none',
                                                    boxShadow: isDragging ? '0 8px 20px rgba(15,23,42,0.12)' : 'none',
                                                }}>
                                                <div className="flex items-center justify-center flex-shrink-0 cursor-grab active:cursor-grabbing" style={{ color: '#cbd5e1' }} aria-label="Drag to reorder">
                                                    <GripIcon />
                                                </div>
                                                <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: '#f1f5f9', color: '#64748b' }}>
                                                    {index + 1}
                                                </div>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={photo.previewUrl} alt="" draggable={false} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" style={{ border: '1px solid #f1f5f9' }} />
                                                <div className="flex-1 min-w-0 relative">
                                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#cbd5e1' }}>
                                                        <TagIcon />
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={photo.label}
                                                        onChange={e => updateDraftLabel(photo.id, e.target.value)}
                                                        placeholder="e.g. hall, kitchen, master bedroom…"
                                                        className="w-full min-w-0 rounded-lg border pl-7 pr-2.5 py-1.5 text-[11px] outline-none"
                                                        style={{ borderColor: '#e2e8f0', background: '#f8fafc', color: '#334155' }}
                                                        onFocus={e => (e.currentTarget.style.borderColor = '#99c2ff')}
                                                        onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <button onClick={() => moveDraftPhoto(index, -1)} disabled={index === 0}
                                                        className="w-6 h-6 rounded-md cursor-pointer flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
                                                        style={{ background: '#f8fafc', color: '#64748b' }} aria-label="Move up">
                                                        <ArrowUpIcon />
                                                    </button>
                                                    <button onClick={() => moveDraftPhoto(index, 1)} disabled={index === draftPhotos.length - 1}
                                                        className="w-6 h-6 rounded-md flex cursor-pointer items-center justify-center transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
                                                        style={{ background: '#f8fafc', color: '#64748b' }} aria-label="Move down">
                                                        <ArrowDownIcon />
                                                    </button>
                                                    <button onClick={() => removeDraftPhoto(photo.id)}
                                                        className="w-6 h-6 rounded-md cursor-pointer flex items-center justify-center transition-all"
                                                        style={{ background: '#fff1f2', color: '#e11d48' }} aria-label="Remove photo">
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            <div className="flex justify-end">
                                <PrimaryButton onClick={handleUploadPhotos} disabled={draftPhotos.length === 0} loading={isUploading}>
                                    {isUploading ? 'Uploading…' : `Continue with ${draftPhotos.length} photo${draftPhotos.length === 1 ? '' : 's'}`}
                                </PrimaryButton>
                            </div>
                        </div>
                    )}

                    {/* ═══ STEP 2 — Property details ═══ */}
                    {step === 2 && (
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,102,204,0.1)', color: '#0066cc' }}>
                                    <HomeIcon />
                                </div>
                                <p className="text-[13.5px] font-bold" style={{ color: '#1e293b' }}>Property details</p>
                            </div>
                            <p className="text-[11.5px] mb-4" style={{ color: '#94a3b8' }}>
                                Describe the property — the AI uses this plus your {totalPhotos} photo labels to write the voiceover.
                            </p>

                            {/* photo order preview strip */}
                            <div className="relative mb-4">
                                <div className="flex items-center gap-2 overflow-x-auto pb-3" style={{ scrollbarWidth: 'thin' }}>
                                    {uploadedPhotos.map((p, i) => (
                                        <div key={p.fileName} className="flex-shrink-0 w-20">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={resolveMediaUrl(p.url)} alt="" className="w-20 h-20 rounded-lg object-cover" style={{ border: '1px solid #e2e8f0' }} />
                                            <p className="text-[9px] font-semibold text-center mt-1 truncate" style={{ color: '#64748b' }}>{i + 1}. {p.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative mb-4">
                                <textarea
                                    value={propertyDetails}
                                    onChange={e => setPropertyDetails(e.target.value)}
                                    rows={5}
                                    placeholder="e.g. 3 BHK flat for rent in Ganesh Nagar, Mansarovar, Jaipur. Fully furnished, AC, modular kitchen and parking. Contact Jaipur Rental today."
                                    className="w-full rounded-xl border px-3.5 py-3 text-[12px] leading-relaxed outline-none resize-none"
                                    style={{ borderColor: '#e2e8f0', background: '#ffffff', color: '#334155' }}
                                    onFocus={e => (e.currentTarget.style.borderColor = '#99c2ff')}
                                    onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
                                />
                                <span className="absolute bottom-2 right-3 text-[9.5px]" style={{ color: '#cbd5e1' }}>{propertyDetails.length} characters</span>
                            </div>

                            <div className="mb-5">
                                <p className="text-[9.5px] font-bold uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>Script language</p>
                                <div className="flex rounded-lg border overflow-hidden w-fit" style={{ borderColor: '#e2e8f0' }}>
                                    {([
                                        { val: 'hinglish', label: '🇮🇳 Hinglish' },
                                        { val: 'hindi', label: '🇮🇳 Hindi' },
                                        { val: 'english', label: '🇬🇧 English' },
                                    ] as const).map(({ val, label }) => (
                                        <button key={val} type="button" onClick={() => setMode(val)}
                                            className="px-3 py-1.5 text-[10px] cursor-pointer font-bold transition-all"
                                            style={mode === val ? { background: '#0066cc', color: '#ffffff' } : { background: '#f8fafc', color: '#94a3b8' }}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <SecondaryButton onClick={() => setStep(1)}>Back</SecondaryButton>
                                <PrimaryButton onClick={handleGenerateScript} loading={isGeneratingScript}>
                                    <SparkleIcon />{isGeneratingScript ? 'Writing script…' : 'Generate voice script'}
                                </PrimaryButton>
                            </div>
                        </div>
                    )}

                    {/* ═══ STEP 3 — Review / edit script ═══ */}
                    {step === 3 && (
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,102,204,0.1)', color: '#0066cc' }}>
                                        <SparkleIcon />
                                    </div>
                                    <p className="text-[13.5px] font-bold" style={{ color: '#1e293b' }}>Review the voice script</p>
                                </div>
                                <button onClick={handleRegenerateScript} disabled={isGeneratingScript}
                                    className="flex cursor-pointer items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold transition-all disabled:opacity-40"
                                    style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b' }}>
                                    <span style={{ display: 'inline-flex', animation: isGeneratingScript ? 'vp-spin 0.8s linear infinite' : 'none' }}><RefreshIcon /></span> Regenerate
                                </button>
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                                <p className="text-[11.5px]" style={{ color: '#94a3b8' }}>
                                    Edit any line — each one plays over its matching photo, in order.
                                </p>
                                {scriptMeta?.attempts != null && (
                                    <Badge tone="slate">{scriptMeta.attempts} attempt{scriptMeta.attempts === 1 ? '' : 's'}</Badge>
                                )}
                            </div>

                            <div className="flex flex-col gap-2.5 mb-5">
                                {uploadedPhotos.map((photo, i) => (
                                    <div key={photo.fileName} className="flex gap-3 p-2.5 rounded-xl border" style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={resolveMediaUrl(photo.url)} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" style={{ border: '1px solid #f1f5f9' }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[9.5px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#94a3b8' }}>
                                                Photo {i + 1} · {photo.label}
                                            </p>
                                            <textarea
                                                value={scriptLines[i] ?? ''}
                                                onChange={e => updateScriptLine(i, e.target.value)}
                                                rows={2}
                                                className="w-full rounded-lg border px-2.5 py-2 text-[11.5px] leading-relaxed outline-none resize-none"
                                                style={{ borderColor: '#e2e8f0', background: '#f8fafc', color: '#334155' }}
                                                onFocus={e => (e.currentTarget.style.borderColor = '#99c2ff')}
                                                onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
                                            />
                                            <p className="text-[9px] text-right mt-1" style={{ color: '#cbd5e1' }}>
                                                {wordCount(scriptLines[i] ?? '')} words
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between">
                                <SecondaryButton onClick={() => setStep(2)}>Back</SecondaryButton>
                                <PrimaryButton onClick={() => setStep(4)}>Continue to voice</PrimaryButton>
                            </div>
                        </div>
                    )}

                    {/* ═══ STEP 4 — Voiceover method + render ═══ */}
                    {step === 4 && (
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,102,204,0.1)', color: '#0066cc' }}>
                                    <MicIcon />
                                </div>
                                <p className="text-[13.5px] font-bold" style={{ color: '#1e293b' }}>Choose how the script is spoken</p>
                            </div>
                            <p className="text-[11.5px] mb-4" style={{ color: '#94a3b8' }}>
                                AI voice narrates automatically, matched to each photo. Or upload your own recording of the full script, read in order.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                                <button onClick={() => setVoiceoverMethod('ai_voice')}
                                    className="relative cursor-pointer flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all"
                                    style={voiceoverMethod === 'ai_voice'
                                        ? { borderColor: '#0066cc', background: 'rgba(0,102,204,0.05)' }
                                        : { borderColor: '#e2e8f0', background: '#ffffff' }}>
                                    <div className="absolute top-3 right-3 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                                        style={voiceoverMethod === 'ai_voice' ? { borderColor: '#0066cc' } : { borderColor: '#cbd5e1' }}>
                                        {voiceoverMethod === 'ai_voice' && <div className="w-2 h-2 rounded-full" style={{ background: '#0066cc' }} />}
                                    </div>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,102,204,0.1)', color: '#0066cc' }}>
                                        <WandIcon />
                                    </div>
                                    <p className="text-[12px] font-bold" style={{ color: '#1e293b' }}>Automatic AI voice</p>
                                    <p className="text-[10.5px] leading-relaxed" style={{ color: '#94a3b8' }}>
                                        Generated and timed to each photo automatically.
                                    </p>
                                </button>

                                <button onClick={() => setVoiceoverMethod('uploaded_voice')}
                                    className="relative cursor-pointer flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all"
                                    style={voiceoverMethod === 'uploaded_voice'
                                        ? { borderColor: '#0066cc', background: 'rgba(0,102,204,0.05)' }
                                        : { borderColor: '#e2e8f0', background: '#ffffff' }}>
                                    <div className="absolute top-3 right-3 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                                        style={voiceoverMethod === 'uploaded_voice' ? { borderColor: '#0066cc' } : { borderColor: '#cbd5e1' }}>
                                        {voiceoverMethod === 'uploaded_voice' && <div className="w-2 h-2 rounded-full" style={{ background: '#0066cc' }} />}
                                    </div>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,102,204,0.1)', color: '#0066cc' }}>
                                        <MicIcon />
                                    </div>
                                    <p className="text-[12px] font-bold" style={{ color: '#1e293b' }}>Upload my recording</p>
                                    <p className="text-[10.5px] leading-relaxed" style={{ color: '#94a3b8' }}>
                                        Read the script above in one take, then upload it.
                                    </p>
                                </button>
                            </div>

                            {voiceoverMethod === 'ai_voice' && (
                                <div className="mb-5">
                                    <p className="text-[9.5px] font-bold uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>Choose a voice</p>
                                    <VoiceDropdown value={aiVoice} onChange={setAiVoice} />
                                </div>
                            )}

                           {voiceoverMethod === 'uploaded_voice' && (
                                <div className="mb-5">
                                    <div className="flex rounded-lg border overflow-hidden w-fit mb-3" style={{ borderColor: '#e2e8f0' }}>
                                        {([
                                            { val: 'file', label: 'Upload a file' },
                                            { val: 'live', label: 'Record live' },
                                        ] as const).map(({ val, label }) => (
                                            <button key={val} type="button"
                                                onClick={() => {
                                                    setRecordMethod(val)
                                                    if (val === 'live' && voiceFile && !isRecordingConfirmed) setVoiceFile(null)
                                                    if (val === 'file' && (recordedBlob || isRecordingConfirmed)) {
                                                        if (isRecordingConfirmed) setVoiceFile(null)
                                                        discardRecording()
                                                    }
                                                }}
                                                className="px-3 py-1.5 text-[10px] cursor-pointer font-bold transition-all"
                                                style={recordMethod === val ? { background: '#0066cc', color: '#ffffff' } : { background: '#f8fafc', color: '#94a3b8' }}>
                                                {label}
                                            </button>
                                        ))}
                                    </div>

                                    {recordMethod === 'file' && (
                                        <>
                                            <input
                                                ref={voiceInputRef}
                                                type="file"
                                                accept="audio/mpeg,audio/wav,audio/mp4,audio/aac,audio/ogg,.mp3,.wav,.m4a,.aac,.ogg"
                                                className="hidden"
                                                onChange={e => setVoiceFile(e.target.files?.[0] ?? null)}
                                            />
                                            {!voiceFile ? (
                                                <div
                                                    onClick={() => voiceInputRef.current?.click()}
                                                    onDragEnter={handleVoiceFileDragEnter}
                                                    onDragOver={handleVoiceFileDragOver}
                                                    onDragLeave={handleVoiceFileDragLeave}
                                                    onDrop={handleVoiceFileDrop}
                                                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed transition-all cursor-pointer"
                                                    style={isVoiceFileDragOver
                                                        ? { borderColor: '#0066cc', background: '#eaf3ff', color: '#0066cc' }
                                                        : { borderColor: '#cbd5e1', background: '#ffffff', color: '#64748b' }}>
                                                    <MicIcon />
                                                    <span className="text-[11.5px] font-semibold">
                                                        {isVoiceFileDragOver ? 'Drop your recording here' : 'Click or drag your recording here (mp3, wav, m4a, aac, ogg)'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,102,204,0.1)', color: '#0066cc' }}>
                                                        <MicIcon />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-semibold truncate" style={{ color: '#334155' }}>{voiceFile.name}</p>
                                                        <audio controls src={URL.createObjectURL(voiceFile)} className="w-full h-8 mt-1.5" />
                                                    </div>
                                                    <button onClick={() => setVoiceFile(null)} className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 cursor-pointer" style={{ background: '#fff1f2', color: '#e11d48' }}>
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {recordMethod === 'live' && (
                                        <div className="flex flex-col items-center gap-3 p-5 rounded-xl border" style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>

                                            {/* state 1: idle, nothing recorded yet */}
                                            {!isRecording && !recordedBlob && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={startRecording}
                                                        className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all"
                                                        style={{ background: '#0066cc', boxShadow: '0 2px 8px rgba(0,102,204,0.3)' }}>
                                                        <span style={{ color: '#fff' }}><MicIcon /></span>
                                                    </button>
                                                    <p className="text-[11.5px] font-semibold" style={{ color: '#475569' }}>Tap to start recording</p>
                                                    <p className="text-[10px]" style={{ color: '#cbd5e1' }}>Needs microphone access, and a secure (https) connection.</p>
                                                </>
                                            )}

                                            {/* state 2: actively recording */}
                                            {isRecording && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={stopRecording}
                                                        className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all"
                                                        style={{ background: '#e11d48', boxShadow: '0 0 0 6px rgba(225,29,72,0.15)' }}>
                                                        <span style={{ color: '#fff' }}><MicIcon /></span>
                                                    </button>
                                                    <p className="text-[11.5px] font-semibold" style={{ color: '#e11d48' }}>Recording… {formatSeconds(recordingSeconds)}</p>
                                                    <p className="text-[10px]" style={{ color: '#94a3b8' }}>Read your script in order, then tap again to stop.</p>
                                                </>
                                            )}

                                            {/* state 3: recorded, awaiting confirmation */}
                                            {!isRecording && recordedBlob && !isRecordingConfirmed && (
                                                <div className="w-full flex flex-col gap-3">
                                                    <p className="text-[10.5px] font-semibold text-center" style={{ color: '#475569' }}>Preview your recording</p>
                                                    <audio controls src={recordedPreviewUrl ?? undefined} className="w-full h-9" />
                                                    <div className="flex items-center justify-center gap-2">
                                                        <SecondaryButton onClick={handleReRecordLive}>
                                                            <TrashIcon /> Re-record
                                                        </SecondaryButton>
                                                        <PrimaryButton onClick={confirmRecordedVoice}>
                                                            <CheckIcon /> Use this recording
                                                        </PrimaryButton>
                                                    </div>
                                                </div>
                                            )}

                                            {/* state 4: confirmed and attached — recording button stays hidden */}
                                            {!isRecording && recordedBlob && isRecordingConfirmed && (
                                                <div className="w-full flex items-center gap-3 p-3 rounded-xl border" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(5,150,105,0.12)', color: '#059669' }}>
                                                        <CheckIcon />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-semibold" style={{ color: '#166534' }}>Recording attached</p>
                                                        <audio controls src={recordedPreviewUrl ?? undefined} className="w-full h-8 mt-1.5" />
                                                    </div>
                                                    <button
                                                        onClick={handleReRecordLive}
                                                        className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 cursor-pointer"
                                                        style={{ background: '#fff1f2', color: '#e11d48' }}
                                                        aria-label="Remove and re-record">
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {isRendering && (
                                <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border mb-5" style={{ background: '#f0f7ff', borderColor: '#bae6fd' }}>
                                    <div className="w-4 h-4 rounded-full border-2 flex-shrink-0" style={{ borderColor: '#0066cc', borderTopColor: 'transparent', animation: 'vp-spin 0.8s linear infinite' }} />
                                    <p className="text-[11px]" style={{ color: '#0369a1' }}>Rendering your video — this can take a minute or two, please don't close this tab.</p>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <SecondaryButton onClick={() => setStep(3)} disabled={isRendering}>Back</SecondaryButton>
                                <PrimaryButton onClick={handleRender} loading={isRendering}>
                                    {isRendering ? 'Rendering…' : 'Generate final video'}
                                </PrimaryButton>
                            </div>
                        </div>
                    )}

                    {/* ═══ STEP 5 — Preview & download ═══ */}
                    {step === 5 && videoUrl && (
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(5,150,105,0.1)', color: '#059669', animation: 'vp-pop 0.35s ease-out' }}>
                                    <CheckIcon />
                                </div>
                                <p className="text-[13.5px] font-bold" style={{ color: '#1e293b' }}>Your video is ready</p>
                            </div>
                            <p className="text-[11.5px] mb-4" style={{ color: '#94a3b8' }}>
                                Preview below, then download or start a new video.
                            </p>

                            <div className="flex justify-center mb-5">
                                <div className="p-2 rounded-[26px]" style={{ background: '#0f172a', boxShadow: '0 12px 32px rgba(15,23,42,0.18)' }}>
    <video
        controls
        poster={thumbnailUrl ? resolveMediaUrl(thumbnailUrl) : undefined}
        src={resolveMediaUrl(videoUrl)}
        className="rounded-2xl"
        style={{
            maxWidth: videoAspectRatio === 'landscape' ? '480px' : '300px',
            width: '100%',
            aspectRatio: CSS_RATIO[videoAspectRatio],
            background: '#000',
        }}
    />
</div>
                            </div>

                            <div className="flex items-center justify-center gap-3">
                                <a
                                    href={resolveMediaUrl(videoUrl)}
                                    onClick={handleDownload}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold transition-all active:scale-[0.98] cursor-pointer"
                                    style={{
                                        background: '#0066cc',
                                        color: '#ffffff',
                                        boxShadow: '0 2px 8px rgba(0,102,204,0.25)',
                                        opacity: isDownloading ? 0.7 : 1,
                                        pointerEvents: isDownloading ? 'none' : 'auto'
                                    }}
                                >
                                    {isDownloading ? (
                                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent" style={{ animation: 'vp-spin 0.8s linear infinite' }} />
                                    ) : (
                                        <DownloadIcon />
                                    )}
                                    {isDownloading ? 'Downloading...' : 'Download video'}
                                </a>
                                <SecondaryButton onClick={handleStartOver}>
                                    <PlayIcon /> Create another
                                </SecondaryButton>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes vp-spin { to { transform: rotate(360deg); } }
                @keyframes vp-fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes vp-slide-down { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes vp-dropdown { from { opacity: 0; transform: scaleY(0.92) translateY(-4px); } to { opacity: 1; transform: scaleY(1) translateY(0); } }
                @keyframes vp-pop { 0% { transform: scale(0.6); opacity: 0; } 60% { transform: scale(1.12); } 100% { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    )
}

export default VideoProjectWorkspace