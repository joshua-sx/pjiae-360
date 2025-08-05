import * as React from "react"
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"
import { Check, ChevronRight, Circle } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const ContextMenu = ContextMenuPrimitive.Root

const ContextMenuTrigger = ContextMenuPrimitive.Trigger

const ContextMenuGroup = ContextMenuPrimitive.Group

const ContextMenuPortal = ContextMenuPrimitive.Portal

const ContextMenuSub = ContextMenuPrimitive.Sub

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup

const contextMenuContentVariants = cva(
  "z-dropdown min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  {
    variants: {
      size: {
        sm: "p-1 text-xs",
        default: "p-1 text-sm", 
        lg: "p-2 text-base"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
)

const contextMenuItemVariants = cva(
  "relative flex cursor-default select-none items-center rounded-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring data-[disabled]:pointer-events-none data-[disabled]:opacity-50 touch-manipulation",
  {
    variants: {
      size: {
        sm: "px-2 py-1 text-xs min-h-[32px]",
        default: "px-2 py-1.5 text-sm min-h-[40px] sm:min-h-[32px]",
        lg: "px-3 py-2 text-base min-h-[48px] sm:min-h-[40px]"
      },
      inset: {
        true: "pl-8"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
)

const ContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & 
    VariantProps<typeof contextMenuItemVariants>
>(({ className, inset, size, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(contextMenuItemVariants({ size, inset, className }), "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground")}
    {...props}
  >
    {children}
    <ChevronRight className={cn(
      "ml-auto",
      size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
    )} />
  </ContextMenuPrimitive.SubTrigger>
))
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName

const ContextMenuSubContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent> & 
    VariantProps<typeof contextMenuContentVariants>
>(({ className, size, ...props }, ref) => (
  <ContextMenuPrimitive.SubContent
    ref={ref}
    className={cn(contextMenuContentVariants({ size, className }), "shadow-md")}
    {...props}
  />
))
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName
const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content> & 
    VariantProps<typeof contextMenuContentVariants>
>(({ className, size, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref={ref}
      className={cn(contextMenuContentVariants({ size, className }))}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
))
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName

const ContextMenuItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & 
    VariantProps<typeof contextMenuItemVariants>
>(({ className, inset, size, ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    className={cn(contextMenuItemVariants({ size, inset, className }))}
    {...props}
  />
))
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName

const contextMenuCheckboxItemVariants = cva(
  "relative flex cursor-default select-none items-center rounded-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring data-[disabled]:pointer-events-none data-[disabled]:opacity-50 touch-manipulation",
  {
    variants: {
      size: {
        sm: "py-1 pl-8 pr-2 text-xs min-h-[32px]",
        default: "py-1.5 pl-8 pr-2 text-sm min-h-[40px] sm:min-h-[32px]",
        lg: "py-2 pl-10 pr-3 text-base min-h-[48px] sm:min-h-[40px]"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
)

const ContextMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem> & 
    VariantProps<typeof contextMenuCheckboxItemVariants>
>(({ className, children, checked, size, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(contextMenuCheckboxItemVariants({ size, className }))}
    checked={checked}
    {...props}
  >
    <span className={cn(
      "absolute left-2 flex items-center justify-center",
      size === "sm" ? "h-3 w-3" : size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"
    )}>
      <ContextMenuPrimitive.ItemIndicator>
        <Check className={cn(
          size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
        )} />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
))
ContextMenuCheckboxItem.displayName =
  ContextMenuPrimitive.CheckboxItem.displayName

const ContextMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem> & 
    VariantProps<typeof contextMenuCheckboxItemVariants>
>(({ className, children, size, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
    ref={ref}
    className={cn(contextMenuCheckboxItemVariants({ size, className }))}
    {...props}
  >
    <span className={cn(
      "absolute left-2 flex items-center justify-center",
      size === "sm" ? "h-3 w-3" : size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"
    )}>
      <ContextMenuPrimitive.ItemIndicator>
        <Circle className={cn(
          "fill-current",
          size === "sm" ? "h-1.5 w-1.5" : size === "lg" ? "h-2.5 w-2.5" : "h-2 w-2"
        )} />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
))
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName

const contextMenuLabelVariants = cva(
  "font-semibold text-muted-foreground",
  {
    variants: {
      size: {
        sm: "px-2 py-1 text-xs",
        default: "px-2 py-1.5 text-sm",
        lg: "px-3 py-2 text-base"
      },
      inset: {
        true: "pl-8"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
)

const ContextMenuLabel = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & 
    VariantProps<typeof contextMenuLabelVariants>
>(({ className, inset, size, ...props }, ref) => (
  <ContextMenuPrimitive.Label
    ref={ref}
    className={cn(contextMenuLabelVariants({ size, inset, className }))}
    {...props}
  />
))
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName

const ContextMenuSeparator = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
))
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName

const ContextMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
ContextMenuShortcut.displayName = "ContextMenuShortcut"

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
