import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const listVariants = cva("", {
  variants: {
    variant: {
      default: "",
      ordered: "",
    },
    spacing: {
      none: "space-y-0",
      sm: "space-y-1",
      default: "space-y-2",
      lg: "space-y-4",
    },
    size: {
      sm: "text-sm",
      default: "text-base",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    spacing: "default",
    size: "default",
  },
})

const listItemVariants = cva("", {
  variants: {
    spacing: {
      none: "py-0",
      sm: "py-1",
      default: "py-2",
      lg: "py-3",
    },
  },
  defaultVariants: {
    spacing: "default",
  },
})

export interface ListProps
  extends React.HTMLAttributes<HTMLUListElement | HTMLOListElement>,
    VariantProps<typeof listVariants> {
  ordered?: boolean;
}

export interface ListItemProps
  extends React.LiHTMLAttributes<HTMLLIElement>,
    VariantProps<typeof listItemVariants> {}

const List = React.forwardRef<
  HTMLUListElement | HTMLOListElement,
  ListProps
>(({ className, variant, spacing, size, ordered = false, ...props }, ref) => {
  const Component = ordered ? "ol" : "ul"
  return (
    <Component
      ref={ref as any}
      className={cn(
        listVariants({ 
          variant: ordered ? "ordered" : variant, 
          spacing, 
          size, 
          className 
        })
      )}
      {...props}
    />
  )
})
List.displayName = "List"

const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  ({ className, spacing, ...props }, ref) => (
    <li
      ref={ref}
      className={cn(listItemVariants({ spacing, className }))}
      {...props}
    />
  )
)
ListItem.displayName = "ListItem"

export { List, ListItem, listVariants, listItemVariants }