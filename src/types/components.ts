/**
 * Standardized component type definitions and patterns
 */

import { ReactNode } from 'react';

/**
 * Base props that all components should extend from
 */
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

/**
 * Props for components that can be disabled
 */
export interface DisableableProps {
  disabled?: boolean;
}

/**
 * Props for components with loading states
 */
export interface LoadingProps {
  loading?: boolean;
}

/**
 * Props for components with error states
 */
export interface ErrorProps {
  error?: string | null;
}

/**
 * Combined props for common component patterns
 */
export interface FormComponentProps extends BaseComponentProps, DisableableProps, LoadingProps, ErrorProps {}

/**
 * Props for data display components
 */
export interface DataComponentProps<T = any> extends BaseComponentProps, LoadingProps, ErrorProps {
  data?: T;
}

/**
 * Props for components with callbacks
 */
export interface CallbackProps<T = void> {
  onComplete?: (result: T) => void;
  onCancel?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Props for modal/dialog components
 */
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Standard naming convention for component props interfaces:
 * - Use PascalCase
 * - Suffix with "Props"
 * - Be specific about the component name
 * 
 * Example: ButtonProps, EmployeeTableProps, GoalCreationStepProps
 */

/**
 * Return type annotation patterns:
 * - Use explicit JSX.Element for components that always render JSX
 * - Use ReactNode for components that might return null or fragments
 * - Use specific types for utility functions
 */
export type ComponentReturnType = JSX.Element;
export type ConditionalComponentReturnType = ReactNode;

/**
 * Standard component function signature pattern:
 * 
 * function ComponentName(props: ComponentNameProps): JSX.Element {
 *   // component logic
 * }
 * 
 * export default ComponentName;
 * 
 * OR for named exports:
 * 
 * export function ComponentName(props: ComponentNameProps): JSX.Element {
 *   // component logic
 * }
 */