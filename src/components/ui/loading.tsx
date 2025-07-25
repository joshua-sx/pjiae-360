import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

const loadingVariants = cva(
  "flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "text-primary",
        secondary: "text-muted-foreground",
        destructive: "text-destructive",
        ghost: "text-foreground/60",
      },
      size: {
        default: "h-6 w-6",
        sm: "h-4 w-4",
        lg: "h-8 w-8",
        xl: "h-12 w-12",
      },
      layout: {
        inline: "inline-flex",
        block: "flex",
        fullscreen: "fixed inset-0 bg-background/80 backdrop-blur-sm z-50",
        overlay: "absolute inset-0 bg-background/50 backdrop-blur-sm",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      layout: "block",
    },
  }
)

const spinnerVariants = cva(
  "animate-spin",
  {
    variants: {
      size: {
        default: "h-6 w-6",
        sm: "h-4 w-4", 
        lg: "h-8 w-8",
        xl: "h-12 w-12",
      }
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface LoadingProps extends VariantProps<typeof loadingVariants> {
  className?: string
  text?: string
  showText?: boolean
  children?: React.ReactNode
}

export function Loading({
  className,
  variant,
  size,
  layout,
  text = "Loading...",
  showText = true,
  children,
  ...props
}: LoadingProps) {
  return (
    <div className={cn(loadingVariants({ variant, size, layout, className }))} {...props}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className={cn(spinnerVariants({ size }))} />
        {showText && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {children || text}
          </p>
        )}
      </div>
    </div>
  )
}

// Skeleton loading component for content placeholders
export interface SkeletonProps {
  className?: string
  children?: React.ReactNode
}

export function Skeleton({ className, children, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Loading skeleton for cards
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border bg-card p-6 space-y-4", className)}>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-6 w-1/2" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

// Loading skeleton for tables
export function TableSkeleton({ 
  rows = 5, 
  columns = 4,
  className 
}: { 
  rows?: number
  columns?: number
  className?: string 
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-6 w-full" />
          ))}
        </div>
      ))}
    </div>
  )
}

// Inline spinner for buttons
export function ButtonSpinner({ 
  size = "sm",
  className
}: {
  size?: "sm" | "default" | "lg"
  className?: string
}) {
  return <Loader2 className={cn(spinnerVariants({ size }), className)} />
}

// Page-level loading component
export function PageLoading({ 
  text = "Loading page...",
  className
}: {
  text?: string
  className?: string
}) {
  return (
    <Loading 
      layout="fullscreen" 
      size="lg" 
      text={text}
      className={className}
    />
  )
}

// Content area loading overlay
export function ContentLoading({ 
  text = "Loading content...",
  className
}: {
  text?: string
  className?: string
}) {
  return (
    <Loading 
      layout="overlay" 
      size="lg" 
      text={text}
      className={className}
    />
  )
}