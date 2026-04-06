"use client"
import { formatDateDMY } from '@/app/utils/formatDateDMY'
import { getCustomer } from '@/store/customer'
/* import { getAifollowup } from '@/store/aiFollowup' */ // adjust to your actual path
import { customerGetDataInterface } from '@/store/customer.interface'
import { addAiFollowup } from '@/store/customerFollowups'
import React, { useEffect, useRef, useState } from 'react'

interface AIAgent {
    id: string
    name: string
    description: string
    type: string
    status: string
    campaign?: string
    targetSegment?: string
    capability?: string
    tasksCompleted?: number
    accuracy?: number
    createdAt?: string
    assignedUsers?: string[]
}

interface TableDialogProps {
    onClose?: () => void;
    data: AIAgent | null;
    totalData?: number;
}

const PAGE_SIZE = 20;

const FollowupAgentWorkspace = ({ onClose, data, totalData }: TableDialogProps) => {
    const [customerData, setCustomerData] = useState<customerGetDataInterface[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [streamedText, setStreamedText] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const mapCustomer = (item: any) => {
        const date = new Date(item.createdAt);
        const formattedDate =
            date.getDate().toString().padStart(2, "0") + "-" +
            (date.getMonth() + 1).toString().padStart(2, "0") + "-" +
            date.getFullYear();

        return {
            _id: item._id,
            Campaign: item.Campaign,
            Type: item.CustomerType,
            SubType: item.CustomerSubType,
            Name: item.customerName,
            Description: item.Description,
            Email: item.Email,
            City: item.City,
            Location: item.Location,
            Adderess: item.Adderess,
            Area: item.Area,
            SubLocation: item.SubLocation,
            CustomerId: item.CustomerId,
            ClientId: item.ClientId,
            CustomerYear: item.CustomerYear,
            Facillities: item.Facillities,
            ContactNumber: item.ContactNumber?.slice(0, 10),
            ReferenceId: item.ReferenceId,
            AssignTo: item.AssignTo ?? [],
            isFavourite: item.isFavourite,
            isChecked: item.isChecked,
            Other: item.Other,
            Date:
                item.CustomerDate === "N/A"
                    ? "N/A"
                    : item.CustomerDate
                        ? formatDateDMY(item.CustomerDate)
                        : formattedDate,
            CustomerImage: item.CustomerImage || "",
            SitePlan: item.SitePlan || "",
            URL: item.URL || "",
            Video: item.Video || "",
            GoogleMap: item.GoogleMap || "",
            Price: item.Price || "",
            CustomerFields: item.CustomerFields || {},
        };
    };

    const fetchCustomer = async () => {
        setIsFetching(true);
        const res = await getCustomer();
        if (res) setCustomerData(res.map(mapCustomer));
        setIsFetching(false);
    };

    useEffect(() => { fetchCustomer(); }, []);

    // Reset visible count whenever search query changes
    useEffect(() => { setVisibleCount(PAGE_SIZE); }, [searchQuery]);

    const filteredCustomers = customerData.filter(c =>
        c.Campaign?.includes(searchQuery) ||
        c.Type?.includes(searchQuery) ||
        c.SubType?.includes(searchQuery) ||
        c.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.Email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.ContactNumber?.includes(searchQuery)
    );

    const visibleCustomers = filteredCustomers.slice(0, visibleCount);
    const hasMore = visibleCount < filteredCustomers.length;
    const remaining = filteredCustomers.length - visibleCount;

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        setSelectedIds(
            selectedIds.length === filteredCustomers.length
                ? []
                : filteredCustomers.map(c => c._id)
        );
    };

    const isAllSelected = filteredCustomers.length > 0 && selectedIds.length === filteredCustomers.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < filteredCustomers.length;

    const autoResize = () => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = 'auto';
            el.style.height = Math.min(el.scrollHeight, 120) + 'px';
        }
    };

    const simulateStream = (text: string) => {
        setIsStreaming(true);
        setStreamedText('');
        let i = 0;
        const interval = setInterval(() => {
            i++;
            setStreamedText(text.slice(0, i));
            if (i >= text.length) {
                clearInterval(interval);
                setIsStreaming(false);
            }
        }, 18);
    };

    const handleSubmit = async () => {
        if (!prompt.trim() || selectedIds.length === 0 || isLoading) return;
        setIsLoading(true);
        setAiResponse(null);
        setStreamedText('');
        const submittedPrompt = prompt.trim();
        setPrompt('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        try {
            const payload ={
                customerIds:selectedIds,
                userPrompt: prompt,
            }
            const res = await addAiFollowup(payload);
            console.log(" response is ",res) /* await getAifollowup(selectedIds, submittedPrompt); */
            const message = res?.aiMessage || 'Action completed successfully.';
            

            console.log(" payload followup ai ", payload)
            setAiResponse(message);
            setIsLoading(false);
            simulateStream(message);
        } catch {
            const errMsg = 'Something went wrong. Please try again.';
            setAiResponse(errMsg);
            setIsLoading(false);
            simulateStream(errMsg);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const CheckIcon = () => (
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );

    return (
        <div className="flex flex-col h-full overflow-hidden bg-stone-50">

            {/* ── Header ── */}
            <div className="flex-shrink-0 bg-white border-b border-stone-200 px-4 pt-2 pb-3 flex flex-col gap-3">
               {/*  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                <path d="M9 9l6 3-6 3V9z" fill="white" />
                                <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5" opacity="0.4" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-stone-800 leading-none tracking-tight">Follow-up Agent</p>
                            <p className="text-[11px] text-stone-400 mt-0.5">Select customers · Run AI actions</p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="w-7 h-7 rounded-md border border-stone-200 flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors cursor-pointer"
                        >
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>
                    )}
                </div> */}

                {/* Search */}
                <div className="relative">
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                        <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search by name, email or phone..."
                        className="w-full h-9 pl-8 pr-3 text-[12.5px] bg-stone-100 border border-stone-200 rounded-lg outline-none placeholder-stone-400 text-stone-800 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                </div>
            </div>

            {/* ── Stats bar ── */}
            <div className="flex-shrink-0 flex items-center justify-between bg-white border-b border-stone-200 px-4 py-2">
                <div className="flex items-center gap-1.5 text-[11.5px] text-stone-500">
                    <span className="bg-indigo-50 text-indigo-600 font-semibold text-[11px] px-2 py-0.5 rounded-full">
                        {filteredCustomers.length}
                    </span>
                    customers
                    {selectedIds.length > 0 && (
                        <>
                            <span className="text-stone-300">·</span>
                            <span className="bg-orange-50 text-orange-500 font-semibold text-[11px] px-2 py-0.5 rounded-full">
                                {selectedIds.length} selected
                            </span>
                        </>
                    )}
                </div>
                {filteredCustomers.length > 0 && (
                    <button
                        onClick={toggleSelectAll}
                        className="text-[11.5px] font-medium text-indigo-500 hover:text-indigo-700 transition-colors cursor-pointer"
                    >
                        {isAllSelected ? 'Deselect all' : 'Select all'}
                    </button>
                )}
            </div>

            {/* ── Scrollable table container ── */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {isFetching ? (
                    <div className="flex items-center justify-center py-14">
                        <div className="w-5 h-5 rounded-full border-2 border-stone-200 border-t-indigo-500 animate-spin" />
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-stone-400 text-[13px] gap-2">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className="opacity-30">
                            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        No customers found
                    </div>
                ) : (
                    <div className=' max-h-[250px] overflow-auto  [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
                    <table className="w-full border-collapse">
                        {/* Sticky header */}
                        <thead className="sticky top-0 z-10">
                            <tr>
                                <th className="w-10 pl-4 py-2 bg-stone-100 border-b border-stone-200 text-left">
                                    <div
                                        onClick={toggleSelectAll}
                                        className={`w-[15px] h-[15px] rounded cursor-pointer flex items-center justify-center border transition-all
                                            ${isAllSelected || isIndeterminate
                                                ? 'bg-indigo-600 border-indigo-600'
                                                : 'bg-white border-stone-300 hover:border-indigo-400'}`}
                                    >
                                        {isAllSelected && <CheckIcon />}
                                        {isIndeterminate && <div className="w-2 h-0.5 bg-white rounded-sm" />}
                                    </div>
                                </th>
                                <th className="py-2 px-2 text-left text-[10.5px] font-semibold uppercase tracking-wider text-stone-400 bg-stone-100 border-b border-stone-200">
                                    Campaign
                                </th>
                                <th className="py-2 px-2 text-left text-[10.5px] font-semibold uppercase tracking-wider text-stone-400 bg-stone-100 border-b border-stone-200">
                                    Customer
                                </th>
                                <th className="py-2 px-2 pr-4 text-left text-[10.5px] font-semibold uppercase tracking-wider text-stone-400 bg-stone-100 border-b border-stone-200">
                                    Contact
                                </th>

                            </tr>
                        </thead>
                        <tbody>
                            {visibleCustomers.map(c => {
                                const isSelected = selectedIds.includes(c._id);
                                return (
                                    <tr
                                        key={c._id}
                                        onClick={() => toggleSelect(c._id)}
                                        className={`border-b border-stone-100 cursor-pointer transition-colors
                                            ${isSelected
                                                ? 'bg-indigo-50 hover:bg-indigo-100/70'
                                                : 'bg-white hover:bg-stone-50'}`}
                                    >
                                        <td className="pl-4 py-2.5 w-10 align-middle">
                                            <div className={`w-[15px] h-[15px] rounded flex items-center justify-center border flex-shrink-0 transition-all
                                                ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-stone-300'}`}>
                                                {isSelected && <CheckIcon />}
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-2  align-middle">
                                            
                                            <p className="text-[12.5px] font-medium text-stone-800 truncate leading-none">
                                                {c.Campaign || '—'}
                                            </p>
                                            <p className="text-[11px] text-indigo-400 truncate mt-0.5">
                                                {c.Type || '—'}
                                            </p>
                                        </td>
                                        <td className="py-2.5 px-2  align-middle">
                                            
                                            <p className="text-[12.5px] font-medium text-stone-800 truncate leading-none">
                                                {c.Name || '—'}
                                            </p>
                                            <p className="text-[11px] text-indigo-400 truncate mt-0.5">
                                                {c.Email || '—'}
                                            </p>
                                        </td>
                                        <td className="py-2.5 px-2 pr-4 align-middle">
                                            <p className="text-[12px] text-stone-600 tabular-nums whitespace-nowrap">
                                                {c.ContactNumber || '—'}
                                            </p>
                                            {c.City && (
                                                <p className="text-[11px] text-stone-400 mt-0.5 truncate">{c.City}</p>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}

                            {/* ── Load more row ── */}
                            {hasMore && (
                                <tr>
                                    <td colSpan={3} className="px-4 py-3 bg-white">
                                        <button
                                            onClick={e => { e.stopPropagation(); setVisibleCount(v => v + PAGE_SIZE); }}
                                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-stone-300 text-[12px] font-medium text-stone-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/40 transition-all cursor-pointer"
                                        >
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                                <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            Load {Math.min(PAGE_SIZE, remaining)} more
                                            <span className="text-[11px] text-stone-400 font-normal">
                                                ({remaining} remaining)
                                            </span>
                                        </button>
                                    </td>
                                </tr>
                            )}

                            {/* Bottom padding row so last item isn't flush against edge */}
                            <tr><td colSpan={3} className="py-2" /></tr>
                        </tbody>
                    </table>
                    </div>
                )}
            </div>

            {/* ── AI Response ── */}
            {(isLoading || aiResponse) && (
                <div className="flex-shrink-0 mx-3 mt-2 rounded-xl bg-indigo-50 border border-indigo-200 overflow-hidden">
                    {/* Response header */}
                    <div className="flex items-center justify-between px-3.5 pt-3 pb-2 border-b border-indigo-100">
                        <div className="flex items-center gap-1.5">
                            <div className={`w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center flex-shrink-0 ${isLoading ? 'animate-pulse' : ''}`}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill="white" />
                                </svg>
                            </div>
                            <span className="text-[11px] font-semibold text-indigo-700 tracking-wide">
                                AI Response
                            </span>
                        </div>
                        {isLoading && (
                            <span className="text-[10.5px] text-indigo-400 font-medium flex items-center gap-1">
                                Processing
                                <span className="inline-flex gap-0.5 ml-0.5">
                                    <span className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce [animation-delay:0ms]" />
                                    <span className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce [animation-delay:150ms]" />
                                    <span className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce [animation-delay:300ms]" />
                                </span>
                            </span>
                        )}
                        {isStreaming && !isLoading && (
                            <span className="text-[10.5px] text-indigo-400 font-medium">Typing...</span>
                        )}
                    </div>

                    {/* Response body */}
                    <div className="px-3.5 py-3 min-h-[72px]">
                        {isLoading && !streamedText && (
                            <div className="flex flex-col gap-2 pt-1">
                                <div className="h-2.5 bg-indigo-200/70 rounded-full w-4/5 animate-pulse" />
                                <div className="h-2.5 bg-indigo-200/70 rounded-full w-3/5 animate-pulse [animation-delay:150ms]" />
                                <div className="h-2.5 bg-indigo-200/70 rounded-full w-2/3 animate-pulse [animation-delay:300ms]" />
                            </div>
                        )}
                        {streamedText && (
                            <p className="text-[13px] text-stone-700 leading-relaxed">
                                {streamedText}
                                {isStreaming && (
                                    <span className="inline-block w-0.5 h-3.5 bg-indigo-500 ml-0.5 align-middle animate-pulse" />
                                )}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* ── Prompt area ── */}
            <div className="flex-shrink-0 bg-white border-t border-stone-200 px-3 pt-2.5 pb-3 flex flex-col gap-2">

                {/* Selection pill */}
                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[11.5px] font-medium text-indigo-500">
                            {selectedIds.length} customer{selectedIds.length !== 1 ? 's' : ''} selected
                        </span>
                    </div>
                )}

                {/* Textarea prompt box */}
                <div className={`relative rounded-xl border overflow-hidden transition-all
                    ${selectedIds.length === 0
                        ? 'border-stone-200 bg-stone-50 opacity-60 pointer-events-none'
                        : 'border-stone-200 bg-stone-50 focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100'}`}
                >
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={prompt}
                        onChange={e => { setPrompt(e.target.value); autoResize(); }}
                        onKeyDown={handleKeyDown}
                        disabled={selectedIds.length === 0 || isLoading}
                        placeholder={
                            selectedIds.length === 0
                                ? 'Select customers above to begin...'
                                : 'e.g. Send a follow-up email, summarise their status...'
                        }
                        className="w-full min-h-[44px] max-h-[120px] px-3 pt-2.5 pb-9 bg-transparent border-none outline-none resize-none text-[13px] text-stone-800 placeholder-stone-400 leading-snug"
                    />
                    <div className="absolute bottom-1.5 left-3 right-2 flex items-center justify-between">
                        <span className="text-[10px] text-stone-400 pointer-events-none select-none">
                            {isLoading ? 'Processing...' : 'Enter ↵ send · Shift+Enter new line'}
                        </span>
                        <button
                            onClick={handleSubmit}
                            disabled={!prompt.trim() || selectedIds.length === 0 || isLoading}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer
                                ${prompt.trim() && selectedIds.length > 0 && !isLoading
                                    ? 'bg-gradient-to-br from-indigo-600 to-indigo-500 text-white shadow-sm shadow-indigo-200 hover:scale-105 active:scale-95'
                                    : isLoading
                                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-500 text-white cursor-not-allowed'
                                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}
                        >
                            {isLoading ? (
                                <div className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                            ) : (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {selectedIds.length === 0 && (
                    <p className="text-center text-[11px] text-stone-400">
                        Select at least one customer to use the AI agent
                    </p>
                )}
            </div>
        </div>
    );
};

export default FollowupAgentWorkspace;