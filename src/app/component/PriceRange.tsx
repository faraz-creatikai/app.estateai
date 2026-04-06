"use client";
import React, { useState, useEffect } from "react";

export default function PriceRange({ filters, handleSelectChange }: any) {
    const isRangeApplied =
  filters.MinPrice?.length > 0 || filters.MaxPrice?.length > 0;
  const PRICE_STEPS = [
    1000, 10000, 100000, 500000, 1000000,
    10000000, 50000000, 100000000, 500000000, 1000000000,
  ];

  const [minIndex, setMinIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(PRICE_STEPS.length - 1);
  const [activeThumb, setActiveThumb] = useState<"min" | "max" | null>(null);

  const percent = (index: number) =>
    (index / (PRICE_STEPS.length - 1)) * 100;

  const formatPrice = (val: number) => {
    return val.toLocaleString("en-IN");
  };

  const findClosestIndex = (price: number) => {
    let closestIndex = 0;
    let minDiff = Infinity;

    PRICE_STEPS.forEach((val, i) => {
      const diff = Math.abs(val - price);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    });

    return closestIndex;
  };

  // Sync from filters
useEffect(() => {
  if (activeThumb) return; // 🚀 prevent override while dragging

 if (!filters.MinPrice?.length && !filters.MaxPrice?.length) {
    setMinIndex(0);
    setMaxIndex(PRICE_STEPS.length - 1);
  }
}, [filters.MinPrice, filters.MaxPrice]);

  // Debounced API
useEffect(() => {
  // 🚫 Don't apply if filter is cleared
  if (!isRangeApplied && !activeThumb) return;

  const timeout = setTimeout(() => {
    handleSelectChange(
      "MinPrice",
      String(PRICE_STEPS[minIndex]),
      {
        ...filters,
        MinPrice: [String(PRICE_STEPS[minIndex])],
        MaxPrice: [String(PRICE_STEPS[maxIndex])],
      }
    );
  }, 400);

  return () => clearTimeout(timeout);
}, [minIndex, maxIndex]);

  const minPercent = percent(minIndex);
  const maxPercent = percent(maxIndex);

  return (
    <div className="w-full space-y-4">
      <label className="font-medium">Price Range</label>

      <div className="flex justify-between text-sm">
  {!isRangeApplied ? (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-dashed border-gray-200 w-full justify-center">
      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-gray-400 text-xs font-medium">No price filter applied</span>
    </div>
  ) : (
    <>
      <span>₹ {formatPrice(PRICE_STEPS[minIndex])}</span>
      <span>₹ {formatPrice(PRICE_STEPS[maxIndex])}</span>
    </>
  )}
</div>

      <div className="relative w-full h-6 flex items-center">
        {/* Background track */}
        <div className="absolute w-full h-1 bg-gray-300 rounded" />

        {/* Active range */}
        <div
          className="absolute h-1 bg-blue-500 rounded"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />
{/* MIN thumb */}
<input
  type="range"
  min={0}
  max={PRICE_STEPS.length - 1}
  step={1}
  value={minIndex}
  onChange={(e) => {
  const value = Number(e.target.value);

  if (value > maxIndex) {
    // 🔥 push max forward
    setMaxIndex(value);
  }

  setMinIndex(value);
}}
  onMouseDown={() => setActiveThumb("min")}
  onTouchStart={() => setActiveThumb("min")}
  onMouseUp={() => setActiveThumb(null)}
  onTouchEnd={() => setActiveThumb(null)}
 className={`absolute w-full appearance-none bg-transparent pointer-events-none
${activeThumb === "min" ? "z-50" : "z-30"}
[&::-webkit-slider-thumb]:pointer-events-auto
[&::-webkit-slider-thumb]:appearance-none
[&::-webkit-slider-thumb]:h-4
[&::-webkit-slider-thumb]:w-4
[&::-webkit-slider-thumb]:rounded-full
[&::-webkit-slider-thumb]:bg-blue-500
[&::-webkit-slider-thumb]:cursor-pointer
[&::-webkit-slider-thumb]:transition-transform
${activeThumb === "min" ? "[&::-webkit-slider-thumb]:scale-125" : ""}`}
/>

{/* MAX thumb */}
<input
  type="range"
  min={0}
  max={PRICE_STEPS.length - 1}
  step={1}
  value={maxIndex}
  onChange={(e) => {
  const value = Number(e.target.value);

  if (value < minIndex) {
    // 🔥 push min backward
    setMinIndex(value);
  }

  setMaxIndex(value);
}}
  onMouseDown={() => setActiveThumb("max")}
  onTouchStart={() => setActiveThumb("max")}
  onMouseUp={() => setActiveThumb(null)}
  onTouchEnd={() => setActiveThumb(null)}
  className={`absolute w-full appearance-none bg-transparent pointer-events-none
${activeThumb === "max" || !activeThumb ? "z-50" : "z-40"}
[&::-webkit-slider-thumb]:pointer-events-auto
[&::-webkit-slider-thumb]:appearance-none
[&::-webkit-slider-thumb]:h-4
[&::-webkit-slider-thumb]:w-4
[&::-webkit-slider-thumb]:rounded-full
[&::-webkit-slider-thumb]:bg-blue-500
[&::-webkit-slider-thumb]:cursor-pointer
[&::-webkit-slider-thumb]:transition-transform
${activeThumb === "max" ? "[&::-webkit-slider-thumb]:scale-125" : ""}`}
/>
      </div>
    </div>
  );
}