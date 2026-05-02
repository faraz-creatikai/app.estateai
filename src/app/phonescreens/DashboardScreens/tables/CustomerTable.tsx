"use client";

import { useEffect, useMemo, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { MdPhone, MdEmail } from "react-icons/md";
import { FaEye, FaWhatsapp } from "react-icons/fa";
import { AiOutlineHeart } from "react-icons/ai";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";

import { AiOutlineBackward, AiOutlineForward } from "react-icons/ai"
import { IoIosHeart, IoMdClose } from "react-icons/io";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PopupMenu from "@/app/component/popups/PopupMenu";
import { GoArrowLeft } from "react-icons/go";
import CustomerImageSlider from "@/app/component/slides/CustomerImageSlider";
import { UserPlus } from "lucide-react";
import { customerGetDataInterface } from "@/store/customer.interface";
export interface LabelConfig {
    key: string;
    label: string;
}

interface LeadsSectionProps<T extends Record<string, any>> {
    leads: T[];
    labelLeads: LabelConfig[];
    allLabelLeads?: LabelConfig[];
    isCustomerPage?: boolean
    onAdd?: (id: string) => void;
    onEdit?: (id: string) => void;
    onWhatsappClick?: (lead: T) => void;
    onMailClick?: (lead: T) => void;
    onFavourite?: (lead: T) => void;
    onViewFollowup?: (id: string, Name: string) => void;
    onGoogleMapViewAddress?: (Address: string) => void;
    loader?: boolean;
    hasMoreCustomers?: boolean;
    fetchMore?: () => Promise<void>;
    duplicateContacts?: Record<string, boolean>;
    onViewDuplicate?: (contactNumber: string) => void;
    renderActions?: (item: T) => React.ReactNode;
}

export default function CustomerTable<T extends Record<string, any>>({
    leads,
    labelLeads,
    allLabelLeads,
    onAdd,
    onEdit,
    onWhatsappClick,
    onMailClick,
    onFavourite,
    onViewFollowup,
    loader,
    hasMoreCustomers,
    fetchMore,
    duplicateContacts,
    onViewDuplicate,
    onGoogleMapViewAddress,
    renderActions,
}: LeadsSectionProps<T>) {
    const [toggleSearchDropdown, setToggleSearchDropdown] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsperpage = 10;
    const [viewAll, setViewAll] = useState(false);
    const [viewLeadData, setViewLeadData] = useState<T | null>(null);

    const totalPages = Math.ceil(leads.length / itemsperpage);
    const startIndex = (currentPage - 1) * itemsperpage;
    const paginatedLeads = leads.slice(startIndex, startIndex + itemsperpage);
    const router = useRouter();

    const nextPage = async () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
            return;
        }
        if (hasMoreCustomers && fetchMore) {
            await fetchMore();
            const newTotalPages = Math.ceil((leads.length + itemsperpage) / itemsperpage);
            if (currentPage < newTotalPages) {
                setCurrentPage(prev => prev + 1);
            }
        }
    };

    const prevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    }

    const getDisplayedPages = () => {
        if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
        if (currentPage === 1) return [1, 2, 3];
        if (currentPage === totalPages) return [totalPages - 2, totalPages - 1, totalPages];
        return [currentPage - 1, currentPage, currentPage + 1];
    };
    const pages = getDisplayedPages();

    const followupRedirect = () => {
        router.push('/followups/customer');
    }

    if (loader) {
        return (
            <div className="px-2 pb-4">
                <div className="w-full flex flex-col justify-center items-center gap-3 py-16 text-gray-400">
                    <div className="w-8 h-8 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">Loading Customers...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            {viewAll && (
                <PopupMenu onClose={() => { setViewAll(false) }}>
                    <div className="bg-white dark:bg-[var(--color-childbgdark)] relative w-full h-full flex flex-col">
                        <button
                            className="absolute top-3 left-3 cursor-pointer z-[2000] bg-gray-100/50 rounded-full p-1 self-end mb-1"
                            onClick={() => { setViewAll(false); setViewLeadData(null); }}
                        >
                            <GoArrowLeft size={26} />
                        </button>
                        <CustomerImageSlider
                            images={
                                viewLeadData?.CustomerImage?.length
                                    ? viewLeadData.CustomerImage
                                    : ["/workbyhomeicon.jpeg"]
                            }
                        />
                        <div className="max-h-[calc(80vh-240px)] absolute top-[380px] w-full bg-white dark:bg-[var(--color-childbgdark)] overflow-y-auto px-4 py-6 rounded-t-3xl">
                            <h2 className="text-2xl font-bold text-center mb-8 text-[var(--color-primary)]">Customer Information</h2>
                            {allLabelLeads?.map((item, j) => (
                                <div
                                    key={j}
                                    className={`flex ${viewLeadData?.[item.key]?.length > 30 && "flex-col gap-2"} my-1 justify-between p-3 bg-gray-50 dark:bg-[var(--color-secondary-darker)] rounded-lg`}
                                >
                                    <span className="font-semibold text-gray-700 dark:text-[var(--color-txtlight)] text-sm">
                                        {item.label}
                                    </span>
                                    {item.label === "Contact No" ? (
                                        <a
                                            href={`tel:+91${viewLeadData?.[item.key] ?? ""}`}
                                            className="text-[var(--color-primary)] font-medium hover:underline text-sm"
                                        >
                                            {viewLeadData?.[item.key] ?? ""}
                                        </a>
                                    ) : item.label === "Address" ? (
                                        <span
                                            className="text-[var(--color-primary)] cursor-pointer underline text-sm text-right max-w-[60%]"
                                            onClick={() => onGoogleMapViewAddress?.(viewLeadData?.[item.key])}
                                        >
                                            {viewLeadData?.[item.key] ?? ""}
                                        </span>
                                    ) : item.label === "AssignTo" ? (
                                        <span className="font-semibold text-gray-700 dark:text-[var(--color-txtlight)] text-sm">
                                            {Array.isArray(viewLeadData?.[item.key]) && viewLeadData[item.key].length > 0
                                                ? viewLeadData[item.key].map((e: any) => e.name).join(", ")
                                                : "N/A"}
                                        </span>
                                    ) : (
                                        <span className={`text-gray-900 dark:text-[var(--color-txtlight)] font-medium text-right max-w-[60%] text-sm ${(viewLeadData?.[item.key]?.length > 30) && "flex-col gap-2 max-w-full"}`}>
                                            <p className="text-left">
                                                {Array.isArray(viewLeadData?.[item.key])
                                                    ? viewLeadData[item.key].length > 0
                                                        ? viewLeadData[item.key].map((e: any) => typeof e === "object" ? e.name || JSON.stringify(e) : e).join(", ")
                                                        : "N/A"
                                                    : typeof viewLeadData?.[item.key] === "object" && viewLeadData?.[item.key] !== null
                                                        ? viewLeadData[item.key].name || JSON.stringify(viewLeadData[item.key])
                                                        : viewLeadData?.[item.key] ?? "N/A"}
                                            </p>
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </PopupMenu>
            )}

            {/* ── LEAD CARDS ── */}
            <div className="px-3 pb-4 flex flex-col gap-3">

                {paginatedLeads.length === 0 && (
                    <div className="w-full flex flex-col justify-center items-center gap-2 py-16 text-gray-400">
                        <span className="text-4xl">🙅</span>
                        <span className="text-sm font-medium">No customers available</span>
                    </div>
                )}

                {paginatedLeads.map((lead, index) => (
                    <div
                        key={index}
                        className="w-full bg-white dark:bg-[var(--color-childbgdark)] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm"
                    >
                        {/* ── Accent top strip ── */}
                        <div className="h-1 w-full bg-[var(--color-primary)]" />

                        {/* ── Card body ── */}
                        <div className="flex gap-3 p-3">

                            {/* LEFT: label data */}
                            <div className="flex-1 min-w-0">
                                {labelLeads.map((item, j) => (
                                    <div
                                        key={j}
                                        className="grid grid-cols-[max-content_8px_1fr] items-start gap-x-2 gap-y-0.5 mb-1.5"
                                    >
                                        <span className="text-xs font-semibold text-gray-500 dark:text-[var(--color-primary-light)] whitespace-nowrap leading-5">
                                            {item.label}
                                        </span>
                                        <span className="text-xs text-gray-300 dark:text-white/20 leading-5">—</span>
                                        <span className="text-xs text-gray-800 dark:text-[var(--color-primary-lighter)] font-medium leading-5 break-words line-clamp-2">
                                            {Array.isArray(lead[item.key])
                                                ? lead[item.key].length > 0
                                                    ? lead[item.key].map((e: any) => typeof e === "object" ? e.name || JSON.stringify(e) : e).join(", ")
                                                    : "N/A"
                                                : typeof lead[item.key] === "object" && lead[item.key] !== null
                                                    ? JSON.stringify(lead[item.key])
                                                    : lead[item.key] ?? "N/A"}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* RIGHT: image + all action buttons in one unified column */}
                            <div className="flex flex-col items-center gap-2 shrink-0 w-[76px]">

                                {/* Thumbnail */}
                                <div
                                    className="w-[72px] h-[56px] rounded-xl overflow-hidden bg-gray-100 dark:bg-[var(--color-secondary-darker)] border border-gray-200 dark:border-white/10 flex items-center justify-center cursor-pointer shrink-0"
                                    onClick={() => { setViewAll(true); setViewLeadData(lead); }}
                                >
                                    <img
                                        width={72}
                                        className={lead.SitePlan?.length > 0 ? "w-full h-full object-cover" : "w-8 h-8 opacity-40"}
                                        src={lead.SitePlan?.length > 0 ? lead.SitePlan : "/workbyhomeicon.jpeg"}
                                    />
                                </div>

                                {/* ── Buttons: 2-column grid so every button lines up ── */}
                                <div className="grid grid-cols-2 gap-1.5 w-full">

                                    {/* Follow-up */}
                                    <button
                                        className="w-8 h-8 rounded-full bg-[var(--color-primary-lighter)] dark:bg-[var(--color-primary)] flex items-center justify-center shadow-sm hover:scale-105 transition-transform cursor-pointer"
                                        onClick={() => onViewFollowup?.(lead._id, lead.Name)}
                                    >
                                        <UserPlus size={15} className="text-[var(--color-primary)] dark:text-white" />
                                    </button>

                                    {/* Favourite */}
                                    <button
                                        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[var(--color-primary)] flex items-center justify-center shadow-sm hover:scale-105 transition-transform cursor-pointer"
                                        onClick={() => onFavourite?.(lead)}
                                    >
                                        {lead.isFavourite
                                            ? <IoIosHeart size={16} className="text-[var(--color-primary)] dark:text-white" />
                                            : <AiOutlineHeart size={16} className="text-[var(--color-primary)] dark:text-white" />}
                                    </button>

                                    {/* Duplicate / spacer */}
                                    {duplicateContacts?.[String(lead.ContactNumber)] ? (
                                        <button
                                            className="w-8 h-8 rounded-full bg-amber-50 dark:bg-[var(--color-primary)] flex items-center justify-center shadow-sm hover:scale-105 transition-transform cursor-pointer"
                                            onClick={() => onViewDuplicate?.(String(lead.ContactNumber))}
                                        >
                                            <FaEye size={14} className="text-amber-500 dark:text-white" />
                                        </button>
                                    ) : (
                                        <div className="w-8 h-8" /> /* spacer keeps grid aligned */
                                    )}

                                    {/* Edit */}
                                    <button
                                        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[var(--color-primary)] flex items-center justify-center shadow-sm hover:scale-105 transition-transform cursor-pointer"
                                        onClick={() => onEdit?.(lead._id)}
                                    >
                                        <MdEdit size={16} className="text-[var(--color-primary)] dark:text-white" />
                                    </button>

                                    {/* renderActions — spans both columns */}
                                    {renderActions && (
                                        <div className="col-span-2 w-full">
                                            {renderActions(lead)}
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>

                        {/* ── Bottom action bar ── */}
                        <div className="bg-[var(--color-primary)] px-4 py-2.5 flex items-center justify-between">
                            <button
                                onClick={() => onAdd?.(lead._id)}
                                className="text-white border border-white/60 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                FOLLOW UP
                            </button>

                            <div className="flex items-center gap-5">
                                <a
                                    href={`tel:+91${String(lead["ContactNumber"]) ?? String(lead["ContactNo"]) ?? ""}`}
                                    onClick={() => onAdd?.(lead._id)}
                                    className="text-white/90 hover:text-white transition-colors"
                                >
                                    <MdPhone size={22} />
                                </a>

                                <button
                                    onClick={() => onMailClick?.(lead)}
                                    className="text-white/90 hover:text-white transition-colors cursor-pointer"
                                >
                                    <MdEmail size={22} />
                                </button>

                                <button
                                    onClick={() => onWhatsappClick?.(lead)}
                                    className="text-white/90 hover:text-white transition-colors cursor-pointer"
                                >
                                    <FaWhatsapp size={22} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* ── Pagination ── */}
                {paginatedLeads.length > 0 && (
                    <div className="flex items-center justify-center pt-2">
                        <div className="inline-flex items-center gap-1.5 bg-white dark:bg-[var(--color-childbgdark)] border border-gray-100 dark:border-white/10 rounded-2xl px-3 py-2 shadow-sm">

                            <button
                                onClick={() => setCurrentPage(1)}
                                className="w-7 h-7 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:bg-[var(--color-primary)] hover:text-white transition-all cursor-pointer"
                            >
                                <AiOutlineBackward size={13} />
                            </button>

                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className="w-7 h-7 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:bg-[var(--color-primary)] hover:text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <GrFormPrevious size={14} />
                            </button>

                            <AnimatePresence mode="popLayout">
                                {pages.map((num, i) => (
                                    <motion.button
                                        key={i}
                                        onClick={() => setCurrentPage(num)}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className={`rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer
                                            ${num === currentPage
                                                ? "w-8 h-8 bg-[var(--color-primary)] text-white shadow-md"
                                                : "w-7 h-7 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-100"
                                            }`}
                                    >
                                        {num}
                                    </motion.button>
                                ))}
                            </AnimatePresence>

                            <button
                                onClick={nextPage}
                                disabled={!hasMoreCustomers && currentPage === totalPages}
                                className="w-7 h-7 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:bg-[var(--color-primary)] hover:text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <GrFormNext size={14} />
                            </button>

                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                className="w-7 h-7 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:bg-[var(--color-primary)] hover:text-white transition-all cursor-pointer"
                            >
                                <AiOutlineForward size={13} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}