"use client";
import React from "react";

const ProgressCircle = ({
  percentage=0,
  size = 120,
  strokeWidth = 12,
  color = "#4f46e5",
  outerStrokeWidth = 2,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const outerRadius = radius + strokeWidth / 2 + 6; // space outside
  const outerCircumference = 2 * Math.PI * outerRadius;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size + 30} // extra room for outer border
        height={size + 30}
        className="rotate-[-90deg]"
      >
        {/* Outer dashed border */}
        <circle
          stroke="#d1d5db"
          fill="transparent"
          strokeWidth={outerStrokeWidth}
          r={outerRadius}
          cx={(size + 30) / 2}
          cy={(size + 30) / 2}
          strokeDasharray="4 6" // 4px stroke, 6px gap
        />

        {/* Background circle */}
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={(size + 30) / 2}
          cy={(size + 30) / 2}
        />

        {/* Progress circle */}
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          r={radius}
          cx={(size + 30) / 2}
          cy={(size + 30) / 2}
          className="transition-all duration-500 ease-in-out"
        />
      </svg>

      {/* Percentage text inside */}
      <span className="absolute text-lg font-semibold text-gray-800">
        {percentage}%
      </span>
    </div>
  );
};

export default ProgressCircle;
