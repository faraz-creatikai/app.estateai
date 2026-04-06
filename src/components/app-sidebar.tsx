"use client";

import * as React from "react";
import {
  Home,
  User,
  ShoppingCart,
  Info,
  Pointer,
  IndianRupee,
  Diamond,
  MessageSquare,
  PlusSquare,
  PenSquareIcon,
  User2,
  LineChart,
  LucideCoins,
  ShieldUser,
  Settings,
  UsersIcon,
} from "lucide-react";

import { NavMain } from "../components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { title } from "process";
import { useAuth } from "@/context/AuthContext";
import { FaRobot } from "react-icons/fa";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Customers",
      url: "/customer",
      icon: User,
    },
    {
      title: "Customer Follow Up",
      url: "/followups/customer",
      icon: PlusSquare,
    },
    {
      title: "Contact",
      url: "/contact",
      icon: User,
    },
    {
      title: "Contact Follow Up",
      url: "/followups/contact",
      icon: PlusSquare,
    },
        {
      title: "Clients",
      url: "/clients",
      icon: UsersIcon,
    },
    {
      title: "Company Project",
      url: "/company_project",
      icon: User,
    },
    {
      title: "Company Project Enquiry",
      url: "/company_project/enquiry",
      icon: Info,
    },
    /* {
      title: "Customer Enquiry",
      url: "/customer/enquiry",
      icon: Info,
    }, */
    {
      title: "Ai Agents",
      url: "/aiagents",
      icon: FaRobot,
    },
    {
      title: "Schedules",
      url: "/schedules",
      icon: PenSquareIcon,
    },
    {
      title: "Task",
      url: "/task",
      icon: Pointer,
    },
    {
      title: "Masters",
      url: "#",
      icon: Diamond,
      items: [
        {
          title: "Customer Fields",
          url: "/masters/customerfields",
        },
        {
          title: "Campaign",
          url: "/masters/campaign",
        },
        {
          title: "Types",
          url: "/masters/customer-types",
        },
        {
          title: "Customer Subtype",
          url: "/masters/customer-subtype",
        },
        {
          title: "Lead Type",
          url: "/masters/leadtype",
        },
        {
          title: "City",
          url: "/masters/city",
        },
        {
          title: "Locations",
          url: "/masters/locations",
        },
        {
          title: "Sub Locations",
          url: "/masters/sublocation",
        },
        {
          title: "Facilities",
          url: "/masters/facilities",
        },
        {
          title: "Amenities",
          url: "/masters/amenities",
        },
        {
          title: "Builder Sliders",
          url: "/masters/builder-sliders",
        },
        {
          title: "Fuctional Areas",
          url: "/masters/functional-areas",
        },
        {
          title: "Industries",
          url: "/masters/industries",
        },
        {
          title: "Contact Campaign",
          url: "/masters/contact-campaign",
        },
        {
          title: "Contact Type",
          url: "/masters/contact-type",
        },
        {
          title: "References",
          url: "/masters/references",
        },
        {
          title: "Price",
          url: "/masters/price",
        },
        {
          title: "Expenses",
          url: "/masters/expenses",
        },
        {
          title: "Incomes",
          url: "/masters/incomes",
        },
        {
          title: "Status Type",
          url: "/masters/status-type",
        },
        {
          title: "Contact Status Type",
          url: "/masters/contact-statustype",
        },
        {
          title: "Payment Methods",
          url: "/masters/payment-methods",
        },
        {
          title: "Mail Templates",
          url: "/masters/mail-templates",
        },
        {
          title: "Whatsapp Templates",
          url: "/masters/whatsapp-templates",
        },
        {
          title: "New User Requests",
          url: "/masters/newuser-requests",
        },
      ],
    },
    {
      title: "Financial",
      url: "#",
      icon: IndianRupee,
      items: [
        {
          title: "Income Marketings",
          url: "/financial/income_marketings",
        },
        {
          title: "Expense Marketings",
          url: "/financial/expense_marketings",
        },
      ],
    },
    {
      title:" Reports",
      url: "#",
      icon: LineChart,
      items:[
        {
          title: "Calling Report",
          url: "/reports/call-report",
        }
      ]
    },
    {
      title: "Requirements",
      url: "/requirements",
      icon: Home,
    },
    {
      title: "Favourites",
      url: "/favourites",
      icon: Home,
    },
    {
      title: "E-commerce",
      url: "#",
      icon: ShoppingCart,
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
        },
        {
          title: "Category",
          url: "/category",
        },
        {
          title: "Sub Category",
          url: "/sub-category",
        },
        {
          title: "Products",
          url: "/product",
        },
        {
          title: "Orders",
          url: "/orders",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "Customer Fields",
          url: "/settings/customer/customer-fields",
        },]
    },
    {
      title: "Users",
      url: "/users",
      icon: User2,
    },

    {
      title: "Customer Import",
      url: "/imports/customer",
      icon: MessageSquare,
    },
    {
      title: "Contact Import",
      url: "/imports/contact",
      icon: MessageSquare,
    },
    
    /* 
    {
      title: "Contact Report",
      url: "/reports/contact",
      icon: LineChart,
    }, */
    {
      title: "Database Manager",
      url: "/database_manager",
      icon: LucideCoins,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const { admin, isLoading } = useAuth();
  if (isLoading) return null;

  const filteredNavItems = data.navMain.filter((item) => {
    // Hide "Masters" if not admin
    if (item.title === "Masters" && admin?.role !== "administrator") {
      return false;
    }
    if(item.title === "Clients" && admin?.role !== "administrator"){
      return false;
    }
    if(item.title === "Ai Agents" && admin?.role !== "administrator"){
      return false;
    }
    return true;
  }).map((item) => {
    // Handle Settings submenu permissions
    if (item.title === "Settings") {
      return {
        ...item,
        items: item.items?.filter((subItem) => {
          // Hide "Customer Fields" if not admin
          if (
            subItem.title === "Customer Fields" &&
            admin?.role !== "administrator"
          ) {
            return false;
          }
          return true;
        }),
      };
    }

    return item;
  });
  return (
    <Sidebar collapsible="icon" className="" {...props}>
      <SidebarHeader className={`flex items-center py-1 justify-center ${state === "collapsed" ? "bg-white dark:bg-[var(--color-secondary-darker)] py-4" : "bg-gray-100"}`}>
        {/* <img src="/logo.webp" alt="App Logo" className="h-10 w-40 " /> */}
        {state === "collapsed" ? (
          <ShieldUser className="w-6 h-6" />
        ) : (
          <img
            src="/logo.webp"
            alt="App Logo"
            className="h-12 w-40"
          />
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavItems} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}