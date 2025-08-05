
import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const radioItemVariants = cva(
  "aspect-square rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 tap-target",
  {
    variants: {
      size: {
        sm: "h-3 w-3 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0",
        default: "h-4 w-4 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0",
        lg: "h-5 w-5 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

export interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
    VariantProps<typeof radioItemVariants> {}

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, size, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(radioItemVariants({ size, className }))}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className={cn(
          size === "sm" ? "h-1.5 w-1.5" : 
          size === "lg" ? "h-3 w-3" : 
          "h-2.5 w-2.5",
          "fill-current text-current"
        )} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
