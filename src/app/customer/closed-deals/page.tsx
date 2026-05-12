"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getFilteredClosedDeals, reopenDeal } from "@/store/customer";


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
  DealClosed: boolean;
  CustomerDate?: string;
  CreatedById?: string;
  updatedAt?: string;
  createdAt?: string;
}

interface ConfirmModal {
  open: boolean;
  type: "reopen" | null;
  customer: Customer | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const TEMP_COLORS: Record<string, string> = {
  hot:  "bg-red-50 text-red-600 border border-red-200",
  warm: "bg-orange-50 text-orange-600 border border-orange-200",
  cold: "bg-blue-50 text-[var(--color-primary)] border border-[var(--color-primary-light)]",
};

const LIMIT = 20;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 rounded-full bg-gray-100" style={{ width: `${60 + (i * 13) % 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

export function ConfirmModal({
  modal, onClose, onConfirm, loading,
}: {
  modal: ConfirmModal;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  if (!modal.open || !modal.customer) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-full max-w-md mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-lighter)] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Reopen Deal</h3>
            <p className="text-xs text-gray-500">This action will mark the deal as active again</p>
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-5">
          Are you sure you want to reopen the deal for{" "}
          <span className="font-semibold text-gray-900">{modal.customer.customerName}</span>?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
              </svg>
            )}
            Yes, Reopen
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClosedDealsPage() {
  const router = useRouter();
  const [customers, setCustomers]   = useState<Customer[]>([]);
  const [loading, setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [keyword, setKeyword]       = useState("");
  const [city, setCity]             = useState("");
  const [campaign, setCampaign]     = useState("");
  const [startDate, setStartDate]   = useState("");
  const [endDate, setEndDate]       = useState("");
  const [page, setPage]             = useState(1);
  const [total, setTotal]           = useState(0);
  const [modal, setModal]           = useState<ConfirmModal>({ open: false, type: null, customer: null });

  const totalPages = Math.ceil(total / LIMIT);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchDeals = useCallback(async (pageNum = 1) => {
    setLoading(true);
    const params = new URLSearchParams({
      Skip:  String((pageNum - 1) * LIMIT),
      Limit: String(LIMIT),
      ...(keyword  && { Keyword:   keyword.trim()  }),
      ...(city     && { City:      city.trim()     }),
      ...(campaign && { Campaign:  campaign.trim() }),
      ...(startDate && endDate && { StartDate: startDate, EndDate: endDate }),
    }).toString();

    const res = await getFilteredClosedDeals(params);
    if (res?.data) {
      setCustomers(res.data);
      setTotal(res.total ?? res.data.length);
    } else if (Array.isArray(res)) {
      setCustomers(res);
      setTotal(res.length);
    }
    setLoading(false);
  }, [keyword, city, campaign, startDate, endDate]);

  useEffect(() => {
    setPage(1);
    fetchDeals(1);
  }, [keyword, city, campaign, startDate, endDate]);

  const handlePageChange = (p: number) => {
    setPage(p);
    fetchDeals(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Reopen Deal ────────────────────────────────────────────────────────────
  const handleReopenConfirm = async () => {
    if (!modal.customer) return;
    setActionLoading(true);
    const res = await reopenDeal(modal.customer._id || modal.customer.id);
    if (res?.success) {
      toast.success("Deal reopened successfully!");
      setModal({ open: false, type: null, customer: null });
      fetchDeals(page);
    } else {
      toast.error("Failed to reopen deal");
    }
    setActionLoading(false);
  };

  const handleClear = () => {
    setKeyword("");
    setCity("");
    setCampaign("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: total,
    thisMonth: customers.filter(c => {
      if (!c.updatedAt) return false;
      const d = new Date(c.updatedAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
  }), [customers, total]);

  return (
    <div className="min-h-screen ">
      <Toaster position="top-right" />
      <ConfirmModal modal={modal} onClose={() => setModal({ open: false, type: null, customer: null })} onConfirm={handleReopenConfirm} loading={actionLoading} />

      <div className="max-w-screen-xl mx-auto px-4 py-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:border-[var(--color-primary-light)] hover:bg-[var(--color-primary-lighter)] text-gray-500 hover:text-[var(--color-primary)] transition-all"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">Closed Deals</h1>
              <p className="text-xs text-gray-500 mt-0.5">{total} total deals closed</p>
            </div>
          </div>

          {/* Stats pills */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]"/>
              <span className="text-xs font-semibold text-gray-700">{stats.total} Total</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-primary-lighter)] border border-[var(--color-primary-light)]">
              <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]"/>
              <span className="text-xs font-semibold text-[var(--color-primary)]">{stats.thisMonth} This Month</span>
            </div>
          </div>
        </div>

        {/* ── Card ────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* ── Filters ─────────────────────────────────────────────────── */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-wrap gap-3 items-end">

              {/* Keyword */}
              <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Search</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Name, phone, city..."
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-lighter)] bg-white text-gray-800 placeholder-gray-400 transition-all"
                  />
                </div>
              </div>

              {/* City */}
              <div className="flex flex-col gap-1 w-36">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">City</label>
                <input
                  type="text"
                  placeholder="Filter city..."
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-lighter)] bg-white text-gray-800 placeholder-gray-400 transition-all"
                />
              </div>

              {/* Campaign */}
              <div className="flex flex-col gap-1 w-36">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Campaign</label>
                <input
                  type="text"
                  placeholder="Filter campaign..."
                  value={campaign}
                  onChange={e => setCampaign(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-lighter)] bg-white text-gray-800 placeholder-gray-400 transition-all"
                />
              </div>

              {/* Date range */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Date Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="DD-MM-YYYY"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-32 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-lighter)] bg-white text-gray-800 placeholder-gray-400 transition-all"
                  />
                  <span className="text-gray-400 text-xs">to</span>
                  <input
                    type="text"
                    placeholder="DD-MM-YYYY"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-32 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-lighter)] bg-white text-gray-800 placeholder-gray-400 transition-all"
                  />
                </div>
              </div>

              {/* Clear */}
              <button
                onClick={handleClear}
                className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:underline transition-all self-end"
              >
                Clear
              </button>
            </div>
          </div>

          {/* ── Table ───────────────────────────────────────────────────── */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider w-10">#</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">City</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Campaign</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Lead</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Closed</th>
                  <th className="px-4 py-3 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 px-4">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-lighter)] flex items-center justify-center">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-gray-700">No closed deals found</p>
                        <p className="text-xs text-gray-400 max-w-[200px] text-center">Closed deals will appear here once a deal is marked as closed</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  customers.map((c, i) => (
                    <tr
                      key={c._id || c.id}
                      className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors group"
                    >
                      {/* S.No */}
                      <td className="px-4 py-3 text-xs text-gray-400 font-medium">
                        {(page - 1) * LIMIT + i + 1}
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[var(--color-primary-lighter)] flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-[var(--color-primary)]">
                              {c.customerName?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 leading-tight">{c.customerName}</p>
                            {c.Email && <p className="text-[11px] text-gray-400 leading-tight">{c.Email}</p>}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700 font-medium tabular-nums">{c.ContactNumber}</span>
                      </td>

                      {/* City */}
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{c.City || "—"}</span>
                      </td>

                      {/* Campaign */}
                      <td className="px-4 py-3">
                        {c.Campaign ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--color-primary-lighter)] text-[var(--color-primary)] border border-[var(--color-primary-light)]">
                            {c.Campaign}
                          </span>
                        ) : <span className="text-gray-400">—</span>}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-800">{c.Price || "—"}</span>
                      </td>

                      {/* Lead Temperature */}
                      <td className="px-4 py-3">
                        {c.LeadTemperature ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${TEMP_COLORS[c.LeadTemperature.toLowerCase()] || TEMP_COLORS.cold}`}>
                            {c.LeadTemperature}
                          </span>
                        ) : <span className="text-gray-400">—</span>}
                      </td>

                      {/* Closed date */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">{timeAgo(c.updatedAt)}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {/* View */}
                          <button
                            onClick={() => router.push(`/customer/${c._id || c.id}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-[var(--color-primary)] bg-[var(--color-primary-lighter)] hover:bg-[var(--color-primary-light)] border border-[var(--color-primary-light)] transition-all"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                            View
                          </button>

                          {/* Reopen */}
                          <button
                            onClick={() => setModal({ open: true, type: "reopen", customer: c })}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-all"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
                            </svg>
                            Reopen
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ───────────────────────────────────────────────── */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-[var(--color-primary-light)] hover:bg-[var(--color-primary-lighter)] hover:text-[var(--color-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | "…")[]>((acc, p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "…" ? (
                      <span key={`e-${i}`} className="px-1 text-xs text-gray-400">…</span>
                    ) : (
                      <button
                        key={`p-${p}`}
                        onClick={() => handlePageChange(p as number)}
                        className={`w-7 h-7 text-xs font-semibold rounded-lg transition-all ${
                          page === p
                            ? "bg-[var(--color-primary)] text-white shadow-sm"
                            : "text-gray-600 bg-white border border-gray-200 hover:bg-[var(--color-primary-lighter)] hover:text-[var(--color-primary)]"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-[var(--color-primary-light)] hover:bg-[var(--color-primary-lighter)] hover:text-[var(--color-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Footer count */}
          {!loading && customers.length > 0 && totalPages <= 1 && (
            <div className="px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">{customers.length} closed deals</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}