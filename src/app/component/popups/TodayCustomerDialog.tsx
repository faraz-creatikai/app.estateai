'use client';
import React, { useState } from 'react';
import PopupMenu from './PopupMenu';
import { customerGetDataInterface } from '@/store/customer.interface';
import { IoMdClose } from 'react-icons/io';
import { MdDelete, MdDeleteSweep, MdEdit } from 'react-icons/md';
import { HiCalendar, HiUser, HiLocationMarker } from 'react-icons/hi';
import { BsGridFill, BsListUl } from 'react-icons/bs';
import { IoCheckboxOutline } from 'react-icons/io5';

interface TodayCustomerDialogProps {
    isOpen: boolean;
    data: customerGetDataInterface[];
    onClose: () => void;
    onDelete?: (customer: customerGetDataInterface) => void;
    onEdit?: (customer: customerGetDataInterface) => void;
    onDeleteAll?: (ids: string[]) => void;
    isLoading?: boolean;
}

const TodayCustomerDialog = ({
    isOpen,
    data,
    onClose,
    onDelete,
    onEdit,
    onDeleteAll,
    isLoading = false,
}: TodayCustomerDialogProps) => {
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
    const toggleSelect = (id: string) => {
        setSelectedCustomers((prev) =>
            prev.includes(id)
                ? prev.filter((c) => c !== id)
                : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedCustomers.length === data.length) {
            setSelectedCustomers([]);
        } else {
            setSelectedCustomers(data.map((c) => c._id));
        }
    };

    if (!isOpen) return null;

    const today = new Date().toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
    const uniqueCustomerCount = new Set(
        data
            .map((c) => c.ContactNumber)
            .filter(Boolean) // remove null/undefined
    ).size;

    const duplicateCustomerCount = data.length - uniqueCustomerCount;

    return (
        <PopupMenu onClose={onClose} isOpen={isOpen}>

            {/* Shell */}
            <div className="w-full h-full flex flex-col overflow-hidden bg-[#f4f5f9] dark:bg-[var(--color-bgdark,#0d0f18)]">

                {/* ── HEADER ── */}
                <div className="relative flex-shrink-0 overflow-hidden bg-[var(--color-primary,#4f46e5)] px-7 pt-[22px]">

                    {/* decorative orbs */}
                    <div className="absolute -top-[50px] -right-[30px] w-[160px] h-[160px] rounded-full bg-white/7 pointer-events-none" />
                    <div className="absolute -bottom-[20px] -left-[50px] w-[200px] h-[100px] rounded-full bg-white/4 pointer-events-none" />

                    <div className="relative z-1">
                        {/* top row */}
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[10.5px] font-bold tracking-[0.13em] uppercase text-white/50 mb-[5px]">
                                    Dashboard · Entries
                                </p>
                                <h1 className="text-[24px] font-extrabold text-white tracking-[-0.025em] leading-none">
                                    Today's Customers
                                </h1>
                                <p className="text-[12.5px] text-white/55 mt-[5px]">{today}</p>
                            </div>

                            <button
                                onClick={onClose}
                                aria-label="Close"
                                className="flex-shrink-0 w-9 h-9 rounded-[10px] flex items-center justify-center text-white bg-white/12 border border-white/18 cursor-pointer transition-[background,transform] duration-200 hover:bg-white/22 hover:rotate-90"
                            >
                                <IoMdClose size={17} />
                            </button>
                        </div>

                        {/* stats strip */}
                        <div className="flex items-center gap-10 mt-[18px] pt-[14px] pb-[14px] border-t border-white/12">

                            {/* TOTAL */}
                            <div className="flex items-center gap-[10px]">
                                <span className="w-2 h-2 rounded-full bg-white/85 animate-pulse" />
                                <div>
                                    <div className="text-[22px] font-extrabold text-white leading-none">
                                        {data.length}
                                    </div>
                                    <div className="text-[11.5px] text-white/55">
                                        {data.length === 1 ? 'Customer' : 'Customers'} added
                                    </div>
                                </div>
                            </div>

                            {/* UNIQUE */}
                            <div className="flex items-center gap-[10px]">
                                <span className="w-2 h-2 rounded-full bg-green-300" />
                                <div>
                                    <div className="text-[22px] font-extrabold text-white leading-none">
                                        {uniqueCustomerCount}
                                    </div>
                                    <div className="text-[11.5px] text-white/55">
                                        Unique Contacts
                                    </div>
                                </div>
                            </div>

                            {/* DUPLICATES */}
                            <div className="flex items-center gap-[10px]">
                                <span className="w-2 h-2 rounded-full bg-red-300" />
                                <div>
                                    <div className="text-[22px] font-extrabold text-white leading-none">
                                        {duplicateCustomerCount}
                                    </div>
                                    <div className="text-[11.5px] text-white/55">
                                        Duplicate Contacts
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* ── TOOLBAR ── */}
                <div className="flex-shrink-0 flex items-center justify-between gap-3 px-6 py-3 bg-white dark:bg-[var(--color-childbgdark,#161922)] border-b border-black/6 dark:border-white/7">

                    {/* view toggle pill */}
                    <div className="flex bg-[#f1f2f6] dark:bg-white/6 rounded-[9px] p-[3px] gap-[2px]">
                        <button
                            onClick={() => setViewMode('table')}
                            title="Table view"
                            className={[
                                'w-8 h-[30px] rounded-[7px] flex items-center justify-center border-none cursor-pointer transition-all duration-150 text-[13px]',
                                viewMode === 'table'
                                    ? 'bg-white dark:bg-white/10 text-[var(--color-primary,#4f46e5)] shadow-[0_1px_4px_rgba(0,0,0,0.1)]'
                                    : 'bg-transparent text-[#9ca3af]',
                            ].join(' ')}
                        >
                            <BsListUl size={13} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            title="Grid view"
                            className={[
                                'w-8 h-[30px] rounded-[7px] flex items-center justify-center border-none cursor-pointer transition-all duration-150 text-[13px]',
                                viewMode === 'grid'
                                    ? 'bg-white dark:bg-white/10 text-[var(--color-primary,#4f46e5)] shadow-[0_1px_4px_rgba(0,0,0,0.1)]'
                                    : 'bg-transparent text-[#9ca3af]',
                            ].join(' ')}
                        >
                            <BsGridFill size={12} />
                        </button>
                    </div>
                    <div className=' flex justify-center items-center gap-2'>
                        <label htmlFor='selectall'

                            className="flex items-center gap-[7px] px-4 py-2 rounded-[9px] bg-[var(--color-primary-lighter)] dark:[var(--color-primary-darker)] border border-[var(--color-primary-light)] dark:border-red-600/20 text-[var(--color-primary)] text-[13px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[var(--color-primary-light)] hover:shadow-[0_3px_10px_rgba(220,38,38,0.18)] hover:-translate-y-px active:scale-[0.97]"
                        >

                            <IoCheckboxOutline size={16} />
                            Select {selectedCustomers.length > 0 ? selectedCustomers.length : 'All'}
                        </label>
                        {/* delete all */}
                        {onDeleteAll && data.length > 0 && (
                            <button
                                onClick={() => {
                                    /*  if (selectedCustomers.length === 0) return; */



                                    if (data.length > 0) {
                                        if (selectedCustomers.length < 1) {
                                            const firstPageIds = data.map((c) => c._id);
                                            setSelectedCustomers(firstPageIds);
                                        }

                                        onDeleteAll?.(selectedCustomers);
                                    }
                                }}
                                className="flex items-center gap-[7px] px-4 py-2 rounded-[9px] bg-[#fef2f2] dark:bg-red-600/10 border border-[#fecaca] dark:border-red-600/20 text-[#dc2626] text-[13px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#fee2e2] hover:shadow-[0_3px_10px_rgba(220,38,38,0.18)] hover:-translate-y-px active:scale-[0.97]"
                            >
                                <MdDeleteSweep size={16} />
                                Delete {selectedCustomers.length > 0 ? selectedCustomers.length : 'All'}
                            </button>
                        )}
                    </div>

                </div>

                {/* ── BODY ── */}
                <div className="flex-1 overflow-hidden">

                    {/* LOADER */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-[14px]">
                            <div className="w-[38px] h-[38px] rounded-full border-[3px] border-[color-mix(in_srgb,var(--color-primary,#4f46e5)_18%,white)] dark:border-[color-mix(in_srgb,var(--color-primary,#4f46e5)_25%,transparent)] border-t-[var(--color-primary,#4f46e5)] animate-spin" />
                            <span className="text-[13.5px] text-[#9ca3af] font-medium">Loading customers...</span>
                        </div>

                        /* EMPTY */
                    ) : data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-[9px] text-center">
                            <div className="w-[60px] h-[60px] rounded-2xl mb-1 flex items-center justify-center bg-[color-mix(in_srgb,var(--color-primary,#4f46e5)_10%,white)] dark:bg-[color-mix(in_srgb,var(--color-primary,#4f46e5)_18%,transparent)]">
                                <HiUser size={26} className="text-[var(--color-primary,#4f46e5)] opacity-55" />
                            </div>
                            <p className="text-[15px] font-bold text-[#374151] dark:text-[#e2e8f0]">No customers today</p>
                            <p className="text-[12.5px] text-[#9ca3af]">Customers added today will appear here</p>
                        </div>

                        /* TABLE VIEW */
                    ) : viewMode === 'table' ? (
                        <div className="h-full overflow-auto scrollbar-thin scrollbar-thumb-[rgba(156,163,175,0.4)] scrollbar-track-transparent">
                            <table className="w-full border-separate border-spacing-0 text-[13px]">
                                <thead>
                                    <tr className="sticky top-0 z-5 bg-[color-mix(in_srgb,var(--color-primary,#4f46e5)_8%,white)] dark:bg-[color-mix(in_srgb,var(--color-primary,#4f46e5)_18%,var(--color-childbgdark,#161922))]">
                                        <th className="px-[10px]">
                                            <input
                                                type="checkbox"
                                                id='selectall'
                                                checked={selectedCustomers.length === data.length}
                                                onChange={handleSelectAll}
                                                className=' hidden'
                                            />
                                        </th>
                                        {['#', 'Name', 'Campaign', 'Type', 'SubType', 'Location', 'City', 'Contact', 'Date', 'Description'].map((col) => (
                                            <th
                                                key={col}
                                                className="px-[15px] py-[11px] text-left text-[10px] font-bold tracking-[0.09em] uppercase text-[var(--color-primary,#4f46e5)] border-b-[1.5px] border-[color-mix(in_srgb,var(--color-primary,#4f46e5)_20%,white)] dark:border-[color-mix(in_srgb,var(--color-primary,#4f46e5)_30%,transparent)] whitespace-nowrap"
                                            >
                                                {col}
                                            </th>
                                        ))}
                                        {onDelete && (
                                            <th className="px-[15px] py-[11px] text-left text-[10px] font-bold tracking-[0.09em] uppercase text-[var(--color-primary,#4f46e5)] border-b-[1.5px] border-[color-mix(in_srgb,var(--color-primary,#4f46e5)_20%,white)] dark:border-[color-mix(in_srgb,var(--color-primary,#4f46e5)_30%,transparent)] whitespace-nowrap sticky right-0 bg-[color-mix(in_srgb,var(--color-primary,#4f46e5)_8%,white)] dark:bg-[color-mix(in_srgb,var(--color-primary,#4f46e5)_18%,var(--color-childbgdark,#161922))]">
                                                Action
                                            </th>
                                        )}
                                        
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item, i) => (
                                        <tr
                                            key={item._id}
                                            className={`transition-colors duration-[120ms] group
  ${selectedCustomers.includes(item._id)
                                                    ? 'bg-blue-50 dark:bg-blue-900/20'
                                                    : 'hover:bg-[color-mix(in_srgb,var(--color-primary,#4f46e5)_5%,white)]'}
`}   >
                                            <td className="px-[10px]">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCustomers.includes(item._id)}
                                                    onChange={() => toggleSelect(item._id)}
                                                />
                                            </td>
                                            {/* S.No */}
                                            <td className="px-[15px] py-3 border-b border-black/5 dark:border-white/5 align-middle">
                                                <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-[11.5px] font-bold bg-[color-mix(in_srgb,var(--color-primary,#4f46e5)_12%,white)] dark:bg-[color-mix(in_srgb,var(--color-primary,#4f46e5)_22%,transparent)] text-[var(--color-primary,#4f46e5)]">
                                                    {i + 1}
                                                </div>
                                            </td>
                                            {/* Name */}
                                            <td className="px-[15px] py-3 border-b border-black/5 dark:border-white/5 align-middle font-semibold whitespace-nowrap text-[#374151] dark:text-[#cbd5e1]">
                                                {item.Name || 'N/A'}
                                            </td>
                                            {/* Campaign */}
                                            <td className="px-[15px] py-3 border-b border-black/5 dark:border-white/5 align-middle text-[#9ca3af] dark:text-[#64748b]">
                                                {item.Campaign
                                                    ? <span className="inline-block px-[9px] py-[3px] rounded-full text-[11px] font-semibold bg-[color-mix(in_srgb,var(--color-primary,#4f46e5)_12%,white)] dark:bg-[color-mix(in_srgb,var(--color-primary,#4f46e5)_20%,transparent)] text-[var(--color-primary,#4f46e5)]">{item.Campaign}</span>
                                                    : '—'}
                                            </td>
                                            {/* Type */}
                                            <td className="px-[15px] py-3 border-b border-black/5 dark:border-white/5 align-middle text-[#9ca3af] dark:text-[#64748b]">{item.Type || '—'}</td>
                                            {/* SubType */}
                                            <td className="px-[15px] py-3 border-b border-black/5 dark:border-white/5 align-middle text-[#9ca3af] dark:text-[#64748b]">{item.SubType || '—'}</td>
                                            {/* Location */}
                                            <td className="px-[15px] py-3 border-b border-black/5 dark:border-white/5 align-middle text-[#9ca3af] dark:text-[#64748b]">{item.Location || '—'}</td>
                                            {/* City */}
                                            <td className="px-[15px] py-3 border-b border-black/5 dark:border-white/5 align-middle text-[#9ca3af] dark:text-[#64748b]">{item.City || '—'}</td>
                                            {/* Contact */}
                                            <td className="px-[15px] py-3 border-b border-black/5 dark:border-white/5 align-middle">
                                                {item.ContactNumber
                                                    ? <span className="inline-block px-[10px] py-1 rounded-[7px] text-[11.5px] font-bold tracking-[0.03em] bg-[color-mix(in_srgb,var(--color-primary,#4f46e5)_8%,white)] dark:bg-[color-mix(in_srgb,var(--color-primary,#4f46e5)_15%,transparent)] text-[var(--color-primary,#4f46e5)] border border-[color-mix(in_srgb,var(--color-primary,#4f46e5)_20%,white)] dark:border-[color-mix(in_srgb,var(--color-primary,#4f46e5)_30%,transparent)]">{item.ContactNumber}</span>
                                                    : <span className="text-[#9ca3af] dark:text-[#64748b]">—</span>}
                                            </td>
                                            {/* Date */}
                                            <td className="px-[15px] py-3 border-b border-black/5 dark:border-white/5 align-middle whitespace-nowrap text-[#9ca3af] dark:text-[#64748b]">{item.createdAt || '—'}</td>
                                            {/* Description */}
                                            <td className="px-[15px] py-3 border-b border-black/5 dark:border-white/5 align-middle max-w-[190px] text-[#9ca3af] dark:text-[#64748b]">
                                                <span className="line-clamp-2">{item.Description || '—'}</span>
                                            </td>
                                            {/* Action */}
                                            <td className=' flex flex-wrap justify-center items-center shadow-[-2px_0_8px_rgba(0,0,0,0.04)] dark:shadow-[-2px_0_8px_rgba(0,0,0,0.2)]'>
                                               {
                                                onEdit && (
                                                    <div className="px-[15px] py-3 border-b border-black/5 dark:border-white/5 align-middle sticky right-0  dark:bg-[var(--color-childbgdark,#161922)]  group-hover:bg-[color-mix(in_srgb,var(--color-primary,#4f46e5)_5%,white)] dark:group-hover:bg-[color-mix(in_srgb,var(--color-primary,#4f46e5)_12%,var(--color-childbgdark,#161922))]">
                                                    <div className="flex justify-center">
                                                        <button

                                                            onClick={() => onEdit(item)}
                                                            title="Edit"
                                                            className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center bg-[#f2fefb] dark:bg-cyan-600/8 border border-[#cafbfe] dark:border-cyan-600/18 text-[#26dcdc] cursor-pointer transition-all duration-[180ms] hover:bg-[#e2f6fe] hover:scale-[1.12] hover:shadow-[0_2px_8px_rgba(220,38,38,0.22)] active:scale-[0.94]"
                                                        >
                                                            <MdEdit size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                )
                                            }
                                                {onDelete && (
                                                <div className="px-[15px] py-3  align-middle sticky right-0  dark:bg-[var(--color-childbgdark,#161922)]  group-hover:bg-[color-mix(in_srgb,var(--color-primary,#4f46e5)_5%,white)] dark:group-hover:bg-[color-mix(in_srgb,var(--color-primary,#4f46e5)_12%,var(--color-childbgdark,#161922))]">
                                                    <div className="flex justify-center">
                                                        <button

                                                            onClick={() => onDelete(item)}
                                                            title="Delete"
                                                            className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center bg-[#fef2f2] dark:bg-red-600/8 border border-[#fecaca] dark:border-red-600/18 text-[#dc2626] cursor-pointer transition-all duration-[180ms] hover:bg-[#fee2e2] hover:scale-[1.12] hover:shadow-[0_2px_8px_rgba(220,38,38,0.22)] active:scale-[0.94]"
                                                        >
                                                            <MdDelete size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        /* GRID VIEW */
                    ) : (
                        <div className="h-full overflow-y-auto px-6 py-5 scrollbar-thin scrollbar-thumb-[rgba(156,163,175,0.4)] scrollbar-track-transparent">
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-[15px]">
                                {data.map((item, i) => {
                                    const initials = (item.Name || 'NA')
                                        .split(' ').slice(0, 2)
                                        .map((w: string) => w[0]).join('').toUpperCase();
                                    return (
                                        <div
                                            key={item._id}
                                            className="relative bg-white dark:bg-[var(--color-childbgdark,#161922)] border border-black/6 dark:border-white/7 rounded-[14px] px-[18px] py-4 overflow-hidden transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-[3px] hover:shadow-[0_10px_28px_rgba(0,0,0,0.09)] hover:border-[color-mix(in_srgb,var(--color-primary,#4f46e5)_25%,transparent)] group"
                                        >
                                            <input
                                                type="checkbox"
                                                className="absolute top-3 right-5"
                                                id="selectall"
                                                checked={selectedCustomers.includes(item._id)}
                                                onChange={() => toggleSelect(item._id)}
                                            />
                                            {/* top accent bar */}
                                            <div className="absolute top-0 left-0 right-0 h-[3px] bg-[var(--color-primary,#4f46e5)] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                                            {/* card top */}
                                            <div className="flex items-start justify-between gap-[10px] mt-5 mb-3">
                                                <div className="flex items-center gap-[10px]">
                                                    <div className="w-[38px] h-[38px] rounded-[10px] flex-shrink-0 flex items-center justify-center text-[13px] font-extrabold bg-[color-mix(in_srgb,var(--color-primary,#4f46e5)_14%,white)] dark:bg-[color-mix(in_srgb,var(--color-primary,#4f46e5)_22%,transparent)] text-[var(--color-primary,#4f46e5)]">
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <p className="text-[14.5px] font-bold leading-snug text-[#0f1117] dark:text-[#f1f5f9]">{item.Name || 'N/A'}</p>
                                                        <p className="text-[11px] text-[#9ca3af] mt-[1px]">#{i + 1}{item.Campaign ? ` · ${item.Campaign}` : ''}</p>
                                                    </div>
                                                </div>
                                                {item.ContactNumber && (
                                                    <span className="flex-shrink-0 inline-block px-[10px] py-1 rounded-[7px] text-[11.5px] font-bold tracking-[0.03em] bg-[color-mix(in_srgb,var(--color-primary,#4f46e5)_8%,white)] dark:bg-[color-mix(in_srgb,var(--color-primary,#4f46e5)_15%,transparent)] text-[var(--color-primary,#4f46e5)] border border-[color-mix(in_srgb,var(--color-primary,#4f46e5)_20%,white)] dark:border-[color-mix(in_srgb,var(--color-primary,#4f46e5)_30%,transparent)]">
                                                        {item.ContactNumber}
                                                    </span>
                                                )}
                                            </div>

                                            {/* info rows */}
                                            {(item.Type || item.SubType) && (
                                                <div className="flex items-center gap-[6px] text-[12px] text-[#6b7280] dark:text-[#94a3b8] mt-[6px]">
                                                    <HiUser size={12} className="text-[var(--color-primary,#4f46e5)] opacity-65 flex-shrink-0" />
                                                    <span>{[item.Type, item.SubType].filter(Boolean).join(' · ')}</span>
                                                </div>
                                            )}
                                            {(item.Location || item.City) && (
                                                <div className="flex items-center gap-[6px] text-[12px] text-[#6b7280] dark:text-[#94a3b8] mt-[6px]">
                                                    <HiLocationMarker size={12} className="text-[var(--color-primary,#4f46e5)] opacity-65 flex-shrink-0" />
                                                    <span>{[item.Location, item.City].filter(Boolean).join(', ')}</span>
                                                </div>
                                            )}
                                            {item.Description && (
                                                <p className="text-[11.5px] leading-relaxed text-[#9ca3af] mt-2">
                                                    {item.Description.length > 85 ? item.Description.slice(0, 85) + '…' : item.Description}
                                                </p>
                                            )}

                                            {/* divider */}
                                            <div className="h-px bg-black/6 dark:bg-white/6 my-3" />

                                            {/* footer */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-[5px] text-[11.5px] text-[#9ca3af]">
                                                    <HiCalendar size={12} />
                                                    {item.createdAt || 'N/A'}
                                                </div>
                                                {onDelete && (
                                                    <button
                                                        onClick={() => onDelete(item)}
                                                        title="Delete"
                                                        className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center bg-[#fef2f2] dark:bg-red-600/8 border border-[#fecaca] dark:border-red-600/18 text-[#dc2626] cursor-pointer transition-all duration-[180ms] hover:bg-[#fee2e2] hover:scale-[1.12] hover:shadow-[0_2px_8px_rgba(220,38,38,0.22)] active:scale-[0.94]"
                                                    >
                                                        <MdDelete size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PopupMenu>
    );
};

export default TodayCustomerDialog;