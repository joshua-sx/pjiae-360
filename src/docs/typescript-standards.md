# TypeScript Standardization Guidelines

## Component Function Patterns

### ✅ PREFERRED: Explicit Function Declaration with Return Types

```typescript
// Standard component pattern
function ComponentName({
  prop1,
  prop2,
  prop3 = "defaultValue"
}: ComponentNameProps): JSX.Element {
  // component logic
  return (
    <div>
      {/* JSX content */}
    </div>
  );
}

export default ComponentName;
```

### ❌ AVOID: React.FC Usage

```typescript
// Don't use React.FC
export const ComponentName: React.FC<ComponentNameProps> = ({ 
  prop1, 
  prop2 
}) => {
  // component logic
};
```

## Interface Naming Conventions

### ✅ Component Props Interfaces

```typescript
// Use PascalCase with "Props" suffix
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick: () => void;
}

interface EmployeeTableProps {
  employees: Employee[];
  onEmployeeSelect: (employee: Employee) => void;
  loading?: boolean;
}
```

### ✅ Data Interfaces

```typescript
// Use PascalCase for data structures
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed';
  dueDate: Date | null;
}
```

## Return Type Annotations

### ✅ Explicit Return Types

```typescript
// Always specify return types for components
function LoadingSpinner({ size }: LoadingSpinnerProps): JSX.Element {
  return <div className={`spinner spinner-${size}`} />;
}

// For utility functions
function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

// For hooks
function useEmployees(): { employees: Employee[]; loading: boolean } {
  // hook logic
  return { employees, loading };
}
```

## Standard Component Patterns

### Base Component Props

```typescript
// Extend from standardized base props
import { BaseComponentProps } from '@/types/components';

interface CustomComponentProps extends BaseComponentProps {
  specificProp: string;
  onAction: () => void;
}
```

### Form Components

```typescript
import { FormComponentProps } from '@/types/components';

interface InputFieldProps extends FormComponentProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
```

### Modal/Dialog Components

```typescript
import { ModalProps } from '@/types/components';

interface ConfirmDialogProps extends ModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
}
```

## Import/Export Organization

### ✅ Consistent Import Order

```typescript
// 1. React and external libraries
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

// 2. Internal components and UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// 3. Types and interfaces
import type { Employee } from '@/types/shared';
import type { ComponentProps } from './types';

// 4. Utilities and hooks
import { cn } from '@/lib/utils';
import { useEmployees } from '@/hooks/useEmployees';

// 5. Relative imports
import './ComponentName.css';
```

### ✅ Export Patterns

```typescript
// Default export for main component
export default ComponentName;

// Named exports for utilities/types
export { ComponentName };
export type { ComponentNameProps };
```

## Type Safety Best Practices

### ✅ Strict Type Checking

```typescript
// Use strict null checks
function processEmployee(employee: Employee | null): string {
  if (!employee) {
    return 'No employee selected';
  }
  return `${employee.firstName} ${employee.lastName}`;
}

// Use proper union types
type Status = 'loading' | 'success' | 'error';

// Use proper generic constraints
function createList<T extends { id: string }>(items: T[]): T[] {
  return items.filter(item => item.id.length > 0);
}
```

### ✅ Event Handler Types

```typescript
// Use proper event handler types
interface ButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

// For custom callbacks
interface EmployeeFormProps {
  onEmployeeSave: (employee: Employee) => void;
  onEmployeeDelete: (employeeId: string) => void;
}
```

## Migration Guidelines

1. **Phase 1**: Convert React.FC to explicit function declarations
2. **Phase 2**: Add return type annotations to all functions
3. **Phase 3**: Standardize interface naming conventions
4. **Phase 4**: Organize imports consistently
5. **Phase 5**: Add strict type checking where missing

## Build Integration

These standards are enforced through:
- ESLint rules for consistent patterns
- TypeScript strict mode configuration
- Prettier formatting for consistent style
- Pre-commit hooks to prevent non-compliant code

## Examples in Codebase

See the following files for reference implementations:
- `src/components/goals/creation/GoalBasicsStep.tsx` - Standard component pattern
- `src/components/base/avatar/avatar-label-group.tsx` - Props interface pattern
- `src/types/components.ts` - Standardized base interfaces