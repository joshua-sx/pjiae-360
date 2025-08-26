# Design System Documentation

This document outlines the design system implementation for consistent UI/UX across the application.

## 🎨 Color System

### Semantic Colors
Our color system uses semantic tokens that automatically adapt to light/dark themes:

```tsx
// ✅ CORRECT - Use semantic colors
<div className="text-success">Success message</div>
<div className="text-error">Error message</div>
<div className="text-info">Info message</div>
<div className="text-warning">Warning message</div>

// ❌ WRONG - Don't use hard-coded colors
<div className="text-green-600">Success message</div>
<div className="text-red-500">Error message</div>
```

### Status Colors
Available semantic colors:
- `success` - Green tones for positive states
- `warning` - Orange tones for cautionary states  
- `error` - Red tones for error states
- `info` - Blue tones for informational states
- `primary` - Brand colors for primary actions
- `neutral` - Gray tones for neutral states

## 📏 Typography Scale

### Type Classes
```tsx
// Display text (largest)
<h1 className="text-display-lg">Hero Title</h1>
<h1 className="text-display-md">Page Title</h1>
<h1 className="text-display-sm">Section Title</h1>

// Headings
<h2 className="text-heading-lg">Large Heading</h2>
<h3 className="text-heading-md">Medium Heading</h3>
<h4 className="text-heading-sm">Small Heading</h4>

// Body text
<p className="text-body-lg">Large body text</p>
<p className="text-body">Default body text</p>
<p className="text-body-sm">Small body text</p>

// Utility text
<p className="text-caption">Caption text</p>
<span className="text-label">Label text</span>
```

### Typography Components
```tsx
import { DisplaySm, HeadingMd, Body, Caption } from '@/components/ui/typography';

<DisplaySm>Page Title</DisplaySm>
<HeadingMd>Section Heading</HeadingMd>
<Body>Body content goes here</Body>
<Caption>Small caption text</Caption>
```

## 📐 Spacing System

### Spacing Components
```tsx
import { VStack, HStack, GridContainer, Section } from '@/components/ui/spacing';

// Vertical spacing
<VStack size="md">
  <div>Item 1</div>
  <div>Item 2</div>
</VStack>

// Horizontal spacing
<HStack size="sm">
  <button>Cancel</button>
  <button>Save</button>
</HStack>

// Grid with consistent gaps
<GridContainer size="lg" className="grid-cols-3">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</GridContainer>

// Section spacing
<Section size="xl">
  <h2>Section Title</h2>
  <p>Section content</p>
</Section>
```

### Spacing Sizes
- `xs` - Very tight spacing (4px)
- `sm` - Tight spacing (8px)  
- `md` - Default spacing (16px)
- `lg` - Loose spacing (24px)
- `xl` - Very loose spacing (32px)
- `2xl` - Extra loose spacing (48px)
- `3xl` - Maximum spacing (64px)

## 🎯 Status Indicators

### StatusIndicator Component
```tsx
import { StatusIndicator, SuccessStatus, ErrorStatus } from '@/components/ui/status-indicator';

// Generic status with icon
<StatusIndicator variant="success">
  Operation completed
</StatusIndicator>

// Pre-configured variants
<SuccessStatus>Successfully saved!</SuccessStatus>
<ErrorStatus>Something went wrong</ErrorStatus>
```

## 📱 Responsive Design

### Breakpoints
- `xs`: 480px
- `sm`: 640px  
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Mobile-First Approach
```tsx
// ✅ CORRECT - Mobile-first responsive design
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

<div className="p-4 md:p-6 lg:p-8">
  Responsive padding
</div>

// Grid responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>Card 1</Card>
  <Card>Card 2</Card>  
  <Card>Card 3</Card>
</div>
```

## 🎨 Component Patterns

### Cards
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card padding="default">
  <CardHeader padding="default">
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent padding="default">
    Card content goes here
  </CardContent>
</Card>
```

### Page Headers
```tsx
import { PageHeader } from '@/components/ui/page-header';

<PageHeader 
  title="Page Title"
  description="Page description"
  actions={
    <Button>Primary Action</Button>
  }
/>
```

### Feedback Components
```tsx
import { Alert, SuccessAlert, EmptyState } from '@/components/ui/feedback';

// Alerts
<SuccessAlert title="Success!">
  Your changes have been saved.
</SuccessAlert>

// Empty states
<EmptyState
  title="No data found"
  description="Try adjusting your filters"
  action={<Button variant="outline">Reset Filters</Button>}
  icon={<SearchIcon className="h-12 w-12" />}
/>
```

## ♿ Accessibility

### Focus States
All interactive elements have proper focus indicators:
```css
.focus-visible {
  outline: 2px solid hsl(var(--ring) / 0.5);
  outline-offset: 2px;
}
```

### Touch Targets
Minimum 44px touch targets for mobile:
```tsx
// Button automatically includes touch-friendly sizing
<Button size="sm">Small Button</Button> // 44px min on mobile

// Manual touch targets
<button className="tap-target">
  Touch-friendly button
</button>
```

### ARIA Labels
```tsx
// Status indicators include proper ARIA
<StatusIndicator variant="error" aria-label="Error status">
  Failed to save
</StatusIndicator>

// Loading buttons
<LoadingButton isLoading={true} aria-busy="true">
  Saving...
</LoadingButton>
```

## 🚫 Anti-Patterns

### Don't Use Hard-Coded Colors
```tsx
// ❌ WRONG
<div className="text-blue-600">Info text</div>
<div className="bg-green-500">Success background</div>

// ✅ CORRECT  
<div className="text-info">Info text</div>
<div className="bg-success">Success background</div>
```

### Don't Use Inconsistent Spacing
```tsx
// ❌ WRONG - Random spacing values
<div className="mb-3 mt-7 px-5">Content</div>

// ✅ CORRECT - Consistent spacing scale
<VStack size="md">
  <div>Content 1</div>
  <div>Content 2</div>
</VStack>
```

### Don't Skip Typography Hierarchy
```tsx
// ❌ WRONG - Custom font sizes
<h1 className="text-xl font-bold">Page Title</h1>

// ✅ CORRECT - Use semantic typography
<h1 className="text-display-sm">Page Title</h1>
```

## 🎯 Migration Guide

### Updating Hard-Coded Colors
1. Find instances: Search for `text-blue-`, `text-green-`, `bg-red-`, etc.
2. Replace with semantic colors based on context
3. Use the `mapLegacyColorToSemantic()` utility for automated conversion

### Updating Typography
1. Replace custom font classes with semantic typography classes
2. Use typography components for better consistency
3. Ensure proper heading hierarchy (H1 → H2 → H3)

### Updating Spacing
1. Replace inconsistent spacing with spacing components
2. Use the defined spacing scale (xs, sm, md, lg, xl, 2xl, 3xl)
3. Implement consistent vertical rhythm using `VStack`

This design system ensures consistency, accessibility, and maintainability across your entire application.