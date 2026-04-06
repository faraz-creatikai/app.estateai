"use client";

import { useEffect, useMemo, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { MdPhone, MdEmail } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";
import { AiOutlineHeart } from "react-icons/ai";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";

import { AiOutlineBackward, AiOutlineForward } from "react-icons/ai"
import { IoIosHeart } from "react-icons/io";
import Link from "next/link";
export interface LabelConfig {
  key: string;
  label: string;
}

interface LeadsSectionProps<T extends Record<string, any>> {
  leads: T[];
  labelLeads: LabelConfig[];
  isCustomerPage?: boolean
  isMailButton?: boolean
  isWhatsappButton?: boolean
  isCallButton?: boolean
  isFollowupButton?:boolean
  onWhatsappClick?: (lead: T) => void;
  onMailClick?: (lead: T) => void;
  onFavourite?: (lead: T) => void;

}

export default function LeadsSection<T extends Record<string, any>>({
  leads,
  labelLeads,
  isCustomerPage = false,
  isMailButton = true,
  isWhatsappButton = true,
  isCallButton = true,
  isFollowupButton=false,
  onWhatsappClick,
  onMailClick,
  onFavourite,
}: LeadsSectionProps<T>) {
  const [toggleSearchDropdown, setToggleSearchDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsperpage = 10;

  const totalPages = Math.ceil(leads.length / itemsperpage);
  const startIndex = (currentPage - 1) * itemsperpage;
  const paginatedLeads = leads.slice(startIndex, startIndex + itemsperpage);


  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);

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
  return (
    <>
      {/* LEAD CARDS */}
      <div className="px-2 pb-4">
        {paginatedLeads.map((lead, index) => (
          <div key={index} className="w-full  bg-white shadow-md rounded-xl overflow-hidden border border-gray-200 mb-5">
            <div className="bg-[var(--color-primary)] h-2"></div>

            <div className="flex justify-between items-start p-4">
              <div>
                {labelLeads.map((item, j) => (
                  <div
                    key={j}
                    className="mb-2 grid grid-cols-[1fr_auto_2fr] items-center gap-2"
                  >
                    <span className="font-semibold text-black">
                      {item.label}
                    </span>

                    <span className="text-gray-500">-</span>

                    <span className="text-gray-700  break-words ">
                      {String(lead[item.key])}
                    </span>
                  </div>

                ))}
              </div>

              {
                isCustomerPage && <button
                  onClick={() => onFavourite?.(lead)}
                  className="p-2 bg-gray-100 rounded-full shadow"
                >

                  {lead.isFavourite ? <IoIosHeart size={20} className="text-[var(--color-primary)]" /> : <AiOutlineHeart size={20} className="text-[var(--color-primary)]" />}
                </button>
              }

            </div>

            <div className="bg-[var(--color-primary)] p-3 flex justify-between">
              {}
              <Link href={"/followups/customer/add"} className="text-white border border-white px-3 text-sm py-1 rounded-full">
                FOLLOW UP
              </Link>
              

              <div className="flex items-center gap-5">
                {
                  isCallButton && <a href={`tel:+91${String(lead["ContactNumber"]) ?? String(lead["ContactNo"]) ?? ""}`}>
                    <MdPhone size={20} className="text-white" />
                  </a>
                }

                {/* <MdEmail size={20} className="text-white" /> */}
                {
                  isMailButton && <button
                    onClick={() => onMailClick?.(lead)}
                    className="text-white p-2"
                  >
                    <MdEmail size={20} />
                  </button>
                }

                {/* <a href={`https://wa.me/+91${String(lead["ContactNumber"]) ?? String(lead["ContactNo"]) ?? ""}`} target="_blank">
                  <FaWhatsapp size={20} className="text-white" />
                </a> */}
                {
                  isWhatsappButton && <button
                    onClick={() => onWhatsappClick?.(lead)}
                    className="text-white p-2"
                  >
                    <FaWhatsapp size={20} />
                  </button>
                }


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
                disabled={currentPage === totalPages}
                className={`h-[30px] w-[30px] bg-white rounded-full text-sm grid place-items-center ${currentPage === totalPages ? "bg-gray-200 opacity-50 cursor-not-allowed" : "bg-white "}`}><GrFormNext /> </button>
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
