# Employees Feature Structure

## Overview
The Employees feature provides a responsive employee management interface with search, filtering, and role management capabilities.

## Core Files

### Page Entry
- `src/pages/admin/employees/EmployeesPage.tsx` - Main page component with stats, filters, and table

### Data Layer
- `src/hooks/useOptimizedEmployees.ts` - Main data hook with filtering and debouncing
- `src/hooks/useEmployeeCounts.ts` - Employee statistics
- `src/hooks/useDivisions.ts` - Division data
- `src/hooks/useDepartments.ts` - Department data
- `src/stores/index.ts` - Zustand store for filters state

### UI Components
- `src/components/admin/employees/EmployeeFilters.tsx` - Filter controls
- `src/components/admin/employees/EmployeeTableMemo.tsx` - Memoized table wrapper
- `src/components/admin/employees/employee-columns.tsx` - Table column definitions
- `src/components/ui/responsive-data-table.tsx` - Responsive table that switches to cards on mobile

### Mobile Support
- `src/components/ui/mobile-card-view.tsx` - Mobile card layout with EmployeeCard component
- `src/hooks/use-mobile-responsive.ts` - Breakpoint detection

## Responsive Design
The page uses consistent responsive clamps:
- Page wrapper: `w-full max-w-full min-w-0 overflow-x-clip`
- Table automatically switches to mobile cards on small screens
- All components use semantic design tokens from the design system

## State Management
- Employee filters stored in Zustand store
- Optimized data fetching with debouncing
- Memoized table for performance