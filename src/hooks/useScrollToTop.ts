import { useLayoutEffect } from "react";
import { logger } from "@/lib/logger";

interface ScrollToTopOptions {
  behavior?: "smooth" | "instant";
  debug?: boolean;
}

export const useScrollToTop = (trigger?: any, options: ScrollToTopOptions = {}) => {
  const { behavior = "instant", debug = false } = options;

  useLayoutEffect(() => {
    if (trigger === undefined) return;

    const scrollToTop = () => {
      if (debug) {
        logger.debug("useScrollToTop: Starting scroll attempt");
      }

      // Define scroll targets with specific data attributes for better targeting
      const scrollTargets = [
        // Primary target: SidebarInset main content for dashboard layouts
        document.querySelector('[data-sidebar="inset"] main'),
        // Secondary: any main element
        document.querySelector("main"),
        // Tertiary: role-based main element
        document.querySelector('[role="main"]'),
        // Other potential targets
        document.querySelector(".main-content"),
        // Fallback targets
        document.documentElement,
        document.body,
      ];

      for (const target of scrollTargets) {
        if (target) {
          try {
            if (debug) {
              logger.debug("useScrollToTop: Scrolling target", {
                tag: (target as Element).tagName,
                className: (target as Element).className || "[no class]",
              });
            }

            if (target.scrollTo) {
              target.scrollTo({
                top: 0,
                left: 0,
                behavior: behavior,
              });

              if (debug) {
                logger.debug("useScrollToTop: Successfully scrolled to top");
              }
              return; // Exit after first successful scroll
            }
          } catch (error) {
            if (debug) {
              console.warn("⚠️ useScrollToTop: Error with target:", target, error);
            }
            // Continue to next fallback
          }
        }
      }

      // Final fallback to window scroll
      if (debug) {
        logger.debug("useScrollToTop: Using window fallback");
      }
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: behavior,
      });
    };

    // Execute immediately without delay for better UX
    scrollToTop();
  }, [trigger, behavior, debug]);
};
