
import { useEffect } from 'react';

interface ScrollToTopOptions {
  behavior?: 'smooth' | 'instant';
  delay?: number;
  debug?: boolean;
}

export const useScrollToTop = (trigger?: any, options: ScrollToTopOptions = {}) => {
  const { behavior = 'instant', delay = 150, debug = false } = options;
  
  useEffect(() => {
    if (trigger === undefined) return;
    
    const scrollToTop = () => {
      if (debug) {
        console.log('🔄 useScrollToTop: Starting scroll attempt');
      }

      // Define scroll targets with specific data attributes for better targeting
      const scrollTargets = [
        // Primary target: SidebarInset main content for dashboard layouts
        document.querySelector('[data-sidebar="inset"] main'),
        // Secondary: any main element
        document.querySelector('main'),
        // Tertiary: role-based main element
        document.querySelector('[role="main"]'),
        // Other potential targets
        document.querySelector('.main-content'),
        // Fallback targets
        document.documentElement,
        document.body
      ];

      let scrolled = false;
      let retryCount = 0;
      const maxRetries = 3;

      const attemptScroll = () => {
        for (const target of scrollTargets) {
          if (target && !scrolled) {
            try {
              const currentScrollTop = target.scrollTop || (target === document.documentElement ? window.pageYOffset : 0);
              
              if (debug) {
                console.log(`🎯 useScrollToTop: Trying target:`, target.tagName, target.className || '[no class]', `Current scroll: ${currentScrollTop}`);
              }

              if (target.scrollTo) {
                target.scrollTo({
                  top: 0,
                  left: 0,
                  behavior: behavior
                });
                
                // Validate scroll position after a brief delay
                requestAnimationFrame(() => {
                  const newScrollTop = target.scrollTop || (target === document.documentElement ? window.pageYOffset : 0);
                  if (newScrollTop === 0) {
                    scrolled = true;
                    if (debug) {
                      console.log('✅ useScrollToTop: Successfully scrolled to top');
                    }
                  } else if (retryCount < maxRetries) {
                    retryCount++;
                    if (debug) {
                      console.log(`🔄 useScrollToTop: Retry ${retryCount}/${maxRetries}, current scroll: ${newScrollTop}`);
                    }
                    setTimeout(attemptScroll, 50);
                  }
                });
                
                return; // Exit loop after successful scroll attempt
              }
            } catch (error) {
              if (debug) {
                console.warn('⚠️ useScrollToTop: Error with target:', target, error);
              }
              // Continue to next fallback
            }
          }
        }
        
        // Final fallback to window scroll
        if (!scrolled) {
          if (debug) {
            console.log('🔄 useScrollToTop: Using window fallback');
          }
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: behavior
          });
        }
      };

      attemptScroll();
    };
    
    const timeoutId = setTimeout(scrollToTop, delay);
    return () => clearTimeout(timeoutId);
  }, [trigger, behavior, delay, debug]);
};
