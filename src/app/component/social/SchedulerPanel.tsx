"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface ScheduledPost {
  id: string;
  imageUrl: string;
  caption?: string | null;
  platform: string;
  igAccountId?: string;
  fbPageId?: string;
  containerId?: string | null;
  scheduledId?: string | null;
  scheduledTime: string;
  status: "SCHEDULED" | "PUBLISHED" | "FAILED";
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROPS — pass platform-specific API functions from outside
// ─────────────────────────────────────────────────────────────────────────────

interface SchedulerPanelProps {
  /** Human-readable platform name shown in UI labels */
  platformLabel: string;
  /** Platform key used when fetching scheduled posts (e.g. "INSTAGRAM" | "FACEBOOK") */
  platformKey: string;
  /** Schedules a new post; receives FormData, returns { success, error? } */
  schedulePost: (formData: FormData) => Promise<{ success: boolean; error?: string } | null>;
  /** Returns { success, posts[] } for this platform */
  getScheduledPosts: (platformKey: string) => Promise<{ success: boolean; posts?: ScheduledPost[] } | null>;
  /** Brand colour for the "Schedule Post" button (default: var(--color-primary)) */
  accentColor?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const MIN_FUTURE_MS = 21 * 60 * 1000;
const MAX_FUTURE_MS = 75 * 24 * 60 * 60 * 1000;

const pad = (n: number) => String(n).padStart(2, "0");

const toLocalDateTimeStr = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

const getMinDateTime = () => toLocalDateTimeStr(new Date(Date.now() + MIN_FUTURE_MS));
const getMaxDateTime = () => toLocalDateTimeStr(new Date(Date.now() + MAX_FUTURE_MS));

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

const formatRelative = (iso: string) => {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < 0) return "Overdue";
  const totalMins = Math.floor(diff / 60_000);
  const days = Math.floor(totalMins / 1440);
  const hours = Math.floor((totalMins % 1440) / 60);
  const mins = totalMins % 60;
  if (days > 0) return `in ${days}d ${hours}h`;
  if (hours > 0) return `in ${hours}h ${mins}m`;
  return `in ${mins}m`;
};

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ScheduledPost["status"] }) {
  const cfg = {
    SCHEDULED: {
      label: "Scheduled",
      cls: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-400 animate-pulse",
    },
    PUBLISHED: {
      label: "Published",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-400",
    },
    FAILED: {
      label: "Failed",
      cls: "bg-red-50 text-red-700 border-red-200",
      dot: "bg-red-400",
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULED POST CARD
// ─────────────────────────────────────────────────────────────────────────────

function ScheduledPostCard({ post }: { post: ScheduledPost }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`group bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col ${
        post.status === "FAILED" ? "border-red-200" : "border-[var(--color-primary-light)]"
      }`}
    >
      <div className="relative w-full aspect-square bg-[var(--color-primary-lighter)] overflow-hidden">
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-[var(--color-primary-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        ) : (
          <img
            src={post.imageUrl}
            alt={post.caption ?? "Scheduled post"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        )}

        {post.status === "SCHEDULED" && (
          <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-center shadow-lg">
              <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-gray)]">Publishes</div>
              <div className="text-sm font-black text-[var(--color-primary-darker)] leading-tight">
                {formatRelative(post.scheduledTime)}
              </div>
            </div>
          </div>
        )}

        <div className="absolute top-2 right-2 z-10">
          <StatusBadge status={post.status} />
        </div>
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-xs text-gray-700 leading-relaxed line-clamp-2 min-h-[2.5rem]">
          {post.caption ? post.caption : (
            <span className="text-[var(--color-gray)] italic">No caption</span>
          )}
        </p>
        <div className="mt-auto pt-2 border-t border-[var(--color-primary-lighter)] flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-gray)]">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-semibold text-[var(--color-primary-darker)]">{formatDate(post.scheduledTime)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-gray)]">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTime(post.scheduledTime)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE UPLOAD ZONE
// ─────────────────────────────────────────────────────────────────────────────

function ImageUploadZone({
  file,
  preview,
  onFile,
  onClear,
}: {
  file: File | null;
  preview: string | null;
  onFile: (f: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) onFile(f);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-[var(--color-primary-darker)] uppercase tracking-wider">
        Image <span className="text-red-400">*</span>
      </label>

      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-[var(--color-primary-light)] w-full aspect-square">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors cursor-pointer z-10"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm px-3 py-1.5">
            <p className="text-white text-[10px] font-medium truncate">{file?.name}</p>
          </div>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-2xl w-full aspect-square flex flex-col items-center justify-center gap-3 cursor-pointer select-none transition-all duration-200 ${
            dragging
              ? "border-[var(--color-primary)] bg-[var(--color-primary-lighter)] scale-[1.01]"
              : "border-[var(--color-primary-light)] bg-[var(--color-primary-lighter)]/40 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-lighter)]"
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
            dragging ? "bg-[var(--color-primary)] text-white scale-110" : "bg-white text-[var(--color-primary)] border border-[var(--color-primary-light)]"
          }`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-center px-4">
            <p className="text-sm font-bold text-[var(--color-primary-darker)]">
              {dragging ? "Drop it here!" : "Drop image here"}
            </p>
            <p className="text-[11px] text-[var(--color-gray)] mt-0.5">or click to browse</p>
            <p className="text-[10px] text-[var(--color-gray)] mt-0.5 opacity-70">JPG · PNG · WEBP</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            name="PostImage"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULE FORM
// ─────────────────────────────────────────────────────────────────────────────

function ScheduleForm({
  platformLabel,
  accentColor,
  schedulePost,
  onSuccess,
}: {
  platformLabel: string;
  accentColor?: string;
  schedulePost: SchedulerPanelProps["schedulePost"];
  onSuccess: () => void;
}) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const CAPTION_MAX = 2200;
  const btnStyle = accentColor ? { background: accentColor } : undefined;
  const btnClass = accentColor
    ? ""
    : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-darker)]";

  const handleFile = (f: File) => {
    setImageFile(f);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(f));
    setFormError(null);
  };

  const clearFile = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!imageFile) return setFormError("Please upload an image before scheduling.");
    if (!scheduledTime) return setFormError("Please select a date and time.");

    const chosenMs = new Date(scheduledTime).getTime();
    if (chosenMs < Date.now() + 1 * 60 * 1000) {
      return setFormError("Scheduled time must be at least 1 minutes from now.");
    }

    const fd = new FormData();
    fd.append("PostImage", imageFile);
    fd.append("caption", caption);
    fd.append("scheduledTime", scheduledTime);

    setSubmitting(true);
    const result = await schedulePost(fd);
    setSubmitting(false);

    if (result?.success) {
      setSuccess(true);
      clearFile();
      setCaption("");
      setScheduledTime("");
      setTimeout(() => setSuccess(false), 4000);
      onSuccess();
    } else {
      setFormError(result?.error ?? "Failed to schedule post. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-primary-light)] shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--color-primary-lighter)] flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[var(--color-primary-lighter)] flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-black text-[var(--color-primary-darker)]">
            Schedule a New {platformLabel} Post
          </h3>
          <p className="text-[10px] text-[var(--color-gray)]">
            Must be between 20 minutes and 75 days in the future · Meta API requirement
          </p>
        </div>
      </div>

      <div className="p-5 flex flex-col lg:flex-row gap-6">
        <div className="lg:w-52 xl:w-60 flex-shrink-0">
          <ImageUploadZone file={imageFile} preview={imagePreview} onFile={handleFile} onClear={clearFile} />
        </div>

        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Caption */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[var(--color-primary-darker)] uppercase tracking-wider">Caption</label>
              <span className={`text-[10px] font-medium tabular-nums ${caption.length > CAPTION_MAX ? "text-red-500" : "text-[var(--color-gray)]"}`}>
                {caption.length.toLocaleString()} / {CAPTION_MAX.toLocaleString()}
              </span>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={CAPTION_MAX}
              rows={6}
              placeholder="Write your caption, add hashtags, tag accounts…"
              className="w-full px-4 py-3 text-sm rounded-xl border border-[var(--color-primary-light)] bg-[var(--color-primary-lighter)]/30 text-gray-700 placeholder-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition resize-none leading-relaxed"
            />
          </div>

          {/* Date & Time */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--color-primary-darker)] uppercase tracking-wider">
              Date & Time <span className="text-red-400">*</span>
            </label>
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => { setScheduledTime(e.target.value); setFormError(null); }}
              min={getMinDateTime()}
              max={getMaxDateTime()}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-[var(--color-primary-light)] bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition"
            />
            {scheduledTime && (
              <p className="text-[10px] text-[var(--color-gray)] flex items-center gap-1">
                <svg className="w-3 h-3 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Post will go live{" "}
                <span className="font-semibold text-[var(--color-primary)]">{formatRelative(scheduledTime)}</span>
              </p>
            )}
          </div>

          {/* Error banner */}
          {formError && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-xs text-red-700 font-medium leading-relaxed">{formError}</p>
            </div>
          )}

          {/* Success banner */}
          {success && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-emerald-700 font-semibold">
                Post scheduled successfully! It will publish automatically. 🎉
              </p>
            </div>
          )}

          {/* Submit */}
          <div className="mt-auto flex items-center justify-end pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !imageFile || !scheduledTime}
              style={btnStyle}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md cursor-pointer ${btnClass}`}
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Scheduling…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule Post
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULED POSTS LIST
// ─────────────────────────────────────────────────────────────────────────────

function ScheduledPostsList({ posts, loading }: { posts: ScheduledPost[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-white border border-[var(--color-primary-light)] overflow-hidden animate-pulse">
            <div className="aspect-square bg-[var(--color-primary-lighter)]" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-[var(--color-primary-lighter)] rounded-full w-3/4" />
              <div className="h-3 bg-[var(--color-primary-lighter)] rounded-full w-1/2" />
              <div className="h-px bg-[var(--color-primary-lighter)] mt-3" />
              <div className="h-3 bg-[var(--color-primary-lighter)] rounded-full w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="bg-white rounded-2xl border border-[var(--color-primary-light)] p-12 flex flex-col items-center gap-4 shadow-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-lighter)] flex items-center justify-center">
          <svg className="w-8 h-8 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-[var(--color-primary-darker)]">No Scheduled Posts Yet</h3>
          <p className="text-sm text-[var(--color-gray)] mt-1 max-w-xs leading-relaxed">
            Use the form above to schedule your first post. It will appear here once queued.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {posts.map((post) => (
        <ScheduledPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY STATS BAR
// ─────────────────────────────────────────────────────────────────────────────

function SchedulerStats({ posts }: { posts: ScheduledPost[] }) {
  const scheduled = posts.filter((p) => p.status === "SCHEDULED").length;
  const published = posts.filter((p) => p.status === "PUBLISHED").length;
  const failed = posts.filter((p) => p.status === "FAILED").length;

  const stats = [
    { label: "Queued",    value: scheduled, color: "text-blue-700",    bg: "bg-blue-50 border-blue-200",      dot: "bg-blue-400 animate-pulse" },
    { label: "Published", value: published, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-400" },
    { label: "Failed",    value: failed,    color: "text-red-700",     bg: "bg-red-50 border-red-200",         dot: "bg-red-400" },
  ];

  if (!posts.length) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {stats.map((s) => (
        <div key={s.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${s.bg} ${s.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
          <span>{s.value} {s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT — generic SchedulerPanel
// ─────────────────────────────────────────────────────────────────────────────
//
// Usage for Instagram (in PostsPanel):
//
//   import {
//     scheduleInstagramPost,
//     getInstagramScheduledPosts,
//   } from "@/store/social-media/socialMedia";
//
//   {contentTab === "scheduled" && (
//     <SchedulerPanel
//       platformLabel="Instagram"
//       platformKey="INSTAGRAM"
//       schedulePost={scheduleInstagramPost}
//       getScheduledPosts={getInstagramScheduledPosts}
//     />
//   )}
//
// Usage for Facebook:
//
//   import {
//     scheduleFacebookPost,
//     getFacebookScheduledPosts,
//   } from "@/store/social-media/socialMedia";
//
//   {contentTab === "scheduled" && (
//     <SchedulerPanel
//       platformLabel="Facebook"
//       platformKey="FACEBOOK"
//       schedulePost={scheduleFacebookPost}
//       getScheduledPosts={getFacebookScheduledPosts}
//       accentColor="linear-gradient(135deg,#1877f2,#0a5dc2)"  ← optional brand colour
//     />
//   )}
//
// ─────────────────────────────────────────────────────────────────────────────

export default function SchedulerPanel({
  platformLabel,
  platformKey,
  schedulePost,
  getScheduledPosts,
  accentColor,
}: SchedulerPanelProps) {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchScheduled = useCallback(async () => {
    setLoadingPosts(true);
    const res = await getScheduledPosts(platformKey);
    if (res?.success) setScheduledPosts(res.posts ?? []);
    setLoadingPosts(false);
  }, [getScheduledPosts, platformKey]);

  useEffect(() => {
    fetchScheduled();
  }, [fetchScheduled]);

  const queuedCount = scheduledPosts.filter((p) => p.status === "SCHEDULED").length;

  const btnStyle = accentColor ? { background: accentColor } : undefined;
  const btnClass = accentColor ? "" : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-darker)]";

  return (
    <div className="flex flex-col gap-5">
      {/* Panel header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-black text-[var(--color-primary-darker)]">
            {platformLabel} Scheduler
          </h2>
          {queuedCount > 0 && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              {queuedCount} queued
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchScheduled}
            disabled={loadingPosts}
            title="Refresh"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--color-primary)] border border-[var(--color-primary-light)] bg-white hover:bg-[var(--color-primary-lighter)] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <svg className={`w-3.5 h-3.5 ${loadingPosts ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>

          <button
            onClick={() => setShowForm((v) => !v)}
            style={btnStyle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer shadow-sm ${btnClass}`}
          >
            {showForm ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                </svg>
                Hide Form
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                New Post
              </>
            )}
          </button>
        </div>
      </div>

      {/* Schedule form (collapsible) */}
      {showForm && (
        <ScheduleForm
          platformLabel={platformLabel}
          accentColor={accentColor}
          schedulePost={schedulePost}
          onSuccess={fetchScheduled}
        />
      )}

      {/* Divider with post count */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--color-primary-light)]" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gray)] whitespace-nowrap">
          {loadingPosts
            ? "Loading…"
            : `${scheduledPosts.length} ${scheduledPosts.length === 1 ? "Post" : "Posts"} Total`}
        </span>
        <div className="h-px flex-1 bg-[var(--color-primary-light)]" />
      </div>

      <SchedulerStats posts={scheduledPosts} />
      <ScheduledPostsList posts={scheduledPosts} loading={loadingPosts} />
    </div>
  );
}