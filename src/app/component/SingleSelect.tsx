import React, { useState, useRef, useEffect, useMemo } from "react";

interface OptionProps {
  className?: string;
  options: string[];
  label: string;
  value?: string | string[];
  onChange?: (selected: string) => void;
  error?: string;
  isSearchable?: boolean;
  isMulti?: boolean;
}

export default function SingleSelect({
  className,
  options,
  label,
  value,
  onChange,
  error,
  isSearchable = false,
}: OptionProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize value for display
  const displayValue = Array.isArray(value) ? value.join(", ") : value;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input
  useEffect(() => {
    if (open && isSearchable) {
      setSearch("");
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [open, isSearchable]);

  const handleSelect = (option: string) => {
    onChange?.(option);
    setOpen(false);
  };

  // Filter options
  const displayedOptions = useMemo(() => {
    if (!isSearchable) return options;

    return options.filter((opt) =>
      opt.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search, isSearchable]);

  const isLabelFloating = Boolean(displayValue) || open;

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      style={{ minWidth: "170px" }}
    >
      {/* Label */}
      <label
        className={`absolute left-3 transition-all duration-200 px-1 bg-white max-sm:dark:bg-[var(--color-childbgdark)] max-sm:dark:text-gray-400 pointer-events-none
        ${
          isLabelFloating
            ? "-top-2 text-xs text-[var(--color-primary)]"
            : "top-3 text-gray-500 text-sm"
        }`}
      >
        {label}
      </label>

      {/* Select box */}
      <div
        onClick={() => setOpen(!open)}
        className={`w-full border rounded-md px-3 py-2 cursor-pointer bg-white max-sm:dark:bg-[var(--color-childbgdark)] max-sm:dark:text-white flex justify-between items-center
        ${
          error
            ? "border-red-500"
            : "border-gray-400 max-sm:dark:border-gray-700"
        } transition-colors`}
        style={{ minHeight: "3rem" }}
      >
        <span
          className={`${
            displayValue
              ? "text-gray-900 max-sm:dark:text-gray-300"
              : "text-gray-400"
          } truncate`}
        >
          {displayValue || ""}
        </span>

        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Dropdown */}
      <ul
        className={`absolute left-0 top-full w-full bg-white max-sm:dark:bg-[var(--color-childbgdark)] max-sm:dark:text-white shadow-lg border border-gray-300 max-sm:dark:border-gray-800 rounded-md max-h-56 overflow-auto mt-1
        transition-all duration-200 transform origin-top z-50
        ${
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {/* Search */}
        {isSearchable && (
          <li className="sticky top-0 bg-white max-sm:dark:bg-[var(--color-childbgdark)] p-2 border-b z-10">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-2 py-1 border rounded-md text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </li>
        )}

        {/* Options */}
        {displayedOptions.length > 0 ? (
          displayedOptions.map((opt, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(opt)}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer truncate"
            >
              {opt}
            </li>
          ))
        ) : (
          <li className="px-3 py-2 text-gray-500 text-sm">
            {isSearchable ? "No matching results" : "No options available"}
          </li>
        )}
      </ul>

      {/* Error */}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}