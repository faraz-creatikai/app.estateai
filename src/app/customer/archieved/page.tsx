"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getFilteredArchievedCustomer, unArchieveCustomer } from "@/store/customer";
import CustomerViewDialog from "@/app/component/popups/CustomerviewDialog";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Customer {
    _id: string;
    id: string;
    customerName: string;
    ContactNumber: string;
    Email?: string;
    City?: string;
    Location?: string;
    Campaign?: string;
    Price?: string;
    LeadTemperature?: string;
    CustomerDate?: string;
    CreatedById?: string;
    updatedAt?: string;
    createdAt?: string;
}

interface SheetState {
    open: boolean;
    customer: Customer | null;
}

const LIMIT = 12;

const TEMP_STYLES: Record<string, string> = {
    hot: "bg-red-500",
    warm: "bg-orange-500",
    cold: "bg-[var(--color-primary)]",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr?: string): string {
    if (!dateStr) return "—";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins < 1 ? "just now" : mins + "m ago"}`;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(diff / 86400000);
    if (days === 1) return "yesterday";
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function initials(name?: string): string {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    return parts.length > 1
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard() {
    return (
        <div className="rounded-2xl bg-white border border-gray-100 p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 rounded-full bg-gray-100" />
                    <div className="h-2.5 w-1/2 rounded-full bg-gray-100" />
                </div>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-100 mb-2" />
            <div className="h-2.5 w-3/4 rounded-full bg-gray-100" />
        </div>
    );
}

// ─── Bottom Sheet Confirm ───────────────────────────────────────────────────────

function RestoreSheet({
    sheet, onClose, onConfirm, loading,
}: {
    sheet: SheetState;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
}) {
    if (!sheet.open || !sheet.customer) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/40 backdrop-blur-[2px]" onClick={onClose}>
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full cursor-pointer sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl px-6 pt-3 pb-6 sm:p-6 animate-[slideUp_0.25s_ease-out]"
            >
                {/* drag handle - mobile only */}
                <div className="flex justify-center sm:hidden mb-4">
                    <div className="w-10 h-1 rounded-full bg-gray-200" />
                </div>

                <div className="flex flex-col items-center text-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-lighter)] flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900">Restore to active list?</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            <span className="font-semibold text-gray-800">{sheet.customer.customerName}</span> will show up in your calling list again.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-2.5">
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="w-full py-3 cursor-pointer rounded-2xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading && (
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                            </svg>
                        )}
                        Restore customer
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-3 cursor-pointer rounded-2xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                        Keep archived
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Filter Drawer ────────────────────────────────────────────────────────────

function FilterDrawer({
    open, onClose, city, setCity, campaign, setCampaign, startDate, setStartDate, endDate, setEndDate, onClear,
}: any) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-gray-900/40 backdrop-blur-[2px]" onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl px-6 pt-3 pb-6 sm:p-6 max-h-[85vh] overflow-y-auto">
                <div className="flex justify-center sm:hidden mb-4">
                    <div className="w-10 h-1 rounded-full bg-gray-200" />
                </div>

                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-bold text-gray-900">Refine results</h3>
                    <button onClick={onClose} className="w-8 h-8 cursor-pointer rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">City</label>
                        <input
                            value={city}
                            onChange={(e: any) => setCity(e.target.value)}
                            placeholder="e.g. Jaipur"
                            className="mt-1.5 w-full px-4 py-3 text-sm rounded-2xl bg-gray-50 border border-transparent focus:border-[var(--color-primary)] focus:bg-white outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Campaign</label>
                        <input
                            value={campaign}
                            onChange={(e: any) => setCampaign(e.target.value)}
                            placeholder="e.g. Summer Promo"
                            className="mt-1.5 w-full px-4 py-3 text-sm rounded-2xl bg-gray-50 border border-transparent focus:border-[var(--color-primary)] focus:bg-white outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Archived between</label>
                        <div className="mt-1.5 flex items-center gap-2">
                            <input
                                value={startDate}
                                onChange={(e: any) => setStartDate(e.target.value)}
                                placeholder="DD-MM-YYYY"
                                className="w-1/2 px-4 py-3 text-sm rounded-2xl bg-gray-50 border border-transparent focus:border-[var(--color-primary)] focus:bg-white outline-none transition-all"
                            />
                            <input
                                value={endDate}
                                onChange={(e: any) => setEndDate(e.target.value)}
                                placeholder="DD-MM-YYYY"
                                className="w-1/2 px-4 py-3 text-sm rounded-2xl bg-gray-50 border border-transparent focus:border-[var(--color-primary)] focus:bg-white outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-2.5 mt-6">
                    <button onClick={onClear} className="flex-1 py-3 cursor-pointer rounded-2xl text-sm font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors">
                        Clear all
                    </button>
                    <button onClick={onClose} className="flex-1 py-3 cursor-pointer rounded-2xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] transition-colors">
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ArchivedCustomersPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [city, setCity] = useState("");
    const [campaign, setCampaign] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [filterOpen, setFilterOpen] = useState(false);
    const [sheet, setSheet] = useState<SheetState>({ open: false, customer: null });
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [customerToView, setCustomerToView] = useState<any>(null);

    const totalPages = Math.ceil(total / LIMIT) || 1;
    const activeFilterCount = [city, campaign, startDate && endDate].filter(Boolean).length;

    const fetchArchived = useCallback(async (pageNum = 1) => {
        setLoading(true);
        const params = new URLSearchParams({
            Skip: String((pageNum - 1) * LIMIT),
            Limit: String(LIMIT),
            ...(keyword && { Keyword: keyword.trim() }),
            ...(city && { City: city.trim() }),
            ...(campaign && { Campaign: campaign.trim() }),
            ...(startDate && endDate && { StartDate: startDate, EndDate: endDate }),
        }).toString();

        const res = await getFilteredArchievedCustomer(params);
        if (res?.data) {
            setCustomers(res.data);
            setTotal(res.total ?? res.data.length);
        } else if (Array.isArray(res)) {
            setCustomers(res);
            setTotal(res.length);
        } else {
            setCustomers([]);
            setTotal(0);
        }
        setLoading(false);
    }, [keyword, city, campaign, startDate, endDate]);

    useEffect(() => {
        setPage(1);
        fetchArchived(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keyword, city, campaign, startDate, endDate]);

    const handlePageChange = (p: number) => {
        setPage(p);
        fetchArchived(p);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleRestoreConfirm = async () => {
        if (!sheet.customer) return;
        setActionLoading(true);
        const res = await unArchieveCustomer(sheet.customer._id || sheet.customer.id);
        if (res?.success) {
            toast.success("Customer restored to active list");
            setSheet({ open: false, customer: null });
            fetchArchived(page);
        } else {
            toast.error("Failed to restore customer");
        }
        setActionLoading(false);
    };

    const handleClearFilters = () => {
        setCity("");
        setCampaign("");
        setStartDate("");
        setEndDate("");
        setFilterOpen(false);
    };

    const handleViewClick = (id: string | number) => {
        setCustomerToView(id);
        setIsViewOpen(true);
    };


    return (
        <div className="min-h-screen bg-gray-50/60">
            <Toaster position="top-center" />
            <CustomerViewDialog
                isOpen={isViewOpen}
                customerId={customerToView}
                onClose={() => {
                    setIsViewOpen(false);
                    setCustomerToView(null);
                }}
            />
            <RestoreSheet
                sheet={sheet}
                onClose={() => setSheet({ open: false, customer: null })}
                onConfirm={handleRestoreConfirm}
                loading={actionLoading}
            />
            <FilterDrawer
                open={filterOpen}
                onClose={() => setFilterOpen(false)}
                city={city} setCity={setCity}
                campaign={campaign} setCampaign={setCampaign}
                startDate={startDate} setStartDate={setStartDate}
                endDate={endDate} setEndDate={setEndDate}
                onClear={handleClearFilters}
            />

            {/* ── Sticky Top Bar ─────────────────────────────────────────────── */}
            <div className="sticky top-0  bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 pt-4 pb-3">
                    <div className="flex items-center gap-3 mb-3">
                        <button
                            onClick={() => router.back()}
                            className="w-9 h-9 shrink-0 flex cursor-pointer items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 5l-7 7 7 7" />
                            </svg>
                        </button>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-extrabold text-gray-900 leading-tight flex items-center gap-2">
                                Archived
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[var(--color-primary-lighter)] text-[var(--color-primary)]">
                                    {total}
                                </span>
                            </h1>
                            <p className="text-[11px] text-gray-400">Customers you set aside — private to you</p>
                        </div>
                    </div>

                    {/* Search + Filter row */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search name, phone, city..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                className="w-full pl-10 pr-3 py-2.5 text-sm rounded-full bg-gray-100 border border-transparent focus:border-[var(--color-primary)] focus:bg-white outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={() => setFilterOpen(true)}
                            className={`relative shrink-0 w-10 h-10 cursor-pointer rounded-full flex items-center justify-center border transition-all ${activeFilterCount > 0
                                ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                                : "bg-white border-gray-200 text-gray-500 hover:border-[var(--color-primary-light)]"
                                }`}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                            </svg>
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Content ────────────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 py-5 pb-28">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : customers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-20">
                        <div className="w-16 h-16 rounded-3xl bg-[var(--color-primary-lighter)] flex items-center justify-center mb-4">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" />
                            </svg>
                        </div>
                        <p className="text-sm font-bold text-gray-800">Nothing archived yet</p>
                        <p className="text-xs text-gray-400 mt-1 max-w-[220px]">Customers you set aside from your active list will show up here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {customers.map((c) => {
                            const temp = (c.LeadTemperature || "cold").toLowerCase();
                            return (
                                <div
                                    key={c._id || c.id}
                                    className="group relative rounded-2xl bg-white border border-gray-100 hover:border-[var(--color-primary-light)] hover:shadow-md shadow-sm transition-all p-4"
                                >
                                    {/* temperature strip */}
                                    <span className={`absolute top-0 left-4 right-4 h-[3px] rounded-b-full ${TEMP_STYLES[temp] || TEMP_STYLES.cold}`} />

                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-11 h-11 shrink-0 rounded-full bg-[var(--color-primary-lighter)] flex items-center justify-center">
                                                <span className="text-xs font-bold text-[var(--color-primary)]">{initials(c.customerName)}</span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{c.customerName}</p>
                                                <p className="text-xs text-gray-500 truncate">{c.ContactNumber}</p>
                                            </div>
                                        </div>
                                        <span className="shrink-0 text-[10px] font-semibold text-gray-400 whitespace-nowrap">{timeAgo(c.updatedAt)}</span>
                                    </div>

                                    {/* meta chips */}
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {c.City && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-gray-50 text-gray-600">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-7.5 8-13a8 8 0 1 0-16 0c0 5.5 8 13 8 13z" /><circle cx="12" cy="9" r="2.5" /></svg>
                                                {c.City}
                                            </span>
                                        )}
                                        {c.Campaign && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-medium bg-[var(--color-primary-lighter)] text-[var(--color-primary)]">
                                                {c.Campaign}
                                            </span>
                                        )}
                                        {c.Price && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-bold bg-gray-50 text-gray-700">
                                                {c.Price}
                                            </span>
                                        )}
                                    </div>

                                    {/* actions */}
                                    <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                                        <button
                                            /* onClick={() => router.push(`/customer/${c._id || c.id}`)} */
                                            onClick={() => {
                                                handleViewClick(c._id || c.id)
                                            }}
                                            className="flex-1 inline-flex cursor-pointer items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
                                        >
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                            </svg>
                                            Open
                                        </button>
                                        <button
                                            onClick={() => setSheet({ open: true, customer: c })}
                                            className="flex-1 inline-flex cursor-pointer items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary-lighter)] hover:bg-[var(--color-primary-light)] transition-colors"
                                        >
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
                                            </svg>
                                            Restore
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Sticky Bottom Pagination ───────────────────────────────────── */}
            {!loading && customers.length > 0 && totalPages > 1 && (
                <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-md border-t border-gray-100">
                    <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                        <button
                            disabled={page === 1}
                            onClick={() => handlePageChange(page - 1)}
                            className="w-9 h-9 rounded-full cursor-pointer flex items-center justify-center bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                        </button>
                        <span className="text-xs font-semibold text-gray-500">
                            Page <span className="text-gray-900">{page}</span> of {totalPages}
                        </span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => handlePageChange(page + 1)}
                            className="w-9 h-9 rounded-full cursor-pointer flex items-center justify-center bg-[var(--color-primary)] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--color-primary-dark)] transition-colors"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}