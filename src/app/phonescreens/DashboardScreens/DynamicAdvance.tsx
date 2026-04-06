"use client";

import AddButton from "@/app/component/buttons/AddButton";
import { PlusSquare } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";

type DynamicAdvanceProps = {
  children: React.ReactNode;
  addUrl?: string; // optional prop
};


const DynamicAdvance = ({ children, addUrl="/customer/add" }: DynamicAdvanceProps) => {
  const [open, setOpen] = useState(false);



  return (
    <div className="w-full">
      {/* 🔽 Toggle Button */}
      <div className=" flex justify-between items-center">

        <div
          onClick={() => setOpen(!open)}
          className="bg-[var(--color-primary)] px-3 py-1.5 w-fit rounded-2xl my-4 mb-2 ml-0 flex items-center gap-2 cursor-pointer select-none"
        >
          <button className="text-white text-xs font-semibold">
            ADVANCED SEARCH
          </button>

          <button type="button" className="p-2 text-white hover:bg-gray-200 rounded-md">
            {open ? <IoIosArrowUp /> : <IoIosArrowDown />}
          </button>
        </div>
        <AddButton
          url={addUrl}
          text="Add"
          icon={<PlusSquare size={18} />}
        />
      </div>

      {/* 🔽 Dropdown Container */}
      {open && (
        <div className="flex flex-col justify-center items-center gap-4 p-4 mb-4 bg-white dark:bg-[var(--color-childbgdark)] border rounded-xl shadow-md">
          {children}
        </div>
      )}
    </div>
  );
};

export default DynamicAdvance;
