import { forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { ButtonSpinner } from '@/components/ui/loading';
import { cn } from '@/lib/utils';

export interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  showSpinner?: boolean;
}

/**
 * Button component with built-in loading state handling
 */
export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ 
    isLoading = false, 
    loadingText, 
    showSpinner = true,
    disabled, 
    children, 
    className,
    ...props 
  }, ref) => {
    const isDisabled = disabled || isLoading;
    
    return (
      <Button
        ref={ref}
        disabled={isDisabled}
        className={cn(className)}
        {...props}
      >
        {isLoading && showSpinner && (
          <ButtonSpinner className="mr-2" />
        )}
        {isLoading && loadingText ? loadingText : children}
      </Button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';