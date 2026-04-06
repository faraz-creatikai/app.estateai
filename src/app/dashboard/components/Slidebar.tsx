"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Icons component
const Icon = ({ name, className }: { name: string; className?: string }) => {
  const icons: { [key: string]: string } = {
    house: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8 M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
    user: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 circle cx=12 cy=7 r=4",
    "square-plus": "rect width=18 height=18 x=3 y=3 rx=2 path d=M8 12h8 path d=M12 8v8",
    info: "circle cx=12 cy=12 r=10 path d=M12 16v-4 path d=M12 8h.01",
    "square-pen": "path d=M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 path d=M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",
    pointer: "path d=M22 14a8 8 0 0 1-8 8 path d=M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2 path d=M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1 path d=M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10 path d=M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15",
    diamond: "path d=M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z",
    "chevron-right": "path d=m9 18 6-6-6-6",
    "indian-rupee": "path d=M6 3h12 path d=M6 8h12 path d=m6 13 8.5 8 path d=M6 13h3 path d=M9 13c6.667 0 6.667-10 0-10",
    "user-round": "circle cx=12 cy=8 r=5 path d=M20 21a8 8 0 0 0-16 0",
    "message-square": "path d=M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",
    coins: "circle cx=8 cy=8 r=6 path d=M18.09 10.37A6 6 0 1 1 10.34 18 path d=M7 6h1v4 path d=m16.71 13.88.7.71-2.82 2.82",
    "shopping-cart": "circle cx=8 cy=21 r=1 circle cx=19 cy=21 r=1 path d=M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12",
  };

  const paths = icons[name]?.split(" ") || [];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {paths.map((path, index) => {
        if (path.startsWith("circle")) {
          const props = path.split(" ");
          const circleProps: any = {};
          props.forEach(prop => {
            const [key, value] = prop.split("=");
            if (key && value) circleProps[key] = value;
          });
          return <circle key={index} {...circleProps} />;
        }
        if (path.startsWith("rect")) {
          const props = path.split(" ");
          const rectProps: any = {};
          props.forEach(prop => {
            const [key, value] = prop.split("=");
            if (key && value) rectProps[key] = value;
          });
          return <rect key={index} {...rectProps} />;
        }
        if (path.startsWith("path")) {
          const d = path.replace("path d=", "");
          return <path key={index} d={d} />;
        }
        return null;
      })}
    </svg>
  );
};

// Menu items data
const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: "house" },
  { href: "/customer", label: "Customers", icon: "user" },
  { href: "/followups/customer", label: "Customer Follow Up", icon: "square-plus" },
  { href: "/contact", label: "Contact", icon: "user" },
  { href: "/followups/contact", label: "Contact Follow Up", icon: "square-plus" },
  { href: "/company_project", label: "Company Project", icon: "user" },
  { href: "/company_project/enquiry", label: "Company Project Enquiry", icon: "info" },
  { href: "/schedules", label: "Schedules", icon: "square-pen" },
  { href: "/task", label: "Task", icon: "pointer" },
  { href: "#", label: "Masters", icon: "diamond", hasChildren: true },
  { href: "#", label: "Financial", icon: "indian-rupee", hasChildren: true },
  { href: "/requirements", label: "Requirements", icon: "house" },
  { href: "/favourites", label: "Favourites", icon: "house" },
  { href: "#", label: "E-commerce", icon: "shopping-cart", hasChildren: true },
  { href: "/users", label: "Users", icon: "user-round" },
  { href: "/imports/customer", label: "Customer Import", icon: "message-square" },
  { href: "/imports/contact", label: "Contact Import", icon: "message-square" },
  { href: "/database_manager", label: "Database Manager", icon: "coins" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (label: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <div className="relative flex w-full min-w-0 flex-col p-2">
      <ul className="flex w-full min-w-0 flex-col gap-1">
        {menuItems.map((item) => {
          const isItemActive = isActive(item.href);
          const isOpen = openItems.has(item.label);
          
          return (
            <li key={item.label} className="group/menu-item relative">
              {item.hasChildren ? (
                // Collapsible item with children
                <div className="group/collapsible">
                  <button
                    onClick={() => toggleItem(item.label)}
                    className={`flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-sidebar-ring active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 cursor-pointer text-[16px] ${
                      isItemActive
                        ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    <Icon name={item.icon} className="size-4 shrink-0" />
                    <span className="truncate flex-1">{item.label}</span>
                    <Icon 
                      name="chevron-right" 
                      className={`ml-auto size-4 transition-transform duration-200 ${
                        isOpen ? "rotate-90" : ""
                      }`} 
                    />
                  </button>
                  
                  {/* Children content would go here */}
                  {isOpen && (
                    <div className="mt-1 ml-4">
                      {/* Add child menu items here */}
                    </div>
                  )}
                </div>
              ) : (
                // Regular menu item
                <Link href={item.href}>
                  <button
                    className={`flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-sidebar-ring active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 cursor-pointer text-[16px] ${
                      isItemActive
                        ? "bg-[var(--color-primary)] text-white font-medium"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    <Icon name={item.icon} className="size-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}