import { ReactNode } from 'react';

/**
 * Base props for modal/dialog components
 */
export interface BaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: ReactNode;
  className?: string;
}

/**
 * Extended modal props with common patterns
 */
export interface ExtendedModalProps extends BaseModalProps {
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

/**
 * Form modal props for dialogs with forms
 */
export interface FormModalProps extends ExtendedModalProps {
  isLoading?: boolean;
  onSubmit?: () => void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  canSubmit?: boolean;
}

/**
 * Confirmation modal props
 */
export interface ConfirmationModalProps extends BaseModalProps {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

/**
 * Selection modal props for choosing from options
 */
export interface SelectionModalProps<T = any> extends ExtendedModalProps {
  items: T[];
  selectedItems?: T[];
  onSelect: (items: T[]) => void;
  multiple?: boolean;
  searchable?: boolean;
  itemRenderer?: (item: T) => ReactNode;
  keyExtractor?: (item: T) => string;
}