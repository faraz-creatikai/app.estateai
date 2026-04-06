"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrickWallFire, Podcast, School, Cable, ShieldUser, NotebookTabs, Home } from "lucide-react";

import Link from "next/link";
import { MdClose } from "react-icons/md";
import { TfiClose } from "react-icons/tfi";
import { useAuth } from "@/context/AuthContext";

export default function MobileHamburger() {


   const { admin, isLoading, login } = useAuth();
  const data = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <Home size={22} />,
  },
  {
    title: "Campaign",
    url: `${admin?.role!=="administrator"?"/masters/campaign/allcampaigns":"/masters/campaign"}`,
    icon: <BrickWallFire size={22} />,
  },
  {
    title: "Customer",
    url: "/customer",
    icon: <Podcast size={22} />,
  },
  {
    title: "FollowUp",
    url: "/followups/customer",
    icon: <School size={22} />,
  },
  {
    title: "Contact",
    url: "/contact",
    icon: <Podcast size={22} />,
  },
  {
    title: "Contact FollowUp",
    url: "/followups/contact",
    icon: <School size={22} />,
  },
  {
    title: "Status Type",
    url: "/masters/status-type",
    icon: <NotebookTabs size={22} />,
  },
  {
    title: "Favroites",
    url: "/favourites",
    icon: <Cable size={22} />,
  },
  {
    title: "Task",
    url: "/task",
    icon: <ShieldUser size={22} />,
  },
  {
    title: " Report",
    url: `/reports/customer`,
    icon: <BrickWallFire size={22} />
  }

]
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
    const [currentYear,setCurrentYear]=useState<number | null>(null);

useEffect(()=>{
   const date = new Date();
    setCurrentYear(date.getFullYear());
},[]);
  // Close on outside click + ESC
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }

    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  return (
    <>

      <div className=" sm:hidden  grid place-items-center">
        {/* Only MOBILE screen — md:hidden */}

        {/* Hamburger Button */}
        <button
          ref={buttonRef}
          onClick={() => setOpen(!open)}
          className=" mx-4 relative  outline-0 w-6 h-6 flex items-center justify-center"
        >
          <motion.div
            initial={false}
            animate={open ? "open" : "closed"}
            className="relative w-5 h-5"
          >
            {/* Top line */}
            <motion.span
              style={{ transformOrigin: "center center" }}
              variants={{
                open: { rotate: 45, y: 0 },
                closed: { rotate: 0, y: -7 },
              }}
              transition={{ duration: 0.28 }}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-[3px] bg-white rounded"
            />

            {/* Middle line */}
            <motion.span
              style={{ transformOrigin: "center center" }}
              variants={{
                open: { opacity: 0, scaleX: 0.9 },
                closed: { opacity: 1, scaleX: 1 },
              }}
              transition={{ duration: 0.18 }}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-[3px] bg-white rounded"
            />

            {/* Bottom line */}
            <motion.span
              style={{ transformOrigin: "center center" }}
              variants={{
                open: { rotate: -45, y: 0 },
                closed: { rotate: 0, y: 7 },
              }}
              transition={{ duration: 0.28 }}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-[3px] bg-white rounded"
            />
          </motion.div>
        </button>

        {/* hamburger button */}
        <AnimatePresence>
          {open && <button
            ref={buttonRef}
            onClick={() => setOpen(!open)}
            className=" mx-4 fixed rounded-sm top-4 p-2 bg-white dark:bg-[var(--color-childbgdark)] dark:text-white z-[2001] left-64 text-xl  outline-0  flex items-center justify-center"
          ><TfiClose  size={20}/></button>}
        </AnimatePresence>

        {/* Left Side Overlay */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-black/70"
              onClick={() => setOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* LEFT SLIDE-IN MENU */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="menu"
              ref={menuRef}
              initial={{ x: "-100%", opacity: 0 }}
              animate={{
                x: 0,
                opacity: 1,
                transition: {
                  type: "spring",
                  stiffness: 180,
                  damping: 18,
                },
              }}
              exit={{
                x: "-100%",
                opacity: 0,
                transition: { duration: 0.2 },
              }}
              className="fixed top-0 left-0 h-screen  w-[260px] bg-white dark:bg-[var(--color-childbgdark)] dark:text-white  backdrop-blur-md shadow-xl"
              style={{ zIndex: 2000 }}
            >
              <div className="flex flex-col max-h-screen overflow-y-auto p-5 gap-5">
                <div className=" self-start mb-2">
                  <div className=" relative">
                    <h2 className="  font-bold text-2xl">i<span className=" text-[var(--color-primary)]">big</span>data</h2>
                    <p className=" absolute top-0  right-12 text-[8px] rounded-xl text-[var(--color-primary)] font-normal border border-[var(--color-primary)] px-[5px] py-[1px]">Domain</p>
                  </div>
                  <p className=" text-gray-400 text-sm font-light mt-1">Domain Insights, Made Easy</p>
                </div>
                {data.map((item, index) => (
                  <Link
                    key={index}
                    href={item.url}
                    className="flex items-center gap-3 text-gray-950 dark:text-white text-lg py-2 px-2 rounded hover:bg-white/20 transition"
                    onClick={() => setOpen(false)}
                  >
                    <span>{item.icon}</span>
                    <span>{item.title}</span>
                  </Link>
                ))}
                <div className=" text-gray-400 w-full text-center text-sm my-10">&copy;{currentYear} ibigdata, all rights reserved </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}
