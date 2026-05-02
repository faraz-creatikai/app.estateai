"use client";

import React, { useState } from "react";
import PopupMenu from "./PopupMenu";

interface ListItem {
  _id: string;
  name: string;
  body?: string;
  image?: string;
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
  children?: React.ReactNode;
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
  children,
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
      <div className="relative flex flex-col bg-white w-full max-w-[420px] rounded-2xl shadow-2xl overflow-hidden">

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
            className={`flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] transition-all duration-200 ${
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
        <div className="relative overflow-hidden" style={{ minHeight: "300px", maxHeight: "60vh" }}>

          {/* LIST PANEL */}
          <div
            className="transition-transform duration-300 ease-in-out h-full"
            style={{ transform: previewItem ? "translateX(-100%)" : "translateX(0)" }}
          >
            {children && <div className="px-6 pt-4">{children}</div>}
            <div className="flex flex-col gap-0.5 overflow-y-auto px-2 py-3 h-full">
              {list.length > 0 ? (
                list.map((item) => (
                  <div
                    key={item._id}
                    className="group flex items-center justify-between gap-3 cursor-pointer rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <button
                      className="flex-1 text-left min-w-0"
                      onClick={() => setPreviewItem(item)}
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

                    <button
                      onClick={() => setPreviewItem(item)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-[var(--color-primary)] shrink-0"
                      title="Preview"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

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

                

                {/* Name */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                    Template Name
                  </p>
                  <p className="text-base font-bold text-gray-800">{previewItem.name}</p>
                </div>

                {/* Body */}
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

                {/* Image — full width, natural height, no clipping */}
                {previewItem.image && (
                  <img
                    src={previewItem.image}
                    alt={previewItem.name}
                    className="w-full rounded-xl"
                  />
                )}

                {/* Select CTA */}
                <button
                  onClick={handleSelectFromPreview}
                  className={`w-full py-2.5 rounded-xl sticky bottom-1 left-0 text-sm font-semibold transition-colors ${
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
        <div className="flex justify-between px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            className="text-[var(--color-primary)] bg-[var(--color-primary-lighter)] hover:bg-[var(--color-primary-light)] cursor-pointer rounded-lg px-5 py-2 text-sm font-semibold transition-colors"
            onClick={onSubmit}
          >
            {submitLabel}
          </button>
          <button
            className="cursor-pointer text-[#C62828] bg-[#FDECEA] hover:bg-red-200/60 rounded-lg px-5 py-2 text-sm font-semibold transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </PopupMenu>
  );
}