"use client";

import React, { useState } from "react";
import PopupMenu from "./PopupMenu";
import { Video, FileText, MapPin, ListChecks, Tag } from "lucide-react";

interface ListItem {
  _id: string;
  name: string;
  body?: string;
  image?: string;
  // NEW — all optional, so Assign (users) and Mail (name/body/image only) items
  // are completely unaffected; these only render when actually present.
  whatsappMediaType?: "image" | "video" | "document" | "location" | "poll" | "text";
  whatsappFileName?: string;
  category?: string;
  whatsappLocation?: { lat?: number; lng?: number; name?: string; address?: string } | null;
  whatsappPoll?: { name?: string; options?: string[]; selectableCount?: number } | null;
  variables?: string[];
  whatsappLinkPreview?: { title?: string; body?: string; thumbnailUrl?: string; sourceUrl?: string } | null;
}

interface ListPopupProps {
  title: string;
  list: ListItem[];
  selected: string | string[] | undefined;
  onSelect: (id: string) => void;
  onSubmit: () => void;
  submitLabel: string;
  onClose: () => void;
  multiSelect?: boolean;
  showPreview?: boolean;
  children?: React.ReactNode;
  isLoading?: boolean;
  isFetchingData?: boolean;
}

export default function ListPopup({
  title,
  list,
  selected,
  onSelect,
  onSubmit,
  submitLabel,
  onClose,
  multiSelect,
  showPreview = true,
  children,
  isLoading = false,
  isFetchingData = false,
}: ListPopupProps) {
  const [previewItem, setPreviewItem] = useState<ListItem | null>(null);

  const isSelected = (id: string) =>
    multiSelect
      ? Array.isArray(selected) && selected.includes(id)
      : selected === id;

  const handleSelectFromPreview = () => {
    if (previewItem) {
      onSelect(previewItem._id);
      setPreviewItem(null);
    }
  };

  return (
    <PopupMenu onClose={onClose}>
      <div className="relative flex flex-col bg-white w-full h-full max-w-[600px] max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <h2 className="text-xl text-[var(--color-secondary-darker)] font-extrabold tracking-tight">
            {title.split(" ")[0]}{" "}
            <span className="text-[var(--color-primary)]">
              {title.split(" ").slice(1).join(" ")}
            </span>
          </h2>

          <button
            onClick={() => setPreviewItem(null)}
            className={`flex items-center cursor-pointer gap-1.5 text-sm font-medium text-[var(--color-primary)] transition-all duration-200 ${
              previewItem ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="relative flex flex-col flex-1 min-h-0 overflow-hidden" style={{ minHeight: "300px", maxHeight: "80vh" }}>

          {/* LIST PANEL */}
          <div
            className="flex flex-col flex-1 min-h-0 transition-transform duration-300 ease-in-out w-full"
            style={{ transform: previewItem ? "translateX(-100%)" : "translateX(0)" }}
          >
            {children && <div className="px-6 pt-4 shrink-0">{children}</div>}

            <div className="flex flex-col gap-0.5 overflow-y-auto hide-scrollbar px-2 py-3 flex-1 min-h-0">
              {isFetchingData ? (
                <div className="flex flex-col justify-center items-center py-16 space-y-4">
                  <svg className="w-8 h-8 text-[var(--color-primary)] animate-spin opacity-75" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <p className="text-sm text-gray-500 font-medium tracking-wide">Loading items...</p>
                </div>
              ) :list.length > 0 ? (
                list.map((item) => (
                  <div
                    key={item._id}
                    className="group flex items-center justify-between gap-3 rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <button
                      className="flex-1 text-left min-w-0"
                      onClick={() => {
                        if (showPreview) {
                          setPreviewItem(item);
                        } else {
                          onSelect(item._id);
                        }
                      }}
                    >
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-[var(--color-primary)] transition-colors">
                        {item.name}
                      </p>
                      {item.body && (
                        <p className="text-xs text-gray-400 truncate max-w-[220px] mt-0.5">
                          {item.body}
                        </p>
                      )}
                    </button>

                    {showPreview && (
                      <button
                        onClick={() => setPreviewItem(item)}
                        className="opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-[var(--color-primary)] shrink-0"
                        title="Preview"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    )}

                    <input
                      type="checkbox"
                      checked={isSelected(item._id)}
                      onChange={() => onSelect(item._id)}
                      className="accent-[var(--color-primary)] w-4 h-4 shrink-0 cursor-pointer"
                    />
                  </div>
                ))
              ) : (
                <div className="flex justify-center items-center py-10 text-gray-400 text-sm">
                  No items available at the moment
                </div>
              )}
            </div>
          </div>

          {/* PREVIEW PANEL */}
          <div
            className="absolute inset-0 bg-white overflow-y-auto transition-transform duration-300 ease-in-out"
            style={{ transform: previewItem ? "translateX(0)" : "translateX(100%)" }}
          >
            {previewItem && (
              <div className="flex flex-col gap-4 px-6 py-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                    Template Name
                  </p>
                  <p className="text-base font-bold text-gray-800">{previewItem.name}</p>
                </div>

                {/* Badges row — only renders fields that exist, so Mail/Assign are unaffected */}
                {(previewItem.whatsappMediaType || previewItem.category) && (
                  <div className="flex flex-wrap gap-2">
                    {previewItem.whatsappMediaType && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                        {previewItem.whatsappMediaType}
                      </span>
                    )}
                    {previewItem.category && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-primary-lighter)] text-[var(--color-primary)]">
                        <Tag size={12} /> {previewItem.category}
                      </span>
                    )}
                  </div>
                )}

                {previewItem.body && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                      Message Body
                    </p>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {previewItem.body}
                    </div>
                  </div>
                )}

                {/* Image — unchanged, works for Mail too */}
                {previewItem.image && previewItem.whatsappMediaType !== "video" && (
                  <img
                    src={previewItem.image}
                    alt={previewItem.name}
                    className="w-full rounded-xl"
                  />
                )}

                {/* Video — new, only when mediaType is video */}
                {previewItem.image && previewItem.whatsappMediaType === "video" && (
                  <video src={previewItem.image} controls className="w-full rounded-xl" />
                )}

                {/* Document — new */}
                {previewItem.whatsappMediaType === "document" && (
                  <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3">
                    <FileText size={22} className="text-[var(--color-primary)] shrink-0" />
                    <span className="text-sm text-gray-700 truncate">
                      {previewItem.whatsappFileName || previewItem.image?.split("/").pop() || "Document"}
                    </span>
                  </div>
                )}

                {/* Location — new */}
                {previewItem.whatsappMediaType === "location" && previewItem.whatsappLocation && (
                  <div className="flex flex-col gap-1.5 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700">
                    <div className="flex items-center gap-2 font-semibold">
                      <MapPin size={16} className="text-[var(--color-primary)]" />
                      {previewItem.whatsappLocation.name || "Location"}
                    </div>
                    {previewItem.whatsappLocation.address && (
                      <p className="text-xs text-gray-500">{previewItem.whatsappLocation.address}</p>
                    )}
                    {(previewItem.whatsappLocation.lat || previewItem.whatsappLocation.lng) && (
                      <p className="text-xs text-gray-400">
                        {previewItem.whatsappLocation.lat}, {previewItem.whatsappLocation.lng}
                      </p>
                    )}
                  </div>
                )}

                {/* Poll — new */}
                {previewItem.whatsappMediaType === "poll" && previewItem.whatsappPoll && (
                  <div className="flex flex-col gap-2 border border-gray-200 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 font-semibold text-sm text-gray-800">
                      <ListChecks size={16} className="text-[var(--color-primary)]" />
                      {previewItem.whatsappPoll.name || "Poll"}
                    </div>
                    <ul className="flex flex-col gap-1">
                      {(previewItem.whatsappPoll.options || []).map((opt, idx) => (
                        <li key={idx} className="text-xs text-gray-600 bg-gray-50 rounded-md px-3 py-1.5">
                          {opt}
                        </li>
                      ))}
                    </ul>
                    <p className="text-[11px] text-gray-400">
                      Max selectable: {previewItem.whatsappPoll.selectableCount || 1}
                    </p>
                  </div>
                )}

                {/* Merge tag variables — new */}
{previewItem.variables && previewItem.variables.length > 0 && (
  <div>
    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
      Merge Tags
    </p>
    <div className="flex flex-wrap gap-1.5">
      {previewItem.variables.map((v, idx) => (
        <span key={idx} className="px-2 py-0.5 rounded-md text-xs font-mono bg-blue-50 text-blue-700 border border-blue-100">
          {`{{${v}}}`}
        </span>
      ))}
    </div>
  </div>
)}

{/* Link preview card — new */}
{previewItem.whatsappLinkPreview?.sourceUrl && (
  <div className="border border-gray-200 rounded-xl overflow-hidden">
    {previewItem.whatsappLinkPreview.thumbnailUrl && (
      <img src={previewItem.whatsappLinkPreview.thumbnailUrl} alt="" className="w-full h-32 object-cover" />
    )}
    <div className="px-3 py-2">
      <p className="text-sm font-semibold text-gray-800 truncate">{previewItem.whatsappLinkPreview.title}</p>
      {previewItem.whatsappLinkPreview.body && (
        <p className="text-xs text-gray-500 truncate">{previewItem.whatsappLinkPreview.body}</p>
      )}
      <p className="text-[11px] text-blue-600 truncate mt-0.5">{previewItem.whatsappLinkPreview.sourceUrl}</p>
    </div>
  </div>
)}

                <button
                  onClick={handleSelectFromPreview}
                  className={`w-full py-2.5 rounded-xl cursor-pointer sticky bottom-1 left-0 text-sm font-semibold transition-colors ${
                    isSelected(previewItem._id)
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-primary-lighter)] text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
                  }`}
                >
                  {isSelected(previewItem._id) ? "✓ Selected" : "Select this Template"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="flex justify-between bg-white px-6 py-4 border-t w-full border-gray-100 shrink-0  ">
          <button
            disabled={isLoading}
            className={`flex items-center cursor-pointer gap-2 text-[var(--color-primary)] bg-[var(--color-primary-lighter)] rounded-lg px-5 py-2 text-sm font-semibold transition-colors
              ${isLoading ? "opacity-60 cursor-not-allowed" : "hover:bg-[var(--color-primary-light)] cursor-pointer"}`}
            onClick={onSubmit}
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Processing...
              </>
            ) : (
              submitLabel
            )}
          </button>

          <button
            disabled={isLoading}
            className={`text-[#C62828] cursor-pointer bg-[#FDECEA] rounded-lg px-5 py-2 text-sm font-semibold transition-colors
              ${isLoading ? "opacity-40 cursor-not-allowed" : "hover:bg-red-200/60 cursor-pointer"}`}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </PopupMenu>
  );
}