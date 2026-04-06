"use client";

import DeleteDialog from "@/app/component/popups/DeleteDialog";
import { deleteCallLog, getCallReport } from "@/store/customer";
import { CallReport } from "@/store/report/call-report/callreport.interface";
import { TrashIcon } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";

/* ─── helpers ───────────────────────────────────────────────────────────── */
const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const fmtShortDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/* ─── Icons ─────────────────────────────────────────────────────────────── */
const PhoneInIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);
const PhoneOutIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 3h5m0 0v5m0-5l-6 6M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
  </svg>
);
const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const ChevronDown = ({ className = "" }: { className?: string }) => (
  <svg className={`w-3.5 h-3.5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);
const ClockIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
  </svg>
);
const DownloadIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);
const XIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const FilterIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);



/* ─── Mini Audio Player ─────────────────────────────────────────────────── */
function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  const toggle = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
    setPlaying(!playing);
  };
  const onTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 1;
    setCurrentTime(cur);
    setProgress((cur / dur) * 100);
  };
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = ratio * (audioRef.current.duration || 0);
    setProgress(ratio * 100);
  };
  const skip = (s: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.currentTime + s, audioRef.current.duration || 0));
  };
  const changeVol = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    setMuted(v === 0);
  };
  const toggleMute = () => {
    if (!audioRef.current) return;
    const next = !muted;
    setMuted(next);
    audioRef.current.muted = next;
  };

  return (
    <div className="rounded-xl border border-[var(--color-primary-lighter)] bg-gradient-to-r from-[var(--color-primary-lighter)]/10 to-[var(--color-primary-lighter)]/20 px-4 py-3">
      <audio ref={audioRef} src={src} onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={() => setPlaying(false)} preload="metadata" />
      <div ref={barRef} onClick={seek}
        className="relative h-1.5 rounded-full bg-[var(--color-primary-lighter)]/40 cursor-pointer mb-3 group">
        <div className="absolute inset-y-0 left-0 rounded-full bg-[var(--color-primary-dark)] transition-none" style={{ width: `${progress}%` }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[var(--color-primary-dark)] border-2 border-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ left: `calc(${progress}% - 7px)` }} />
      </div>
      <div className="flex items-center gap-2.5">
        <span className="text-[10px] font-mono text-gray-400 w-9 shrink-0">{fmtTime(currentTime)}</span>
        <button onClick={() => skip(-10)} className="text-[var(--color-primary-dark)] hover:scale-110 transition-transform shrink-0" title="-10s">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
          </svg>
        </button>
        <button onClick={toggle}
          className="w-8 h-8 rounded-full bg-[var(--color-primary-dark)] hover:bg-[var(--color-primary-darker)] text-white flex items-center justify-center shadow-md transition-all active:scale-90 shrink-0">
          {playing ? (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
          ) : (
            <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>
        <button onClick={() => skip(10)} className="text-[var(--color-primary-dark)] hover:scale-110 transition-transform shrink-0" title="+10s">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
          </svg>
        </button>
        <span className="text-[10px] font-mono text-gray-400 shrink-0">{fmtTime(duration)}</span>
        <div className="flex-1" />
        <button onClick={toggleMute} className="text-gray-400 hover:text-[var(--color-primary-dark)] transition-colors shrink-0">
          {muted || volume === 0 ? (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
          )}
        </button>
        <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume} onChange={changeVol}
          className="w-14 h-1 accent-[var(--color-primary-dark)] cursor-pointer" />
      </div>
    </div>
  );
}

/* ─── Sentiment Badge ───────────────────────────────────────────────────── */
function SentimentBadge({ value }: { value: string }) {
  const v = parseFloat(value);
  const cfg =
    v >= 7
      ? { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", dot: "bg-emerald-400" }
      : v >= 4
      ? { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200", dot: "bg-amber-400" }
      : { bg: "bg-rose-50", text: "text-rose-600", ring: "ring-rose-200", dot: "bg-rose-400" };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ${cfg.bg} ${cfg.text} ${cfg.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {v}/10
    </div>
  );
}

/* ─── Direction Badge ───────────────────────────────────────────────────── */
function DirectionBadge({ direction }: { direction: string }) {
  const isInbound = direction?.toLowerCase().includes("inbound");
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
      isInbound
        ? "bg-[var(--color-primary-lighter)]/30 text-[var(--color-primary-darker)]"
        : "bg-slate-100 text-slate-500"
    }`}>
      {isInbound ? <PhoneInIcon /> : <PhoneOutIcon />}
      {isInbound ? "In" : "Out"}
    </span>
  );
}

/* ─── Status Badge ──────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const answered = status === "Call Answered";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
      answered
        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
        : "bg-rose-50 text-rose-600 ring-1 ring-rose-200"
    }`}>
      {answered ? (
        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      ) : (
        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      )}
      {answered ? "Answered" : "Missed"}
    </span>
  );
}

/* ─── Avatar ────────────────────────────────────────────────────────────── */
function Avatar({ name, isInbound }: { name: string; isInbound: boolean }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  return (
    <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm ${
      isInbound
        ? "bg-[var(--color-primary-lighter)]/40 text-[var(--color-primary-darker)]"
        : "bg-slate-100 text-slate-500"
    }`}>
      {initials}
    </div>
  );
}

/* ─── Info Row ──────────────────────────────────────────────────────────── */
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-[var(--color-primary-dark)]/50 shrink-0">{icon}</span>
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className="font-medium text-gray-700 truncate">{value}</span>
    </div>
  );
}

/* ─── Stat Card ─────────────────────────────────────────────────────────── */
function StatCard({ label, value, icon, sub }: { label: string; value: string | number; icon: React.ReactNode; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3.5">
      <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-lighter)]/20 flex items-center justify-center text-[var(--color-primary-dark)] shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-gray-800 leading-none">{value}</p>
        <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{label}</p>
        {sub && <p className="text-[10px] text-[var(--color-primary-dark)] mt-0.5 font-semibold">{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Filter Pill ───────────────────────────────────────────────────────── */
function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
        active
          ? "bg-[var(--color-primary-dark)] text-white shadow-sm"
          : "bg-white text-gray-500 border border-gray-200 hover:border-[var(--color-primary-lighter)] hover:text-[var(--color-primary-dark)]"
      }`}
    >
      {children}
    </button>
  );
}


//sort options

const SORT_OPTIONS: { value: SortKey; label: string; icon: React.ReactNode }[] = [
  {
    value: "newest",
    label: "Newest First",
    icon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    ),
  },
  {
    value: "oldest",
    label: "Oldest First",
    icon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
      </svg>
    ),
  },
  {
    value: "duration_desc",
    label: "Longest First",
    icon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    value: "duration_asc",
    label: "Shortest First",
    icon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    value: "cost_desc",
    label: "Highest Cost",
    icon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

//sort dropdown component

function SortDropdown({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = SORT_OPTIONS.find((o) => o.value === value)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 pl-3 pr-2.5 py-2.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
          open
            ? "border-[var(--color-primary-dark)] bg-[var(--color-primary-lighter)]/10 text-[var(--color-primary-darker)] shadow-sm"
            : "border-gray-200 bg-white text-gray-600 hover:border-[var(--color-primary-lighter)] hover:text-[var(--color-primary-dark)]"
        }`}
      >
        <span className={`transition-colors ${open ? "text-[var(--color-primary-dark)]" : "text-gray-400"}`}>
          {selected.icon}
        </span>
        <span className="hidden sm:inline">{selected.label}</span>
        <ChevronDown className={`transition-transform duration-200 ${open ? "rotate-180 text-[var(--color-primary-dark)]" : "text-gray-400"}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl border border-gray-100 shadow-xl shadow-gray-200/60 z-30 overflow-hidden py-1">
          {SORT_OPTIONS.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors text-left ${
                  active
                    ? "bg-[var(--color-primary-lighter)]/20 text-[var(--color-primary-darker)]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <span className={active ? "text-[var(--color-primary-dark)]" : "text-gray-400"}>
                  {opt.icon}
                </span>
                {opt.label}
                {active && (
                  <svg className="w-3 h-3 ml-auto text-[var(--color-primary-dark)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Call Card ─────────────────────────────────────────────────────────── */
function CallCard({ call, onDeleteClick }: { call: CallReport ,onDeleteClick: (call: CallReport) => void;}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"details" | "transcript">("details");
  const answered = call.callStatus === "Call Answered";
  const isInbound = call.callDirection?.toLowerCase().includes("inbound");
  const displayName = call.customerName || call.calledTo || call.normalizedPhone || "Unknown";

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
        open
          ? "border-[var(--color-primary-lighter)] shadow-lg shadow-[var(--color-primary-lighter)]/20"
          : "border-gray-100 shadow-sm hover:shadow-md hover:border-[var(--color-primary-lighter)]/60"
      }`}
    >
      {/* ── Collapsed Row ── */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-3 py-3 sm:px-4 sm:py-3.5 flex items-start gap-2.5 sm:gap-3"
      >
        {/* Left accent bar */}
        <div
          className={`shrink-0 w-1 rounded-full mt-1 self-stretch ${
            answered ? "bg-emerald-400" : "bg-rose-400"
          }`}
        />

        {/* Avatar */}
        <Avatar name={displayName} isInbound={isInbound} />

        {/* Name + meta — takes all remaining space */}
        <div className="flex-1 min-w-0">
          {/* Row 1: name + chevron */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-sm text-gray-800 truncate max-w-[160px] xs:max-w-[200px] sm:max-w-xs">
                  {displayName}
                </span>
                <DirectionBadge direction={call.callDirection} />
              </div>

              {/* Row 2: date · duration · phone */}
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="text-[11px] text-gray-400 shrink-0">
                  {fmtShortDate(call.startTime)}
                </span>
                <span className="text-gray-200 shrink-0">·</span>
                <div className="flex items-center gap-0.5 text-[11px] text-gray-400 shrink-0">
                  <ClockIcon />
                  <span>{call.callDuration}s</span>
                </div>
                {call.normalizedPhone && (
                  <>
                    <span className="text-gray-200 shrink-0 hidden sm:inline">·</span>
                    <span className="text-[11px] text-gray-400 font-mono hidden sm:inline">
                      {call.normalizedPhone}
                    </span>
                  </>
                )}
              </div>

              {/* Row 3 (mobile only): badges + cost in a wrapping row */}
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap sm:hidden">
                <SentimentBadge value={call.sentiment} />
                <StatusBadge status={call.callStatus} />
                <span className="text-xs font-bold text-[var(--color-primary-darker)]">
                  ₹{call.totalCallCost}
                </span>
              </div>
            </div>

            {/* Right side — desktop badges + chevron */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Badges visible only on sm+ */}
              <div className="hidden sm:flex items-center gap-2">
                <SentimentBadge value={call.sentiment} />
                <StatusBadge status={call.callStatus} />
                <span className="text-sm font-bold text-[var(--color-primary-darker)]">
                  ₹{call.totalCallCost}
                </span>
              </div>

              {/* Chevron always visible */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${
                  open
                    ? "bg-[var(--color-primary-lighter)]/30 rotate-180"
                    : "bg-gray-50"
                }`}
              >
                <ChevronDown className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* ── Expanded Panel ── */}
      {open && (
        <div className="border-t border-gray-50 bg-gray-50/40">
          
          {/* Tabs */}
           <div className="flex items-center justify-between px-3 sm:px-4 pt-3">
      <div className="flex gap-1">
        {(["details", "transcript"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 sm:px-4 py-1.5 rounded-t-lg text-xs font-semibold capitalize transition-all border-b-2 ${
              tab === t
                ? "bg-white border-[var(--color-primary-dark)] text-[var(--color-primary-darker)] shadow-sm"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {t}
            {t === "transcript" && !call.transcript && (
              <span className="ml-1 text-[9px] text-gray-300">(none)</span>
            )}
          </button>
        ))}
      </div>

      {/* Delete button — aligned opposite the tabs */}
      <button
        onClick={(e) => { e.stopPropagation(); onDeleteClick(call); }}
        className=" cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100 hover:border-rose-300 hover:text-rose-600 text-[11px] font-semibold transition-all"
      >
        <TrashIcon className="w-3 h-3" />
        Delete
      </button>
    </div>

          <div className="bg-white mx-2 sm:mx-3 mb-3 rounded-xl rounded-tl-none p-3 sm:p-4 border border-gray-100 shadow-sm">
            {tab === "details" && (
              <div className="space-y-3 sm:space-y-4">
                {/* Stats grid — 2 col on all, 4 col on sm+ */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: "Start", value: fmtDate(call.startTime) },
                    { label: "End", value: fmtDate(call.endTime) },
                    { label: "Duration", value: `${call.callDuration}s` },
                    { label: "Cost", value: `₹${call.totalCallCost}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-2.5 sm:p-3">
                      <p className="text-[9px] uppercase tracking-widest font-bold text-gray-300 mb-1">
                        {label}
                      </p>
                      <p className="text-xs font-semibold text-gray-700 leading-snug break-words">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Meta info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50 rounded-xl p-3">
                  {call.customerName && (
                    <InfoRow
                      icon={
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      }
                      label="Customer"
                      value={call.customerName}
                    />
                  )}
                  {call.normalizedPhone && (
                    <InfoRow
                      icon={
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      }
                      label="Phone"
                      value={call.normalizedPhone}
                    />
                  )}
                  {call.participantIdentity && (
                    <InfoRow
                      icon={
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                        </svg>
                      }
                      label="Participant"
                      value={call.participantIdentity}
                    />
                  )}
                  {call.agentId && (
                    <InfoRow
                      icon={
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      }
                      label="Agent"
                      value={call.agentId}
                    />
                  )}
                  <InfoRow
                    icon={
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    }
                    label="Direction"
                    value={call.callDirection}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400 shrink-0">Sentiment:</span>
                    <SentimentBadge value={call.sentiment} />
                  </div>
                </div>

                {/* Summary */}
                {call.summary && (
                  <div className="bg-gradient-to-br from-[var(--color-primary-lighter)]/10 to-[var(--color-primary-lighter)]/5 rounded-xl p-3 sm:p-3.5 border border-[var(--color-primary-lighter)]/30">
                    <p className="text-[9px] uppercase tracking-widest font-bold text-[var(--color-primary-dark)]/50 mb-1.5">
                      AI Summary
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">{call.summary}</p>
                  </div>
                )}

                {/* Recording */}
                {call.recordingUrl && (
                  <div>
                    <p className="text-[9px] uppercase tracking-widest font-bold text-gray-300 mb-1.5">
                      Recording
                    </p>
                    <AudioPlayer src={call.recordingUrl} />
                    <a
                      href={call.recordingUrl}
                      download
                      target="_blank"
                      className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-[var(--color-primary-dark)] hover:text-[var(--color-primary-darker)] hover:underline underline-offset-2 transition-colors"
                    >
                      <DownloadIcon /> Download Recording
                    </a>
                  </div>
                )}
              </div>
            )}

            {tab === "transcript" && (
              <div className="bg-gray-50 rounded-xl p-3 sm:p-3.5 max-h-60 overflow-y-auto">
                {call.transcript ? (
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap font-mono break-words">
                    {call.transcript}
                  </p>
                ) : (
                  <div className="text-center py-8">
                    <svg
                      className="w-8 h-8 mx-auto mb-2 text-gray-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-xs text-gray-400 italic">No transcript available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
/* ─── Types ─────────────────────────────────────────────────────────────── */
type SortKey = "newest" | "oldest" | "duration_desc" | "duration_asc" | "cost_desc";
type StatusFilter = "all" | "answered" | "missed";
type DirectionFilter = "all" | "inbound" | "outbound";
type SentimentFilter = "all" | "positive" | "neutral" | "negative";

interface Filters {
  search: string;
  status: StatusFilter;
  direction: DirectionFilter;
  sentiment: SentimentFilter;
  sort: SortKey;
}

/* ─── Filters Bar ───────────────────────────────────────────────────────── */
function FiltersBar({
  filters,
  onChange,
  total,
  filtered,
}: {
  filters: Filters;
  onChange: (f: Partial<Filters>) => void;
  total: number;
  filtered: number;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const activeFilterCount = [
    filters.status !== "all",
    filters.direction !== "all",
    filters.sentiment !== "all",
  ].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0 || filters.search !== "";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      {/* Search + controls row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search by name, phone, agent…"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm border border-gray-200 focus:border-[var(--color-primary-dark)] focus:ring-2 focus:ring-[var(--color-primary-lighter)]/40 outline-none transition bg-gray-50 placeholder:text-gray-300"
          />
          {filters.search && (
            <button onClick={() => onChange({ search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
              <XIcon />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all shrink-0 ${
            showAdvanced || activeFilterCount > 0
              ? "bg-[var(--color-primary-dark)] text-white border-[var(--color-primary-dark)] shadow-sm"
              : "bg-white text-gray-500 border-gray-200 hover:border-[var(--color-primary-lighter)]"
          }`}
        >
          <FilterIcon />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center text-[9px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Sort select */}
         <SortDropdown value={filters.sort} onChange={(v) => onChange({ sort: v })} />
        {/* <div className="relative shrink-0">
          <select
            value={filters.sort}
            onChange={(e) => onChange({ sort: e.target.value as SortKey })}
            className="appearance-none pl-3 pr-7 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 focus:border-[var(--color-primary-dark)] outline-none bg-white text-gray-600 cursor-pointer hover:border-[var(--color-primary-lighter)] transition-colors"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="duration_desc">Longest First</option>
            <option value="duration_asc">Shortest First</option>
            <option value="cost_desc">Highest Cost</option>
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <ChevronDown />
          </div>
        </div> */}
      </div>

      {/* Advanced filter rows */}
      {showAdvanced && (
        <div className="space-y-2.5 pt-2 border-t border-gray-50">
          {/* Status */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-300 w-16 shrink-0">Status</span>
            <div className="flex gap-1.5 flex-wrap">
              {(["all", "answered", "missed"] as const).map((s) => (
                <FilterPill key={s} active={filters.status === s} onClick={() => onChange({ status: s })}>
                  {s === "all" ? "All" : s === "answered" ? "✓ Answered" : "✗ Missed"}
                </FilterPill>
              ))}
            </div>
          </div>
          {/* Direction */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-300 w-16 shrink-0">Direction</span>
            <div className="flex gap-1.5 flex-wrap">
              {(["all", "inbound", "outbound"] as const).map((d) => (
                <FilterPill key={d} active={filters.direction === d} onClick={() => onChange({ direction: d })}>
                  {d === "all" ? "All" : d === "inbound" ? "↓ Inbound" : "↑ Outbound"}
                </FilterPill>
              ))}
            </div>
          </div>
          {/* Sentiment */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-300 w-16 shrink-0">Sentiment</span>
            <div className="flex gap-1.5 flex-wrap">
              {(["all", "positive", "neutral", "negative"] as const).map((s) => (
                <FilterPill key={s} active={filters.sentiment === s} onClick={() => onChange({ sentiment: s })}>
                  {s === "all" ? "All" : s === "positive" ? "😊 Positive" : s === "neutral" ? "😐 Neutral" : "😞 Negative"}
                </FilterPill>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results count + clear */}
      {(hasActiveFilters || filtered !== total) && (
        <div className="flex items-center justify-between pt-1 border-t border-gray-50">
          <p className="text-xs text-gray-400">
            Showing <span className="font-bold text-[var(--color-primary-darker)]">{filtered}</span> of{" "}
            <span className="font-medium">{total}</span> calls
          </p>
          {hasActiveFilters && (
            <button
              onClick={() => onChange({ search: "", status: "all", direction: "all", sentiment: "all" })}
              className="text-xs text-rose-400 hover:text-rose-600 font-semibold flex items-center gap-1 transition-colors"
            >
              <XIcon /> Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export interface DeleteDialogDataInterface {
  id: string;
  calledTo: string;
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function CallReportPage() {
  const [calls, setCalls] = useState<CallReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "all",
    direction: "all",
    sentiment: "all",
    sort: "newest",
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
const [dialogData, setDialogData] = useState<DeleteDialogDataInterface | null>(null);

  useEffect(() => {
    const fetchCalls = async () => {
      const res = await getCallReport();
      if (res?.data) setCalls(res.data);
      setLoading(false);
    };
    fetchCalls();
  }, []);

  const handleDelete = async () => {
  if (!dialogData?.id) return;

  const res = await deleteCallLog(dialogData.id);

  if (res) {
    setCalls((prev) => prev.filter((c) => c.id !== dialogData.id));
  } else {
    alert("Failed to delete");
  }

  setIsDeleteDialogOpen(false);
  setDialogData(null);
};

  const filteredCalls = useMemo(() => {
    let result = [...calls];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.customerName?.toLowerCase().includes(q) ||
          c.normalizedPhone?.toLowerCase().includes(q) ||
          c.calledTo?.toLowerCase().includes(q) ||
          c.agentId?.toLowerCase().includes(q) ||
          c.participantIdentity?.toLowerCase().includes(q) ||
          c.summary?.toLowerCase().includes(q)
      );
    }
    if (filters.status === "answered") result = result.filter((c) => c.callStatus === "Call Answered");
    if (filters.status === "missed") result = result.filter((c) => c.callStatus !== "Call Answered");
    if (filters.direction === "inbound") result = result.filter((c) => c.callDirection?.toLowerCase().includes("inbound"));
    if (filters.direction === "outbound") result = result.filter((c) => !c.callDirection?.toLowerCase().includes("inbound"));
    if (filters.sentiment === "positive") result = result.filter((c) => parseFloat(c.sentiment) >= 7);
    if (filters.sentiment === "neutral") result = result.filter((c) => { const v = parseFloat(c.sentiment); return v >= 4 && v < 7; });
    if (filters.sentiment === "negative") result = result.filter((c) => parseFloat(c.sentiment) < 4);

    result.sort((a, b) => {
      switch (filters.sort) {
        case "newest": return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
        case "oldest": return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        case "duration_desc": return Number(b.callDuration) - Number(a.callDuration);
        case "duration_asc": return Number(a.callDuration) - Number(b.callDuration);
        case "cost_desc": return parseFloat(String(b.totalCallCost)) - parseFloat(String(a.totalCallCost));
        default: return 0;
      }
    });

    return result;
  }, [calls, filters]);

  const answered = calls.filter((c) => c.callStatus === "Call Answered").length;
  const missed = calls.length - answered;
  const avgDuration = calls.length
    ? Math.round(calls.reduce((a, c) => a + Number(c.callDuration), 0) / calls.length)
    : 0;
  const totalCost = calls.reduce((a, c) => a + Number(c.totalCallCost), 0).toFixed(2);

  /* ─── Loading Skeleton ─── */
  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-3 bg-gray-50 min-h-screen">
        <div className="h-6 w-40 rounded-xl bg-gray-200 animate-pulse mb-5" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-white animate-pulse border border-gray-100" style={{ animationDelay: `${i * 40}ms` }} />
          ))}
        </div>
        <div className="h-14 rounded-2xl bg-white animate-pulse border border-gray-100" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-white animate-pulse border border-gray-100" style={{ animationDelay: `${i * 60}ms` }} />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen  rounded-md overflow-hidden">
      <DeleteDialog<DeleteDialogDataInterface>
  isOpen={isDeleteDialogOpen}
  title="Are you sure you want to delete this call log?"
  data={dialogData}
  onClose={() => {
    setIsDeleteDialogOpen(false);
    setDialogData(null);
  }}
  onDelete={handleDelete}
/>
      {/* ── Sticky Header ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0  px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between  mx-auto">
          <div>
            <h1 className="text-lg font-bold text-[var(--color-primary-darker)] tracking-tight leading-none">
              Call Reports
            </h1>
            <p className="text-[11px] text-gray-400 mt-0.5">{calls.length} total records</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-gray-400 font-medium">Answer Rate</p>
              <p className="text-sm font-bold text-emerald-600">
                {calls.length ? Math.round((answered / calls.length) * 100) : 0}%
              </p>
            </div>
            <div className="w-px h-8 bg-gray-100 hidden sm:block" />
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="font-semibold text-gray-600">{answered}</span>
              <span className="text-gray-300">/</span>
              <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
              <span className="font-semibold text-gray-600">{missed}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-2 sm:px-4 py-5 space-y-4  mx-auto">
        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Total Calls" value={calls.length}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
          />
          <StatCard
            label="Answered" value={answered}
            sub={`${calls.length ? Math.round((answered / calls.length) * 100) : 0}% rate`}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard
            label="Avg Duration" value={`${avgDuration}s`}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard
            label="Total Cost" value={`₹${totalCost}`}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>

        {/* ── Filters ── */}
        <FiltersBar
          filters={filters}
          onChange={(partial) => setFilters((prev) => ({ ...prev, ...partial }))}
          total={calls.length}
          filtered={filteredCalls.length}
        />

        {/* ── Call List ── */}
        {filteredCalls.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <p className="text-sm font-semibold text-gray-400">No calls match your filters</p>
            <p className="text-xs text-gray-300 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[550px] overflow-y-auto hide-scrollbar">
            {filteredCalls.map((call) => (
              <CallCard key={call.id} call={call} onDeleteClick={(call) => {
      setDialogData({
        id: call.id,
        calledTo: call.calledTo,
      }); // pass full call OR just id
      setIsDeleteDialogOpen(true);
    }}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}