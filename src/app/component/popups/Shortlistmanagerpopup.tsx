'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import {
  getShortlist,
  removeShortlist,
  updateShortlist,
  getCustomer,
  addToShortlist,
} from '@/store/customer';
import PopupMenu from './PopupMenu';
import { VscChromeMinimize } from "react-icons/vsc";
import { ImageSlider } from '../ImageSlider';
import { MdAdd, MdSource } from 'react-icons/md';
import { useCustomerFieldLabel } from '@/context/customer/CustomerFieldLabelContext';
import FollowupAddDialog from './FollowupAddDialog';
import { getCampaign } from '@/store/masters/campaign/campaign';
import { getTypesByCampaign } from '@/store/masters/types/types';
import { getSubtypeByCampaignAndType } from '@/store/masters/subtype/subtype';
import CustomDropdown, { DropdownOption } from '../CustomDropdown';
import { getCity } from '@/store/masters/city/city';
import { getLocationByCity } from '@/store/masters/location/location';
import { getsubLocationByCityLoc } from '@/store/masters/sublocation/sublocation';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ShortlistStatus =
  | 'pending'
  | 'interested'
  | 'visited'
  | 'shortlisted'
  | 'rejected';

export interface AssignedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  city: string;
  phone: string;
  status: string;
  [key: string]: any;
}

export interface ShortlistItemInfo {
  shortlistId: string;
  status: ShortlistStatus;
  savedAt: string;
  savedById: string;
}

export interface ShortlistItem {
  id: string;
  _id: string;
  Campaign: string;
  CustomerType: string;
  CustomerSubType: string;
  LeadType: string;
  customerName: string;
  ContactNumber: string;
  City: string;
  Location: string;
  SubLocation: string;
  Adderess: string;
  Description: string;
  Email: string;
  Price: string;
  PriceNumber: number;
  LeadTemperature: string;
  DealClosed: boolean;
  ReferenceId: string;
  AssignTo: AssignedUser[];
  createdAt: string;
  updatedAt: string;
  _shortlistInfo: ShortlistItemInfo;
  [key: string]: any;
}

export interface ShortlistManagerPopupProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName?: string;
  onViewDetails?: (itemId: string, item: ShortlistItem) => void;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: ShortlistStatus[] = [
  'pending',
  'interested',
  'visited',
  'shortlisted',
  'rejected',
];

const PAGE_SIZE = 20;

const STATUS_STYLE: Record<ShortlistStatus, { dot: string; badge: string }> = {
  pending: { dot: 'bg-amber-400', badge: 'text-amber-700  bg-amber-50  border-amber-200' },
  interested: { dot: 'bg-[var(--color-primary)]', badge: 'text-blue-700   bg-blue-50   border-blue-200' },
  visited: { dot: 'bg-violet-400', badge: 'text-violet-700 bg-violet-50 border-violet-200' },
  shortlisted: { dot: 'bg-emerald-400', badge: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  rejected: { dot: 'bg-[var(--color-destructive)]', badge: 'text-red-700 bg-red-50 border-red-200' },
};

const STATUS_LABEL: Record<ShortlistStatus, string> = {
  pending: 'Pending', interested: 'Interested', visited: 'Visited',
  shortlisted: 'Shortlisted', rejected: 'Rejected',
};

const TEMP_STYLE: Record<string, { dot: string; badge: string }> = {
  hot: { dot: 'bg-red-400', badge: 'text-red-700    bg-red-50    border-red-200' },
  warm: { dot: 'bg-orange-400', badge: 'text-orange-700 bg-orange-50 border-orange-200' },
  cold: { dot: 'bg-sky-400', badge: 'text-sky-700    bg-sky-50    border-sky-200' },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const normalizeShortlist = (raw: any): ShortlistItem[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  for (const key of ['data', 'shortlist', 'properties', 'items', 'results']) {
    if (Array.isArray(raw[key])) return raw[key];
  }
  return [];
};

const cap = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

const fmt = (iso: string) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return '—'; }
};

const initials = (name: string) => {
  if (!name || name === 'N/A') return '?';
  return name.split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2);
};

const cleanValue = (val: string | null | undefined) => {
  if (!val || val === 'N/A' || val.trim() === '') return '—';
  return val;
};

// Avatar colours matched to RecommendAgentWorkspace
const AVATAR_COLORS: [string, string][] = [
  ['#e0f2fe', '#0284c7'], ['#fce7f3', '#db2777'], ['#d1fae5', '#059669'],
  ['#ede9fe', '#7c3aed'], ['#fef3c7', '#d97706'], ['#fee2e2', '#dc2626'],
];

const avatarColor = (name: string): [string, string] =>
  AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

// ─── Icons ─────────────────────────────────────────────────────────────────────

const PhoneIcon = () => (
  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);
const UserIcon = () => (
  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);
const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const EyeIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);
const MaximizeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>
);
const RefreshIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
const PlusIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
  </svg>
);
const SearchIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" strokeWidth={2} />
    <path d="m21 21-4.35-4.35" strokeWidth={2} strokeLinecap="round" />
  </svg>
);
const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const CheckboxIcon = ({ checked, indeterminate }: { checked: boolean; indeterminate?: boolean }) => (
  <div
    className="w-4 h-4 rounded-[4px] flex items-center justify-center flex-shrink-0 transition-all duration-150"
    style={{
      background: checked ? 'var(--color-primary)' : indeterminate ? '#bae6fd' : '#fff',
      border: checked ? '2px solid var(--color-primary)' : indeterminate ? '2px solid var(--color-primary)' : '2px solid #cbd5e1',
      boxShadow: checked ? '0 1px 4px rgba(2,132,199,0.25)' : 'none',
    }}
  >
    {checked && (
      <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none">
        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )}
    {!checked && indeterminate && (
      <div className="w-2 h-0.5 rounded-full" style={{ background: 'var(--color-primary)' }} />
    )}
  </div>
);


const Spinner = ({ className = '' }: { className?: string }) => (
  <div className={`rounded-full border-2 border-current border-t-transparent animate-spin ${className}`} />
);

// ─── Inline Avatar ─────────────────────────────────────────────────────────────

const MiniAvatar = ({ name }: { name: string }) => {
  const [bg, fg] = avatarColor(name);
  return (
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-[10px] flex-shrink-0"
      style={{ background: bg, color: fg }}
    >
      {initials(name)}
    </div>
  );
};








interface AddManuallyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  existingIds: Set<string>;
  onAdded: () => void;
}

const AddManuallyDialog: React.FC<AddManuallyDialogProps> = ({
  isOpen,
  onClose,
  customerId,
  existingIds,
  onAdded,
}) => {
  /* ── Existing state ───────────────────────────────────────────────────── */
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<ShortlistStatus>('shortlisted');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  /* ── NEW: filter dropdown state ───────────────────────────────────────── */
  const [campaigns, setCampaigns] = useState<DropdownOption[]>([]);
  const [types, setTypes] = useState<DropdownOption[]>([]);
  const [subtypes, setSubtypes] = useState<DropdownOption[]>([]);

  const [citys, setCitys] = useState<DropdownOption[]>([]);
  const [locations, setLocations] = useState<DropdownOption[]>([]);
  const [sublocations, setSublocations] = useState<DropdownOption[]>([]);

  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingSubtypes, setLoadingSubtypes] = useState(false);

  const [loadingCity, setLoadingCity] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingSubLocation, setLoadingSubLocation] = useState(false);

  const [filterCampaign, setFilterCampaign] = useState<DropdownOption | null>(null);
  const [filterType, setFilterType] = useState<DropdownOption | null>(null);
  const [filterSubType, setFilterSubType] = useState<DropdownOption | null>(null);

  const [filterCity, setFilterCity] = useState<DropdownOption | null>(null);
  const [filterLocation, setFilterLocation] = useState<DropdownOption | null>(null);
  const [filterSubLocation, setFilterSubLocation] = useState<DropdownOption | null>(null);

  /* ── Derived helpers ──────────────────────────────────────────────────── */
  const activeFilterCount =
    (filterCampaign ? 1 : 0) + (filterType ? 1 : 0) + (filterSubType ? 1 : 0) +
    (filterCity ? 1 : 0) + (filterLocation ? 1 : 0) + (filterSubLocation ? 1 : 0);

  const clearAllFilters = () => {
    setFilterCampaign(null);
    setFilterType(null);
    setFilterSubType(null);

    setFilterCity(null);
    setFilterLocation(null);
    setFilterSubLocation(null);
  };

  /* ── Load customers + campaigns when dialog opens ─────────────────────── */
  useEffect(() => {
    if (!isOpen) return;

    // Reset all state
    setSearch('');
    setSelected(new Set());
    setSuccessMsg('');
    setStatus('shortlisted');
    setVisibleCount(PAGE_SIZE);
    setFilterCampaign(null);
    setFilterType(null);
    setFilterSubType(null);
    setCampaigns([]);
    setTypes([]);
    setSubtypes([]);

    setFilterCity(null);
    setFilterLocation(null);
    setFilterSubLocation(null);
    setCitys([]);
    setLocations([]);
    setSublocations([]);

    // Parallel fetches — customers + campaigns are independent
    const loadCustomers = async () => {
      setLoading(true);
      try {
        const res: any = await getCustomer();
        if (res) {
          const mapped = res
            .filter((item: any) => item._id !== customerId)
            .map((item: any) => ({
              _id: item._id,
              Name: item.customerName,
              ContactNumber: item.ContactNumber?.slice(0, 10) ?? '',
              Email: item.Email ?? '',
              Campaign: item.Campaign ?? '',
              Type: item.CustomerType ?? '',
              SubType: item.CustomerSubType ?? '',
              City: item.City ?? '',
              Location: item.Location ?? '',
              SubLocation: item.SubLocation ?? '',
            }));
          setCustomers(mapped);
        }
      } finally {
        setLoading(false);
        setTimeout(() => searchRef.current?.focus(), 60);
      }
    };

    const loadCampaigns = async () => {
      setLoadingCampaigns(true);
      try {
        const res = await getCampaign();
        if (res) {
          setCampaigns(
            res.map((c: any) => ({ _id: c._id, Name: c.Name }))
          );
        }
      } finally {
        setLoadingCampaigns(false);
      }
    };

    const loadCity = async () => {
      setLoadingCity(true);
      try {
        const res = await getCity();
        if (res) {
          setCitys(
            res.map((c: any) => ({ _id: c._id, Name: c.Name }))
          );
        }
      } finally {
        setLoadingCity(false);
      }
    };


    loadCustomers();
    loadCampaigns();
    loadCity();
  }, [isOpen, customerId]);

  /* ── Load Types when Campaign changes ────────────────────────────────── */
  useEffect(() => {
    // Always reset downstream when campaign changes
    setFilterType(null);
    setFilterSubType(null);
    setTypes([]);
    setSubtypes([]);

    if (!filterCampaign) return;

    const load = async () => {
      setLoadingTypes(true);
      try {
        const res = await getTypesByCampaign(filterCampaign._id);
        if (res) {
          setTypes(res.map((t: any) => ({ _id: t._id, Name: t.Name })));
        }
      } finally {
        setLoadingTypes(false);
      }
    };

    load();
  }, [filterCampaign]);

  /* ── Load SubTypes when Type changes ─────────────────────────────────── */
  useEffect(() => {
    // Always reset subtypes when type changes
    setFilterSubType(null);
    setSubtypes([]);

    if (!filterCampaign || !filterType) return;

    const load = async () => {
      setLoadingSubtypes(true);
      try {
        const res = await getSubtypeByCampaignAndType(
          filterCampaign._id,
          filterType._id
        );
        if (res) {
          setSubtypes(res.map((s: any) => ({ _id: s._id, Name: s.Name })));
        }
      } finally {
        setLoadingSubtypes(false);
      }
    };

    load();
  }, [filterType, filterCampaign]);

  /* ── Load Locations when City changes ────────────────────────────────── */
  useEffect(() => {
    // Always reset downstream when campaign changes
    setFilterLocation(null);
    setFilterSubLocation(null);
    setLocations([]);
    setSublocations([]);

    if (!filterCity) return;

    const load = async () => {
      setLoadingLocation(true);
      try {
        const res = await getLocationByCity(filterCity._id);
        if (res) {
          setLocations(res.map((t: any) => ({ _id: t._id, Name: t.Name })));
        }
      } finally {
        setLoadingLocation(false);
      }
    };

    load();
  }, [filterCity]);

  /* ── Load SubLocations when Location changes ─────────────────────────────────── */
  useEffect(() => {
    // Always reset subtypes when type changes
    setFilterSubLocation(null);
    setSublocations([]);

    if (!filterCity || !filterLocation) return;

    const load = async () => {
      setLoadingSubLocation(true);
      try {
        const res = await getsubLocationByCityLoc(
          filterCity._id,
          filterLocation._id
        );
        if (res) {
          setSublocations(res.map((s: any) => ({ _id: s._id, Name: s.Name })));
        }
      } finally {
        setLoadingSubLocation(false);
      }
    };

    load();
  }, [filterLocation, filterCity]);

  /* ── Reset visible count on search OR filter change ──────────────────── */
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, filterCampaign, filterType, filterSubType, filterCity, filterLocation, filterSubLocation]);

  /* ── Filtered list — search + dropdown filters combined ──────────────── */
  const filtered = useMemo(() => {
    let result = customers;

    // Cascade filter: match by Name string stored on each customer record
    if (filterCampaign) {
      result = result.filter(c => c.Campaign === filterCampaign.Name);
    }
    if (filterType) {
      result = result.filter(c => c.Type === filterType.Name);
    }
    if (filterSubType) {
      result = result.filter(c => c.SubType === filterSubType.Name);
    }

    if (filterCity) {
      result = result.filter(c => c.City === filterCity.Name);
    }
    if (filterLocation) {
      result = result.filter(c => c.Location === filterLocation.Name);
    }
    if (filterSubLocation) {
      result = result.filter(c => c.SubLocation === filterSubLocation.Name);
    }

    // Text search on top of dropdown filters
    if (!search.trim()) return result;
    const q = search.toLowerCase();
    return result.filter(
      c =>
        c.Name?.toLowerCase().includes(q) ||
        c.Email?.toLowerCase().includes(q) ||
        c.Campaign?.toLowerCase().includes(q) ||
        c.Type?.toLowerCase().includes(q) ||
        c.ContactNumber?.includes(q)
    );
  }, [customers, search, filterCampaign, filterType, filterSubType, filterCity, filterLocation, filterSubLocation]);

  const visibleFiltered = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const remaining = filtered.length - visibleCount;

  const allSelected =
    filtered.length > 0 && filtered.every(c => selected.has(c._id));
  const someSelected = filtered.some(c => selected.has(c._id)) && !allSelected;

  /* ── Existing handlers (unchanged) ───────────────────────────────────── */
  const toggleOne = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(prev => {
      const next = new Set(prev);
      if (allSelected) filtered.forEach(c => next.delete(c._id));
      else filtered.forEach(c => next.add(c._id));
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selected.size === 0 || submitting) return;
    setSubmitting(true);
    try {
      const result = await addToShortlist({
        customerId,
        propertyIds: [...selected],
        status,
      });
      if (result) {
        setSuccessMsg(
          `${selected.size} lead${selected.size !== 1 ? 's' : ''} added`
        );
        setSelected(new Set());
        onAdded();
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 1400);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  /* ─────────────────────────────────────────────────────────────────────── */
  /*  RENDER                                                                  */
  /* ─────────────────────────────────────────────────────────────────────── */

  return (
    <div
      className="fixed cursor-pointer inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{
        background: 'rgba(15,23,42,0.35)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white flex flex-col overflow-hidden"
        style={{
          borderRadius: '20px 20px 0 0',
          maxHeight: '94dvh',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
          animation: 'sheet-up 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Dialog Header ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <div>
            <h3 className="text-[14px] font-bold text-gray-900 leading-tight">
              Add to Shortlist
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Pick leads to add manually
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 cursor-pointer rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <XIcon />
          </button>
        </div>

        {/* ── Search ───────────────────────────────────────────────────── */}
        <div className="px-5 pb-2 flex-shrink-0">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, phone, campaign…"
              className="w-full pl-8 pr-4 py-2 text-[12px] rounded-xl border outline-none transition-all bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 text-gray-800"
            />
          </div>
        </div>

        {/* ── NEW: Cascading filter row ─────────────────────────────────── */}
        <div className="px-5 pb-3 flex-shrink-0">
          {/* Row label + clear-all */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Filter
            </span>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                style={{
                  background: 'rgba(2,132,199,0.08)',
                  color: 'var(--color-primary)',
                }}
              >
                {/* active filter count badge */}
                <span
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                  style={{ background: 'var(--color-primary)' }}
                >
                  {activeFilterCount}
                </span>
                Clear
              </button>
            )}
          </div>

          {/* 3-column dropdown row */}
          <div className="grid grid-cols-3 gap-2">
            {/* Campaign */}
            <CustomDropdown
              options={campaigns}
              value={filterCampaign?._id ?? null}
              onChange={opt => setFilterCampaign(opt)}
              placeholder="Campaign"
              loading={loadingCampaigns}
            />

            {/* Type — enabled only after a campaign is picked */}
            <CustomDropdown
              options={types}
              value={filterType?._id ?? null}
              onChange={opt => setFilterType(opt)}
              placeholder="Type"
              loading={loadingTypes}
              disabled={!filterCampaign}
              noOptionsText="No types"
            />

            {/* Sub-type — enabled only after a type is picked */}
            <CustomDropdown
              options={subtypes}
              value={filterSubType?._id ?? null}
              onChange={opt => setFilterSubType(opt)}
              placeholder="Sub-type"
              loading={loadingSubtypes}
              disabled={!filterType}
              noOptionsText="No sub-types"
            />

            {/* City */}
            <CustomDropdown
              options={citys}
              value={filterCity?._id ?? null}
              onChange={opt => setFilterCity(opt)}
              placeholder="City"
              loading={loadingCity}
            />

            {/* Location — enabled only after a city is picked */}
            <CustomDropdown
              options={locations}
              value={filterLocation?._id ?? null}
              onChange={opt => setFilterLocation(opt)}
              placeholder="Location"
              loading={loadingLocation}
              disabled={!filterCity}
              noOptionsText="No locations"
            />

            {/* Sub-location — enabled only after a location is picked */}
            <CustomDropdown
              options={sublocations}
              value={filterSubLocation?._id ?? null}
              onChange={opt => setFilterSubLocation(opt)}
              placeholder="Sub-location"
              loading={loadingSubLocation}
              disabled={!filterLocation}
              noOptionsText="No sub-locations"
            />
          </div>
        </div>

        {/* ── Select-all row ───────────────────────────────────────────── */}
        {!loading && filtered.length > 0 && (
          <div
            className="flex items-center gap-2.5 px-5 py-2 border-t border-b border-gray-100 flex-shrink-0 cursor-pointer"
            style={{
              background:
                someSelected || allSelected ? '#f0f9ff' : '#fafafa',
            }}
            onClick={toggleAll}
          >
            <CheckboxIcon
              checked={allSelected}
              indeterminate={someSelected}
            />
            <span className="text-[11.5px] font-semibold text-gray-600 select-none">
              {allSelected ? 'Deselect all' : 'Select all'}
            </span>
            <span className="ml-auto text-[10.5px] font-medium text-gray-400">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* ── List ─────────────────────────────────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#e2e8f0 transparent',
          }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-14 gap-2.5">
              <Spinner className="w-6 h-6 text-[var(--color-primary-light)] border-t-[var(--color-primary)]" />
              <p className="text-[12px] text-gray-400">
                Loading customers…
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-2">
              {/* Empty state — show context-aware hint */}
              <svg
                className="w-8 h-8 text-gray-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" strokeWidth={1.5} />
                <path
                  d="m21 21-4.35-4.35"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              </svg>
              <p className="text-[12px] text-gray-400">
                No customers found
              </p>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-[11px] font-semibold cursor-pointer transition-colors"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {visibleFiltered.map(c => {
                const isSelected = selected.has(c._id);
                const alreadyIn = existingIds.has(c._id);
                return (
                  <li
                    key={c._id}
                    onClick={() => !alreadyIn && toggleOne(c._id)}
                    className="flex items-center cursor-pointer gap-3 px-5 py-3 transition-colors"
                    style={{
                      background: isSelected ? '#f0f9ff' : 'transparent',
                      cursor: alreadyIn ? 'default' : 'pointer',
                      opacity: alreadyIn ? 0.5 : 1,
                    }}
                    onMouseEnter={e => {
                      if (!alreadyIn && !isSelected)
                        (
                          e.currentTarget as HTMLElement
                        ).style.background = '#f8fafc';
                    }}
                    onMouseLeave={e => {
                      if (!isSelected)
                        (
                          e.currentTarget as HTMLElement
                        ).style.background = isSelected
                            ? '#f0f9ff'
                            : 'transparent';
                    }}
                  >
                    <CheckboxIcon checked={isSelected} />
                    <MiniAvatar name={c.Name} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[12px] font-semibold text-gray-800 truncate">
                          {c.Name || '—'}
                        </p>
                        {alreadyIn && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200">
                            Already added
                          </span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-gray-400 mt-0.5 truncate">
                        {c.ContactNumber || c.Email || '—'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {c.Campaign && (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700">
                            {c.Campaign}
                          </span>
                        )}
                        {c.Type && (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                            {c.Type}
                          </span>
                        )}
                        {c.SubType && (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                            {c.SubType}
                          </span>
                        )}
                        {(c.City) && (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-violet-50 text-violet-700">
                            {c.City}
                          </span>
                        )}
                        {(c.Location) && (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-violet-50 text-violet-700">
                            {c.Location}
                          </span>
                        )}
                        {c.SubLocation && (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-violet-50 text-violet-700">
                            {c.SubLocation}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {hasMore && (
            <button
              onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
              className="w-full cursor-pointer py-2.5 text-[11px] font-medium border-t border-gray-100 transition-colors text-gray-400 hover:text-[var(--color-primary)] hover:bg-gray-50"
            >
              Load {Math.min(PAGE_SIZE, remaining)} more
              <span className="text-gray-300">
                {' '}
                ({remaining} remaining)
              </span>
            </button>
          )}
        </div>

        {/* ── Footer / Action Bar ──────────────────────────────────────── */}
        <div
          className="flex-shrink-0 border-t border-gray-100 px-5 py-4"
          style={{ background: '#fafafa' }}
        >
          {/* Status row */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-[10.5px] font-semibold text-gray-500 flex-shrink-0">
              Add as:
            </span>
            {STATUS_OPTIONS.map(s => {
              const active = status === s;
              return (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className="flex items-center cursor-pointer gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all duration-150"
                  style={
                    active
                      ? {
                        background: '#0f172a',
                        color: '#fff',
                        borderColor: '#0f172a',
                      }
                      : {
                        background: '#fff',
                        color: '#64748b',
                        borderColor: '#e2e8f0',
                      }
                  }
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{
                      background: active
                        ? 'rgba(255,255,255,0.6)'
                        : undefined,
                    }}
                  />
                  {STATUS_LABEL[s]}
                </button>
              );
            })}
          </div>

          {/* Submit row */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl cursor-pointer text-[12px] font-semibold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selected.size === 0 || submitting}
              className="flex-1 py-2.5 rounded-xl cursor-pointer text-[12px] font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'var(--color-primary)',
                boxShadow:
                  selected.size > 0
                    ? '0 4px 12px rgba(2,132,199,0.3)'
                    : 'none',
              }}
            >
              {submitting ? (
                <Spinner className="w-3.5 h-3.5 border-white border-t-transparent/30" />
              ) : successMsg ? (
                <>
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="white"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {successMsg}
                </>
              ) : (
                <>
                  <PlusIcon />
                  {selected.size > 0
                    ? `Add ${selected.size} lead${selected.size !== 1 ? 's' : ''}`
                    : 'Select leads'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes sheet-up {
          from { transform: translateY(24px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
};



// ─── LeadDetailView (unchanged) ────────────────────────────────────────────────

const LeadDetailView: React.FC<{ item: ShortlistItem; onBack: () => void }> = ({ item, onBack }) => {
  const tempKey = (item.LeadTemperature || 'cold').toLowerCase();
  const tempConf = TEMP_STYLE[tempKey] ?? TEMP_STYLE['cold'];
  const locationParts = [cleanValue(item.SubLocation), cleanValue(item.Location), cleanValue(item.City)].filter(p => p !== '—');
  const fullLocation = locationParts.length > 0 ? locationParts.join(', ') : '—';
  const { getLabel } = useCustomerFieldLabel();

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center bg-gray-50/50 sticky top-0 z-10">
        <button
          onClick={onBack}
          className="flex items-center cursor-pointer gap-2 text-sm font-medium text-gray-600 hover:text-[var(--color-primary)] transition-colors"
        >
          <ArrowLeftIcon />
          Back to Shortlist
        </button>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0 text-white text-lg font-bold shadow-sm">
            {initials(item.customerName)}
          </div>
          <div className="pt-1">
            <h3 className="text-xl font-bold text-gray-900 leading-none">
              {item.customerName === 'N/A' || !item.customerName ? 'Unnamed Lead' : item.customerName}
            </h3>
            <div className="flex items-center flex-wrap gap-2 mt-2.5">
              {item.Campaign && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide bg-[var(--color-primary)] text-white shadow-sm">
                  {item.Campaign.toUpperCase()}
                </span>
              )}
              <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${tempConf.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tempConf.dot}`} />
                {cap(tempKey)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-xl">
          {getLabel("CustomerImage", "Customer Images") && (
            <span className="block mb-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              {getLabel("CustomerImage", "Customer Image")}
            </span>
          )}
          <ImageSlider images={item.CustomerImage} height="h-60" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
            <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Contact</span>
            <span className="text-sm font-medium text-gray-800">{cleanValue(item.ContactNumber)}</span>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
            <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Property Type</span>
            <span className="text-sm font-medium text-gray-800">
              {cleanValue(item.CustomerType)} {item.CustomerSubType && item.CustomerSubType !== 'Other' ? `· ${item.CustomerSubType}` : ''}
            </span>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
            <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Location</span>
            <span className="text-sm font-medium text-gray-800">{fullLocation}</span>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
            <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Price</span>
            <span className="text-sm font-medium text-gray-800">{cleanValue(item.Price)}</span>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 sm:col-span-2">
            <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Full Address</span>
            <span className="text-sm font-medium text-gray-800">{cleanValue(item.Adderess)}</span>
          </div>
        </div>

        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-600">Description / Requirements</span>
          </div>
          <div className="p-4 bg-white">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {cleanValue(item.Description)}
            </p>
          </div>
        </div>

        {item.SitePlan && item.SitePlan.length > 0 && (
          <div>
            {getLabel("SitePlan", "Site Plan") && (
              <span className="block text-[10px] mb-3 font-semibold text-gray-400 uppercase tracking-wider mb-1">
                {getLabel("SitePlan", "Site Plan")}
              </span>
            )}
            <ImageSlider images={item.SitePlan} height="h-60" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between sticky bottom-0 text-[12px] bg-gray-100 text-gray-500 px-4 py-4 border-t border-gray-100">
        <span className="flex items-center gap-1">
          <span className="flex items-center justify-center gap-1 text-[var(--color-primary)]">
            <MdSource className="-mt-0.5" /> Source:
          </span>
          <span>{cleanValue(item.ReferenceId)}</span>
        </span>
        <span>Added: {fmt(item.createdAt)}</span>
      </div>
    </div>
  );
};

// ─── LeadCard (unchanged) ───────────────────────────────────────────────────────

interface LeadCardProps {
  item: ShortlistItem;
  onStatusChange: (id: string, status: ShortlistStatus) => void;
  onRemove: (id: string) => void;
  onFollowup?: () => void;
  onViewDetails: (item: ShortlistItem) => void;
  isUpdating: boolean;
  isRemoving: boolean;
}


const LeadCard: React.FC<LeadCardProps> = ({
  item, onStatusChange, onRemove, onViewDetails, onFollowup, isUpdating, isRemoving,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const id = item.id || item._id;
  const si = item._shortlistInfo;
  const tempKey = (item.LeadTemperature || 'cold').toLowerCase();
  const tempConf = TEMP_STYLE[tempKey] ?? TEMP_STYLE['cold'];
  const statusConf = STATUS_STYLE[si?.status as ShortlistStatus] ?? STATUS_STYLE['pending'];
  const assignee = item.AssignTo?.[0];

  return (
    <li className="rounded-xl border border-[var(--color-primary-light)] bg-white hover:shadow-md transition-all overflow-hidden group">
      <div className={`h-1 w-full ${statusConf.dot}`} />

      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0 text-white text-xs font-bold select-none">
            {initials(item.customerName)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-800 truncate max-w-[160px]">
                {item.customerName === 'N/A' || !item.customerName ? 'Unnamed' : item.customerName}
              </span>
              {item.Campaign && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-[var(--color-primary-lighter)] text-[var(--color-primary)] border border-[var(--color-primary-light)]">
                  {item.Campaign}
                </span>
              )}
            </div>
            {item.ContactNumber && (
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <PhoneIcon />
                {item.ContactNumber}
              </p>
            )}
          </div>

          <button
            onClick={() => onViewDetails(item)}
            aria-label="View full details"
            title="View full details"
            className="w-7 h-7 rounded-lg cursor-pointer flex items-center justify-center flex-shrink-0 text-gray-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-lighter)] transition-colors"
          >
            <EyeIcon />
          </button>
          <button
            className="w-7 h-7 rounded-lg cursor-pointer flex items-center justify-center flex-shrink-0 text-gray-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-lighter)] transition-colors"

            onClick={onFollowup}
          >
            <MdAdd />
          </button>
        </div>

        <div className="flex items-center flex-wrap gap-1.5 mb-3">
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${tempConf.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tempConf.dot}`} />
            {cap(tempKey)}
          </span>

          {item.DealClosed && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border border-emerald-200 text-emerald-700 bg-emerald-50">
              <CheckIcon />
              Deal Closed
            </span>
          )}

          {assignee?.name && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border border-gray-200 text-gray-600 bg-gray-50">
              <UserIcon />
              {assignee.name}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 gap-2">
          <span className="text-[10px] text-gray-400 min-w-0 truncate">
            Saved {fmt(si?.savedAt)}
          </span>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="relative flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusConf.dot}`} />
              <select
                value={si?.status ?? 'pending'}
                onChange={e => onStatusChange(id, e.target.value as ShortlistStatus)}
                disabled={isUpdating || isRemoving || confirmDelete}
                className="text-xs text-gray-700 bg-white border border-[var(--color-primary-light)] rounded-lg px-2 py-1.5 pr-6 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-50 cursor-pointer appearance-none"
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{cap(s)}</option>
                ))}
              </select>
              {isUpdating && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80">
                  <Spinner className="w-3 h-3 border-t-[var(--color-primary)]" />
                </div>
              )}
            </div>

            {!confirmDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={isRemoving}
                aria-label="Remove lead"
                title="Remove from shortlist"
                className="w-7 h-7 rounded-lg cursor-pointer flex items-center justify-center flex-shrink-0 text-gray-400 hover:text-[var(--color-destructive)] hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {isRemoving ? <Spinner className="w-3 h-3 border-t-red-400" /> : <TrashIcon />}
              </button>
            )}
          </div>
        </div>
      </div>

      {confirmDelete && (
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-red-50 border-t border-red-100">
          <span className="text-xs text-red-600 font-medium select-none">Remove from list?</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setConfirmDelete(false)}
              disabled={isRemoving}
              className="px-2.5 py-1 rounded-lg cursor-pointer text-xs text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onRemove(id)}
              disabled={isRemoving}
              className="px-2.5 py-1 rounded-lg cursor-pointer text-xs text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {isRemoving && <Spinner className="w-3 h-3 border-t-white/40" />}
              {isRemoving ? 'Removing…' : 'Remove'}
            </button>
          </div>
        </div>
      )}
    </li>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────────

const ShortlistManagerPopup: React.FC<ShortlistManagerPopupProps> = ({
  isOpen,
  onClose,
  customerId,
  customerName,
  onViewDetails,
}) => {
  const [shortlist, setShortlist] = useState<ShortlistItem[]>([]);
  const [fetchState, setFetchState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [isMaximized, setIsMaximized] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ShortlistStatus | 'all'>('all');
  const [selectedLead, setSelectedLead] = useState<ShortlistItem | null>(null);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [removing, setRemoving] = useState<Record<string, boolean>>({});
  const [isFollowupOpen, setIsFollowupOpen] = useState(false);
  const [selectedCustomerFollowupId, setSelectedCustomerFollowupId] = useState<string | null>(null);

  // ── NEW: add-manually dialog ──
  const [showAddDialog, setShowAddDialog] = useState(false);

  const fetchShortlist = useCallback(async () => {
    setFetchState('loading');
    const res = await getShortlist(customerId);
    if (res !== null) {
      setShortlist(normalizeShortlist(res.data ?? res));
      setFetchState('idle');
    } else {
      setFetchState('error');
    }
  }, [customerId]);

  useEffect(() => {
    if (isOpen) {
      setIsMaximized(true);
      setSelectedLead(null);
      setActiveFilter('all');
      setShowAddDialog(false);
      fetchShortlist();
    }
  }, [isOpen, fetchShortlist]);

  const handleStatusChange = async (itemId: string, status: ShortlistStatus) => {
    setUpdating(p => ({ ...p, [itemId]: true }));
    const res = await updateShortlist({ customerId, propertyIds: [itemId], status });
    if (res !== null) {
      setShortlist(list =>
        list.map(item =>
          (item.id === itemId || item._id === itemId)
            ? { ...item, _shortlistInfo: { ...item._shortlistInfo, status } }
            : item
        )
      );
    }
    setUpdating(p => ({ ...p, [itemId]: false }));
  };

  const handleRemove = async (itemId: string) => {
    setRemoving(p => ({ ...p, [itemId]: true }));
    const res = await removeShortlist({ customerId, propertyIds: [itemId] });
    if (res !== null) {
      setShortlist(list => list.filter(item => item.id !== itemId && item._id !== itemId));
      if (selectedLead && (selectedLead.id === itemId || selectedLead._id === itemId)) {
        setSelectedLead(null);
      }
    }
    setRemoving(p => { const n = { ...p }; delete n[itemId]; return n; });
  };

  const handleViewDetails = (item: ShortlistItem) => {
    if (onViewDetails) onViewDetails(item.id || item._id, item);
    else setSelectedLead(item);
  };

  const addFollowupFromDialogue = (id: string) => {
    setSelectedCustomerFollowupId(id)
    setIsFollowupOpen(true);
  };

  const filteredShortlist = shortlist.filter(item =>
    activeFilter === 'all' ? true : item._shortlistInfo?.status === activeFilter
  );

  // IDs already in the shortlist (to flag in the add dialog)
  const existingIds = useMemo(
    () => new Set(shortlist.map(item => item.id || item._id)),
    [shortlist]
  );

  const wrapperCls = isMaximized
    ? 'fixed inset-0 z-[60] bg-white flex flex-col overflow-hidden'
    : 'bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col overflow-hidden relative';
  const wrapperStyle = isMaximized ? undefined : { maxHeight: '90dvh', height: '800px' };
  const bodyContentCls = isMaximized ? 'max-w-[1500px] mx-auto w-full' : '';
  const listCls = isMaximized
    ? 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    : 'space-y-4';

  return (
    <PopupMenu isOpen={isOpen} onClose={onClose}>
      <div
        className={wrapperCls}
        style={wrapperStyle}
        onClick={e => e.stopPropagation()}
      >

        <FollowupAddDialog
          isOpen={isFollowupOpen}
          customerId={selectedCustomerFollowupId}
          onClose={() => {
            setIsFollowupOpen(false)
            setSelectedCustomerFollowupId(null)
          }}
        />

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 bg-[var(--color-primary)] flex-shrink-0 z-20">
          <div>
            <h2 className="text-white font-semibold text-base leading-tight tracking-wide">
              {selectedLead ? 'Lead Details' : 'Recommended Leads Shortlist'}
            </h2>
            <div className="mt-1.5 flex items-center text-xs text-[var(--color-primary-light)]">
              {!selectedLead ? (
                <div className="flex items-center gap-1.5">
                  <span className="bg-white/20 text-white px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    AI Suggested
                  </span>
                  <span className="opacity-90">
                    for <span className="font-medium text-white">{customerName || 'this customer'}</span>
                  </span>
                </div>
              ) : (
                <span className="opacity-90">Viewing full profile details</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMaximized(v => !v)}
              aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
              className="w-8 h-8 rounded-full cursor-pointer flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
            >
              {isMaximized ? <VscChromeMinimize /> : <MaximizeIcon />}
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-full cursor-pointer flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
            >
              <XIcon />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-hidden relative bg-gray-50/30">
          {selectedLead ? (
            <LeadDetailView item={selectedLead} onBack={() => setSelectedLead(null)} />
          ) : (
            <div className={`p-5 h-full overflow-y-auto hide-scrollbar ${bodyContentCls}`}>

              {fetchState === 'loading' && (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Spinner className="w-8 h-8 text-[var(--color-primary-light)] border-t-[var(--color-primary)]" />
                  <p className="text-sm text-gray-400">Loading shortlist…</p>
                </div>
              )}

              {fetchState === 'error' && (
                <div className="py-20 flex flex-col items-center gap-3">
                  <svg className="w-10 h-10 text-[var(--color-destructive)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm text-gray-500">Could not load the shortlist.</p>
                  <button onClick={fetchShortlist} className="text-xs text-[var(--color-primary)] cursor-pointer underline underline-offset-2">
                    Try again
                  </button>
                </div>
              )}

              {fetchState === 'idle' && shortlist.length === 0 && (
                <div className="py-20 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-[var(--color-primary-lighter)] flex items-center justify-center">
                    <svg className="w-8 h-8 text-[var(--color-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">No leads shortlisted yet.</p>
                  <button
                    onClick={() => setShowAddDialog(true)}
                    className="flex items-center cursor-pointer gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold text-white transition-all"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    <PlusIcon />
                    Add leads manually
                  </button>
                </div>
              )}

              {fetchState === 'idle' && shortlist.length > 0 && (
                <>
                  {/* Status filter tabs */}
                  <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-4 mb-2 scrollbar-hide flex-shrink-0">
                    <button
                      onClick={() => setActiveFilter('all')}
                      className={`px-3 py-1.5 rounded-full cursor-pointer text-xs font-medium whitespace-nowrap transition-colors border ${activeFilter === 'all'
                        ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      All Leads ({shortlist.length})
                    </button>
                    {STATUS_OPTIONS.map(status => {
                      const count = shortlist.filter(i => i._shortlistInfo?.status === status).length;
                      return (
                        <button
                          key={status}
                          onClick={() => setActiveFilter(status)}
                          className={`px-3 py-1.5 rounded-full cursor-pointer text-xs font-medium whitespace-nowrap transition-colors border ${activeFilter === status
                            ? 'bg-gray-800 text-white border-gray-800 shadow-sm'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                          {cap(status)} {count > 0 && `(${count})`}
                        </button>
                      );
                    })}
                  </div>

                  {filteredShortlist.length === 0 ? (
                    <div className="py-12 flex flex-col items-center gap-3">
                      <p className="text-sm text-gray-400">No leads match this status.</p>
                      <button
                        onClick={() => setActiveFilter('all')}
                        className="text-xs text-[var(--color-primary)] cursor-pointer font-medium bg-[var(--color-primary-lighter)] px-3 py-1.5 rounded-lg hover:bg-[var(--color-primary-light)] transition-colors"
                      >
                        Clear Filter
                      </button>
                    </div>
                  ) : (
                    <ul className={listCls}>
                      {filteredShortlist.map(item => {
                        const id = item.id || item._id;
                        return (
                          <LeadCard
                            key={id}
                            item={item}
                            onStatusChange={handleStatusChange}
                            onRemove={handleRemove}
                            onViewDetails={handleViewDetails}
                            onFollowup={() => {
                              setSelectedCustomerFollowupId(id);
                              setIsFollowupOpen(true);
                            }}
                            isUpdating={!!updating[id]}
                            isRemoving={!!removing[id]}
                          />
                        );
                      })}
                    </ul>
                  )}
                </>
              )}

            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {!selectedLead && fetchState !== 'loading' && (
          <div className="px-5 py-3 border-t border-gray-200 bg-white flex items-center justify-between flex-shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
            <span className="text-xs font-medium text-gray-500">
              {shortlist.length > 0
                ? `Showing ${filteredShortlist.length} of ${shortlist.length} lead${shortlist.length !== 1 ? 's' : ''}`
                : 'No leads yet'}
            </span>

            <div className="flex items-center gap-2">
              {/* ── ADD MANUALLY BUTTON ── */}
              <button
                onClick={() => setShowAddDialog(true)}
                className="flex items-center cursor-pointer gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-semibold border transition-all hover:shadow-sm"
                style={{
                  background: 'var(--color-primary)',
                  borderColor: 'var(--color-primary)',
                  color: '#fff',
                }}
              >
                <PlusIcon />
                Add Manually
              </button>

              {shortlist.length > 0 && (
                <button
                  onClick={fetchShortlist}
                  className="text-xs font-medium text-[var(--color-primary)] cursor-pointer flex items-center gap-1.5 hover:underline underline-offset-2"
                >
                  <RefreshIcon />
                  Refresh
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Add Manually Dialog ── */}
      <AddManuallyDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        customerId={customerId}
        existingIds={existingIds}
        onAdded={fetchShortlist}
      />
    </PopupMenu>
  );
};

export default ShortlistManagerPopup;