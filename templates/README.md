# Component Templates

## Usage

### Basic Component Template
Use `Component.template.tsx` as a starting point for new components.

### File Naming Conventions
- Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useAuth.ts`)
- Utilities: `camelCase.ts` (e.g., `validation.ts`)
- Types: `camelCase.ts` with descriptive names (e.g., `userTypes.ts`)

### Directory Structure
```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── forms/        # Form-specific components
│   └── layout/       # Layout components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── types/            # TypeScript type definitions
└── stores/           # State management
```

### Quick Start
1. Copy the template file
2. Rename to your component name
3. Update the interface and component names
4. Implement your component logic
5. Add proper types and props
6. Format with Prettier and fix ESLint issues