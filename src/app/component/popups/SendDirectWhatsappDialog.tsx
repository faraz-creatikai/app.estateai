'use client';

import React, { useState, useRef, useEffect } from 'react';
import PopupMenu from './PopupMenu';
import { sendDirectMessageApi } from '@/store/masters/whatsapp/whatsapp';

interface DirectMessagePopupProps {
    isOpen: boolean;
    onClose: () => void;
    customerIds: string[];
}

type MediaType = 'text' | 'image' | 'video' | 'document' | 'location' | 'poll';
type ComposerView = 'chat' | 'poll' | 'location';

interface NominatimResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

interface SelectedLocation {
    lat: string;
    lng: string;
    name: string;
}

function formatBytes(bytes: number) {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
}

function nowTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* ---------------------------------------------------------------- */
/* Lightweight, dependency-free icon set                             */
/* ---------------------------------------------------------------- */
const Icon = {
    Close: (p: { className?: string }) => (
        <svg className={p.className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    Logo: (p: { className?: string }) => (
        <svg className={p.className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.35 5.07L2 22l5.05-1.32A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.2 14.2c-.22.62-1.28 1.2-1.77 1.27-.45.07-1.02.1-1.65-.1a15 15 0 01-1.46-.54c-2.57-1.11-4.25-3.71-4.38-3.88-.13-.17-1.05-1.4-1.05-2.67s.66-1.9.9-2.16c.23-.26.5-.32.67-.32.17 0 .34 0 .49.01.16.01.37-.06.58.44.22.53.75 1.83.81 1.96.07.14.11.3.02.48-.09.18-.14.28-.27.43-.14.15-.29.34-.41.46-.14.13-.28.28-.12.55.16.27.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.2 1.37.27.14.43.12.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.55.73 1.82.87.27.13.45.2.51.31.07.12.07.66-.15 1.29z" />
        </svg>
    ),
    Image: (p: { className?: string }) => (
        <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
        </svg>
    ),
    Video: (p: { className?: string }) => (
        <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" />
        </svg>
    ),
    Document: (p: { className?: string }) => (
        <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline strokeLinecap="round" strokeLinejoin="round" points="14 2 14 8 20 8" />
        </svg>
    ),
    Location: (p: { className?: string }) => (
        <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    ),
    Poll: (p: { className?: string }) => (
        <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line strokeLinecap="round" x1="12" y1="20" x2="12" y2="10" />
            <line strokeLinecap="round" x1="18" y1="20" x2="18" y2="4" />
            <line strokeLinecap="round" x1="6" y1="20" x2="6" y2="16" />
        </svg>
    ),
    Send: (p: { className?: string }) => (
        <svg className={p.className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
    ),
    Plus: (p: { className?: string }) => (
        <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
        </svg>
    ),
    Check: (p: { className?: string }) => (
        <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
        </svg>
    ),
    Spinner: (p: { className?: string }) => (
        <svg className={p.className} viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
    ),
    Maximize: (p: { className?: string }) => (
        <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline strokeLinecap="round" strokeLinejoin="round" points="15 3 21 3 21 9" />
            <polyline strokeLinecap="round" strokeLinejoin="round" points="9 21 3 21 3 15" />
            <line strokeLinecap="round" x1="21" y1="3" x2="14" y2="10" />
            <line strokeLinecap="round" x1="3" y1="21" x2="10" y2="14" />
        </svg>
    ),
    Minimize: (p: { className?: string }) => (
        <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline strokeLinecap="round" strokeLinejoin="round" points="4 14 10 14 10 20" />
            <polyline strokeLinecap="round" strokeLinejoin="round" points="20 10 14 10 14 4" />
            <line strokeLinecap="round" x1="14" y1="10" x2="21" y2="3" />
            <line strokeLinecap="round" x1="3" y1="21" x2="10" y2="14" />
        </svg>
    ),
    ArrowLeft: (p: { className?: string }) => (
        <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line strokeLinecap="round" x1="19" y1="12" x2="5" y2="12" />
            <polyline strokeLinecap="round" strokeLinejoin="round" points="12 19 5 12 12 5" />
        </svg>
    ),
    Search: (p: { className?: string }) => (
        <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="7" />
            <line strokeLinecap="round" x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    ),
    Crosshair: (p: { className?: string }) => (
        <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="3" />
            <line strokeLinecap="round" x1="12" y1="2" x2="12" y2="5" />
            <line strokeLinecap="round" x1="12" y1="19" x2="12" y2="22" />
            <line strokeLinecap="round" x1="2" y1="12" x2="5" y2="12" />
            <line strokeLinecap="round" x1="19" y1="12" x2="22" y2="12" />
        </svg>
    ),
};

const ATTACH_OPTIONS = [
    {
        key: 'media' as const,
        label: 'Photos & Videos',
        sublabel: 'Share images or clips',
        icon: Icon.Image,
        bg: 'bg-gradient-to-br from-fuchsia-500 to-pink-500',
    },
    {
        key: 'document' as const,
        label: 'Document',
        sublabel: 'PDF, Word, Excel & more',
        icon: Icon.Document,
        bg: 'bg-gradient-to-br from-indigo-500 to-blue-500',
    },
    {
        key: 'poll' as const,
        label: 'Poll',
        sublabel: 'Get a quick response',
        icon: Icon.Poll,
        bg: 'bg-gradient-to-br from-amber-500 to-orange-500',
    },
    {
        key: 'location' as const,
        label: 'Location',
        sublabel: 'Share a place or pin',
        icon: Icon.Location,
        bg: 'bg-gradient-to-br from-teal-500 to-emerald-500',
    },
];

type AttachKey = (typeof ATTACH_OPTIONS)[number]['key'];

export default function SendDirectWhatsappDialog({ isOpen, onClose, customerIds }: DirectMessagePopupProps) {
    const [message, setMessage] = useState('');
    const [mediaType, setMediaType] = useState<MediaType>('text');
    const [composerView, setComposerView] = useState<ComposerView>('chat');
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [pendingAttachKind, setPendingAttachKind] = useState<'media' | 'document' | null>(null);

    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Poll state
    const [pollName, setPollName] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [pollSelectable, setPollSelectable] = useState(1);

    // Location state
    const [locationQuery, setLocationQuery] = useState('');
    const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
    const [isLocatingUser, setIsLocatingUser] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    const [isMaximized, setIsMaximized] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const messageInputRef = useRef<HTMLTextAreaElement>(null);

    // Reset transient window state whenever the dialog is closed
    useEffect(() => {
        if (!isOpen) {
            setIsMaximized(false);
            setShowAttachMenu(false);
        }
    }, [isOpen]);

    // Build/revoke a local preview URL whenever the selected file changes
    useEffect(() => {
        if (file && (mediaType === 'image' || mediaType === 'video')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
        setPreviewUrl(null);
    }, [file, mediaType]);

    // Auto-grow the message / caption textarea
    useEffect(() => {
        const el = messageInputRef.current;
        if (el) {
            el.style.height = 'auto';
            el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
        }
    }, [message, composerView]);

    // Debounced place search (OpenStreetMap Nominatim — free, no API key required)
    useEffect(() => {
        if (composerView !== 'location') return;
        if (!locationQuery.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        const handle = setTimeout(async () => {
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(locationQuery)}`
                );
                const data = await res.json();
                setSearchResults(Array.isArray(data) ? data : []);
            } catch {
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 450);
        return () => clearTimeout(handle);
    }, [locationQuery, composerView]);

    const handleAttachOptionClick = (kind: 'media' | 'document') => {
        setPendingAttachKind(kind);
        setShowAttachMenu(false);
        setSubmitStatus('idle');
        requestAnimationFrame(() => {
            if (fileInputRef.current) {
                fileInputRef.current.accept = kind === 'media' ? 'image/*,video/*' : '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt';
                fileInputRef.current.value = '';
                fileInputRef.current.click();
            }
        });
    };

    const handleAttachMenuSelect = (key: AttachKey) => {
        if (key === 'media' || key === 'document') {
            handleAttachOptionClick(key);
            return;
        }
        setShowAttachMenu(false);
        setSubmitStatus('idle');
        setAttemptedSubmit(false);
        setFile(null);
        if (key === 'poll') {
            setMediaType('poll');
            setComposerView('poll');
        } else {
            setMediaType('location');
            setComposerView('location');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;
        const type: MediaType =
            pendingAttachKind === 'media' ? (selected.type.startsWith('video/') ? 'video' : 'image') : 'document';
        setFile(selected);
        setMediaType(type);
        setComposerView('chat');
        setAttemptedSubmit(false);
        setSubmitStatus('idle');
    };

    const handleDiscardAndBack = () => {
        setComposerView('chat');
        setMediaType('text');
        setFile(null);
        setAttemptedSubmit(false);
        setSubmitStatus('idle');
        setSelectedLocation(null);
        setLocationQuery('');
        setSearchResults([]);
        setLocationError(null);
        setPollName('');
        setPollOptions(['', '']);
        setPollSelectable(1);
    };

    const updatePollOption = (index: number, val: string) => {
        setPollOptions((prev) => prev.map((o, i) => (i === index ? val : o)));
    };
    const addPollOption = () => setPollOptions((prev) => [...prev, '']);
    const removePollOption = (index: number) => setPollOptions((prev) => prev.filter((_, i) => i !== index));
    const validPollOptions = pollOptions.filter((o) => o.trim() !== '');

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Location access is not available on this device.');
            return;
        }
        setIsLocatingUser(true);
        setLocationError(null);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                let name = 'Current location';
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await res.json();
                    if (data?.display_name) name = data.display_name;
                } catch {
                    // keep the default label if reverse geocoding fails
                }
                setSelectedLocation({ lat: String(latitude), lng: String(longitude), name });
                setLocationQuery(name);
                setSearchResults([]);
                setIsLocatingUser(false);
            },
            () => {
                setLocationError("Couldn't access your location. Please allow location access, or search for a place instead.");
                setIsLocatingUser(false);
            }
        );
    };

    const handleSelectSearchResult = (r: NominatimResult) => {
        setSelectedLocation({ lat: r.lat, lng: r.lon, name: r.display_name });
        setSearchResults([]);
        setLocationQuery(r.display_name);
    };

    const canSubmit = (() => {
        if (mediaType === 'text') return message.trim().length > 0;
        if (mediaType === 'image' || mediaType === 'video' || mediaType === 'document') return !!file;
        if (mediaType === 'location') return !!selectedLocation;
        if (mediaType === 'poll') return pollName.trim() !== '' && validPollOptions.length >= 2;
        return true;
    })();

    // Whether there's enough content to render a live bubble preview
    const hasContent = (() => {
        if (mediaType === 'text') return message.trim().length > 0;
        if (mediaType === 'image' || mediaType === 'video' || mediaType === 'document') return !!file;
        if (mediaType === 'location') return !!selectedLocation;
        if (mediaType === 'poll') return pollName.trim() !== '' || validPollOptions.length > 0;
        return false;
    })();

    // Only remount (and replay the pop-in animation) when the *kind* of content changes,
    // not on every keystroke — keeps typing smooth while previewing live.
    const bubbleKey = `${mediaType}-${hasContent ? 1 : 0}-${file ? file.name + file.size : ''}-${selectedLocation ? selectedLocation.lat : ''
        }`;

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setAttemptedSubmit(true);
        if (!canSubmit) return;

        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const formData = new FormData();
            formData.append('message', message);
            formData.append('mediaType', mediaType);
            formData.append('customerIds', JSON.stringify(customerIds));

            if (file && (mediaType === 'image' || mediaType === 'video' || mediaType === 'document')) {
                formData.append('whatsappFile', file);
            }

            if (mediaType === 'location' && selectedLocation) {
                formData.append(
                    'location',
                    JSON.stringify({ lat: selectedLocation.lat, lng: selectedLocation.lng, name: selectedLocation.name })
                );
            }

            if (mediaType === 'poll') {
                formData.append(
                    'poll',
                    JSON.stringify({ name: pollName, options: validPollOptions, selectableCount: pollSelectable })
                );
            }

            const res = await sendDirectMessageApi(formData);

            if (res?.success) {
                setSubmitStatus('success');
                setTimeout(() => onClose(), 900);
            } else {
                setSubmitStatus('error');
            }
        } catch {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const recipientLabel = `${customerIds.length} customer${customerIds.length === 1 ? '' : 's'}`;

    return (
        <PopupMenu isOpen={isOpen} onClose={onClose}>
            <style>{`
        @keyframes waDialogIn { 0% { opacity:0; transform: scale(.96) translateY(10px); } 100% { opacity:1; transform: scale(1) translateY(0); } }
        @keyframes waPopIn { 0% { opacity:0; transform: translateY(6px) scale(.98); } 100% { opacity:1; transform: translateY(0) scale(1); } }
        @keyframes waCheckPop { 0% { transform: scale(0); } 60% { transform: scale(1.25); } 100% { transform: scale(1); } }
        @keyframes waMenuIn { 0% { opacity:0; transform: translateY(8px) scale(.94); } 100% { opacity:1; transform: translateY(0) scale(1); } }
        @keyframes waPanelIn { 0% { opacity:0; transform: translateY(10px); } 100% { opacity:1; transform: translateY(0); } }
        .wa-dialog { animation: waDialogIn .25s cubic-bezier(.2,.8,.2,1); }
        .wa-pop { animation: waPopIn .2s ease; }
        .wa-check { animation: waCheckPop .45s cubic-bezier(.34,1.56,.64,1); }
        .wa-menu { animation: waMenuIn .16s cubic-bezier(.2,.8,.2,1); transform-origin: bottom left; }
        .wa-panel { animation: waPanelIn .2s cubic-bezier(.2,.8,.2,1); }
      `}</style>

            <div
                className={`wa-dialog bg-white shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ease-out  ${isMaximized ? 'w-[95vw] h-[98vh] max-md:h-[100dvh] max-md:w-screen max-w-6xl md:rounded-3xl' : 'w-full max-w-md md:max-w-lg h-[80vh] max-h-[680px] rounded-3xl'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

                {/* Header */}
                <div className="relative px-4 py-3 flex justify-between items-center bg-gradient-to-r from-[#075E54] to-[#128C7E] shrink-0">
                    <div
                        className="absolute inset-0 opacity-[0.08] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                    />
                    <div className="relative flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 shrink-0 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/25">
                            <Icon.Logo className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-white text-sm leading-tight truncate">Send WhatsApp Message</h3>
                            <p className="text-[11px] text-emerald-50/80 truncate">
                                Broadcasting to <span className="font-semibold text-white">{customerIds.length}</span> customer
                                {customerIds.length === 1 ? '' : 's'}
                            </p>
                        </div>
                    </div>
                    <div className="relative flex items-center gap-1 shrink-0">
                        <button
                            type="button"
                            aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
                            title={isMaximized ? 'Restore' : 'Maximize'}
                            onClick={() => setIsMaximized((v) => !v)}
                            className="text-white/80 hover:text-white hover:bg-white/15 rounded-full p-2 transition-colors cursor-pointer"
                        >
                            {isMaximized ? <Icon.Minimize className="w-4 h-4" /> : <Icon.Maximize className="w-4 h-4" />}
                        </button>
                        <button
                            type="button"
                            aria-label="Close"
                            title="Close"
                            onClick={onClose}
                            className="text-white/80 hover:text-white hover:bg-white/15 rounded-full p-2 transition-colors cursor-pointer"
                        >
                            <Icon.Close className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
                    {/* ---------------- Live chat preview — ALWAYS visible, height never depends on composer content ---------------- */}
                    <div
                        className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col hide-scrollbar"
                        style={{
                            backgroundColor: '#ECE5DD',
                            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)',
                            backgroundSize: '16px 16px',
                        }}
                    >
                        <div className="mx-auto mb-3 px-3 py-1.5 bg-[#FFF3C4]/90 text-amber-800 text-[10.5px] font-medium rounded-lg shadow-sm max-w-[85%] text-center shrink-0">
                            How your message will appear to customers
                        </div>
                        <div className="flex-1 flex flex-col min-h-0">
                            {hasContent ? (
                                <div key={bubbleKey} className="wa-pop self-end max-w-[78%] mb-1 mt-auto">
                                    {mediaType === 'text' && (
                                        <div className="bg-[#DCF8C6] rounded-2xl rounded-tr-sm shadow-sm px-3 py-2">
                                            <p className="text-[13px] text-gray-800 whitespace-pre-wrap break-words">{message}</p>
                                            <p className="text-[9.5px] text-gray-500 text-right mt-1">{nowTime()}</p>
                                        </div>
                                    )}

                                    {(mediaType === 'image' || mediaType === 'video') && file && (
                                        <div className="bg-[#DCF8C6] rounded-2xl rounded-tr-sm shadow-sm p-1">
                                            <div className="rounded-xl overflow-hidden bg-black/5">
                                                {mediaType === 'image'
                                                    ? previewUrl && <img src={previewUrl} alt="Selected" className="w-full max-h-56 object-cover" />
                                                    : previewUrl && <video src={previewUrl} controls className="w-full max-h-56 object-cover" />}
                                            </div>
                                            {message.trim() && (
                                                <p className="text-[13px] text-gray-800 px-2 pt-1.5 whitespace-pre-wrap break-words">{message}</p>
                                            )}
                                            <p className="text-[9.5px] text-gray-500 text-right px-2 pb-0.5 pt-1">{nowTime()}</p>
                                        </div>
                                    )}

                                    {mediaType === 'document' && file && (
                                        <div className="bg-[#DCF8C6] rounded-2xl rounded-tr-sm shadow-sm p-2">
                                            <div className="flex items-center gap-2 bg-white/70 rounded-xl p-2">
                                                <span className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                                                    <Icon.Document className="w-4.5 h-4.5 text-indigo-500" />
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block text-[12px] font-medium text-gray-800 truncate">{file.name}</span>
                                                    <span className="block text-[10px] text-gray-500">{formatBytes(file.size)}</span>
                                                </span>
                                            </div>
                                            {message.trim() && (
                                                <p className="text-[13px] text-gray-800 px-1 pt-1.5 whitespace-pre-wrap break-words">{message}</p>
                                            )}
                                            <p className="text-[9.5px] text-gray-500 text-right mt-1">{nowTime()}</p>
                                        </div>
                                    )}

                                    {mediaType === 'location' && selectedLocation && (
                                        <div className="bg-[#DCF8C6] rounded-2xl rounded-tr-sm shadow-sm p-1">
                                            <div className="rounded-xl overflow-hidden h-32 bg-gray-100">
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    style={{ border: 0 }}
                                                    loading="lazy"
                                                    src={`https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}&z=15&output=embed`}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 px-2 py-1.5">
                                                <Icon.Location className="w-3.5 h-3.5 text-[#128C7E] shrink-0" />
                                                <p className="text-[12px] font-medium text-gray-800 truncate">{selectedLocation.name}</p>
                                            </div>
                                            <p className="text-[9.5px] text-gray-500 text-right px-2 pb-0.5">{nowTime()}</p>
                                        </div>
                                    )}

                                    {mediaType === 'poll' && (
                                        <div className="bg-[#DCF8C6] rounded-2xl rounded-tr-sm shadow-sm px-3 py-2.5">
                                            <p className="text-[13px] font-semibold text-gray-800 mb-2 break-words">
                                                {pollName.trim() || 'Your question here'}
                                            </p>
                                            <div className="space-y-1.5 max-h-40 overflow-y-auto hide-scrollbar pr-1">
                                                {(validPollOptions.length ? validPollOptions : ['Option 1', 'Option 2']).map((opt, i) => (
                                                    <div key={i} className="flex items-center gap-2 bg-white/70 rounded-lg px-2 py-1.5">
                                                        <span className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 shrink-0" />
                                                        <span className="text-[12px] text-gray-700 truncate">{opt}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-1.5">
                                                {pollSelectable > 1 ? 'Select one or more' : 'Select one'}
                                            </p>
                                            <p className="text-[9.5px] text-gray-500 text-right mt-1">{nowTime()}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center gap-2.5 px-8 text-center">
                                    <div className="w-12 h-12 rounded-full bg-white/70 flex items-center justify-center shadow-sm">
                                        <Icon.Logo className="w-5 h-5 text-[#128C7E]/50" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">Start your broadcast</p>
                                    <p className="text-xs text-gray-400 max-w-[230px] leading-relaxed">
                                        Type a message, or tap{' '}
                                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white shadow-sm align-middle">
                                            <Icon.Plus className="w-2.5 h-2.5 text-gray-500" />
                                        </span>{' '}
                                        to attach a photo, document, poll or location
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ---------------- Chat composer bar ---------------- */}
                    {composerView === 'chat' && (
                        <div className="shrink-0 bg-[#F0F0F0] border-t border-gray-200 px-3 py-2.5">
                            {file && (mediaType === 'image' || mediaType === 'video' || mediaType === 'document') && (
                                <div className="flex items-center gap-2 bg-white rounded-xl px-2.5 py-1.5 mb-2 shadow-sm">
                                    <span
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${mediaType === 'document' ? 'bg-indigo-100 text-indigo-500' : 'bg-fuchsia-100 text-fuchsia-500'
                                            }`}
                                    >
                                        {mediaType === 'document' ? (
                                            <Icon.Document className="w-3.5 h-3.5" />
                                        ) : mediaType === 'video' ? (
                                            <Icon.Video className="w-3.5 h-3.5" />
                                        ) : (
                                            <Icon.Image className="w-3.5 h-3.5" />
                                        )}
                                    </span>
                                    <span className="flex-1 min-w-0 text-xs font-medium text-gray-700 truncate">{file.name}</span>
                                    <span className="text-[10px] text-gray-400 shrink-0">{formatBytes(file.size)}</span>
                                    <button
                                        type="button"
                                        aria-label="Remove attachment"
                                        onClick={handleDiscardAndBack}
                                        disabled={isSubmitting}
                                        className="shrink-0 text-gray-300 hover:text-red-500 p-1 transition-colors cursor-pointer disabled:opacity-40"
                                    >
                                        <Icon.Close className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}

                            <div className="flex items-end gap-2">
                                <div className="relative shrink-0">
                                    <button
                                        type="button"
                                        aria-label="Attach"
                                        title="Attach"
                                        onClick={() => setShowAttachMenu((v) => !v)}
                                        disabled={isSubmitting}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 ${showAttachMenu ? 'bg-[#128C7E] text-white' : 'bg-white text-gray-500 hover:text-[#128C7E] shadow-sm'
                                            }`}
                                    >
                                        <Icon.Plus className={`w-5 h-5 transition-transform duration-200 ${showAttachMenu ? 'rotate-45' : ''}`} />
                                    </button>

                                    {showAttachMenu && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setShowAttachMenu(false)} />
                                            <div className="wa-menu absolute bottom-full left-0 mb-2 z-50 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2">
                                                {ATTACH_OPTIONS.map((opt) => (
                                                    <button
                                                        key={opt.key}
                                                        type="button"
                                                        onClick={() => handleAttachMenuSelect(opt.key)}
                                                        className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-left"
                                                    >
                                                        <span className={`w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 ${opt.bg}`}>
                                                            <opt.icon className="w-4 h-4" />
                                                        </span>
                                                        <span className="min-w-0">
                                                            <span className="block text-sm font-medium text-gray-800">{opt.label}</span>
                                                            <span className="block text-[10.5px] text-gray-400 truncate">{opt.sublabel}</span>
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex-1 bg-white rounded-3xl px-4 py-2 shadow-sm flex items-center min-w-0">
                                    <textarea
                                        ref={messageInputRef}
                                        rows={1}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSubmit();
                                            }
                                        }}
                                        maxLength={1024}
                                        placeholder={file ? 'Add a caption' : 'Type a message'}
                                        className="w-full resize-none outline-none text-sm bg-transparent max-h-28 overflow-y-auto leading-5"
                                    />
                                </div>

                                <button
                                    type="button"
                                    aria-label="Send message"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !canSubmit}
                                    className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${submitStatus === 'success'
                                            ? 'bg-[#25D366]'
                                            : 'bg-gradient-to-br from-[#128C7E] to-[#25D366] hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <Icon.Spinner className="w-4 h-4 animate-spin" />
                                    ) : submitStatus === 'success' ? (
                                        <Icon.Check className="w-4 h-4 wa-check" />
                                    ) : (
                                        <Icon.Send className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            {attemptedSubmit && mediaType === 'text' && !message.trim() && (
                                <p className="text-[11px] text-red-500 mt-1.5 ml-1">Message can't be empty.</p>
                            )}
                            {submitStatus === 'error' && (
                                <p className="text-[11px] text-red-500 mt-1.5 ml-1">Something went wrong — please try again.</p>
                            )}
                        </div>
                    )}

                    {/* ---------------- Poll composer — FIXED size, never grows/shrinks with content, preview stays visible above it ---------------- */}
                    {composerView === 'poll' && (
                        <div
                            className="wa-panel shrink-0 border-t border-gray-100 bg-white flex flex-col overflow-hidden"
                            style={{ flex: '0 0 44%' }}
                        >
                            <div className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-100 shrink-0">
                                <button
                                    type="button"
                                    aria-label="Back"
                                    onClick={handleDiscardAndBack}
                                    disabled={isSubmitting}
                                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors cursor-pointer disabled:opacity-40"
                                >
                                    <Icon.ArrowLeft className="w-4 h-4" />
                                </button>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-800">Create poll</p>
                                    <p className="text-[10.5px] text-gray-400">Sending to {recipientLabel}</p>
                                </div>
                            </div>

                            <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar p-3 space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Question</label>
                                    <input
                                        type="text"
                                        placeholder="Ask a question"
                                        value={pollName}
                                        onChange={(e) => setPollName(e.target.value)}
                                        className={`w-full text-sm font-medium px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#25D366]/20 transition-colors ${attemptedSubmit && !pollName.trim() ? 'border-red-300' : 'border-gray-200 focus:border-[#25D366]'
                                            }`}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Options</label>
                                    <div className="space-y-1.5">
                                        {pollOptions.map((opt, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <span className="w-5 h-5 shrink-0 rounded-full bg-emerald-100 text-[#128C7E] text-[10px] font-bold flex items-center justify-center">
                                                    {i + 1}
                                                </span>
                                                <input
                                                    type="text"
                                                    placeholder={`Option ${i + 1}`}
                                                    value={opt}
                                                    onChange={(e) => updatePollOption(i, e.target.value)}
                                                    className="flex-1 text-sm px-3 py-1.5 border border-gray-200 rounded-xl outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 transition-colors"
                                                />
                                                {pollOptions.length > 2 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removePollOption(i)}
                                                        className="shrink-0 text-gray-300 hover:text-red-500 p-1 transition-colors cursor-pointer"
                                                    >
                                                        <Icon.Close className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addPollOption}
                                        className="mt-1.5 text-xs text-[#128C7E] font-semibold hover:underline cursor-pointer flex items-center gap-1"
                                    >
                                        <Icon.Plus className="w-3.5 h-3.5" /> Add option
                                    </button>
                                </div>

                                <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none pt-2 border-t border-gray-100">
                                    <input
                                        type="checkbox"
                                        checked={pollSelectable > 1}
                                        onChange={(e) => setPollSelectable(e.target.checked ? Math.max(2, validPollOptions.length || 2) : 1)}
                                        className="rounded accent-[#25D366]"
                                    />
                                    Allow multiple answers
                                </label>

                                {attemptedSubmit && (!pollName.trim() || validPollOptions.length < 2) && (
                                    <p className="text-[11px] text-red-500">Add a question and at least 2 options.</p>
                                )}
                            </div>

                            <div className="shrink-0 border-t border-gray-100 bg-white p-2.5">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !canSubmit}
                                    className={`w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-40 ${submitStatus === 'success'
                                            ? 'bg-[#25D366]'
                                            : 'bg-gradient-to-r from-[#128C7E] to-[#25D366] hover:shadow-lg hover:shadow-emerald-500/30 active:scale-[0.98]'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Icon.Spinner className="w-4 h-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : submitStatus === 'success' ? (
                                        <>
                                            <Icon.Check className="w-4 h-4 wa-check" />
                                            Sent!
                                        </>
                                    ) : (
                                        <>
                                            <Icon.Send className="w-4 h-4" />
                                            Send poll
                                        </>
                                    )}
                                </button>
                                {submitStatus === 'error' && <p className="text-[11px] text-red-500 mt-1.5 text-center">Something went wrong — please try again.</p>}
                            </div>
                        </div>
                    )}

                    {/* ---------------- Location picker — FIXED size, never grows/shrinks with content, preview stays visible above it ---------------- */}
                    {composerView === 'location' && (
                        <div
                            className="wa-panel shrink-0 border-t border-gray-100 bg-white flex flex-col overflow-hidden"
                            style={{ flex: '0 0 50%' }}
                        >
                            <div className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-100 shrink-0">
                                <button
                                    type="button"
                                    aria-label="Back"
                                    onClick={handleDiscardAndBack}
                                    disabled={isSubmitting}
                                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors cursor-pointer disabled:opacity-40"
                                >
                                    <Icon.ArrowLeft className="w-4 h-4" />
                                </button>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-800">Share location</p>
                                    <p className="text-[10.5px] text-gray-400">Sending to {recipientLabel}</p>
                                </div>
                            </div>

                            <div className="px-3 pt-3 shrink-0">
                                <div className="relative">
                                    <Icon.Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={locationQuery}
                                        onChange={(e) => {
                                            setLocationQuery(e.target.value);
                                            setSelectedLocation(null);
                                        }}
                                        placeholder="Search for a place or address"
                                        className="w-full text-sm pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2">
                                {!selectedLocation && (
                                    <button
                                        type="button"
                                        onClick={handleUseCurrentLocation}
                                        disabled={isLocatingUser}
                                        className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-left disabled:opacity-60"
                                    >
                                        <span className="w-9 h-9 rounded-full bg-teal-50 text-[#128C7E] flex items-center justify-center shrink-0">
                                            {isLocatingUser ? <Icon.Spinner className="w-4 h-4 animate-spin" /> : <Icon.Crosshair className="w-4 h-4" />}
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block text-sm font-medium text-[#128C7E]">
                                                {isLocatingUser ? 'Finding your location…' : 'Send your current location'}
                                            </span>
                                            <span className="block text-[10.5px] text-gray-400">Uses your device's GPS</span>
                                        </span>
                                    </button>
                                )}

                                {locationError && <p className="text-[11px] text-red-500 px-2 mt-1">{locationError}</p>}
                                {isSearching && <p className="text-xs text-gray-400 px-2 py-2">Searching…</p>}

                                {!selectedLocation && searchResults.length > 0 && (
                                    <div className="mt-1">
                                        {searchResults.map((r) => (
                                            <button
                                                key={r.place_id}
                                                type="button"
                                                onClick={() => handleSelectSearchResult(r)}
                                                className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-left"
                                            >
                                                <span className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                                                    <Icon.Location className="w-4 h-4" />
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block text-sm text-gray-800 truncate">{r.display_name}</span>
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {selectedLocation && (
                                    <div className="wa-pop mt-1 flex items-center gap-3 p-3 rounded-2xl border border-gray-200 bg-white shadow-sm">
                                        <span className="w-9 h-9 rounded-full bg-teal-50 text-[#128C7E] flex items-center justify-center shrink-0">
                                            <Icon.Location className="w-4 h-4" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-800 truncate">{selectedLocation.name}</p>
                                            <p className="text-[10.5px] text-gray-400">Pinned — see the preview above</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedLocation(null);
                                                setLocationQuery('');
                                            }}
                                            className="shrink-0 text-gray-300 hover:text-red-500 p-1 transition-colors cursor-pointer"
                                        >
                                            <Icon.Close className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="shrink-0 border-t border-gray-100 bg-white p-2.5">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !canSubmit}
                                    className={`w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-40 ${submitStatus === 'success'
                                            ? 'bg-[#25D366]'
                                            : 'bg-gradient-to-r from-[#128C7E] to-[#25D366] hover:shadow-lg hover:shadow-emerald-500/30 active:scale-[0.98]'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Icon.Spinner className="w-4 h-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : submitStatus === 'success' ? (
                                        <>
                                            <Icon.Check className="w-4 h-4 wa-check" />
                                            Sent!
                                        </>
                                    ) : (
                                        <>
                                            <Icon.Send className="w-4 h-4" />
                                            Send location
                                        </>
                                    )}
                                </button>
                                {attemptedSubmit && !selectedLocation && (
                                    <p className="text-[11px] text-red-500 mt-1.5 text-center">Search for a place or share your current location.</p>
                                )}
                                {submitStatus === 'error' && <p className="text-[11px] text-red-500 mt-1.5 text-center">Something went wrong — please try again.</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PopupMenu>
    );
}