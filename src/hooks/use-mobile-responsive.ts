import { useState, useEffect } from 'react';

interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

const defaultBreakpoints: BreakpointConfig = {
  xs: 480,
  sm: 640,
  md: 768,  // Primary mobile breakpoint
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useMobileResponsive(breakpoints: Partial<BreakpointConfig> = {}) {
  const config = { ...defaultBreakpoints, ...breakpoints };
  
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width < config.md;  // Use md (768px) as primary breakpoint
  const isTablet = windowSize.width >= config.md && windowSize.width < config.lg;
  const isDesktop = windowSize.width >= config.lg;
  
  const breakpoint = (() => {
    if (windowSize.width < config.xs) return 'xs';
    if (windowSize.width < config.sm) return 'xs';
    if (windowSize.width < config.md) return 'sm';
    if (windowSize.width < config.lg) return 'md';
    if (windowSize.width < config.xl) return 'lg';
    if (windowSize.width < config['2xl']) return 'xl';
    return '2xl';
  })();

  const isBreakpoint = (bp: keyof BreakpointConfig) => {
    return windowSize.width >= config[bp];
  };

  const isBetweenBreakpoints = (min: keyof BreakpointConfig, max: keyof BreakpointConfig) => {
    return windowSize.width >= config[min] && windowSize.width < config[max];
  };

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    breakpoint,
    isBreakpoint,
    isBetweenBreakpoints,
    // Helper utilities
    showMobileOnly: isMobile,
    showTabletUp: isTablet || isDesktop,
    showDesktopOnly: isDesktop,
    // Grid columns helper with static classes
    getGridCols: (mobile = 1, tablet = 2, desktop = 3) => {
      if (isMobile) return mobile;
      if (isTablet) return tablet;
      return desktop;
    },
    // Utility helpers for consistent spacing and sizing
    getContainerPadding: () => isMobile ? "px-4" : "px-6 lg:px-8",
    getTablePageSize: () => isMobile ? 5 : isTablet ? 10 : 15,
  };
}

export function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      );
    };

    checkTouch();
    window.addEventListener('touchstart', checkTouch, { once: true });
    
    return () => {
      window.removeEventListener('touchstart', checkTouch);
    };
  }, []);

  return isTouchDevice;
}