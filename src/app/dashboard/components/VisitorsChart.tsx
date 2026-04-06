"use client";
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
import { getCustomer } from "@/store/customer";

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
  const [customers, setCustomers] = useState<any[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  const [activeIndicators, setActiveIndicators] =
    useState<ActiveIndicators>({
      oldVisitor: true,
      newVisitor: true,
      lastMonth: true,
      avg: true,
    });

  // -------------------- FETCH DATA --------------------

  useEffect(() => {
    const fetchData = async () => {
      const data = await getCustomer();
      setCustomers(data || []);
    };
    fetchData();
  }, []);

  // -------------------- PROCESS DATA --------------------

  useEffect(() => {
    if (!customers.length) return;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthShort = now.toLocaleString("default", {
      month: "short",
    }); // Jan, Feb, Mar

    const firstDayCurrentMonth = new Date(currentYear, currentMonth, 1);
    const firstDayLastMonth = new Date(currentYear, currentMonth - 1, 1);
    const lastDayLastMonth = new Date(currentYear, currentMonth, 0);

    // ---- Filters ----
    const oldCustomers = customers.filter(
      (c) => new Date(c.createdAt) < firstDayCurrentMonth
    );

    const newCustomers = customers.filter((c) => {
      const d = new Date(c.createdAt);
      return (
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      );
    });

    const lastMonthCustomers = customers.filter((c) => {
      const d = new Date(c.createdAt);
      return d >= firstDayLastMonth && d <= lastDayLastMonth;
    });

    // ---- Average per month ----
    const groupedByMonth: Record<string, number> = {};
    customers.forEach((c) => {
      const d = new Date(c.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      groupedByMonth[key] = (groupedByMonth[key] || 0) + 1;
    });

    const avgPerMonth =
      Object.values(groupedByMonth).reduce((a, b) => a + b, 0) /
      Object.keys(groupedByMonth).length;

    // ---- Generate Dates (1 → today, clean intervals) ----
    const today = now.getDate();
    const step = Math.ceil(today / 6);

    const result: ChartData[] = [];

    for (let day = 1; day <= today; day += step) {
       const fullDate = new Date(currentYear, currentMonth, day);

  const formattedDate = fullDate.toLocaleString("default", {
    month: "short",
    day: "numeric",
  });
      result.push({
        date: `${formattedDate}`,   // ✅ UPDATED HERE
        newVisitor: newCustomers.filter(
          (c) => new Date(c.createdAt).getDate() <= day
        ).length,
        oldVisitor: oldCustomers.length,
        lastMonth: lastMonthCustomers.length,
        avg: Math.round(avgPerMonth),
      });
    }

    // Ensure last date included
    if (!result.find((r) => r.date === `${monthShort} ${today}`)) {
        const lastFullDate = new Date(currentYear, currentMonth, today);

  const lastFormattedDate = lastFullDate.toLocaleString("default", {
    month: "short",
    day: "numeric",
  });
      result.push({
        date: lastFormattedDate,  // ✅ UPDATED HERE
        newVisitor: newCustomers.length,
        oldVisitor: oldCustomers.length,
        lastMonth: lastMonthCustomers.length,
        avg: Math.round(avgPerMonth),
      });
    }

    setChartData(result);
  }, [customers]);

  // -------------------- TOGGLE --------------------

  const toggleIndicator = (key: keyof ActiveIndicators) => {
    setActiveIndicators((prev) => {
      const activeCount = Object.values(prev).filter(Boolean).length;
      if (activeCount === 1 && prev[key]) return prev;
      return { ...prev, [key]: !prev[key] };
    });
  };

  const hasActiveIndicators = Object.values(activeIndicators).some(Boolean);

  // -------------------- UI (UNCHANGED) --------------------

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
