import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { StatusIndicator } from "./status-indicator";
import { ReactNode } from "react";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        success: "bg-success-background border-success-border text-success-foreground",
        warning: "bg-warning-background border-warning-border text-warning-foreground", 
        error: "bg-error-background border-error-border text-error-foreground",
        info: "bg-info-background border-info-border text-info-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface AlertProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  icon?: boolean;
}

export function Alert({ 
  className, 
  variant, 
  title,
  icon = true,
  children, 
  ...props 
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <div className="flex items-start gap-3">
        {icon && variant && variant !== 'default' && (
          <StatusIndicator variant={variant as any} size="sm" className="mt-0.5">
            <span className="sr-only">{variant}</span>
          </StatusIndicator>
        )}
        <div className="flex-1 space-y-1">
          {title && (
            <h5 className="font-medium leading-none tracking-tight">
              {title}
            </h5>
          )}
          <div className="text-sm opacity-90">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Pre-configured Alert variants
export const SuccessAlert = ({ children, ...props }: Omit<AlertProps, 'variant'>) => (
  <Alert variant="success" {...props}>{children}</Alert>
);

export const WarningAlert = ({ children, ...props }: Omit<AlertProps, 'variant'>) => (
  <Alert variant="warning" {...props}>{children}</Alert>
);

export const ErrorAlert = ({ children, ...props }: Omit<AlertProps, 'variant'>) => (
  <Alert variant="error" {...props}>{children}</Alert>
);

export const InfoAlert = ({ children, ...props }: Omit<AlertProps, 'variant'>) => (
  <Alert variant="info" {...props}>{children}</Alert>
);

/**
 * Empty State Component
 */
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({ 
  title, 
  description, 
  action, 
  icon,
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}>
      {icon && (
        <div className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-heading-sm font-semibold mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-body-sm text-muted-foreground mb-4 max-w-sm">
          {description}
        </p>
      )}
      {action && action}
    </div>
  );
}