/**
 * Navigation utilities for consistent interactive behavior
 */

// Standard focus/hover state classes
export const FOCUS_RING_CLASSES = "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
export const FOCUS_SIMPLE_CLASSES = "focus-visible:ring-2 focus-visible:ring-ring"

// Transition classes for consistent animations
export const TRANSITION_COLORS = "transition-colors duration-200"
export const TRANSITION_ALL = "transition-all duration-200"
export const TRANSITION_TRANSFORM = "transition-transform duration-200"

// Hover state classes
export const HOVER_SCALE = "hover:scale-105"
export const HOVER_ACCENT = "hover:bg-accent hover:text-accent-foreground"
export const HOVER_MUTED = "hover:bg-muted hover:text-muted-foreground"

// Touch target classes for mobile accessibility
export const TOUCH_TARGET_MOBILE = "min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
export const TOUCH_FRIENDLY = "touch-manipulation"

// Combined classes for common patterns
export const INTERACTIVE_BASE = `${FOCUS_SIMPLE_CLASSES} ${TRANSITION_COLORS} ${TOUCH_FRIENDLY}`
export const INTERACTIVE_HOVER = `${INTERACTIVE_BASE} ${HOVER_ACCENT}`
export const INTERACTIVE_BUTTON = `${FOCUS_RING_CLASSES} ${TRANSITION_COLORS} ${TOUCH_FRIENDLY}`

// Size variant utilities
export const SIZE_VARIANTS = {
  sm: {
    height: "h-8",
    minHeight: "min-h-[32px]",
    padding: "px-2 py-1",
    text: "text-xs",
    touchTarget: "min-h-[32px]"
  },
  default: {
    height: "h-10", 
    minHeight: "min-h-[40px] sm:min-h-[32px]",
    padding: "px-2 py-1.5",
    text: "text-sm",
    touchTarget: "min-h-[40px] sm:min-h-[32px]"
  },
  lg: {
    height: "h-12",
    minHeight: "min-h-[48px] sm:min-h-[40px]", 
    padding: "px-3 py-2",
    text: "text-base",
    touchTarget: "min-h-[48px] sm:min-h-[40px]"
  }
} as const

// Icon size utilities
export const ICON_SIZES = {
  sm: "h-3 w-3",
  default: "h-4 w-4", 
  lg: "h-5 w-5"
} as const

// Z-index utilities from index.css
export const Z_INDEX = {
  dropdown: "z-dropdown",
  sticky: "z-sticky", 
  fixed: "z-fixed",
  modal: "z-modal",
  popover: "z-popover",
  tooltip: "z-tooltip",
  toast: "z-toast"
} as const

/**
 * Utility function to get consistent navigation item classes
 */
export function getNavigationItemClasses(
  size: keyof typeof SIZE_VARIANTS = "default",
  variant: "default" | "active" | "disabled" = "default"
) {
  const baseClasses = [
    "relative flex items-center gap-2 rounded-md outline-none",
    SIZE_VARIANTS[size].padding,
    SIZE_VARIANTS[size].text,
    SIZE_VARIANTS[size].touchTarget,
    INTERACTIVE_BASE
  ]

  switch (variant) {
    case "active":
      baseClasses.push("bg-accent text-accent-foreground font-medium")
      break
    case "disabled":
      baseClasses.push("opacity-50 pointer-events-none")
      break
    default:
      baseClasses.push(HOVER_ACCENT)
  }

  return baseClasses.join(" ")
}

/**
 * Utility function to get consistent dropdown content classes
 */
export function getDropdownContentClasses(size: keyof typeof SIZE_VARIANTS = "default") {
  return [
    Z_INDEX.dropdown,
    "min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", 
    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
    "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
    "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
    size === "sm" ? "p-1 text-xs" : size === "lg" ? "p-2 text-base" : "p-1 text-sm"
  ].join(" ")
}