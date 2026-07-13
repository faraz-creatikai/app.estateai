"use client";

import DeleteDialog from "@/app/component/popups/DeleteDialog";
import {
  GenerateCrmApiKey,
  DeleteCrmApiKey,
  getCrmApiKeys,
} from "@/store/auth"; // adjust this import path to wherever these three actually live

import React, { useEffect, useState } from "react";

/**
 * AdminCrmApiKeyPage
 * ───────────────────
 * Lets a master administrator generate and revoke API keys that external
 * tools (Zapier, custom integrations, etc.) use to authenticate with the
 * CRM's public API.
 *
 * Rules encoded here:
 *  - Keys are created with a name only (the raw secret is generated server-side).
 *  - The full raw key is shown ONE TIME, immediately after generation — the
 *    backend never returns the full value again after that (getApiKeys masks it).
 *  - The list view renders exactly what the backend sends (already masked),
 *    so there is no client-side hide/reveal toggle on stored keys — the
 *    backend already decided what's safe to show.
 *  - Deleting a key requires confirming through DeleteDialog.
 *
 * Wires together:
 *  - DeleteDialog                                   → delete confirmation
 *  - GenerateCrmApiKey (POST   .../crm-api-key)     → create
 *  - getCrmApiKeys     (GET    .../crm-api-key)     → list (masked)
 *  - DeleteCrmApiKey   (DELETE .../crm-api-key/:id) → remove
 *
 * NOTE — action required in the store function before this works end to end:
 *   `GenerateCrmApiKey` currently does:
 *       response = await response.json();
 *       return data;              // <- returns the request payload, not the response
 *   It needs to be `return response;` instead, otherwise the freshly
 *   generated raw key never reaches the UI (result.key will be undefined
 *   below, and the "key generated" panel will show an error instead of the
 *   key). Everything else on this page assumes that one-line fix is made.
 */

/* ─── Local types ─────────────────────────────────────────────────────────── */

interface CrmApiKey {
  id: string;
  name: string;
  key: string; // full raw key only right after creation; masked in every list fetch
  createdAt: string;
}

interface CrmApiKeyListResponse {
  success: boolean;
  message?: string;
  data?: CrmApiKey[];
}

interface CrmApiKeyGenerateResponse {
  success: boolean;
  message?: string;
  data?: CrmApiKey;
}

interface CrmApiKeyDeleteData {
  id: string;
  name: string;
  createdAt: string;
}

const CRM_KEY_DELETE_FIELD_LABELS: Record<keyof CrmApiKeyDeleteData, string> = {
  id: "ID",
  name: "Name",
  createdAt: "Created",
};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffSec = Math.round((Date.now() - date.getTime()) / 1000);
  if (diffSec < 45) return "just now";
  const min = Math.round(diffSec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ─── Icons ───────────────────────────────────────────────────────────────── */

const KeyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M15 7a4 4 0 1 1-4 4M9.5 13.5 3 20m0 0h4m-4 0v-4m9.5-2.5L6 20"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ShieldIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 3l7 3v6c0 4.5-3 8.25-7 9-4-.75-7-4.5-7-9V6l7-3z"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={1.8} />
    <path
      d="M8 12.5l2.5 2.5 5.5-6"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AlertCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={1.8} />
    <path d="M12 7.5v6M12 16.5h.01" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

const SpinnerIcon = ({ light = false }: { light?: boolean }) => (
  <span
    className="inline-block w-3.5 h-3.5 rounded-full border-2 flex-shrink-0"
    style={{
      borderColor: light ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.1)",
      borderTopColor: light ? "#fff" : "var(--color-primary)",
      animation: "crmkey-spin 0.7s linear infinite",
    }}
  />
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path
      d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" />
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path
      d="M8 8V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-3M5 8h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ─── Row: a single existing key ──────────────────────────────────────────── */

function ApiKeyRow({
  apiKey,
  isBusy,
  errorMsg,
  onRequestDelete,
}: {
  apiKey: CrmApiKey;
  isBusy: boolean;
  errorMsg?: string;
  onRequestDelete: () => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-4 sm:p-4.5 flex items-center gap-3">
        <span className="w-9 h-9 rounded-xl bg-[var(--color-primary-lighter)] dark:bg-white/10 flex items-center justify-center text-[var(--color-primary)] dark:text-white/70 flex-shrink-0">
          <KeyIcon />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-semibold text-gray-900 dark:text-[var(--color-textlightdark)] truncate">
            {apiKey.name}
          </p>
          {/* Rendered exactly as the backend sends it — already masked
              server-side, so there's nothing to hide/reveal client-side. */}
          <p className="mt-0.5 text-[12px] font-mono tracking-tight text-[var(--color-gray)] dark:text-gray-500 truncate">
            {apiKey.key}
          </p>
          <p className="mt-1 text-[11px] text-[var(--color-gray)] dark:text-gray-500">
            Created {formatRelativeTime(apiKey.createdAt)}
          </p>
        </div>

        <button
          type="button"
          onClick={onRequestDelete}
          disabled={isBusy}
          aria-label="Revoke key"
          className="w-8 h-8 flex items-center cursor-pointer justify-center rounded-lg text-gray-500 hover:text-[var(--color-destructive)] hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-40 flex-shrink-0"
        >
          {isBusy ? <SpinnerIcon /> : <TrashIcon />}
        </button>
      </div>

      {errorMsg && (
        <div className="mx-4 mb-4 flex items-center gap-2 rounded-lg bg-[var(--color-destructive)]/10 px-3 py-2 text-[12px] text-red-600 dark:text-[var(--color-destructive)]">
          <AlertCircleIcon />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Generate panel ───────────────────────────────────────────────────────── */

function GenerateKeyPanel({
  onGenerated,
  onCancel,
}: {
  onGenerated: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [revealedKey, setRevealedKey] = useState<CrmApiKey | null>(null);
  const [copied, setCopied] = useState(false);

  const canSave = name.trim().length > 0 && !saving;

  const handleGenerate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setErrorMsg("");

    const result = (await GenerateCrmApiKey({ keyName: name.trim() })) 

    setSaving(false);

    // Tolerates either a raw CrmApiKey or a { success, data } envelope,
    // since GenerateCrmApiKey's return shape depends on the store-side fix
    // noted at the top of this file.


    if (result?.data?.key) {
      setRevealedKey(result);
    } else {
      setErrorMsg("Couldn't generate a key. Confirm you have access and try again.");
    }
  };

  const handleCopy = async () => {
    if (!revealedKey) return;
    try {
      await navigator.clipboard.writeText(revealedKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setErrorMsg("Couldn't copy automatically — select and copy the key manually.");
    }
  };

  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-primary)]/40 bg-[var(--color-primary-lighter)]/40 dark:bg-white/[0.03] p-5 animate-[crmkey-in_0.16s_ease-out]">
      {!revealedKey ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] font-semibold text-gray-900 dark:text-[var(--color-textlightdark)]">
              Generate a new API key
            </p>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close"
              className="w-6 h-6 flex items-center cursor-pointer justify-center rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <XIcon />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Key name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  setErrorMsg("");
                }}
                placeholder="e.g. Zapier integration"
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-[13px] text-gray-900 dark:text-[var(--color-textlightdark)] placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
              />
              <p className="mt-1.5 text-[11.5px] text-[var(--color-gray)] dark:text-gray-400">
                Use a name that describes where this key will be used — it helps you tell keys apart later.
              </p>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-lg bg-[var(--color-destructive)]/10 px-3 py-2 text-[12.5px] text-red-600 dark:text-[var(--color-destructive)]">
                <AlertCircleIcon />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onCancel}
                className="text-[12.5px] font-medium cursor-pointer px-3.5 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!canSave}
                className="flex items-center cursor-pointer gap-1.5 text-[12.5px] font-medium px-4 py-2 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
              >
                {saving && <SpinnerIcon light />}
                {saving ? "Generating…" : "Generate key"}
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-2 text-[var(--color-primary-darker)] dark:text-[var(--color-primary-light)]">
            <CheckCircleIcon />
            <p className="text-[13px] font-semibold">Key generated</p>
          </div>
          <p className="text-[12px] text-[var(--color-gray)] dark:text-gray-400 mb-3">
            Copy this key now — you won't be able to see the full value again after you leave this screen.
          </p>

          <div className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2.5">
            <code className="flex-1 text-[12.5px] font-mono break-all text-gray-900 dark:text-[var(--color-textlightdark)]">
              {revealedKey.key}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy key"
              className="w-7 h-7 flex-shrink-0 flex items-center cursor-pointer justify-center rounded-md text-gray-500 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-lighter)] dark:hover:bg-white/10 transition-colors"
            >
              <CopyIcon />
            </button>
          </div>
          {copied && (
            <p className="mt-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              Copied to clipboard
            </p>
          )}

          <div className="flex items-center justify-end pt-4">
            <button
              type="button"
              onClick={onGenerated}
              className="text-[12.5px] font-medium cursor-pointer px-4 py-2 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white transition-colors"
            >
              Done
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Skeleton ─────────────────────────────────────────────────────────────── */

function RowSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/10 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 rounded bg-gray-100 dark:bg-white/10 animate-pulse" />
        <div className="h-2.5 w-44 rounded bg-gray-100 dark:bg-white/10 animate-pulse" />
      </div>
      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 animate-pulse" />
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */

export default function AdminCrmApiKeyPage() {
  const [keys, setKeys] = useState<CrmApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CrmApiKey | null>(null);

  const [rowBusy, setRowBusy] = useState<Record<string, boolean>>({});
  const [rowError, setRowError] = useState<Record<string, string>>({});

  const loadKeys = async () => {
    setLoading(true);
    setFetchError("");
    const result = (await getCrmApiKeys()) as unknown as CrmApiKeyListResponse;
    if (result?.success) {
      setKeys(result.data ?? []);
      if ((result.data ?? []).length === 0) setIsGenerateOpen(true);
    } else {
      setFetchError(result?.message || "Couldn't load API keys.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerated = () => {
    setIsGenerateOpen(false);
    loadKeys();
  };

  async function handleDeleteConfirm(data: CrmApiKeyDeleteData) {
    setDeleteTarget(null); // close dialog immediately
    setRowBusy(b => ({ ...b, [data.id]: true }));
    setRowError(e => ({ ...e, [data.id]: "" }));

    const result = (await DeleteCrmApiKey(data.id)) as unknown as { success: boolean; message?: string } | null;

    if (result?.success) {
      setKeys(list => list.filter(k => k.id !== data.id));
    } else {
      setRowError(e => ({ ...e, [data.id]: result?.message || "Couldn't revoke this key. Try again." }));
    }
    setRowBusy(b => ({ ...b, [data.id]: false }));
  }

  return (
    <div className="min-h-[calc(100vh-100px)] max-w-4xl mx-auto rounded-md bg-gray-50 dark:bg-[var(--color-bglightdark)] px-4 py-4 sm:px-8 sm:py-12">
      <DeleteDialog<CrmApiKeyDeleteData>
        isOpen={!!deleteTarget}
        title="Revoke this API key?"
        description="Any integration using this key will immediately lose access. This action cannot be undone."
        data={
          deleteTarget
            ? { id: deleteTarget.id, name: deleteTarget.name, createdAt: deleteTarget.createdAt }
            : null
        }
        fieldLabels={CRM_KEY_DELETE_FIELD_LABELS}
        confirmLabel="Yes, revoke key"
        onClose={() => setDeleteTarget(null)}
        onDelete={handleDeleteConfirm}
      />

      <div className="mx-auto w-full">
        {/* Header */}
        <div className="mb-7 flex items-start gap-3">
          <span className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white flex-shrink-0 shadow-sm shadow-[var(--color-primary)]/20">
            <KeyIcon />
          </span>
          <div>
            <h1 className="text-[17px] font-semibold text-gray-900 dark:text-[var(--color-textlightdark)]">
              CRM API keys
            </h1>
            <p className="mt-0.5 text-[13px] text-[var(--color-gray)] dark:text-gray-400">
              Generate keys so external tools like Zapier can authenticate with your CRM.
            </p>
          </div>
        </div>

        {/* Permission / security notice */}
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-[var(--color-primary-lighter)] dark:bg-[var(--color-primary)]/10 px-3 py-2 text-[12px] text-[var(--color-primary-darker)] dark:text-[var(--color-primary-light)]">
          <ShieldIcon />
          <span>A key acts as your account inside any tool that holds it — only share it with integrations you trust.</span>
        </div>

        {/* List header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">Keys</h2>
            {!loading && keys.length > 0 && (
              <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400">
                {keys.length}
              </span>
            )}
          </div>

          {!loading && !isGenerateOpen && (
            <button
              type="button"
              onClick={() => setIsGenerateOpen(true)}
              className="flex items-center cursor-pointer gap-1.5 text-[12.5px] font-medium px-3 py-1.5 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white transition-colors"
            >
              <PlusIcon />
              Generate key
            </button>
          )}
        </div>

        {/* List body */}
        <div className="space-y-3 mt-2">
          {loading && (
            <>
              <RowSkeleton />
              <RowSkeleton />
            </>
          )}

          {!loading && fetchError && (
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[12.5px] text-red-600 dark:text-[var(--color-destructive)]">
                <AlertCircleIcon />
                <span>{fetchError}</span>
              </div>
              <button
                type="button"
                onClick={loadKeys}
                className="text-[12px] font-medium cursor-pointer px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors flex-shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !fetchError && keys.length === 0 && !isGenerateOpen && (
            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-white/10 p-8 text-center">
              <span className="w-10 h-10 rounded-xl bg-[var(--color-primary-lighter)] dark:bg-white/10 text-[var(--color-primary)] dark:text-white/70 flex items-center justify-center mx-auto mb-3">
                <KeyIcon />
              </span>
              <p className="text-[13px] font-medium text-gray-700 dark:text-gray-300">No API keys yet</p>
              <p className="mt-1 text-[12px] text-gray-400 dark:text-gray-500">
                Generate a key to let an external tool connect to your CRM.
              </p>
              <button
                type="button"
                onClick={() => setIsGenerateOpen(true)}
                className="mt-4 inline-flex cursor-pointer items-center gap-1.5 text-[12.5px] font-medium px-3.5 py-1.5 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white transition-colors"
              >
                <PlusIcon />
                Generate key
              </button>
            </div>
          )}

          {!loading &&
            !fetchError &&
            keys.map(k => (
              <ApiKeyRow
                key={k.id}
                apiKey={k}
                isBusy={!!rowBusy[k.id]}
                errorMsg={rowError[k.id]}
                onRequestDelete={() => setDeleteTarget(k)}
              />
            ))}
        </div>

        {/* Generate panel */}
        {isGenerateOpen && !loading && (
          <div className="mt-3">
            <GenerateKeyPanel onGenerated={handleGenerated} onCancel={() => setIsGenerateOpen(false)} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes crmkey-spin { to { transform: rotate(360deg); } }
        @keyframes crmkey-in {
          from { opacity: 0; transform: translateY(-4px) scale(0.99); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </div>
  );
}