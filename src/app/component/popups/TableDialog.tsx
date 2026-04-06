'use client';
import React from 'react';
import PopupMenu from './PopupMenu';
import { customerGetDataInterface } from '@/store/customer.interface';
import { IoMdClose } from 'react-icons/io';
import Button from '@mui/material/Button';
import { FaPhone, FaWhatsapp } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

interface TableDialogProps {
    title?: string;
    subTitle?: string;
    onClose?: () => void;
    data: customerGetDataInterface[] | null;
    totalData?: number;
    isOpen?: boolean;
    isLoading?: boolean;
    renderActions?: (item: customerGetDataInterface) => React.ReactNode;
}

const TableDialog = ({
    isOpen,
    title = '',
    subTitle = 'Contact No',
    data,
    totalData,
    onClose,
    isLoading = false ,
    renderActions
}: TableDialogProps) => {
    if (!isOpen || !data) return null;
    const customerTableLoader = isLoading;

    return (
        <PopupMenu onClose={onClose} isOpen={isOpen}>
            <div className="flex flex-col relative border border-gray-300/20 dark:border-none w-full h-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-gray-50/80 dark:from-[var(--color-primary)] dark:via-[var(--color-secondary-darker)] dark:to-[var(--color-bgdark)] text-[var(--color-secondary-darker)]">

                {/* Header Section - Enhanced with gradient background */}
                <div className="sticky top-0 z-20 bg-gradient-to-r from-white via-gray-50/90 to-white dark:from-[var(--color-childbgdark)] dark:via-[var(--color-childbgdark)] dark:to-[var(--color-childbgdark)] text-[var(--color-secondary-darker)] backdrop-blur-md border-b border-gray-200/60 shadow-sm">
                    <div className="p-4 sm:p-6 lg:p-7">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 flex-wrap">
                                    <h1 className="text-xl sm:text-2xl font-semibold text-[var(--color-secondary-darker)] dark:text-white tracking-wide leading-tight">
                                        {title}{' '}
                                        <span className="text-[var(--color-primary)] font-light text-lg sm:text-xl">
                                            {subTitle}
                                        </span>
                                    </h1>
                                </div>
                                <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium flex flex-wrap items-center gap-2">

                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse"></span>
                                        {data.length} {data.length === 1 ? 'customer' : 'customers'} found with
                                    </span>

                                    {data[0]?.ContactNumber && (
                                        <span className="flex items-center">
                                            Contact:
                                            <span className="ml-1 text-[var(--color-primary)] font-semibold">
                                                {data[0]?.ContactNumber}
                                            </span>
                                        </span>
                                    )}

                                </p>

                            </div>

                            {/* Close Button - Enhanced with better hover states */}
                            <button
                                onClick={onClose}
                                className="flex-shrink-0 group p-2.5 sm:p-3 text-gray-400 hover:text-white bg-white dark:bg-[var(--color-primary-darker)] dark:border-none dark:text-white hover:bg-gradient-to-br hover:from-[var(--color-primary)] hover:to-[var(--color-primary)]/80 rounded-xl border border-gray-200 hover:border-[var(--color-primary)] transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-[var(--color-primary)]/20 active:scale-95"
                                aria-label="Close dialog"
                            >
                                <IoMdClose className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:rotate-90" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Container */}
                <div className="flex-1 overflow-hidden">
                    {customerTableLoader ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center space-y-3">
                                <div className="w-12 h-12 border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto"></div>
                                <p className="text-gray-500 font-medium">Loading customers...</p>
                            </div>
                        </div>
                    ) : data.length > 0 ? (
                        <>
                            {/* Mobile Card View (hidden on lg screens) */}
                            <div className="lg:hidden h-full overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {data.map((item, index) => (
                                    <div
                                        key={item._id}
                                        className="group relative bg-white dark:bg-[var(--color-secondary-darker)] border border-gray-200/70 hover:border-[var(--color-primary)]/40 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-[var(--color-primary)]/5 transition-all duration-300 overflow-hidden"
                                    >
                                        {/* Card Header with Index */}
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent rounded-bl-[3rem]">
                                            <span className="absolute top-2 right-3 text-xs font-bold text-[var(--color-primary)]">
                                                #{index + 1}
                                            </span>
                                        </div>

                                        {/* Accent Border */}
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--color-primary)] via-[var(--color-primary)]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                        <div className="p-5 space-y-4">
                                            {/* Name & Campaign */}
                                            <div className="space-y-2 pr-12">
                                                <h3 className="text-lg font-bold text-[var(--color-primary)] max-sm:dark:text-[var(--color-primary-light)] line-clamp-1">
                                                    {item.Name || 'N/A'}
                                                </h3>
                                                {item.Campaign && (
                                                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 text-[var(--color-primary)] rounded-full text-xs font-semibold border border-[var(--color-primary)]/20">
                                                        {item.Campaign}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Grid Layout for Details */}
                                            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                                                {/* Customer Type */}
                                                <div className="space-y-1">
                                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">Type</p>
                                                    <p className="text-sm font-medium text-gray-800 dark:text-white line-clamp-2">{item.Type || 'N/A'}</p>
                                                </div>

                                                {/* Subtype */}
                                                <div className="space-y-1">
                                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">Subtype</p>
                                                    <p className="text-sm font-medium text-gray-800 dark:text-white line-clamp-2">{item.SubType || 'N/A'}</p>
                                                </div>

                                                {/* Location */}
                                                <div className="space-y-1">
                                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">Location</p>
                                                    <p className="text-sm font-medium text-gray-800 dark:text-white line-clamp-1">{item.Location || 'N/A'}</p>
                                                </div>

                                                {/* Sub Location */}
                                                <div className="space-y-1">
                                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">Sub Location</p>
                                                    <p className="text-sm font-medium text-gray-800 dark:text-white line-clamp-1">{item.SubLocation || 'N/A'}</p>
                                                </div>

                                                {/* Contact Number */}
                                                {item.ContactNumber && (
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">Contact</p>
                                                        <p className="text-sm font-bold text-[var(--color-primary)]">{item.ContactNumber}</p>
                                                    </div>
                                                )}

                                                {/* Assign To */}
                                                <div className="space-y-1">
                                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">Assigned</p>
                                                    <p className="text-sm font-medium text-gray-800 dark:text-white line-clamp-1">{ item.AssignTo.map((e: any) => e.name + ", ") || 'N/A'}</p>
                                                </div>

                                                {/* Date */}
                                                <div className="space-y-1 col-span-2">
                                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">Date</p>
                                                    <p className="text-sm font-medium text-gray-800 dark:text-white">{item.Date || 'N/A'}</p>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            {item.Description && (
                                                <div className="pt-3 border-t border-gray-100 space-y-1">
                                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">Description</p>
                                                    <p className="text-sm text-gray-700 dark:text-white leading-relaxed line-clamp-3">
                                                        {item.Description}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            {renderActions && (
                                                <div className="pt-3 border-t border-gray-100">
                                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide mb-4">Actions</p>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {renderActions(item)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table View (hidden on mobile) */}
                            <div className="hidden lg:block h-full overflow-hidden p-5 lg:p-6">
                                <div className="h-full overflow-y-auto custom-scrollbar border border-gray-200/60 rounded-2xl shadow-lg bg-white dark:bg-[var(--color-childbgdark)]">
                                    <table className="table-auto w-full border-separate border-spacing-0 text-sm">
                                        <thead className="sticky top-0 z-10">
                                            <tr className="bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary)]/95 to-[var(--color-primary)] text-white">
                                                <th className="px-3 py-4 border-b-2 border-[var(--color-primary)]/20 text-left font-bold uppercase tracking-wide text-xs whitespace-nowrap">
                                                    S.No.
                                                </th>
                                                <th className="px-4 py-4 border-b-2 border-[var(--color-primary)]/20 text-left font-bold uppercase tracking-wide text-xs whitespace-nowrap">
                                                    Campaign
                                                </th>
                                                <th className="px-4 py-4 border-b-2 border-[var(--color-primary)]/20 text-left font-bold uppercase tracking-wide text-xs whitespace-nowrap">
                                                    Customer Type
                                                </th>
                                                <th className="px-4 py-4 border-b-2 border-[var(--color-primary)]/20 text-left font-bold uppercase tracking-wide text-xs whitespace-nowrap">
                                                    Subtype
                                                </th>
                                                <th className="px-4 py-4 border-b-2 border-[var(--color-primary)]/20 text-left font-bold uppercase tracking-wide text-xs whitespace-nowrap">
                                                    Name
                                                </th>
                                                <th className="px-4 py-4 border-b-2 border-[var(--color-primary)]/20 text-left font-bold uppercase tracking-wide text-xs whitespace-nowrap">
                                                    Description
                                                </th>
                                                <th className="px-4 py-4 border-b-2 border-[var(--color-primary)]/20 text-left font-bold uppercase tracking-wide text-xs whitespace-nowrap">
                                                    Location
                                                </th>
                                                <th className="px-4 py-4 border-b-2 border-[var(--color-primary)]/20 text-left font-bold uppercase tracking-wide text-xs whitespace-nowrap">
                                                    Sub Location
                                                </th>
                                                <th className="px-4 py-4 border-b-2 border-[var(--color-primary)]/20 text-left font-bold uppercase tracking-wide text-xs whitespace-nowrap">
                                                    Contact No
                                                </th>
                                                <th className="px-4 py-4 border-b-2 border-[var(--color-primary)]/20 text-left font-bold uppercase tracking-wide text-xs whitespace-nowrap">
                                                    Assign To
                                                </th>
                                                <th className="px-4 py-4 border-b-2 border-[var(--color-primary)]/20 text-left font-bold uppercase tracking-wide text-xs whitespace-nowrap">
                                                    Date
                                                </th>
                                                {renderActions && (
                                                    <th className="px-4 py-4 border-b-2 border-[var(--color-primary)]/20 text-left font-bold uppercase tracking-wide text-xs whitespace-nowrap sticky right-0 bg-[var(--color-primary)] shadow-[-4px_0_6px_rgba(0,0,0,0.1)]">
                                                        Actions
                                                    </th>
                                                )}
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {data.map((item, index) => (
                                                <tr
                                                    key={item._id}
                                                    className="group hover:bg-gradient-to-r hover:from-[var(--color-primary)]/5 hover:via-transparent hover:to-transparent transition-all duration-200 border-b border-gray-100/50"
                                                >
                                                    <td className="px-3 py-4 text-center font-semibold text-gray-600 group-hover:text-[var(--color-primary)] transition-colors">
                                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-[var(--color-primary-darker)] dark:text-white group-hover:bg-[var(--color-primary)]/10 group-hover:ring-2 group-hover:ring-[var(--color-primary)]/20 transition-all">
                                                            {index + 1}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 font-medium text-gray-800 dark:text-gray-400">{item.Campaign || 'N/A'}</td>
                                                    <td className="px-4 py-4 max-w-[140px]">
                                                        <span className="text-sm text-gray-700 dark:text-gray-400 line-clamp-2">{item.Type || 'N/A'}</span>
                                                    </td>
                                                    <td className="px-4 py-4 max-w-[130px]">
                                                        <span className="text-sm text-gray-700 dark:text-gray-400 line-clamp-2">{item.SubType || 'N/A'}</span>
                                                    </td>
                                                    <td className="px-4 py-4 font-semibold text-gray-800 dark:text-gray-400">{item.Name || 'N/A'}</td>
                                                    <td className="px-4 py-4 max-w-[180px]">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400 ">{item.Description || 'N/A'}</span>
                                                    </td>
                                                    <td className="px-4 py-4 text-gray-700 dark:text-gray-400">{item.Location || 'N/A'}</td>
                                                    <td className="px-4 py-4 text-gray-700 dark:text-gray-400">{item.SubLocation || 'N/A'}</td>
                                                    <td className="px-4 py-4 text-center">
                                                        {item.ContactNumber ? (
                                                            <span className="inline-block px-3 py-1.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg font-semibold text-sm border border-[var(--color-primary)]/20">
                                                                {item.ContactNumber}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">N/A</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-gray-700 dark:text-gray-400">{item.AssignTo.map((e: any) => e.name + ", ") || 'N/A'}</td>
                                                    <td className="px-4 py-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">{item.Date || 'N/A'}</td>
                                                    {renderActions && (
                                                        <td className="px-4 py-4 sticky right-0 bg-white dark:bg-[var(--color-childbgdark)] group-hover:bg-gradient-to-r group-hover:from-[var(--color-primary)]/5 group-hover:via-white group-hover:to-white dark:group-hover:via-[var(--color-secondary-darker)] dark:group-hover:to-[var(--color-secondary-darker)] shadow-[-1px_0_6px_rgba(0,0,0,0.03)]">
                                                            <div className="flex gap-2 justify-center">
                                                                {renderActions(item)}
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center space-y-4 p-8">
                                <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                                <p className="text-lg font-semibold text-gray-600">No customers found</p>
                                <p className="text-sm text-gray-500">Try adjusting your search criteria</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Custom Scrollbar Styles */}
                <style jsx>{`
                    .custom-scrollbar {
                        scrollbar-width: thin;
                        scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                        height: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(156, 163, 175, 0.5);
                        border-radius: 3px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: rgba(107, 114, 128, 0.7);
                    }
                `}</style>
            </div>
        </PopupMenu>
    );
};

export default TableDialog;