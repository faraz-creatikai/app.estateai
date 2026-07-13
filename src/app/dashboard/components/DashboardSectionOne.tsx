"use client";

import { useEffect, useRef, useState } from "react";
import { FaArrowTrendUp } from "react-icons/fa6";
import { MdOutlineFileDownload } from "react-icons/md";
import { LuCalendar, LuChartNoAxesColumnIncreasing, LuCalendarRange } from "react-icons/lu";
import { getCustomer, getDashboardStatsCount} from "@/store/customer";
import { useDashboardData } from "../data/useDashboardSectionOne";
import { getAllCustomerFollowups } from "@/store/customerFollowups";
import { getIncomeMarketing } from "@/store/financial/incomemarketing/incomemarketing";
import { getContact } from "@/store/contact";

// ✅ Interface for card data


export default function DashboardSectionOne() {
  // ✅ Dashboard data
  const { dashboardSectionOneCardData, setDashboardSectionOneCardData } = useDashboardData();
  const [dataLoading, setDataLoading] = useState(false);


  // ✅ Counter logic
  const [counts, setCounts] = useState<number[]>(
    dashboardSectionOneCardData.map(() => 0)
  );
  const countersRef = useRef<HTMLDivElement | null>(null);
  const [countersInView, setCountersInView] = useState<boolean>(false);

  /*  useEffect(() => {
   setCounts(dashboardSectionOneCardData.map(() => 0));
 }, [dashboardSectionOneCardData]); */

  // Observe section visibility
  useEffect(() => {
    //fetch dashboard data 
    const observer = new IntersectionObserver(
      ([entry]) => setCountersInView(entry.isIntersecting),
      { threshold: 0.5 }
    );

    if (countersRef.current) observer.observe(countersRef.current);
    return () => {
      if (countersRef.current) observer.unobserve(countersRef.current);
    };
  }, []);




  useEffect(() => {
    DashboardSectionOneDataFetch();
  }, [])

const DashboardSectionOneDataFetch = async () => {
  try {
    // 1. Fetch the computed stats from the backend
    const response = await getDashboardStatsCount();
    
    // 2. Extract the pre-calculated numbers
    const {
      totalCustomers,
      convertedLeads,
      totalContacts,
      totalIncome,
    } = response.data;

    // 3. Directly update the state
    setDashboardSectionOneCardData((prev) => {
      const newData = [...prev];
      
      // 🔹 Leads
      newData[0] = { ...newData[0], value: totalCustomers || 0 };
      
      // 🔹 Followups (Converted Leads)
      newData[1] = { ...newData[1], value: convertedLeads || 0 };
      
      // 🔹 Contacts
      newData[2] = { ...newData[2], value: totalContacts || 0 };
      
      // 🔹 Income
      newData[3] = { 
        ...newData[3], 
        value: totalIncome || 0, 
        prefix: "₹" 
      };
      
      return newData;
    });

    setDataLoading(true);
  } catch (err) {
    console.error("Failed to load dashboard stats:", err);
  }
};


  // Start count animation
  useEffect(() => {
    if (!countersInView) return;

    const intervals: number[] = [];

    dashboardSectionOneCardData.forEach((item, index) => {
      const increment = item.value < 10 ? 1 : Math.ceil(item.value / 50);
      const intervalTime = item.value < 10 ? 200 : 30; // slower for very small numbers


      if (dataLoading) {
        const intervalId = window.setInterval(() => {
          setCounts((prev) => {
            const newCounts = [...prev];
            if (newCounts[index] < item.value) {
              newCounts[index] = Math.min(newCounts[index] + increment, item.value);
            }
            return newCounts;
          });
        }, intervalTime);


        intervals.push(intervalId);
      }

    });

    return () => intervals.forEach((id) => clearInterval(id));
  }, [countersInView, dashboardSectionOneCardData]);

  // Data Apis



  return (
    <div ref={countersRef} className="p-4 ">
      <section className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-3 my-5 w-full">
        {dashboardSectionOneCardData.map((item, index) => (
          <div
            key={index}
            className="bg-white shadow-2xl rounded-md overflow-hidden"
          >
            <div className="flex justify-between items-center mb-2 px-4 py-[10px]">
              <div>
                <h2
                  className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${item.footerlineColor}`}
                >
                  {item.prefix || ""}
                  {counts[index]}
                </h2>
                <p className="text-xs font-medium pt-[2px]">{item.name}</p>
              </div>
              <span className="text-[22px]">{item.icon}</span>
            </div>

            <div
              className={`p-3 text-white text-sm flex justify-between items-center bg-gradient-to-r ${item.footerlineColor}`}
            >
              <span>%</span>
              <span className="text-[17px]">
                <FaArrowTrendUp />
              </span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
