"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect, ReactElement } from "react";
import toast, { Toaster } from "react-hot-toast";
import MasterProtectedRoute from "../component/MasterProtectedRoutes";
import { assignAIAgent, deleteAIAgent, getAIAgent, updateAIAgent } from "@/store/aiagent/aiagent";
import { Description } from "@radix-ui/react-dialog";
import { handleFieldOptions } from "../utils/handleFieldOptions";
import { getAllAdmins } from "@/store/auth";
import { handleFieldOptionsObject } from "../utils/handleFieldOptionsObject";
import { aiagentDialogDataInterface } from "@/store/aiagent/aiagent.interface";
import DeleteDialog from "../component/popups/DeleteDialog";
import { FaTrash } from "react-icons/fa";
import { Edit } from "lucide-react";
import { MdFindInPage } from "react-icons/md";
import { RiUserFollowFill } from "react-icons/ri";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AIAgent {
    id: string
    name: string
    description: string
    type: string
    status: boolean
    campaign?: string
    targetSegment?: string
    capability?: string
    tasksCompleted?: number
    accuracy?: number
    createdAt?: Date
    assignedUsers: string[]
}
const USERS = [
    { id: "101", name: "Admin" },
    { id: "102", name: "Sales Team" },
    { id: "103", name: "Marketing" }
]
// ─── Fake seed data ───────────────────────────────────────────────────────────
const AGENTS: AIAgent[] = [

    /*  {
         id: "0",
         name: "LeadRadar",
         description:
             "Scores and prioritizes incoming leads based on engagement signals, firmographics, and intent data to surface the hottest prospects automatically.",
         type: "Sales",
         status: true,
         campaign: "Q2 Pipeline Growth",
         customerType: "Enterprise",
         subType: "Lead Scoring",
         tasksCompleted: 14830,
         accuracy: 94,
         createdAt: new Date("2024-01-15"),
     }, */
    {
        id: "1",
        name: "Ai Genie",
        description:
            "Search and Find leads based on given prompts and requirements",
        type: "Discovery",
        status: true,
        campaign: "Lead Intelligence",
        targetSegment: "Prompt Search",
        capability: "Lead Discovery",
        tasksCompleted: 14830,
        accuracy: 94,
        createdAt: new Date("2024-01-15"),
        assignedUsers: []
    },
    /*   {
          id: "2",
          name: "ReachOut",
          description:
              "Crafts hyper-personalized outreach sequences and sends them at optimal times, adapting tone based on recipient behavior and CRM history.",
          type: "Marketing",
          status: true,
          campaign: "Spring Outbound",
          customerType: "SMB",
          subType: "Email Outreach",
          tasksCompleted: 38200,
          accuracy: 89,
          createdAt: new Date("2024-02-03"),
      },
      {
          id: "3",
          name: "SupportBot",
          description:
              "Handles tier-1 customer queries around the clock, resolves common issues, and escalates complex tickets with full context to human agents.",
          type: "Support",
          status: true,
          campaign: undefined,
          customerType: "All",
          subType: "Ticket Resolution",
          tasksCompleted: 52410,
          accuracy: 97,
          createdAt: new Date("2024-01-28"),
      },
      {
          id: "4",
          name: "DataForge",
          description:
              "Continuously enriches contact and company records by pulling fresh data from 30+ sources, keeping your CRM clean and current.",
          type: "Operations",
          status: true,
          campaign: undefined,
          customerType: "Enterprise",
          subType: "Data Enrichment",
          tasksCompleted: 21900,
          accuracy: 91,
          createdAt: new Date("2024-03-10"),
      },
      {
          id: "5",
          name: "CalPilot",
          description:
              "Qualifies prospects and autonomously books discovery calls by matching availability, sending calendar invites, and dispatching reminders.",
          type: "Sales",
          status: true,
          campaign: "Demo Drive",
          customerType: "Mid-Market",
          subType: "Meeting Scheduler",
          tasksCompleted: 8760,
          accuracy: 96,
          createdAt: new Date("2024-02-20"),
      },
      {
          id: "6",
          name: "ChurnGuard",
          description:
              "Monitors usage patterns and health scores to predict churn 60 days in advance, triggering targeted retention plays before accounts slip away.",
          type: "Success",
          status: false,
          campaign: "Renewal Watch",
          customerType: "Enterprise",
          subType: "Churn Prediction",
          tasksCompleted: 3100,
          accuracy: 88,
          createdAt: new Date("2024-04-05"),
      },
      {
          id: "7",
          name: "ContentCraft",
          description:
              "Generates on-brand marketing copy, social posts, and nurture emails from a brief, aligned with your tone-of-voice guide and campaign goals.",
          type: "Marketing",
          status: true,
          campaign: "Brand Refresh",
          customerType: "SMB",
          subType: "Content Generation",
          tasksCompleted: 6540,
          accuracy: 82,
          createdAt: new Date("2024-03-22"),
      },
      {
          id: "8",
          name: "PipelineAI",
          description:
              "Forecasts revenue with deal-level precision, highlights at-risk opportunities, and recommends next-best actions for every open deal.",
          type: "Sales",
          status: false,
          campaign: "Q3 Forecast",
          customerType: "Enterprise",
          subType: "Pipeline Analytics",
          tasksCompleted: 1200,
          accuracy: 93,
          createdAt: new Date("2024-04-18"),
      },
      {
          id: "9",
          name: "OnboardIQ",
          description:
              "Automates the customer onboarding journey with smart checklists, proactive nudges, and milestone tracking to cut time-to-value in half.",
          type: "Success",
          status: true,
          campaign: undefined,
          customerType: "All",
          subType: "Onboarding",
          tasksCompleted: 4320,
          accuracy: 95,
          createdAt: new Date("2024-05-01"),
      }, */
];

// ─── Constants ─────────────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
    Matching: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
    Followup:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    Qualification:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
    Calling:
        "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
    Support:
        "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
    Operations:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    Success:
        "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800",
};

const TYPE_ICON: Record<string, string | ReactElement> = {
    Matching: <img src="https://res.cloudinary.com/djipgt6vc/image/upload/v1774335520/img-2_l1xdll.png" alt="Matching" className=" object-contain w-10 h-10" />,
    Followup: <img src="https://res.cloudinary.com/djipgt6vc/image/upload/v1774335523/img-7_xjwzbl.png" alt="Followup" className=" object-contain w-10 h-10" />,
    Qualification: <img src="https://res.cloudinary.com/djipgt6vc/image/upload/v1774335520/img-1_nz99v7.png" alt="Qualification" className=" object-contain w-10 h-10" />,
    Calling: <img src="https://res.cloudinary.com/djipgt6vc/image/upload/v1774335521/img-6_mky5rb.png" alt="Qualification" className=" object-contain w-10 h-10" />,
    Support: "🎧",
    Operations: "⚙️",
    Success: "🌟",
};

const ALL_TYPES = ["All", "Matching", "Followup", "Qualification", "Marketing", "Support", "Operations", /* "Success" */];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatBadge({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="flex flex-col">
            <span
                style={{ color: "var(--color-primary)" }}
                className="text-lg font-bold leading-none"
            >
                {value}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{label}</span>
        </div>
    );
}

function AgentCard({
    agent,
    onToggle,
    onAssign,
    onDelete,
    onSettings,
    onEdit,
}: {
    agent: AIAgent;
    onToggle: (id: string) => void;
    onAssign: (agent: AIAgent) => void
    onDelete: (agent: AIAgent) => void
    onSettings: (agent: AIAgent) => void
    onEdit: (agent: AIAgent) => void
}) {
    const typeColor = TYPE_COLORS[agent.type] ?? TYPE_COLORS["Sales"];
    const icon = TYPE_ICON[agent.type] ?? "🤖";

    return (
        <div
            className={[
                "group relative flex flex-col rounded-2xl border bg-white dark:bg-gray-900",
                "shadow-sm hover:shadow-lg transition-all duration-300",
                agent.status
                    ? "border-gray-200 dark:border-gray-700"
                    : "border-gray-100 dark:border-gray-800 opacity-70",
            ].join(" ")}
        >
            {/* Top accent line */}
            <div
                className={[
                    "absolute top-0 left-6 right-6 h-[2px] rounded-b-full transition-all duration-300",
                    agent.status
                        ? "opacity-100"
                        : "opacity-0",
                ].join(" ")}
                style={{ background: "var(--color-primary)" }}
            />

            <div className="p-5 flex flex-col gap-4 flex-1">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className={[
                                "w-10 h-10 rounded-xl flex items-center justify-center text-lg",
                                "border transition-colors duration-200",
                                typeColor,
                            ].join(" ")}
                        >
                            {icon}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                                {agent.name}
                            </h3>
                            <span className="text-xs text-gray-400 dark:text-gray-500">{agent.capability}</span>
                        </div>
                    </div>

                    {/* Toggle */}
                    <button
                        onClick={() => onToggle(agent.id)}
                        className={[
                            "relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 cursor-pointer",
                            agent.status
                                ? "bg-[var(--color-primary)]"
                                : "bg-gray-200 dark:bg-gray-700",
                        ].join(" ")}
                        aria-label={agent.status ? "Deactivate agent" : "Activate agent"}
                    >
                        <span
                            className={[
                                "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300",
                                agent.status ? "translate-x-5" : "translate-x-0",
                            ].join(" ")}
                        />
                    </button>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed flex-1 line-clamp-3">
                    {agent.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                    <span
                        className={[
                            "text-[11px] font-medium px-2.5 py-0.5 rounded-full border",
                            typeColor,
                        ].join(" ")}
                    >
                        {agent.type}
                    </span>
                    {agent.targetSegment && (
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                            {agent.targetSegment}
                        </span>
                    )}
                    {agent.campaign && (
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500">
                            {agent.campaign}
                        </span>
                    )}
                </div>
            </div>

            {/* Footer stats */}
            <div className="px-5 py-3.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <StatBadge label="Tasks done" value={agent.tasksCompleted?.toLocaleString() ?? "0"} />
                <div className="w-px h-6 bg-gray-100 dark:bg-gray-800" />
                <StatBadge label="Accuracy" value={`${agent.accuracy}%`} />
                <div className="w-px h-6 bg-gray-100 dark:bg-gray-800" />
                <div className="flex items-center gap-1.5">
                    <span
                        className={[
                            "w-1.5 h-1.5 rounded-full",
                            agent.status ? "bg-emerald-400 animate-pulse" : "bg-gray-300 dark:bg-gray-600",
                        ].join(" ")}
                    />
                    <span
                        className={[
                            "text-xs font-medium",
                            agent.status
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-gray-400 dark:text-gray-500",
                        ].join(" ")}
                    >
                        {agent.status ? "Active" : "Inactive"}
                    </span>
                </div>

            </div>
            <div className="flex items-center gap-2 mx-2 mt-3 mb-1">
                {/* Edit */}
                <button
                    onClick={() => onEdit(agent)}
                    className="group flex items-center justify-center gap-1.5 flex-1 px-3 py-2.5 rounded-md
            border border-gray-200 dark:border-gray-700
            bg-gray-50 dark:bg-gray-800
            text-gray-500 dark:text-gray-400
            hover:bg-gray-100 dark:hover:bg-gray-700
            hover:text-gray-800 dark:hover:text-gray-200
            hover:border-gray-300 dark:hover:border-gray-600
            transition-all duration-200 active:scale-[0.98] cursor-pointer"
                >
                    <Edit size={11} className="transition-transform duration-200 group-hover:scale-110" />
                    <span className="text-xs font-semibold tracking-wide">Edit</span>
                </button>
                {/* Delete */}
                <button
                    onClick={() => onDelete(agent)}
                    className="group flex items-center justify-center gap-1.5 flex-1 px-3 py-2.5 rounded-md
            border border-red-100 dark:border-red-900/50
            bg-red-50/60 dark:bg-red-950/30
            text-red-500 dark:text-red-400
            hover:bg-red-500 dark:hover:bg-red-600
            hover:text-white hover:border-red-500 dark:hover:border-red-600
            hover:shadow-md hover:shadow-red-500/20
            transition-all duration-200 active:scale-[0.98] cursor-pointer"
                >
                    <FaTrash size={11} className="transition-transform duration-200 group-hover:scale-110" />
                    <span className="text-xs font-semibold tracking-wide">Delete</span>
                </button>


            </div>

            {/* Assign Users — untouched */}

            <div className="flex gap-2 m-2 mt-3">
                <button
                    disabled={!agent.status}
                    onClick={() => onAssign(agent)}
                    className={`text-xs w-full bg-[var(--color-primary)] text-white border px-2 py-3 rounded-md 
                    ${agent.status
                            ? "hover:bg-[var(--color-secondary)] cursor-pointer"
                            : "opacity-50 cursor-not-allowed"
                        }`}
                >
                    Assign Users
                </button>

                {/* <button
                    onClick={() => onSettings(agent)}
                    className="text-xs border px-2 py-1 rounded-md hover:bg-gray-100"
                >
                    Settings
                </button> */}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AIAgentsPage() {
    const [agents, setAgents] = useState<AIAgent[]>(AGENTS);
    const [search, setSearch] = useState("");
    const [activeType, setActiveType] = useState("All");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
    const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null)
    const [showAssignModal, setShowAssignModal] = useState(false)
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])
    const [loadingAgents, setLoadingAgents] = useState(true);
    const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [dialogData, setDialogData] = useState<aiagentDialogDataInterface | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchAgents();
    }, [])

    const fetchAgents = async () => {
        try {

            const res = await getAIAgent();

            const formatted = res.map((e: any, i: any) => ({
                id: e._id,
                name: e.name,
                description: e.description,
                type: e.type,
                status: e.status === "Active" ? true : false,
                campaign: e.campaign,
                targetSegment: e.targetSegment,
                capability: e.capability,
                tasksCompleted: e.tasksCompleted ?? 0,
                accuracy: e.accuracy ?? 90 + i + i - 2,
                createdAt: e.createdAt ? new Date(e.createdAt) : new Date(),
                assignedUsers: e.assignedUsers ?? []
            }));

            setAgents(formatted);

        } catch (err) {
            console.error(err);
            toast.error("Failed to load agents");
        }
    };
    const filtered = useMemo(() => {
        return agents.filter((a) => {
            const matchSearch =
                a.name.toLowerCase().includes(search.toLowerCase()) ||
                a.description.toLowerCase().includes(search.toLowerCase()) ||
                (a.capability?.toLowerCase().includes(search.toLowerCase()) ?? false);
            const matchType = activeType === "All" || a.type === activeType;
            const matchStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && a.status) ||
                (statusFilter === "inactive" && !a.status);
            return matchSearch && matchType && matchStatus;
        });
    }, [agents, search, activeType, statusFilter]);

    const totalActive = agents.filter((a) => a.status).length;
    const totalTasks = agents.reduce(
        (sum, a) => sum + (a.tasksCompleted ?? 0),
        0
    );

    const avgAccuracy =
        agents.length === 0
            ? 0
            : Math.round(
                agents.reduce((sum, a) => sum + (a.accuracy ?? 0), 0) /
                agents.length
            );

    const handleToggle = async (id: string) => {

        const agent = agents.find(a => a.id === id);
        if (!agent) return;

        const newStatus = !agent.status;


        console.log(" id is ", id)
        const payload = {
            status: newStatus ? "Active" : "Inactive"
        };

        const res = await updateAIAgent(id, payload);

        if (res) {
            setAgents(prev =>
                prev.map(a =>
                    a.id === id ? { ...a, status: newStatus } : a
                )
            );

            toast.success(`Agent ${newStatus ? "enabled" : "disabled"}`);
            return;
        }

        toast.error("Failed to update agent status");

    };

    const toggleUserAssignment = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        )
    }

    const handleAssignAgent = async () => {

        if (!selectedAgent) return

        if (selectedUsers.length === 0) {
            toast.error("Please select users")
            return
        }

        try {

            const payload = {
                agentId: selectedAgent.id,
                userIds: selectedUsers
            }

            console.log(" payload is ", payload)

            // example API
            const response = await assignAIAgent(payload);
            console.log(" resposne is ", response)

            // const response = { success: true } // mock

            if (response.success) {

                setAgents(prev =>
                    prev.map(agent =>
                        agent.id === selectedAgent.id
                            ? { ...agent, assignedUsers: selectedUsers }
                            : agent
                    )
                )

                toast.success("Agent assigned successfully")
                setShowAssignModal(false)
            }

        } catch (err) {
            toast.error("Failed to assign agent")
        }
    }


    // Object-based fields (for ObjectSelect)
    const objectFields = [

        { key: "User", fetchFn: getAllAdmins }
    ];

    const arrayFields = [
        { key: "User", fetchFn: getAllAdmins }
        /*     { key: "Location", fetchFn: getLocation }, */
    ];


    useEffect(() => {
        const loadFieldOptions = async () => {
            await handleFieldOptionsObject(objectFields, setFieldOptions);
            /*   await handleFieldOptions(arrayFields, setFieldOptions); */
        };
        loadFieldOptions();
    }, []);

    /*     useEffect(()=>{console.log(fieldOptions.User)},[fieldOptions]) */
    const handleDelete = async (data: aiagentDialogDataInterface | null) => {
        if (!data) return;
        const response = await deleteAIAgent(data.id);
        if (response) {
            toast.success(`Customer deleted successfully`);
            setIsDeleteDialogOpen(false);
            setDialogData(null);

            await fetchAgents();
        }
    };


    return (
        <MasterProtectedRoute> <Toaster position="top-right" />
            <DeleteDialog<aiagentDialogDataInterface>
                isOpen={isDeleteDialogOpen}
                title="Are you sure you want to delete this AI Agent?"
                data={dialogData}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setDialogData(null);
                }}
                onDelete={handleDelete}
            />
            <div className="min-h-screen bg-gray-50 rounded-md dark:bg-gray-950">
                {/* ── Page container ── */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                    {/* ── Header ── */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                        Automation
                                    </span>
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                    AI Agents
                                </h1>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-xl">
                                    Autonomous agents running 24/7 to handle sales, marketing, support, and
                                    operations tasks — so your team focuses on what matters.
                                </p>
                            </div>

                            <button
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 cursor-pointer"
                                style={{ background: "var(--color-primary)" }}
                                onClick={() => router.push("/aiagents/add")}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                New Agent
                            </button>
                        </div>

                        {/* ── Summary stats ── */}
                        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                                {
                                    label: "Active Agents",
                                    value: `${totalActive} / ${agents.length}`,
                                    icon: (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                                        </svg>
                                    ),
                                },
                                {
                                    label: "Tasks Completed",
                                    value: `${(totalTasks / 1000).toFixed(1)}k`,
                                    icon: (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                    ),
                                },
                                {
                                    label: "Avg. Accuracy",
                                    value: `${avgAccuracy}%`,
                                    icon: (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                                        </svg>
                                    ),
                                },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-800 shadow-xs"
                                >
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                                        style={{ background: "var(--color-primary)" }}
                                    >
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                                            {stat.value}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Filters bar ── */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        {/* Search */}
                        <div className="relative flex-1">
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search agents…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all"
                            />
                        </div>

                        {/* Status filter */}
                        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
                            {(["all", "active", "inactive"] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={[
                                        "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer",
                                        statusFilter === s
                                            ? "text-white shadow-sm"
                                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
                                    ].join(" ")}
                                    style={
                                        statusFilter === s
                                            ? { background: "var(--color-primary)" }
                                            : {}
                                    }
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Type tabs ── */}
                    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
                        {ALL_TYPES.map((type) => {
                            const count =
                                type === "All"
                                    ? agents.length
                                    : agents.filter((a) => a.type === type).length;
                            const isActive = activeType === type;
                            return (
                                <button
                                    key={type}
                                    onClick={() => setActiveType(type)}
                                    className={[
                                        "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer border",
                                        isActive
                                            ? "text-white border-transparent shadow-sm"
                                            : "text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
                                    ].join(" ")}
                                    style={isActive ? { background: "var(--color-primary)", borderColor: "var(--color-primary)" } : {}}
                                >
                                    {type !== "All" && (
                                        <span className="text-sm">{TYPE_ICON[type]}</span>
                                    )}
                                    {type}
                                    <span
                                        className={[
                                            "text-[11px] font-semibold px-1.5 py-0.5 rounded-full",
                                            isActive
                                                ? "bg-white/20 text-white"
                                                : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
                                        ].join(" ")}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* ── Grid ── */}
                    {filtered.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.map((agent) => (
                                <AgentCard
                                    key={agent.id}
                                    agent={agent}
                                    onToggle={handleToggle}
                                    onAssign={(agent) => {
                                        setSelectedAgent(agent)
                                        setSelectedUsers(agent.assignedUsers) // preload assigned users
                                        setShowAssignModal(true)
                                    }}
                                    onSettings={(agent) => {
                                        router.push(`/settings/ai-agents/${agent.id}`)
                                    }}
                                    onDelete={(agent) => {
                                        setIsDeleteDialogOpen(true);
                                        setDialogData({
                                            id: agent.id,
                                            name: agent.name,
                                            status: agent.status ? "Active" : "Inactive",
                                        });
                                    }}
                                    onEdit={(agent) => {
                                        router.push(`aiagents/edit/${agent.id}`)
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl mb-4">
                                🤖
                            </div>
                            <p className="text-gray-900 dark:text-white font-semibold">No agents found</p>
                            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                            <button
                                onClick={() => {
                                    setSearch("");
                                    setActiveType("All");
                                    setStatusFilter("all");
                                }}
                                className="mt-4 text-sm font-medium cursor-pointer underline underline-offset-2"
                                style={{ color: "var(--color-primary)" }}
                            >
                                Clear filters
                            </button>
                        </div>
                    )}
                    {showAssignModal && selectedAgent && (
                        <div
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-1"
                            onClick={() => setShowAssignModal(false)}
                        >
                            <div
                                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >

                                {/* Header */}
                                <div className="px-4 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                                style={{ background: "var(--color-primary)" }}
                                            >
                                                {selectedAgent.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">
                                                    Assign Agent
                                                </p>
                                                <h2 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
                                                    {selectedAgent.name}
                                                </h2>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowAssignModal(false)}
                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer flex-shrink-0"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* User list */}
                                <div className="px-2 py-3 flex flex-col gap-1 max-h-64 overflow-y-auto">
                                    {fieldOptions.User.map((user) => {
                                        const checked = selectedUsers.includes(user._id);
                                        return (
                                            <label
                                                key={user._id}
                                                className={[
                                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all group",
                                                    checked
                                                        ? "bg-[var(--color-primary)]/8 dark:bg-[var(--color-primary)]/10"
                                                        : "hover:bg-gray-50 dark:hover:bg-gray-800",
                                                ].join(" ")}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleUserAssignment(user._id)}
                                                    className="sr-only"
                                                />
                                                {/* Custom checkbox */}
                                                <div
                                                    className={[
                                                        "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all",
                                                        checked
                                                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                                                            : "border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500",
                                                    ].join(" ")}
                                                >
                                                    {checked && (
                                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                        </svg>
                                                    )}
                                                </div>
                                                {/* Avatar */}
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                                    {user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                                                </div>
                                                <span className={[
                                                    "text-sm font-medium transition-colors",
                                                    checked ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400",
                                                ].join(" ")}>
                                                    {user.name}
                                                </span>
                                                {checked && (
                                                    <span
                                                        className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white"
                                                        style={{ background: "var(--color-primary)" }}
                                                    >
                                                        ✓
                                                    </span>
                                                )}
                                            </label>
                                        );
                                    })}
                                </div>

                                {/* Footer */}
                                <div className="px-4 pb-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                                    <span className="text-xs text-gray-400 dark:text-gray-500 mr-auto">
                                        {selectedUsers.length > 0
                                            ? `${selectedUsers.length} selected`
                                            : "No users selected"}
                                    </span>
                                    <button
                                        onClick={() => setShowAssignModal(false)}
                                        className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAssignAgent}
                                        className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-40"
                                        style={{ background: "var(--color-primary)" }}
                                        disabled={selectedUsers.length === 0}
                                    >
                                        Assign
                                    </button>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* ── Footer count ── */}
                    {filtered.length > 0 && (
                        <p className="mt-6 text-xs text-center text-gray-400 dark:text-gray-600">
                            Showing {filtered.length} of {agents.length} agents
                        </p>
                    )}
                </div>
            </div>
        </MasterProtectedRoute>
    );
}