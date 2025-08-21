# Performance Management System - Claude Development Guide

## Project Overview
This is a React + TypeScript + Vite + Tailwind CSS + Supabase project for performance management and employee appraisals. The system includes goal management, performance reviews, appraisal cycles, and team management features.

## Key Technologies & Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI, Shadcn/ui
- **State Management**: Zustand, TanStack Query
- **Backend**: Supabase (Auth, Database, RLS)
- **Animations**: Framer Motion
- **Tables**: TanStack Table
- **Forms**: React Hook Form + Zod validation

## Essential Commands
```bash
# Development
npm run dev                 # Start development server
npm run build              # Build for production
npm run preview            # Preview production build
npm run typecheck          # Run TypeScript type checking
npm run lint               # Run ESLint
npm run lint:fix           # Fix ESLint issues

# Supabase (if using local development)
supabase start             # Start local Supabase
supabase stop              # Stop local Supabase
supabase status            # Check Supabase status
```

## Project Structure & Key Files
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Shadcn/ui base components
│   ├── onboarding/      # Onboarding wizard components
│   └── manager/         # Manager-specific components
├── features/            # Feature modules
│   ├── goal-management/ # Goals, assignments, tracking
│   ├── appraisals/      # Performance reviews, cycles
│   └── reports/         # Analytics and reporting
├── hooks/               # Custom React hooks
├── integrations/        # External service integrations
│   └── supabase/        # Supabase client and types
├── lib/                 # Utility functions
└── pages/               # Route components
```

## Critical Code Style Guidelines

### Design System Usage (CRITICAL)
- **NEVER use direct colors** like `text-white`, `bg-black`, `text-blue-500`
- **ALWAYS use semantic tokens** from `index.css` and `tailwind.config.ts`
- Use `hsl(var(--primary))`, `hsl(var(--secondary))`, etc.
- All colors MUST be in HSL format in the design system
- Customize Shadcn components with variants, don't override with Tailwind classes

### Component Patterns
- Use functional components with TypeScript interfaces
- Prefer named exports over default exports
- Use `const ComponentName = () => {}` format
- Keep components small and focused (< 150 lines)
- Extract complex logic into custom hooks

### State Management
- Use TanStack Query for server state
- Use Zustand for global client state
- Prefer local state (useState) for component-specific state
- Use React Hook Form for form state management

### File Naming Conventions
- Components: PascalCase (e.g., `GoalSettingWizard.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useGoals.ts`)
- Utils: camelCase (e.g., `formatDate.ts`)
- Types: PascalCase interfaces (e.g., `interface CycleData`)

## Database & Supabase Patterns

### Row Level Security (RLS)
- ALL tables MUST have RLS enabled
- Use `auth.uid()` for user-specific data access
- Organization-scoped data uses `organization_id` filtering
- Always validate RLS policies with the linter tool

### Common Supabase Patterns
```typescript
// Query with RLS
const { data, error } = await supabase
  .from('goals')
  .select('*')
  .eq('user_id', userId);

// Insert with organization context
const { data: orgId } = await supabase.rpc('get_current_user_org_id');
```

## Key Components & Features

### Onboarding System
- `SimplifiedAppraisalWizard.tsx`: Main appraisal setup wizard
- `OnboardingFlow.tsx`: Orchestrates milestone-based onboarding
- Located in `src/components/onboarding/`

### Goal Management
- `useGoals.ts`: Core goals data fetching hook
- `ManagerGoalsDashboard.tsx`: Goals overview with table
- Supports filtering, pagination, and bulk operations

### Tables & Data Display
- Use `useDataTable` hook for TanStack Table integration
- Implement search, filtering, and sorting consistently
- Always include loading states and error handling

## Testing Guidelines
- Write unit tests for utility functions
- Test custom hooks with React Testing Library
- Mock Supabase calls in tests
- Test form validation and error states

## Performance Considerations
- Use React.memo for expensive components
- Implement proper loading states
- Use TanStack Query caching effectively
- Lazy load heavy components
- Optimize images with proper alt text for SEO

## Common Pitfalls to Avoid
- Don't bypass RLS policies in database queries
- Don't use direct color values in components
- Don't create monolithic components (keep them focused)
- Don't forget error boundaries for production
- Don't skip TypeScript type checking before commits

## Error Handling Patterns
```typescript
// Use toast for user feedback
import { toast } from "sonner";

try {
  await operation();
  toast.success("Operation completed");
} catch (error) {
  console.error("Operation failed", error);
  toast.error("Operation failed");
}
```

## SEO & Accessibility
- Include semantic HTML structure
- Add proper ARIA labels and roles
- Use descriptive alt text for images
- Implement proper heading hierarchy (h1, h2, h3...)
- Ensure keyboard navigation works

## Security Notes
- Never expose API keys in frontend code
- Validate all user inputs with Zod schemas
- Use prepared statements for dynamic queries
- Implement proper CORS policies
- Regular security scans with the Supabase linter

## Development Workflow
1. **Plan first**: Understand requirements before coding
2. **Type safety**: Ensure TypeScript types are accurate
3. **Test early**: Write tests for complex logic
4. **Design system**: Use semantic tokens consistently
5. **Review**: Check RLS policies and accessibility
6. **Performance**: Optimize for production builds

## Useful Debugging Commands
```bash
# Check TypeScript issues
npm run typecheck

# Database debugging
# Use Supabase dashboard or linter tool

# Network debugging
# Check browser dev tools Network tab

# State debugging
# Use React DevTools and TanStack Query DevTools
```

## When Making Changes
- **UI Changes**: Use Visual Edits feature for simple styling changes
- **Component Logic**: Prefer search-replace over full rewrites
- **Database Changes**: Always use migration tool, never direct SQL
- **New Features**: Create focused components in appropriate feature folders
- **Refactoring**: Consider impact on existing functionality

Remember: This is a performance management system handling sensitive employee data. Always prioritize security, accessibility, and user experience in your implementations.