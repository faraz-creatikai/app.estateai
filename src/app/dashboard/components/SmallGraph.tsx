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
// 🚨 Import your new optimized API call here!
import { getFollowupChartStats } from "@/store/customer"; 

type ChartMonth = {
  name: string;
  followups: number;
};

const Dashboard = () => {
  const { followupByMonths, setFollowupByMonths } = useDashboardData();
  const [chartData, setChartData] = useState<ChartMonth[]>([]);

  useEffect(() => {
    const loadFollowups = async () => {
      try {
        const response = await getFollowupChartStats();
        
        // Defensive check for Axios vs Standard Fetch unwrapping
        const payload = response?.data?.data ? response.data.data : response?.data;
        
        if (!payload || !Array.isArray(payload) || payload.length === 0) return;

        // 1. Set the chart data directly
        setChartData(payload);

        // 2. Set the summary (Index 0 is this month, Index 1 is next month)
        setFollowupByMonths({
          thisMonth: payload[0]?.followups ?? 0,
          nextMonth: payload[1]?.followups ?? 0,
        });

      } catch (error) {
        console.error("Error fetching followups:", error);
      }
    };

    loadFollowups();
  }, [setFollowupByMonths]);

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