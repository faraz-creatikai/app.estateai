"use client";

import CustomDropdown, { DropdownOption } from "@/app/component/CustomDropdown";
import MasterProtectedRoute from "@/app/component/MasterProtectedRoutes";
import DeleteDialog from "@/app/component/popups/DeleteDialog";
import { AI_PROVIDERS_CONFIG } from "@/app/data/aiModels";
import { DeleteAdminAiKey, getAllAiApiKeys, SaveAdminAiKey, UpdateAdminAiKey } from "@/store/auth";
/**
 * AdminAiKeyPage
 * ──────────────
 * System-wide AI provider configuration screen for master administrators.
 *
 * Rules encoded here:
 *  - A provider can only be configured once (no duplicate OPENAI rows, etc.)
 *    → the "add" panel only offers providers that aren't configured yet.
 *  - Only one configured provider can be ACTIVE at a time. Turning one on
 *    automatically turns the previously active one off.
 *  - Existing configs can be toggled ACTIVE/INACTIVE, have their model changed,
 *    or have their key rotated, and can be removed.
 *
 * Wires together:
 *  - CustomDropdown                                → provider / model selects
 *  - AI_PROVIDERS_CONFIG                           → static provider + model catalogue
 *  - SaveAdminAiKey    (POST   .../ai/api-key)     → create
 *  - getAllAiApiKeys   (GET    .../ai/...)         → list
 *  - UpdateAdminAiKey  (PATCH  .../ai/:id)         → update model / key / status
 *  - DeleteAdminAiKey  (POST   .../ai/:id)         → remove
 *
 * NOTE: adjust the import paths below (CustomDropdown, config, api functions)
 * to match where those files actually live in your project.
 */

import React, { useEffect, useMemo, useState } from "react";


/* ─── Local types ─────────────────────────────────────────────────────────── */

interface AiModelOption {
  id: string;
  name: string;
  description: string;
}

interface AiProviderConfigItem {
  providerId: string;
  displayName: string;
  icon?: string;
  models: AiModelOption[];
}

const PROVIDERS = AI_PROVIDERS_CONFIG as AiProviderConfigItem[];

type ConfigStatus = "ACTIVE" | "INACTIVE";

interface AdminAiConfig {
  id: string;
  provider: string;
  model: string;
  status: ConfigStatus;
  createdAt: string;
  updatedAt: string;
}

interface AuthApiResponse {
  success: boolean;
  message?: string;
  data?: AdminAiConfig[];
}

interface AdminAiConfigDeleteData {
  id: string
  provider: string
  model: string
  status: ConfigStatus
}

const ADMIN_AI_DELETE_FIELD_LABELS: Record<keyof AdminAiConfigDeleteData, string> = {
  id: 'ID',
  provider: 'Provider',
  model: 'Model',
  status: 'Status',
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const getProviderInfo = (providerId: string): AiProviderConfigItem | null =>
  PROVIDERS.find(p => p.providerId === providerId) ?? null;

const getModelInfo = (
  provider: AiProviderConfigItem | null,
  modelId: string
): AiModelOption | null => provider?.models.find(m => m.id === modelId) ?? null;

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

const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path
      d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={1.7} />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M9.9 5.1A10.9 10.9 0 0 1 12 5c7 0 10.5 7 10.5 7a13.5 13.5 0 0 1-3.1 4.2M6.6 6.6C3.5 8.5 1.5 12 1.5 12s2.2 4.4 6.4 6.2c1.2.5 2.5.8 4.1.8.9 0 1.8-.1 2.6-.3"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
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
    <path
      d="M12 7.5v6M12 16.5h.01"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </svg>
);

const SpinnerIcon = ({ light = false }: { light?: boolean }) => (
  <span
    className="inline-block w-3.5 h-3.5 rounded-full border-2 flex-shrink-0"
    style={{
      borderColor: light ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.1)",
      borderTopColor: light ? "#fff" : "var(--color-primary)",
      animation: "spin 0.7s linear infinite",
    }}
  />
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
  </svg>
);

const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path
      d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
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

const ChevronDownIcon = ({ open }: { open: boolean }) => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    style={{ transition: "transform 0.18s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
  >
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ─── Small shared pieces ─────────────────────────────────────────────────── */

function ProviderAvatar({
  provider,
  size = 36,
}: {
  provider: AiProviderConfigItem | null;
  size?: number;
}) {
  const [imgError, setImgError] = useState(false);
  const dim = `${size}px`;

  if (!provider) {
    return (
      <span
        className="rounded-xl bg-[var(--color-primary-lighter)] dark:bg-white/10 flex items-center justify-center text-[var(--color-primary)] dark:text-white/70 flex-shrink-0"
        style={{ width: dim, height: dim }}
      >
        <KeyIcon />
      </span>
    );
  }

  if (provider.icon && !imgError) {
    return (
      <span
        className="rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0"
        style={{ width: dim, height: dim }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={provider.icon}
          alt=""
          className="w-1/2 h-1/2 object-contain"
          onError={() => setImgError(true)}
        />
      </span>
    );
  }

  return (
    <span
      className="rounded-xl bg-[var(--color-primary-lighter)] dark:bg-white/10 flex items-center justify-center text-[11px] font-semibold text-[var(--color-primary)] dark:text-white/80 flex-shrink-0"
      style={{ width: dim, height: dim }}
    >
      {provider.displayName.slice(0, 2).toUpperCase()}
    </span>
  );
}

function StatusToggle({
  active,
  disabled,
  onToggle,
}: {
  active: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={active ? "Deactivate" : "Activate (will deactivate the current one)"}
      disabled={disabled}
      onClick={onToggle}
      className={`relative inline-flex cursor-pointer h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${active ? "bg-[var(--color-primary)]" : "bg-gray-300 dark:bg-white/15"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
        style={{ transform: active ? "translateX(18px)" : "translateX(3px)" }}
      />
    </button>
  );
}

/* ─── Row: a single configured provider ──────────────────────────────────── */

interface ConfigRowProps {
  config: AdminAiConfig;
  isEditing: boolean;
  isBusy: boolean;
  isToggling: boolean;
  toggleLocked: boolean;
  errorMsg?: string;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (patch: { model?: string; apiKey?: string }) => void;
  onToggleStatus: () => void;
  onRequestDelete: () => void;

}

function ConfigRow({
  config,
  isEditing,
  isBusy,
  isToggling,
  toggleLocked,
  errorMsg,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onToggleStatus,
  onRequestDelete,
}: ConfigRowProps) {
  const provider = getProviderInfo(config.provider);
  const modelInfo = getModelInfo(provider, config.model);
  const isActive = config.status === "ACTIVE";

  const [editModelId, setEditModelId] = useState(config.model);
  const [editApiKey, setEditApiKey] = useState("");
  const [editShowKey, setEditShowKey] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setEditModelId(config.model);
      setEditApiKey("");
      setEditShowKey(false);
    }
  }, [isEditing, config.model]);

  const modelOptions: DropdownOption[] = useMemo(
    () => provider?.models.map(m => ({ _id: m.id, Name: m.name })) ?? [],
    [provider]
  );

  const hasChanges = editModelId !== config.model || editApiKey.trim().length > 0;

  return (
    <div
      className={`rounded-2xl border bg-white dark:bg-white/[0.03] shadow-sm hover:shadow-md transition-shadow overflow-hidden ${isActive
          ? "border-[var(--color-primary)]/40 ring-1 ring-[var(--color-primary)]/25"
          : "border-gray-200 dark:border-white/10"
        }`}
    >
      <div className="p-4 sm:p-4.5">
        {!isEditing ? (
          <div className="flex items-center gap-3">
            <ProviderAvatar provider={provider} />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[13.5px] font-semibold text-gray-900 dark:text-[var(--color-textlightdark)] truncate">
                  {provider?.displayName ?? config.provider}
                </p>
                <span className="text-[10.5px] font-mono px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 truncate max-w-[140px]">
                  {modelInfo?.name ?? config.model}
                </span>
                {isActive && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-[var(--color-primary-lighter)] dark:bg-[var(--color-primary)]/15 text-[var(--color-primary-darker)] dark:text-[var(--color-primary-light)] flex-shrink-0">
                    In use
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[11.5px] text-[var(--color-gray)] dark:text-gray-500">
                Updated {formatRelativeTime(config.updatedAt)}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[11px] font-medium ${isActive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-gray-400 dark:text-gray-500"
                    }`}
                >
                  {isActive ? "Active" : "Inactive"}
                </span>
                {isToggling ? (
                  <SpinnerIcon />
                ) : (
                  <StatusToggle
                    active={isActive}
                    disabled={isBusy || toggleLocked}
                    onToggle={onToggleStatus}
                  />
                )}
              </div>

              <span className="w-px h-4 bg-gray-200 dark:bg-white/10" />

              <button
                type="button"
                onClick={onEdit}
                disabled={isBusy}
                aria-label="Edit"
                className="w-7 h-7 flex cursor-pointer items-center justify-center rounded-lg text-gray-500 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-lighter)] dark:hover:bg-white/10 transition-colors disabled:opacity-40"
              >
                <PencilIcon />
              </button>
              <button
                type="button"
                onClick={onRequestDelete}
                disabled={isBusy}
                aria-label="Delete"
                className="w-7 h-7 flex items-center cursor-pointer justify-center rounded-lg text-gray-500 hover:text-[var(--color-destructive)] hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-40"
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5 animate-[dd-in_0.15s_ease-out]">
            <div className="flex items-center gap-3">
              <ProviderAvatar provider={provider} />
              <p className="text-[13.5px] font-semibold text-gray-900 dark:text-[var(--color-textlightdark)]">
                {provider?.displayName ?? config.provider}
              </p>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Model
              </label>
              <CustomDropdown
                options={modelOptions}
                value={editModelId}
                onChange={opt => setEditModelId(opt?._id ?? config.model)}
                placeholder="Select a model"
                clearable={false}
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                New API key <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <input
                  type={editShowKey ? "text" : "password"}
                  value={editApiKey}
                  onChange={e => setEditApiKey(e.target.value)}
                  placeholder="Leave blank to keep the current key"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2 pr-10 text-[13px] font-mono tracking-tight text-gray-900 dark:text-[var(--color-textlightdark)] placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none transition-colors focus:border-[var(--color-primary)] focus:bg-white dark:focus:bg-white/[0.08] focus:ring-2 focus:ring-[var(--color-primary)]/15"
                />
                <button
                  type="button"
                  onClick={() => setEditShowKey(s => !s)}
                  aria-label={editShowKey ? "Hide API key" : "Show API key"}
                  className="absolute right-2.5 top-1/2 cursor-pointer -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  {editShowKey ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-lg bg-[var(--color-destructive)]/10 px-3 py-2 text-[12px] text-red-600 dark:text-[var(--color-destructive)]">
                <AlertCircleIcon />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-0.5">
              <button
                type="button"
                onClick={onCancelEdit}
                disabled={isBusy}
                className="text-[12.5px] font-medium cursor-pointer px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  onSaveEdit({
                    model: editModelId !== config.model ? editModelId : undefined,
                    apiKey: editApiKey.trim() ? editApiKey.trim() : undefined,
                  })
                }
                disabled={!hasChanges || isBusy}
                className="flex items-center cursor-pointer gap-1.5 text-[12.5px] font-medium px-3.5 py-1.5 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
              >
                {isBusy && <SpinnerIcon light />}
                Save changes
              </button>
            </div>
          </div>
        )}

        {!isEditing && errorMsg && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--color-destructive)]/10 px-3 py-2 text-[12px] text-red-600 dark:text-[var(--color-destructive)]">
            <AlertCircleIcon />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Add panel: create a config for a not-yet-configured provider ──────── */

function AddProviderPanel({
  availableProviders,
  onSaved,
  onCancel,
}: {
  availableProviders: AiProviderConfigItem[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [providerId, setProviderId] = useState<string | null>(null);
  const [modelId, setModelId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const providerOptions: DropdownOption[] = useMemo(
    () => availableProviders.map(p => ({ _id: p.providerId, Name: p.displayName })),
    [availableProviders]
  );

  const selectedProvider = useMemo(
    () => availableProviders.find(p => p.providerId === providerId) ?? null,
    [availableProviders, providerId]
  );

  const modelOptions: DropdownOption[] = useMemo(
    () => selectedProvider?.models.map(m => ({ _id: m.id, Name: m.name })) ?? [],
    [selectedProvider]
  );

  const selectedModel = useMemo(
    () => selectedProvider?.models.find(m => m.id === modelId) ?? null,
    [selectedProvider, modelId]
  );

  const canSave = Boolean(providerId && modelId && apiKey.trim()) && !saving;

  const handleSave = async () => {
    if (!providerId || !modelId || !apiKey.trim()) return;
    setSaving(true);
    setErrorMsg("");

    const result = await SaveAdminAiKey({
      provider: providerId,
      apiKey: apiKey.trim(),
      model: modelId,
    });

    setSaving(false);

    if (result) {
      onSaved();
    } else {
      setErrorMsg(
        "Couldn't save the configuration. Confirm you have master administrator access and try again."
      );
    }
  };

  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-primary)]/40 bg-[var(--color-primary-lighter)]/40 dark:bg-white/[0.03] p-5 animate-[dd-in_0.16s_ease-out]">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] font-semibold text-gray-900 dark:text-[var(--color-textlightdark)]">
          Add a provider
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
            Provider
          </label>
          <div className="flex items-center gap-3">
            <ProviderAvatar provider={selectedProvider} size={32} />
            <div className="flex-1 min-w-0">
              <CustomDropdown
                options={providerOptions}
                value={providerId}
                onChange={opt => {
                  setProviderId(opt?._id ?? null);
                  setModelId(null);
                  setErrorMsg("");
                }}
                placeholder="Select a provider"
                noOptionsText="All providers are already configured"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Model
          </label>
          <CustomDropdown
            options={modelOptions}
            value={modelId}
            onChange={opt => {
              setModelId(opt?._id ?? null);
              setErrorMsg("");
            }}
            placeholder={selectedProvider ? "Select a model" : "Select a provider first"}
            disabled={!selectedProvider}
            noOptionsText="No models available for this provider"
          />
          {selectedModel && (
            <p className="mt-1.5 text-[11.5px] text-[var(--color-gray)] dark:text-gray-400">
              {selectedModel.description}
            </p>
          )}
        </div>

        <div>
          <label className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            API key
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={e => {
                setApiKey(e.target.value);
                setErrorMsg("");
              }}
              placeholder="sk-••••••••••••••••"
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 pr-10 text-[13px] font-mono tracking-tight text-gray-900 dark:text-[var(--color-textlightdark)] placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
            />
            <button
              type="button"
              onClick={() => setShowKey(s => !s)}
              aria-label={showKey ? "Hide API key" : "Show API key"}
              className="absolute right-2.5 top-1/2 cursor-pointer -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              {showKey ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <p className="mt-1.5 text-[11.5px] text-[var(--color-gray)] dark:text-gray-400">
            Encrypted before storage. You won't be able to view this key again after saving.
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
            onClick={handleSave}
            disabled={!canSave}
            className="flex items-center cursor-pointer gap-1.5 text-[12.5px] font-medium px-4 py-2 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
          >
            {saving && <SpinnerIcon light />}
            {saving ? "Saving…" : "Save provider"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Skeleton + empty state ──────────────────────────────────────────────── */

function RowSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/10 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-28 rounded bg-gray-100 dark:bg-white/10 animate-pulse" />
        <div className="h-2.5 w-20 rounded bg-gray-100 dark:bg-white/10 animate-pulse" />
      </div>
      <div className="w-9 h-5 rounded-full bg-gray-100 dark:bg-white/10 animate-pulse" />
    </div>
  );
}



/* ─── Page ─────────────────────────────────────────────────────────────── */

export default function AdminAiKeyPage() {
  const [configs, setConfigs] = useState<AdminAiConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminAiConfig | null>(null);

  const [rowBusy, setRowBusy] = useState<Record<string, boolean>>({});
  const [rowError, setRowError] = useState<Record<string, string>>({});
  const [togglingIds, setTogglingIds] = useState<Record<string, boolean>>({});

  const availableProviders = useMemo(
    () => PROVIDERS.filter(p => !configs.some(c => c.provider === p.providerId)),
    [configs]
  );

  const activeConfig = useMemo(
    () => configs.find(c => c.status === "ACTIVE") ?? null,
    [configs]
  );
  const activeProviderInfo = activeConfig ? getProviderInfo(activeConfig.provider) : null;
  const activeModelInfo = activeConfig
    ? getModelInfo(activeProviderInfo, activeConfig.model)
    : null;

  const anyToggling = Object.values(togglingIds).some(Boolean);

  async function handleDeleteConfirm(data: AdminAiConfigDeleteData) {
    setDeleteTarget(null); // close dialog immediately
    setRowBusy(b => ({ ...b, [data.id]: true }));
    setRowError(e => ({ ...e, [data.id]: "" }));

    const result = await DeleteAdminAiKey(data.id, { id: data.id });

    if (result) {
      setConfigs(list => list.filter(c => c.id !== data.id));
    } else {
      setRowError(e => ({ ...e, [data.id]: "Couldn't delete this configuration. Try again." }));
    }
    setRowBusy(b => ({ ...b, [data.id]: false }));
  }

  const loadConfigs = async () => {
    setLoading(true);
    setFetchError("");
    const result = (await getAllAiApiKeys()) as unknown as AuthApiResponse;
    if (result?.success) {
      const data = result.data ?? [];
      setConfigs(data);
      if (data.length === 0) setIsAddOpen(true);
    } else {
      setFetchError(result?.message || "Couldn't load AI configurations.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadConfigs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdded = () => {
    setIsAddOpen(false);
    loadConfigs();
  };

  /**
   * Only one config can be ACTIVE at a time.
   * Turning a provider ON automatically turns the previously active one OFF
   * (two PATCH calls, since the backend has no bulk/exclusive-activate route).
   * Turning the currently active provider OFF simply leaves none active.
   */
  const handleToggleStatus = async (config: AdminAiConfig) => {
    const turningOn = config.status !== "ACTIVE";
    const newStatus: ConfigStatus = turningOn ? "ACTIVE" : "INACTIVE";
    const otherActive = turningOn
      ? configs.find(c => c.id !== config.id && c.status === "ACTIVE") ?? null
      : null;

    const affectedIds = otherActive ? [config.id, otherActive.id] : [config.id];

    setTogglingIds(t => {
      const next = { ...t };
      affectedIds.forEach(id => (next[id] = true));
      return next;
    });
    setRowError(e => {
      const next = { ...e };
      affectedIds.forEach(id => (next[id] = ""));
      return next;
    });

    // Optimistic update: new one flips, previous active one (if any) turns off.
    setConfigs(list =>
      list.map(c => {
        if (c.id === config.id) return { ...c, status: newStatus };
        if (otherActive && c.id === otherActive.id) return { ...c, status: "INACTIVE" };
        return c;
      })
    );

    const primaryResult = await UpdateAdminAiKey(config.id, { status: newStatus });

    let secondaryResult: unknown = true;
    if (primaryResult && otherActive) {
      secondaryResult = await UpdateAdminAiKey(otherActive.id, { status: "INACTIVE" });
    }

    if (!primaryResult) {
      // Revert both rows.
      setConfigs(list =>
        list.map(c => {
          if (c.id === config.id) return { ...c, status: config.status };
          if (otherActive && c.id === otherActive.id) return { ...c, status: "ACTIVE" };
          return c;
        })
      );
      setRowError(e => ({ ...e, [config.id]: "Couldn't update the status. Try again." }));
    } else if (otherActive && !secondaryResult) {
      // New one activated fine, but the old one couldn't be turned off automatically.
      setConfigs(list =>
        list.map(c => (c.id === otherActive.id ? { ...c, status: "ACTIVE" } : c))
      );
      setRowError(e => ({
        ...e,
        [otherActive.id]:
          "Activated the new provider, but couldn't deactivate this one automatically — turn it off manually.",
      }));
    }

    setTogglingIds(t => {
      const next = { ...t };
      affectedIds.forEach(id => (next[id] = false));
      return next;
    });
  };

  const handleSaveEdit = async (id: string, patch: { model?: string; apiKey?: string }) => {
    if (!patch.model && !patch.apiKey) {
      setEditingId(null);
      return;
    }
    setRowBusy(b => ({ ...b, [id]: true }));
    setRowError(e => ({ ...e, [id]: "" }));

    const result = await UpdateAdminAiKey(id, patch);

    if (result) {
      setConfigs(list =>
        list.map(c =>
          c.id === id
            ? { ...c, model: patch.model ?? c.model, updatedAt: new Date().toISOString() }
            : c
        )
      );
      setEditingId(null);
    } else {
      setRowError(e => ({ ...e, [id]: "Couldn't save changes. Try again." }));
    }
    setRowBusy(b => ({ ...b, [id]: false }));
  };



  return (
    <MasterProtectedRoute>
    <div className="min-h-[calc(100vh-100px)] max-w-4xl mx-auto rounded-md bg-gray-50 dark:bg-[var(--color-bglightdark)] px-4 py-4 sm:px-8 sm:py-12">
      <DeleteDialog<AdminAiConfigDeleteData>
        isOpen={!!deleteTarget}
        title="Remove this provider?"
        description="This will delete the stored API key and configuration for this provider. This action cannot be undone."
        data={
          deleteTarget
            ? {
              id: deleteTarget.id,
              provider: getProviderInfo(deleteTarget.provider)?.displayName ?? deleteTarget.provider,
              model: getModelInfo(getProviderInfo(deleteTarget.provider), deleteTarget.model)?.name ?? deleteTarget.model,
              status: deleteTarget.status,
            }
            : null
        }
        fieldLabels={ADMIN_AI_DELETE_FIELD_LABELS}
        confirmLabel="Yes, remove provider"
        onClose={() => setDeleteTarget(null)}
        onDelete={handleDeleteConfirm}
      />
      <div className="mx-auto w-full ">
        {/* Header */}
        <div className="mb-7 flex items-start gap-3">
          <span className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white flex-shrink-0 shadow-sm shadow-[var(--color-primary)]/20">
            <KeyIcon />
          </span>
          <div>
            <h1 className="text-[17px] font-semibold text-gray-900 dark:text-[var(--color-textlightdark)]">
              AI provider configuration
            </h1>
            <p className="mt-0.5 text-[13px] text-[var(--color-gray)] dark:text-gray-400">
              Manage the system-wide providers and models used across the platform.
            </p>
          </div>
        </div>

        {/* Permission notice */}
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-[var(--color-primary-lighter)] dark:bg-[var(--color-primary)]/10 px-3 py-2 text-[12px] text-[var(--color-primary-darker)] dark:text-[var(--color-primary-light)]">
          <ShieldIcon />
          <span>Only master administrators can view or change these configurations.</span>
        </div>

        {/* Active provider summary */}
        {!loading && !fetchError && (
          <div
            className={`mb-6 flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] ${activeConfig
                ? "bg-[var(--color-primary-lighter)] dark:bg-[var(--color-primary)]/10 text-[var(--color-primary-darker)] dark:text-[var(--color-primary-light)]"
                : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400"
              }`}
          >
            {activeConfig ? <CheckCircleIcon /> : <AlertCircleIcon />}
            <span>
              {activeConfig
                ? `${activeProviderInfo?.displayName ?? activeConfig.provider} is the active provider (${activeModelInfo?.name ?? activeConfig.model
                }).`
                : "No provider is currently active — turn one on below to start routing requests."}
            </span>
          </div>
        )}

        {/* List header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">
              Configured providers
            </h2>
            {!loading && configs.length > 0 && (
              <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400">
                {configs.length}
              </span>
            )}
          </div>

          {!loading && !isAddOpen && (
            <>
              {availableProviders.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setIsAddOpen(true)}
                  className="flex items-center cursor-pointer gap-1.5 text-[12.5px] font-medium px-3 py-1.5 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white transition-colors"
                >
                  <PlusIcon />
                  Add provider
                </button>
              ) : (
                <span className="text-[11.5px] text-gray-400 dark:text-gray-500">
                  All providers are configured
                </span>
              )}
            </>
          )}
        </div>

        {!loading && !fetchError && configs.length > 1 && (
          <p className="text-[11.5px] text-gray-400 dark:text-gray-500 mb-3">
            Only one provider can be active at a time — turning one on turns the others off.
          </p>
        )}

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
                onClick={loadConfigs}
                className="text-[12px] font-medium cursor-pointer px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors flex-shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !fetchError && configs.length === 0 && !isAddOpen && (
            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-white/10 p-8 text-center">
              <span className="w-10 h-10 rounded-xl bg-[var(--color-primary-lighter)] dark:bg-white/10 text-[var(--color-primary)] dark:text-white/70 flex items-center justify-center mx-auto mb-3">
                <KeyIcon />
              </span>
              <p className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
                No providers configured yet
              </p>
              <p className="mt-1 text-[12px] text-gray-400 dark:text-gray-500">
                Add your first provider to start routing requests through it.
              </p>
              <button
                type="button"
                onClick={() => setIsAddOpen(true)}
                className="mt-4 inline-flex cursor-pointer items-center gap-1.5 text-[12.5px] font-medium px-3.5 py-1.5 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white transition-colors"
              >
                <PlusIcon />
                Add provider
              </button>
            </div>
          )}

          {!loading && !fetchError && configs.map(config => (
            <ConfigRow
              key={config.id}
              config={config}
              isEditing={editingId === config.id}
              isBusy={!!rowBusy[config.id]}
              isToggling={!!togglingIds[config.id]}
              toggleLocked={anyToggling && !togglingIds[config.id]}
              errorMsg={rowError[config.id]}
              onEdit={() => setEditingId(config.id)}
              onCancelEdit={() => {
                setEditingId(null);
                setRowError(e => ({ ...e, [config.id]: "" }));
              }}
              onSaveEdit={patch => handleSaveEdit(config.id, patch)}
              onToggleStatus={() => handleToggleStatus(config)}
              onRequestDelete={() => setDeleteTarget(config)}
            />
          ))}
        </div>

        {/* Add panel */}
        {isAddOpen && !loading && (
          <div className="mt-3">
            <AddProviderPanel
              availableProviders={availableProviders}
              onSaved={handleAdded}
              onCancel={() => setIsAddOpen(false)}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dd-in {
          from { opacity: 0; transform: translateY(-4px) scale(0.99); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </div>
    </MasterProtectedRoute>
  );
}