import { useState, useEffect } from "react";

// Enhanced mobile responsive hook with more breakpoints
export function useMobileResponsive() {
  const [windowSize, setWindowSize] = useState<{
    width: number;
    height: number;
  }>({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial size

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    // Basic breakpoints
    isMobile: windowSize.width < 768,
    isTablet: windowSize.width >= 768 && windowSize.width < 1024,
    isDesktop: windowSize.width >= 1024,
    isLargeDesktop: windowSize.width >= 1440,
    
    // Specific sizes
    isSmallMobile: windowSize.width < 480,
    isLargeMobile: windowSize.width >= 480 && windowSize.width < 768,
    
    // Utility checks
    isTouchDevice: windowSize.width < 1024,
    isCompact: windowSize.width < 1200,
    
    // Size values
    width: windowSize.width,
    height: windowSize.height,
    
    // Responsive helpers
    getColumns: () => {
      if (windowSize.width < 768) return 1;
      if (windowSize.width < 1024) return 2;
      if (windowSize.width < 1440) return 3;
      return 4;
    },
    
    getTablePageSize: () => {
      if (windowSize.width < 768) return 5;
      if (windowSize.width < 1024) return 10;
      return 15;
    },
    
    getContainerPadding: () => {
      if (windowSize.width < 768) return "px-4";
      if (windowSize.width < 1024) return "px-6";
      return "px-8";
    }
  };
}