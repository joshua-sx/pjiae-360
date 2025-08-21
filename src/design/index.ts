/**
 * Design System Exports
 * Central export point for all design system components and utilities
 */

// Layout Components
export { AppShell, useAppShell } from './AppShell';
export { SecondaryNav, useSecondaryNavItems } from './components/SecondaryNav';

// Hooks
export { 
  useTableScroll, 
  useStickyColumns, 
  useTableKeyboardNav 
} from './hooks/useTableScroll';

// Icons
export { Icons, IconSizes, getIconSize } from './icons/iconRegistry';
export type { IconName, IconSize } from './icons/iconRegistry';

// Utilities
export { 
  auditColorUsage, 
  auditMotionConsistency, 
  auditZIndexUsage,
  generateConsistencyReport,
  logConsistencyReport,
  useConsistencyMonitor
} from './utils/consistencyAudit';

// Re-export common utilities
export { cn } from '@/lib/utils';