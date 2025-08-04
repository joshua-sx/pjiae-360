
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { sanitizeTextArea } from "@/lib/sanitization"

const textareaVariants = cva(
  "flex w-full rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "min-h-[60px] px-2 py-1 text-xs",
        default: "min-h-[80px] px-3 py-2 text-sm",
        lg: "min-h-[100px] px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  sanitize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size, sanitize = false, onChange, ...props }, ref) => {
    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (sanitize && onChange) {
        const sanitizedValue = sanitizeTextArea(e.target.value);
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: sanitizedValue }
        } as React.ChangeEvent<HTMLTextAreaElement>;
        onChange(syntheticEvent);
      } else if (onChange) {
        onChange(e);
      }
    }, [onChange, sanitize]);

    return (
      <textarea
        className={cn(textareaVariants({ size, className }))}
        onChange={handleChange}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
