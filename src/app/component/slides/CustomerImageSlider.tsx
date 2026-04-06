"use client";

import { useState, useRef } from "react";

interface ImageSliderProps {
  images: string[];
}

export default function CustomerImageSlider({ images }: ImageSliderProps) {
  const [current, setCurrent] = useState(0);
  const startX = useRef<number | null>(null);

  if (!images || images.length === 0) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return;

    const diff = startX.current - e.changedTouches[0].clientX;

    if (diff > 50 && current < images.length - 1) {
      setCurrent((prev) => prev + 1);
    } else if (diff < -50 && current > 0) {
      setCurrent((prev) => prev - 1);
    }

    startX.current = null;
  };

  return (
    <div className="relative overflow-hidden  bg-gray-300 dark:bg-[var(--color-secondary-darker)] h-[400px]">
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((img, index) => (
          <div
            key={index}
            className="min-w-full flex items-center justify-center"
          >
            <img
              src={img}
              className=" w-full h-full object-cover"
              alt={`siteplan-${index}`}
            />
          </div>
        ))}
      </div>

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-[50px] left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-2 w-2 rounded-full transition-all
                ${current === index ? "bg-[var(--color-primary)] w-4" : "bg-gray-300"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
