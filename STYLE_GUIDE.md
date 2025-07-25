# Code Style Guide

## Overview
This guide establishes consistent coding standards across our React/TypeScript codebase.

## Code Formatting

### Prettier Configuration
- **Indentation**: 2 spaces (no tabs)
- **Line width**: 100 characters
- **Quotes**: Double quotes for strings
- **Semicolons**: Always required
- **Trailing commas**: ES5 style

### Import Organization
Imports should be ordered as follows:
1. External libraries (React, third-party packages)
2. Internal utilities and hooks
3. Relative imports (components, types)

```typescript
// ✅ Good
import React from "react";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/hooks/useAuth";

import { UserProfile } from "./UserProfile";
import type { User } from "./types";

// ❌ Bad - mixed order
import { UserProfile } from "./UserProfile";
import React from "react";
import { useAuth } from "@/hooks/useAuth";
```

## Component Standards

### Function Components
Use arrow function exports for all components:

```typescript
// ✅ Good
interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
}

export const Button = ({ children, variant = "primary", onClick }: ButtonProps) => {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
};

// ❌ Bad - function declaration
export function Button({ children, variant = "primary", onClick }: ButtonProps) {
  // ...
}
```

### Props Interface Naming
- Always define props interfaces
- Use PascalCase with "Props" suffix
- Place interface directly above component

```typescript
// ✅ Good
interface UserCardProps {
  user: User;
  onEdit?: (id: string) => void;
  isSelected?: boolean;
}

export const UserCard = ({ user, onEdit, isSelected = false }: UserCardProps) => {
  // ...
};
```

### Component File Structure
```typescript
// 1. Imports (external → internal → relative)
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// 2. Types/Interfaces
interface ComponentProps {
  // ...
}

// 3. Component implementation
export const Component = ({ }: ComponentProps) => {
  // 4. State and hooks
  const [state, setState] = useState();
  
  // 5. Event handlers
  const handleClick = () => {
    // ...
  };
  
  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

## TypeScript Standards

### Type Definitions
- Use `interface` for object shapes
- Use `type` for unions, primitives, and complex types
- Avoid `any` - use `unknown` or proper typing

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

type Status = "pending" | "approved" | "rejected";

// ❌ Bad
type User = {
  id: any;
  name: any;
  email: any;
};
```

### Optional Chaining
Use optional chaining for potentially undefined values:

```typescript
// ✅ Good
const userName = user?.profile?.name ?? "Unknown";

// ❌ Bad
const userName = user && user.profile && user.profile.name || "Unknown";
```

## Styling Standards

### Tailwind Classes
- Use design system tokens from `index.css`
- Order classes: layout → spacing → colors → typography → effects
- Use `cn()` utility for conditional classes

```typescript
// ✅ Good
<Button 
  className={cn(
    "flex items-center gap-2 px-4 py-2",
    "bg-primary text-primary-foreground",
    "hover:bg-primary/90 transition-colors",
    isDisabled && "opacity-50 cursor-not-allowed"
  )}
>

// ❌ Bad
<Button className="bg-blue-500 text-white p-2 flex gap-2 hover:bg-blue-600">
```

### Component Variants
Use `class-variance-authority` for component variants:

```typescript
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);
```

## Naming Conventions

### Variables and Functions
- Use camelCase for variables and functions
- Use descriptive names with auxiliary verbs

```typescript
// ✅ Good
const isLoading = true;
const hasError = false;
const userData = {};
const handleSubmit = () => {};
const validateForm = () => {};

// ❌ Bad
const loading = true;
const error = false;
const data = {};
const submit = () => {};
const validate = () => {};
```

### Constants
- Use SCREAMING_SNAKE_CASE for module-level constants
- Use camelCase for local constants

```typescript
// ✅ Good
const API_ENDPOINTS = {
  USERS: "/api/users",
  POSTS: "/api/posts",
};

const Component = () => {
  const defaultOptions = { timeout: 5000 };
  // ...
};
```

## Error Handling

### Try-Catch Blocks
```typescript
// ✅ Good
const fetchUser = async (id: string) => {
  try {
    const response = await api.getUser(id);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("User fetch failed");
  }
};
```

### Error Boundaries
Use error boundaries for component-level error handling:

```typescript
export const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundaryComponent
      fallback={<ErrorFallback />}
      onError={(error) => console.error("Component error:", error)}
    >
      {children}
    </ErrorBoundaryComponent>
  );
};
```

## Documentation

### JSDoc Comments
Document complex functions and components:

```typescript
/**
 * Validates user input and returns formatted data
 * @param input - The raw user input
 * @param options - Validation options
 * @returns Formatted and validated data
 * @throws {ValidationError} When input is invalid
 */
export const validateUserInput = (
  input: string, 
  options: ValidationOptions
): ValidatedData => {
  // ...
};
```

## Performance Guidelines

### Memoization
Use React memoization appropriately:

```typescript
// ✅ Good - expensive computation
const expensiveValue = useMemo(() => {
  return processLargeDataset(data);
}, [data]);

// ✅ Good - preventing unnecessary re-renders
const handleClick = useCallback(() => {
  onItemClick(item.id);
}, [item.id, onItemClick]);

// ❌ Bad - unnecessary memoization
const simpleValue = useMemo(() => user.name, [user.name]);
```

## Best Practices

### Component Composition
Prefer composition over inheritance:

```typescript
// ✅ Good
export const Modal = ({ children, ...props }: ModalProps) => (
  <Dialog {...props}>
    <DialogContent>
      {children}
    </DialogContent>
  </Dialog>
);

// Usage
<Modal>
  <ModalHeader>Title</ModalHeader>
  <ModalBody>Content</ModalBody>
</Modal>
```

### Custom Hooks
Extract reusable logic into custom hooks:

```typescript
// ✅ Good
export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => setValue(prev => !prev), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  
  return { value, toggle, setTrue, setFalse };
};
```

## Enforcement

### Automated Tools
- **Prettier**: Automatic code formatting
- **ESLint**: Code quality and style enforcement
- **TypeScript**: Type checking and safety

### Development Workflow
1. Format code with Prettier before committing
2. Fix all ESLint warnings and errors
3. Ensure TypeScript compilation succeeds
4. Run tests before pushing changes

### Scripts
```bash
# Format all code
npm run format

# Check formatting
npm run format:check

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

This style guide should be followed by all contributors to maintain consistency and code quality across the project.