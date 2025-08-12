
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { sanitizeTextArea } from "@/lib/sanitization"

const textareaVariants = cva(
  "flex w-full rounded-md border bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "min-h-[60px] px-2 py-1 text-xs",
        default: "min-h-[80px] px-3 py-2 text-sm",
        lg: "min-h-[100px] px-4 py-3 text-base",
      },
      variant: {
        default: "border-input focus-visible:ring-ring",
        error: "border-destructive focus-visible:ring-destructive aria-invalid:border-destructive",
        success: "border-success focus-visible:ring-success",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  sanitize?: boolean;
  error?: boolean;
  success?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size, variant, sanitize = false, error, success, onChange, ...props }, ref) => {
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

    const computedVariant = error ? "error" : success ? "success" : variant;

    return (
      <textarea
        className={cn(textareaVariants({ size, variant: computedVariant, className }))}
        onChange={handleChange}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${props.id}-error` : success ? `${props.id}-success` : undefined}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
