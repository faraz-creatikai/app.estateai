"use client";

import { addSalesScript } from "@/store/salescript/salesscript";
import { ApiResponse, salesScriptAllDataInterface, SalesScriptPayload } from "@/store/salescript/salesscript.interface";
import { useState } from "react";





// ─── Sub-components ───────────────────────────────────────────────────────────

function FloatingLabel({
    id,
    label,
    children,
    required,
}: {
    id: string;
    label: string;
    children: React.ReactNode;
    required?: boolean;
}) {
    return (
        <div className="relative flex flex-col gap-1.5">
            <label
                htmlFor={id}
                className="text-xs font-semibold tracking-widest uppercase text-[var(--color-primary)] opacity-80"
            >
                {label}
                {required && <span className="ml-1 text-[var(--color-destructive)]">*</span>}
            </label>
            {children}
        </div>
    );
}

function ModeCard({
    value,
    selected,
    onClick,
    icon,
    label,
    sub,
}: {
    value: string;
    selected: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    sub: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative flex items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all duration-200 cursor-pointer w-full
        ${selected
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-lighter)] shadow-md shadow-[var(--color-primary-light)]"
                    : "border-[var(--color-primary-light)] bg-white hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-lighter)]"
                }`}
        >
            {/* Selection dot */}
            <span
                className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all
          ${selected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                        : "border-[var(--color-muted)]"
                    }`}
            >
                {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
            </span>

            {/* Icon */}
            <span
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-lg transition-all
          ${selected
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[var(--color-primary-lighter)] text-[var(--color-primary)]"
                    }`}
            >
                {icon}
            </span>

            {/* Text */}
            <span className="flex flex-col">
                <span
                    className={`text-sm font-bold tracking-tight transition-colors
            ${selected ? "text-[var(--color-primary)]" : "text-slate-700"}`}
                >
                    {label}
                </span>
                <span className="text-xs text-slate-400">{sub}</span>
            </span>

            {/*  {selected && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
          Selected
        </span>
      )} */}
        </button>
    );
}

function ScriptPreview({ response }: { response: salesScriptAllDataInterface }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(response.Content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formattedContent = (response.Content ?? "")
        .replace(/^"|"$/g, "")
        .replace(/\\n/g, "\n");

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8 rounded-2xl border border-[var(--color-primary-light)] bg-gradient-to-br from-[var(--color-primary-lighter)] to-white overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-primary-light)] bg-white/60 px-6 py-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white text-sm">
                        ✓
                    </span>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Script Generated</p>
                        <p className="text-xs text-slate-400">
                            {response.Name} •{" "}
                            <span className="capitalize">{response.mode}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold
            ${response.Status === "Active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                    >
                        {response.Status}
                    </span>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 rounded-lg border border-[var(--color-primary-light)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)]"
                    >
                        {copied ? (
                            <>
                                <span>✓</span> Copied
                            </>
                        ) : (
                            <>
                                <span>⎘</span> Copy
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <pre className="whitespace-pre-wrap font-[inherit] text-sm leading-relaxed text-slate-700">
                    {formattedContent}
                </pre>
            </div>

            {/* Metadata */}
            {response.metadata && (
                <div className="border-t border-[var(--color-primary-light)] bg-white/40 px-6 py-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">
                        AI Tips & Tone
                    </p>
                    {response.metadata.tone && (
                        <p className="mb-3 text-xs text-slate-500">
                            <span className="font-semibold text-slate-600">Tone:</span>{" "}
                            {response.metadata.tone}
                        </p>
                    )}
                    {response.metadata.tips?.length > 0 && (
                        <ul className="space-y-2">
                            {response.metadata.tips.map((tip: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-slate-500">
                                    <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold">
                                        {i + 1}
                                    </span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AddSalesScriptPage() {
    const [form, setForm] = useState<SalesScriptPayload>({
        Name: "",
        Status: "Active",
        userPrompt: "",
        mode: "hindi",
        scriptMode: "ai",
        Content: "",
    });

    const [loading, setLoading] = useState(false);
    const [generatedScript, setGeneratedScript] = useState<salesScriptAllDataInterface | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<"form" | "preview">("form");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Replace the existing validation block:
        if (!form.Name.trim()) return setError("Script name is required.");
        if (form.scriptMode === "ai" && !form.userPrompt.trim())
            return setError("Customer description is required.");
        if (form.scriptMode === "manual" && !form.Content?.trim())
            return setError("Script content is required.");



        setLoading(true);
        setError(null);

        try {
            // Mock generated response (replace with your real API call result)
            const mockApiResponse: ApiResponse = {
                _id: crypto.randomUUID(),
                Name: form.Name,
                Content: `"Introduction:\\nNamaste, mera naam [Caller Name] hai.\\n\\nMessage:\\n${form.userPrompt}\\n\\nAction:\\nKya aap is candidate ke details discuss karne mein interested hain?"`,
                mode: form.mode,
                metadata: {
                    tone: "Professional and proactive",
                    tips: [
                        "Ensure the caller is aware of the specific requirements.",
                        "Be ready to provide candidate details immediately.",
                        "Show personalization by using customer context.",
                    ],
                },
                Status: form.Status,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            // Replace the existing payload block:
            const payload: any = {
                Name: form.Name,
                Status: form.Status,
                mode: form.mode,
                ...(form.scriptMode === "ai"
                    ? { userPrompt: form.userPrompt }
                    : { ScriptContent: form.Content }),
            };

            const result = await addSalesScript(payload);

            if (result) {
                
                setGeneratedScript({
                      Name: result.Name,
  Status: result.Status,
  Content: result.Content,
  mode: result.mode,
  metadata: result.metadata,
  createdAt: result.createdAt
                });
                
                setStep("preview");
            } else {
                setError("Failed to save script. Please try again.");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setForm({ Name: "", Status: "Active", userPrompt: "", mode: "hindi" });
        setGeneratedScript(null);
        setStep("form");
        setError(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[var(--color-primary-lighter)] to-white">
            {/* ── CSS Variables ─────────────────────────────────────────────────── */}
            <style>{`


        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&display=swap');

        body { font-family: 'DM Sans', sans-serif; }

        .heading-font { font-family: 'Instrument Serif', serif; }

        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(0,102,204,0.3); }
          70% { box-shadow: 0 0 0 10px rgba(0,102,204,0); }
          100% { box-shadow: 0 0 0 0 rgba(0,102,204,0); }
        }
        .pulse-ring { animation: pulse-ring 1.5s infinite; }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shimmer-btn {
          background-size: 200% auto;
          animation: shimmer 2s linear infinite;
        }

        .animate-in {
          animation-fill-mode: both;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-from-bottom-4 {
          from { transform: translateY(1rem); }
          to { transform: translateY(0); }
        }
        .fade-in { animation-name: fade-in; }
        .slide-in-from-bottom-4 { animation-name: slide-in-from-bottom-4, fade-in; }
        .duration-500 { animation-duration: 500ms; }
      `}</style>

            {/* ── Top bar ──────────────────────────────────────────────────────── */}
            <header className="border-b border-[var(--color-primary-light)] bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 max-md:px-3 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">Sales Scripts</span>
                    </div>

                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span>Scripts</span>
                        <span>/</span>
                        <span className="font-semibold text-[var(--color-primary)]">Add New</span>
                    </nav>
                </div>
            </header>

            {/* ── Page Content ──────────────────────────────────────────────────── */}
            <main className="mx-auto max-w-5xl px-6 max-md:px-3 py-10">
                {/* Page Title */}
                <div className="mb-10">
                    <div className="mb-2 flex items-center gap-2">
                        <div className="h-px flex-1 bg-[var(--color-primary-light)]" />
                        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)] opacity-60">
                            New Script
                        </span>
                        <div className="h-px flex-1 bg-[var(--color-primary-light)]" />
                    </div>
                    <h1 className="heading-font text-4xl text-slate-800 leading-tight">
                        Create Sales Script
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">
                        Fill in the details below and let AI craft the perfect script for your sales team.
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8 flex items-center gap-3">
                    {[
                        { key: "form", label: "Configure" },
                        { key: "preview", label: "Preview & Save" },
                    ].map((s, i) => (
                        <div key={s.key} className="flex items-center gap-3">
                            {i > 0 && (
                                <div
                                    className={`h-px w-8 transition-all ${step === "preview"
                                        ? "bg-[var(--color-primary)]"
                                        : "bg-[var(--color-muted)]"
                                        }`}
                                />
                            )}
                            <div className="flex items-center gap-2">
                                <span
                                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all
                    ${step === s.key
                                            ? "bg-[var(--color-primary)] text-white pulse-ring"
                                            : step === "preview" && s.key === "form"
                                                ? "bg-emerald-500 text-white"
                                                : "bg-[var(--color-muted)] text-[var(--color-primary)]"
                                        }`}
                                >
                                    {step === "preview" && s.key === "form" ? "✓" : i + 1}
                                </span>
                                <span
                                    className={`text-xs font-semibold ${step === s.key ? "text-[var(--color-primary)]" : "text-slate-400"
                                        }`}
                                >
                                    {s.label}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Form Card ──────────────────────────────────────────────────── */}
                <div className="rounded-2xl border border-[var(--color-primary-light)] bg-white shadow-xl shadow-[var(--color-primary-lighter)]">
                    <form onSubmit={handleSubmit}>
                        {/* Card Header */}
                        <div className="border-b border-[var(--color-primary-light)] px-8 max-md:px-4 py-6">
                            <h2 className="text-base font-bold text-slate-800">Script Details</h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Configure your AI-powered sales script settings
                            </p>
                        </div>

                        {/* Card Body */}
                        <div className="space-y-7 px-8 max-md:px-4 py-8">
                            {/* Name + Status Row */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <FloatingLabel id="Name" label="Script Name" required>
                                    <input
                                        id="Name"
                                        name="Name"
                                        type="text"
                                        value={form.Name}
                                        onChange={handleChange}
                                        placeholder="e.g. Supervisor Placement Script"
                                        className="rounded-xl border-2 border-[var(--color-primary-light)] bg-[var(--color-primary-lighter)] px-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 outline-none transition-all focus:border-[var(--color-primary)] focus:bg-white focus:shadow-sm focus:shadow-[var(--color-primary-light)]"
                                    />
                                </FloatingLabel>

                                <FloatingLabel id="Status" label="Status">
                                    <select
                                        id="Status"
                                        name="Status"
                                        value={form.Status}
                                        onChange={handleChange}
                                        className="rounded-xl border-2 border-[var(--color-primary-light)] bg-[var(--color-primary-lighter)] px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-[var(--color-primary)] focus:bg-white appearance-none cursor-pointer"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </FloatingLabel>
                            </div>

                            {/* Mode Selector */}
                            <div>
                                <label className="mb-3 block text-xs font-semibold tracking-widest uppercase text-[var(--color-primary)] opacity-80">
                                    Script Language / Mode
                                </label>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <ModeCard
                                        value="hindi"
                                        selected={form.mode === "hindi"}
                                        onClick={() => setForm((p) => ({ ...p, mode: "hindi" }))}
                                        icon={<span>🇮🇳</span>}
                                        label="Hindi"
                                        sub="Hinglish — natural & relatable"
                                    />
                                    <ModeCard
                                        value="english"
                                        selected={form.mode === "english"}
                                        onClick={() => setForm((p) => ({ ...p, mode: "english" }))}
                                        icon={<span>🇬🇧</span>}
                                        label="English"
                                        sub="Professional formal tone"
                                    />
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-4">
                                <div className="h-px flex-1 bg-[var(--color-primary-light)]" />
                                <span className="text-xs font-semibold uppercase tracking-widest text-slate-300">
                                    Script Content
                                </span>
                                <div className="h-px flex-1 bg-[var(--color-primary-light)]" />
                            </div>

                            {/* Script Mode Toggle */}
                            <div>
                                <label className="mb-3 block text-xs font-semibold tracking-widest uppercase text-[var(--color-primary)] opacity-80">
                                    How would you like to create the script?
                                </label>
                                <div className="flex rounded-xl border-2 border-[var(--color-primary-light)] overflow-hidden bg-[var(--color-primary-lighter)]">
                                    {(["ai", "manual"] as const).map((m) => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => setForm((p) => ({ ...p, scriptMode: m }))}
                                            className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold transition-all
          ${form.scriptMode === m
                                                    ? "bg-[var(--color-primary)] text-white shadow-md"
                                                    : "text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
                                                }`}
                                        >
                                            {m === "ai" ? (
                                                <>
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                                        <path d="M5 3l14 9-14 9V3z" />
                                                    </svg>
                                                    Generate with AI
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                    Write Manually
                                                </>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* AI Prompt — shown only when scriptMode === "ai" */}
                            {form.scriptMode === "ai" && (
                                <FloatingLabel id="userPrompt" label="Customer Description" required>
                                    <div className="relative">
                                        <textarea
                                            id="userPrompt"
                                            name="userPrompt"
                                            value={form.userPrompt}
                                            onChange={handleChange}
                                            rows={5}
                                            placeholder="Describe the customer, their industry, job requirement, or any relevant context. The AI will use this to craft a personalized script…"
                                            className="w-full rounded-xl border-2 border-[var(--color-primary-light)] bg-[var(--color-primary-lighter)] px-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 outline-none transition-all resize-none focus:border-[var(--color-primary)] focus:bg-white focus:shadow-sm focus:shadow-[var(--color-primary-light)]"
                                        />
                                        <span className="absolute bottom-3 right-3 text-xs text-slate-300">
                                            {form.userPrompt.length} chars
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">
                                        💡 More context = better script. Mention industry, role, pain points, and tone.
                                    </p>
                                </FloatingLabel>
                            )}

                            {/* Manual Content — shown only when scriptMode === "manual" */}
                            {form.scriptMode === "manual" && (
                                <FloatingLabel id="Content" label="Script Content" required>
                                    <div className="relative">
                                        <textarea
                                            id="Content"
                                            name="Content"
                                            value={form.Content}
                                            onChange={handleChange}
                                            rows={8}
                                            placeholder="Write your script here — Introduction, Message, and Call to Action…"
                                            className="w-full rounded-xl border-2 border-[var(--color-primary-light)] bg-[var(--color-primary-lighter)] px-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 outline-none transition-all resize-none focus:border-[var(--color-primary)] focus:bg-white focus:shadow-sm focus:shadow-[var(--color-primary-light)] font-mono leading-relaxed"
                                        />
                                        <span className="absolute bottom-3 right-3 text-xs text-slate-300">
                                            {(form.Content ?? "").length} chars
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">
                                        ✏️ Your content will be saved as-is — no AI processing.
                                    </p>
                                </FloatingLabel>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                    <span className="text-base">⚠️</span>
                                    <p className="text-xs font-medium text-[var(--color-destructive)]">{error}</p>
                                </div>
                            )}
                        </div>

                        {/* Card Footer */}
                        <div className="flex items-center justify-between border-t border-[var(--color-primary-light)] px-8 py-5">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="text-xs font-semibold text-slate-400 hover:text-[var(--color-primary)] transition-colors"
                            >
                                Clear Form
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`relative flex items-center gap-2.5 overflow-hidden rounded-xl px-8 py-3 text-sm font-bold text-white transition-all
                  ${loading
                                        ? "cursor-not-allowed bg-[var(--color-primary-dark)] opacity-70"
                                        : "bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-dark)] to-[var(--color-primary)] shimmer-btn hover:shadow-lg hover:shadow-[var(--color-primary-light)] hover:-translate-y-0.5 active:translate-y-0"
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <span className="flex h-4 w-4 animate-spin items-center justify-center">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                            </svg>
                                        </span>
                                        Generating Script…
                                    </>
                                ) : (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                            <path d="M5 3l14 9-14 9V3z" />
                                        </svg>
                                        Generate Script
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* ── Script Preview ──────────────────────────────────────────────── */}
                {generatedScript && <ScriptPreview response={generatedScript} />}

                {/* ── Save Actions (after preview) ───────────────────────────────── */}
                {generatedScript && (
                    <div className="animate-in fade-in duration-500 mt-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-4">
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold">
                                ✓
                            </span>
                            <p className="text-sm font-semibold text-emerald-700">
                                Script saved successfully
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleReset}
                                className="rounded-lg border-2 border-[var(--color-primary-light)] px-4 py-2 text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary-lighter)] transition-all"
                            >
                                + Add Another
                            </button>
                            <button
                                className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--color-primary-dark)] transition-all"
                            >
                                View All Scripts →
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}