"use client";
import React from "react";
import Link from "next/link";
import { BsArrowRightCircle } from "react-icons/bs";
import ProgressCircle from "./ProgressCircle";

interface ProgressCircleItemProps {
  percentage: number;
  color: string;
  value: number;          // current number
  total: number;   
  status: string;
  statusSecondary: string;
  circleSize?: number;
  strokeWidth?: number;
}

const ProgressCircleItem: React.FC<ProgressCircleItemProps> = ({
  percentage,
  color,
  value,
  total,
  status,
  statusSecondary,
  circleSize = 80,
  strokeWidth = 3,
}) => {
  return (
    <div className="flex flex-col gap-1">
      {/* Pie Chart */}
      <div>
        <ProgressCircle
          percentage={percentage}
          size={circleSize}
          strokeWidth={strokeWidth}
          color={color}
        />
      </div>

      {/* Text Section */}
      <div className="text-center">
        <p>
          {value} {status} / {total} {statusSecondary}
        </p>

        <Link
          href="#"
          className="flex gap-1 items-center justify-center font-medium"
        >
          {status}
          <BsArrowRightCircle className="mt-[2px] text-sm font-light" />
        </Link>
      </div>
    </div>
  );
};

export default ProgressCircleItem;