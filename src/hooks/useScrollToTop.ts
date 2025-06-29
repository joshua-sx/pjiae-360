
import { useEffect } from 'react';

export const useScrollToTop = (trigger?: any) => {
  useEffect(() => {
    // Scroll to top with smooth behavior
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [trigger]);
};
