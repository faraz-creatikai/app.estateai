"use client";
import { IoMdNotificationsOutline } from "react-icons/io";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { CiLogout } from "react-icons/ci";
import { FaPlus } from "react-icons/fa";
import { LuKey } from "react-icons/lu";
import { IoPersonOutline } from "react-icons/io5";
import { useEffect, useRef, useState } from "react";
import PopUps from "./PopUps";
import { useRouter } from "next/navigation";
import ProtectedRoute from "./ProtectedRoutes";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useThemeCustom } from "@/context/ThemeContext";

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState<
    "notifications" | "quickAdd" | "adminMail" | null
  >(null);
  const router = useRouter();
  const { admin, logout } = useAuth();

  const notificationsRef = useRef<HTMLLIElement>(null);
  const quickAddRef = useRef<HTMLLIElement>(null);
  const adminMailRef = useRef<HTMLLIElement>(null);
  const { dark, toggleTheme } = useThemeCustom();


  const quickadds = [
    {name: "Add References", link: "/masters/references/add"},
    {name: "Add City", link: "/masters/city/add"},
    {name: "Add Location", link: "/masters/locations/add"},
    {name: "Add Functional Area", link: "/masters/functional-areas/add"},
    {name: "Add Industry", link: "/masters/industries/add"},
    {name: "Add Campaign", link: "/masters/campaign/add"},
    {name: "Add Income", link: "/masters/incomes/add"},
    {name: "Add Expenses", link: "/masters/expenses/add"},
    {name: "Add Status Type", link: "/masters/status-type/add"},
    {name: "Add Mail Template", link: "/masters/mail-templates/add"},
    {name: "Add Whatsapp Template", link: "/masters/whatsapp-templates/add"},
    {name: "Add Payment Method", link: "/masters/payment-methods/add"}
  ]


  // outside click handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target as Node) &&
        quickAddRef.current &&
        !quickAddRef.current.contains(e.target as Node) &&
        adminMailRef.current &&
        !adminMailRef.current.contains(e.target as Node)
      ) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logoutDashboard = async () => {
    await logout();
    router.push("/admin");
  };

  // Only transition classes for dropdowns
  const transitionClasses =
    "transition-all duration-300 transform origin-top";

  return (
    <ProtectedRoute>
      <div className="flex justify-end items-center bg-white max-sm:bg-[var(--color-primary)] max-sm:text-white text-gray-800">
        {/* <div className=" max-md:hidden" /> */}
         <button
                                  onClick={toggleTheme}
                                  className="p-2 rounded-md hover:bg-gray-200  transition"
                                >
                                  {dark ? <Sun size={18} /> : <Moon size={18} />}
                                </button>
        <nav className="px-2" style={{ zIndex: 1000 }}>
          <ul className="flex">
            {/* Notifications */}
            <li ref={notificationsRef} className="grid place-items-center relative max-md:hidden">
              <div
                className="grid place-items-center w-full h-full max-md:text-xs text-gray-800 cursor-pointer p-4 max-md:p-2 hover:bg-gray-100"
                onClick={() =>
                  setOpenMenu(openMenu === "notifications" ? null : "notifications")
                }
                onMouseEnter={() => setOpenMenu("notifications")}
              >
                <IoMdNotificationsOutline className="text-xl" />
              </div>

              <div
                className={`absolute top-[56px] md:right-0 z-50 max-md:right-[-125px] ${transitionClasses} ${openMenu === "notifications"
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
                  }`}
                   style={{zIndex:1000}}
              >
                <PopUps>
                  <div className="flex flex-col w-[300px]  max-md:w-[270px] min-h-[400px]">
                    <div className="flex justify-between items-center py-4 px-4 w-full text-lg bg-gray-200">
                      <h3 className="text-gray-400">Notifications</h3>
                      <p className=" text-base text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] cursor-pointer">view all</p>
                    </div>
                    <div>{/* notification list */}</div>
                  </div>
                </PopUps>
              </div>
            </li>

            {/* Quick Add */}
            <li ref={quickAddRef} className="flex items-center relative max-md:hidden z-50 gap-1">
              <div
                className="flex items-center gap-2 w-full h-full text-gray-800 cursor-pointer p-4 max-md:p-2 hover:bg-gray-100"
                onClick={() =>
                  setOpenMenu(openMenu === "quickAdd" ? null : "quickAdd")
                }
                onMouseEnter={() => setOpenMenu("quickAdd")}
              >
                <FaPlus />
                <span className="max-md:hidden">Quick Add</span>
                {openMenu === "quickAdd" ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
              </div>

              <div
                className={`absolute top-[56px] right-0 z-50 max-md:right-[-70px] ${transitionClasses} ${openMenu === "quickAdd"
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
                  }`}
                  style={{zIndex:1000}}
              >
                <PopUps>
                  <div className="flex flex-col border-t-[3px] border-t-[var(--color-primary)] text-gray-600 max-h-[calc(100vh-70px)] [&::-webkit-scrollbar]:hidden overflow-auto">
                    {quickadds.map((item,i) => (
                      <Link
                        key={item.name+i}
                        href={`${item.link}`}
                        onClick={()=>setOpenMenu(null)}
                        className="flex items-center gap-2 hover:bg-gray-100 py-3 px-4"
                      >
                        <FaPlus className="text-gray-600" />
                        <p className=" whitespace-nowrap">{item.name}</p>
                      </Link>
                    ))}
                  </div>
                </PopUps>
              </div>
            </li>

            {/* Admin Mail */}
            <li ref={adminMailRef} className="flex items-center relative cursor-pointer gap-2">
              <div
                className="flex items-center gap-2 w-full h-full text-gray-800 max-sm:text-white p-4 max-md:p-2 hover:bg-gray-100"
                onClick={() =>
                  setOpenMenu(openMenu === "adminMail" ? null : "adminMail")
                }
                onMouseEnter={() => setOpenMenu("adminMail")}
              >
                <span className="max-md:hidden">Admin mail</span>
                {openMenu === "adminMail" ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
              </div>

              <div
                className={`absolute top-[56px] z-50 right-0 max-md:right-[-40px] ${transitionClasses} ${openMenu === "adminMail"
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
                  }`}
                   style={{zIndex:1000}}
              >
                <PopUps>
                  <div className="flex flex-col border-t-[3px] border-t-[var(--color-primary)] max-sm:border-t-[var(--color-primary)]">
                    <div className="flex items-center gap-2 hover:bg-gray-100 py-3 px-3" onClick={() => {
                      setOpenMenu(null);
                      router.push(`/users/edit/${admin?._id}`)
                    }}>
                      <IoPersonOutline />
                      <p>Edit Profile</p>
                    </div>
                    <div
                      className="flex items-center gap-2 hover:bg-gray-100 py-3 px-3"
                      onClick={() => {
                        setOpenMenu(null);
                        router.push("/users/change_password");
                      }}
                    >
                      <LuKey />
                      <p>Change Password</p>
                    </div>
                    <div className="flex items-center gap-2 hover:bg-gray-100 py-3 px-3"
                      onClick={() => {
                        setOpenMenu(null);
                        logoutDashboard();
                      }}
                    >
                      <CiLogout />
                      <p>Logout</p>
                    </div>
                  </div>
                </PopUps>
              </div>
            </li>

            {/* Logout button */}
            <li
              className="grid place-items-center relative cursor-pointer text-xl p-4 max-md:px-2 hover:bg-gray-100"
              onClick={logoutDashboard}
            >
              <CiLogout />
            </li>
          </ul>
        </nav>
      </div>
    </ProtectedRoute>
  );
}
