"use client";

import { useEffect, useState, type ReactNode } from "react";
import { QRCodeSVG } from "qrcode.react";
import { getSocket } from "@/socket/socket";
import { API_ROUTES } from "@/constants/ApiRoute";
import MasterProtectedRoute from "@/app/component/MasterProtectedRoutes";

type AccountDetails = {
    phone: string;
    name: string;
    imageUrl?: string | null;
};

type QRMeta = {
    generatedAt: number;
    refreshInterval: number;
};

// 👇 NEW
type ConnectionStatus = "loading" | "scanning" | "pairing" | "connected";
type ConnectionMode = "qr" | "pairing";

const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const DEFAULT_REFRESH_MS = 20_000;
const PAIRING_CODE_TTL_MS = 60_000; // WhatsApp pairing codes expire ~60s

// ── Icons ────────────────────────────────────────────────────────────
const ChatBubbleIcon = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path
            d="M4 12c0-4.42 3.8-8 8.5-8s8.5 3.58 8.5 8-3.8 8-8.5 8c-1.06 0-2.07-.18-3-.5L4 21l1.6-3.9C4.6 15.9 4 14.02 4 12Z"
            fill="currentColor"
        />
        <circle cx="9" cy="12" r="1.15" fill="white" />
        <circle cx="12.5" cy="12" r="1.15" fill="white" />
        <circle cx="16" cy="12" r="1.15" fill="white" />
    </svg>
);

const LockIcon = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
);

const CheckIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const PowerIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
        <line x1="12" y1="2" x2="12" y2="12"></line>
    </svg>
);

const SpinnerIcon = ({ className = "" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const BoltIcon = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
    </svg>
);

const InfoIcon = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8h.01M11 12h1v4h1" />
    </svg>
);

// 👇 NEW icons
const QrIcon = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4M20 17v4" />
    </svg>
);

const KeyIcon = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="8" cy="15" r="4" />
        <path d="M10.5 12.5 20 3M17 6l3 3M14 9l2 2" />
    </svg>
);

// ── Reusable side-panel for supporting content ──────────────────────
const InfoPanel = ({
    title,
    icon,
    items,
}: {
    title: string;
    icon: ReactNode;
    items: string[];
}) => (
    <div className="rounded-2xl border border-[var(--color-primary-light)]/50 dark:border-[var(--color-childbgdark)] bg-white dark:bg-[var(--color-bgdark)] p-5">
        <div className="flex items-center gap-2 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-primary-lighter)] text-[var(--color-primary)]">
                {icon}
            </span>
            <h4 className="text-sm font-bold text-gray-900 dark:text-[var(--color-txtlight)]">{title}</h4>
        </div>
        <ul className="space-y-2.5">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-500 dark:text-[var(--color-txtlight)]/70 leading-snug">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-[var(--color-primary)] shrink-0" />
                    {item}
                </li>
            ))}
        </ul>
    </div>
);

export default function Page() {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [qrMeta, setQrMeta] = useState<QRMeta | null>(null);
    const [status, setStatus] = useState<ConnectionStatus>("loading");
    const [account, setAccount] = useState<AccountDetails | null>(null);
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    const [secondsLeft, setSecondsLeft] = useState(0);
    const [progress, setProgress] = useState(1);

    // 👇 NEW: pairing-code state
    const [mode, setMode] = useState<ConnectionMode>("qr");
    const [phoneInput, setPhoneInput] = useState("");
    const [pairingCode, setPairingCode] = useState<string | null>(null);
    const [pairingGeneratedAt, setPairingGeneratedAt] = useState<number | null>(null);
    const [pairingError, setPairingError] = useState<string | null>(null);
    const [isRequestingCode, setIsRequestingCode] = useState(false);
    const [pairingSecondsLeft, setPairingSecondsLeft] = useState(0);

    // QR countdown ring (unchanged)
    useEffect(() => {
        if (!qrMeta) return;

        const tick = () => {
            const remaining = Math.max(0, qrMeta.refreshInterval - (Date.now() - qrMeta.generatedAt));
            setSecondsLeft(Math.ceil(remaining / 1000));
            setProgress(remaining / qrMeta.refreshInterval);
        };

        tick();
        const id = setInterval(tick, 250);
        return () => clearInterval(id);
    }, [qrMeta]);

    // 👇 NEW: pairing-code countdown (codes expire ~60s)
    useEffect(() => {
        if (!pairingGeneratedAt) return;

        const tick = () => {
            const remaining = Math.max(0, PAIRING_CODE_TTL_MS - (Date.now() - pairingGeneratedAt));
            setPairingSecondsLeft(Math.ceil(remaining / 1000));
            if (remaining <= 0) {
                setPairingCode(null);
                setPairingGeneratedAt(null);
            }
        };

        tick();
        const id = setInterval(tick, 250);
        return () => clearInterval(id);
    }, [pairingGeneratedAt]);

    useEffect(() => {
        fetch(API_ROUTES.MASTERS.WHATSAPP.WHATSAPP_CONNECTION_STATUS)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'connected') {
                    setStatus('connected');
                    setAccount(data.user);
                } else if (data.status === 'scanning') {
                    setStatus('scanning');
                    setMode('qr');
                    setQrCode(data.qrString);
                    setQrMeta({
                        generatedAt: data.generatedAt ?? Date.now(),
                        refreshInterval: data.refreshInterval ?? DEFAULT_REFRESH_MS,
                    });
                } else if (data.status === 'pairing') {
                    // 👇 NEW: resume showing an in-flight pairing code after a page refresh
                    setStatus('pairing');
                    setMode('pairing');
                    setPairingCode(data.pairingCode);
                    setPairingGeneratedAt(data.generatedAt ?? Date.now());
                    if (data.phoneNumber) setPhoneInput(data.phoneNumber);
                }
            })
            .catch(err => console.error("Failed to fetch initial status", err));

        const socket = getSocket();
        if (!socket) return;

        socket.emit("whatsapp:start_viewing");

        const handleQR = (data: { qrString: string; generatedAt?: number; refreshInterval?: number }) => {
            setStatus(prev => {
                if (prev === "connected") return prev;
                setQrCode(data.qrString);
                setQrMeta({
                    generatedAt: data.generatedAt ?? Date.now(),
                    refreshInterval: data.refreshInterval ?? DEFAULT_REFRESH_MS,
                });
                setIsDisconnecting(false);
                return "scanning";
            });
        };

        // 👇 NEW: pairing code arrives async, same pattern as QR
        const handlePairingCode = (data: { code: string; generatedAt?: number }) => {
            setStatus(prev => (prev === "connected" ? prev : "pairing"));
            setPairingCode(data.code);
            setPairingGeneratedAt(data.generatedAt ?? Date.now());
            setPairingError(null);
            setIsRequestingCode(false);
        };

        const handlePairingError = (data: { message: string }) => {
            setPairingError(data.message || "Failed to generate pairing code. Try again.");
            setIsRequestingCode(false);
        };

        const handleStatus = (data: { status: string; user?: AccountDetails }) => {
            if (data.status === "connected") {
                setStatus("connected");
                setQrCode(null);
                setQrMeta(null);
                setPairingCode(null);
                setPairingGeneratedAt(null);
                if (data.user) setAccount(data.user);
            } else if (data.status === "disconnected") {
                setStatus("loading");
                setAccount(null);
                setQrMeta(null);
                setPairingCode(null);
                setPairingGeneratedAt(null);
            }
        };

        socket.on("whatsapp:qr", handleQR);
        socket.on("whatsapp:status", handleStatus);
        socket.on("whatsapp:pairing_code", handlePairingCode); // 👈 NEW
        socket.on("whatsapp:pairing_error", handlePairingError); // 👈 NEW

        return () => {
            socket.off("whatsapp:qr", handleQR);
            socket.off("whatsapp:status", handleStatus);
            socket.off("whatsapp:pairing_code", handlePairingCode);
            socket.off("whatsapp:pairing_error", handlePairingError);
            socket.emit("whatsapp:stop_viewing");
        };
    }, []);

    const handleDisconnect = async () => {
        setIsDisconnecting(true);
        try {
            await fetch(API_ROUTES.MASTERS.WHATSAPP.WHATSAPP_CONNECTION_LOGOUT, {
                method: "POST",
            });
        } catch (error) {
            console.error("Failed to disconnect", error);
            setIsDisconnecting(false);
        }
    };

    // 👇 NEW: request a pairing code for the entered phone number
    const handleRequestPairingCode = async () => {
        const digitsOnly = phoneInput.replace(/[^0-9]/g, "");
        if (digitsOnly.length < 8) {
            setPairingError("Enter your full number with country code, e.g. 91XXXXXXXXXX.");
            return;
        }

        setPairingError(null);
        setPairingCode(null);
        setIsRequestingCode(true);

        try {
            const res = await fetch(API_ROUTES.MASTERS.WHATSAPP.WHATSAPP_CONNECTION_PAIRING_CODE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber: digitsOnly }),
            });
            const data = await res.json();
            if (!data.success) {
                setPairingError(data.error || "Something went wrong. Try again.");
                setIsRequestingCode(false);
            }
            // success case: code arrives via the "whatsapp:pairing_code" socket event
        } catch (error) {
            console.error("Failed to request pairing code", error);
            setPairingError("Couldn't reach the server. Try again.");
            setIsRequestingCode(false);
        }
    };

    const formattedPairingCode = pairingCode ? pairingCode.match(/.{1,4}/g)?.join("-") ?? pairingCode : null;

    const statusChip =
        status === "connected"
            ? { label: "Connected", cls: "bg-[#DCF8C6] text-[#075E54] dark:bg-[#128C7E]/20 dark:text-[#25D366]", dot: "bg-[#25D366] animate-pulse" }
            : status === "scanning" || status === "pairing"
                ? { label: status === "pairing" ? "Awaiting pairing" : "Awaiting scan", cls: "bg-[var(--color-primary-lighter)] text-[var(--color-primary)]", dot: "bg-[var(--color-primary)] animate-pulse" }
                : { label: "Checking status", cls: "bg-[var(--color-primary-lighter)] text-[var(--color-primary)]", dot: "bg-[var(--color-primary)]" };

    // Toggle is only meaningful before a connection exists
    const showModeToggle = status !== "connected";

    return (
        <MasterProtectedRoute>
            <div className="w-full max-w-6xl mx-auto space-y-6">

                {/* ── Main content: connection card + supporting info, uses full page width ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-6 items-start">
                    {/* Connection card */}
                    <div className="rounded-[1.75rem] overflow-hidden bg-white dark:bg-[var(--color-bgdark)] border border-[var(--color-primary-light)]/60 dark:border-[var(--color-childbgdark)] shadow-[0_20px_60px_-15px_rgba(0,102,204,0.18)]">

                        {/* 👇 NEW: QR / Pairing-code segmented toggle */}
                        {showModeToggle && (
                            <div className="px-8 pt-6">
                                <div className="flex p-1 rounded-xl bg-[var(--color-primary-lighter)]/60 dark:bg-[var(--color-childbgdark)]">
                                    <button
                                        onClick={() => {
                                            setMode("qr");
                                            setPairingError(null);
                                        }}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${mode === "qr"
                                                ? "bg-white dark:bg-[var(--color-bgdark)] text-[var(--color-primary)] shadow-sm"
                                                : "text-gray-500 dark:text-[var(--color-txtlight)]/60"
                                            }`}
                                    >
                                        <QrIcon className="h-3.5 w-3.5" />
                                        Scan QR
                                    </button>
                                    <button
                                        onClick={() => {
                                            setMode("pairing");
                                            setPairingError(null);
                                        }}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${mode === "pairing"
                                                ? "bg-white dark:bg-[var(--color-bgdark)] text-[var(--color-primary)] shadow-sm"
                                                : "text-gray-500 dark:text-[var(--color-txtlight)]/60"
                                            }`}
                                    >
                                        <KeyIcon className="h-3.5 w-3.5" />
                                        Pairing Code
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="px-8 py-8">
                            {status === "loading" && (
                                <div className="flex flex-col items-center justify-center py-6 space-y-5">
                                    <div className="relative h-12 w-12">
                                        <div className="absolute inset-0 rounded-full border-[3px] border-[var(--color-primary-lighter)]"></div>
                                        <div className="absolute inset-0 rounded-full border-[3px] border-[var(--color-primary)] border-t-transparent animate-spin"></div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-[var(--color-txtlight)]">
                                            {isDisconnecting ? "Disconnecting your account…" : "Checking your connection…"}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {isDisconnecting ? "Unlinking this device from WhatsApp." : "This usually takes just a few seconds."}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* 👇 NEW: mode is "pairing" but status is still loading/idle — show phone entry form */}
                            {status !== "connected" && mode === "pairing" && status !== "pairing" && (
                                <div className="flex flex-col items-center py-4">
                                    <div className="h-14 w-14 rounded-2xl bg-[var(--color-primary-lighter)] flex items-center justify-center text-[var(--color-primary)] mb-4">
                                        <KeyIcon className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-[var(--color-txtlight)]">
                                        Link with a pairing code
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1 text-center max-w-[280px]">
                                        Enter your WhatsApp number with country code — no camera needed.
                                    </p>

                                    <div className="w-full mt-5 space-y-2">
                                        <input
                                            type="tel"
                                            inputMode="numeric"
                                            value={phoneInput}
                                            onChange={(e) => setPhoneInput(e.target.value)}
                                            placeholder="e.g. 919876543210"
                                            className="w-full px-4 py-3 rounded-xl border border-[var(--color-primary-light)]/60 dark:border-[var(--color-childbgdark)] bg-white dark:bg-[var(--color-childbgdark)] text-sm text-gray-900 dark:text-[var(--color-txtlight)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
                                        />
                                        {pairingError && (
                                            <p className="text-[11px] text-[var(--color-destructive)] font-medium px-1">{pairingError}</p>
                                        )}
                                        <button
                                            onClick={handleRequestPairingCode}
                                            disabled={isRequestingCode}
                                            className="w-full py-3 px-4 bg-[var(--color-primary)] hover:opacity-90 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            {isRequestingCode ? (
                                                <>
                                                    <SpinnerIcon className="animate-spin h-3.5 w-3.5" />
                                                    Generating code…
                                                </>
                                            ) : (
                                                <>
                                                    <KeyIcon className="h-3.5 w-3.5" />
                                                    Send me a pairing code
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* 👇 NEW: pairing code has been generated — display it */}
                            {status === "pairing" && pairingCode && (
                                <div className="flex flex-col items-center">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-[var(--color-txtlight)]/70 mb-3">
                                        Enter this code on your phone
                                    </p>

                                    <div className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-[var(--color-primary-lighter)]/60 dark:bg-[var(--color-primary-darker)]/20 border border-dashed border-[var(--color-primary)]/40">
                                        <p className="text-2xl font-bold tracking-[0.2em] text-[var(--color-primary)] font-mono">
                                            {formattedPairingCode}
                                        </p>
                                    </div>

                                    <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#128C7E] dark:text-[#25D366]">
                                        {pairingSecondsLeft > 0 ? `Expires in ${pairingSecondsLeft}s` : "Code expired"}
                                    </div>

                                    {pairingSecondsLeft <= 0 ? (
                                        <button
                                            onClick={handleRequestPairingCode}
                                            disabled={isRequestingCode}
                                            className="mt-4 py-2 px-4 bg-[var(--color-primary)] hover:opacity-90 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            {isRequestingCode ? (
                                                <SpinnerIcon className="animate-spin h-3.5 w-3.5" />
                                            ) : (
                                                <KeyIcon className="h-3.5 w-3.5" />
                                            )}
                                            Resend code
                                        </button>
                                    ) : (
                                        <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-[#DCF8C6]/60 dark:bg-[#128C7E]/20 rounded-full">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]"></span>
                                            </span>
                                            <p className="text-[10px] font-bold tracking-wide text-[#075E54] dark:text-[#25D366] uppercase">
                                                Waiting for pairing
                                            </p>
                                        </div>
                                    )}

                                    <ol className="mt-6 w-full space-y-3">
                                        {[
                                            "Open WhatsApp on your phone",
                                            "Tap Menu or Settings, then Linked Devices",
                                            "Tap \"Link with phone number instead\" and enter the code above",
                                        ].map((step, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-lighter)] text-[10px] font-bold text-[var(--color-primary)]">
                                                    {i + 1}
                                                </span>
                                                <p className="text-xs text-gray-600 dark:text-[var(--color-txtlight)]/70 leading-snug pt-0.5">
                                                    {step}
                                                </p>
                                            </li>
                                        ))}
                                    </ol>

                                    <div className="mt-5 flex items-start gap-2 rounded-xl bg-[var(--color-primary-lighter)]/60 dark:bg-[var(--color-primary-darker)]/20 px-3 py-2.5">
                                        <LockIcon className="h-3.5 w-3.5 text-[var(--color-primary)] shrink-0 mt-0.5" />
                                        <p className="text-[11px] leading-snug text-gray-500 dark:text-[var(--color-txtlight)]/70">
                                            Your chats stay end-to-end encrypted — we only relay them through your own WhatsApp number.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {status === "scanning" && qrCode && mode === "qr" && (
                                <div className="flex flex-col items-center">
                                    <div className="relative w-[196px] h-[196px]">
                                        <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full -rotate-90">
                                            <circle cx="60" cy="60" r={RING_RADIUS} fill="none" stroke="#DCF8C6" strokeWidth="6" className="dark:opacity-20" />
                                            <circle
                                                cx="60" cy="60" r={RING_RADIUS} fill="none"
                                                stroke="#25D366" strokeWidth="6" strokeLinecap="round"
                                                strokeDasharray={RING_CIRCUMFERENCE}
                                                strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
                                                style={{ transition: "stroke-dashoffset 0.25s linear" }}
                                            />
                                        </svg>
                                        <div className="absolute inset-[14px] rounded-2xl bg-white flex items-center justify-center shadow-inner">
                                            <QRCodeSVG
                                                value={qrCode}
                                                size={150}
                                                bgColor={"#ffffff"}
                                                fgColor={"#0f172a"}
                                                level={"L"}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#128C7E] dark:text-[#25D366]">
                                        Refreshes in {secondsLeft}s
                                    </div>

                                    <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-[#DCF8C6]/60 dark:bg-[#128C7E]/20 rounded-full">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]"></span>
                                        </span>
                                        <p className="text-[10px] font-bold tracking-wide text-[#075E54] dark:text-[#25D366] uppercase">
                                            Live QR Active
                                        </p>
                                    </div>

                                    <ol className="mt-6 w-full space-y-3">
                                        {[
                                            "Open WhatsApp on your phone",
                                            "Tap Menu or Settings, then Linked Devices",
                                            "Point your phone at this screen to scan",
                                        ].map((step, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-lighter)] text-[10px] font-bold text-[var(--color-primary)]">
                                                    {i + 1}
                                                </span>
                                                <p className="text-xs text-gray-600 dark:text-[var(--color-txtlight)]/70 leading-snug pt-0.5">
                                                    {step}
                                                </p>
                                            </li>
                                        ))}
                                    </ol>

                                    <div className="mt-5 flex items-start gap-2 rounded-xl bg-[var(--color-primary-lighter)]/60 dark:bg-[var(--color-primary-darker)]/20 px-3 py-2.5">
                                        <LockIcon className="h-3.5 w-3.5 text-[var(--color-primary)] shrink-0 mt-0.5" />
                                        <p className="text-[11px] leading-snug text-gray-500 dark:text-[var(--color-txtlight)]/70">
                                            Your chats stay end-to-end encrypted — we only relay them through your own WhatsApp number.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {status === "connected" && (
                                <div className="flex flex-col items-center py-2 space-y-5">
                                    <div className="relative h-16 w-16">
                                        <span className="absolute inset-0 rounded-full bg-[#25D366]/20 scale-150 animate-breathe" />
                                        <div className="relative h-16 w-16 bg-gradient-to-tr from-[#128C7E] to-[#25D366] rounded-2xl shadow-lg shadow-[#25D366]/30 flex items-center justify-center animate-pop-in">
                                            <CheckIcon className="w-8 h-8 text-white" />
                                        </div>
                                    </div>

                                    <div className="text-center w-full">
                                        <p className="text-base font-bold text-gray-900 dark:text-[var(--color-txtlight)]">You're all set!</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Messages now sync between WhatsApp and your CRM in real time.
                                        </p>

                                        {account && (
                                            <div className="mt-4 mb-5 p-3  dark:bg-[var(--color-childbgdark)]  dark:border-[#128C7E]/30 rounded-xl w-full text-left flex items-center gap-3">
                                                {account.imageUrl ? (
                                                    <img
                                                        src={account.imageUrl}
                                                        alt={account.name}
                                                        className="h-10 w-10 rounded-full object-cover shadow-sm shrink-0 ring-2 ring-[#25D366]"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-bold text-sm uppercase shrink-0 ring-2 ring-[#25D366]">
                                                        {account.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-semibold text-gray-900 dark:text-[var(--color-txtlight)] truncate">{account.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">+{account.phone}</p>
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleDisconnect}
                                            disabled={isDisconnecting}
                                            className="w-full py-2.5 px-4 bg-[var(--color-destructive)]/10 hover:bg-[var(--color-destructive)]/20 text-[var(--color-destructive)] border border-[var(--color-destructive)]/30 hover:border-[var(--color-destructive)]/50 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            {isDisconnecting ? (
                                                <>
                                                    <SpinnerIcon className="animate-spin h-3.5 w-3.5" />
                                                    Disconnecting...
                                                </>
                                            ) : (
                                                <>
                                                    <PowerIcon className="h-3.5 w-3.5" />
                                                    Disconnect Account
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <p className="flex items-center pl-8 pb-4 gap-1.5 text-[11px] text-gray-400">
                            <LockIcon className="h-3 w-3" /> Secured with end-to-end encryption
                        </p>
                    </div>
                    {/* Supporting info — fills the wide dashboard column instead of leaving it empty */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        <div className="relative rounded-t-md overflow-hidden bg-gradient-to-br from-[#075E54] via-[#128C7E] to-[#25D366] px-8 pt-8 pb-9">
                            <div className="relative flex flex-col items-center text-center">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/90 mb-2">
                                    <ChatBubbleIcon className="h-4 w-4 text-white" />
                                    {status === 'connected' ? 'Live & Connected' : 'WhatsApp Business'}
                                </span>

                                <h3 className="text-xl font-bold text-white tracking-tight">Connect your WhatsApp</h3>
                                <p className="text-xs text-white/80 mt-1 max-w-[240px] mx-auto">
                                    Bring every WhatsApp conversation straight into your CRM — no extra app needed.
                                </p>
                            </div>
                        </div>
                        <InfoPanel
                            title="Why connect WhatsApp"
                            icon={<BoltIcon className="h-3.5 w-3.5" />}
                            items={[
                                "Reply to leads without leaving your CRM",
                                "Every chat is logged against the right contact automatically",
                                "Your whole team sees the same conversation history",
                            ]}
                        />
                        <InfoPanel
                            title="Good to know"
                            icon={<InfoIcon className="h-3.5 w-3.5" />}
                            items={[
                                "Only one WhatsApp number can be linked at a time",
                                "Pairing codes expire after about a minute — resend if it lapses",
                                "Disconnecting only unlinks this device, not your WhatsApp account",
                            ]}
                        />
                    </div>

                </div>

            </div>

            <style jsx>{`
        @keyframes popIn {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.35; }
          50% { transform: scale(1.15); opacity: 0.15; }
        }
        .animate-pop-in { animation: popIn 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
        .animate-breathe { animation: breathe 2.4s ease-in-out infinite; }
      `}</style>
        </MasterProtectedRoute>
    );
}