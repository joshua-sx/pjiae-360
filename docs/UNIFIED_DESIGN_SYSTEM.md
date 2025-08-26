# Unified Design System Implementation

## Overview
This document outlines the unified design system implemented to ensure consistency across all UI components and pages.

## Key Components

### 1. Page System (`src/components/ui/page.tsx`)
Unified page layout system that replaces multiple container implementations:

```tsx
import { Page, PageContainer, PageContent, PageHeader } from "@/components/ui/page";

// Full page scaffold
<Page size="standard" spacing="md">
  <PageHeader title="Dashboard" description="Welcome back" />
  {/* content */}
</Page>

// Or use individually
<PageContainer size="wide">
  <PageContent spacing="lg">
    {/* content */}
  </PageContent>
</PageContainer>
```

**Sizes:**
- `narrow` (max-w-2xl) - Forms, simple content
- `standard` (max-w-4xl) - Most content  
- `wide` (max-w-6xl) - Dashboards, wide layouts
- `full` (max-w-none) - No constraints

**Spacing:**
- `sm` (space-y-4) - Tight spacing
- `md` (space-y-6) - Default spacing
- `lg` (space-y-8) - Loose spacing

### 2. Unified Dropdown System (`src/components/base/dropdown/unified-dropdown.tsx`)
Single dropdown implementation across the app:

```tsx
import { UnifiedDropdown, DropdownButton, ActionDropdown } from "@/components/base/dropdown/unified-dropdown";

// Basic dropdown
<UnifiedDropdown trigger={<Button>Options</Button>}>
  <DropdownMenuItem>Action 1</DropdownMenuItem>
  <DropdownMenuItem>Action 2</DropdownMenuItem>
</UnifiedDropdown>

// With button trigger
<UnifiedDropdown trigger={<DropdownButton>Select</DropdownButton>}>
  {/* items */}
</UnifiedDropdown>

// Action menu
<ActionDropdown>
  <DropdownMenuItem>Edit</DropdownMenuItem>
  <DropdownMenuItem>Delete</DropdownMenuItem>
</ActionDropdown>
```

### 3. Design Tokens (`src/design/tokens.css`)
Centralized design tokens for consistency:

```css
/* Spacing (4px base unit) */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-4: 1rem;     /* 16px */

/* Z-Index Scale */
--z-dropdown: 50;
--z-modal: 80;
--z-tooltip: 90;

/* Motion */
--motion-duration-fast: 150ms;
--motion-easing-standard: cubic-bezier(0.4, 0.0, 0.2, 1);
```

### 4. Typography System (`src/design/typography.css`)
Consistent typography scale:

```tsx
import { DisplayLg, HeadingMd, Body, Caption } from "@/components/ui/typography";

<DisplayLg>Main Title</DisplayLg>
<HeadingMd>Section Title</HeadingMd>
<Body>Regular text content</Body>
<Caption>Subtle text</Caption>
```

**Classes available:**
- `.text-display-lg/md/sm` - Large display text
- `.text-heading-lg/md/sm` - Section headings
- `.text-body-lg/base/sm` - Body text
- `.text-caption` - Small text
- `.text-label` - Form labels

### 5. Semantic Colors (`src/design/semantic-colors.css`)
Status and contextual colors:

```tsx
// Status variants
<Button variant="success">Success</Button>
<StatusIndicator variant="warning">Warning</StatusIndicator>

// CSS classes
.text-success { color: hsl(var(--color-success)); }
.bg-error { background: hsl(var(--color-error-bg)); }
.border-info { border-color: hsl(var(--color-info-border)); }
```

**Variants:**
- `success` - Green palette
- `warning` - Orange palette  
- `error` - Red palette
- `info` - Blue palette

## Migration Guidelines

### Replace Old Containers
```tsx
// OLD
import { Container } from "@/components/ui/Container";
import { PageContent } from "@/components/ui/page-content";

// NEW
import { PageContainer, PageContent } from "@/components/ui/page";
```

### Use Semantic Colors
```tsx
// OLD
className="text-green-600 bg-red-100"

// NEW  
className="text-success bg-error"
// or use components with variants
<StatusIndicator variant="success" />
```

### Use Design Tokens
```tsx
// OLD
className="z-[1000] duration-300"

// NEW
className="z-dropdown duration-base"
```

### Use Typography Classes
```tsx
// OLD
className="text-2xl font-semibold leading-tight"

// NEW
className="text-heading-lg"
// or use component
<HeadingLg>Title</HeadingLg>
```

## Benefits

1. **Consistency** - All pages use the same layout patterns
2. **Maintainability** - Single source of truth for styles
3. **Performance** - Reduced CSS bundle size
4. **Developer Experience** - Standardized APIs
5. **Accessibility** - Built-in focus states and contrast
6. **Responsive** - Mobile-first design tokens

## File Structure
```
src/
├── design/
│   ├── tokens.css          # Core design tokens
│   ├── typography.css      # Typography scale
│   └── semantic-colors.css # Status colors
├── components/
│   ├── ui/
│   │   ├── page.tsx       # Unified page system
│   │   └── typography.tsx # Typography components
│   └── base/
│       └── dropdown/
│           └── unified-dropdown.tsx # Dropdown system
```

## Next Steps

1. Audit remaining components for consistency
2. Add animation tokens to design system
3. Create component library documentation
4. Set up automated design token validation