'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../component/ProtectedRoutes";
import PageHeader from "../component/labels/PageHeader";
import toast, { Toaster } from "react-hot-toast";
import { convertMinedLead, getFilteredMinedLead } from "@/store/social-content/socialContent";
import PopupMenu from "../component/popups/PopupMenu";
import { getCampaign } from "@/store/masters/campaign/campaign";
import SingleSelect from "../component/SingleSelect";
import { extractPhoneNumber } from "../utils/extractPhoneNumber";

/* ─── Types ─────────────────────────────────────────────────────────── */
interface MinedLead {
    id: string;
    source: "reddit" | "facebook" | "instagram";
    author: string;
    authorId: string;
    title: string;
    content: string;
    url: string;
    postContext: string | null;
    postedAt: string | null;
    savedAt: string;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

type SourceKey = "facebook" | "instagram" | "reddit";

/* ─── Source meta ────────────────────────────────────────────────────── */
const SOURCE_META: Record<SourceKey, {
    label: string;
    badgeCls: string;
    dotCls: string;
    activeCls: string;
    statBg: string;
    statBorder: string;
    statLabel: string;
    statValue: string;
    statSub: string;
}> = {

    facebook: {
        label: "Facebook",
        badgeCls: "bg-blue-100 text-blue-700 border border-blue-200",
        dotCls: "bg-blue-600",
        activeCls: "bg-blue-600 text-white border-blue-600",
        statBg: "bg-gradient-to-br from-blue-50 to-sky-50",
        statBorder: "border-blue-200",
        statLabel: "text-blue-500",
        statValue: "text-blue-900",
        statSub: "text-blue-400",
    },
    reddit: {
        label: "Reddit",
        badgeCls: "bg-orange-100 text-orange-700 border border-orange-200",
        dotCls: "bg-orange-500",
        activeCls: "bg-orange-500 text-white border-orange-500",
        statBg: "bg-gradient-to-br from-orange-50 to-amber-50",
        statBorder: "border-orange-200",
        statLabel: "text-orange-500",
        statValue: "text-orange-900",
        statSub: "text-orange-400",
    },
    instagram: {
        label: "Instagram",
        badgeCls: "bg-pink-100 text-pink-700 border border-pink-200",
        dotCls: "bg-pink-500",
        activeCls: "bg-pink-500 text-white border-pink-500",
        statBg: "bg-gradient-to-br from-pink-50 to-rose-50",
        statBorder: "border-pink-200",
        statLabel: "text-pink-500",
        statValue: "text-pink-900",
        statSub: "text-pink-400",
    },
};

/* ─── Helpers ────────────────────────────────────────────────────────── */
function formatDate(str: string | null) {
    if (!str) return "—";
    return new Date(str).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function relativeTime(str: string | null) {
    if (!str) return null;
    const diff = Date.now() - new Date(str).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d}d ago`;
    return null;
}

/* ─── SourceBadge ────────────────────────────────────────────────────── */
function SourceBadge({ source }: { source: MinedLead["source"] }) {
    const m = SOURCE_META[source];
    if (!m)
        return (
            <span className="text-xs text-[var(--color-text-secondary)]">
                {source}
            </span>
        );
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${m.badgeCls}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.dotCls}`} />
            {m.label}
        </span>
    );
}

/* ─── Skeleton row ───────────────────────────────────────────────────── */
function SkeletonRow() {
    return (
        <tr className="border-b border-[var(--color-border-tertiary)]">
            {[...Array(7)].map((_, i) => (
                <td key={i} className="px-4 py-4">
                    <div className="h-4 bg-gray-100 rounded-md animate-pulse" />
                </td>
            ))}
        </tr>
    );
}

/* ─── Main ───────────────────────────────────────────────────────────── */
export default function MinedLeads() {
    const router = useRouter();

    /* ── Filter state ── */
    const [source, setSource] = useState<"all" | SourceKey>("all");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortBy, setSortBy] = useState<"savedAt" | "postedAt">("savedAt");
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [limit, setLimit] = useState(20);
    const [page, setPage] = useState(1);

    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [conversionData, setConversionData] = useState<
        { data: MinedLead; ContactNumber: string }[]
    >([]);

    /* ── Data state ── */
    const [leads, setLeads] = useState<MinedLead[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
    });
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [campaignOptions, setCampaignOptions] = useState<string[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState<string>("");


    


    useEffect(() => {
        const fetchCampaigns = async () => {
            const res = await getCampaign();

            if (Array.isArray(res)) {
                const activeNames = res
                    .filter((c) => c.Status === "Active")
                    .map((c) => c.Name);

                setCampaignOptions(activeNames);
            }
        };

        fetchCampaigns();
    }, []);



    /* ── Debounce search ── */
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 420);
        return () => clearTimeout(t);
    }, [search]);

    /* ── Reset page on filter change ── */
    useEffect(() => {
        setPage(1);
    }, [source, debouncedSearch, sortBy, order, limit]);

    /* ── Fetch ── */
    useEffect(() => {
        const fetchLeads = async () => {
            setLoading(true);
            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                sortBy,
                order,
            });
            if (source !== "all") params.set("source", source);
            if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());

            const res = await getFilteredMinedLead(params.toString());
            if (res?.data) {
                setLeads(res.data);
                setPagination(res.pagination);
            }
            setLoading(false);
        };
        fetchLeads();
    }, [source, debouncedSearch, sortBy, order, limit, page]);

    /* ── Selection ── */
    const allOnPageSelected =
        leads.length > 0 && leads.every((r) => selected.has(r.id));

    const toggleSelectAll = () => {
        const next = new Set(selected);
        if (allOnPageSelected) leads.forEach((r) => next.delete(r.id));
        else leads.forEach((r) => next.add(r.id));
        setSelected(next);
    };

    const toggleSelect = (id: string) => {
        const next = new Set(selected);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelected(next);
    };

    const formatDateForPayload = (dateStr: string | null) => {
        if (!dateStr) return null;

        const d = new Date(dateStr);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();

        return `${day}-${month}-${year}`;
    };



    /* ── Actions ── */
    const handleConvertSelected = () => {
        if (selected.size === 0) {
            toast.error("Select at least one lead to convert");
            return;
        }

        const selectedLeads = leads.filter((l) => selected.has(l.id));

        const formatted = selectedLeads.map((lead) => {
  const extracted = extractPhoneNumber(lead.content);

  return {
    data: lead,
    ContactNumber: extracted || "1010101010", // ✅ default fallback
  };
});

        setConversionData(formatted);
        setIsPopupOpen(true);
    };

    const handleConvertSingle = (lead: MinedLead) => {
        setConversionData([
            {
                data: lead,
                ContactNumber: "",
            },
        ]);
        setIsPopupOpen(true);
    };

    const handleNumberChange = (index: number, value: string) => {
        // allow only digits + max 10 length
        const cleaned = value.replace(/\D/g, "").slice(0, 10);

        const updated = [...conversionData];
        updated[index].ContactNumber = cleaned;
        setConversionData(updated);
    };

    const handleFinalConvert = async () => {
        const invalid = conversionData.some(
            (l) => !/^\d{10}$/.test(l.ContactNumber)
        );

        if (invalid) {
            toast.error("Each contact number must be exactly 10 digits");
            return;
        }

        if (!selectedCampaign) {
            toast.error("Please select a campaign");
            return;
        }

        // 🔥 transform payload here
        const payload = {
            leads: conversionData.map((item) => ({
                data: {
                    ...item.data,
                    savedAt: formatDateForPayload(item.data.savedAt),
                    postedAt: formatDateForPayload(item.data.postedAt),
                },
                ContactNumber: item.ContactNumber,
                Campaign: selectedCampaign,
            })),
        };

        console.log("payload is", payload);


        const response = await convertMinedLead(payload);
        if (response) {
            toast.success("Leads converted successfully");

            setIsPopupOpen(false);
            setSelected(new Set());
            setConversionData([]);
            return;
        }
        toast.error("Conversion failed");

    };



    /* ── Page numbers ── */
    const pageWindow = () => {
        const total = pagination.totalPages;
        if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
        if (page <= 3) return [1, 2, 3, 4, 5];
        if (page >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];
        return [page - 2, page - 1, page, page + 1, page + 2];
    };

    /* ── Counts on current page ── */
    const pageCounts = {
        reddit: leads.filter((l) => l.source === "reddit").length,
        instagram: leads.filter((l) => l.source === "instagram").length,
        facebook: leads.filter((l) => l.source === "facebook").length,
    };

    /* ── Render ── */
    return (
        <ProtectedRoute>
            <Toaster position="top-right" />

            <PopupMenu isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)}>
                <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">Convert Leads</h2>
                    <div className="mb-4">
                        <SingleSelect
                            label="Select Campaign"
                            options={campaignOptions}
                            value={selectedCampaign}
                            onChange={(val) => setSelectedCampaign(val)}
                            isSearchable
                        />
                    </div>
                    <div className="flex flex-col gap-4 max-h-[60vh] overflow-auto">
                        {conversionData.map((item, index) => (
                            <div
                                key={item.data.id}
                                className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2"
                            >
                                <div className="text-sm font-semibold text-gray-800">
                                    {item.data.author}
                                </div>

                                <div className="text-xs text-gray-400 line-clamp-2">
                                    {item.data.title}
                                </div>



                                <input
                                    type="text"
                                    placeholder="Enter Contact Number"
                                    value={item.ContactNumber}
                                    onChange={(e) =>
                                        handleNumberChange(index, e.target.value)
                                    }
                                    className="h-9 px-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[var(--color-primary)]"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3 mt-5">
                        <button
                            onClick={() => setIsPopupOpen(false)}
                            className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleFinalConvert}
                            className="px-4 py-2 text-sm rounded-lg bg-[var(--color-primary)] text-white"
                        >
                            Convert
                        </button>
                    </div>
                </div>
            </PopupMenu>

            <div className="min-h-[calc(100vh-56px)] bg-gray-50/80 rounded-md overflow-auto">

                {/* ═══ Page header bar ═══ */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-4">
                    <PageHeader
                        title="Mined Leads"
                        subtitles={["Social Intelligence", "Mined Leads"]}
                    />

                    <div className="flex items-center gap-2.5">
                        {selected.size > 0 && (
                            <span className="text-xs font-medium text-[var(--color-primary)] bg-[var(--color-primary-lighter,#e8f5e9)] px-3 py-1.5 rounded-full border border-[var(--color-primary)]/20">
                                {selected.size} selected
                            </span>
                        )}
                        <button
                            onClick={handleConvertSelected}
                            className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Convert Selected
                            {selected.size > 0 && (
                                <span className="bg-white/25 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                                    {selected.size}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* ═══ Stats strip ═══ */}
                <div className="grid grid-cols-4 gap-4 px-6 pt-5 pb-2">

                    {/* Total */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-2 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                Total Leads
                            </span>
                            <span className="w-7 h-7 rounded-lg bg-[var(--color-primary-lighter,#e8f5e9)] flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-[var(--color-primary)]" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                </svg>
                            </span>
                        </div>
                        <span className="text-4xl font-bold text-gray-900 leading-none">
                            {pagination.total}
                        </span>
                        <span className="text-xs text-gray-400">
                            Page {pagination.page} of {pagination.totalPages} · {pagination.limit}/page
                        </span>
                    </div>

                    {/* Per-source stats */}
                    {(["facebook", "instagram", "reddit",] as SourceKey[]).map((src) => {
                        const m = SOURCE_META[src];
                        return (
                            <button
                                key={src}
                                onClick={() => setSource(source === src ? "all" : src)}
                                className={`rounded-xl border p-5 flex flex-col gap-2 shadow-sm text-left transition-all hover:shadow-md ${m.statBg} ${m.statBorder} ${source === src ? "ring-2 ring-offset-1 ring-[var(--color-primary)]" : ""}`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs font-semibold uppercase tracking-widest ${m.statLabel}`}>
                                        {m.label}
                                    </span>
                                    <span className={`w-2 h-2 rounded-full ${m.dotCls}`} />
                                </div>
                                <span className={`text-4xl font-bold leading-none ${m.statValue}`}>
                                    {pageCounts[src]}
                                </span>
                                <span className={`text-xs ${m.statSub}`}>on this page</span>
                            </button>
                        );
                    })}
                </div>

                {/* ═══ Main table card ═══ */}
                <div className="mx-6 mt-3 mb-6 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

                    {/* ── Toolbar ── */}
                    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60 flex items-center gap-3 flex-wrap">

                        {/* Search */}
                        <div className="relative flex items-center flex-1 min-w-[220px]">
                            <svg className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search title, author, content, context…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full h-9 pl-9 pr-8 text-sm bg-white border border-gray-200 rounded-lg outline-none text-gray-800 placeholder-gray-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15 transition-all"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute right-2.5 text-gray-400 hover:text-gray-600 transition-colors text-xs"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Source filter pills */}
                        <div className="flex gap-1.5 flex-wrap">
                            <button
                                onClick={() => setSource("all")}
                                className={`h-9 px-4 rounded-lg text-xs font-semibold border transition-all ${source === "all"
                                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm"
                                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                                    }`}
                            >
                                All Sources
                            </button>
                            {(["facebook", "instagram", "reddit",] as SourceKey[]).map((src) => {
                                const m = SOURCE_META[src];
                                return (
                                    <button
                                        key={src}
                                        onClick={() => setSource(source === src ? "all" : src)}
                                        className={`h-9 px-4 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${source === src
                                            ? m.activeCls + " shadow-sm"
                                            : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${source === src ? "bg-white" : m.dotCls}`} />
                                        {m.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex items-center gap-2 ml-auto">

                            {/* Sort by */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as "savedAt" | "postedAt")}
                                className="h-9 border border-gray-200 rounded-lg px-3 text-xs font-medium text-gray-600 bg-white outline-none cursor-pointer hover:border-gray-300 transition-colors"
                            >
                                <option value="savedAt">Sort: Saved</option>
                                <option value="postedAt">Sort: Posted</option>
                            </select>

                            {/* Order toggle */}
                            <button
                                onClick={() => setOrder((o) => (o === "desc" ? "asc" : "desc"))}
                                title={order === "desc" ? "Newest first" : "Oldest first"}
                                className="h-9 w-9 flex items-center justify-center border border-gray-200 rounded-lg bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                            >
                                {order === "desc" ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h5m7 4l4 4m0 0l4-4m-4 4V4" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h5m7-4l4-4m0 0l4 4m-4-4v16" />
                                    </svg>
                                )}
                            </button>

                            {/* Per-page */}
                            <select
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                                className="h-9 border border-gray-200 rounded-lg px-3 text-xs font-medium text-gray-600 bg-white outline-none cursor-pointer hover:border-gray-300 transition-colors"
                            >
                                <option value={10}>10 / page</option>
                                <option value={20}>20 / page</option>
                                <option value={50}>50 / page</option>
                                <option value={100}>100 / page</option>
                            </select>
                        </div>
                    </div>

                    {/* ── Active filters indicator ── */}
                    {(source !== "all" || debouncedSearch) && (
                        <div className="px-5 py-2 bg-[var(--color-primary-lighter,#e8f5e9)] border-b border-[var(--color-primary)]/10 flex items-center gap-2">
                            <svg className="w-3.5 h-3.5 text-[var(--color-primary)]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.553.894l-4 2A1 1 0 016 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-medium text-[var(--color-primary)]">Filters active:</span>
                            {source !== "all" && (
                                <span className="text-xs bg-white text-[var(--color-primary)] px-2 py-0.5 rounded-full border border-[var(--color-primary)]/20 flex items-center gap-1">
                                    {SOURCE_META[source as SourceKey].label}
                                    <button onClick={() => setSource("all")} className="ml-0.5 hover:text-red-500 transition-colors">×</button>
                                </span>
                            )}
                            {debouncedSearch && (
                                <span className="text-xs bg-white text-[var(--color-primary)] px-2 py-0.5 rounded-full border border-[var(--color-primary)]/20 flex items-center gap-1">
                                    "{debouncedSearch}"
                                    <button onClick={() => setSearch("")} className="ml-0.5 hover:text-red-500 transition-colors">×</button>
                                </span>
                            )}
                            <span className="ml-auto text-xs text-[var(--color-primary)]/60">
                                {pagination.total} result{pagination.total !== 1 ? "s" : ""}
                            </span>
                        </div>
                    )}

                    {/* ── Table ── */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="w-10 px-4 py-3.5 text-left">
                                        <input
                                            type="checkbox"
                                            checked={allOnPageSelected}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 rounded border-gray-300 accent-[var(--color-primary)] cursor-pointer"
                                        />
                                    </th>
                                    {[
                                        "Source",
                                        "Post & Content",
                                        "Author",
                                        "Context",
                                        "Dates",
                                        "Actions",
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                                ) : leads.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">
                                                    🔍
                                                </div>
                                                <p className="text-sm font-semibold text-gray-700">No leads found</p>
                                                <p className="text-xs text-gray-400">
                                                    Try adjusting your filters or search query
                                                </p>
                                                {(source !== "all" || debouncedSearch) && (
                                                    <button
                                                        onClick={() => { setSource("all"); setSearch(""); }}
                                                        className="text-xs font-medium text-[var(--color-primary)] underline underline-offset-2 hover:opacity-80 transition-opacity mt-1"
                                                    >
                                                        Clear all filters
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    leads.map((lead) => (
                                        <tr
                                            key={lead.id}
                                            className={`border-b border-gray-50 transition-colors ${selected.has(lead.id)
                                                ? "bg-[var(--color-primary-lighter,#e8f5e9)]"
                                                : "hover:bg-gray-50/70"
                                                }`}
                                        >
                                            {/* Checkbox */}
                                            <td className="px-4 py-4 align-top">
                                                <input
                                                    type="checkbox"
                                                    checked={selected.has(lead.id)}
                                                    onChange={() => toggleSelect(lead.id)}
                                                    className="w-4 h-4 rounded border-gray-300 accent-[var(--color-primary)] cursor-pointer"
                                                />
                                            </td>

                                            {/* Source */}
                                            <td className="px-4 py-4 align-top">
                                                <SourceBadge source={lead.source} />
                                            </td>

                                            {/* Post */}
                                            <td className="px-4 py-4 align-top max-w-[340px]">
                                                <p className="font-semibold text-gray-800 line-clamp-1 text-sm mb-1 leading-snug">
                                                    {lead.title}
                                                </p>
                                                <p className="text-xs text-gray-400 max-h-[200px] overflow-auto hide-scrollbar leading-relaxed">
                                                    {lead.content}
                                                </p>
                                            </td>

                                            {/* Author */}
                                            <td className="px-4 py-4 align-top ">
                                                <p className="font-semibold text-gray-800 break-all text-sm">
                                                    {lead.author}
                                                </p>
                                                {lead.authorId && lead.authorId !== lead.author && (
                                                    <p className="text-xs text-gray-400 break-all mt-0.5 font-mono">
                                                        ID: {lead.authorId}
                                                    </p>
                                                )}
                                            </td>

                                            {/* Context */}
                                            <td className="px-4 py-4 align-top">
                                                {lead.postContext ? (
                                                    <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-medium border border-gray-200 whitespace-nowrap">
                                                        <span className="text-gray-400 text-[10px]">r/</span>
                                                        {lead.postContext}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-300">—</span>
                                                )}
                                            </td>

                                            {/* Dates */}
                                            <td className="px-4 py-4 align-top whitespace-nowrap">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                                        <span className="text-xs text-gray-500 font-medium">
                                                            {formatDate(lead.savedAt)}
                                                        </span>
                                                        {relativeTime(lead.savedAt) && (
                                                            <span className="text-[10px] text-gray-300">
                                                                · {relativeTime(lead.savedAt)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {lead.postedAt ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                                                            <span className="text-xs text-gray-400">
                                                                {formatDate(lead.postedAt)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-200 shrink-0" />
                                                            <span className="text-[10px] text-gray-300 italic">
                                                                No post date
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-4 align-top">
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={lead.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 h-8 px-3 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 transition-all whitespace-nowrap"
                                                    >
                                                        View ↗
                                                    </a>
                                                    <button
                                                        onClick={() => handleConvertSingle(lead)}
                                                        className="h-8 px-3 cursor-pointer text-xs font-semibold rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity whitespace-nowrap shadow-sm"
                                                    >
                                                        Convert
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Pagination ── */}
                    {!loading && pagination.totalPages > 0 && (
                        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                            <span className="text-xs text-gray-400">
                                {leads.length > 0
                                    ? `Showing ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(
                                        pagination.page * pagination.limit,
                                        pagination.total
                                    )} of ${pagination.total} leads`
                                    : "No results"}
                            </span>
                            <div className="flex items-center gap-1.5">
                                {/* First */}
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(1)}
                                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-xs text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                                >
                                    «
                                </button>
                                {/* Prev */}
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage((p) => p - 1)}
                                    className="h-8 px-3 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-xs text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors gap-1"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Prev
                                </button>

                                {/* Page numbers */}
                                {pageWindow().map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => setPage(n)}
                                        className={`h-8 w-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${n === page
                                            ? "bg-[var(--color-primary)] text-white shadow-sm"
                                            : "border border-gray-200 bg-white text-gray-500 hover:bg-gray-100"
                                            }`}
                                    >
                                        {n}
                                    </button>
                                ))}

                                {/* Next */}
                                <button
                                    disabled={page === pagination.totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="h-8 px-3 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-xs text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors gap-1"
                                >
                                    Next
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>

                                {/* Last */}
                                <button
                                    disabled={page === pagination.totalPages}
                                    onClick={() => setPage(pagination.totalPages)}
                                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-xs text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                                >
                                    »
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}