"use client";
import React, { useEffect, useRef } from "react";

interface Message {
  role: "user" | "ai";
  text: string;
}

interface AIChatMessagesProps {
  agentName: string;
  messages: Message[];
  aiLoading?: boolean;
  currentStep?: string;
  hints?: string[];
  onHintClick?: (hint: string) => void;
  maxHeight?: string;
}

const AIChatMessages: React.FC<AIChatMessagesProps> = ({
  agentName,
  messages,
  aiLoading = false,
  currentStep = "Thinking...",
  hints = [],
  onHintClick,
  maxHeight = "400px",
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiLoading]);

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div
      className="flex-1 overflow-y-auto px-5 pb-4 pt-3 flex flex-col gap-3"
      style={{
        maxHeight,
        scrollbarWidth: "thin",
        scrollbarColor: "#e2e8f0 transparent",
      }}
    >
      {/* ── Greeting bubble ── */}
      <div className="flex items-end gap-2 max-w-[88%]">
        {/* AI avatar */}
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-semibold flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
            boxShadow: "0 2px 6px rgba(2,132,199,0.3)",
          }}
        >
          {getInitials(agentName)}
        </div>

        {/* Bubble */}
        <div
          className="rounded-2xl rounded-bl-[4px] px-3.5 py-2.5 border"
          style={{
            background: "#ffffff",
            borderColor: "#e2e8f0",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <p className="text-[12.5px] leading-relaxed" style={{ color: "#475569" }}>
            👋 Hi! I'm{" "}
            <span className="font-semibold text-sky-600">{agentName}</span>.
            {" "}Describe what you're looking for and I'll help you using AI.
          </p>

          {/* Hint chips — hide once conversation starts */}
          {hints.length > 0 && messages.length === 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {hints.map((hint) => (
                <button
                  key={hint}
                  type="button"
                  onClick={() => onHintClick?.(hint)}
                  className="text-[10px] px-2.5 py-1 rounded-full transition-all"
                  style={{
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    color: "#64748b",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "#7dd3fc";
                    el.style.color = "#0284c7";
                    el.style.background = "#f0f9ff";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "#e2e8f0";
                    el.style.color = "#64748b";
                    el.style.background = "#f8fafc";
                  }}
                >
                  {hint}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Message history ── */}
      {messages.map((msg, i) => {
        const isUser = msg.role === "user";

        return (
          <React.Fragment key={i}>
            {/* Section divider before each AI reply */}
            {!isUser && (
              <div className="flex items-center gap-2 my-0.5">
                <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
                <span
                  className="text-[9px] font-mono"
                  style={{ color: "#94a3b8" }}
                >
                  result
                </span>
                <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
              </div>
            )}

            <div
              className={`flex items-end gap-2 max-w-[82%] ${
                isUser ? "ml-auto flex-row-reverse" : ""
              }`}
            >
              {/* Avatar */}
              {isUser ? (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-semibold flex-shrink-0"
                  style={{ background: "#e2e8f0", color: "#64748b" }}
                >
                  You
                </div>
              ) : (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-semibold flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                    boxShadow: "0 2px 6px rgba(2,132,199,0.3)",
                  }}
                >
                  {getInitials(agentName)}
                </div>
              )}

              {/* Bubble */}
              {isUser ? (
                <div
                  className="rounded-2xl rounded-br-[4px] px-3.5 py-2.5"
                  style={{
                    background: "#0284c7",
                    boxShadow: "0 2px 8px rgba(2,132,199,0.25)",
                  }}
                >
                  <p className="text-[12.5px] leading-relaxed text-white">{msg.text}</p>
                </div>
              ) : (
                <div
                  className="rounded-2xl rounded-bl-[4px] px-3.5 py-2.5 border"
                  style={{
                    background: "#ffffff",
                    borderColor: "#e2e8f0",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                >
                  <p className="text-[12.5px] leading-relaxed" style={{ color: "#475569" }}>
                    {msg.text}
                  </p>
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}

      {/* ── Typing / loading indicator ── */}
      {aiLoading && (
        <div className="flex items-end gap-2 max-w-[88%]">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-semibold flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
              boxShadow: "0 2px 6px rgba(2,132,199,0.3)",
            }}
          >
            {getInitials(agentName)}
          </div>

          <div
            className="rounded-2xl rounded-bl-[4px] px-3.5 py-2.5 border flex items-center gap-2"
            style={{
              background: "#ffffff",
              borderColor: "#e2e8f0",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <div className="flex gap-1">
              {[0, 140, 280].map((d) => (
                <span
                  key={d}
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{ background: "#cbd5e1", animationDelay: `${d}ms` }}
                />
              ))}
            </div>
            <span className="text-[10px] font-mono" style={{ color: "#94a3b8" }}>
              {currentStep}
            </span>
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
};

export default AIChatMessages;