// useDashboardData.tsx
import { useState } from "react";
import { MdOutlineFileDownload } from "react-icons/md";
import { LuCalendar, LuChartNoAxesColumnIncreasing, LuCalendarRange } from "react-icons/lu";

export interface DashboardCard {
  name: string;
  value: number;
  prefix?: string;
  bg: string;
  icon: React.ReactNode;
  footerlineColor: string;
}


interface User {
  id: string;
  name: string;
  customers: number;
  percentage?: number;
}

export interface UserFollowupsInterface {
  users: User[];
}

interface LocationData {
  location: string;
  customers: number;
}

export interface FeedbackData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface FollowupByMonthsData {
  thisMonth: string | number;
  nextMonth: string | number;
}

export function useDashboardData() {
  const [dashboardSectionOneCardData, setDashboardSectionOneCardData] = useState<DashboardCard[]>([
    {
      name: "Total Customers",
      value: 0,
      bg: "bg-gradient-to-r from-sky-500 to-sky-800",
      icon: <LuChartNoAxesColumnIncreasing />,
      footerlineColor: "from-sky-800 to-sky-500",
    },
    {
      name: "Converted Leads",
      value: 0,
      bg: "bg-gradient-to-r from-red-500 to-red-800",
      icon: <LuCalendarRange />,
      footerlineColor: "from-red-800 to-red-500",
    },
    {
      name: "Total Contacts",
      value: 0,
      bg: "bg-gradient-to-r from-teal-500 to-teal-800",
      icon: <LuCalendar />,
      footerlineColor: "from-teal-800 to-teal-500",
    },
    {
      name: "Total Revenue",
      value: 0,
      prefix: "₹",
      bg: "bg-gradient-to-r from-indigo-500 to-indigo-800",
      icon: <MdOutlineFileDownload />,
      footerlineColor: "from-indigo-800 to-indigo-500",
    },
  ]);

  // Mock data structure - replace with your actual backend data
  const [userCustomers, setUserCustomers] =
    useState<UserFollowupsInterface>({
      users: [],
    });

  const [locationStats, setLocationStats] = useState<LocationData[]>([]);
   const [feedbackStats, setFeedbackStats] = useState<FeedbackData[]>([]);
   const [followupByMonths, setFollowupByMonths] = useState<FollowupByMonthsData>({thisMonth:"",nextMonth:""});

  return {
    dashboardSectionOneCardData,
    setDashboardSectionOneCardData,
    userCustomers,
    setUserCustomers,
    locationStats,
    setLocationStats,
    feedbackStats,
    setFeedbackStats,
    followupByMonths,
    setFollowupByMonths
  };
}
