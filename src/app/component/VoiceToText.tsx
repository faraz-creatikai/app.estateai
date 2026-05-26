"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, X, Radio } from "lucide-react";

interface Props {
  value: string;
  onChange: (text: string) => void;
}

const VoiceToText: React.FC<Props> = ({ value, onChange }) => {
  const [isListening, setIsListening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [ripple, setRipple] = useState(false);
  const recognitionRef = useRef<any>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      onChange((value + " " + transcript).trim());
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [value, onChange]);

  // Close on outside click (desktop only — mobile has backdrop)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isListening]);

  // Lock body scroll when modal open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleClose = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* ── TRIGGER PILL ── */}
      <div className="relative inline-flex items-center z-30">
        <div
          ref={triggerRef}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`
            group relative flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer
            border transition-all duration-300 select-none
            ${
              isOpen
                ? "bg-[var(--color-primary)] border-[var(--color-primary-dark)] shadow-lg shadow-[var(--color-primary)]/30"
                : [
                    "bg-white border-[var(--color-primary-light)]",
                    "hover:border-[var(--color-primary)] hover:shadow-md hover:shadow-[var(--color-primary-light)]",
                    "dark:bg-[var(--color-primary-darker)] dark:border-[var(--color-primary-dark)]",
                    "dark:hover:border-[var(--color-accent)]",
                  ].join(" ")
            }
          `}
        >
          {/* AI Bot */}
          <img
            className="w-[25px] h-[25px] object-contain transition-transform duration-300 group-hover:scale-110"
            src="/aiBot.png"
            alt="AI Assistant"
          />

          {/* Divider */}
          <span
            className={`w-px h-4 ${
              isOpen
                ? "bg-white/30"
                : "bg-[var(--color-primary-light)] dark:bg-[var(--color-primary-dark)]"
            }`}
          />

          {/* Mic icon */}
          <span
            className={`transition-colors duration-200 ${
              isOpen
                ? "text-white"
                : "text-[var(--color-primary)] dark:text-[var(--color-accent)] group-hover:text-[var(--color-primary-dark)]"
            }`}
          >
            <Mic size={15} />
          </span>

          {/* Live ping dot */}
          {isListening && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-destructive)] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--color-destructive)]" />
            </span>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MODAL BACKDROP — covers entire screen
      ══════════════════════════════════════════ */}
      <div
        className={`
          fixed inset-0 z-40
          bg-black/40 backdrop-blur-sm
          transition-all duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={handleClose}
      />

      {/* ══════════════════════════════════════════
          MODAL CARD
          • Mobile  → slides up from bottom (sheet)
          • Desktop → centered dialog
      ══════════════════════════════════════════ */}
      <div
        className={`
          fixed z-50 inset-x-0 bottom-0
          sm:inset-0 sm:flex sm:items-center sm:justify-center
          transition-all duration-400 ease-out
          ${isOpen ? "pointer-events-auto" : "pointer-events-none"}
        `}
      >
        <div
          ref={popupRef}
          className={`
            relative
            w-full sm:w-[360px] sm:max-w-[90vw]
            rounded-t-3xl sm:rounded-3xl
            overflow-hidden
            bg-white dark:bg-[var(--color-primary-darker)]
            border border-[var(--color-primary-light)] dark:border-[var(--color-primary-dark)]/60
            shadow-2xl shadow-[var(--color-primary)]/20
            transition-all duration-400 ease-out
            ${
              isOpen
                ? "translate-y-0 opacity-100 scale-100"
                : "translate-y-8 sm:translate-y-0 sm:scale-95 opacity-0"
            }
          `}
        >
          {/* Top shimmer accent */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[var(--color-primary-light)] via-[var(--color-primary)] to-[var(--color-primary-light)]" />

          {/* Mobile drag handle */}
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-[var(--color-primary-light)] dark:bg-[var(--color-primary-dark)]" />
          </div>

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3">
            <div className="flex items-center gap-3">
              {/* Icon badge */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md
                  bg-[var(--color-primary)] shadow-[var(--color-primary)]/30"
              >
                <Radio size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white leading-none">
                  Voice Input
                </p>
                <p
                  className={`text-[11px] mt-0.5 font-medium transition-colors ${
                    isListening
                      ? "text-[var(--color-destructive)]"
                      : "text-[var(--color-primary)] dark:text-[var(--color-accent)]"
                  }`}
                >
                  {isListening ? "● Listening…" : "Tap mic to speak"}
                </p>
              </div>
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all
                bg-[var(--color-primary-lighter)] hover:bg-[var(--color-primary-light)]
                dark:bg-[var(--color-primary-dark)]/50 dark:hover:bg-[var(--color-primary-dark)]
                text-[var(--color-primary)] dark:text-[var(--color-accent)]"
            >
              <X size={14} />
            </button>
          </div>

          {/* ── Waveform Visualizer ── */}
          <div
            className="mx-5 mb-4 h-20 rounded-2xl flex items-center justify-center gap-[3.5px] overflow-hidden relative
              bg-[var(--color-primary-lighter)] dark:bg-[var(--color-primary-dark)]/40
              border border-[var(--color-primary-light)] dark:border-[var(--color-primary-dark)]/60"
          >
            {isListening ? (
              Array.from({ length: 22 }).map((_, i) => (
                <span
                  key={i}
                  className="block w-[3px] rounded-full bg-gradient-to-t from-[var(--color-primary)] to-[var(--color-accent)]"
                  style={{
                    height: `${20 + ((i * 13 + 17) % 55)}%`,
                    animation: `waveBar ${0.4 + (i % 5) * 0.08}s ease-in-out ${i * 0.04}s infinite alternate`,
                  }}
                />
              ))
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-[3.5px]">
                  {Array.from({ length: 22 }).map((_, i) => (
                    <span
                      key={i}
                      className="block w-[3px] h-[3px] rounded-full bg-[var(--color-primary-light)] dark:bg-[var(--color-primary-dark)]"
                    />
                  ))}
                </div>
                <p className="text-[11px] text-[var(--color-primary)]/60 dark:text-[var(--color-accent)]/60 font-medium">
                  Waveform will appear here
                </p>
              </div>
            )}
          </div>

          {/* ── Language + info row ── */}
          <div className="mx-5 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-[var(--color-muted)]/60 uppercase tracking-widest">
                Language
              </span>
              <span
                className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold
                  bg-[var(--color-primary-lighter)] dark:bg-[var(--color-primary-dark)]/50
                  border border-[var(--color-primary-light)] dark:border-[var(--color-primary-dark)]
                  text-[var(--color-primary)] dark:text-[var(--color-accent)]"
              >
                EN — India
              </span>
            </div>

            {/* Transcript word count */}
            {value && (
              <span className="text-[10px] text-slate-400 dark:text-[var(--color-muted)]/50">
                {value.trim().split(/\s+/).length} words
              </span>
            )}
          </div>

          {/* ── Transcript preview ── */}
          {value && (
            <div
              className="mx-5 mb-4 px-3 py-2.5 rounded-xl
                bg-[var(--color-primary-lighter)] dark:bg-[var(--color-primary-dark)]/30
                border border-[var(--color-primary-light)] dark:border-[var(--color-primary-dark)]/50"
            >
              <p className="text-[12px] text-slate-600 dark:text-[var(--color-muted)] leading-relaxed line-clamp-3 italic">
                "{value}"
              </p>
            </div>
          )}

          {/* ── Record Button ── */}
          <div className="px-5 pb-6 sm:pb-5">
            <button
              type="button"
              onClick={toggleListening}
              className={`
                relative w-full py-3.5 rounded-2xl font-bold text-sm text-white
                transition-all duration-300 overflow-hidden
                active:scale-[0.98]
                ${
                  isListening
                    ? "bg-[var(--color-destructive)] shadow-lg shadow-[var(--color-destructive)]/30 hover:opacity-90"
                    : [
                        "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]",
                        "shadow-lg shadow-[var(--color-primary)]/30 hover:shadow-[var(--color-primary)]/50",
                        "hover:scale-[1.02]",
                      ].join(" ")
                }
              `}
            >
              {/* Ripple */}
              {ripple && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="w-10 h-10 rounded-full bg-white/25 animate-ping" />
                </span>
              )}
              <span className="relative flex items-center justify-center gap-2">
                {isListening ? (
                  <>
                    <MicOff size={16} />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic size={16} />
                    Start Recording
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Waveform animation */}
      <style>{`
        @keyframes waveBar {
          from { transform: scaleY(0.25); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </>
  );
};

export default VoiceToText;