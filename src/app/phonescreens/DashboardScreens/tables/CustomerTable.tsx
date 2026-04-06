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
    hasMoreCustomers?: boolean; // like desktop
    fetchMore?: () => Promise<void>; // async fetch more
    duplicateContacts?: Record<string, boolean>;
    onViewDuplicate?: (contactNumber: string) => void;
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
}: LeadsSectionProps<T>) {
    const [toggleSearchDropdown, setToggleSearchDropdown] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsperpage = 10;
    const [viewAll, setViewAll] = useState(false);
    const [viewLeadData, setViewLeadData] = useState<T | null>(null);

    const totalPages = Math.ceil(leads.length / itemsperpage);
    const startIndex = (currentPage - 1) * itemsperpage;
    const paginatedLeads = leads.slice(startIndex, startIndex + itemsperpage);
    /* const [loader, setLoader] = useState(true); */
    const router = useRouter();

    const nextPage = async () => {
        // Normal client-side pagination
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
            return;
        }

        // Last page → fetch more from server (if available)
        if (hasMoreCustomers && fetchMore) {
            await fetchMore(); // fetchMore should update leads
            // After leads update, recompute totalPages
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
    /*    useEffect(() => {
           if (!leads || leads.length === 0) {
               setLoader(true);
           } else {
               setLoader(false);
           }
       }, [leads]) */

    const followupRedirect = () => {
        router.push('/followups/customer');
    }


    if (loader) {
        return <div className=" px-2 pb-4">
            <div className="w-full flex justify-center items-center py-10 text-lg text-gray-500">
                Loading Customers...
            </div>
        </div>
    }
    return (
        <>
            {
                viewAll && (
                    <PopupMenu onClose={() => { setViewAll(false) }}>
                        <div className="  bg-white dark:bg-[var(--color-childbgdark)] relative w-full h-full   flex flex-col">
                            <button className=" absolute top-3 left-3 cursor-pointer z-[2000] bg-gray-100/50 rounded-full p-1 self-end mb-1 " onClick={() => {
                                setViewAll(false)
                                setViewLeadData(null)
                            }}><GoArrowLeft size={26} /></button>
                            <CustomerImageSlider
                                images={
                                    viewLeadData?.CustomerImage?.length
                                        ? viewLeadData.CustomerImage
                                        : ["/siteplan2.png"]
                                }
                            />


                            <div className=" max-h-[calc(80vh-240px)] absolute top-[380px] w-full bg-white dark:bg-[var(--color-childbgdark)] overflow-y-auto px-4 py-6 rounded-t-3xl ">
                                <h2 className=" text-2xl font-bold text-center mb-8 text-[var(--color-primary)]">Customer Information</h2>
                                {allLabelLeads?.map((item, j) => (
                                    <div
                                        key={j}
                                        className={`flex ${viewLeadData?.[item.key]?.length > 30 && "flex-col gap-2"} my-1 justify-between p-3 bg-gray-50 dark:bg-[var(--color-secondary-darker)] rounded-lg`}
                                    >
                                        <span className="font-semibold text-gray-700 dark:text-[var(--color-txtlight)] text-sm">
                                            {item.label}
                                        </span>
                                        {/* item.AssignTo.map((e: any) => e.name + ", ") || 'N/A' */}
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
                                                /*  onClick={() => {
                                                   setSelectedAddress(viewLeadData?.[item.key]);
                                                   setIsMapOpen(true);
                                                 }} */
                                                onClick={() => onGoogleMapViewAddress?.(viewLeadData?.[item.key])}
                                            >
                                                {viewLeadData?.[item.key] ?? ""}
                                            </span>
                                        ) : item.label === "AssignTo" ? (<span className="font-semibold text-gray-700 dark:text-[var(--color-txtlight)] text-sm">
                                            {Array.isArray(viewLeadData?.[item.key]) &&
                                                viewLeadData[item.key].length > 0
                                                ? viewLeadData[item.key].map((e: any) => e.name).join(", ")
                                                : "N/A"}
                                        </span>) : (
                                            <span className={`text-gray-900 dark:text-[var(--color-txtlight)] font-medium text-right max-w-[60%] text-sm ${(viewLeadData?.[item.key]?.length > 30) && "flex-col gap-2 max-w-full"} `}>
                                                <p className="  text-left"> {Array.isArray(viewLeadData?.[item.key])
                                                    ? viewLeadData[item.key].length > 0
                                                        ? viewLeadData[item.key]
                                                            .map((e: any) =>
                                                                typeof e === "object" ? e.name || JSON.stringify(e) : e
                                                            )
                                                            .join(", ")
                                                        : "N/A"
                                                    : typeof viewLeadData?.[item.key] === "object" &&
                                                        viewLeadData?.[item.key] !== null
                                                        ? viewLeadData[item.key].name || JSON.stringify(viewLeadData[item.key])
                                                        : viewLeadData?.[item.key] ?? "N/A"}</p>
                                            </span>
                                        )}

                                    </div>

                                ))}
                            </div>
                        </div>
                    </PopupMenu>
                )
            }
            {/* LEAD CARDS */}
            <div className="px-0 pb-4">
                {paginatedLeads.length === 0 && (
                    <div className="w-full flex justify-center items-center py-10 text-lg text-gray-500">
                        No customer available
                    </div>
                )}
                {paginatedLeads.map((lead, index) => (
                    <div key={index} className="w-full  bg-white dark:bg-[var(--color-childbgdark)] shadow-md rounded-xl overflow-hidden border border-gray-200 dark:border-none dark:my-2 mb-0">
                        <div className="bg-[var(--color-primary)] h-2"></div>

                        <div className="flex justify-between items-start p-4">
                            <div>
                                {labelLeads.map((item, j) => (
                                    <div
                                        key={j}
                                        className="mb-2 grid grid-cols-[max-content_auto_1fr] items-center gap-2"
                                    >
                                        <span className="font-semibold text-black dark:text-[var(--color-primary-light)]">
                                            {item.label}
                                        </span>

                                        <span className="text-gray-500">-</span>

                                        <span className="text-gray-700 dark:text-[var(--color-primary-lighter)] break-words line-clamp-2">
                                            {Array.isArray(lead[item.key])
                                                ? lead[item.key].length > 0
                                                    ? lead[item.key].map((e: any) =>
                                                        typeof e === "object" ? e.name || JSON.stringify(e) : e
                                                    ).join(", ")
                                                    : "N/A"
                                                : typeof lead[item.key] === "object" && lead[item.key] !== null
                                                    ? JSON.stringify(lead[item.key])
                                                    : lead[item.key] ?? "N/A"}
                                        </span>
                                    </div>

                                ))}
                            </div>



                            <div className="flex flex-col min-w-[120px]  items-center gap-4 ">
                                {/* <button className=" cursor-pointer text-sm self-end text-[var(--color-primary)] hover:text-[var(--color-primary-darker)]" onClick={() =>{
                                     setViewAll(true)
                                     setViewLeadData(lead)
                                    }
                            } >View All</button> */}


                                <div className=" bg-gray-300 overflow-hidden dark:bg-[var(--color-secondary-darker)] w-[120px] h-[80px] grid place-items-center rounded-md  self-end">
                                    <img width={120} className={`  ${lead.SitePlan?.length > 0 ? "w-full object-cover" : "w-[60px] h-[60px]"}`} src={lead.SitePlan?.length > 0 ? lead.SitePlan : "/siteplan2.png"} onClick={() => {
                                        setViewAll(true)
                                        setViewLeadData(lead)
                                    }} />
                                </div>
                                <div className=" flex justify-between w-full">

                                    <button
                                        className="p-2 bg-[var(--color-primary-lighter)] dark:bg-[var(--color-primary)] self-end rounded-full shadow"
                                        onClick={() => {
                                            onViewFollowup?.(lead._id, lead.Name)
                                        }}>
                                        <UserPlus size={18} className="text-[var(--color-primary)] dark:text-white" />
                                    </button>
                                    <button
                                        onClick={() => onFavourite?.(lead)}
                                        className="p-2 bg-gray-100 dark:bg-[var(--color-primary)] self-end rounded-full shadow"
                                    >

                                        {lead.isFavourite ? <IoIosHeart size={20} className="text-[var(--color-primary)] dark:text-white" /> : <AiOutlineHeart size={20} className="text-[var(--color-primary)] dark:text-white" />}
                                    </button>
                                </div>
                                <div className=" flex justify-between w-full">
                                    {duplicateContacts?.[String(lead.ContactNumber)] ? (
                                        <button
                                            onClick={() =>
                                                onViewDuplicate?.(String(lead.ContactNumber))
                                            }
                                            className="p-2 bg-[var(--color-primary-lighter)] dark:bg-[var(--color-primary)] self-end rounded-full shadow"
                                        >
                                            <FaEye size={18} className="text-[var(--color-primary)] dark:text-white" />
                                        </button>
                                    ) : <div />}
                                    <button
                                        onClick={() => onEdit?.(lead._id)}
                                        className=" p-2 bg-gray-100 dark:bg-[var(--color-primary)]  self-end rounded-full shadow"
                                    >
                                        <MdEdit size={20} className="text-[var(--color-primary)] dark:text-white" />

                                    </button>

                                </div>
                            </div>

                        </div>

                        <div className="bg-[var(--color-primary)] p-3 flex justify-between">
                            { }
                            <button onClick={() => onAdd?.(lead._id)} className="text-white border border-white px-3 text-sm py-2 rounded-full">
                                FOLLOW UP
                            </button>


                            <div className="flex items-center gap-10 max-[320px]:gap-4">

                                <a href={`tel:+91${String(lead["ContactNumber"]) ?? String(lead["ContactNo"]) ?? ""}`} className="" onClick={() => onAdd?.(lead._id)}>
                                    <MdPhone size={25} className="text-white" />
                                </a>


                                {/* <MdEmail size={20} className="text-white" /> */}

                                {/* <a href={`https://wa.me/+91${String(lead["ContactNumber"]) ?? String(lead["ContactNo"]) ?? ""}`} target="_blank">
                  <FaWhatsapp size={20} className="text-white" />
                </a> */}

                                <button
                                    onClick={() => onMailClick?.(lead)}
                                    className="text-white"
                                >
                                    <MdEmail size={25} />
                                </button>


                                <button
                                    onClick={() => onWhatsappClick?.(lead)}
                                    className="text-white"
                                >
                                    <FaWhatsapp size={25} />
                                </button>



                            </div>
                        </div>
                    </div>
                ))}
                {/* animated button */}
                {paginatedLeads.length > 0 && (
                    <div className="flex items-center justify-center w-full">
                        <div className="flex items-center space-x-2 p-2  rounded-lg">
                            <button onClick={() => setCurrentPage(1)} className=" h-[30px] w-[30px] bg-white rounded-full text-sm grid place-items-center"><AiOutlineBackward /> </button>
                            <button onClick={prevPage}
                                disabled={currentPage === 1}
                                className={`h-[30px] w-[30px] bg-white rounded-full text-sm grid place-items-center ${currentPage === 1 ? "bg-gray-200 opacity-50 cursor-not-allowed" : "bg-white "}`}><GrFormPrevious /></button>
                            <AnimatePresence mode="popLayout">
                                {pages.map((num, i) => (
                                    <motion.button
                                        key={i}
                                        onClick={() => setCurrentPage(num)}
                                        className={`h-[30px] w-[30px]  rounded-full text-sm grid place-items-center  ${num === currentPage ? " bg-[var(--color-primary)] text-white w-[35px] h-[35px]" : "bg-white text-black w-[30px] h-[30px]"
                                            }`}>
                                        {num}
                                    </motion.button>
                                ))}
                            </AnimatePresence>

                            <button
                                onClick={nextPage}
                                disabled={!hasMoreCustomers && currentPage === totalPages}
                                className={`h-[30px] w-[30px] bg-white rounded-full text-sm grid place-items-center ${currentPage === totalPages && !hasMoreCustomers ? "bg-gray-200 opacity-50 cursor-not-allowed" : "bg-white"
                                    }`}
                            >
                                <GrFormNext />
                            </button>

                            <button onClick={() => setCurrentPage(totalPages)} className=" h-[30px] w-[30px] bg-white rounded-full text-sm grid place-items-center"><AiOutlineForward /> </button>
                        </div>
                    </div>)}
            </div>
            {/* <div>
        <button onClick={prevPage} 
        disabled = {currentPage === 1}
          className={`px-2 py-2 rounded-full border
      ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-[var(--color-primary)] text-white"}
    `}>prev</button>
     <button onClick={nextPage} 
        disabled = {currentPage === totalPages}
          className={`px-4 py-2 rounded-xl border
      ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-[var(--color-primary)] text-white"}
    `}>next</button>
      </div> */}

        </>
    );
}
