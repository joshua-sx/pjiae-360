import { useRef, useState, useLayoutEffect, useCallback, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

interface TableColumn {
  width?: number;
  key: string;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  label?: string;
}

interface UseTableScrollOptions {
  scrollAmount?: number;
  useColumnWidths?: boolean;
  startFromColumn?: number;
  columns?: TableColumn[];
  enableKeyboardNavigation?: boolean;
  scrollBehavior?: "auto" | "smooth";
  onColumnChange?: (idx: number, col: TableColumn) => void;
}

export function useTableScroll({
  scrollAmount = 120,
  useColumnWidths = false,
  startFromColumn = 0,
  columns = [],
  enableKeyboardNavigation = true,
  scrollBehavior = "smooth",
  onColumnChange,
}: UseTableScrollOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const current = useRef(startFromColumn);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const positions = useRef<number[]>([]);

  const calc = useCallback(() => {
    const el = ref.current;
    const pos: number[] = [];
    if (useColumnWidths && columns.length) {
      columns.reduce((acc, { width }) => {
        pos.push(acc);
        return acc + (width || 150);
      }, 0);
    } else if (el) {
      Array.from(el.children).reduce((acc, c) => {
        const w = (c as HTMLElement).offsetWidth;
        pos.push(acc);
        return acc + w;
      }, 0);
    }
    positions.current = pos;
  }, [columns, useColumnWidths]);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 0);
    setCanRight(scrollLeft + clientWidth < scrollWidth);
    
    if (useColumnWidths && columns.length && onColumnChange) {
      const best = positions.current.reduce(
        (best, p, idx) =>
          Math.abs(scrollLeft - p) < Math.abs(scrollLeft - positions.current[best])
            ? idx
            : best,
        0
      );
      if (best !== current.current) {
        current.current = best;
        onColumnChange(best, columns[best]);
      }
    }
  }, [columns, onColumnChange, useColumnWidths]);

  useLayoutEffect(() => {
    calc();
    update();
    const el = ref.current;
    if (!el) return;
    
    el.addEventListener("scroll", update);
    window.addEventListener("resize", calc);
    
    const obs = new ResizeObserver(() => {
      calc();
      update();
    });
    obs.observe(el);
    
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", calc);
      obs.disconnect();
    };
  }, [calc, update]);

  const scroll = useCallback(
    (dir: -1 | 1) => {
      const el = ref.current;
      if (!el) return;
      if (useColumnWidths && positions.current.length) {
        const next = Math.max(
          0,
          Math.min(
            current.current + dir,
            positions.current.length - 1
          )
        );
        el.scrollTo({ left: positions.current[next], behavior: scrollBehavior });
      } else {
        el.scrollBy({ left: scrollAmount * dir, behavior: scrollBehavior });
      }
    },
    [scrollAmount, scrollBehavior, useColumnWidths]
  );

  useHotkeys(
    "ArrowLeft,ArrowRight",
    (e) => {
      e.preventDefault();
      if (e.key === "ArrowLeft" && canLeft) scroll(-1);
      else if (e.key === "ArrowRight" && canRight) scroll(1);
    },
    { enabled: enableKeyboardNavigation }
  );

  return {
    containerRef: ref,
    canScrollLeft: canLeft,
    canScrollRight: canRight,
    scrollLeft: () => scroll(-1),
    scrollRight: () => scroll(1),
  };
}