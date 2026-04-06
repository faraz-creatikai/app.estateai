"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDashboardData } from "../data/useDashboardSectionOne";
import { getAllCustomerFollowups } from "@/store/customerFollowups";

type ChartMonth = {
  name: string;
  followups: number;
};

const Dashboard = () => {
  const { followupByMonths, setFollowupByMonths } = useDashboardData();
  const [chartData, setChartData] = useState<ChartMonth[]>([]);

  const fetchAllFollowups = async () => {
    const apiData = await getAllCustomerFollowups();
    if (!apiData) return [];

    const now = new Date();

    // Convert DD-MM-YYYY to Date
    const parseDDMMYYYY = (dateStr: string) => {
      const [day, month, year] = dateStr.split("-");
      return new Date(Number(year), Number(month) - 1, Number(day));
    };

    // Create 4 months bucket (current + next 3)
    const months = Array.from({ length: 4 }).map((_, index) => {
      const d = new Date(now.getFullYear(), now.getMonth() + index, 1);
      return {
        month: d.getMonth(),
        year: d.getFullYear(),
        label: d.toLocaleString("default", { month: "short" }),
        count: 0,
      };
    });

    // Count followups
    apiData.forEach((item: any) => {
      if (!item.StartDate && !item.FollowupNextDate) return;

      const startDate = item.StartDate ? new Date(item.StartDate) : null;
      const followupDate = item.FollowupNextDate
        ? parseDDMMYYYY(item.FollowupNextDate)
        : null;

      const checkDate = followupDate || startDate;
      if (!checkDate) return;

      months.forEach((m) => {
        if (
          checkDate.getMonth() === m.month &&
          checkDate.getFullYear() === m.year
        ) {
          m.count += 1;
        }
      });
    });

    return months;
  };

  useEffect(() => {
    const loadFollowups = async () => {
      try {
        const months = await fetchAllFollowups();
        if (!months || months.length === 0) return;

        // Set chart data
        const formattedChart = months.map((m) => ({
          name: m.label,
          followups: m.count,
        }));

        setChartData(formattedChart);

        // Set summary (this month + next month only)
        setFollowupByMonths({
          thisMonth: months[0]?.count ?? 0,
          nextMonth: months[1]?.count ?? 0,
        });
      } catch (error) {
        console.error("Error fetching followups:", error);
      }
    };

    loadFollowups();
  }, []);

  return (
    <div className="shadow-md h-full lg:w-[440px] overflow-hidden">
      {/* Chart Section */}
      <div className="w-full bg-gradient-to-r from-emerald-500 to-emerald-800">
        <div className="w-full h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              className="text-white"
              margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="0"
                stroke="#fff"
                opacity={0.2}
                vertical={false}
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                stroke="#fff"
                tickLine={false}
                tick={{ fill: "#fff", fontSize: 12 }}
              />

              <YAxis
                type="number"
                domain={[0, "auto"]}
                axisLine={false}
                tickLine={false}
                stroke="#fff"
                tick={{ fill: "#fff", fontSize: 12 }}
                allowDecimals={false}
              />

              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />

              <Bar
                dataKey="followups"
                fill="#ffffff"
                barSize={20}
                radius={[6, 6, 0, 0]}
                name="Followups"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Info Footer */}
      <div className="bg-white p-4">
        <h2 className="text-sm text-neutral-600 mb-4 text-center sm:text-left">
          Followups by months
        </h2>

        <div className="flex justify-between items-center px-6 py-4">
          <div className="text-center">
            <p className="text-xs text-gray-500">This Month</p>
            <p className="text-xl font-bold">
              {followupByMonths.thisMonth}
            </p>
          </div>

          <div className="border-r h-10"></div>

          <div className="text-center">
            <p className="text-xs text-gray-500">Next Month</p>
            <p className="text-xl font-bold">
              {followupByMonths.nextMonth}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
