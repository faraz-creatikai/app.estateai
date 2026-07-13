/**
 * CustomDropdown — a compact, reusable select built to match the
 * existing dialog design system (--color-primary, Tailwind utilities).
 *
 * Features
 * ─────────
 * • Portal-rendered panel  →  never clipped by overflow:hidden ancestors
 * • Auto-repositions on scroll / resize while open
 * • Cascading-safe: pass `disabled` when upstream selection is pending
 * • `loading` state with spinner
 * • Optional `clearable` × button
 * • Keyboard: closes on Escape, selects on Enter / Space (trigger focus)
 *
 * Usage
 * ─────
 * <CustomDropdown
 *   options={campaigns}            // DropdownOption[]
 *   value={filterCampaign?._id ?? null}
 *   onChange={opt => setFilterCampaign(opt)}
 *   placeholder="Campaign"
 *   loading={loadingCampaigns}
 * />
 */

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';

/* ─── Types ─────────────────────────────────────────────────────────────── */

export interface DropdownOption {
  _id: string;
  Name: string;
}

export interface CustomDropdownProps {
  options: DropdownOption[];
  /** Controlled: pass the selected option's `_id`, or null for none. */
  value: string | null;
  onChange: (option: DropdownOption | null) => void;
  placeholder?: string;
  loading?: boolean;
  /** Disables the trigger — use for dependent dropdowns awaiting upstream. */
  disabled?: boolean;
  className?: string;
  /** Show an × button to clear the selection. Default: true. */
  clearable?: boolean;
  /** Message shown when options array is empty. */
  noOptionsText?: string;
}

/* ─── Tiny icons (self-contained so no import overhead) ─────────────────── */

const ChevronIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path
      d="M2 3.5L5 6.5L8 3.5"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ClearIcon = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
    <path
      d="M1.5 1.5l5 5M6.5 1.5l-5 5"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path
      d="M1.5 5l3 3 4-4.5"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ─── Component ─────────────────────────────────────────────────────────── */

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  loading = false,
  disabled = false,
  className = '',
  clearable = true,
  noOptionsText = 'No options',
}) => {
  const [open, setOpen] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0, width: 0 });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selectedOption = value
    ? (options.find(o => o._id === value) ?? null)
    : null;

  const isDisabled = disabled || loading;

  /* Calculate panel position from trigger's bounding rect ──────────────── */
  const recalcPos = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setPanelPos({ top: r.bottom + 4, left: r.left, width: r.width });
  }, []);

  const openPanel = () => {
    recalcPos();
    setOpen(true);
  };

  const closePanel = () => setOpen(false);

  const togglePanel = () => {
    if (isDisabled) return;
    open ? closePanel() : openPanel();
  };

  /* Close on outside click ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t))
        return;
      closePanel();
    };
    document.addEventListener('mousedown', down);
    return () => document.removeEventListener('mousedown', down);
  }, [open]);

  /* Reposition on scroll / resize while panel is open ─────────────────── */
  useEffect(() => {
    if (!open) return;
    const update = () => recalcPos();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, recalcPos]);

  /* Close on Escape ────────────────────────────────────────────────────── */
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Escape') closePanel();
    if ((e.key === 'Enter' || e.key === ' ') && !open) {
      e.preventDefault();
      openPanel();
    }
  };

  const handleSelect = (opt: DropdownOption) => {
    onChange(opt);
    closePanel();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  /* ─── Styles ──────────────────────────────────────────────────────────── */

  const triggerStyle: React.CSSProperties = {
    background: open ? '#fff' : selectedOption ? '#f0f9ff' : '#f8fafc',
    borderColor: open
      ? 'var(--color-primary)'
      : selectedOption
        ? 'rgba(2,132,199,0.25)'
        : '#e2e8f0',
    boxShadow: open ? '0 0 0 3px rgba(2,132,199,0.10)' : 'none',
    opacity: disabled ? 0.60 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
  };

  /* ─── Portal panel ────────────────────────────────────────────────────── */

  const panel =
    open &&
    createPortal(
      <div
        ref={panelRef}
        style={{
          position: 'fixed',
          top: panelPos.top,
          left: panelPos.left,
          width: panelPos.width,
          zIndex: 9999,
        }}
      >
        <div
          className="bg-white rounded-xl border border-gray-100 overflow-hidden"
          style={{
            boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
            animation: 'dd-in 0.14s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <div
            className="overflow-y-auto"
            style={{
              maxHeight: 188,
              scrollbarWidth: 'thin',
              scrollbarColor: '#e2e8f0 transparent',
            }}
          >
            {options.length === 0 ? (
              <p className="text-[11px] text-gray-400 text-center py-4">
                {noOptionsText}
              </p>
            ) : (
              options.map(opt => {
                const active = opt._id === value;
                return (
                  <button
                    key={opt._id}
                    type="button"
                    onMouseDown={() => handleSelect(opt)}
                    className="w-full text-left cursor-pointer flex items-center gap-2 px-3 py-2 text-[11.5px] transition-colors"
                    style={{
                      background: active ? '#f0f9ff' : 'transparent',
                      color: active ? 'var(--color-primary)' : '#374151',
                      fontWeight: active ? 600 : 400,
                    }}
                    onMouseEnter={e => {
                      if (!active)
                        (e.currentTarget as HTMLElement).style.background =
                          '#f8fafc';
                    }}
                    onMouseLeave={e => {
                      if (!active)
                        (e.currentTarget as HTMLElement).style.background =
                          'transparent';
                    }}
                  >
                    <span className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
                      {active && <CheckIcon />}
                    </span>
                    <span className="truncate">{opt.Name}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <style>{`
          @keyframes dd-in {
            from { opacity: 0; transform: translateY(-4px) scale(0.98); }
            to   { opacity: 1; transform: translateY(0)    scale(1); }
          }
        `}</style>
      </div>,
      document.body
    );

  /* ─── Render ──────────────────────────────────────────────────────────── */

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={togglePanel}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        className="w-full flex items-center cursor-pointer gap-1.5 px-2.5 py-[7px] rounded-lg border text-left select-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20"
        style={triggerStyle}
      >
        {/* Label or spinner */}
        {loading ? (
          <>
            <span
              className="w-3 h-3 rounded-full border border-gray-200 flex-shrink-0"
              style={{
                borderTopColor: 'var(--color-primary)',
                animation: 'spin 0.7s linear infinite',
              }}
            />
            <span className="flex-1 text-[11px] text-gray-400 truncate">
              Loading…
            </span>
          </>
        ) : (
          <span
            className="flex-1 text-[11px] truncate"
            style={{ color: selectedOption ? '#1e293b' : '#94a3b8' }}
          >
            {selectedOption ? selectedOption.Name : placeholder}
          </span>
        )}

        {/* Right-side controls */}
        <span className="flex items-center gap-0.5 flex-shrink-0 text-gray-400">
          {clearable && selectedOption && !loading && (
            <span
              className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-gray-100 hover:text-gray-600 transition-colors"
              onMouseDown={handleClear}
              aria-label="Clear"
            >
              <ClearIcon />
            </span>
          )}
          <span
            style={{
              display: 'inline-flex',
              transition: 'transform 0.18s',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <ChevronIcon />
          </span>
        </span>
      </button>

      {panel}

      {/* Shared spin keyframe (one-time injection, harmless if duplicated) */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default CustomDropdown;