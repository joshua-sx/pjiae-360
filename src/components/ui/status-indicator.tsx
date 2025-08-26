import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { CheckCircle, AlertCircle, XCircle, Info, Clock, Star } from "lucide-react";

const statusVariants = cva(
  "inline-flex items-center gap-1.5 text-sm font-medium",
  {
    variants: {
      variant: {
        success: "text-success",
        warning: "text-warning", 
        error: "text-error",
        info: "text-info",
        neutral: "text-muted-foreground",
        primary: "text-primary",
      },
      size: {
        sm: "text-xs",
        default: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "default",
    },
  }
);

const statusIcons: Record<string, LucideIcon> = {
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
  info: Info,
  neutral: Clock,
  primary: Star,
};

export interface StatusIndicatorProps 
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusVariants> {
  icon?: LucideIcon;
  showIcon?: boolean;
}

export function StatusIndicator({ 
  className, 
  variant, 
  size,
  icon: CustomIcon,
  showIcon = true,
  children, 
  ...props 
}: StatusIndicatorProps) {
  const Icon = CustomIcon || (variant ? statusIcons[variant] : statusIcons.neutral);
  
  return (
    <span 
      className={cn(statusVariants({ variant, size, className }))} 
      {...props}
    >
      {showIcon && Icon && <Icon className="h-4 w-4" />}
      {children}
    </span>
  );
}

// Pre-configured status components
export const SuccessStatus = ({ children, ...props }: Omit<StatusIndicatorProps, 'variant'>) => (
  <StatusIndicator variant="success" {...props}>{children}</StatusIndicator>
);

export const WarningStatus = ({ children, ...props }: Omit<StatusIndicatorProps, 'variant'>) => (
  <StatusIndicator variant="warning" {...props}>{children}</StatusIndicator>
);

export const ErrorStatus = ({ children, ...props }: Omit<StatusIndicatorProps, 'variant'>) => (
  <StatusIndicator variant="error" {...props}>{children}</StatusIndicator>
);

export const InfoStatus = ({ children, ...props }: Omit<StatusIndicatorProps, 'variant'>) => (
  <StatusIndicator variant="info" {...props}>{children}</StatusIndicator>
);