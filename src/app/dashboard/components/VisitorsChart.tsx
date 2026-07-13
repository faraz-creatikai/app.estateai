"use client";
import { getVisiterChartStats } from "@/store/customer";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  ResponsiveContainer,
} from "recharts";
// 🚨 Import your new API endpoint here!


// -------------------- TYPES --------------------

interface ChartData {
  date: string;
  newVisitor: number;
  oldVisitor: number;
  lastMonth: number;
  avg: number;
}

interface ActiveIndicators {
  oldVisitor: boolean;
  newVisitor: boolean;
  lastMonth: boolean;
  avg: boolean;
}

interface CustomLegendProps {
  activeIndicators: ActiveIndicators;
  toggleIndicator: (key: keyof ActiveIndicators) => void;
}

interface DotProps {
  cx?: number;
  cy?: number;
  stroke?: string;
}

// -------------------- CUSTOM LEGEND --------------------

const CustomLegend: React.FC<CustomLegendProps> = ({
  activeIndicators,
  toggleIndicator,
}) => {
  const indicators = [
    { key: "oldVisitor", label: "Old Customers", color: "#f87171" },
    { key: "newVisitor", label: "New Customers", color: "#dc2626" },
    { key: "lastMonth", label: "Last Month Customer", color: "#22c55e" },
    { key: "avg", label: "Average Customer", color: "#f59e0b" },
  ] as const;

  return (
    <div className="flex flex-wrap gap-6 mb-4 px-4 sm:px-8">
      {indicators.map((indicator) => (
        <div
          key={indicator.key}
          className={`flex items-center gap-2 text-sm font-semibold cursor-pointer p-2 rounded-lg ${
            activeIndicators[indicator.key]
              ? "bg-blue-50 border-blue-200 shadow-sm"
              : "opacity-60"
          }`}
          onClick={() => toggleIndicator(indicator.key)}
        >
          <span
            className="w-6 h-3"
            style={{ backgroundColor: indicator.color }}
          />
          {indicator.label}
        </div>
      ))}
    </div>
  );
};

// -------------------- CUSTOM DOT --------------------

const CustomDot: React.FC<DotProps> = ({ cx, cy, stroke }) => {
  if (!cx || !cy) return null;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill="#fff"
      stroke={stroke}
      strokeWidth={2}
    />
  );
};

// -------------------- MAIN COMPONENT --------------------

export default function VisitorsChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [activeIndicators, setActiveIndicators] = useState<ActiveIndicators>({
    oldVisitor: true,
    newVisitor: true,
    lastMonth: true,
    avg: true,
  });

  // -------------------- FETCH OPTIMIZED DATA --------------------
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await getVisiterChartStats();
        
        // Defensive check for Axios vs Standard Fetch unwrapping
        const payload = response?.data?.data ? response.data.data : response?.data;
        
        if (payload && Array.isArray(payload)) {
          setChartData(payload);
        }
      } catch (error) {
        console.error("Failed to load visitor chart stats:", error);
      }
    };
    
    fetchChartData();
  }, []);

  // -------------------- TOGGLE --------------------
  const toggleIndicator = (key: keyof ActiveIndicators) => {
    setActiveIndicators((prev) => {
      const activeCount = Object.values(prev).filter(Boolean).length;
      if (activeCount === 1 && prev[key]) return prev;
      return { ...prev, [key]: !prev[key] };
    });
  };

  const hasActiveIndicators = Object.values(activeIndicators).some(Boolean);

  // -------------------- UI --------------------
  return (
    <div className="w-full bg-white p-4 max-w-4xl shadow-md">
      <div className="flex justify-end mb-9">
        <button
          onClick={() =>
            setActiveIndicators({
              oldVisitor: true,
              newVisitor: true,
              lastMonth: true,
              avg: true,
            })
          }
          className="flex items-center gap-2 bg-gradient-to-r cursor-pointer 
          from-[var(--color-primary)] to-[var(--color-secondary-darker)] 
          text-white px-4 py-2 rounded-md"
        >
          All Customers
        </button>
      </div>

      <CustomLegend
        activeIndicators={activeIndicators}
        toggleIndicator={toggleIndicator}
      />

      <div className="flex relative items-center mx-6">
        <div className="flex-1 h-[250px] mt-3">
          {hasActiveIndicators ? (
            <ResponsiveContainer width="100%" height={270}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 40, left: 10, bottom: 20 }}
                barGap={-19}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.6} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tick={{ fontSize: 14 }}
                />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={false} />

                {activeIndicators.oldVisitor && (
                  <Bar
                    dataKey="oldVisitor"
                    fill="#f87171"
                    barSize={24}
                    name="Old Customers"
                  />
                )}

                {activeIndicators.newVisitor && (
                  <Bar
                    dataKey="newVisitor"
                    fill="#dc2626"
                    barSize={16}
                    name="New Customers"
                  />
                )}

                {activeIndicators.lastMonth && (
                  <Line
                    type="monotone"
                    dataKey="lastMonth"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={<CustomDot stroke="#22c55e" />}
                    name="Last Month Customer"
                  />
                )}

                {activeIndicators.avg && (
                  <Line
                    type="monotone"
                    dataKey="avg"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={<CustomDot stroke="#f59e0b" />}
                    name="Average Customer"
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
              No indicators selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
}