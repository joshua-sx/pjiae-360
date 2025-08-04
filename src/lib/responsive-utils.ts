/**
 * Responsive Design Utilities
 * Standardized helpers for consistent responsive behavior across the app
 */

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Touch Target Constants
 * Ensuring WCAG compliance with minimum 44px touch targets
 */
export const TOUCH_TARGETS = {
  minimum: 44, // WCAG minimum
  comfortable: 48, // Preferred size
  icon: 32, // Icon-only minimum on desktop
} as const;

/**
 * Responsive Typography Scale
 * Mobile-first typography that scales appropriately
 */
export const TYPOGRAPHY_SCALE = {
  xs: { mobile: '12px', desktop: '12px' },
  sm: { mobile: '14px', desktop: '14px' },
  base: { mobile: '14px', desktop: '16px' },
  lg: { mobile: '16px', desktop: '18px' },
  xl: { mobile: '18px', desktop: '20px' },
  '2xl': { mobile: '24px', desktop: '24px' },
  '3xl': { mobile: '30px', desktop: '30px' },
  '4xl': { mobile: '36px', desktop: '36px' },
} as const;

/**
 * Responsive Spacing Scale
 * Consistent spacing that adapts to screen size
 */
export const SPACING_SCALE = {
  xs: { mobile: '8px', desktop: '8px' },
  sm: { mobile: '12px', desktop: '12px' },
  md: { mobile: '16px', desktop: '16px' },
  lg: { mobile: '24px', desktop: '24px' },
  xl: { mobile: '32px', desktop: '32px' },
} as const;

/**
 * Generate responsive classes for touch targets
 */
export function getTouchTargetClasses(variant: 'default' | 'icon' | 'comfortable' = 'default') {
  const variants = {
    default: 'min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0',
    icon: 'min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px]',
    comfortable: 'min-h-[48px] min-w-[48px] sm:min-h-0 sm:min-w-0',
  };
  
  return `tap-target ${variants[variant]}`;
}

/**
 * Generate responsive typography classes
 */
export function getResponsiveTypographyClass(size: keyof typeof TYPOGRAPHY_SCALE) {
  const responsiveMap: Record<string, string> = {
    xs: 'text-responsive-xs',
    sm: 'text-responsive-sm',
    base: 'text-responsive-base',
    lg: 'text-responsive-lg',
    xl: 'text-responsive-xl',
  };
  
  return responsiveMap[size] || size;
}

/**
 * Generate responsive spacing classes
 */
export function getResponsiveSpacingClass(size: keyof typeof SPACING_SCALE, type: 'padding' | 'margin' | 'gap' = 'padding') {
  const responsiveMap: Record<string, string> = {
    xs: 'responsive-spacing-xs',
    sm: 'responsive-spacing-sm',
    md: 'responsive-spacing-md',
    lg: 'responsive-spacing-lg',
    xl: 'responsive-spacing-xl',
  };
  
  return responsiveMap[size] || size;
}

/**
 * Check if current viewport is mobile
 */
export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < BREAKPOINTS.sm;
}

/**
 * Check if current viewport is tablet
 */
export function isTabletViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.sm && window.innerWidth < BREAKPOINTS.lg;
}

/**
 * Check if current viewport is desktop
 */
export function isDesktopViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.lg;
}

/**
 * Get appropriate grid columns based on viewport
 */
export function getResponsiveGridCols(mobile = 1, tablet = 2, desktop = 3): number {
  if (isMobileViewport()) return mobile;
  if (isTabletViewport()) return tablet;
  return desktop;
}

/**
 * Responsive utility class generator
 */
export function generateResponsiveClasses(baseClass: string, variants?: {
  sm?: string;
  md?: string;
  lg?: string;
}) {
  let classes = baseClass;
  
  if (variants?.sm) classes += ` sm:${variants.sm}`;
  if (variants?.md) classes += ` md:${variants.md}`;
  if (variants?.lg) classes += ` lg:${variants.lg}`;
  
  return classes;
}

/**
 * Testing utility to validate touch targets
 */
export function validateTouchTargets() {
  if (typeof window === 'undefined') return [];
  
  const issues: Array<{ element: Element; issue: string }> = [];
  const interactiveElements = document.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])'
  );
  
  interactiveElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const minSize = isMobileViewport() ? TOUCH_TARGETS.minimum : TOUCH_TARGETS.icon;
    
    if (rect.width < minSize || rect.height < minSize) {
      issues.push({
        element,
        issue: `Touch target too small: ${Math.round(rect.width)}x${Math.round(rect.height)}px (minimum: ${minSize}px)`,
      });
    }
  });
  
  return issues;
}

/**
 * Testing utility to validate responsive breakpoints
 */
export function validateResponsiveBreakpoints() {
  if (typeof window === 'undefined') return [];
  
  const issues: string[] = [];
  const currentWidth = window.innerWidth;
  
  // Check for deprecated xs breakpoint usage
  const xsElements = document.querySelectorAll('[class*="xs:"]');
  if (xsElements.length > 0) {
    issues.push(`Found ${xsElements.length} elements using deprecated 'xs:' breakpoint. Use 'sm:' instead.`);
  }
  
  // Check for proper mobile-first approach
  const lgOnlyElements = document.querySelectorAll('[class*="lg:"][class*="hidden sm:block"]');
  if (lgOnlyElements.length > 0) {
    issues.push(`Found elements that might not follow mobile-first approach properly.`);
  }
  
  return issues;
}