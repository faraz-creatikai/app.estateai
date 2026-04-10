"use client";

import React from "react";
import { BsArrowLeftShort } from "react-icons/bs";

interface Agent {
    name?: string;
    type?: string;
    campaign?: string;
    targetSegment?: string;
}

interface Props {
    selectedAgent?: Agent | null;
    onClose: () => void;
    AGENTS_TYPE_ICON: Record<string, React.ReactNode>;
}

const AIAgentSidebar: React.FC<Props> = ({
    selectedAgent,
    onClose,
    AGENTS_TYPE_ICON,
}) => {
    const steps =
        selectedAgent?.type === "Matching"
            ? [
                { step: "1", label: "Describe your ideal lead", icon: "✍️" },
                { step: "2", label: "AI scans your database", icon: "🔍" },
                { step: "3", label: "Get ranked matches instantly", icon: "⚡" },
            ]
            : selectedAgent?.type === "Followup"
                ? [
                    { step: "1", label: "Select leads to follow up", icon: "✍️" },
                    { step: "2", label: "AI drafts personalised messages", icon: "💬" },
                    { step: "3", label: "Review & send with one click", icon: "📤" },
                ]
                : selectedAgent?.type === "Qualification"
                    ? [
                        { step: "1", label: "Pick a customer from the list", icon: "👤" },
                        { step: "2", label: "Ask the AI about lead quality", icon: "🤖" },
                        { step: "3", label: "Save the qualification status", icon: "✅" },
                    ]
                    : selectedAgent?.type === "Recommendation"
                        ? [
                            { step: "1", label: "Select a base customer", icon: "👤" },
                            { step: "2", label: "AI finds similar profiles", icon: "🔗" },
                            { step: "3", label: "Explore recommended leads", icon: "📋" },
                        ]
                        : selectedAgent?.type === "Calling"
                            ? [
                                { step: "1", label: "Choose a customer to call", icon: "📞" },
                                { step: "2", label: "AI prepares call context", icon: "🧠" },
                                { step: "3", label: "Log outcome after the call", icon: "📝" },
                            ]
                            : selectedAgent?.type === "Mining"
                                ? [
                                    { step: "1", label: "Open the Mining workspace", icon: "🗄️" },
                                    { step: "2", label: "AI scans your entire lead database", icon: "🤖" },
                                    { step: "3", label: "Review patterns, risks & recommendations", icon: "📊" },
                                ] : [
                                    { step: "1", label: "Select an agent type", icon: "🤖" },
                                    { step: "2", label: "Describe your task", icon: "✍️" },
                                    { step: "3", label: "Get AI-powered results", icon: "⚡" },
                                ];

    const capabilities =
        selectedAgent?.type === "Matching"
            ? [
                "Natural language lead search",
                "Multi-field filter support",
                "Semantic similarity scoring",
                "Campaign & segment filtering",
                "Real-time database scanning",
            ]
            : selectedAgent?.type === "Followup"
                ? [
                    "Personalised message drafting",
                    "Follow-up scheduling suggestions",
                    "Tone & channel customisation",
                    "Lead history awareness",
                    "Bulk follow-up support",
                ]
                : selectedAgent?.type === "Qualification"
                    ? [
                        "Hot / Warm / Cold scoring",
                        "Reason-backed qualification",
                        "One-click profile update",
                        "Conversation history retention",
                        "Custom prompt support",
                    ]
                    : selectedAgent?.type === "Recommendation"
                        ? [
                            "Profile similarity matching",
                            "Campaign & type-based grouping",
                            "AI-generated match insights",
                            "Bulk recommendation export",
                            "Context-aware filtering",
                        ]
                        : selectedAgent?.type === "Calling"
                            ? [
                                "Pre-call briefing generation",
                                "Customer history summary",
                                "Call script suggestions",
                                "Post-call note logging",
                                "Follow-up action planning",
                            ]
                            : selectedAgent?.type === "Mining"
                                ? [
                                    "Full-funnel pattern detection",
                                    "Lead source concentration analysis",
                                    "Conversion rate & drop-off insights",
                                    "Geographic distribution breakdown",
                                    "Budget segment profiling",
                                    "Risk factor identification",
                                    "Actionable improvement suggestions",
                                ] : [
                                    "Intelligent lead matching",
                                    "Natural language interface",
                                    "Real-time AI processing",
                                    "CRM data integration",
                                    "Actionable insights",
                                ];

    const tip =
        selectedAgent?.type === "Matching"
            ? "Be specific — mention city, budget range, or property type for better results."
            : selectedAgent?.type === "Followup"
                ? "Mention the last interaction date to get more personalised follow-up drafts."
                : selectedAgent?.type === "Qualification"
                    ? "Ask 'Is this a high-value prospect?' for a detailed scoring breakdown."
                    : selectedAgent?.type === "Recommendation"
                        ? "Select a recently active customer for the most relevant recommendations."
                        : selectedAgent?.type === "Mining"
                            ? "Click Re-analyse after adding new leads to get fresh insights on the latest data."
                            : selectedAgent?.type === "Calling"
                                ? "Review the AI briefing before the call to improve conversion chances."
                                : "Use natural language — the AI understands context, not just keywords.";

    return (
        <div
            className="w-[250px] flex-shrink-0 flex flex-col relative overflow-hidden"
            style={{
                background: "#0d1117",
                borderRight: "1px solid rgba(255,255,255,0.07)",
            }}
        >
            {/* Close arrow */}
            <button
                onClick={onClose}
                className="w-7 h-7 z-50 cursor-pointer absolute top-4 right-2 flex items-center justify-center rounded-lg bg-transparent hover:text-[#d5d5d5] text-[#94a3b8] transition-all"
            >
                <BsArrowLeftShort size={30} />
            </button>

            {/* Grid texture */}
            <div
                className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                }}
            />

            {/* Top glow */}
            <div
                className="absolute -top-10 -left-10 w-48 h-48 rounded-full pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle, rgba(56,189,248,0.18) 0%, transparent 70%)",
                }}
            />

            {/* Agent identity */}
            <div className="relative z-10 px-4 pt-5 pb-3">
                <div className="relative inline-block mb-3">
                    <div
                        className="w-11 h-11 rounded-[14px] flex items-center justify-center text-white text-[13px] font-semibold"
                        style={{
                            background:
                                "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                            boxShadow:
                                "0 0 0 1px rgba(255,255,255,0.1), 0 4px 14px rgba(2,132,199,0.4)",
                        }}
                    >
                        {AGENTS_TYPE_ICON[selectedAgent?.type ?? "default"]}
                    </div>

                    {/* Online dot */}
                    <span
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                        style={{
                            background: "#10b981",
                            borderColor: "#0d1117",
                            boxShadow: "0 0 6px rgba(16,185,129,0.6)",
                        }}
                    />
                </div>

                <p
                    className="text-[13px] font-semibold leading-tight"
                    style={{ color: "#e6edf3" }}
                >
                    {selectedAgent?.name ?? "AI Genie Agent"}
                </p>

                <p
                    className="text-[10px] mt-0.5 font-mono"
                    style={{ color: "#8b949e" }}
                >
                    {selectedAgent?.type?.toLowerCase() ?? "matching"} · v2.1
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-1 mt-2.5">
                    {selectedAgent?.type && (
                        <span
                            className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded-full"
                            style={{
                                color: "#38bdf8",
                                background: "rgba(56,189,248,0.12)",
                                border: "1px solid rgba(56,189,248,0.25)",
                            }}
                        >
                            {selectedAgent.type}
                        </span>
                    )}

                    {selectedAgent?.campaign && (
                        <span
                            className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded-full"
                            style={{
                                color: "#fbbf24",
                                background: "rgba(251,191,36,0.1)",
                                border: "1px solid rgba(251,191,36,0.25)",
                            }}
                        >
                            {selectedAgent.campaign}
                        </span>
                    )}

                    {selectedAgent?.targetSegment && (
                        <span
                            className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded-full"
                            style={{
                                color: "#34d399",
                                background: "rgba(52,211,153,0.1)",
                                border: "1px solid rgba(52,211,153,0.25)",
                            }}
                        >
                            {selectedAgent.targetSegment}
                        </span>
                    )}
                </div>
            </div>

            {/* Divider */}
            <div
                className="mx-4 relative z-10"
                style={{ height: "1px", background: "rgba(255,255,255,0.07)" }}
            />

            {/* How it works */}
            <div className="relative z-10 px-4 py-3">
                <p
                    className="text-[9px] font-semibold uppercase tracking-widest mb-2.5"
                    style={{ color: "#8b949e" }}
                >
                    How it works
                </p>

                <div className="flex flex-col gap-2">
                    {steps.map((item) => (
                        <div key={item.step} className="flex items-start gap-2.5">
                            <div
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5"
                                style={{
                                    background: "rgba(56,189,248,0.15)",
                                    color: "#38bdf8",
                                    border: "1px solid rgba(56,189,248,0.25)",
                                }}
                            >
                                {item.step}
                            </div>

                            <p
                                className="text-[10.5px] leading-snug"
                                style={{ color: "#8b949e" }}
                            >
                                {item.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Divider */}
            <div
                className="mx-4 relative z-10"
                style={{ height: "1px", background: "rgba(255,255,255,0.07)" }}
            />

            {/* Capabilities */}
            <div
                className="relative z-10 px-4 py-3 flex-1 overflow-y-auto"
                style={{ scrollbarWidth: "none" }}
            >
                <p
                    className="text-[9px] font-semibold uppercase tracking-widest mb-2.5"
                    style={{ color: "#8b949e" }}
                >
                    Capabilities
                </p>

                <div className="flex flex-col gap-1.5">
                    {capabilities.map((cap) => (
                        <div key={cap} className="flex items-center gap-2">
                            <span
                                className="w-1 h-1 rounded-full flex-shrink-0"
                                style={{ background: "#38bdf8" }}
                            />
                            <span
                                className="text-[10.5px]"
                                style={{ color: "#8b949e" }}
                            >
                                {cap}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Tip */}
                <div
                    className="mt-4 rounded-[10px] px-3 py-2.5"
                    style={{
                        background: "rgba(56,189,248,0.07)",
                        border: "1px solid rgba(56,189,248,0.15)",
                    }}
                >
                    <p
                        className="text-[9px] font-semibold uppercase tracking-widest mb-1"
                        style={{ color: "#38bdf8" }}
                    >
                        💡 Pro tip
                    </p>

                    <p
                        className="text-[10px] leading-relaxed"
                        style={{ color: "#8b949e" }}
                    >
                        {tip}
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div
                className="relative z-10 flex items-center justify-between px-4 py-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
                <div className="flex items-center gap-2">
                    <span
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{
                            background: "#10b981",
                            boxShadow: "0 0 0 3px rgba(16,185,129,0.2)",
                        }}
                    />
                    <span
                        className="text-[10px] font-mono"
                        style={{ color: "#8b949e" }}
                    >
                        Agent online
                    </span>
                </div>

                <span
                    className="text-[9px] font-mono"
                    style={{ color: "#30363d" }}
                >
                    v2.1.0
                </span>
            </div>
        </div>
    );
};

export default AIAgentSidebar;