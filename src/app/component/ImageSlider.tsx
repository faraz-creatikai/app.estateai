import { useState } from "react";

// ─── ImageSlider Component ───────────────────────────────────────────────────

export function ImageSlider({ images, height = 'h-32' }: { images?: string[]; height?: string }) {
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-200 border-2 border-dashed rounded-xl w-full max-w-[500px] min-h-32 flex items-center justify-center p-2 ${height}`}>

        <span className="text-gray-400 text-sm">No Image</span>
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  return (
    <div className="relative w-full max-w-[500px] bg-gray-200 dark:bg-gray-600 rounded-md overflow-hidden select-none">
      {/* Image */}
      <img
        key={current}
        src={images[current]}
        alt={`Customer Image ${current + 1}`}
        className={`w-full ${height} object-contain rounded-md`}
      />

      {/* Controls — only when more than 1 image */}
      {images.length > 1 && (
        <>
          {/* Prev button */}
          <button
            onClick={prev}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/65 active:scale-95 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors text-base leading-none"
            aria-label="Previous image"
          >
            ‹
          </button>

          {/* Next button */}
          <button
            onClick={next}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/65 active:scale-95 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors text-base leading-none"
            aria-label="Next image"
          >
            ›
          </button>

          {/* Counter badge (top-right) */}
          <span className="absolute top-1.5 right-1.5 bg-black/40 text-white text-[10px] font-medium rounded-full px-1.5 py-0.5 leading-tight">
            {current + 1}/{images.length}
          </span>

          {/* Dot indicators (bottom-center) */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 items-center">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                aria-label={`Go to image ${idx + 1}`}
                className={`rounded-full transition-all duration-200 ${
                  idx === current
                    ? "bg-white w-2 h-2"
                    : "bg-white/50 w-1.5 h-1.5 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

