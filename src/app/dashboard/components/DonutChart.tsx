import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useDashboardData } from "../data/useDashboardSectionOne";
import { getAllCustomerFollowups } from "@/store/customerFollowups";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";


const COLORS = ["#F87171", "#0EA5E9", "#10B981", "#FBBF24", "#A855F7", "#3B82F6"];

// ▶️ MODIFY THIS ONLY — controls how many status types to show
const TOP_N = 5;

const DonutChart = () => {
  const { feedbackStats, setFeedbackStats } = useDashboardData();
  const [loading, setLoading] = useState(true);

  const fetchFeedbackStats = async () => {
    try {
      setLoading(true);

      const response = await getAllCustomerFollowups();
      if (!response || response.length === 0) {
        setFeedbackStats([]);
        setLoading(false);
        return;
      }

      // Count StatusType occurrences
      const statusMap: Record<string, number> = {};
      response.forEach((item: any) => {
        const status = item.StatusType || "Unknown";
        if (!statusMap[status]) statusMap[status] = 0;
        statusMap[status] += 1;
      });

      // Convert to array
      let statsArray = Object.entries(statusMap).map(([name, value]) => ({
        name,
        value,
      }));

      // 🔥 Sort descending by count & keep only TOP N
      statsArray = statsArray
        .sort((a, b) => b.value - a.value)
        .slice(0, TOP_N);

      setFeedbackStats(statsArray);
    } catch (error) {
      console.error("Error fetching customer followups:", error);
      setFeedbackStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbackStats();
  }, []);

  const total = feedbackStats.reduce((sum, item) => sum + item.value, 0);

  // Custom label inside slice
  const renderLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;

    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <foreignObject
        x={x - 18}
        y={y - 12}
        width={36}
        height={24}
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            fontSize: "10px",
            fontWeight: "bold",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2px",
          }}
        >
          {`${(percent * 100).toFixed(0)}%`}
        </div>
      </foreignObject>
    );
  };


  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white shadow-md">
      <h2 className="text-base sm:text-lg font-bold text-blue-600 text-center">
        Followup Status
      </h2>

      <ResponsiveContainer width="100%" height={250} className="sm:h-[260px] md:h-[300px]">
        {loading ? (
          <div className="w-full max-w-md text-xs mx-auto p-4 bg-white shadow-md text-center text-gray-500">
            Fetching StatusTypes...
          </div>
        ) : (
          <PieChart>
            <Pie
              data={feedbackStats}
              dataKey="value"
              nameKey="name"
              innerRadius="35%"
              outerRadius="75%"
              paddingAngle={3}
              stroke="white"
              strokeWidth={2}
              label={renderLabel}
              labelLine={false}
            >
              {feedbackStats.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip<number, string>
              formatter={(value, name, item, index, payload) => {
                // value is guaranteed to be number
                const numericValue = value ?? 0; // just in case
                return `${numericValue} (${((numericValue / total) * 100).toFixed(1)}%)`;
              }}
              contentStyle={{ fontSize: "0.8rem", borderRadius: "8px" }}
            />


            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ marginTop: "10px", fontSize: "0.75rem" }}
            />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default DonutChart;
