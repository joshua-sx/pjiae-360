# Design System Documentation

## Overview

This design system provides a comprehensive foundation for UI consistency across the application. It implements a token-based architecture with systematic motion, spacing, and interaction patterns.

## Architecture

### 🎨 Token Foundation (`tokens.css`)
- **Spacing**: Consistent spacing scale from `--space-1` to `--space-24`
- **Sizing**: Layout dimensions (`--size-header`, `--size-sidebar-*`)
- **Motion**: Duration and easing tokens for consistent animations
- **Z-Index**: Layered z-index system for predictable stacking
- **Radius & Shadows**: Standardized border radius and shadow patterns

### 🏗️ Layout System (`AppShell.tsx`)
- **AppShell**: Unified layout contract for all authenticated pages
- **Consistent Sidebar**: Token-based width management with persistent state
- **Responsive Design**: Mobile-first approach with adaptive patterns
- **useAppShell Hook**: Utilities for accessing layout state

### 📊 Table Enhancement (`hooks/useTableScroll.ts`)
- **useTableScroll**: Encapsulated scroll logic with smooth navigation
- **useStickyColumns**: Sticky column positioning with proper z-index
- **useTableKeyboardNav**: Accessible keyboard navigation for data tables

### 🧭 Navigation (`components/SecondaryNav.tsx`)
- **SecondaryNav**: Reusable navigation for subsections
- **Multiple Variants**: Tabs, sidebar, and pills styles
- **Route Integration**: Automatic active state detection
- **useSecondaryNavItems**: Helper for building navigation structures

### 🎯 Icon Registry (`icons/iconRegistry.ts`)
- **Centralized Icons**: Single source for all application icons
- **Consistent Sizing**: Token-based icon size system
- **Type Safety**: TypeScript types for valid icon names
- **Treeshaking**: Import only the icons you need

### 🔍 Consistency Auditing (`utils/consistencyAudit.ts`)
- **Color Token Coverage**: Measure semantic token adoption
- **Motion Consistency**: Audit transition duration patterns
- **Z-Index Analysis**: Track layering system compliance
- **Development Monitoring**: Real-time consistency feedback

## Usage Examples

### Basic Layout Structure
```tsx
import { AppShell } from '@/design';

function App() {
  return (
    <AppShell>
      <YourPageContent />
    </AppShell>
  );
}
```

### Enhanced Table with Scroll
```tsx
import { useTableScroll } from '@/design';

function DataTable() {
  const { containerRef, scrollLeft, scrollRight, scrollState } = useTableScroll({
    enableStickyColumns: true,
    stickyColumnWidths: [200, 150],
    enableKeyboardNav: true,
  });

  return (
    <div ref={containerRef} className="overflow-auto">
      <table>
        {/* Your table content */}
      </table>
    </div>
  );
}
```

### Secondary Navigation
```tsx
import { SecondaryNav } from '@/design';

const settingsNav = [
  { path: '/settings/profile', label: 'Profile', icon: 'User' },
  { path: '/settings/security', label: 'Security', icon: 'Shield' },
  { path: '/settings/billing', label: 'Billing', icon: 'CreditCard' },
];

function SettingsLayout() {
  return (
    <div>
      <SecondaryNav items={settingsNav} variant="tabs" />
      <Outlet />
    </div>
  );
}
```

### Using Design Tokens
```tsx
// In your CSS/Tailwind classes
className="transition-all duration-base ease-standard z-dropdown"

// Custom CSS
.my-component {
  transition: all var(--motion-duration-base) var(--motion-easing-standard);
  z-index: var(--z-dropdown);
  padding: var(--space-4);
  border-radius: var(--radius-md);
}
```

## Token Reference

### Motion Tokens
- `--motion-duration-fast`: 120ms (quick feedback)
- `--motion-duration-base`: 200ms (standard transitions)  
- `--motion-duration-slow`: 320ms (complex animations)
- `--motion-easing-standard`: Balanced cubic-bezier
- `--motion-easing-decelerate`: Ease-out feel
- `--motion-easing-accelerate`: Ease-in feel

### Z-Index Layers
- `--z-base`: 0 (default layer)
- `--z-raised`: 10 (slightly elevated)
- `--z-sticky`: 30 (sticky elements)
- `--z-fixed`: 40 (fixed positioning)
- `--z-overlay`: 50 (overlays/backdrops)
- `--z-dropdown`: 60 (dropdown menus)
- `--z-sheet`: 70 (side sheets/drawers)
- `--z-toast`: 80 (notifications)
- `--z-modal`: 90 (modal dialogs)
- `--z-tooltip`: 100 (tooltips on top)

### Sizing Tokens
- `--size-header`: 64px
- `--size-sidebar-expanded`: 240px
- `--size-sidebar-collapsed`: 70px
- `--size-row`: 48px (standard table row)
- `--size-bottom-nav`: 48px

## Consistency Guidelines

### ✅ Do
- Use semantic tokens for colors: `text-foreground`, `bg-background`
- Use motion tokens: `duration-base`, `ease-standard`
- Use z-index tokens: `z-dropdown`, `z-modal`
- Import icons from the registry: `Icons.Dashboard`
- Use AppShell for authenticated layouts
- Leverage table hooks for data surfaces

### ❌ Don't
- Use raw hex colors: `#3b82f6`
- Use arbitrary durations: `duration-[250ms]`
- Use magic z-index numbers: `z-[999]`
- Import icons directly from lucide-react
- Create custom layout containers
- Implement scroll logic from scratch

## Development Workflow

### Consistency Monitoring
```tsx
import { useConsistencyMonitor } from '@/design';

function App() {
  // Enables development-time consistency monitoring
  useConsistencyMonitor();
  
  return <YourApp />;
}
```

### Manual Auditing
```tsx
import { logConsistencyReport } from '@/design';

// Generate consistency report for debugging
logConsistencyReport(document.styleSheets[0].cssText);
```

## Migration Path

1. **Start with Tokens**: Replace raw values with semantic tokens
2. **Adopt AppShell**: Migrate layouts to use the unified shell
3. **Enhance Tables**: Replace custom scroll logic with hooks
4. **Centralize Icons**: Move to the icon registry
5. **Add Secondary Nav**: Standardize subsection navigation
6. **Monitor Consistency**: Enable development-time auditing

## Metrics for Success

- **Token Coverage**: >95% of colors use semantic tokens
- **Motion Consistency**: <5 distinct durations in codebase
- **Icon Centralization**: 100% of icons from registry
- **Layout Standardization**: All pages use AppShell
- **Z-Index Compliance**: No arbitrary z-index values

This design system scales from simple components to complex applications while maintaining visual and behavioral consistency.