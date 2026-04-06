// hooks/useHorizontalScroll.ts
import { useRef, useEffect } from "react";

export default function useHorizontalScroll() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const TOLERANCE = 1; // px tolerance for floating point rounding

    const clamp = (val: number, min: number, max: number) =>
      Math.max(min, Math.min(max, val));

    const onWheel = (e: WheelEvent) => {
      // Many mice / touchpads provide both deltaX and deltaY.
      // Use deltaX first (explicit horizontal gesture), otherwise use deltaY as horizontal intent.
      const horizDelta = e.deltaX || e.deltaY;
      const vertDelta = e.deltaY;

      // Current scroll metrics
      const scrollLeft = el.scrollLeft;
      const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);

      const atLeft = scrollLeft <= TOLERANCE;
      const atRight = scrollLeft >= maxScrollLeft - TOLERANCE;

      // If the input suggests horizontal movement (deltaX) or vertical but we want to convert to horizontal:
      if (Math.abs(horizDelta) > 0) {
        // If user is trying to scroll right (positive delta) and there's room to scroll right
        if (horizDelta > 0 && !atRight) {
          el.scrollLeft = clamp(scrollLeft + horizDelta, 0, maxScrollLeft);
          e.preventDefault();
          return;
        }

        // If user is trying to scroll left (negative delta) and there's room to scroll left
        if (horizDelta < 0 && !atLeft) {
          el.scrollLeft = clamp(scrollLeft + horizDelta, 0, maxScrollLeft);
          e.preventDefault();
          return;
        }

        // at an edge and attempting to scroll beyond it → fall through to allow vertical scroll
        return;
      }

      // If horizDelta === 0 (rare), handle purely vertical wheel converting to horizontal scroll when possible
      // i.e., user scrolls the mouse wheel vertically but we want to scroll the table horizontally
      if (Math.abs(vertDelta) > 0) {
        // scrolling down -> want to move right
        if (vertDelta > 0 && !atRight) {
          el.scrollLeft = clamp(scrollLeft + vertDelta, 0, maxScrollLeft);
          e.preventDefault();
          return;
        }

        // scrolling up -> want to move left
        if (vertDelta < 0 && !atLeft) {
          el.scrollLeft = clamp(scrollLeft + vertDelta, 0, maxScrollLeft);
          e.preventDefault();
          return;
        }

        // If at the respective edge, allow vertical scrolling (do NOTHING / don't preventDefault)
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return ref;
}
