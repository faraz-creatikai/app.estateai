'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getCustomer } from '@/store/customer';
import { getCampaign } from '@/store/masters/campaign/campaign';
import { getTypesByCampaign } from '@/store/masters/types/types';
import { getSubtypeByCampaignAndType } from '@/store/masters/subtype/subtype';
import { getCity } from '@/store/masters/city/city';
import { getLocationByCity } from '@/store/masters/location/location';
import { getsubLocationByCityLoc } from '@/store/masters/sublocation/sublocation';
import CustomDropdown, { DropdownOption } from '../CustomDropdown';
import { whatsappProperties } from '@/store/masters/whatsapp/whatsapp';
import { FaWhatsapp } from 'react-icons/fa';



// ─── Interfaces ───────────────────────────────────────────────────────────────
export interface SendPropertiesWhatsAppPopupProps {
  isOpen: boolean;
  onClose: () => void;
  customerIds: string[]; // The targeted customers who will receive the WhatsApp messages
}

const PAGE_SIZE = 20;

// ─── Icons & Helpers ──────────────────────────────────────────────────────────
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
const Spinner = ({ className = '' }: { className?: string }) => (
  <div className={`rounded-full border-2 border-current border-t-transparent animate-spin ${className}`} />
);
const CheckboxIcon = ({ checked, indeterminate }: { checked: boolean; indeterminate?: boolean }) => (
  <div
    className="w-4 h-4 rounded-[4px] flex items-center justify-center flex-shrink-0 transition-all duration-150"
    style={{
      background: checked ? 'var(--color-primary)' : indeterminate ? '#bae6fd' : '#fff',
      border: checked ? '2px solid var(--color-primary)' : indeterminate ? '2px solid var(--color-primary)' : '2px solid #cbd5e1',
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

const WhatsAppIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    className={`block ${className}`}
    viewBox="-3 -3 30 30"
    fill="none"
    style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.18))' }}
  >
    {/* Bubble with white outline ring */}
    <path
      fill="#25D366"
      stroke="#FFFFFF"
      strokeWidth="4"
      strokeLinejoin="round"
      strokeLinecap="round"
      style={{ paintOrder: 'stroke fill' }}
      d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.36.101 11.943c0 2.11.549 4.166 1.595 5.986L0 24l6.335-1.652a11.882 11.882 0 0 0 5.71 1.442h.006c6.582 0 11.94-5.36 11.943-11.943a11.87 11.87 0 0 0-3.474-8.398"
    />
    {/* Phone handset */}
    <path
      fill="#FFFFFF"
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"
    />
  </svg>
);
// ─── Main Component ───────────────────────────────────────────────────────────
const SendPropertiesWhatsAppPopup: React.FC<SendPropertiesWhatsAppPopupProps> = ({
  isOpen,
  onClose,
  customerIds,
}) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Filters State
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

  const activeFilterCount =
    (filterCampaign ? 1 : 0) + (filterType ? 1 : 0) + (filterSubType ? 1 : 0) +
    (filterCity ? 1 : 0) + (filterLocation ? 1 : 0) + (filterSubLocation ? 1 : 0);

  const clearAllFilters = () => {
    setFilterCampaign(null); setFilterType(null); setFilterSubType(null);
    setFilterCity(null); setFilterLocation(null); setFilterSubLocation(null);
  };

  // ─── Initial Data Load ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    setSearch('');
    setSelected(new Set());
    setSuccessMsg('');
    setVisibleCount(PAGE_SIZE);
    clearAllFilters();
    setProperties([]);

    const loadData = async () => {
      setLoading(true);
      try {
        const res: any = await getCustomer();
        if (res) {
          // We keep the ENTIRE object here so we have all payload requirements
          // (Description, CustomerImage, SitePlan, Area, Price, etc.)
          setProperties(Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []));
        }
      } finally {
        setLoading(false);
        setTimeout(() => searchRef.current?.focus(), 60);
      }
    };

    const loadMasters = async () => {
      setLoadingCampaigns(true);
      setLoadingCity(true);
      try {
        const [campRes, cityRes] = await Promise.all([getCampaign(), getCity()]);
        if (campRes) setCampaigns(campRes.map((c: any) => ({ _id: c._id, Name: c.Name })));
        if (cityRes) setCitys(cityRes.map((c: any) => ({ _id: c._id, Name: c.Name })));
      } finally {
        setLoadingCampaigns(false);
        setLoadingCity(false);
      }
    };

    loadData();
    loadMasters();
  }, [isOpen]);

  // ─── Cascading Dropdown Handlers (Campaign -> Type -> SubType) ──────────────
  useEffect(() => {
    setFilterType(null); setFilterSubType(null); setTypes([]); setSubtypes([]);
    if (!filterCampaign) return;
    const load = async () => {
      setLoadingTypes(true);
      try {
        const res = await getTypesByCampaign(filterCampaign._id);
        if (res) setTypes(res.map((t: any) => ({ _id: t._id, Name: t.Name })));
      } finally { setLoadingTypes(false); }
    };
    load();
  }, [filterCampaign]);

  useEffect(() => {
    setFilterSubType(null); setSubtypes([]);
    if (!filterCampaign || !filterType) return;
    const load = async () => {
      setLoadingSubtypes(true);
      try {
        const res = await getSubtypeByCampaignAndType(filterCampaign._id, filterType._id);
        if (res) setSubtypes(res.map((s: any) => ({ _id: s._id, Name: s.Name })));
      } finally { setLoadingSubtypes(false); }
    };
    load();
  }, [filterType, filterCampaign]);

  // ─── Cascading Dropdown Handlers (City -> Location -> SubLocation) ──────────
  useEffect(() => {
    setFilterLocation(null); setFilterSubLocation(null); setLocations([]); setSublocations([]);
    if (!filterCity) return;
    const load = async () => {
      setLoadingLocation(true);
      try {
        const res = await getLocationByCity(filterCity._id);
        if (res) setLocations(res.map((t: any) => ({ _id: t._id, Name: t.Name })));
      } finally { setLoadingLocation(false); }
    };
    load();
  }, [filterCity]);

  useEffect(() => {
    setFilterSubLocation(null); setSublocations([]);
    if (!filterCity || !filterLocation) return;
    const load = async () => {
      setLoadingSubLocation(true);
      try {
        const res = await getsubLocationByCityLoc(filterCity._id, filterLocation._id);
        if (res) setSublocations(res.map((s: any) => ({ _id: s._id, Name: s.Name })));
      } finally { setLoadingSubLocation(false); }
    };
    load();
  }, [filterLocation, filterCity]);

  // ─── Filter Logic ─────────────────────────────────────────────────────────────
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, filterCampaign, filterType, filterSubType, filterCity, filterLocation, filterSubLocation]);

  const filtered = useMemo(() => {
    let result = properties;

    if (filterCampaign) result = result.filter(c => c.Campaign === filterCampaign.Name);
    if (filterType) result = result.filter(c => c.CustomerType === filterType.Name);
    if (filterSubType) result = result.filter(c => c.CustomerSubType === filterSubType.Name);
    if (filterCity) result = result.filter(c => c.City === filterCity.Name);
    if (filterLocation) result = result.filter(c => c.Location === filterLocation.Name);
    if (filterSubLocation) result = result.filter(c => c.SubLocation === filterSubLocation.Name);

    if (!search.trim()) return result;
    const q = search.toLowerCase();
    return result.filter(c =>
      c.customerName?.toLowerCase().includes(q) ||
      c.Campaign?.toLowerCase().includes(q) ||
      c.CustomerType?.toLowerCase().includes(q) ||
      c.Location?.toLowerCase().includes(q)
    );
  }, [properties, search, filterCampaign, filterType, filterSubType, filterCity, filterLocation, filterSubLocation]);

  const visibleFiltered = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const remaining = filtered.length - visibleCount;

  const allSelected = filtered.length > 0 && filtered.every(c => selected.has(c._id));
  const someSelected = filtered.some(c => selected.has(c._id)) && !allSelected;

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

  // ─── Submission Logic ─────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (selected.size === 0 || submitting) return;
    setSubmitting(true);
    
    try {
      // 1. Grab the full objects for the selected properties
      const payloadProperties = properties.filter(p => selected.has(p._id));
      
      // 2. Build the payload structrue matching the new controller
      const payload = {
        properties: payloadProperties,
        customerIds: customerIds, 
        sendToAll: customerIds.length === 0 // Fail-safe fallback if needed
      };

      // 3. Fire the API
      const result = await whatsappProperties(payload);

      if (result?.success) {
        setSuccessMsg(`Sending ${selected.size} properties!`);
        setTimeout(() => {
          setSuccessMsg('');
          setSelected(new Set());
          onClose();
        }, 1500);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-xl bg-white flex flex-col overflow-hidden"
        style={{
          borderRadius: '20px 20px 0 0',
          maxHeight: '94dvh',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
          animation: 'sheet-up 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        {/* ── Header ── */}
<div className="flex items-center justify-between px-5 pt-5 pb-4 flex-shrink-0 relative overflow-hidden">
  {/* subtle brand-tinted glow in the corner */}
  <div
    className="absolute -top-8 -left-8 w-32 h-32 rounded-full opacity-[0.07] pointer-events-none"
    style={{ background: 'radial-gradient(circle, #25D366 0%, transparent 70%)' }}
  />

  <div className="flex items-center gap-2 relative">
    {/* Icon badge */}
<WhatsAppIcon className="w-10 h-10 " />

    <div>
      <h3 className="text-[16px] font-bold text-gray-900 leading-tight tracking-tight">
        Send Properties via WhatsApp
      </h3>
      <p className="text-[12px] text-gray-400 mt-0.5 flex items-center gap-1">
        Forwarding to
        <span className="font-semibold text-gray-600">{customerIds.length}</span>
        customer{customerIds.length === 1 ? '' : 's'}
      </p>
    </div>
  </div>

  <button
    onClick={onClose}
    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer flex-shrink-0 relative"
  >
    <XIcon />
  </button>
</div>

        {/* ── Search Bar ── */}
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
              placeholder="Search property names, locations, types…"
              className="w-full pl-9 pr-4 py-2.5 text-[13px] rounded-xl border outline-none transition-all bg-gray-50 border-gray-200 focus:bg-white focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 text-gray-800"
            />
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="px-5 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Filters
            </span>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md transition-colors cursor-pointer text-[var(--color-primary)] bg-[var(--color-primary-lighter)] hover:bg-[var(--color-primary-light)]"
              >
                Clear All ({activeFilterCount})
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <CustomDropdown options={campaigns} value={filterCampaign?._id ?? null} onChange={opt => setFilterCampaign(opt)} placeholder="Campaign" loading={loadingCampaigns} />
            <CustomDropdown options={types} value={filterType?._id ?? null} onChange={opt => setFilterType(opt)} placeholder="Type" loading={loadingTypes} disabled={!filterCampaign} />
            <CustomDropdown options={subtypes} value={filterSubType?._id ?? null} onChange={opt => setFilterSubType(opt)} placeholder="Sub-type" loading={loadingSubtypes} disabled={!filterType} />
            
            <CustomDropdown options={citys} value={filterCity?._id ?? null} onChange={opt => setFilterCity(opt)} placeholder="City" loading={loadingCity} />
            <CustomDropdown options={locations} value={filterLocation?._id ?? null} onChange={opt => setFilterLocation(opt)} placeholder="Location" loading={loadingLocation} disabled={!filterCity} />
            <CustomDropdown options={sublocations} value={filterSubLocation?._id ?? null} onChange={opt => setFilterSubLocation(opt)} placeholder="Sub-location" loading={loadingSubLocation} disabled={!filterLocation} />
          </div>
        </div>

        {/* ── Select All Row ── */}
        {!loading && filtered.length > 0 && (
          <div
            className="flex items-center gap-2.5 px-5 py-2.5 border-t border-b border-gray-100 flex-shrink-0 cursor-pointer transition-colors"
            style={{ background: someSelected || allSelected ? '#f0f9ff' : '#fafafa' }}
            onClick={toggleAll}
          >
            <CheckboxIcon checked={allSelected} indeterminate={someSelected} />
            <span className="text-[12px] font-semibold text-gray-700 select-none">
              {allSelected ? 'Deselect all properties' : 'Select all properties'}
            </span>
            <span className="ml-auto text-[11px] font-medium text-gray-400">
              {filtered.length} available
            </span>
          </div>
        )}

        {/* ── List Area ── */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Spinner className="w-7 h-7 text-[var(--color-primary-light)] border-t-[var(--color-primary)]" />
              <p className="text-[13px] text-gray-400">Loading properties…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <p className="text-[13px] text-gray-400">No properties found.</p>
              {activeFilterCount > 0 && (
                <button onClick={clearAllFilters} className="text-[12px] font-semibold text-[var(--color-primary)] cursor-pointer">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {visibleFiltered.map(c => {
                const isSelected = selected.has(c._id);
                return (
                  <li
                    key={c._id}
                    onClick={() => toggleOne(c._id)}
                    className="flex items-center cursor-pointer gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50"
                    style={{ background: isSelected ? '#f0f9ff' : 'transparent' }}
                  >
                    <CheckboxIcon checked={isSelected} />
                    
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-lighter)] text-[var(--color-primary)] flex items-center justify-center font-bold text-[12px] flex-shrink-0">
                      {c.customerName?.charAt(0).toUpperCase() || 'P'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[13px] font-semibold text-gray-800 truncate">
                          {c.customerName || 'Unnamed Property'}
                        </p>
                        <span className="text-[11px] font-bold text-gray-700">
                           {c.Price || ''}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {c.Campaign && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700">
                            {c.Campaign}
                          </span>
                        )}
                        {c.CustomerType && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                            {c.CustomerType}
                          </span>
                        )}
                        {(c.Location || c.City) && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-violet-50 text-violet-700 truncate max-w-[140px]">
                            📍 {c.Location || c.City}
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
              className="w-full cursor-pointer py-3 text-[12px] font-medium border-t border-gray-100 transition-colors text-gray-500 hover:text-[var(--color-primary)] hover:bg-gray-50"
            >
              Load {Math.min(PAGE_SIZE, remaining)} more ({remaining} left)
            </button>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 border-t border-gray-100 px-5 py-4 bg-[#fafafa]">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl cursor-pointer text-[13px] font-semibold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
           <button
  onClick={handleSubmit}
  disabled={selected.size === 0 || submitting}
  className="flex-[2] py-3 rounded-xl cursor-pointer text-[13px] font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
  style={{
    background: 'var(--color-primary)',
    boxShadow: selected.size > 0 ? '0 4px 12px rgba(2,132,199,0.3)' : 'none',
  }}
>
  {submitting ? (
    <Spinner className="w-4 h-4 border-white border-t-transparent/30" />
  ) : successMsg ? (
    successMsg
  ) : (
    <>
      <FaWhatsapp size={18}/>
      Send {selected.size} Properties via WhatsApp
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

export default SendPropertiesWhatsAppPopup;