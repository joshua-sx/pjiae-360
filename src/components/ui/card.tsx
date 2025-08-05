import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      padding: {
        compact: "",
        default: "",
        spacious: "",
      },
    },
    defaultVariants: {
      padding: "default",
    },
  }
)

const cardContentVariants = cva("", {
  variants: {
    padding: {
      compact: "p-3 sm:p-4",
      default: "p-4 sm:p-6", 
      spacious: "p-6 sm:p-8",
    },
  },
  defaultVariants: {
    padding: "default",
  },
})

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ padding, className }))}
      {...props}
    />
  )
)
Card.displayName = "Card"

export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardContentVariants> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5", cardContentVariants({ padding, className }))}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardContentVariants> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, padding, ...props }, ref) => (
    <div ref={ref} className={cn(cardContentVariants({ padding, className }))} {...props} />
  )
)
CardContent.displayName = "CardContent"

export interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardContentVariants> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center pt-0", cardContentVariants({ padding, className }))}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
