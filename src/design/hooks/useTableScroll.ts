/**
 * Table Enhancement Hooks
 * Encapsulated scroll, sticky, and keyboard navigation logic for consistent table behavior
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface UseTableScrollOptions {
  enableStickyColumns?: boolean;
  stickyColumnWidths?: number[];
  enableKeyboardNav?: boolean;
  scrollThreshold?: number;
}

export function useTableScroll({
  enableStickyColumns = false,
  stickyColumnWidths = [],
  enableKeyboardNav = false,
  scrollThreshold = 10,
}: UseTableScrollOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
    scrollLeft: 0,
    scrollWidth: 0,
    clientWidth: 0,
  });

  // Calculate sticky column positions
  const stickyPositions = React.useMemo(() => {
    let position = 0;
    return stickyColumnWidths.map(width => {
      const currentPosition = position;
      position += width;
      return currentPosition;
    });
  }, [stickyColumnWidths]);

  // Update scroll indicators
  const updateScrollState = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const canScrollLeft = scrollLeft > scrollThreshold;
    const canScrollRight = scrollLeft < scrollWidth - clientWidth - scrollThreshold;

    setScrollState({
      canScrollLeft,
      canScrollRight,
      scrollLeft,
      scrollWidth,
      clientWidth,
    });

    // Update data attributes for CSS indicators
    container.setAttribute('data-scroll-left', canScrollLeft.toString());
    container.setAttribute('data-scroll-right', canScrollRight.toString());
  }, [scrollThreshold]);

  // Smooth scroll functions
  const scrollLeft = useCallback((distance: number = 200) => {
    const container = containerRef.current;
    if (container) {
      container.scrollBy({
        left: -distance,
        behavior: 'smooth'
      });
    }
  }, []);

  const scrollRight = useCallback((distance: number = 200) => {
    const container = containerRef.current;
    if (container) {
      container.scrollBy({
        left: distance,
        behavior: 'smooth'
      });
    }
  }, []);

  return {
    containerRef,
    scrollState,
    stickyPositions,
    scrollLeft,
    scrollRight,
    updateScrollState,
  };
}

/**
 * Hook for managing sticky column behavior
 */
export function useStickyColumns(columnWidths: number[]) {
  const positions = React.useMemo(() => {
    let accumulator = 0;
    return columnWidths.map(width => {
      const position = accumulator;
      accumulator += width;
      return position;
    });
  }, [columnWidths]);

  const getStickyStyle = useCallback((index: number) => ({
    position: 'sticky' as const,
    left: positions[index],
    zIndex: 'var(--z-sticky)',
    background: 'hsl(var(--background))',
  }), [positions]);

  return {
    positions,
    getStickyStyle,
  };
}

/**
 * Hook for table keyboard navigation
 */
export function useTableKeyboardNav() {
  const tableRef = useRef<HTMLTableElement>(null);
  return { tableRef };
}