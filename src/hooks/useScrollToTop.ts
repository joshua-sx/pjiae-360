
import { useEffect } from 'react';

interface ScrollToTopOptions {
  behavior?: 'smooth' | 'instant';
  delay?: number;
}

export const useScrollToTop = (trigger?: any, options: ScrollToTopOptions = {}) => {
  const { behavior = 'instant', delay = 0 } = options;
  
  useEffect(() => {
    if (trigger === undefined) return;
    
    const scrollToTop = () => {
      // Try to scroll to main content area first, fallback to window top
      const mainElement = document.querySelector('main');
      if (mainElement) {
        mainElement.scrollTo({
          top: 0,
          left: 0,
          behavior: behavior
        });
      } else {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: behavior
        });
      }
    };
    
    if (delay > 0) {
      const timeoutId = setTimeout(scrollToTop, delay);
      return () => clearTimeout(timeoutId);
    } else {
      scrollToTop();
    }
  }, [trigger, behavior, delay]);
};
