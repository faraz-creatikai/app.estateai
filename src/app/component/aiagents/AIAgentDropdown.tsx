"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, Sparkles, Zap, Check, ChevronRight } from "lucide-react";

export interface AIAgent {
    id: string;
    name: string;
    description: string;
    type: string;
    status: string;
    campaign?: string;
    targetSegment?: string;
    capability?: string;
    tasksCompleted?: number;
    accuracy?: number;
    createdAt?: string;
    assignedUsers?: string[];
}

interface Props {
    agents: AIAgent[];
    setSelectedAgent: (agent: AIAgent) => void;
    setIsAIAgentDialogOpen: (open: boolean) => void;
}

const ICONS = [Bot, Sparkles, Zap, Bot, Sparkles];

const TYPE_ICON: Record<string, any> = {
    Outreach: <Sparkles />,
    Analytics: <Zap />,
    Support: "🎧",
    Research: <img src="/icons/research.png" alt="Research" />,
    Automation: <img src="/icons/automation.png" alt="Automation" />,
    Calling: <img src="https://res.cloudinary.com/djipgt6vc/image/upload/v1774335521/img-6_mky5rb.png" alt="Calling" className=" object-contain w-10 h-10" />,
    Followup: <img src="https://res.cloudinary.com/djipgt6vc/image/upload/v1774335523/img-7_xjwzbl.png" alt="Followup" className=" object-contain w-10 h-10" />,
    Matching: <img src="https://res.cloudinary.com/djipgt6vc/image/upload/v1774335520/img-2_l1xdll.png" alt="Matching" className="object-contain w-10 h-10" />,
    Qualification: <img src="https://res.cloudinary.com/djipgt6vc/image/upload/v1774335520/img-1_nz99v7.png" alt="Qualification" className=" object-contain w-10 h-10" />,
};

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
    Qualification: { bg: "bg-sky-50", text: "text-sky-700" },
    Followup: { bg: "bg-amber-50", text: "text-amber-700" },
    Matching: { bg: "bg-emerald-50", text: "text-emerald-700" },
    Research: { bg: "bg-rose-50", text: "text-rose-700" },
    Automation: { bg: "bg-violet-50", text: "text-violet-700" },
    Calling: { bg: "bg-violet-50", text: "text-violet-700" },
    _default: { bg: "bg-gray-50", text: "text-gray-600" },
};


function renderIcon(icon: any, className: string) {
    if (typeof icon === "string") {
        return <span className={className}>{icon}</span>;
    }

    return React.cloneElement(icon, {
        className: `${className} ${icon.props?.className || ""}`,
    });
}

function getTypeColor(type: string) {
    return TYPE_COLORS[type] ?? TYPE_COLORS._default;
}

export default function AIAgentDropdown({
    agents,
    setSelectedAgent,
    setIsAIAgentDialogOpen,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [active, setActive] = useState<AIAgent | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSelect = (agent: AIAgent) => {
        setActive(agent);
        setSelectedAgent(agent);
        setIsAIAgentDialogOpen(true);
        setIsOpen(false);
    };

    const activeIdx = active ? agents.indexOf(active) : -1;
    const ActiveIcon = activeIdx >= 0 ? ICONS[activeIdx % ICONS.length] : Bot;
    const activeIcon = active
        ? TYPE_ICON[active.type] ?? <Bot />
        : null;
    const activeColor = active ? getTypeColor(active.type) : null;

    return (
        <div ref={ref} className="relative inline-flex items-center gap-2">

            {/* ── Label ── */}
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider select-none whitespace-nowrap">
                AI Agent
            </span>

            {/* ── Chip trigger ── */}
            <button
                onClick={() => setIsOpen((v) => !v)}
                className={[
                    "inline-flex cursor-pointer items-center gap-1.5 h-7 px-2.5 rounded-full border text-xs font-medium",
                    "transition-all duration-150 select-none whitespace-nowrap",
                    active
                        ? `${activeColor!.bg} ${activeColor!.text} border-transparent hover:brightness-95`
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                    isOpen ? "ring-2 ring-offset-1 ring-gray-200" : "",
                ].join(" ")}
            >
                <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active
                            ? active.status === "Active" ? "bg-emerald-500" : "bg-gray-300"
                            : "bg-gray-300"
                        }`}
                />
                {active ? (
                    <>
                        {active && renderIcon(activeIcon, "w-3 h-3 flex-shrink-0 opacity-70")}
                        <span>{active.name}</span>
                    </>
                ) : (
                    <span>Assign agent</span>
                )}
                <ChevronRight
                    className={`w-3 h-3 flex-shrink-0 opacity-50 transition-transform duration-200 ${isOpen ? "rotate-90" : ""
                        }`}
                />
            </button>

            {/* ── Popover ── */}
            {isOpen && (
                <div
                    className="absolute top-full right-0 mt-2 z-50 bg-white border border-gray-200 rounded-xl overflow-hidden min-w-[260px] max-w-[320px]"
                    style={{ boxShadow: "0 4px 20px -4px rgba(0,0,0,0.12), 0 1px 6px -1px rgba(0,0,0,0.06)" }}
                >
                    {/* Header */}
                    <div className="px-3 pt-2.5 pb-1">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                            Choose assistant
                        </p>
                    </div>

                    {/* Agent rows */}
                    <ul className="pb-1 max-h-[260px] overflow-y-auto">
                        {agents.length === 0 ? (
                            <li className="px-3 py-4 text-center text-xs text-gray-400">No agents available</li>
                        ) : (
                            agents.map((agent, i) => {
                                const icon = TYPE_ICON[agent.type] ?? <Bot />;
                                const color = getTypeColor(agent.type);
                                const isActive = active?.id === agent.id;
                                return (
                                    <li key={agent.id}>
                                        <button
                                            onClick={() => handleSelect(agent)}
                                            className={`w-full cursor-pointer flex items-center gap-3 px-3 py-2 text-left text-xs transition-colors duration-100 ${isActive ? "bg-gray-50" : "hover:bg-gray-50"
                                                }`}
                                        >
                                            {/* Icon */}
                                            <span className={`relative flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${color.bg}`}>
                                                {renderIcon(icon, `w-3.5 h-3.5 ${color.text}`)}
                                                <span
                                                    className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${agent.status === "Active" ? "bg-emerald-500" : "bg-gray-300"
                                                        }`}
                                                />
                                            </span>

                                            {/* Name + description */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-800 truncate leading-tight">{agent.name}</p>
                                                <p className="text-gray-400 truncate mt-px text-[11px]">{agent.description}</p>
                                            </div>

                                            {/* Type + check */}
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                {agent.type && (
                                                    <span className={`text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${color.bg} ${color.text}`}>
                                                        {agent.type}
                                                    </span>
                                                )}
                                                <Check className={`w-3.5 h-3.5 text-emerald-500 transition-opacity ${isActive ? "opacity-100" : "opacity-0"}`} />
                                            </div>
                                        </button>
                                    </li>
                                );
                            })
                        )}
                    </ul>

                    {/* Footer */}
                    <div className="px-3 py-1.5 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">
                            {agents.filter((a) => a.status === "Active").length} active · {agents.length} total
                        </span>
                        {active && (
                            <button
                                onClick={() => { setActive(null); setIsOpen(false); }}
                                className="text-[10px] cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}