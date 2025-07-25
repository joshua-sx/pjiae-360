import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    const scrollToTop = () => {
      // Try multiple strategies for reliable scrolling on route changes
      const targets = [
        document.querySelector('main'),
        document.querySelector('[role="main"]'),
        document.querySelector('.main-content'),
        document.documentElement,
        document.body
      ];

      let scrolled = false;
      
      for (const target of targets) {
        if (target && !scrolled) {
          try {
            if (target.scrollTo) {
              target.scrollTo({
                top: 0,
                left: 0,
                behavior: 'instant'
              });
              scrolled = true;
            }
          } catch (error) {
            // Continue to next fallback
          }
        }
      }
      
      // Final fallback
      if (!scrolled) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant'
        });
      }
    };

    // Small delay to ensure content is rendered
    const timeoutId = setTimeout(scrollToTop, 100);
    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  return null;
}