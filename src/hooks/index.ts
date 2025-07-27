// Minimal hooks for Clerk-based app

// Re-export the essential Clerk hooks
export { useAuth } from "./useAuth";
export { useClerkOrganization } from "./useClerkOrganization";

// Simple mobile hook
export function useMobile() {
  return { isMobile: false, isTablet: false, isDesktop: true };
}