import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { sanitizeInput } from "@/lib/sanitization"

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-8 px-2 py-1 text-xs",
        default: "h-10 px-3 py-2 text-base md:text-sm",
        lg: "h-12 px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface InputProps 
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  sanitize?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, sanitize = false, onChange, ...props }, ref) => {
    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      if (sanitize && onChange) {
        const sanitizedValue = sanitizeInput(e.target.value);
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: sanitizedValue }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      } else if (onChange) {
        onChange(e);
      }
    }, [onChange, sanitize]);

    return (
      <input
        type={type}
        className={cn(inputVariants({ size, className }))}
        onChange={handleChange}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
