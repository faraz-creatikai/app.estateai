"use client";

import {
  disconnectAccount,
  getInstagramLivePosts,
  scheduleInstagramPost,
  getInstagramScheduledPosts,
  scheduleFacebookPost,
  getFacebookScheduledPosts,
  getInstagramAnalytics,
  getFacebookAnalytics,
} from "@/store/social-media/socialMedia";
import { useEffect, useRef, useState } from "react";
import SchedulerPanel from "../component/social/SchedulerPanel";       // ← now generic
import { createInstagramModule } from "./platforms/instagram/instagram";
import { createFacebookModule } from "./platforms/facebook/facebook";
import InstagramAnalyticsPanel from "./platforms/instagram/InstagramAnalyticPanel";
import FacebookAnalyticsPanel from "./platforms/facebook/FacebookAnalyticPanel";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface SocialPost {
  id: string;
  caption?: string;
  media_url: string;
  thumbnail_url?: string;
  media_type?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  timestamp: string;
  permalink: string;
}

export interface ApiResponse {
  success: boolean;
  posts: SocialPost[];
}

export type PlatformId = "instagram" | "facebook" | "youtube" | "twitter";
export type PlatformStatus = "connected" | "not_connected" | "coming_soon";

export interface SetupStep {
  number: number;
  title: string;
  description: string;
  docUrl?: string;
}

export interface PlatformModuleConfig {
  id: PlatformId;
  name: string;
  defaultStatus: PlatformStatus;
  color: string;
  icon: React.ReactNode;
  setupSteps?: SetupStep[];
  fetchPosts: () => Promise<ApiResponse>;
  connect: (adminId: string) => void;
  disconnect?: () => Promise<boolean>;
  /** Key sent to the scheduler API (e.g. "INSTAGRAM" | "FACEBOOK") */
  schedulerKey?: string;
  /** Which API functions to use in the scheduler */
  schedulePost?: (formData: FormData) => Promise<{ success: boolean; error?: string } | null>;
  getScheduledPosts?: (key: string) => Promise<{ success: boolean; posts?: any[] } | null>;
}

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM: YOUTUBE
// ─────────────────────────────────────────────────────────────────────────────

function createYoutubeModule(): PlatformModuleConfig {
  return {
    id: "youtube",
    name: "YouTube",
    defaultStatus: "coming_soon",
    color: "linear-gradient(135deg,#ff0000,#cc0000)",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    fetchPosts: async () => ({ success: false, posts: [] }),
    connect: () => {},
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM: TWITTER / X
// ─────────────────────────────────────────────────────────────────────────────

function createTwitterModule(): PlatformModuleConfig {
  return {
    id: "twitter",
    name: "X / Twitter",
    defaultStatus: "coming_soon",
    color: "linear-gradient(135deg,#000000,#333333)",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    fetchPosts: async () => ({ success: false, posts: [] }),
    connect: () => {},
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM REGISTRY
// Each module declares its own scheduler API functions — no switch needed below.
// ─────────────────────────────────────────────────────────────────────────────

const PLATFORM_MODULES: PlatformModuleConfig[] = [
  {
    ...createInstagramModule(),
    schedulerKey: "INSTAGRAM",
    schedulePost: scheduleInstagramPost,
    getScheduledPosts: getInstagramScheduledPosts,
  },
  {
    ...createFacebookModule(),
    schedulerKey: "FACEBOOK",
    schedulePost: scheduleFacebookPost,
    getScheduledPosts: getFacebookScheduledPosts,
  },
  createYoutubeModule(),
  createTwitterModule(),
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const isVideoPost = (post: SocialPost) =>
  post.media_type === "VIDEO" ||
  post.media_url.includes(".mp4") ||
  post.media_url.includes("video");

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UI COMPONENTS  (PlatformPill, StatCard, DisconnectDialog, ReelCard,
//                        ImageCard, PostCard, SetupGuide — all unchanged)
// ─────────────────────────────────────────────────────────────────────────────

function PlatformPill({
  module, status, active, onClick,
}: {
  module: PlatformModuleConfig; status: PlatformStatus; active: boolean; onClick: () => void;
}) {
  const isComingSoon = status === "coming_soon";
  return (
    <button
      onClick={!isComingSoon ? onClick : undefined}
      disabled={isComingSoon}
      title={isComingSoon ? `${module.name} — coming soon` : module.name}
      className={`
        relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
        border transition-all duration-200 whitespace-nowrap flex-shrink-0
        ${isComingSoon ? "opacity-60 cursor-not-allowed border-transparent text-gray-400" : "cursor-pointer"}
        ${active
          ? "border-[var(--color-primary-light)] bg-[var(--color-primary)] text-[var(--color-primary-lighter)] shadow-sm"
          : !isComingSoon
          ? "border-transparent bg-gray-100  hover:bg-[var(--color-primary-light)] text-gray-500  hover:text-gray-700"
          : " bg-gray-100"}
      `}
    >
      <span className="w-5 h-5 rounded-md flex items-center justify-center text-white flex-shrink-0" style={{ background: module.color }}>
        <span className="scale-[0.65]">{module.icon}</span>
      </span>
      {module.name}
      {status === "connected" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />}
      {isComingSoon && (
        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">Soon</span>
      )}
    </button>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 border flex flex-col gap-1 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
      accent ? "bg-[var(--color-primary)] border-[var(--color-primary-dark)] text-white" : "bg-white border-[var(--color-primary-light)] text-[var(--color-primary-darker)]"
    }`}>
      <span className={`text-[10px] font-semibold uppercase tracking-widest ${accent ? "text-[var(--color-primary-light)]" : "text-[var(--color-gray)]"}`}>{label}</span>
      <span className="text-2xl font-black leading-none">{value}</span>
      {sub && <span className={`text-[10px] mt-0.5 ${accent ? "text-[var(--color-primary-light)]" : "text-[var(--color-gray)]"}`}>{sub}</span>}
    </div>
  );
}

function DisconnectDialog({ module, onConfirm, onCancel, loading }: {
  module: PlatformModuleConfig; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl border border-[var(--color-primary-light)] shadow-2xl p-6 max-w-sm w-full flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: module.color }}>
            <span className="scale-[1.6]">{module.icon}</span>
          </div>
          <div>
            <h3 className="font-black text-gray-900">Disconnect {module.name}?</h3>
            <p className="text-xs text-[var(--color-gray)] mt-0.5 leading-relaxed">Your posts will be hidden and you'll need to reconnect to view them again.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs text-red-700 font-medium">This will revoke the access token stored on our server.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onCancel} disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60 cursor-pointer">
            {loading ? (<><svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>Disconnecting…</>) : "Yes, disconnect"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReelCard({ post }: { post: SocialPost }) {
  const [playing, setPlaying] = useState(false);
  const [thumbError, setThumbError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (playing) { el.pause(); el.currentTime = 0; setPlaying(false); }
    else { el.play().catch(() => {}); setPlaying(true); }
  };
  return (
    <div className="group bg-white rounded-2xl border border-[var(--color-primary-light)] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
      <div className="relative w-full aspect-square bg-gray-900 overflow-hidden cursor-pointer select-none" onClick={togglePlay}>
        <video ref={videoRef} src={post.media_url} className="w-full h-full object-cover" muted loop playsInline preload="metadata" />
        {!playing && post.thumbnail_url && !thumbError && (
          <img src={post.thumbnail_url} alt="" onError={() => setThumbError(true)} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        )}
        {!playing && (thumbError || !post.thumbnail_url) && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)" }} />
        )}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${playing ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`} style={{ background: playing ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.32)" }}>
          {playing ? (
            <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-200">
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </div>
          )}
        </div>
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1 z-10 pointer-events-none">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          Reel
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <p className="text-sm text-gray-700 leading-relaxed line-clamp-2 min-h-[2.5rem]">
          {post.caption ?? <span className="text-[var(--color-gray)] italic text-xs">No caption</span>}
        </p>
        <div className="mt-auto pt-3 border-t border-[var(--color-primary-lighter)] flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-[var(--color-primary-darker)]">{formatDate(post.timestamp)}</span>
            <span className="text-[10px] text-[var(--color-gray)]">{formatTime(post.timestamp)}</span>
          </div>
          <a href={post.permalink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-darker)] transition-colors px-3 py-1.5 rounded-full border border-[var(--color-primary-light)] hover:bg-[var(--color-primary-lighter)]">
            View
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        </div>
      </div>
    </div>
  );
}

function ImageCard({ post }: { post: SocialPost }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="group bg-white rounded-2xl border border-[var(--color-primary-light)] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
      <div className="relative w-full aspect-square bg-[var(--color-primary-lighter)] overflow-hidden">
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-[var(--color-primary-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        ) : (
          <img src={post.media_url} alt={post.caption ?? "Post"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={() => setImgError(true)} />
        )}
        {post.media_type === "CAROUSEL_ALBUM" && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1 z-10">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16" /></svg>
            Album
          </div>
        )}
        <div className="absolute inset-0 bg-[var(--color-primary)]/0 group-hover:bg-[var(--color-primary)]/10 transition-all duration-300 pointer-events-none" />
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <p className="text-sm text-gray-700 leading-relaxed line-clamp-2 min-h-[2.5rem]">
          {post.caption ?? <span className="text-[var(--color-gray)] italic text-xs">No caption</span>}
        </p>
        <div className="mt-auto pt-3 border-t border-[var(--color-primary-lighter)] flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-[var(--color-primary-darker)]">{formatDate(post.timestamp)}</span>
            <span className="text-[10px] text-[var(--color-gray)]">{formatTime(post.timestamp)}</span>
          </div>
          <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-darker)] transition-colors px-3 py-1.5 rounded-full border border-[var(--color-primary-light)] hover:bg-[var(--color-primary-lighter)]">
            View
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        </div>
      </div>
    </div>
  );
}

function PostCard({ post }: { post: SocialPost }) {
  return isVideoPost(post) ? <ReelCard post={post} /> : <ImageCard post={post} />;
}

function SetupGuide({ module, onConnect }: { module: PlatformModuleConfig; onConnect: () => void }) {
  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  const steps = module.setupSteps ?? [];
  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white rounded-2xl border border-[var(--color-primary-light)] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0" style={{ background: module.color }}>
            <span className="scale-[1.8]">{module.icon}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-black text-[var(--color-primary-darker)]">Connect {module.name}</h2>
            <p className="text-sm text-[var(--color-gray)] mt-1 leading-relaxed">Complete the {steps.length} steps below, then click Connect. One-time setup only.</p>
          </div>
          <button onClick={onConnect} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm shadow-md hover:opacity-90 transition-opacity cursor-pointer flex-shrink-0" style={{ background: module.color }}>
            Connect {module.name}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
        </div>
        {steps.length > 0 && (
          <div className="mt-5 pt-5 border-t border-[var(--color-primary-lighter)]">
            <div className="flex items-center">
              {steps.map((step, i) => (
                <div key={step.number} className="flex items-center flex-1 last:flex-none">
                  <button onClick={() => setExpandedStep(expandedStep === step.number ? null : step.number)} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all cursor-pointer flex-shrink-0 ${expandedStep === step.number ? "bg-[var(--color-primary)] text-white shadow-sm scale-110" : "bg-[var(--color-primary-lighter)] text-[var(--color-primary)] border-2 border-[var(--color-primary-light)] hover:border-[var(--color-primary)]"}`}>{step.number}</button>
                  {i < steps.length - 1 && <div className="flex-1 h-0.5 bg-[var(--color-primary-light)] mx-1" />}
                </div>
              ))}
              <div className="flex items-center flex-none">
                <div className="w-4 h-0.5 bg-[var(--color-primary-light)] mx-1" />
                <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {steps.length > 0 && (
        <div className="flex flex-col gap-2">
          {steps.map((step) => {
            const isLast = step.number === steps.length;
            const isOpen = expandedStep === step.number;
            return (
              <div key={step.number} className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition-all duration-200 ${isOpen ? "border-[var(--color-primary)] shadow-md" : "border-[var(--color-primary-light)]"}`}>
                <button onClick={() => setExpandedStep(isOpen ? null : step.number)} className="w-full flex items-center gap-4 p-4 text-left cursor-pointer">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${isOpen ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-primary-lighter)] text-[var(--color-primary)]"}`}>{step.number}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800 text-sm">{step.title}</span>
                      {isLast && <span className="text-[9px] font-bold uppercase tracking-wider bg-[var(--color-primary-lighter)] text-[var(--color-primary)] px-2 py-0.5 rounded-full border border-[var(--color-primary-light)]">Final</span>}
                    </div>
                    {!isOpen && <p className="text-xs text-[var(--color-gray)] mt-0.5 line-clamp-1">{step.description}</p>}
                  </div>
                  <svg className={`w-4 h-4 text-[var(--color-gray)] transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-[var(--color-primary-lighter)]">
                    <div className="pl-12">
                      <p className="text-sm text-gray-600 leading-relaxed mt-4">{step.description}</p>
                      <div className="flex items-center gap-3 flex-wrap mt-4">
                        {step.docUrl && (
                          <a href={step.docUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] px-3 py-1.5 rounded-lg border border-[var(--color-primary-light)] bg-[var(--color-primary-lighter)] hover:bg-[var(--color-primary-light)] transition-colors">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            Open Documentation
                          </a>
                        )}
                        {isLast ? (
                          <button onClick={onConnect} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity" style={{ background: module.color }}>Connect {module.name}</button>
                        ) : (
                          <button onClick={() => setExpandedStep(step.number + 1)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] px-3 py-1.5 rounded-lg border border-[var(--color-primary-light)] bg-white hover:bg-[var(--color-primary-lighter)] transition-colors cursor-pointer">
                            Next step
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// POSTS PANEL
// Now receives `activeModule` so it can pass scheduler functions to SchedulerPanel.
// ─────────────────────────────────────────────────────────────────────────────

function PostsPanel({
  posts,
  loading,
  error,
  onRefresh,
  activeModule,               // ← NEW: needed to wire up the correct scheduler
}: {
  posts: SocialPost[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  activeModule: PlatformModuleConfig;   // ← NEW
}) {
  const [filterText, setFilterText] = useState("");
  const [contentTab, setContentTab] = useState<"posts" | "analytics" | "scheduled">("posts");

  const filteredPosts = posts.filter(
    (p) => !filterText || p.caption?.toLowerCase().includes(filterText.toLowerCase())
  );

  const totalPosts   = posts.length;
  const withCaption  = posts.filter((p) => p.caption).length;
  const reels        = posts.filter(isVideoPost).length;
  const latestPost   = posts[0] ? formatDate(posts[0].timestamp) : "—";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Posts"   value={totalPosts}  sub="All time"   accent />
        <StatCard label="With Caption"  value={withCaption} sub={`${totalPosts ? Math.round((withCaption / totalPosts) * 100) : 0}%`} />
        <StatCard label="Reels"         value={reels}       sub="Video content" />
        <StatCard label="Latest Post"   value={latestPost}  sub="Most recent" />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-white border border-[var(--color-primary-light)] rounded-xl p-1 shadow-sm">
          {(["posts", "analytics", "scheduled"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setContentTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all duration-200 cursor-pointer ${
                contentTab === tab
                  ? "bg-[var(--color-primary)] text-white shadow-sm"
                  : "text-[var(--color-gray)] hover:text-[var(--color-primary)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {contentTab === "posts" && posts.length > 0 && (
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-gray)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by caption..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-[var(--color-primary-light)] bg-white text-gray-700 placeholder-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition"
            />
          </div>
        )}

        <button onClick={onRefresh} disabled={loading} className="ml-auto flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-[var(--color-primary)] border border-[var(--color-primary-light)] bg-white hover:bg-[var(--color-primary-lighter)] transition-colors disabled:opacity-50 cursor-pointer">
          <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* ── Posts tab ── */}
      {contentTab === "posts" && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-white border border-[var(--color-primary-light)] overflow-hidden animate-pulse">
                  <div className="aspect-square bg-[var(--color-primary-lighter)]" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-[var(--color-primary-lighter)] rounded-full w-3/4" />
                    <div className="h-3 bg-[var(--color-primary-lighter)] rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-red-500">{error}</p>
              <button onClick={onRefresh} className="text-sm text-[var(--color-primary)] hover:underline cursor-pointer">Try again</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredPosts.map((post) => <PostCard key={post.id} post={post} />)}
              </div>
              {posts.length > 0 && (
                <p className="text-xs text-[var(--color-gray)] text-center pb-2">
                  Showing {filteredPosts.length} of {totalPosts} posts
                </p>
              )}
            </>
          )}
        </>
      )}

      {/* ── Analytics tab ── */}
     {contentTab === "analytics" && (
  activeModule.id === "instagram"
    ? <InstagramAnalyticsPanel /> : 
    activeModule.id === "facebook"
    ? <FacebookAnalyticsPanel />
    : (
       <div className="bg-white rounded-2xl border border-[var(--color-primary-light)] p-10 flex flex-col items-center gap-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-lighter)] flex items-center justify-center">
            <svg className="w-7 h-7 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="font-bold text-[var(--color-primary-darker)]">Analytics Coming Soon</h3>
            <p className="text-sm text-[var(--color-gray)] mt-1 max-w-xs">Reach, impressions and engagement stats will appear here.</p>
          </div>
        </div>
    )
)}

      {/* ── Scheduled tab ──
          Renders the generic SchedulerPanel wired to the active platform's
          own schedule/fetch functions. Falls back gracefully if a platform
          hasn't registered scheduler functions yet (e.g. YouTube). */}
      {contentTab === "scheduled" && (
        activeModule.schedulePost && activeModule.getScheduledPosts && activeModule.schedulerKey ? (
          <SchedulerPanel
            platformLabel={activeModule.name}
            platformKey={activeModule.schedulerKey}
            schedulePost={activeModule.schedulePost}
            getScheduledPosts={activeModule.getScheduledPosts}
            accentColor={activeModule.color}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-[var(--color-primary-light)] p-10 flex flex-col items-center gap-4 shadow-sm text-center">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-lighter)] flex items-center justify-center">
              <svg className="w-7 h-7 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-primary-darker)]">Scheduler Coming Soon</h3>
              <p className="text-sm text-[var(--color-gray)] mt-1 max-w-xs">Post scheduling for {activeModule.name} will be available soon.</p>
            </div>
          </div>
        )
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function SocialMediaManagerPage() {
  const admin = { _id: "user_123" }; // ← replace with real auth context

  const [activePlatformId, setActivePlatformId] = useState<PlatformId>("instagram");

  const [platformStatuses, setPlatformStatuses] = useState<Record<PlatformId, PlatformStatus>>(
    () => Object.fromEntries(PLATFORM_MODULES.map((m) => [m.id, m.defaultStatus])) as Record<PlatformId, PlatformStatus>
  );

  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const initDone = useRef(false);

  const activeModule = PLATFORM_MODULES.find((m) => m.id === activePlatformId)!;
  const activeStatus = platformStatuses[activePlatformId];

  const fetchPosts = async (platformId: PlatformId) => {
    const mod = PLATFORM_MODULES.find((m) => m.id === platformId);
    if (!mod) return;
    setLoading(true);
    setError(null);
    const res = await mod.fetchPosts();
    if (res.success) setPosts(res.posts);
    else setError("Failed to load posts.");
    setLoading(false);
  };

  const handleDisconnect = async () => {
    if (!activeModule.disconnect) return;
    setDisconnecting(true);
    const ok = await activeModule.disconnect();
    if (ok) {
      setPlatformStatuses((prev) => ({ ...prev, [activePlatformId]: "not_connected" }));
      setPosts([]);
      setShowDisconnectDialog(false);
    } else {
      setError("Failed to disconnect. Please try again.");
      setShowDisconnectDialog(false);
    }
    setDisconnecting(false);
  };

  useEffect(() => {
    const init = async () => {
      const mod = PLATFORM_MODULES.find((m) => m.id === activePlatformId);
      if (!mod || mod.defaultStatus === "coming_soon") { initDone.current = true; return; }
      setLoading(true);
      const res = await mod.fetchPosts();
      if (res.success) {
        setPlatformStatuses((prev) => ({ ...prev, [activePlatformId]: "connected" }));
        setPosts(res.posts);
      }
      setLoading(false);
      initDone.current = true;
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

useEffect(() => {
  if (!initDone.current) return;
  const mod = PLATFORM_MODULES.find((m) => m.id === activePlatformId);
  if (!mod || mod.defaultStatus === "coming_soon") return;

  const tryFetch = async () => {
    setLoading(true);
    setError(null);
    setPosts([]);
    const res = await mod.fetchPosts();
    if (res.success) {
      setPlatformStatuses((prev) => ({ ...prev, [activePlatformId]: "connected" }));
      setPosts(res.posts);
    } else if (platformStatuses[activePlatformId] !== "connected") {
      // genuinely not connected — show setup guide
      setPosts([]);
    } else {
      setError("Failed to load posts.");
    }
    setLoading(false);
  };

  tryFetch();
}, [activePlatformId]);

  const connectedCount = Object.values(platformStatuses).filter((s) => s === "connected").length;



  return (
    <div className="flex flex-col gap-5 p-6 bg-white rounded-md">
      
      {showDisconnectDialog && (
        <DisconnectDialog
          module={activeModule}
          onConfirm={handleDisconnect}
          onCancel={() => setShowDisconnectDialog(false)}
          loading={disconnecting}
        />
      )}

      {/* Page title */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-xl font-black text-[var(--color-primary-darker)] tracking-tight">Social Media</h1>
          <p className="text-xs text-[var(--color-gray)] mt-0.5">Manage and review your connected platforms</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {connectedCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700">{connectedCount} connected</span>
            </div>
          )}
          {activeStatus === "connected" && activeModule.disconnect && (
            <button
              onClick={() => setShowDisconnectDialog(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Disconnect {activeModule.name}
            </button>
          )}
        </div>
      </div>

      {/* Platform pill tab bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 -mx-1 px-1">
        {PLATFORM_MODULES.map((m) => (
          <PlatformPill
            key={m.id}
            module={m}
            status={platformStatuses[m.id]}
            active={activePlatformId === m.id}
            onClick={() => setActivePlatformId(m.id)}
          />
        ))}
      </div>

      <div className="h-px bg-[var(--color-primary-light)]" />

      {/* Content */}
      {loading && activeStatus === "not_connected" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-[var(--color-primary-light)] overflow-hidden animate-pulse">
              <div className="aspect-square bg-[var(--color-primary-lighter)]" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-[var(--color-primary-lighter)] rounded-full w-3/4" />
                <div className="h-3 bg-[var(--color-primary-lighter)] rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : activeStatus === "coming_soon" ? (
        <div className="bg-white rounded-2xl border border-[var(--color-primary-light)] p-10 flex flex-col items-center gap-5 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white opacity-50" style={{ background: activeModule.color }}>
            <span className="scale-[1.8]">{activeModule.icon}</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--color-primary-darker)]">{activeModule.name} — Coming Soon</h2>
            <p className="text-sm text-[var(--color-gray)] mt-1 max-w-sm">We are working on {activeModule.name} integration. Stay tuned!</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200">
            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-semibold text-amber-700">In development</span>
          </div>
        </div>
      ) : activeStatus === "not_connected" ? (
        <SetupGuide module={activeModule} onConnect={() => activeModule.connect(admin._id)} />
      ) : (
        <PostsPanel
          posts={posts}
          loading={loading}
          error={error}
          onRefresh={() => fetchPosts(activePlatformId)}
          activeModule={activeModule}    
        />
      )}
    </div>
  );
}