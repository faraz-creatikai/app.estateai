import { useEffect } from "react";

type UseClickOutsideProps = {
  ref: React.RefObject<HTMLElement | null>;
  handler: () => void;
  enabled?: boolean; // optional (only listen when true)
};

export function useClickOutside({
  ref,
  handler,
  enabled = true,
}: UseClickOutsideProps) {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;
      if (!el || el.contains(event.target as Node)) return;

      handler();
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler, enabled]);
}
