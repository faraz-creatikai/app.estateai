"use client";

import React, { ReactElement, useEffect, useState } from "react";
import Link from "next/link";
import { getCampaign } from "@/store/masters/campaign/campaign";
import { addAIAgent, getAIAgentById, updateAIAgent } from "@/store/aiagent/aiagent";
import { MdCatchingPokemon, MdFindInPage } from "react-icons/md";
import { useParams } from "next/navigation";
import { RiUserFollowFill } from "react-icons/ri";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AgentFormData {
    name: string;
    description: string;
    type: string;
    status: boolean;
    campaign: string;
    targetSegment: string;
    capability: string;
}

interface FieldError {
    name?: string;
    type?: string;
    subType?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const AGENT_TYPES = ["Matching","Followup", "Qualification", "Calling", "Support", "Operations", "Success"];

const SUB_TYPES: Record<string, string[]> = {
    Sales: ["Lead Scoring", "Pipeline Analytics", "Meeting Scheduler", "Proposal Generator", "Deal Tracking"],
    Marketing: ["Email Outreach", "Content Generation", "Ad Optimization", "SEO Assistant", "Campaign Analytics"],
    Support: ["Ticket Resolution", "FAQ Bot", "Escalation Manager", "Sentiment Analysis", "Knowledge Base"],
    Operations: ["Data Enrichment", "Report Generator", "Workflow Automation", "Integration Manager", "Audit Logger"],
    Success: ["Onboarding", "Churn Prediction", "Health Scoring", "Renewal Manager", "Upsell Detector"],
};

const CUSTOMER_TYPES = ["All", "SMB", "Mid-Market", "Enterprise", "Startup"];

const CAMPAIGNS = [
    "Q2 Pipeline Growth",
    "Spring Outbound",
    "Demo Drive",
    "Brand Refresh",
    "Q3 Forecast",
    "Renewal Watch",
    "None",
];

const TYPE_ICON: Record<string, string | ReactElement> = {
    Matching: <img src="https://res.cloudinary.com/djipgt6vc/image/upload/v1774335520/img-2_l1xdll.png" alt="Matching" className=" object-contain w-10 h-10" />,
    Followup:<img src="https://res.cloudinary.com/djipgt6vc/image/upload/v1774335523/img-7_xjwzbl.png" alt="Followup" className=" object-contain w-10 h-10" />,
    Qualification:<img src="https://res.cloudinary.com/djipgt6vc/image/upload/v1774335520/img-1_nz99v7.png" alt="Qualification" className=" object-contain w-10 h-10" />,
    Calling: <img src="https://res.cloudinary.com/djipgt6vc/image/upload/v1774335521/img-6_mky5rb.png" alt="Calling" className=" object-contain w-10 h-10" />,
    Support: "🎧",
    Operations: "⚙️",
    Success: "🌟",
};

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string; ring: string }> = {
    Matching: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800", ring: "ring-amber-300 dark:ring-amber-700" },
    Followup: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800", ring: "ring-amber-300 dark:ring-amber-700" },
    Qualification: { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800", ring: "ring-emerald-300 dark:ring-emerald-700" },
    Calling: { bg: "bg-violet-50 dark:bg-violet-950", text: "text-violet-700 dark:text-violet-300", border: "border-violet-200 dark:border-violet-800", ring: "ring-violet-300 dark:ring-violet-700" },
    Support: { bg: "bg-sky-50 dark:bg-sky-950", text: "text-sky-700 dark:text-sky-300", border: "border-sky-200 dark:border-sky-800", ring: "ring-sky-300 dark:ring-sky-700" },
    Operations: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800", ring: "ring-amber-300 dark:ring-amber-700" },
    Success: { bg: "bg-rose-50 dark:bg-rose-950", text: "text-rose-700 dark:text-rose-300", border: "border-rose-200 dark:border-rose-800", ring: "ring-rose-300 dark:ring-rose-700" },
};

// ─── Reusable field wrapper ───────────────────────────────────────────────────
function Field({
    label,
    required,
    hint,
    error,
    children,
}: {
    label: string;
    required?: boolean;
    hint?: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                    {required && <span className="ml-0.5 text-rose-500">*</span>}
                </label>
                {hint && <span className="text-xs text-gray-400 dark:text-gray-500">{hint}</span>}
            </div>
            {children}
            {error && (
                <p className="flex items-center gap-1 text-xs text-rose-500 dark:text-rose-400">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

const inputClass =
    "w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/25 focus:border-[var(--color-primary)] transition-all";

const errorInputClass =
    "w-full px-3.5 py-2.5 text-sm rounded-xl border border-rose-300 dark:border-rose-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-300/30 focus:border-rose-400 transition-all";

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EditAgentPage() {
    const { id } = useParams();
    const [form, setForm] = useState<AgentFormData>({
        name: "",
        description: "",
        type: "",
        status: true,
        campaign: "",
        targetSegment: "",
        capability: "",
    });

    const [errors, setErrors] = useState<FieldError>({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [campaignOptions, setCampaignOptions] = useState<string[]>([]);

    /*    useEffect(() => {
           getCampaignOptions();
       }, []) */

    useEffect(() => {
        if (id) {
            fetchAgent();
        }
        getCampaignOptions();
    }, [id]);

    const fetchAgent = async () => {
        const res = await getAIAgentById(id as string);

        if (res) {
            setForm({
                name: res.name || "",
                description: res.description || "",
                type: res.type || "",
                status: res.status === "Active",
                campaign: res.campaign || "",
                targetSegment: res.targetSegment || "",
                capability: res.capability || "",
            });
        }
    };

    const set = <K extends keyof AgentFormData>(key: K, value: AgentFormData[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    const validate = (): boolean => {
        const next: FieldError = {};
        if (!form.name.trim()) next.name = "Agent name is required.";
        if (!form.type) next.type = "Please select a type.";
        /* if (form.type && !form.subType) next.subType = "Please select a sub-type."; */
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);

        const payload = {
            name: form.name,
            description: form.description,
            type: form.type,
            status: form.status ? "Active" : "Inactive",
            campaign: form.campaign,
            targetSegment: form.targetSegment,
            capability: form.capability,
        };

        // 👉 EDIT FUNCTION
        const res = await updateAIAgent(id as string, payload);

        if (res) {
            setSubmitted(true); // you can rename to updated if you want
        }

        setLoading(false);
    };

    const handleReset = () => {
        setForm({
            name: "",
            description: "",
            type: "",
            status: true,
            campaign: "",
            targetSegment: "",
            capability: "",
        });
        setErrors({});
        setSubmitted(false);
    };

    const getCampaignOptions = async () => {
        let campaigns = await getCampaign();
        campaigns = campaigns.filter((e: any) => e.Status !== "Inactive");
        console.log(" campaigns are here ", campaigns);
        setCampaignOptions(campaigns.map((e: any) => e.Name))
    }

    // ── Success screen ──────────────────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="min-h-screen bg-white rounded-md dark:bg-gray-950 flex items-center justify-center px-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-10 max-w-md w-full text-center">
                    <div
                        className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center text-3xl"
                        style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary, var(--color-primary)))" }}
                    >
                        🤖
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Agent Updated!</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{form.name}</span> has been updated in your workspace.
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
                        It will start {form.status ? "running immediately." : "in paused mode."}
                    </p>
                    <div className="flex gap-3">
                        <Link
                            href="/aiagents"
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
                        >
                            View All Agents
                        </Link>
                        <button
                            onClick={handleReset}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
                            style={{ background: "var(--color-primary)" }}
                        >
                            Add Another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const selectedTypeColors = form.type ? TYPE_COLORS[form.type] : null;
    const availableSubTypes = form.type ? SUB_TYPES[form.type] : [];

    return (
        <div className="min-h-screen bg-white rounded-md dark:bg-gray-950">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* ── Breadcrumb ── */}
                <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-8">
                    <Link
                        href="/ai-agents"
                        className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                        </svg>
                        AI Agents
                    </Link>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-400 font-medium">New Agent</span>
                </div>

                {/* ── Page header ── */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Edit AI Agent
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        customize your autonomous agent to handle tasks in your CRM workflow.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Main form ── */}
                    <div className="lg:col-span-2 flex flex-col gap-5">

                        {/* Section: Identity */}
                        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs p-6 flex flex-col gap-5">
                            <div className="flex items-center gap-2 pb-1 border-b border-gray-100 dark:border-gray-800">
                                <div
                                    className="w-6 h-6 rounded-md flex items-center justify-center"
                                    style={{ background: "var(--color-primary)" }}
                                >
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                    </svg>
                                </div>
                                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Identity</h2>
                            </div>

                            {/* Name */}
                            <Field label="Agent Name" required error={errors.name}>
                                <input
                                    type="text"
                                    placeholder="e.g. LeadRadar, SupportBot…"
                                    value={form.name}
                                    onChange={(e) => set("name", e.target.value)}
                                    className={errors.name ? errorInputClass : inputClass}
                                />
                            </Field>

                            {/* Description */}
                            <Field label="Description" hint="Optional">
                                <textarea
                                    placeholder="What does this agent do? What problem does it solve?"
                                    value={form.description}
                                    onChange={(e) => set("description", e.target.value)}
                                    rows={3}
                                    className={`${inputClass} resize-none`}
                                />
                            </Field>
                        </section>

                        {/* Section: Classification */}
                        {/* Section: Classification */}
                        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs p-6 flex flex-col gap-5">
                            <div className="flex items-center gap-2 pb-1 border-b border-gray-100 dark:border-gray-800">
                                <div
                                    className="w-6 h-6 rounded-md flex items-center justify-center"
                                    style={{ background: "var(--color-primary)" }}
                                >
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                                    </svg>
                                </div>
                                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Classification</h2>
                            </div>

                            {/* Type */}
                            <Field label="Type" required error={errors.type}>
                                <div className="grid grid-cols-5 gap-2">
                                    {AGENT_TYPES.map((t) => {
                                        const c = TYPE_COLORS[t];
                                        const isSelected = form.type === t;
                                        return (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => {
                                                    set("type", t);
                                                    /*                           set("subType", ""); */
                                                }}
                                                className={[
                                                    "flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-center transition-all cursor-pointer",
                                                    isSelected
                                                        ? `${c.bg} ${c.text} ${c.border} ring-2 ${c.ring} ring-offset-1 ring-offset-white dark:ring-offset-gray-900`
                                                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600",
                                                ].join(" ")}
                                            >
                                                <span className="text-xl leading-none">{TYPE_ICON[t]}</span>
                                                <span className="text-[11px] font-semibold leading-tight">{t}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </Field>

                            {/* Sub-type */}
                            {/* <Field label="Sub-type" required error={errors.subType} hint={!form.type ? "Select a type first" : undefined}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableSubTypes.length > 0 ? (
                    availableSubTypes.map((st) => {
                      const isSelected = form.subType === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => set("subType", st)}
                          className={[
                            "py-2 px-3 rounded-xl border text-sm font-medium text-left transition-all cursor-pointer",
                            isSelected
                              ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/5"
                              : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900",
                          ].join(" ")}
                        >
                          {isSelected && (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mr-1.5 mb-0.5 align-middle" />
                          )}
                          {st}
                        </button>
                      );
                    })
                  ) : (
                    <div className="col-span-3 py-6 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center">
                      <p className="text-xs text-gray-400 dark:text-gray-500">Select a type to see sub-types</p>
                    </div>
                  )}
                </div>
              </Field> */}

                            {/* Customer type */}
                            {/* <Field label="Customer Type" hint="Optional">
                <div className="flex flex-wrap gap-2">
                  {CUSTOMER_TYPES.map((ct) => {
                    const isSelected = form.customerType === ct;
                    return (
                      <button
                        key={ct}
                        type="button"
                        onClick={() => set("customerType", isSelected ? "" : ct)}
                        className={[
                          "px-3.5 py-1.5 rounded-full border text-sm font-medium transition-all cursor-pointer",
                          isSelected
                            ? "border-[var(--color-primary)] text-white bg-[var(--color-primary)]"
                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900",
                        ].join(" ")}
                      >
                        {ct}
                      </button>
                    );
                  })}
                </div>
              </Field> */}
                        </section>

                        {/* Section: Campaign */}
                        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs p-6 flex flex-col gap-5">
                            <div className="flex items-center gap-2 pb-1 border-b border-gray-100 dark:border-gray-800">
                                <div
                                    className="w-6 h-6 rounded-md flex items-center justify-center"
                                    style={{ background: "var(--color-primary)" }}
                                >
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                    </svg>
                                </div>
                                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Campaign</h2>
                                <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">Optional</span>
                            </div>

                            <Field label="Assign to Campaign">
                                <div className="grid grid-cols-2 gap-2">
                                    {campaignOptions.map((c) => {
                                        const val = c === "None" ? "" : c;
                                        const isSelected = form.campaign === val;
                                        return (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => set("campaign", isSelected ? "" : val)}
                                                className={[
                                                    "py-2.5 px-3 rounded-xl border text-sm text-left transition-all cursor-pointer",
                                                    isSelected
                                                        ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/5 font-medium"
                                                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600",
                                                    c === "None" ? "text-gray-400 dark:text-gray-500 italic" : "",
                                                ].join(" ")}
                                            >
                                                {c !== "None" && isSelected && (
                                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mr-1.5 mb-0.5 align-middle" />
                                                )}
                                                {c}
                                            </button>
                                        );
                                    })}
                                </div>
                            </Field>
                        </section>

                        {/* Actions (mobile) */}
                        <div className="flex gap-3 lg:hidden">
                            <Link
                                href="/ai-agents"
                                className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
                            >
                                Cancel
                            </Link>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                                style={{ background: "var(--color-primary)" }}
                            >
                                {loading ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Updating…
                                    </>
                                ) : (
                                    "Create Agent"
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ── Right sidebar ── */}
                    <div className="flex flex-col gap-5">

                        {/* Status card */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs p-5">
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Status</h3>

                            <div
                                className={[
                                    "rounded-xl border-2 p-4 transition-all cursor-pointer",
                                    form.status
                                        ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950"
                                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800",
                                ].join(" ")}
                                onClick={() => set("status", !form.status)}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={[
                                                "w-2.5 h-2.5 rounded-full",
                                                form.status ? "bg-emerald-400 animate-pulse" : "bg-gray-300 dark:bg-gray-600",
                                            ].join(" ")}
                                        />
                                        <span
                                            className={[
                                                "text-sm font-semibold",
                                                form.status
                                                    ? "text-emerald-700 dark:text-emerald-300"
                                                    : "text-gray-500 dark:text-gray-400",
                                            ].join(" ")}
                                        >
                                            {form.status ? "Active" : "Paused"}
                                        </span>
                                    </div>
                                    {/* Toggle */}
                                    <div
                                        className={[
                                            "relative w-10 h-5 rounded-full transition-all duration-300",
                                            form.status ? "bg-emerald-400 dark:bg-emerald-500" : "bg-gray-200 dark:bg-gray-700",
                                        ].join(" ")}
                                    >
                                        <span
                                            className={[
                                                "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300",
                                                form.status ? "translate-x-5" : "translate-x-0",
                                            ].join(" ")}
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {form.status
                                        ? "Agent will begin processing tasks immediately after creation."
                                        : "Agent will be created but won't run until manually activated."}
                                </p>
                            </div>
                        </div>

                        {/* Preview card */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs p-5">
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Preview</h3>

                            <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 flex flex-col gap-3">
                                {/* Agent header preview */}
                                <div className="flex items-center gap-3">
                                    <div
                                        className={[
                                            "w-9 h-9 rounded-lg flex items-center justify-center text-base border transition-all",
                                            selectedTypeColors
                                                ? `${selectedTypeColors.bg} ${selectedTypeColors.text} ${selectedTypeColors.border}`
                                                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-400",
                                        ].join(" ")}
                                    >
                                        {form.type ? TYPE_ICON[form.type] : "🤖"}
                                    </div>
                                    {/* <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                      {form.name || <span className="text-gray-300 dark:text-gray-600 font-normal italic">Agent name</span>}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {form.subType || <span className="italic">Sub-type</span>}
                    </p>
                  </div> */}
                                </div>

                                {/* Description preview */}
                                <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed line-clamp-2">
                                    {form.description || <span className="italic">No description yet…</span>}
                                </p>

                                {/* Tags preview */}
                                <div className="flex flex-wrap gap-1">
                                    {/*  {form.type && (
                    <span
                      className={[
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                        selectedTypeColors
                          ? `${selectedTypeColors.bg} ${selectedTypeColors.text} ${selectedTypeColors.border}`
                          : "",
                      ].join(" ")}
                    >
                      {form.type}
                    </span>
                  )} */}
                                    {/* {form.customerType && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">
                      {form.customerType}
                    </span>
                  )} */}
                                    {form.campaign && (
                                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500">
                                            {form.campaign}
                                        </span>
                                    )}
                                </div>

                                {/* Status preview */}
                                <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100 dark:border-gray-700">
                                    <span
                                        className={[
                                            "w-1.5 h-1.5 rounded-full",
                                            form.status ? "bg-emerald-400 animate-pulse" : "bg-gray-300 dark:bg-gray-600",
                                        ].join(" ")}
                                    />
                                    <span
                                        className={[
                                            "text-[11px] font-medium",
                                            form.status ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500",
                                        ].join(" ")}
                                    >
                                        {form.status ? "Active" : "Paused"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Required fields reminder */}
                        {(Object.keys(errors).length > 0) && (
                            <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950 p-4">
                                <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                    </svg>
                                    Please fix the following
                                </p>
                                <ul className="flex flex-col gap-1">
                                    {Object.values(errors).filter(Boolean).map((e, i) => (
                                        <li key={i} className="text-xs text-rose-500 dark:text-rose-400">• {e}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Action buttons (desktop) */}
                        <div className="hidden lg:flex flex-col gap-2">
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                                style={{ background: "var(--color-primary)" }}
                            >
                                {loading ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Creating…
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                        Update Agent
                                    </>
                                )}
                            </button>
                            <Link
                                href="/ai-agents"
                                className="w-full py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
                            >
                                Cancel
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}