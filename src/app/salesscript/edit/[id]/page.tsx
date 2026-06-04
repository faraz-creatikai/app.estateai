"use client";

import { getSalesScriptById, updateSalesScript } from "@/store/salescript/salesscript";
import { salesScriptAllDataInterface, SalesScriptPayload } from "@/store/salescript/salesscript.interface";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
        ${
          selected
            ? "border-[var(--color-primary)] bg-[var(--color-primary-lighter)] shadow-md shadow-[var(--color-primary-light)]"
            : "border-[var(--color-primary-light)] bg-white hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-lighter)]"
        }`}
    >
      <span
        className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all
          ${selected ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : "border-[var(--color-muted)]"}`}
      >
        {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
      </span>
      <span
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-lg transition-all
          ${selected ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-primary-lighter)] text-[var(--color-primary)]"}`}
      >
        {icon}
      </span>
      <span className="flex flex-col">
        <span className={`text-sm font-bold tracking-tight transition-colors ${selected ? "text-[var(--color-primary)]" : "text-slate-700"}`}>
          {label}
        </span>
        <span className="text-xs text-slate-400">{sub}</span>
      </span>
    </button>
  );
}

function UpdateModeToggle({
  updateMode,
  onChange,
}: {
  updateMode: "regenerate" | "manual";
  onChange: (mode: "regenerate" | "manual") => void;
}) {
  return (
    <div className="flex rounded-xl border-2 border-[var(--color-primary-light)] overflow-hidden bg-[var(--color-primary-lighter)]">
      {(["regenerate", "manual"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold transition-all
            ${
              updateMode === m
                ? "bg-[var(--color-primary)] text-white shadow-md"
                : "text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
            }`}
        >
          {m === "regenerate" ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
              </svg>
              Regenerate with AI
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Manually
            </>
          )}
        </button>
      ))}
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="rounded-2xl border border-[var(--color-primary-light)] bg-white shadow-xl shadow-[var(--color-primary-lighter)] animate-pulse">
      <div className="border-b border-[var(--color-primary-light)] px-8 py-6">
        <div className="h-4 w-32 rounded-lg bg-[var(--color-primary-light)]" />
        <div className="mt-2 h-3 w-56 rounded-lg bg-[var(--color-primary-lighter)]" />
      </div>
      <div className="space-y-7 px-8 py-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="h-3 w-20 rounded bg-[var(--color-primary-lighter)]" />
            <div className="h-11 rounded-xl bg-[var(--color-primary-lighter)]" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-16 rounded bg-[var(--color-primary-lighter)]" />
            <div className="h-11 rounded-xl bg-[var(--color-primary-lighter)]" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-36 rounded bg-[var(--color-primary-lighter)]" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 rounded-xl bg-[var(--color-primary-lighter)]" />
            <div className="h-16 rounded-xl bg-[var(--color-primary-lighter)]" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-28 rounded bg-[var(--color-primary-lighter)]" />
          <div className="h-32 rounded-xl bg-[var(--color-primary-lighter)]" />
        </div>
      </div>
      <div className="border-t border-[var(--color-primary-light)] px-8 py-5 flex justify-between">
        <div className="h-8 w-20 rounded-lg bg-[var(--color-primary-lighter)]" />
        <div className="h-10 w-36 rounded-xl bg-[var(--color-primary-light)]" />
      </div>
    </div>
  );
}

function ScriptPreview({ content, name, mode, status, metadata }: {
  content: string;
  name: string;
  mode: string;
  status: string;
  metadata: any;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedContent = (content ?? "")
    .replace(/^"|"$/g, "")
    .replace(/\\n/g, "\n");

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8 rounded-2xl border border-[var(--color-primary-light)] bg-gradient-to-br from-[var(--color-primary-lighter)] to-white overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--color-primary-light)] bg-white/60 px-6 max-md:px-3 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white text-sm">✓</span>
          <div>
            <p className="text-sm font-bold text-slate-800">Script Updated</p>
            <p className="text-xs text-slate-400">
              {name} • <span className="capitalize">{mode}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
            {status}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--color-primary-light)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition-all hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)]"
          >
            {copied ? <><span>✓</span> Copied</> : <><span>⎘</span> Copy</>}
          </button>
        </div>
      </div>

      <div className="p-6">
        <pre className="whitespace-pre-wrap font-[inherit] text-sm leading-relaxed text-slate-700">
          {formattedContent}
        </pre>
      </div>

      {metadata && (
        <div className="border-t border-[var(--color-primary-light)] bg-white/40 px-6 max-md:px-3 py-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">AI Tips & Tone</p>
          {metadata.tone && (
            <p className="mb-3 text-xs text-slate-500">
              <span className="font-semibold text-slate-600">Tone:</span> {metadata.tone}
            </p>
          )}
          {metadata.tips?.length > 0 && (
            <ul className="space-y-2">
              {metadata.tips.map((tip: string, i: number) => (
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

export default function UpdateSalesScriptPage() {
  const router = useRouter();
   const { id } = useParams();

  // ── State ──────────────────────────────────────────────────────────────────
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [originalScript, setOriginalScript] = useState<salesScriptAllDataInterface | null>(null);

  const [form, setForm] = useState({
    Name: "",
    Status: "Active",
    mode: "hindi" as "hindi" | "english",
  });

  // "regenerate" = send userPrompt to AI | "manual" = directly edit Content
  const [updateMode, setUpdateMode] = useState<"regenerate" | "manual">("regenerate");
  const [userPrompt, setUserPrompt] = useState("");
  const [manualContent, setManualContent] = useState("");

  const [loading, setLoading] = useState(false);
  const [updatedScript, setUpdatedScript] = useState<salesScriptAllDataInterface | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "preview">("form");

  // ── Fetch existing script ──────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    const fetchScript = async () => {
      setInitialLoading(true);
      setFetchError(null);
      try {
        const data = await getSalesScriptById(id as string);
        if (!data) throw new Error("Script not found.");
        setOriginalScript(data);
        setForm({
          Name: data.Name ?? "",
          Status: data.Status ?? "Active",
          mode: (data.mode as "hindi" | "english") ?? "hindi",
        });
        // Pre-fill manual content with existing script
        const cleaned = (data.Content ?? "")
          .replace(/^"|"$/g, "")
          .replace(/\\n/g, "\n");
        setManualContent(cleaned);
      } catch (err: any) {
        setFetchError(err.message ?? "Failed to load script.");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchScript();
  }, [id]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.Name.trim()) return setError("Script name is required.");
    if (updateMode === "regenerate" && !userPrompt.trim())
      return setError("Please provide a prompt to regenerate the script.");
    if (updateMode === "manual" && !manualContent.trim())
      return setError("Content cannot be empty.");

    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        Name: form.Name,
        Status: form.Status,
        mode: form.mode,
        ...(updateMode === "regenerate"
          ? { userPrompt }
          : { Content: manualContent }),
      };

      const result = await updateSalesScript(id as string, payload);

      if (result) {
        setUpdatedScript(result);
        setStep("preview");
        // Refresh manual content field with latest content
        const cleaned = (result.Content ?? "")
          .replace(/^"|"$/g, "")
          .replace(/\\n/g, "\n");
        setManualContent(cleaned);
      } else {
        setError("Failed to update script. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (!originalScript) return;
    setForm({
      Name: originalScript.Name ?? "",
      Status: originalScript.Status ?? "Active",
      mode: (originalScript.mode as "hindi" | "english") ?? "hindi",
    });
    const cleaned = (originalScript.Content ?? "")
      .replace(/^"|"$/g, "")
      .replace(/\\n/g, "\n");
    setManualContent(cleaned);
    setUserPrompt("");
    setUpdatedScript(null);
    setStep("form");
    setError(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[var(--color-primary-lighter)] to-white">
      {/* CSS Variables */}
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
        .shimmer-btn { background-size: 200% auto; animation: shimmer 2s linear infinite; }
        .animate-in { animation-fill-mode: both; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-from-bottom-4 { from { transform: translateY(1rem); } to { transform: translateY(0); } }
        .fade-in { animation-name: fade-in; }
        .slide-in-from-bottom-4 { animation-name: slide-in-from-bottom-4, fade-in; }
        .duration-500 { animation-duration: 500ms; }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
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
          <nav className="flex items-center gap-1.5 text-xs text-slate-400">
            <button onClick={() => router.back()} className="hover:text-[var(--color-primary)] transition-colors">Scripts</button>
            <span>/</span>
            <span className="font-semibold text-[var(--color-primary)]">Edit Script</span>
          </nav>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-5xl px-6 max-md:px-3 py-10">
        {/* Page Title */}
        <div className="mb-10">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-px flex-1 bg-[var(--color-primary-light)]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)] opacity-60">
              Edit Script
            </span>
            <div className="h-px flex-1 bg-[var(--color-primary-light)]" />
          </div>
          <h1 className="heading-font text-4xl text-slate-800 leading-tight">
            Update Sales Script
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Modify script details, regenerate with a new prompt, or edit the content directly.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center gap-3">
          {[
            { key: "form", label: "Edit" },
            { key: "preview", label: "Preview & Save" },
          ].map((s, i) => (
            <div key={s.key} className="flex items-center gap-3">
              {i > 0 && (
                <div className={`h-px w-8 transition-all ${step === "preview" ? "bg-[var(--color-primary)]" : "bg-[var(--color-muted)]"}`} />
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
                <span className={`text-xs font-semibold ${step === s.key ? "text-[var(--color-primary)]" : "text-slate-400"}`}>
                  {s.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Fetch Error ──────────────────────────────────────────────────── */}
        {fetchError && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-6 py-4">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="text-sm font-bold text-red-700">Failed to load script</p>
              <p className="text-xs text-red-500 mt-0.5">{fetchError}</p>
            </div>
            <button
              onClick={() => router.back()}
              className="ml-auto text-xs font-semibold text-[var(--color-primary)] hover:underline"
            >
              ← Go Back
            </button>
          </div>
        )}

        {/* ── Skeleton / Form ──────────────────────────────────────────────── */}
        {initialLoading ? (
          <SkeletonLoader />
        ) : !fetchError && (
          <div className="rounded-2xl border border-[var(--color-primary-light)] bg-white shadow-xl shadow-[var(--color-primary-lighter)]">
            {/* Original script name badge */}
            {originalScript && (
              <div className="flex items-center gap-2 border-b border-[var(--color-primary-light)] bg-[var(--color-primary-lighter)] px-8 py-3">
                <span className="text-xs text-slate-400">Editing:</span>
                <span className="rounded-full bg-[var(--color-primary-light)] px-3 py-0.5 text-xs font-bold text-[var(--color-primary)]">
                  {originalScript.Name}
                </span>
                <span className="ml-auto text-xs text-slate-300">
                  ID: {id?.slice(0, 8)}…
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Card Header */}
              <div className="border-b border-[var(--color-primary-light)] px-8 max-md:px-4 py-6">
                <h2 className="text-base font-bold text-slate-800">Script Details</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update the fields below — changes are saved on submit
                </p>
              </div>

              {/* Card Body */}
              <div className="space-y-7 px-8 max-md:px-4 py-8">
                {/* Name + Status */}
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

                {/* Language Mode */}
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
                    Content Update
                  </span>
                  <div className="h-px flex-1 bg-[var(--color-primary-light)]" />
                </div>

                {/* Update Mode Toggle */}
                <div>
                  <label className="mb-3 block text-xs font-semibold tracking-widest uppercase text-[var(--color-primary)] opacity-80">
                    How would you like to update the script?
                  </label>
                  <UpdateModeToggle updateMode={updateMode} onChange={setUpdateMode} />
                </div>

                {/* Regenerate Panel */}
                {updateMode === "regenerate" && (
                  <FloatingLabel id="userPrompt" label="New Customer Description" required>
                    <div className="relative">
                      <textarea
                        id="userPrompt"
                        name="userPrompt"
                        value={userPrompt}
                        onChange={(e) => { setUserPrompt(e.target.value); setError(null); }}
                        rows={5}
                        placeholder="Describe the updated context — the AI will regenerate the entire script based on this prompt…"
                        className="w-full rounded-xl border-2 border-[var(--color-primary-light)] bg-[var(--color-primary-lighter)] px-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 outline-none transition-all resize-none focus:border-[var(--color-primary)] focus:bg-white focus:shadow-sm focus:shadow-[var(--color-primary-light)]"
                      />
                      <span className="absolute bottom-3 right-3 text-xs text-slate-300">
                        {userPrompt.length} chars
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      💡 The AI will discard the old content and write a fresh script from this prompt.
                    </p>
                  </FloatingLabel>
                )}

                {/* Manual Edit Panel */}
                {updateMode === "manual" && (
                  <FloatingLabel id="manualContent" label="Script Content" required>
                    <div className="relative">
                      <textarea
                        id="manualContent"
                        name="manualContent"
                        value={manualContent}
                        onChange={(e) => { setManualContent(e.target.value); setError(null); }}
                        rows={10}
                        placeholder="Edit the script content directly…"
                        className="w-full rounded-xl border-2 border-[var(--color-primary-light)] bg-[var(--color-primary-lighter)] px-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 outline-none transition-all resize-none focus:border-[var(--color-primary)] focus:bg-white focus:shadow-sm focus:shadow-[var(--color-primary-light)] font-mono leading-relaxed"
                      />
                      <span className="absolute bottom-3 right-3 text-xs text-slate-300">
                        {manualContent.length} chars
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      ✏️ Editing the content directly — AI metadata will remain unchanged.
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
                  Reset Changes
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
                      {updateMode === "regenerate" ? "Regenerating…" : "Saving Changes…"}
                    </>
                  ) : (
                    <>
                      {updateMode === "regenerate" ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
                          </svg>
                          Regenerate Script
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v14a2 2 0 0 1-2 2z" />
                            <polyline points="17 21 17 13 7 13 7 21" />
                            <polyline points="7 3 7 8 15 8" />
                          </svg>
                          Save Changes
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Updated Script Preview ──────────────────────────────────────── */}
        {updatedScript && (
          <ScriptPreview
            content={updatedScript.Content ?? ""}
            name={updatedScript.Name}
            mode={updatedScript.mode}
            status={updatedScript.Status}
            metadata={updatedScript.metadata}
          />
        )}

        {/* ── Post-save Actions ───────────────────────────────────────────── */}
        {updatedScript && (
          <div className="animate-in fade-in duration-500 mt-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold">✓</span>
              <p className="text-sm font-semibold text-emerald-700">Script updated successfully</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="rounded-lg border-2 border-[var(--color-primary-light)] px-4 py-2 text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary-lighter)] transition-all"
              >
                Edit Again
              </button>
              <button
                onClick={() => router.back()}
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