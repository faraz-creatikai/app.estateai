"use client";

import { deleteSalesScript, getFilteredSalesScript, getSalesScript } from "@/store/salescript/salesscript";
import { salesScriptGetDataInterface } from "@/store/salescript/salesscript.interface";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatContent(raw: string): string {
    if (!raw) return "";
    return raw
        .replace(/^"|"$/g, "")
        .replace(/\\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

const LIMIT_OPTIONS = [10, 25, 50, 100];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonCard() {
    return (
        <div className="rounded-2xl border border-[var(--color-primary-light)] bg-white p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
                <div className="space-y-2 flex-1">
                    <div className="h-4 w-40 rounded-lg bg-[var(--color-primary-lighter)]" />
                    <div className="h-3 w-24 rounded bg-[var(--color-primary-lighter)]" />
                </div>
                <div className="h-6 w-16 rounded-full bg-[var(--color-primary-lighter)]" />
            </div>
            <div className="space-y-2 mb-5">
                <div className="h-3 w-full rounded bg-[var(--color-primary-lighter)]" />
                <div className="h-3 w-5/6 rounded bg-[var(--color-primary-lighter)]" />
                <div className="h-3 w-4/6 rounded bg-[var(--color-primary-lighter)]" />
            </div>
            <div className="flex gap-2">
                <div className="h-8 w-20 rounded-lg bg-[var(--color-primary-lighter)]" />
                <div className="h-8 w-20 rounded-lg bg-[var(--color-primary-lighter)]" />
            </div>
        </div>
    );
}

function EmptyState({ filtered }: { filtered: boolean }) {
    return (
        <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--color-primary-light)] bg-white py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary-lighter)]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            </div>
            <p className="text-base font-bold text-slate-700">
                {filtered ? "No scripts match your search" : "No scripts yet"}
            </p>
            <p className="mt-1 text-xs text-slate-400 max-w-xs">
                {filtered
                    ? "Try adjusting your search term or clearing the filters."
                    : "Create your first sales script to get started."}
            </p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const isActive = status === "Active";
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold
      ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
            {status}
        </span>
    );
}

function ModeBadge({ mode }: { mode: string }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-primary-lighter)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-primary)]">
            {mode === "hindi" ? "🇮🇳" : "🇬🇧"}
            <span className="capitalize">{mode}</span>
        </span>
    );
}

function ScriptCard({
    script,
    onView,
    onEdit,
    onDelete,
}: {
    script: salesScriptGetDataInterface;
    onView: (s: salesScriptGetDataInterface) => void;
    onEdit: (id: string) => void;
    onDelete: (s: salesScriptGetDataInterface) => void;
}) {
    const preview = formatContent(script.Content);

    return (
        <div className="group flex flex-col rounded-2xl border border-[var(--color-primary-light)] bg-white shadow-sm hover:shadow-lg hover:shadow-[var(--color-primary-lighter)] hover:border-[var(--color-primary)] transition-all duration-200">
            {/* Card Top */}
            <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4">
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-slate-800 group-hover:text-[var(--color-primary)] transition-colors">
                        {script.Name}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                        {formatDate(script.createdAt)}
                    </p>
                </div>
                <StatusBadge status={script.Status} />
            </div>

            {/* Content Preview */}
            <div className="flex-1 px-6 pb-4">
                <p className="text-xs leading-relaxed text-slate-500 line-clamp-3">
                    {preview || <span className="italic text-slate-300">No content</span>}
                </p>
            </div>

            {/* Metadata chips */}
            {script.metadata && (
                <div className="px-6 pb-4 flex flex-wrap gap-2">
                    {script.metadata.tone && (
                        <span className="rounded-lg border border-[var(--color-primary-light)] px-2.5 py-1 text-[10px] font-semibold text-slate-500 truncate max-w-[180px]">
                            🎭 {script.metadata.tone}
                        </span>
                    )}
                    {(script.metadata.tips || script.metadata.callerTips)?.length > 0 && (
                        <span className="rounded-lg border border-[var(--color-primary-light)] px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                            💡 {(script.metadata.tips || script.metadata.callerTips).length} tips
                        </span>
                    )}
                </div>
            )}

            {/* Divider + Footer */}
            <div className="mt-auto border-t border-[var(--color-primary-light)] px-6 py-4 flex items-center justify-between gap-2">
                <ModeBadge mode={script.mode} />
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onDelete(script)}
                        className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-1.5 text-[var(--color-destructive)] hover:bg-red-100 transition-all"
                        title="Delete script"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onView(script)}
                        className="flex items-center gap-1.5 rounded-lg border border-[var(--color-primary-light)] bg-[var(--color-primary-lighter)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-all"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                        </svg>
                        View
                    </button>
                    <button
                        onClick={() => onEdit(script._id)}
                        className="flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--color-primary-dark)] transition-all"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                    </button>
                </div>
            </div>
        </div>
    );
}

function DeleteConfirmDialog({
    script,
    onCancel,
    onConfirm,
    deleting,
}: {
    script: salesScriptGetDataInterface;
    onCancel: () => void;
    onConfirm: () => void;
    deleting: boolean;
}) {
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [onCancel]);

    return (
        <>
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
            <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-red-100 bg-white p-6 shadow-2xl">
                {/* Icon */}
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-destructive)" strokeWidth="2" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                </div>

                {/* Text */}
                <h3 className="text-center text-base font-bold text-slate-800">Delete Script?</h3>
                <p className="mt-1.5 text-center text-xs text-slate-400 leading-relaxed">
                    <span className="font-semibold text-slate-600">"{script.Name}"</span> will be
                    permanently deleted. This action cannot be undone.
                </p>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={deleting}
                        className="flex-1 rounded-xl border-2 border-slate-200 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={deleting}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[var(--color-destructive)] py-2.5 text-sm font-bold text-white hover:opacity-90 transition-all disabled:opacity-60"
                    >
                        {deleting ? (
                            <>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 animate-spin">
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                                Deleting…
                            </>
                        ) : (
                            "Delete"
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}

// ─── Script Detail Drawer ─────────────────────────────────────────────────────

function ScriptDrawer({
    script,
    onClose,
    onEdit,
}: {
    script: salesScriptGetDataInterface | null;
    onClose: () => void;
    onEdit: (id: string) => void;
}) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [onClose]);

    if (!script) return null;

    const formattedContent = (script.Content ?? "")
        .replace(/^"|"$/g, "")
        .replace(/\\n/g, "\n");

    const handleCopy = () => {
        navigator.clipboard.writeText(formattedContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const tips = script.metadata?.tips || script.metadata?.callerTips || [];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-[var(--color-primary-light)] px-6 py-5">
                    <div>
                        <h2 className="text-base font-bold text-slate-800">{script.Name}</h2>
                        <div className="mt-1 flex items-center gap-2">
                            <StatusBadge status={script.Status} />
                            <ModeBadge mode={script.mode} />
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
                    >
                        ✕
                    </button>
                </div>

                {/* Drawer Body */}
                <div className="flex-1 overflow-y-auto">
                    {/* Script Content */}
                    <div className="px-6 py-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">
                                Script Content
                            </p>
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-1.5 rounded-lg border border-[var(--color-primary-light)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary-lighter)] transition-all"
                            >
                                {copied ? <><span>✓</span> Copied</> : <><span>⎘</span> Copy</>}
                            </button>
                        </div>
                        <div className="rounded-xl border border-[var(--color-primary-light)] bg-[var(--color-primary-lighter)] p-4">
                            <pre className="whitespace-pre-wrap font-[inherit] text-sm leading-relaxed text-slate-700">
                                {formattedContent || <span className="italic text-slate-300">No content</span>}
                            </pre>
                        </div>
                    </div>

                    {/* Metadata */}
                    {script.metadata && (
                        <div className="border-t border-[var(--color-primary-light)] px-6 py-5">
                            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">
                                AI Tips & Tone
                            </p>
                            {script.metadata.tone && (
                                <div className="mb-4 flex items-start gap-2">
                                    <span className="mt-0.5 text-sm">🎭</span>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-600">Tone</p>
                                        <p className="text-xs text-slate-500">{script.metadata.tone}</p>
                                    </div>
                                </div>
                            )}
                            {tips.length > 0 && (
                                <ul className="space-y-3">
                                    {tips.map((tip: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3 rounded-xl bg-[var(--color-primary-lighter)] px-4 py-3">
                                            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs font-bold">
                                                {i + 1}
                                            </span>
                                            <p className="text-xs leading-relaxed text-slate-600">{tip}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    {/* Meta info */}
                    <div className="border-t border-[var(--color-primary-light)] px-6 py-5">
                        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">
                            Details
                        </p>
                        <dl className="space-y-2">
                            {[
                                { label: "Script ID", value: script._id },
                                { label: "Created", value: formatDate(script.createdAt) },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex items-center justify-between">
                                    <dt className="text-xs text-slate-400">{label}</dt>
                                    <dd className="text-xs font-semibold text-slate-600 font-mono">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>

                {/* Drawer Footer */}
                <div className="border-t border-[var(--color-primary-light)] px-6 py-4 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border-2 border-[var(--color-primary-light)] py-2.5 text-sm font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary-lighter)] transition-all"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => { onClose(); onEdit(script._id); }}
                        className="flex-1 rounded-xl bg-[var(--color-primary)] py-2.5 text-sm font-bold text-white hover:bg-[var(--color-primary-dark)] transition-all"
                    >
                        Edit Script →
                    </button>
                </div>
            </div>
        </>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SalesScriptsPage() {
    const router = useRouter();

    const [scripts, setScripts] = useState<salesScriptGetDataInterface[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [keyword, setKeyword] = useState("");
    const [debouncedKeyword, setDebouncedKeyword] = useState("");
    const [limit, setLimit] = useState<number>(25);

    const [selectedScript, setSelectedScript] = useState<salesScriptGetDataInterface | null>(null);

    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<salesScriptGetDataInterface | null>(null);
    const [deleting, setDeleting] = useState(false);



    // Debounce keyword input
    const handleKeywordChange = (val: string) => {
        setKeyword(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setDebouncedKeyword(val), 400);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const result = await deleteSalesScript(deleteTarget._id);
            if (result !== null) {
                setScripts((prev) => prev.filter((s) => s._id !== deleteTarget._id));
                setDeleteTarget(null);
            }
        } finally {
            setDeleting(false);
        }
    };

    // Build query params string
    const buildParams = useCallback(() => {
        const p = new URLSearchParams();
        if (debouncedKeyword.trim()) p.set("keyword", debouncedKeyword.trim());
        p.set("limit", String(limit));
        return p.toString();
    }, [debouncedKeyword, limit]);

    // Fetch scripts
    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = buildParams();
                const hasFilters = debouncedKeyword.trim() || limit !== 25;
                const data = hasFilters
                    ? await getFilteredSalesScript(params)
                    : await getSalesScript();

                if (data === null) throw new Error("Failed to fetch scripts.");
                console.log(" wow ", data)
                setScripts(data.map((e:any) => {
                    return {
                        _id: e._id,
                        Name: e.Name,
                        Status: e.Status,
                        Content: e.Content,
                        mode: e.mode,
                        metadata: e.metadata,
                        createdAt: e.createdAt
                    }
                }));
            } catch (err: any) {
                setError(err.message ?? "Something went wrong.");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [debouncedKeyword, limit, buildParams]);

    const isFiltered = !!debouncedKeyword.trim() || limit !== 25;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[var(--color-primary-lighter)] to-white rounded-md overflow-hidden">
            {/* CSS Variables */}
            <style>{`
  
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&display=swap');
        body { font-family: 'DM Sans', sans-serif; }
        .heading-font { font-family: 'Instrument Serif', serif; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .animate-in { animation-fill-mode: both; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-from-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .fade-in { animation-name: fade-in; }
        .slide-in-from-right { animation-name: slide-in-from-right; }
        .duration-300 { animation-duration: 300ms; }
        @keyframes shimmer-skeleton {
          0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; }
        }
        .animate-pulse { animation: shimmer-skeleton 1.5s ease-in-out infinite; }
      `}</style>

            {/* ── Header ─────────────────────────────────────────────────────────── */}
            <header className="border-b border-[var(--color-primary-light)] bg-white/80 backdrop-blur-md sticky top-0 ">
                <div className="mx-auto flex max-w-6xl items-center justify-between max-md:px-3 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">Sales Scripts</span>
                    </div>
                    <button
                        onClick={() => router.push("/salesscript/add")}
                        className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--color-primary-dark)] transition-all"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        New Script
                    </button>
                </div>
            </header>

            {/* ── Page Content ───────────────────────────────────────────────────── */}
            <main className="mx-auto max-w-6xl max-md:px-3 px-6 py-10">
                {/* Title */}
                <div className="mb-8">
                    <div className="mb-2 flex items-center gap-2">
                        <div className="h-px flex-1 bg-[var(--color-primary-light)]" />
                        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)] opacity-60">
                            All Scripts
                        </span>
                        <div className="h-px flex-1 bg-[var(--color-primary-light)]" />
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <h1 className="heading-font text-4xl text-slate-800 leading-tight">Sales Scripts</h1>
                            <p className="mt-1 text-sm text-slate-400">
                                Manage and deploy your AI-generated call scripts.
                            </p>
                        </div>
                        {!loading && (
                            <span className="rounded-full bg-[var(--color-primary-lighter)] border border-[var(--color-primary-light)] px-4 py-1.5 text-xs font-bold text-[var(--color-primary)]">
                                {scripts.length} {scripts.length === 1 ? "script" : "scripts"}
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Filters Bar ────────────────────────────────────────────────── */}
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                    {/* Search */}
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => handleKeywordChange(e.target.value)}
                            placeholder="Search by name or content…"
                            className="w-full rounded-xl border-2 border-[var(--color-primary-light)] bg-white pl-10 pr-10 py-2.5 text-sm text-slate-700 placeholder:text-slate-300 outline-none transition-all focus:border-[var(--color-primary)] focus:shadow-sm focus:shadow-[var(--color-primary-light)]"
                        />
                        {keyword && (
                            <button
                                onClick={() => { setKeyword(""); setDebouncedKeyword(""); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Limit */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Show:</span>
                        <div className="flex rounded-xl border-2 border-[var(--color-primary-light)] overflow-hidden bg-white">
                            {LIMIT_OPTIONS.map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => setLimit(opt)}
                                    className={`px-3.5 py-2 text-xs font-bold transition-all
                    ${limit === opt
                                            ? "bg-[var(--color-primary)] text-white"
                                            : "text-slate-500 hover:bg-[var(--color-primary-lighter)] hover:text-[var(--color-primary)]"
                                        }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Clear filters */}
                    {isFiltered && (
                        <button
                            onClick={() => { setKeyword(""); setDebouncedKeyword(""); setLimit(25); }}
                            className="flex items-center gap-1.5 rounded-xl border-2 border-[var(--color-primary-light)] px-4 py-2.5 text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary-lighter)] transition-all whitespace-nowrap"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* Active filter pill */}
                {debouncedKeyword && (
                    <div className="mb-4 flex items-center gap-2">
                        <span className="text-xs text-slate-400">Showing results for</span>
                        <span className="rounded-full bg-[var(--color-primary-light)] px-3 py-1 text-xs font-bold text-[var(--color-primary)]">
                            "{debouncedKeyword}"
                        </span>
                    </div>
                )}

                {/* ── Error State ─────────────────────────────────────────────────── */}
                {error && (
                    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-6 py-4">
                        <span className="text-lg">⚠️</span>
                        <p className="text-sm font-medium text-red-600">{error}</p>
                        <button
                            onClick={() => setDebouncedKeyword(debouncedKeyword + "")}
                            className="ml-auto text-xs font-bold text-[var(--color-primary)] hover:underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* ── Grid ──────────────────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                    ) : scripts.length === 0 ? (
                        <EmptyState filtered={isFiltered} />
                    ) : (
                        scripts.map((script) => (
                            <ScriptCard
                                key={script._id}
                                script={script}
                                onView={setSelectedScript}
                                onEdit={(id) => router.push(`/salesscript/edit/${id}`)}
                                onDelete={setDeleteTarget}
                            />
                        ))
                    )}
                </div>

                {/* Results count footer */}
                {!loading && scripts.length > 0 && (
                    <p className="mt-8 text-center text-xs text-slate-300">
                        Showing {scripts.length} {scripts.length === 1 ? "script" : "scripts"}
                        {debouncedKeyword ? ` matching "${debouncedKeyword}"` : ""}
                    </p>
                )}
            </main>

            {/* ── Detail Drawer ─────────────────────────────────────────────────── */}
            <ScriptDrawer
                script={selectedScript}
                onClose={() => setSelectedScript(null)}
                onEdit={(id) => router.push(`/salesscript/edit/${id}`)}
            />
            {deleteTarget && (
                <DeleteConfirmDialog
                    script={deleteTarget}
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={handleDelete}
                    deleting={deleting}
                />
            )}
        </div>
    );
}